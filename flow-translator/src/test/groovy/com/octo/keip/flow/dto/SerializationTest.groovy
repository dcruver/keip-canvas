package com.octo.keip.flow.dto


import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.MapperFeature
import com.fasterxml.jackson.databind.json.JsonMapper
import spock.lang.Specification

import java.nio.file.Path

// TODO: Add more unit tests
class SerializationTest extends Specification {

    def "Test Serialization"() {
        when:
        Flow flow = JsonDeserializer.toFlow(getFlowJson())
        then:
        println flow
    }

    static BufferedReader getFlowJson() {
        Path path = Path.of("json").resolve("flowGraph.json")
        return SerializationTest.class.getClassLoader().getResource(path.toString()).newReader()
    }
}
