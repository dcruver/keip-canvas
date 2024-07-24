package com.octo.keip.flow


import spock.lang.Specification

import java.nio.file.Path

class FlowValidationTest extends Specification {

    def validator = new FlowJsonValidator()

    def "Test validation success with valid flow JSON"() {
        given:
        Reader flowJson = readJson("flowGraph.json")
        when:
        def errors = validator.validate(flowJson)
        then:
        errors.isEmpty()
    }

    def "Test validation fails with invalid flow JSON"() {
        given:
        Reader flowJson = readJson("flowGraph-invalid-multi-error.json")
        when:
        def errors = validator.validate(flowJson)
        then: "validation is 'fail fast' by default"
        errors.size() == 1
    }

    def "Test validation with fails fast disabled -> fails with multiple errors"() {
        given:
        Reader flowJson = readJson("flowGraph-invalid-multi-error.json")
        when:
        def errors = validator.validate(flowJson, false)
        then: "validation is 'fail fast' by default"
        errors.size() == 3
    }

    static BufferedReader readJson(String filename) {
        Path path = Path.of("json").resolve(filename)
        return FlowValidationTest.class.getClassLoader()
                                 .getResource(path.toString())
                                 .newReader()
    }
}
