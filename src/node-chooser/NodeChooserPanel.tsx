import {
  SideNav,
  SideNavItems,
  SideNavMenu,
  SideNavMenuItem,
} from "@carbon/react"

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
}

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
    <div className="eip-item-container" ref={drag} style={{ opacity }}>
      <img className="eip-item-image" src={iconUrl} />
      <span className="eip-item-text">{toTitleCase(name)}</span>
      <DragPreviewImage connect={preview} src={iconUrl} />
    </div>
  )
}

const EIPBlockCollection = ({ title, components }: EIPBlockCollectionProps) => {
  const eipItems = components.map((component) => (
    <SideNavMenuItem key={component.name}>
      <EIPItem name={component.name} />
    </SideNavMenuItem>
  ))

  return (
    <SideNavMenu title={toTitleCase(title)} large defaultExpanded>
      {eipItems}
    </SideNavMenu>
  )
}

// TODO: Add node search bar

const NodeChooserPanel = () => {
  const collections = Object.entries(eipComponentSchema).map(
    ([collectionName, components]) => (
      <EIPBlockCollection
        key={collectionName}
        title={collectionName}
        components={components as EIPComponent[]}
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
      <SideNavItems>{collections}</SideNavItems>
    </SideNav>
  )
}

export default NodeChooserPanel
