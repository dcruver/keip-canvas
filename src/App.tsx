import { Content, Header, HeaderName } from "@carbon/react"

import "./styles.scss"

import FlowCanvas from "./canvas/FlowCanvas"
import NodeChooserPanel from "./node-chooser/NodeChooserPanel"
import NodeConfigPanel from "./node-config/NodeConfigForm"

const App = () => (
  <>
    <Header aria-label="Canvas Title" className="header-main">
      <HeaderName prefix="" className="header-main-text">
        Keip Canvas
      </HeaderName>
    </Header>

    <NodeChooserPanel />

    <Content className="canvas">
      <FlowCanvas />
    </Content>

    <NodeConfigPanel />
  </>
)

export default App
