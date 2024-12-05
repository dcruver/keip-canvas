import { useShallow } from "zustand/react/shallow"
import { DYNAMIC_EDGE_TYPE, DynamicEdge } from "../../api/flow"
import { AppStore } from "./api"
import { useAppStore } from "./appStore"

export const useNodeCount = () => useAppStore((state) => state.nodes.length)

export const useGetNodes = () => useAppStore((state) => state.nodes)

export const useGetLayout = () => useAppStore((state) => state.layout)

export const useFlowStore = () =>
  useAppStore(
    useShallow((state: AppStore) => ({
      nodes: state.nodes,
      edges: state.edges,
    }))
  )

export const useUndoRedo = () =>
  useAppStore(() => ({
    undo: useAppStore.temporal.getState().undo,
    redo: useAppStore.temporal.getState().redo,
  }))

export const useSerializedStore = () =>
  useAppStore((state) =>
    JSON.stringify({
      nodes: state.nodes,
      edges: state.edges,
      eipNodeConfigs: state.eipConfigs,
    })
  )

export const useGetNodeDescription = (id: string) =>
  useAppStore((state) => state.eipConfigs[id]?.description)

export const useGetEipAttribute = (id: string, attrName: string) =>
  useAppStore((state) => state.eipConfigs[id].attributes[attrName])

export const useGetEnabledChildren = (id: string) =>
  useAppStore(
    useShallow((state) =>
      state.eipConfigs[id] ? state.eipConfigs[id].children : []
    )
  )

export const useGetSelectedChildNode = () =>
  useAppStore((state) => state.selectedChildNode)

export const useGetContentRouterKey = (nodeId: string) =>
  useAppStore(useShallow((state) => state.eipConfigs[nodeId]?.routerKey))

export const useGetRouterDefaultEdgeMapping = (routerId: string) =>
  useAppStore((state) =>
    state.edges.find(
      (edge) =>
        edge.source === routerId &&
        edge.type === DYNAMIC_EDGE_TYPE &&
        (edge as DynamicEdge).data?.mapping.isDefaultMapping
    )
  )
