package com.octo.keip.flow.model;

import com.octo.keip.flow.dto.FlowEdge;

// TODO: Not a big fan of the EdgeType. See if it can be improved/removed.
public record EdgeProps(String id, EdgeType type) {
  public enum EdgeType {
    DEFAULT,
    DISCARD;
  }

  public EdgeProps(String id) {
    this(id, EdgeType.DEFAULT);
  }

  public static EdgeProps from(FlowEdge edge) {
    return new EdgeProps(edge.id(), edge.sourceHandle());
  }
}
