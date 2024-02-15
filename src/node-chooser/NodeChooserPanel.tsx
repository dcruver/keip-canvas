import {
  Search,
  SideNav,
  SideNavItems,
  SideNavMenu,
  SideNavMenuItem,
} from "@carbon/react"

import { useState } from "react"
import { DragPreviewImage, useDrag } from "react-dnd"
import eipIconUrls from "../eipIconCatalog"
import eipComponentSchema from "../schema/compnentSchema"
import { toTitleCase } from "../utils/titleTransform"
import { DragTypes } from "./dragTypes"

interface EIPComponent {
  name: string
}

type EIPBlockProps = {
  name: string
}

type EIPBlockCollectionProps = {
  title: string
  components: EIPComponent[]
  searchFilter?: string
}

// TODO: Show description docs on hover
const EIPItem = ({ name }: EIPBlockProps) => {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: DragTypes.FLOWNODE,
    item: { name },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  const iconUrl = eipIconUrls[name]
  const opacity = isDragging ? 0.5 : 1

  return (
    <SideNavMenuItem
      className="eip-item-container"
      ref={drag}
      style={{ opacity }}
    >
      <img className="eip-item-image" src={iconUrl} />
      <span className="eip-item-text">{toTitleCase(name)}</span>
      <DragPreviewImage connect={preview} src={iconUrl} />
    </SideNavMenuItem>
  )
}

const EIPBlockCollection = ({
  title,
  components,
  searchFilter,
}: EIPBlockCollectionProps) => {
  const filtered = searchFilter
    ? components.filter((c) => c.name.toLowerCase().includes(searchFilter))
    : components

  const eipItems = filtered.map((c) => <EIPItem key={c.name} name={c.name} />)

  return (
    <SideNavMenu title={toTitleCase(title)} large defaultExpanded>
      {eipItems}
    </SideNavMenu>
  )
}

// TODO: Add node search bar

const NodeChooserPanel = () => {
  const [searchTerm, setSearchTerm] = useState("")

  const collections = Object.entries(eipComponentSchema).map(
    ([collectionName, components]) => (
      <EIPBlockCollection
        key={collectionName}
        title={collectionName}
        components={components as EIPComponent[]}
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
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <SideNavItems>{collections}</SideNavItems>
    </SideNav>
  )
}

export default NodeChooserPanel
