import { Information } from "@carbon/icons-react"
import { FormLabel, Tooltip } from "@carbon/react"
import { MouseEventHandler, ReactNode, ReactSVGElement } from "react"

interface DescriptionWrapperProps {
  id: string
  description: string | undefined
  children: ReactNode
}

const DescriptionTooltipWrapper = (props: DescriptionWrapperProps) => {
  if (!props.description) {
    return props.children
  }

  const tooltipDivId = `tooltip-hack-${props.id}`

  // Workaround for tooltip popover not 'escaping' the side panel boundary.
  // The side panel requires vertical scrolling and so this does not allow overflow-x to be set to visible.
  // This workaround detachesuses JS to position the popover dynamically.
  // Long-term we would be better served by implementing our own Tooltip based on the Popover component,
  // to have greater control over the underlying DOM elements.
  const tooltipWorkaroundHandler: MouseEventHandler<ReactSVGElement> = (e) => {
    const icon = e.target as Element
    const tooltipParent = document.getElementById(tooltipDivId)

    const tooltip = tooltipParent?.getElementsByClassName(
      "cds--tooltip-content"
    )[0] as HTMLElement

    const rect = icon.getBoundingClientRect()
    tooltip.style.left = `${rect.left}px`
    tooltip.style.top = `${rect.top}px`
    tooltip.style.position = "fixed"
  }

  return (
    <div id={tooltipDivId}>
      <FormLabel className="form-input-label">{props.id}</FormLabel>
      <Tooltip align="top" label={props.description}>
        <Information onMouseEnter={tooltipWorkaroundHandler} />
      </Tooltip>
      {props.children}
    </div>
  )
}

export default DescriptionTooltipWrapper
