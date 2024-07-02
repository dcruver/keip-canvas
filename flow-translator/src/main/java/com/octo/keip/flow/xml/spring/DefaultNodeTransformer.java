package com.octo.keip.flow.xml.spring;

import static com.octo.keip.flow.xml.spring.AttributeNames.CHANNEL;
import static com.octo.keip.flow.xml.spring.AttributeNames.DISCARD_CHANNEL;
import static com.octo.keip.flow.xml.spring.AttributeNames.ID;
import static com.octo.keip.flow.xml.spring.AttributeNames.INPUT_CHANNEL;
import static com.octo.keip.flow.xml.spring.AttributeNames.OUTPUT_CHANNEL;

import com.octo.keip.flow.model.ConnectionType;
import com.octo.keip.flow.model.EdgeProps;
import com.octo.keip.flow.model.EdgeProps.EdgeType;
import com.octo.keip.flow.model.EipGraph;
import com.octo.keip.flow.model.EipId;
import com.octo.keip.flow.model.EipNode;
import com.octo.keip.flow.model.Role;
import com.octo.keip.flow.xml.NodeTransformer;
import com.octo.keip.flow.xml.XmlElement;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

// TODO: Add some explanatory docs here.
// TODO: Handle explicit connections to channel components
public class DefaultNodeTransformer implements NodeTransformer {

  private static final EipId DIRECT_CHANNEL = new EipId("integration", "channel");

  @Override
  public List<XmlElement> apply(EipNode node, EipGraph graph) {
    if (!validate(node, graph.predecessors(node), graph.successors(node))) {
      throw new IllegalArgumentException(
          "The default node to xml transformer only handles single input/output components");
    }

    XmlElement element = BaseNodeTransformation.toXmlElement(node);
    DefaultTransformation transformation = new DefaultTransformation(node, graph);
    element = transformation.updateAttributes(element);

    List<XmlElement> elements = new ArrayList<>();
    elements.add(element);
    elements.addAll(transformation.createAdditionalElements());
    return elements;
  }

  private record DefaultTransformation(EipNode node, EipGraph graph) {

    public XmlElement updateAttributes(XmlElement element) {
      Map<String, Object> updatedAttrs = new LinkedHashMap<>();
      updatedAttrs.put(ID, this.node.id());
      addChannelAttributes(updatedAttrs);
      updatedAttrs.putAll(element.attributes());
      return new XmlElement(
          element.prefix(), element.localName(), updatedAttrs, element.children());
    }

    public List<XmlElement> createAdditionalElements() {
      if (Role.CHANNEL.equals(this.node.role())) {
        return Collections.emptyList();
      }

      // Create downstream channels
      return this.graph.successors(this.node).stream()
          .map(s -> getChannelId(this.node, s))
          .map(
              channelId ->
                  new XmlElement(
                      DIRECT_CHANNEL.namespace(),
                      DIRECT_CHANNEL.name(),
                      Map.of(ID, channelId),
                      Collections.emptyList()))
          .toList();
    }

    private void addChannelAttributes(Map<String, Object> attributes) {
      if (Role.CHANNEL.equals(this.node.role())) {
        return;
      }
      Optional<EipNode> predecessor = this.graph.predecessors(this.node).stream().findFirst();
      Optional<EipNode> successor = this.graph.successors(this.node).stream().findFirst();

      switch (this.node.connectionType()) {
        case PASSTHRU -> {
          predecessor.ifPresent(p -> attributes.put(INPUT_CHANNEL, getChannelId(p, this.node)));
          successor.ifPresent(s -> attributes.put(OUTPUT_CHANNEL, getChannelId(this.node, s)));
        }
        case SINK ->
            predecessor.ifPresent(p -> attributes.put(CHANNEL, getChannelId(p, this.node)));
        case SOURCE ->
            successor.ifPresent(s -> attributes.put(CHANNEL, getChannelId(this.node, s)));
        case TEE -> {
          // Assumes exactly two successors - an output-channel and a discard-channel
          predecessor.ifPresent(p -> attributes.put(INPUT_CHANNEL, getChannelId(p, this.node)));
          attributes.putAll(getTeeOutgoingChannelAttrs());
        }
        default ->
            throw new IllegalStateException(
                "Unexpected connectionType: " + this.node.connectionType());
      }
    }

    private Map<String, Object> getTeeOutgoingChannelAttrs() {
      LinkedHashMap<String, Object> map = new LinkedHashMap<>();
      for (EipNode successor : this.graph.successors(this.node)) {
        EdgeType type =
            this.graph
                .getEdgeProps(this.node, successor)
                .map(EdgeProps::type)
                .orElse(EdgeType.DEFAULT);
        if (type.equals(EdgeType.DISCARD)) {
          map.put(DISCARD_CHANNEL, getChannelId(this.node, successor));
        } else {
          map.put(OUTPUT_CHANNEL, getChannelId(this.node, successor));
        }
      }
      return map;
    }

    // TODO: Might be used by other transformers. Consider extracting.
    public String getChannelId(EipNode source, EipNode target) {
      if (Role.CHANNEL.equals(source.role())) {
        return source.id();
      } else if (Role.CHANNEL.equals(target.role())) {
        return target.id();
      } else {
        return this.graph.getEdgeProps(source, target).map(EdgeProps::id).orElseThrow();
      }
    }
  }

  // This transformer handles components with at most a single input and a single output, with an
  // optional discard channel.
  private boolean validate(EipNode node, Set<EipNode> predecessors, Set<EipNode> successors) {
    boolean atMostOnePredecessor = predecessors.size() <= 1;
    boolean atMostOneSuccessor = successors.size() <= 1;

    if (ConnectionType.TEE.equals(node.connectionType())) {
      return atMostOnePredecessor && successors.size() <= 2;
    }
    return atMostOnePredecessor && atMostOneSuccessor;
  }
}
