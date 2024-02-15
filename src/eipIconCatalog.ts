import channelImg from "./assets/eip/channel.png"
import inboundAdapterImg from "./assets/eip/inbound_channel_adapter.png"
import outboundAdapterImg from "./assets/eip/outbound_channel_adapter.png"

const eipIconUrls: { [key: string]: string } = {
  channel: channelImg,
  "publish-subscribe-channel": channelImg,
  "inbound-channel-adapter": inboundAdapterImg,
  "logging-channel-adapter": outboundAdapterImg,
}

export default eipIconUrls
