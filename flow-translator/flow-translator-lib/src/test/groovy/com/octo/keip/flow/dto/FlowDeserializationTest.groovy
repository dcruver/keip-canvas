package com.octo.keip.flow.dto


import spock.lang.Specification

class FlowDeserializationTest extends Specification {

    def "Test Flow deserialization success"() {
        when:
        Flow flow = JsonDeserializer.toFlow(FlowTestIO.readJson("flowGraph.json"))
        then:
        flow.nodes().get(0).id() == "vX7zM31DRi"
    }

    def "Test Flow deserialization throws exception on invalid json input"() {
        when:
        JsonDeserializer.toFlow(FlowTestIO.readJson("flowGraph-invalid.json"))
        then:
        thrown(RuntimeException)
    }
}
