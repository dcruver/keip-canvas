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

  public interface IdStep {
    EipIdStep id(String id);
  }

  public interface EipIdStep {
    RoleStep eipId(EipId eipId);
  }

  public interface RoleStep {
    ConnectionTypeStep role(Role role);
  }

  public interface ConnectionTypeStep {
    Build connectionType(ConnectionType connectionType);
  }

  public interface Build {
    EipNode build();

    Build label(String label);

    Build description(String description);

    Build attributes(Map<String, Object> attributes);

    Build children(List<EipChild> children);
  }

  public static IdStep builder() {
    return new Builder();
  }

  public static class Builder implements Build, IdStep, EipIdStep, RoleStep, ConnectionTypeStep {
    private String id;
    private EipId eipId;
    private String label;
    private String description;
    private Role role;
    private ConnectionType connectionType;
    private Map<String, Object> attributes;
    private List<EipChild> children;

    private Builder() {}

    public EipNode build() {
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

    @Override
    public EipIdStep id(String id) {
      this.id = id;
      return this;
    }

    @Override
    public RoleStep eipId(EipId eipId) {
      this.eipId = eipId;
      return this;
    }

    @Override
    public ConnectionTypeStep role(Role role) {
      this.role = role;
      return this;
    }

    @Override
    public Build connectionType(ConnectionType connectionType) {
      this.connectionType = connectionType;
      return this;
    }

    @Override
    public Build label(String label) {
      this.label = label;
      return this;
    }

    @Override
    public Build description(String description) {
      this.description = description;
      return this;
    }

    @Override
    public Build attributes(Map<String, Object> attributes) {
      this.attributes = attributes;
      return this;
    }

    @Override
    public Build children(List<EipChild> children) {
      this.children = children;
      return this;
    }
  }
}
