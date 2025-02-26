import { create } from 'zustand';
import { combine } from 'zustand/middleware';

const initialState = {
  ui: {
    alert: {
      isOpen: false,
      message: '',
    },
  },
};

const useCampaignState = create(
  combine(initialState, (set) => ({
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

export default useCampaignState;
