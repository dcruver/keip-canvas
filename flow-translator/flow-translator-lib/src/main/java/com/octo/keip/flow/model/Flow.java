package com.octo.keip.flow.model;

import java.util.List;

public record Flow(List<EipNode> nodes, List<FlowEdge> edges) {}
