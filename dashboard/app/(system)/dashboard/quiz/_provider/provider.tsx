"use client";
import React, {
  createContext,
  useReducer,
  useContext,
  ReactNode,
  Dispatch,
} from "react";
import { FieldValues } from "react-hook-form";

interface State {
  fieldValues: FieldValues | null;
}

// 액션 타입 정의
type Action = { type: "SET_FIELD_VALUES"; payload: FieldValues | null };

// 초기 상태 정의
const initialState: State = {
  fieldValues: null,
};

// 리듀서 정의
function quizReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FIELD_VALUES":
      return { ...state, fieldValues: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

// Context 타입 정의
interface QuizContextProps {
  state: State;
  dispatch: Dispatch<Action>;
}

// Context 생성
const QuizContext = createContext<QuizContextProps | undefined>(undefined);

// Context Provider 정의
interface QuizProviderProps {
  children: ReactNode;
}

export const QuizProvider: React.FC<QuizProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      {children}
    </QuizContext.Provider>
  );
};

// Custom hook 생성
export function useQuizContext(): QuizContextProps {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuizContext must be used within an QuizProvider");
  }
  return context;
}
