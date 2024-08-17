import {
  Layer,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@carbon/react"

import { ReactNode } from "react"

interface ConfigurationTabProps {
  hasAttributes: boolean
  attributesForm: React.ReactNode
}

// Workaround for 'TabList' component not filtering out null-like children.
const getTabs = (hasAttributes: boolean) => {
  const tabList = [] as ReactNode[]
  hasAttributes && tabList.push(<Tab key="attributes">Attributes</Tab>)
  return tabList
}

// Workaround for 'TabPanels' component not filtering out null-like children.
const getTabPanels = ({
  hasAttributes,
  attributesForm,
}: ConfigurationTabProps) => {
  const tabPanels = [] as ReactNode[]
  hasAttributes &&
    tabPanels.push(
      <TabPanel
        key="attributes"
        className="cfg-panel__container__padding-remove"
      >
        {attributesForm}
      </TabPanel>
    )
  return tabPanels
}

// TODO: if we are sticking to displaying only attributes in side panel,
// ditch the tab panel and use a plain header above the attributes form.
const ConfigurationInputTabs = (props: ConfigurationTabProps) => (
  <Stack gap={4}>
    <Tabs>
      <Layer level={2}>
        <TabList aria-label="attributes panel" contained fullWidth>
          {getTabs(props.hasAttributes)}
        </TabList>
      </Layer>
      <TabPanels>{getTabPanels(props)}</TabPanels>
    </Tabs>
  </Stack>
)

export default ConfigurationInputTabs
