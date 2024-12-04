import isDeepEqual from "fast-deep-equal"
import { temporal } from "zundo"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import debounce from "../../utils/debounce"

import { AppStore } from "./api"

const NO_PERSIST = new Set(["appActions", "reactFlowActions"])

// If app becomes too slow, might need to switch to async persistent storage.
export const useAppStore = create<AppStore>()(
  persist(
    temporal(
      (_) => ({
        nodes: [],
        edges: [],
        eipNodeConfigs: {},
        selectedChildNode: null,
        layout: {
          orientation: "horizontal",
          density: "comfortable",
        },
      }),
      {
        limit: 50,
        partialize: (state) => {
          const newNodes = state.nodes.map((node) => {
            const n = { ...node }
            const { selected, draggable, dragging, positionAbsolute, ...rest } =
              n
            return rest
          })

          const { eipNodeConfigs, edges, layout } = state
          return { eipNodeConfigs, layout, edges, nodes: newNodes }
        },

        equality: (pastState, currentState) =>
          isDeepEqual(pastState, currentState),

        handleSet: (handleSet) =>
          debounce<typeof handleSet>((state) => handleSet(state), 1000, true),
      }
    ),
    {
      name: "eipFlow",
      version: 0,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !NO_PERSIST.has(key))
        ),
    }
  )
)
