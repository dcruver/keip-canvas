package com.octo.keip.flow.dto

import spock.lang.Specification

class FlowValidationTest extends Specification {

    def validator = new FlowJsonValidator()

    def "Test validation success with valid flow JSON"() {
        given:
        Reader flowJson = FlowTestIO.readJson("flowGraph.json")
        when:
        def errors = validator.validate(flowJson)
        then:
        errors.isEmpty()
    }

    def "Test validation fails with invalid flow JSON"(String filename) {
        given:
        Reader flowJson = FlowTestIO.readJson(filename)
        when:
        def errors = validator.validate(flowJson)
        then: "validation is 'fail fast' by default"
        errors.size() == 1
        where:
        filename << ["flowGraph-invalid-multi-error.json", "flowGraph-invalid-role.json"]
    }

    def "Test validation with fails fast disabled -> fails with multiple errors"() {
        given:
        Reader flowJson = FlowTestIO.readJson("flowGraph-invalid-multi-error.json")
        when:
        def errors = validator.validate(flowJson, false)
        then: "validation is 'fail fast' by default"
        errors.size() == 3
    }
}
