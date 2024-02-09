import {
  Column,
  Content,
  Grid,
  Header,
  HeaderName,
  SideNav,
  SideNavItems,
  SideNavMenu,
} from "@carbon/react"

import "./styles.scss"

import FlowCanvas from "./FlowCanvas"
import componentSchema from "./compnentSchema"
import eipImgUrls from "./eipImages"
import { toTitleCase } from "./titleTransform"

interface EIPComponent {
  name: string
}

type EIPBlockCollectionProps = {
  title: string
  components: EIPComponent[]
}

const EIPBlockCollection = ({ title, components }: EIPBlockCollectionProps) => {
  const blocks = components.map((component) => (
    <Column key={component.name} lg={4} md={2} sm={1}>
      <img src={eipImgUrls[component.name]} width="100%" height="80%" />
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

const LeftPanel = () => {
  const collections = Object.entries(componentSchema).map(
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

const App = () => (
  <>
    <Header aria-label="Canvas Title" className="header-main">
      <HeaderName prefix="" className="header-main-text">
        Keip Canvas
      </HeaderName>
    </Header>
    <LeftPanel />

    {/* <HeaderPanel expanded>
      <RightSideContent />
    </HeaderPanel> */}
    <Content className="canvas">
      <FlowCanvas />
    </Content>
  </>
)

export default App
