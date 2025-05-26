export type LoginStep = "email" | "code" | "selection" | "init";

export type LoginState = {
  email: string;
  code: string;
  step: LoginStep;
  loading: boolean;
  error: string | null;
  expiresAt: Date | null;
  successSendEmail: string | null;
  countStart: number;
};

export type LoginAction =
  | { type: "SET_EMAIL"; payload: string }
  | { type: "SET_CODE"; payload: string }
  | { type: "SET_STEP"; payload: LoginStep }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_EXPIRES_AT"; payload: Date | null }
  | { type: "SET_SUCCESS_SEND_EMAIL"; payload: string | null }
  | { type: "SET_COUNT_START"; payload: number }
  | { type: "RESET_STATE" };
