import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { ProcessResult } from '@/lib/quiz-excel-parser';
import { QuizSetWithFile } from '@/types';
import { ActivityIdProcessResult } from '@/lib/activityid-excel-parser';

type UserTabState = 's' | 'non-s';

export type QuizSet = {
  data: ProcessResult[];
  files: File[];
  quizSetWithFiles: QuizSetWithFile[];
};

export type ActivityId = {
  data: ActivityIdProcessResult[];
  files: File[];
};

export type NonS = {
  data: ProcessResult[];
  files: File[];
};

const initialState = {
  quizSet: {
    data: [] as ProcessResult[],
    files: [] as File[],
    quizSetWithFiles: [] as QuizSetWithFile[],
  } as QuizSet,
  activityId: {
    data: [] as ActivityIdProcessResult[],
    files: [] as File[],
  } as ActivityId,
  nonS: {
    data: [] as ProcessResult[],
    files: [] as File[],
  } as NonS,
  ui: {
    tabState: 's' as UserTabState,
    alert: {
      isOpen: false,
      message: '',
    },
  },
};

const useQuizSetState = create(
  combine(initialState, (set) => ({
    /* Quiz set actions ====================================*/
    setQuizSet: (newState: Partial<QuizSet>) =>
      set((state) => ({
        quizSet: {
          ...state.quizSet,
          ...newState,
        },
      })),
    clearQuizSet: () =>
      set((state) => ({
        quizSet: {
          ...state.quizSet,
          files: [],
          data: [],
        },
      })),
    /* Activity ID actions ====================================*/
    setActivityId: (newState: Partial<ActivityId>) =>
      set((state) => ({
        activityId: {
          ...state.activityId,
          ...newState,
        },
      })),
    clearActivityId: () =>
      set((state) => ({
        activityId: {
          ...state.activityId,
          files: [],
          data: [],
        },
      })),
    /* Non S actions ====================================*/
    setNonS: (newState: Partial<NonS>) =>
      set((state) => ({
        nonS: {
          ...state.nonS,
          ...newState,
        },
      })),
    clearNonS: () =>
      set((state) => ({
        nonS: {
          ...state.nonS,
          files: [],
          data: [],
        },
      })),
    /* UI actions ====================================*/
    setTabState: (tabState: UserTabState) =>
      set((state) => ({
        ui: {
          ...state.ui,
          tabState,
        },
      })),
    setAlert: (message: string) =>
      set((state) => ({
        ui: {
          ...state.ui,
          alert: {
            isOpen: true,
            message,
          },
        },
      })),
    closeAlert: () =>
      set((state) => ({
        ui: {
          ...state.ui,
          alert: {
            isOpen: false,
            message: '',
          },
        },
      })),
  }))
);

export default useQuizSetState;
