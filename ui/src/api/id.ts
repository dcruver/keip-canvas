// TODO: use the EipId defined in the API generated from JSON schema instead.
export interface EipId {
  namespace: string
  name: string
}

export interface ChildNodeId {
  name: string
  parentNodeId: string
}

export const childIdToString = (cid: ChildNodeId) =>
  `${cid.parentNodeId}.${cid.name}`

export const areChildIdsEqual = (c1: ChildNodeId, c2: ChildNodeId) =>
  childIdToString(c1) === childIdToString(c2)
