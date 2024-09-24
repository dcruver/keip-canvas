package com.octo.keip.flow

import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.MapperFeature
import com.fasterxml.jackson.databind.json.JsonMapper
import com.octo.keip.flow.model.EipId
import com.octo.keip.flow.model.Flow
import com.octo.keip.flow.xml.NamespaceSpec
import com.octo.keip.flow.xml.NodeTransformer
import spock.lang.Specification

import java.nio.file.Path

import static com.octo.keip.flow.xml.XmlComparisonUtil.compareXml
import static com.octo.keip.flow.xml.XmlComparisonUtil.readTestXml

// TODO: Validate against spring integration XSDs
class FlowToSpringIntegrationTest extends Specification {
    private static final List<NamespaceSpec> NAMESPACES = [
            new NamespaceSpec("jms", "http://www.springframework.org/schema/integration/jms", "https://www.springframework.org/schema/integration/jms/spring-integration-jms.xsd"),
            new NamespaceSpec("http", "http://www.springframework.org/schema/integration/http", "https://www.springframework.org/schema/integration/http/spring-integration-http.xsd")
    ]

    private static final JsonMapper MAPPER =
            JsonMapper.builder()
                      .enable(MapperFeature.ACCEPT_CASE_INSENSITIVE_ENUMS)
                      .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                      .build();

    def flowTransformer = new SpringIntegrationFlowTransformer(NAMESPACES)

    def "End-to-end basic flow to spring-integration xml"(String flowFile, String xmlFile) {
        given:
        def flow = MAPPER.readValue(getFlowJson(flowFile), Flow.class)

        when:
        def output = new StringWriter()
        def errors = flowTransformer.toXml(flow, output)

        then:
        errors.isEmpty()
        compareXml(output.toString(), readTestXml(xmlFile))

        where:
        flowFile          | xmlFile
        "flowGraph1.json" | Path.of("end-to-end", "spring-integration-1.xml").toString()
        "flowGraph2.json" | Path.of("end-to-end", "spring-integration-2.xml").toString()
        "flowGraph3.json" | Path.of("end-to-end", "spring-integration-3.xml").toString()
    }

    def "Verify transformation error list is populated on node transformation error"() {
        given:
        def flow = MAPPER.readValue(getFlowJson("flowGraph1.json"), Flow.class)

        NodeTransformer exceptionalTransformer = Stub() {
            apply(_, _) >> { throw new RuntimeException("faulty transformer") }
        }


        def adapterId = new EipId("integration", "inbound-channel-adapter")
        flowTransformer.registerNodeTransformer(adapterId, exceptionalTransformer)

        when:
        def output = new StringWriter()
        def errors = flowTransformer.toXml(flow, output)

        then:
        errors.size() == 1
    }

    static BufferedReader getFlowJson(String filename) {
        Path path = Path.of("json").resolve(filename)
        return FlowToSpringIntegrationTest.class
                                          .getClassLoader()
                                          .getResource(path.toString())
                                          .newReader()
    }
}
