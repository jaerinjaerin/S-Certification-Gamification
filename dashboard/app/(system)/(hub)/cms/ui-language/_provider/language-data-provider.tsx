'use client';
import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from 'react';

// 초기 상태
const initialState: LanguageDataProps = {
  languages: null,
};

// 액션 타입 정의
type Action =
  | { type: 'SET_LANGUAGE_LIST'; payload: LanguageProps[] }
  | { type: 'RESET' };

// 리듀서 함수
function languageDataReducer(
  state: LanguageDataProps,
  action: Action
): LanguageDataProps {
  switch (action.type) {
    case 'SET_LANGUAGE_LIST':
      return { ...state, languages: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface LanguageDataContextProps {
  state: LanguageDataProps;
  dispatch: Dispatch<Action>;
}

// Context 생성
const LanguageDataContext = createContext<LanguageDataContextProps | undefined>(
  undefined
);

// Provider 컴포넌트 생성
export const LanguageDataProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [state, dispatch] = useReducer(languageDataReducer, initialState);

  return (
    <LanguageDataContext.Provider value={{ state, dispatch }}>
      {children}
    </LanguageDataContext.Provider>
  );
};

// 커스텀 훅 생성 (Context를 편리하게 사용)
export function useLanguageData() {
  const context = useContext(LanguageDataContext);
  if (!context) {
    throw new Error(
      'useLanguageData must be used within a LanguageDataProvider'
    );
  }
  return context;
}
