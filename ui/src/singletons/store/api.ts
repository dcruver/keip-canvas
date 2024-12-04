import { Edge } from "reactflow"
import { EipFlowNode, Layout, RouterKey } from "../../api/flow"
import { Attributes, EipChildNode } from "../../api/generated/eipFlow"
import { ChildNodeId } from "../../api/id"

export interface EipNodeConfig {
  attributes: Attributes
  children: Record<string, EipChildNode>
  description?: string
  routerKey?: RouterKey
}

export interface AppStore {
  nodes: EipFlowNode[]
  edges: Edge[]
  eipNodeConfigs: Record<string, EipNodeConfig>
  selectedChildNode: ChildNodeId | null
  layout: Layout
}
