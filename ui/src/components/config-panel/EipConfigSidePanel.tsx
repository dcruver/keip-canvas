import { HeaderPanel } from "@carbon/react"
import { useState } from "react"
import { Edge, useOnSelectionChange, useStoreApi } from "reactflow"
import { DYNAMIC_EDGE_TYPE, DynamicEdge, EipFlowNode } from "../../api/flow"
import { Attribute } from "../../api/generated/eipComponentDef"
import { EipId } from "../../api/id"
import {
  FLOW_CONTROLLED_ATTRIBUTES,
  lookupContentBasedRouterKeys,
  lookupEipComponent,
} from "../../singletons/eipDefinitions"
import { clearSelectedChildNode } from "../../singletons/store/appActions"
import { useGetSelectedChildNode } from "../../singletons/store/getterHooks"
import { getEipId } from "../../singletons/store/storeViews"
import ChildNodeConfig from "./ChildNodeConfig"
import DynamicEdgeConfig from "./DynamicEdgeConfig"
import RootNodeConfig from "./RootNodeConfig"

const isDynamicRouterAttribute = (attribute: Attribute, eipId?: EipId) => {
  if (!eipId) {
    return false
  }

  const keyDef = lookupContentBasedRouterKeys(eipId)
  if (!keyDef) {
    return false
  }

  return keyDef.type === "attribute" && keyDef.name === attribute.name
}

const filterConfigurableAttributes = (attrs?: Attribute[], eipId?: EipId) => {
  return attrs
    ? attrs.filter(
        (attr) =>
          !FLOW_CONTROLLED_ATTRIBUTES.has(attr.name) &&
          !isDynamicRouterAttribute(attr, eipId)
      )
    : []
}

const isDynamicEdge = (edge: Edge) => edge?.type === DYNAMIC_EDGE_TYPE

const EipConfigSidePanel = () => {
  const reactFlowStore = useStoreApi()
  const [selectedNode, setSelectedNode] = useState<EipFlowNode | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<DynamicEdge | null>(null)
  const selectedChildId = useGetSelectedChildNode()

  useOnSelectionChange({
    onChange: ({ nodes, edges }) => {
      selectedChildId && clearSelectedChildNode()
      const numSelected = nodes.length + edges.length
      setSelectedNode(numSelected === 1 ? nodes[0] : null)
      setSelectedEdge(
        numSelected === 1 && isDynamicEdge(edges[0]) ? edges[0] : null
      )
    },
  })

  const selectedNodeEipId = selectedNode && getEipId(selectedNode.id)
  const eipComponent = selectedNodeEipId
    ? lookupEipComponent(selectedNodeEipId)
    : null

  let sidePanelContent
  // TODO: Simplify conditionals
  if (selectedChildId && selectedNode && eipComponent) {
    const childEipId = getEipId(selectedChildId)
    const childName = childEipId?.name ?? ""
    const childElement = eipComponent.childGroup!.children.find(
      (e) => e.name === childName
    )!
    const configurableAttrs = filterConfigurableAttributes(
      childElement.attributes
    )
    sidePanelContent = (
      <ChildNodeConfig
        key={selectedChildId}
        childId={selectedChildId}
        parentName={eipComponent.name}
        attributes={configurableAttrs}
        hasChildren={Boolean(childElement?.childGroup)}
      />
    )
  } else if (selectedNodeEipId && eipComponent) {
    const configurableAttrs = filterConfigurableAttributes(
      eipComponent.attributes,
      selectedNodeEipId
    )
    sidePanelContent = (
      <RootNodeConfig
        key={selectedNode.id}
        node={selectedNode}
        attributes={configurableAttrs}
        childGroup={eipComponent.childGroup}
      />
    )
  } else if (selectedEdge) {
    const { nodeInternals } = reactFlowStore.getState()
    const sourceNode = nodeInternals.get(selectedEdge.source)
    const targetNode = nodeInternals.get(selectedEdge.target)

    sidePanelContent = (
      <DynamicEdgeConfig
        key={selectedEdge.id}
        edge={{ ...selectedEdge, sourceNode, targetNode }}
      />
    )
  } else {
    // Returning an empty fragment because the HeaderPanel component spams the logs with error messages if it doesn't have any children.
    sidePanelContent = <></>
  }

  const showPanel = Boolean(selectedNode || selectedChildId || selectedEdge)

  return (
    <HeaderPanel
      className={showPanel ? "node-config-panel" : ""}
      expanded={showPanel}
    >
      {sidePanelContent}
    </HeaderPanel>
  )
}

export default EipConfigSidePanel
