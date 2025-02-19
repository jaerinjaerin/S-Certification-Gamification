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
function overviewReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FIELD_VALUES":
      return { ...state, fieldValues: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

// Context 타입 정의
interface OverviewContextProps {
  state: State;
  dispatch: Dispatch<Action>;
}

// Context 생성
const OverviewContext = createContext<OverviewContextProps | undefined>(
  undefined
);

// Context Provider 정의
interface OverviewProviderProps {
  children: ReactNode;
}

export const OverviewProvider: React.FC<OverviewProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(overviewReducer, initialState);

  return (
    <OverviewContext.Provider value={{ state, dispatch }}>
      {children}
    </OverviewContext.Provider>
  );
};

// Custom hook 생성
export function useOverviewContext(): OverviewContextProps {
  const context = useContext(OverviewContext);
  if (!context) {
    throw new Error(
      "useOverviewContext must be used within an OverviewProvider"
    );
  }
  return context;
}
