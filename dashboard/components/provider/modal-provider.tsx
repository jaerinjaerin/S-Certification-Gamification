'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

type ModalContextType = {
  setContent: (content: ReactNode | null) => void;
};

const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<ReactNode | null>(null);

  const closeModal = () => setContent(null);

  return (
    <ModalContext.Provider value={{ setContent }}>
      <div>
        {content && (
          <div
            className="fixed z-50 inset-0 h-full flex items-center justify-center bg-zinc-950/70"
            onClick={closeModal} // 배경 클릭 시 닫기
          >
            <div
              className="relative bg-white p-6 rounded-md shadow-lg w-5/6"
              onClick={(e) => e.stopPropagation()} // 모달 콘텐츠 클릭 시 이벤트 전파 중단
            >
              {content}
            </div>
          </div>
        )}
        {children}
      </div>
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
