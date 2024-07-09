package com.octo.keip.flow.xml.spring

import com.octo.keip.flow.model.EipGraph
import com.octo.keip.flow.xml.NamespaceSpec
import org.xmlunit.builder.DiffBuilder
import spock.lang.Specification

import java.nio.file.Path

class IntegrationGraphTransformerTest extends Specification {

    private static final NAMESPACES = [new NamespaceSpec("integration", "http://www.springframework.org/schema/integration", "https://www.springframework.org/schema/integration/spring-integration.xsds"),
                                       new NamespaceSpec("jms", "http://www.springframework.org/schema/integration/jms", "https://www.springframework.org/schema/integration/jms/spring-integration-jms.xsd")
    ]


    EipGraph graph = Stub()

    def graphTransformer = new IntegrationGraphTransformer(NAMESPACES)

    def "transform empty graph. Check root element"() {
        given:
        def xml = graphTransformer.prettyPrintXml(graph)

        expect:
        compareXml(xml, readTestXml("empty.xml"))
    }

    private static void compareXml(Object actual, Object expected) {
        def diff = DiffBuilder.compare(expected)
                              .withTest(actual)
                              .checkForIdentical()
                              .ignoreWhitespace()
                              .normalizeWhitespace()
                              .build()

        assert !diff.hasDifferences()
    }

    private static InputStream readTestXml(String filename) {
        Path path = Path.of("xml").resolve(filename)
        return IntegrationGraphTransformerTest.class.getClassLoader()
                                              .getResourceAsStream(path.toString())
    }
}
