import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface WorkspaceState {
  selectedBusinessId: string | null;
  setSelectedBusinessId: (id: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      selectedBusinessId: null,
      setSelectedBusinessId: (selectedBusinessId) => set({ selectedBusinessId }),
    }),
    {
      name: "pos-saas-workspace",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ selectedBusinessId: state.selectedBusinessId }),
    },
  ),
);
