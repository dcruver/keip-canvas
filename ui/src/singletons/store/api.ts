import { Edge } from "reactflow"
import { EipFlowNode, Layout, RouterKey } from "../../api/flow"
import { Attributes } from "../../api/generated/eipFlow"
import { EipId } from "../../api/id"

export interface EipConfig {
  attributes: Attributes
  children: string[]
  eipId: EipId
  description?: string
  routerKey?: RouterKey
}

export interface AppStore {
  nodes: EipFlowNode[]
  edges: Edge[]
  eipConfigs: Record<string, EipConfig>
  selectedChildNode: string | null
  layout: Layout
}

export interface SerializedFlow {
  nodes: AppStore["nodes"]
  edges: AppStore["edges"]
  eipConfigs: AppStore["eipConfigs"]
  version: string
}
