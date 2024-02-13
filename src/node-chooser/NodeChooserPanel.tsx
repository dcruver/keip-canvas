import { Column, Grid, SideNav, SideNavItems, SideNavMenu } from "@carbon/react"

import { useDrag } from "react-dnd"
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

const getIconStyles = (isDragging: boolean) => {
  return {
    width: isDragging ? "80%" : "100%",
    height: isDragging ? "70%" : "80%",
    opacity: isDragging ? 0.7 : 1,
  }
}

const EIPBlock = ({ name }: EIPBlockProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: DragTypes.FLOWNODE,
    item: { name },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  const { width, height, ...restStyle } = getIconStyles(isDragging)

  return (
    <img
      src={eipIconUrls[name]}
      width={width}
      height={height}
      ref={drag}
      style={restStyle}
    />
  )
}

const EIPBlockCollection = ({ title, components }: EIPBlockCollectionProps) => {
  const blocks = components.map((component) => (
    <Column key={component.name} lg={4} md={2} sm={1}>
      <EIPBlock name={component.name} />
    </Column>
  ))

  return (
    <SideNavMenu title={toTitleCase(title)} defaultExpanded>
      <Grid narrow style={{ paddingTop: "10px" }}>
        {blocks}
      </Grid>
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
