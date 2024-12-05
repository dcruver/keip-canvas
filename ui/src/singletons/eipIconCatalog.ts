import { EipId } from "../api/generated/eipFlow"
import aggregatorImg from "../assets/eip/aggregator.svg"
import annotationImg from "../assets/eip/annotation.svg"
import barrierImg from "../assets/eip/barrier.svg"
import bridgeImg from "../assets/eip/bridge.svg"
import channelImg from "../assets/eip/channel.svg"
import claimCheckImg from "../assets/eip/claim_check.svg"
import connectionFactoryImg from "../assets/eip/connection--factory.svg"
import controlBusImg from "../assets/eip/control_bus.svg"
import delayerImg from "../assets/eip/delayer.svg"
import enricherImg from "../assets/eip/enricher.svg"
import filterImg from "../assets/eip/filter.svg"
import gatewayImg from "../assets/eip/gateway.svg"
import idempotentImg from "../assets/eip/idempotent.svg"
import inboundAdapterImg from "../assets/eip/inbound_channel_adapter.svg"
import messageHistoryImg from "../assets/eip/message_history.svg"
import routerImg from "../assets/eip/message_router.svg"
import outboundAdapterImg from "../assets/eip/outbound_channel_adapter.svg"
import pollerImg from "../assets/eip/poller.svg"
import processManagerImg from "../assets/eip/process_manager.svg"
import resequencerImg from "../assets/eip/resequencer.svg"
import retryImg from "../assets/eip/retry.svg"
import scatteraGatherImg from "../assets/eip/scatter_gather.svg"
import scriptImg from "../assets/eip/script.svg"
import selectorImg from "../assets/eip/selector.svg"
import serviceActivatorImg from "../assets/eip/service_activator.svg"
import spelFunctionImg from "../assets/eip/spel_function.svg"
import splitterImg from "../assets/eip/splitter.svg"
import transformerImg from "../assets/eip/transformer.svg"
import wireTapImg from "../assets/eip/wire_tap.svg"

const findIcon = (name: string) => {
  switch (true) {
    case name.endsWith("channel"):
      return channelImg
    case name.endsWith("enricher"):
      return enricherImg
    case name.endsWith("filter"):
      return filterImg
    case name.endsWith("gateway"):
      return gatewayImg
    case name === "message-driven-channel-adapter":
    case name.includes("inbound") && name.includes("channel-adapter"):
      return inboundAdapterImg
    case name === "logging-channel-adapter":
    case name.includes("outbound") && name.includes("channel-adapter"):
      return outboundAdapterImg
    case name.endsWith("router"):
      return routerImg
    case name.includes("splitter"):
      return splitterImg
    case name.includes("transformer"):
      return transformerImg
    default:
      break
  }

  switch (name) {
    case "aggregator":
      return aggregatorImg
    case "annotation-config":
      return annotationImg
    case "barrier":
      return barrierImg
    case "bridge":
      return bridgeImg
    case "channel-interceptor":
      return wireTapImg
    case "claim-check-in":
    case "claim-check-out":
      return claimCheckImg
    case "control-bus":
      return controlBusImg
    case "delayer":
      return delayerImg
    case "graph-controller":
      return controlBusImg
    case "handler-retry-advice":
      return retryImg
    case "idempotent-receiver":
      return idempotentImg
    case "management":
      return processManagerImg
    case "message-history":
      return messageHistoryImg
    case "poller":
      return pollerImg
    case "publishing-interceptor":
      return wireTapImg
    case "resequencer":
      return resequencerImg
    case "scatter-gather":
      return scatteraGatherImg
    case "script":
      return scriptImg
    case "selector":
      return selectorImg
    case "service-activator":
      return serviceActivatorImg
    case "spel-function":
      return spelFunctionImg
    case "tcp-connection-factory":
      return connectionFactoryImg
    case "transaction-synchronization-factory":
      return processManagerImg
    case "wire-tap":
      return wireTapImg
    case "xpath-expression":
      return scriptImg
    default:
      console.log(`No icon found for ${name}`)
      return undefined
  }
}

const getIconUrl = (id: EipId) => findIcon(id.name)

export default getIconUrl
