package com.octo.keip.flow;

import com.octo.keip.flow.dto.JsonDeserializer;
import com.octo.keip.flow.graph.GuavaGraph;
import com.octo.keip.flow.model.EipGraph;
import com.octo.keip.flow.model.EipId;
import com.octo.keip.flow.xml.GraphTransformer;
import com.octo.keip.flow.xml.NamespaceSpec;
import com.octo.keip.flow.xml.NodeTransformer;
import com.octo.keip.flow.xml.spring.IntegrationGraphTransformer;
import java.io.Reader;
import java.io.Writer;
import java.util.Collection;
import javax.xml.transform.ErrorListener;
import javax.xml.transform.TransformerException;

public final class SpringIntegrationFlowTransformer implements FlowTransformer {

  private final GraphTransformer graphTransformer;

  public SpringIntegrationFlowTransformer(Collection<NamespaceSpec> namespaceSpecs) {
    this.graphTransformer =
        new IntegrationGraphTransformer(namespaceSpecs, new DefaultErrorListener());
  }

  @Override
  public void toXml(Reader flowJson, Writer outputXml) throws TransformerException {
    EipGraph graph = GuavaGraph.from(JsonDeserializer.toFlow(flowJson));
    graphTransformer.toXml(graph, outputXml);
  }

  @Override
  public void setErrorListener(ErrorListener listener) {
    this.graphTransformer.setErrorListener(listener);
  }

  @Override
  public void registerNodeTransformer(EipId id, NodeTransformer transformer) {
    this.graphTransformer.registerNodeTransformer(id, transformer);
  }
}
