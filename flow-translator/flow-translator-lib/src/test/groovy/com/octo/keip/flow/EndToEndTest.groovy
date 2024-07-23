package com.octo.keip.flow

import com.octo.keip.flow.model.EipId
import com.octo.keip.flow.xml.NamespaceSpec
import com.octo.keip.flow.xml.NodeTransformer
import spock.lang.Specification

import javax.xml.transform.ErrorListener
import java.nio.file.Path

import static com.octo.keip.flow.xml.XmlComparisonUtil.compareXml
import static com.octo.keip.flow.xml.XmlComparisonUtil.readTestXml

// TODO: Validate against spring integration XSDs
class EndToEndTest extends Specification {
    private static final List<NamespaceSpec> NAMESPACES = [new NamespaceSpec("integration", "http://www.springframework.org/schema/integration", "https://www.springframework.org/schema/integration/spring-integration.xsd"),
                                                           new NamespaceSpec("jms", "http://www.springframework.org/schema/integration/jms", "https://www.springframework.org/schema/integration/jms/spring-integration-jms.xsd")
    ]

    def "End-to-end flow to spring-integration xml"() {
        given:
        def flowTransformer = new SpringIntegrationFlowTransformer(NAMESPACES)

        when:
        def output = new StringWriter()
        flowTransformer.toXml(getFlowJson(), output)

        then:
        compareXml(output.toString(), readTestXml("end-to-end-spring-integration.xml"))
    }

    def "Verify error listener is set and called on node transformation error"() {
        given:
        def flowTransformer = new SpringIntegrationFlowTransformer(NAMESPACES)
        ErrorListener errorListener = Mock()
        NodeTransformer exceptionalTransformer = Stub() {
            apply(_, _) >> { throw new RuntimeException("faulty transformer") }
        }

        def adapterId = new EipId("integration", "inbound-channel-adapter")
        flowTransformer.registerNodeTransformer(adapterId, exceptionalTransformer)
        flowTransformer.setErrorListener(errorListener)

        when:
        def output = new StringWriter()
        flowTransformer.toXml(getFlowJson(), output)

        then:
        1 * errorListener.error(_)
    }

    static BufferedReader getFlowJson() {
        Path path = Path.of("json").resolve("flowGraph.json")
        return EndToEndTest.class.getClassLoader().getResource(path.toString()).newReader()
    }
}
