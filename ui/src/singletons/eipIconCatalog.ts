import { EipId } from "../api/id"
import channelImg from "../assets/eip/channel.png"
import inboundAdapterImg from "../assets/eip/inbound_channel_adapter.png"
import outboundAdapterImg from "../assets/eip/outbound_channel_adapter.png"

const findIcon = (name: string) => {
  switch (true) {
    case name.endsWith("channel"):
      return channelImg
    case name === "message-driven-channel-adapter":
    case name.includes("inbound-channel-adapter"):
      return inboundAdapterImg
    case name === "logging-channel-adapter":
    case name.includes("outbound-channel-adapter"):
      return outboundAdapterImg
    default:
      return undefined
  }
}

const getIconUrl = (id: EipId) => findIcon(id.name)

export default getIconUrl
