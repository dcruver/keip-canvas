import {
  Search,
  SideNav,
  SideNavItems,
  SideNavMenu,
  SideNavMenuItem,
} from "@carbon/react"

import { useEffect, useState } from "react"
import { DragPreviewImage, useDrag } from "react-dnd"
import { EipId } from "../api/eip"
import getIconUrl from "../eipIconCatalog"
import { EipComponent, eipComponentSchema } from "../schema/componentSchema"
import { useNodeCount } from "../store"
import { toTitleCase } from "../utils/titleTransform"
import { DragTypes } from "./dragTypes"

type EipItemProps = {
  eipId: EipId
}

type EipBlockCollectionProps = {
  namespace: string
  components: EipComponent[]
  searchFilter?: string
}

// TODO: Show description docs on hover
const EipItem = ({ eipId }: EipItemProps) => {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: DragTypes.FLOWNODE,
    item: eipId,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  const iconUrl = getIconUrl(eipId)
  const opacity = isDragging ? 0.5 : 1

  return (
    <SideNavMenuItem className="eip-menu-item" ref={drag} style={{ opacity }}>
      <div className="eip-item-wrapper">
        <img className="eip-item-image" src={iconUrl} />
        <span>{toTitleCase(eipId.name)}</span>
        <DragPreviewImage connect={preview} src={iconUrl} />
      </div>
    </SideNavMenuItem>
  )
}

const EipBlockCollection = ({
  namespace,
  components,
  searchFilter,
}: EipBlockCollectionProps) => {
  const filtered = searchFilter
    ? components.filter((c) => c.name.toLowerCase().includes(searchFilter))
    : components

  const eipItems = filtered.map((c) => (
    <EipItem key={c.name} eipId={{ namespace, name: c.name }} />
  ))

  return (
    <SideNavMenu title={toTitleCase(namespace)} large defaultExpanded>
      {eipItems}
    </SideNavMenu>
  )
}

const NodeChooserPanel = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const nodeCount = useNodeCount()

  useEffect(() => setSearchTerm(""), [nodeCount])

  const collections = Object.entries(eipComponentSchema).map(
    ([namespace, components]) => (
      <EipBlockCollection
        key={namespace}
        namespace={namespace}
        components={components as EipComponent[]}
        searchFilter={searchTerm}
      />
    )
  )
  return (
    <SideNav
      className="node-chooser-panel"
      isFixedNav
      expanded={true}
      isChildOfHeader={false}
      aria-label="side-navigation"
    >
      <div className="search-bar-container">
        <Search
          labelText="Narrow component selections"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <SideNavItems>{collections}</SideNavItems>
    </SideNav>
  )
}

export default NodeChooserPanel
