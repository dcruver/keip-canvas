package com.octo.keip.flow.model


import com.fasterxml.jackson.databind.cfg.EnumFeature
import com.fasterxml.jackson.databind.json.JsonMapper
import com.octo.keip.schemas.validation.EipSchema
import com.octo.keip.schemas.validation.EipSchemaValidator
import spock.lang.Specification

/**
 * Validates the {@link Flow} POJO against the externally defined EIP JSON schemas:
 * https://github.com/OctoConsulting/keip-canvas/tree/main/schemas/model/json/eipFlow.schema.json
 */
class FlowModelValidationTest extends Specification {

    private static final JsonMapper MAPPER =
            JsonMapper.builder()
                      .enable(EnumFeature.WRITE_ENUMS_TO_LOWERCASE)
                      .build();

    def validator = EipSchemaValidator.getInstance(EipSchema.FLOW)

    def "Fully specified Flow object passes schema validation"() {
        given:
        def child = new EipChild("c1", ["cKey1": "cVal1"], [])
        def node = new EipNode("n1",
                new EipId("test-ns", "test-comp"),
                "test-label",
                "test-description",
                Role.TRANSFORMER,
                ConnectionType.PASSTHRU,
                ["key1": "val1"],
                [child])

        def edge = new FlowEdge("e1", "n1", "n2")

        def flow = new Flow([node], [edge])
        when:
        def flowStr = MAPPER.writeValueAsString(flow)
        def errors = validator.validate(new StringReader(flowStr))
        then:
        errors.isEmpty()
    }
}
