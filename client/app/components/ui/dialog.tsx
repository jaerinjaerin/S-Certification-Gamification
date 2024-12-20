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
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { CloseIcon } from "../icons/icons";
import { useBodyScrollLock } from "@/app/hooks/useBodyScrollLock";

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
  const { open, setOpen } = useDialogContext();

  useBodyScrollLock();

  useEffect(() => {
    // body 자식 요소에 aria-hidden 설정
    const bodyChildren = Array.from(document.body.children);

    const dialogElements = Array.from(document.querySelectorAll('[role="dialog"]'));

    bodyChildren.forEach((child) => {
      if (!dialogElements.some((dialog) => dialog.contains(child))) {
        child.setAttribute("inert", open ? "true" : "false");
      }
    });

    return () => {
      bodyChildren.forEach((child) => child.removeAttribute("inert"));
    };
  }, [open]);

  return (
    <div
      className="fixed z-[900] inset-0 flex items-center justify-center bg-black/50"
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
        className={cn(
          "bg-white p-5 min-w-[250px] sm:w-[340px] fixed z-[1000] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[20px]",
          className
        )}
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
  <h2 className={cn("font-extrabold text-center text-[26px] mt-[32px] mb-[26px]", className)}>{children}</h2>
);

// DialogDescription 컴포넌트
export const DialogDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("text-base text-[#4F4F4F] mb-5", className)}>{children}</div>
);

export const DialogClose = forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<"button">>(({ children, ...props }, ref) => {
  const { setOpen } = useDialogContext();

  return (
    <Button variant={"primary"} {...props} ref={ref} onClick={() => setOpen(false)}>
      {children}
    </Button>
  );
});
DialogClose.displayName = "DialogClose";

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
