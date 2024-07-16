package com.octo.keip.flow.xml.spring


import com.octo.keip.flow.model.ConnectionType
import com.octo.keip.flow.model.EdgeProps
import com.octo.keip.flow.model.EipChild
import com.octo.keip.flow.model.EipGraph
import com.octo.keip.flow.model.EipId
import com.octo.keip.flow.model.EipNode
import com.octo.keip.flow.model.Role
import com.octo.keip.flow.xml.NamespaceSpec
import com.octo.keip.flow.xml.NodeTransformer
import org.w3c.dom.Node
import org.xmlunit.builder.Input
import org.xmlunit.xpath.JAXPXPathEngine
import spock.lang.Specification

import javax.xml.transform.ErrorListener
import java.util.stream.Stream

import static com.octo.keip.flow.xml.XmlComparisonUtil.compareXml
import static com.octo.keip.flow.xml.XmlComparisonUtil.readTestXml

class IntegrationGraphTransformerTest extends Specification {

    private static final List<NamespaceSpec> NAMESPACES = [new NamespaceSpec("integration", "http://www.springframework.org/schema/integration", "https://www.springframework.org/schema/integration/spring-integration.xsd"),
                                                           new NamespaceSpec("jms", "http://www.springframework.org/schema/integration/jms", "https://www.springframework.org/schema/integration/jms/spring-integration-jms.xsd")
    ]

    EipGraph graph = Stub()

    ErrorListener errorListener = Mock()

    def xmlOutput = new StringWriter()

    def graphTransformer = new IntegrationGraphTransformer(NAMESPACES, errorListener)

    def "Transform empty graph. Check root element"() {
        given:
        graphTransformer.toXml(graph, xmlOutput)

        expect:
        compareXml(xmlOutput.toString(), readTestXml("empty.xml"))
    }

    def "Transform single node graph"() {
        given:
        EipNode node = Stub {
            id() >> "test-id"
            eipId() >> new EipId("integration", "transformer")
            role() >> Role.TRANSFORMER
            connectionType() >> ConnectionType.PASSTHRU
            attributes() >> ["ref": "test-bean"]
            children() >> [new EipChild("poller", ["fixed-delay": 1000], null)]
        }

        graph.traverse() >> { _ -> Stream.of(node) }

        when:
        graphTransformer.toXml(graph, xmlOutput)

        then: "only referenced namespaces should be included (instead of all registered namespaces)"
        compareXml(xmlOutput.toString(), readTestXml("single-node.xml"))
    }

    def "Transform multi-node graph"() {
        given: "inbound adapter -> transformer -> outbound adapter"
        EipNode inbound = Stub {
            id() >> "messageGenerator"
            eipId() >> new EipId("integration", "inbound-channel-adapter")
            role() >> Role.ENDPOINT
            connectionType() >> ConnectionType.SOURCE
            attributes() >> ["expression": "'TestMessage'"]
            children() >> [new EipChild("poller", ["fixed-rate": 5000], null)]
        }

        EipNode transformer = Stub {
            id() >> "appender"
            eipId() >> new EipId("integration", "transformer")
            role() >> Role.TRANSFORMER
            connectionType() >> ConnectionType.PASSTHRU
            attributes() >> ["expression": "payload + ' processed'"]
        }

        EipNode outbound = Stub {
            id() >> "jmsProducer"
            eipId() >> new EipId("jms", "outbound-channel-adapter")
            role() >> Role.ENDPOINT
            connectionType() >> ConnectionType.SINK
            attributes() >> ["destination-name": "test-target"]
        }

        graph.predecessors(inbound) >> []
        graph.successors(inbound) >> [transformer]
        graph.getEdgeProps(inbound, transformer) >> createEdgeProps("messageSource")

        graph.predecessors(transformer) >> [inbound]
        graph.successors(transformer) >> [outbound]
        graph.getEdgeProps(transformer, outbound) >> createEdgeProps("transformerOut")

        graph.predecessors(outbound) >> [transformer]
        graph.successors(outbound) >> []

        graph.traverse() >> { _ -> Stream.of(inbound, transformer, outbound) }

        when:
        graphTransformer.toXml(graph, xmlOutput)

        then:
        compareXml(xmlOutput.toString(), readTestXml("multi-node.xml"))
    }

    def "Transforming node with a unregistered EIP namespace throws an exception"() {
        given:
        EipNode node = Stub {
            id() >> "test-id"
            eipId() >> new EipId("unknown", "simple")
            role() >> Role.TRANSFORMER
            connectionType() >> ConnectionType.PASSTHRU
        }

        graph.traverse() >> { _ -> Stream.of(node) }

        when:
        graphTransformer.toXml(graph, xmlOutput)

        then:
        1 * errorListener.fatalError(_)
    }

    def "Registering custom node transformers resolves correctly"() {
        given: "inbound adapter -> outbound adapter"
        EipNode inbound = Stub {
            id() >> "inbound"
            eipId() >> new EipId("integration", "inbound-adapter")
            role() >> Role.ENDPOINT
            connectionType() >> ConnectionType.SOURCE
        }

        def outboundEipId = new EipId("integration", "outbound-adapter")
        EipNode outbound = Stub {
            id() >> "outbound"
            eipId() >> outboundEipId
            role() >> Role.ENDPOINT
            connectionType() >> ConnectionType.SINK
        }

        graph.predecessors(inbound) >> []
        graph.successors(inbound) >> [outbound]
        graph.getEdgeProps(inbound, outbound) >> createEdgeProps("chan1")

        graph.predecessors(outbound) >> [inbound]
        graph.successors(outbound) >> []

        graph.traverse() >> { _ -> Stream.of(inbound, outbound) }

        NodeTransformer mockTransformer = Mock()

        when:
        graphTransformer.registerNodeTransformer(outboundEipId, mockTransformer)
        graphTransformer.toXml(graph, xmlOutput)

        then:
        1 * mockTransformer.apply(outbound, graph)
    }

    def "NodeTransformer throws exception -> pass exception to error listener and move on to next node"() {
        given: "inbound adapter -> outbound adapter"
        def inboundEipId = new EipId("integration", "inbound-adapter")
        EipNode inbound = Stub {
            id() >> "inbound"
            eipId() >> inboundEipId
            role() >> Role.ENDPOINT
            connectionType() >> ConnectionType.SOURCE
        }

        EipNode outbound = Stub {
            id() >> "outbound"
            eipId() >> new EipId("integration", "outbound-adapter")
            role() >> Role.ENDPOINT
            connectionType() >> ConnectionType.SINK
        }

        graph.predecessors(inbound) >> []
        graph.successors(inbound) >> [outbound]
        graph.getEdgeProps(inbound, outbound) >> createEdgeProps("chan1")

        graph.predecessors(outbound) >> [inbound]
        graph.successors(outbound) >> []

        graph.traverse() >> { _ -> Stream.of(inbound, outbound) }

        NodeTransformer mockTransformer = Mock()

        when:
        graphTransformer.registerNodeTransformer(inboundEipId, mockTransformer)
        graphTransformer.toXml(graph, xmlOutput)

        then:
        1 * mockTransformer.apply(inbound,
                graph) >> { throw new RuntimeException("inbound transformer error") }
        1 * errorListener.error(_)

        def rootElem = getRootElement(xmlOutput.toString())
        rootElem.getLocalName() == "beans"
        def outboundElem = rootElem.getFirstChild()
        outboundElem.getLocalName() == "outbound-adapter"
        outboundElem.getNextSibling() == null
    }

    Optional<EdgeProps> createEdgeProps(String id) {
        return Optional.of(new EdgeProps(id))
    }

    Node getRootElement(String xml) {
        def matches = new JAXPXPathEngine().selectNodes("/*",
                Input.fromString(xml).build())
        return matches.toList()[0]
    }
}
