package com.octo.keip.flow.model;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;

// Represents a specific instantiation of an EIP component in the graph (e.g. a message filter or
// router). Ids must be unique across the flow graph.

public record EipNode(
    String id,
    EipId eipId,
    String label,
    String description,
    // TODO: Should FlowType and Role be stored elsewhere and looked up with eipId
    Role role,
    ConnectionType connectionType,
    Map<String, Object> attributes,
    List<EipChild> children) {

  @Override
  public Map<String, Object> attributes() {
    if (attributes == null) {
      return Collections.emptyMap();
    }
    return Collections.unmodifiableMap(attributes);
  }

  @Override
  public List<EipChild> children() {
    if (children == null) {
      return Collections.emptyList();
    }
    return Collections.unmodifiableList(children);
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (!(o instanceof EipNode eipNode)) {
      return false;
    }
    return Objects.equals(id, eipNode.id);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }

  @Override
  public String toString() {
    return id;
  }

  public static EipNodeBuilder builder(String id, EipId eipId) {
    EipNodeBuilder builder = new EipNodeBuilder();
    return builder.id(id).eipId(eipId);
  }

  public static class EipNodeBuilder {
    private String id;
    private EipId eipId;
    private String label;
    private String description;
    private Role role;
    private ConnectionType connectionType;
    private Map<String, Object> attributes;
    private List<EipChild> children;

    private EipNodeBuilder() {}

    public EipNodeBuilder id(String id) {
      this.id = id;
      return this;
    }

    public EipNodeBuilder eipId(EipId eipId) {
      this.eipId = eipId;
      return this;
    }

    public EipNodeBuilder label(String label) {
      this.label = label;
      return this;
    }

    public EipNodeBuilder description(String description) {
      this.description = description;
      return this;
    }

    public EipNodeBuilder role(Role role) {
      this.role = role;
      return this;
    }

    public EipNodeBuilder connectionType(ConnectionType connectionType) {
      this.connectionType = connectionType;
      return this;
    }

    public EipNodeBuilder attributes(Map<String, Object> attributes) {
      this.attributes = attributes;
      return this;
    }

    public EipNodeBuilder children(List<EipChild> children) {
      this.children = children;
      return this;
    }

    public EipNode build() {
      if (this.id == null || this.id.isBlank() || this.eipId == null) {
        throw new IllegalArgumentException("Both 'id' and 'eipId' fields must be defined");
      }

      Map<String, Object> wrappedAttributes =
          this.attributes == null
              ? Collections.emptyMap()
              : Collections.unmodifiableMap(this.attributes);

      List<EipChild> wrappedChildren =
          this.children == null
              ? Collections.emptyList()
              : Collections.unmodifiableList(this.children);

      return new EipNode(
          id, eipId, label, description, role, connectionType, wrappedAttributes, wrappedChildren);
    }
  }
}
