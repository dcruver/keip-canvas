import { useShallow } from "zustand/react/shallow"
import { DYNAMIC_EDGE_TYPE, DynamicEdge } from "../../api/flow"
import { areChildIdsEqual, ChildNodeId, ROOT_PARENT } from "../../api/id"
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
      eipNodeConfigs: state.eipNodeConfigs,
    })
  )

export const useGetNodeDescription = (id: string) =>
  useAppStore((state) => state.eipNodeConfigs[id]?.description)

export const useGetEipAttribute = (
  id: string,
  parentId: string,
  attrName: string
) =>
  useAppStore((state) => {
    if (parentId === ROOT_PARENT) {
      return state.eipNodeConfigs[id]?.attributes[attrName]
    }
    const child = state.eipNodeConfigs[parentId]?.children[id]
    return child?.attributes?.[attrName]
  })

export const useGetChildren = (id: string) =>
  useAppStore(
    useShallow((state) =>
      state.eipNodeConfigs[id]
        ? Object.keys(state.eipNodeConfigs[id].children)
        : []
    )
  )

export const useGetSelectedChildNode = () =>
  useAppStore(useShallow((state) => state.selectedChildNode))

export const useIsChildSelected = (childId: ChildNodeId) =>
  useAppStore((state) => {
    if (state.selectedChildNode === null) {
      return false
    }
    return areChildIdsEqual(state.selectedChildNode, childId)
  })

export const useGetContentRouterKey = (nodeId: string) =>
  useAppStore(useShallow((state) => state.eipNodeConfigs[nodeId]?.routerKey))

export const useGetRouterDefaultEdgeMapping = (routerId: string) =>
  useAppStore((state) =>
    state.edges.find(
      (edge) =>
        edge.source === routerId &&
        edge.type === DYNAMIC_EDGE_TYPE &&
        (edge as DynamicEdge).data?.mapping.isDefaultMapping
    )
  )
