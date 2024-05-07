package com.octo.keip.schema.client

import org.apache.ws.commons.schema.XmlSchemaCollection
import spock.lang.Shared
import spock.lang.Specification
import spock.lang.TempDir
import spock.util.io.FileSystemFixture

import java.net.http.HttpClient
import java.net.http.HttpResponse
import java.nio.file.Path

import static org.apache.ws.commons.schema.XmlSchemaSerializer.XSD_NAMESPACE

class XmlSchemaHttpClientTest extends Specification {

    static final TARGET_NAMESPACE = "http://www.example.com/test-target"
    static final FIRST_NAMESPACE = "http://www.example.com/first"
    static final SECOND_NAMESPACE = "http://www.example.com/second"
    static final THIRD_NAMESPACE = "http://www.example.com/third"

    static final TARGET_URI = URI.create("http://localhost/test-target")

    @TempDir
    @Shared
    FileSystemFixture fsFixture

    Map<String, URI> userProvidedSchemaLocations = [
            (FIRST_NAMESPACE) : fsFixture.resolve("first.xsd").toUri(),
            (SECOND_NAMESPACE): fsFixture.resolve("second.xsd").toUri()
    ]

    HttpClient httpClient = mockHttpClient()

    def xmlSchemaClient = new XmlSchemaHttpClient(httpClient, userProvidedSchemaLocations)

    def setupSpec() {
        def XSD_PARENT_PATH = Path.of("/schemas", "xml", "http-client")
        fsFixture.create {
            copyFromClasspath(XSD_PARENT_PATH.resolve("first.xsd").toString())
            copyFromClasspath(XSD_PARENT_PATH.resolve("second.xsd").toString())
            copyFromClasspath(XSD_PARENT_PATH.resolve("third.xsd").toString())
            copyFromClasspath(XSD_PARENT_PATH.resolve("test-target.xsd").toString())
        }
    }

    def "Collect target and imported schemas success"() {
        when:
        def schemaCollection = xmlSchemaClient.collect(TARGET_NAMESPACE, TARGET_URI)

        then:
        def namespaces = getNamespaces(schemaCollection)
        namespaces ==~ [TARGET_NAMESPACE, FIRST_NAMESPACE, SECOND_NAMESPACE, THIRD_NAMESPACE, XSD_NAMESPACE]
    }

    def "Response from target-schema URI with error status code throws exception"() {
        given:
        def errorResponse = Mock(HttpResponse)
        errorResponse.statusCode() >> 404

        when:
        xmlSchemaClient.collect(TARGET_NAMESPACE, TARGET_URI)

        then:
        httpClient.send(_, _) >> errorResponse
        thrown(RuntimeException)
    }

    def "Target-schema request throws an exception, exception is uncaught"() {
        when:
        xmlSchemaClient.collect(TARGET_NAMESPACE, TARGET_URI)

        then:
        httpClient.send(_, _) >> { throw new ConnectException("server down") }
        thrown(ConnectException)
    }

    def "When an import location is not provided in the user-supplied locations map, ignore the missing URI and collect the rest"() {
        given:
        userProvidedSchemaLocations.remove(FIRST_NAMESPACE)

        when:
        def schemaCollection = xmlSchemaClient.collect(TARGET_NAMESPACE, TARGET_URI)

        then:
        def namespaces = getNamespaces(schemaCollection)
        namespaces ==~ [TARGET_NAMESPACE, SECOND_NAMESPACE, THIRD_NAMESPACE, XSD_NAMESPACE]
    }

    private HttpClient mockHttpClient() {
        HttpClient httpClient = Mock(HttpClient)
        httpClient.send(_, _) >>> [mockHttpResponse(), mockHttpResponse()]
        return httpClient
    }

    private HttpResponse<InputStream> mockHttpResponse() {
        HttpResponse<InputStream> schemaResponse = Mock(HttpResponse)
        schemaResponse.body() >> fsFixture.resolve("test-target.xsd").toFile().newInputStream()
        schemaResponse.statusCode() >> 200
        return schemaResponse
    }

    private static getNamespaces(XmlSchemaCollection schemaCollection) {
        return schemaCollection.getXmlSchemas().collect { it::getTargetNamespace() }
    }
}
