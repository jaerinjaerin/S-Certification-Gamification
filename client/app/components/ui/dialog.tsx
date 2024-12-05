import {
  cloneElement,
  createContext,
  Dispatch,
  forwardRef,
  isValidElement,
  ReactElement,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/app/lib/utils";
import { Button } from "./button";
import { CloseIcon } from "../icons/icons";

interface DialogContextType {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const DialogContext = createContext<DialogContextType>({
  open: false,
  setOpen: () => {},
});

const useDialogContext = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialogContext는 DialogProivder 안에서만 사용할 수 있습니다.");
  }
  return context;
};

// Dialog Root Component
export const Dialog = ({ children, defaultOpen = false }: { children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);
  return <DialogContext.Provider value={{ open, setOpen }}>{children}</DialogContext.Provider>;
};

// Dialog Overlay Component
// dismissOnOverlayClick: overlayout 영역을 클릭했을 때 모달 open, close 여부
const DialogOverlay = ({ dismissOnOverlayClick = false }: { dismissOnOverlayClick?: boolean }) => {
  const { setOpen } = useDialogContext();

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center"
      onClick={() => (dismissOnOverlayClick ? setOpen(false) : setOpen(true))}
    />
  );
};

// Dialog Trigger Component
export const DialogTrigger = forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }>(
  ({ children, asChild = false, ...props }, ref) => {
    const { setOpen } = useDialogContext();

    if (asChild && isValidElement(children)) {
      return cloneElement(children as ReactElement, {
        ...props, // 부모로부터 전달된 props 병합
        onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
          setOpen(true); // 다이얼로그 열기
          if (typeof children.props.onClick === "function") {
            children.props.onClick(event); // 자식 요소의 onClick 호출
          }
        },
        ref, // ref 전달
      });
    }

    // 기본 버튼 렌더링
    return (
      <button {...props} ref={ref} onClick={() => setOpen(true)}>
        {children}
      </button>
    );
  }
);
DialogTrigger.displayName = "DialogTrigger";

// Dialog Content Component
export const DialogContent = ({
  children,
  dismissOnOverlayClick,
  className,
}: {
  children: React.ReactNode;
  dismissOnOverlayClick?: boolean;
  className?: string;
}) => {
  const { open } = useDialogContext();

  if (!open) return null;

  return createPortal(
    <div role="dialog" aria-modal="true" className="relative">
      <DialogOverlay dismissOnOverlayClick={dismissOnOverlayClick} />
      <div
        className={cn("bg-white p-5 min-w-[250px] sm:w-[340px] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[20px]", className)}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

// DialogHeader 컴포넌트
export const DialogHeader = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

// DialogTitle 컴포넌트
export const DialogTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h2 className={cn("font-bold text-center text-[26px] mt-[32px] mb-[26px]", className)}>{children}</h2>
);

// DialogDescription 컴포넌트
export const DialogDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("text-base text-[#4F4F4F] mb-5", className)}>{children}</div>
);

// DialogFooter 컴포넌트
export const DialogFooter = ({
  children,
  className,
  close = true,
  cancelAction,
}: {
  children: React.ReactNode;
  className?: string;
  close?: boolean;
  cancelAction?: () => void;
}) => {
  const { setOpen } = useDialogContext();
  return (
    <div className={cn("mt-[26px] flex justify-center", className)}>
      {children}
      <div className="absolute top-5 right-5">
        {close && (
          <Button
            size="icon"
            onClick={() => {
              if (cancelAction) {
                cancelAction();
              }
              setOpen(false);
            }}
          >
            <CloseIcon />
          </Button>
        )}
      </div>
    </div>
  );
};
