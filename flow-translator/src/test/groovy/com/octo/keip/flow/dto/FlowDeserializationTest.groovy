package com.octo.keip.flow.dto

import com.fasterxml.jackson.databind.exc.InvalidFormatException
import spock.lang.Specification

import java.nio.file.Path

class FlowDeserializationTest extends Specification {

    def "Test Flow deserialization success"() {
        when:
        Flow flow = JsonDeserializer.toFlow(getFlowJson("flowGraph.json"))
        then:
        flow.nodes().get(0).id() == "vX7zM31DRi"
    }

    def "Test Flow deserialization throws exception on invalid json input"() {
        when:
        JsonDeserializer.toFlow(getFlowJson("flowGraph-invalid.json"))
        then:
        thrown(InvalidFormatException)
    }

    static BufferedReader getFlowJson(String filename) {
        Path path = Path.of("json").resolve(filename)
        return FlowDeserializationTest.class.getClassLoader()
                                      .getResource(path.toString())
                                      .newReader()
    }
}
