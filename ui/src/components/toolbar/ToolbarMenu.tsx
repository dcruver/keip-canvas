import { IconButton, TableToolbar, TableToolbarContent } from "@carbon/react"
import { MachineLearning, Xml } from "@carbon/react/icons"
import { useState } from "react"
import AssistantChatPanel from "./assistant/AssistantChatPanel"
import { useLlmServerStatus } from "./assistant/llmStatusHook"
import XmlPanel from "./xml/XmlPanel"
import useTranslationServerStatus from "./xml/translatorStatusHook"

interface PanelButtonProps {
  name: string
  icon: React.ReactNode
  disabled: boolean
  selected: boolean
  handleClick: () => void
}

type PanelKeys = "keipAssistant" | "xml"

interface PanelRef {
  icon: React.ReactNode
  panel: React.ReactNode
  enabled?: boolean
}

type Panels = {
  [k in PanelKeys]: PanelRef
}

const panels: Panels = {
  keipAssistant: {
    icon: <MachineLearning />,
    panel: <AssistantChatPanel />,
    enabled: false,
  },
  xml: {
    icon: <Xml />,
    panel: <XmlPanel />,
    enabled: false,
  },
}

const PanelButton = ({
  name,
  icon,
  disabled,
  selected,
  handleClick,
}: PanelButtonProps) => (
  <IconButton
    className={
      selected ? "toolbar-button toolbar-button-selected" : "toolbar-button"
    }
    label={name}
    align="left"
    kind="secondary"
    size="lg"
    onClick={handleClick}
    disabled={disabled}
  >
    {icon}
  </IconButton>
)

const ToolbarMenu = () => {
  const [openPanel, setOpenPanel] = useState<"" | PanelKeys>("")
  const isLlmServerAvailable = useLlmServerStatus()
  const isTranslationServerAvailable = useTranslationServerStatus()

  panels.keipAssistant.enabled = isLlmServerAvailable
  panels.xml.enabled = isTranslationServerAvailable

  const handlePanelButtonClick = (name: PanelKeys) => () => {
    openPanel === name ? setOpenPanel("") : setOpenPanel(name)
  }

  const display = openPanel ? { height: "30vh" } : { height: "2rem" }

  // TODO: Can probably ditch Carbon's Toolbar
  return (
    <div className="main-toolbar-container" style={display}>
      <TableToolbar size="sm">
        <TableToolbarContent className="toolbar-content">
          {Object.entries(panels).map(([panelName, val]) => (
            <PanelButton
              key={panelName}
              name={panelName}
              icon={val.icon}
              disabled={!val.enabled}
              selected={panelName === openPanel}
              handleClick={handlePanelButtonClick(panelName as PanelKeys)}
            />
          ))}
        </TableToolbarContent>
      </TableToolbar>

      {openPanel && panels[openPanel].panel}
    </div>
  )
}

export default ToolbarMenu
