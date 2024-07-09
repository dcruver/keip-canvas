package com.octo.keip.flow.xml.spring

import com.octo.keip.flow.model.ConnectionType
import com.octo.keip.flow.model.EdgeProps
import com.octo.keip.flow.model.EipChild
import com.octo.keip.flow.model.EipGraph
import com.octo.keip.flow.model.EipId
import com.octo.keip.flow.model.EipNode
import com.octo.keip.flow.model.Role
import com.octo.keip.flow.xml.NamespaceSpec
import org.xmlunit.builder.DiffBuilder
import spock.lang.Specification

import java.nio.file.Path
import java.util.stream.Stream

class IntegrationGraphTransformerTest extends Specification {

    private static final NAMESPACES = [new NamespaceSpec("integration", "http://www.springframework.org/schema/integration", "https://www.springframework.org/schema/integration/spring-integration.xsd"),
                                       new NamespaceSpec("jms", "http://www.springframework.org/schema/integration/jms", "https://www.springframework.org/schema/integration/jms/spring-integration-jms.xsd")
    ]

    EipGraph graph = Stub()

    def graphTransformer = new IntegrationGraphTransformer(NAMESPACES)

    def "Transform empty graph. Check root element"() {
        given:
        def xml = graphTransformer.prettyPrintXml(graph)

        expect:
        compareXml(xml, readTestXml("empty.xml"))
    }

    def "Transform single node graph."() {
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
        def xml = graphTransformer.prettyPrintXml(graph)

        then: "only referenced namespaces should be included (instead of all registered namespaces)"
        compareXml(xml, readTestXml("single-node.xml"))
    }

    def "Transform multi-node graph."() {
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
        def xml = graphTransformer.prettyPrintXml(graph)

        then: "only referenced namespaces should be included (instead of all registered namespaces)"
        compareXml(xml, readTestXml("multi-node.xml"))
    }

    // TODO: Test unknown eipNamespace

    void compareXml(Object actual, Object expected) {
        def diff = DiffBuilder.compare(expected)
                              .withTest(actual)
                              .checkForIdentical()
                              .ignoreWhitespace()
                              .normalizeWhitespace()
                              .build()

        assert !diff.hasDifferences()
    }

    InputStream readTestXml(String filename) {
        Path path = Path.of("xml").resolve(filename)
        return IntegrationGraphTransformerTest.class.getClassLoader()
                                              .getResourceAsStream(path.toString())
    }

    Optional<EdgeProps> createEdgeProps(String id) {
        return Optional.of(new EdgeProps(id))
    }
}
