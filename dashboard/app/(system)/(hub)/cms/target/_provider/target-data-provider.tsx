'use client';
import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from 'react';

// 초기 상태
const initialState: TargetDataProps = {
  targets: null,
};

// 액션 타입 정의
type Action =
  | { type: 'SET_TARGET_LIST'; payload: TargetProps[] }
  | { type: 'RESET' };

// 리듀서 함수
function targetDataReducer(
  state: TargetDataProps,
  action: Action
): TargetDataProps {
  switch (action.type) {
    case 'SET_TARGET_LIST':
      return { ...state, targets: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface TargetDataContextProps {
  state: TargetDataProps;
  dispatch: Dispatch<Action>;
}

// Context 생성
const TargetDataContext = createContext<TargetDataContextProps | undefined>(
  undefined
);

// Provider 컴포넌트 생성
export const TargetDataProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [state, dispatch] = useReducer(targetDataReducer, initialState);

  return (
    <TargetDataContext.Provider value={{ state, dispatch }}>
      {children}
    </TargetDataContext.Provider>
  );
};

// 커스텀 훅 생성 (Context를 편리하게 사용)
export function useTargetData() {
  const context = useContext(TargetDataContext);
  if (!context) {
    throw new Error('useTargetData must be used within a TargetDataProvider');
  }
  return context;
}
