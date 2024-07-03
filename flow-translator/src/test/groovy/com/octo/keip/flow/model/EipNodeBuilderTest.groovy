package com.octo.keip.flow.model

import spock.lang.Specification;

class EipNodeBuilderTest extends Specification {

    def "minimal EipNode"() {
        given:
        def id = "abc"
        def eipId = new EipId("test", "first")
        def role = Role.TRANSFORMER
        def connection = ConnectionType.PASSTHRU
        def node = EipNode.builder().id(id).eipId(eipId).role(role).connectionType(connection).build()

        expect:
        node.id() == id
        node.eipId() == eipId
        node.role() == role
        node.connectionType() == connection
        node.label() == null
        node.description() == null
        node.attributes().isEmpty()
        node.children().isEmpty()
    }

    def "fully specified EipNode"() {
        given:
        def id = "abc"
        def eipId = new EipId("test", "first")
        def role = Role.TRANSFORMER
        def connection = ConnectionType.PASSTHRU
        def label = "testlabel"
        def description = "testdescription"
        def attributes = ["a1": "aVal"]
        def children = [new EipChild("testchild", null, null)]
        def node = EipNode.builder()
                .id(id)
                .eipId(eipId)
                .role(role)
                .connectionType(connection)
                .label(label)
                .description(description)
                .attributes(attributes)
                .children(children)
                .build()

        expect:
        node.id() == id
        node.eipId() == eipId
        node.role() == role
        node.connectionType() == connection
        node.label() == label
        node.description() == description
        node.attributes() == attributes
        node.children() == children
    }
}
