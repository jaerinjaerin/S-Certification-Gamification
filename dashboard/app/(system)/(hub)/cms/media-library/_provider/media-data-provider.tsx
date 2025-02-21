'use client';
import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from 'react';

// 초기 상태
const initialState: MediaDataProps = {
  badge: [],
  character: [],
  background: [],
};

// 액션 타입 정의
type Action =
  | { type: 'SET_BADGE'; payload: MediaPros[] }
  | { type: 'SET_CHARACTER'; payload: MediaPros[] }
  | { type: 'SET_BACKGROUND'; payload: MediaPros[] }
  | { type: 'RESET' };

// 리듀서 함수
function mediaDataReducer(
  state: MediaDataProps,
  action: Action
): MediaDataProps {
  switch (action.type) {
    case 'SET_BADGE':
      return { ...state, badge: action.payload };
    case 'SET_CHARACTER':
      return { ...state, character: action.payload };
    case 'SET_BACKGROUND':
      return { ...state, background: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface MediaDataContextProps {
  state: MediaDataProps;
  dispatch: Dispatch<Action>;
}

// Context 생성
const MediaDataContext = createContext<MediaDataContextProps | undefined>(
  undefined
);

// Provider 컴포넌트 생성
export const MediaDataProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [state, dispatch] = useReducer(mediaDataReducer, initialState);

  return (
    <MediaDataContext.Provider value={{ state, dispatch }}>
      {children}
    </MediaDataContext.Provider>
  );
};

// 커스텀 훅 생성 (Context를 편리하게 사용)
export function useMediaData() {
  const context = useContext(MediaDataContext);
  if (!context) {
    throw new Error('useMediaData must be used within a MediaDataProvider');
  }
  return context;
}
