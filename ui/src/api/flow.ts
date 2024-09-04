import { Edge, Node } from "reactflow"
import { Attribute } from "./generated/eipComponentDef"
import { Attributes } from "./generated/eipFlow"
import { EipId } from "./id"

export interface Layout {
  orientation: "horizontal" | "vertical"
  density: "compact" | "comfortable"
}

export interface EipNodeData {
  eipId: EipId
  label?: string
}

export type EipFlowNode = Node<EipNodeData>

export interface ChannelMapping {
  mapperName: string
  matcher: Attribute
  matcherValue?: string
  isDefaultMapping?: boolean
}

// TODO: Should custom edge data contain only a reference to the mapping?
// The mapping could be stored separately in the app store.
export interface DynamicEdgeData {
  mapping: ChannelMapping
}

export type DynamicEdge = Edge<DynamicEdgeData>

export const EIP_NODE_TYPE = "eipNode"

export const DYNAMIC_EDGE_TYPE = "dynamicEdge"

// TODO: Rethink router interfaces
export interface RouterKeyDef {
  name: string
  type: "attribute" | "child"
  attributesDef: Attribute[]
}

export interface RouterKey {
  name: string
  attributes?: Attributes
}
