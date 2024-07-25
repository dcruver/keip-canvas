package com.octo.keip.flow;

import com.octo.keip.flow.error.TransformationError;
import com.octo.keip.flow.graph.GuavaGraph;
import com.octo.keip.flow.model.EipGraph;
import com.octo.keip.flow.model.EipId;
import com.octo.keip.flow.model.Flow;
import com.octo.keip.flow.xml.GraphTransformer;
import com.octo.keip.flow.xml.NamespaceSpec;
import com.octo.keip.flow.xml.NodeTransformer;
import com.octo.keip.flow.xml.spring.IntegrationGraphTransformer;
import java.io.Writer;
import java.util.Collection;
import java.util.List;
import javax.xml.transform.TransformerException;

public final class SpringIntegrationFlowTransformer implements FlowTransformer {

  private final GraphTransformer graphTransformer;

  public SpringIntegrationFlowTransformer(Collection<NamespaceSpec> namespaceSpecs) {
    this.graphTransformer = new IntegrationGraphTransformer(namespaceSpecs);
  }

  @Override
  public List<TransformationError> toXml(Flow flow, Writer outputXml) throws TransformerException {
    EipGraph graph = GuavaGraph.from(flow);
    return graphTransformer.toXml(graph, outputXml);
  }

  @Override
  public void registerNodeTransformer(EipId id, NodeTransformer transformer) {
    this.graphTransformer.registerNodeTransformer(id, transformer);
  }
}
