import { Edge } from "reactflow"
import { EipFlowNode, Layout } from "../../api/flow"
import { EipId } from "../../api/generated/eipFlow"
import { useAppStore } from "./appStore"

// Warning: the following exports provide non-reactive access to the store's state
export const getNodesView = (): readonly EipFlowNode[] =>
  useAppStore.getState().nodes

export const getEdgesView = (): readonly Edge[] => useAppStore.getState().edges

export const getLayoutView = (): Readonly<Layout> =>
  useAppStore.getState().layout

export const getEipId = (nodeId: string): Readonly<EipId> | undefined =>
  useAppStore.getState().eipConfigs[nodeId]?.eipId
