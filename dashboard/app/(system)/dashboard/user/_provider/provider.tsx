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
function userReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FIELD_VALUES":
      return { ...state, fieldValues: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

// Context 타입 정의
interface UserContextProps {
  state: State;
  dispatch: Dispatch<Action>;
}

// Context 생성
const UserContext = createContext<UserContextProps | undefined>(undefined);

// Context Provider 정의
interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook 생성
export function useUserContext(): UserContextProps {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within an UserProvider");
  }
  return context;
}
