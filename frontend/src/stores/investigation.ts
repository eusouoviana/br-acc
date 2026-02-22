import { create } from "zustand";

interface InvestigationState {
  activeInvestigationId: string | null;
  setActiveInvestigation: (id: string | null) => void;
}

export const useInvestigationStore = create<InvestigationState>((set) => ({
  activeInvestigationId: null,
  setActiveInvestigation: (id) => set({ activeInvestigationId: id }),
}));
