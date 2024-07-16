package com.octo.keip.flow.dto;

import com.octo.keip.flow.model.EipNode;
import java.util.List;

// TODO: Validate required fields. Might make sense to use JSON Schema validation for this.
public record Flow(List<EipNode> nodes, List<FlowEdge> edges) {}
