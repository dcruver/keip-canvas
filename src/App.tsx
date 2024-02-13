import { Content, Header, HeaderName, HeaderPanel } from "@carbon/react"

import "./styles.scss"

import FlowCanvas from "./canvas/FlowCanvas"
import NodeChooserPanel from "./node-chooser/NodeChooserPanel"
import NodeConfigPanel from "./node-config/NodeConfigForm"
import eipComponentSchema from "./schema/compnentSchema"

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

    <HeaderPanel className="right-panel" expanded>
      <NodeConfigPanel
        nodeId={"123"}
        eipComponent={eipComponentSchema["integration"][0]}
      />
    </HeaderPanel>
  </>
)

export default App
