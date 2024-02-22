import { Node } from "reactflow"
import { EipId } from "./eipId"
import { FlowType, Role } from "./eipSchema"

export interface EipNodeData {
  eipId: EipId
  label: string
  flowType: FlowType
  role: Role
}

export type EipFlowNode = Node<EipNodeData>

export const EIP_NODE_KEY = "eipNode"
