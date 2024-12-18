import { Children, cloneElement, createContext, forwardRef, useContext, useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "../icons/icons";
import { cn } from "@/lib/utils";

interface SelectContextType {
  isOpen: boolean;
  selected: string | null;
  setSelected: (value: string | null) => void;
  toggleOpen: () => void;
  close: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  // contentRef: React.RefObject<HTMLDivElement>;
}

type SelectType = {
  children: React.ReactNode;
  className?: string;
};

const SelectContext = createContext<SelectContextType | undefined>(undefined);

const useSelectContext = () => {
  const context = useContext(SelectContext);

  if (!context) {
    throw new Error("useSelectContext는 SelectProvider 안에서만 사용할 수 있습니다.");
  }

  return context;
};

export const Select = ({ children }: SelectType) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const toggleOpen = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  const triggerRef = useRef<HTMLButtonElement | null>(null); // Trigger 참조

  return (
    <SelectContext.Provider value={{ isOpen, selected, setSelected, toggleOpen, close, triggerRef }}>
      <div className="relative w-full">{children}</div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = ({ children, className, disabled = false, value }: SelectType & { disabled?: boolean; value: any }) => {
  const { toggleOpen, isOpen, triggerRef, setSelected } = useSelectContext();
  useEffect(() => {
    if (disabled || value === null) {
      setSelected(null);
    }
  }, [disabled, value]);

  return (
    <button
      disabled={disabled}
      onClick={toggleOpen}
      className={cn(
        "w-full flex justify-between items-center rounded-[10px] px-5 py-2.5 bg-[#E5E5E5] disabled:bg-disabled focus-visible:ring-black focus-visible:ring-2 focus-visible:outline-none",
        className
      )}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      ref={triggerRef}
    >
      {children}
      <ChevronDownIcon className="shrink-0" />
    </button>
  );
};
SelectTrigger.displayName = "SelectTrigger";

export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { selected } = useSelectContext();

  return <span className="overflow-hidden whitespace-pre line-clamp-1">{selected || placeholder}</span>;
};

export const SelectContent = ({ children, className }: SelectType) => {
  const { isOpen, close, triggerRef } = useSelectContext();
  console.log(isOpen);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const itemsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (!triggerRef.current) return;
      if (contentRef.current && contentRef.current.contains(target)) return;
      if (triggerRef.current && !triggerRef.current.contains(target)) {
        close();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [triggerRef]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown": {
          event.preventDefault();
          setFocusedIndex((prev) => (prev < itemsRef.current.length - 1 ? prev + 1 : 0));
          break;
        }
        case "ArrowUp": {
          event.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : itemsRef.current.length - 1));
          break;
        }
        case "Enter": {
          event.preventDefault();
          if (focusedIndex >= 0 && itemsRef.current[focusedIndex]) {
            itemsRef.current[focusedIndex].click(); // 현재 포커스된 항목 클릭
          }
          break;
        }
        case "Escape": {
          event.preventDefault();
          close();
          break;
        }
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focusedIndex, isOpen]);

  useEffect(() => {
    if (focusedIndex >= 0 && itemsRef.current[focusedIndex]) {
      itemsRef.current[focusedIndex].scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex]);

  if (!isOpen) return;

  return (
    <div ref={contentRef} role="listbox" aria-labelledby="select-trigger" className={cn("w-full mt-[2px] rounded-[10px] py-1 px-4 ", className)}>
      {/* {children} */}
      {Children.map(children, (child, index) =>
        cloneElement(child as React.ReactElement<any>, {
          ref: (el: HTMLDivElement) => (itemsRef.current[index] = el),
          isFocused: focusedIndex === index, // 현재 포커스 여부 전달
        })
      )}
    </div>
  );
};

export const SelectItem = forwardRef<
  HTMLDivElement,
  SelectType & {
    dataValue: string;
    value: string;
    onChange?: (e: React.MouseEvent<HTMLDivElement>) => void;
    isFocused?: boolean;
  }
>(({ children, className, value, dataValue, onChange, isFocused }, ref) => {
  const { close, setSelected } = useSelectContext();

  return (
    <div
      ref={ref}
      role="option"
      data-value={dataValue}
      aria-selected={isFocused}
      className={cn(
        "cursor-pointer px-1  hover:bg-blue-600 hover:text-white",
        isFocused ? "bg-blue-600 text-white" : "", // 포커스 스타일 적용
        className
      )}
      onClick={(e) => {
        if (onChange) {
          onChange(e);
        }
        setSelected(value);
        close();
      }}
    >
      {children}
    </div>
  );
});
SelectItem.displayName = "SelectItem";
