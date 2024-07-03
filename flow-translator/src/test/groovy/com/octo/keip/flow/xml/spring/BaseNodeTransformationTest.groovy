package com.octo.keip.flow.xml.spring

import com.octo.keip.flow.model.EipChild
import com.octo.keip.flow.model.EipId
import com.octo.keip.flow.model.EipNode
import spock.lang.Specification

class BaseNodeTransformationTest extends Specification {

    def "single node to xml element"() {
        given:
        def ns = "test-ns"
        def name = "top"
        def node = EipNode.builder("1", new EipId(ns, name)).build()

        when:
        def element = BaseNodeTransformation.toXmlElement(node)

        then:
        element.prefix() == ns
        element.localName() == name
        element.attributes().isEmpty()
        element.children().isEmpty()
    }

    def "single node with attributes and children to xml element"() {
        given:
        def grandchildAttrs = ["deepest-attr": "val"]
        def grandchild = new EipChild("grandchild", grandchildAttrs, null)

        def childAttrs = ["child-attr1": "4"]
        def child = new EipChild("child", childAttrs, [grandchild])

        def ns = "test-ns"
        def name = "top"
        def topAttrs = ["attr1": "123", "attr2": "abc"]
        def node = EipNode.builder("1", new EipId(ns, name)).attributes(topAttrs).children([child]).build()

        when:
        def element = BaseNodeTransformation.toXmlElement(node)

        then:
        element.prefix() == ns
        element.localName() == name
        element.attributes() == topAttrs
        element.children().size() == 1

        def aChild = element.children()[0]
        aChild.prefix() == ns
        aChild.localName() == child.name()
        aChild.attributes() == childAttrs
        aChild.children().size() == 1

        def aGrandchild = aChild.children()[0]
        aGrandchild.prefix() == ns
        aGrandchild.localName() == grandchild.name()
        aGrandchild.attributes() == grandchildAttrs
        aGrandchild.children().isEmpty()
    }

    def "single node with multiple children to xml element"() {
        given:
        def childAttrs1 = ["attr1": "one"]
        def child1 = new EipChild("child1", childAttrs1, null)

        def childAttrs2 = ["attr2": "two"]
        def child2 = new EipChild("child2", childAttrs2, null)

        def ns = "test-ns"
        def name = "top"
        def node = EipNode.builder("1", new EipId(ns, name)).children([child1, child2]).build()

        when:
        def element = BaseNodeTransformation.toXmlElement(node)

        then:
        element.prefix() == ns
        element.localName() == name
        element.attributes().isEmpty()
        element.children().size() == 2

        def aChild1 = element.children()[0]
        aChild1.prefix() == ns
        aChild1.localName() == child1.name()
        aChild1.attributes() == childAttrs1
        aChild1.children().isEmpty()

        def aChild2 = element.children()[1]
        aChild2.prefix() == ns
        aChild2.localName() == child2.name()
        aChild2.attributes() == childAttrs2
        aChild2.children().isEmpty()
    }
}
