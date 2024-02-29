export interface EipId {
  namespace: string
  name: string
}

export interface ChildNodeId {
  name: string
  parentEipId: EipId
  parentNodeId: string
}

const childIdToString = (cid: ChildNodeId) =>
  `${cid.parentEipId.namespace}-${cid.parentEipId.name}-${cid.parentNodeId}-${cid.name}`

export const areChildIdsEqual = (c1: ChildNodeId, c2: ChildNodeId) =>
  childIdToString(c1) === childIdToString(c2)
