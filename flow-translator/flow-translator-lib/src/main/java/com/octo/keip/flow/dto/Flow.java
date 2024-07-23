package com.octo.keip.flow.dto;

import com.octo.keip.flow.model.EipNode;
import java.util.List;

public record Flow(List<EipNode> nodes, List<FlowEdge> edges) {}
