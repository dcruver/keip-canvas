package com.octo.keip.flow.xml.spring

import com.octo.keip.flow.model.ConnectionType
import com.octo.keip.flow.model.EdgeProps
import com.octo.keip.flow.model.EipGraph
import com.octo.keip.flow.model.EipId
import com.octo.keip.flow.model.EipNode
import com.octo.keip.flow.model.Role
import spock.lang.Specification

import static com.octo.keip.flow.xml.spring.AttributeNames.ID
import static com.octo.keip.flow.xml.spring.DefaultNodeTransformer.DIRECT_CHANNEL

class DefaultNodeTransformerTest extends Specification {

    static final TEST_NS = "test-ns"

    EipGraph graph = Stub()

    DefaultNodeTransformer transformer = new DefaultNodeTransformer()

    EipNode testNode = createEipNode()

    def "multi-input node in graph fails validation"() {
        given:
        def pre1 = EipNode.builder()
                          .id("pre1")
                          .eipId(createEipId("first"))
                          .role(Role.TRANSFORMER)
                          .connectionType(ConnectionType.PASSTHRU)
                          .build()

        def pre2 = EipNode.builder()
                          .id("pre2")
                          .eipId(createEipId("second"))
                          .role(Role.TRANSFORMER)
                          .connectionType(ConnectionType.PASSTHRU)
                          .build()

        graph.predecessors(testNode) >> [pre1, pre2]
        graph.successors(testNode) >> []

        when:
        transformer.apply(testNode, graph)

        then:
        thrown(IllegalArgumentException)
    }

    def "multi-output node in graph fails validation"() {
        given:
        def post1 = EipNode.builder()
                           .id("post1")
                           .eipId(createEipId("first"))
                           .role(Role.TRANSFORMER)
                           .connectionType(ConnectionType.PASSTHRU)
                           .build()

        def post2 = EipNode.builder()
                           .id("post2")
                           .eipId(createEipId("second"))
                           .role(Role.TRANSFORMER)
                           .connectionType(ConnectionType.PASSTHRU)
                           .build()
        graph.predecessors(testNode) >> []
        graph.successors(testNode) >> [post1, post2]

        when:
        transformer.apply(testNode, graph)

        then:
        thrown(IllegalArgumentException)
    }

    // TODO: Fix
    def "nodes with a tee connection type are allowed an optional discard channel"() {
        given:
        def node = EipNode.builder()
                          .id("1")
                          .eipId(createEipId("main"))
                          .role(Role.ROUTER)
                          .connectionType(ConnectionType.TEE)
                          .build()

        def out = EipNode.builder()
                         .id("out")
                         .eipId(createEipId("target"))
                         .role(Role.TRANSFORMER)
                         .connectionType(ConnectionType.PASSTHRU)
                         .build()

        def discard = EipNode.builder()
                             .id("discard")
                             .eipId(createEipId("side"))
                             .role(Role.TRANSFORMER)
                             .connectionType(ConnectionType.PASSTHRU)
                             .build()
        graph.predecessors(node) >> []
        graph.successors(node) >> [out, discard]

        expect:
        transformer.apply(node, graph)
    }

    def "create intermediate channel between two non-channel nodes"() {
        given:
        def target = EipNode.builder()
                            .id("target")
                            .eipId(createEipId("target-comp"))
                            .role(Role.TRANSFORMER)
                            .connectionType(ConnectionType.PASSTHRU)
                            .build()

        graph.predecessors(testNode) >> []
        graph.successors(testNode) >> [target]
        def channelId = "chan1"
        graph.getEdgeProps(testNode, target) >> Optional.of(new EdgeProps(channelId))

        when:
        def transformation = new DefaultNodeTransformer.DefaultTransformation(testNode, graph)
        def elements = transformation.createDirectChannels()

        then:
        elements.size() == 1
        def channel = elements[0]
        channel.prefix() == DIRECT_CHANNEL.namespace()
        channel.localName() == DIRECT_CHANNEL.name()
        channel.attributes() == [(ID): channelId]
        channel.children().isEmpty()
    }

    def "No intermediate channel if source or target node is a 'channel' type component"(Role sourceRole, Role destRole) {
        given:
        def source = EipNode.builder()
                            .id("source")
                            .eipId(createEipId("test-source-comp"))
                            .role(sourceRole)
                            .connectionType(ConnectionType.PASSTHRU)
                            .build()

        def target = EipNode.builder()
                            .id("target")
                            .eipId(createEipId("test-target-comp"))
                            .role(destRole)
                            .connectionType(ConnectionType.PASSTHRU)
                            .build()

        graph.predecessors(source) >> []
        graph.successors(source) >> [target]

        when:
        def transformation = new DefaultNodeTransformer.DefaultTransformation(source, graph)
        def elements = transformation.createDirectChannels()

        then:
        elements.isEmpty()

        where:
        sourceRole   | destRole
        Role.CHANNEL | Role.ENDPOINT
        Role.ENDPOINT | Role.CHANNEL
        Role.CHANNEL | Role.CHANNEL
    }


    EipId createEipId(String name) {
        return new EipId(TEST_NS, name)
    }

    EipNode createEipNode() {
        return EipNode.builder()
                      .id("main")
                      .eipId(createEipId("main-component"))
                      .role(Role.TRANSFORMER)
                      .connectionType(ConnectionType.PASSTHRU)
                      .build()
    }
}
