package com.octo.keip.flow;

import com.octo.keip.flow.error.TransformationError;
import com.octo.keip.flow.graph.GuavaGraph;
import com.octo.keip.flow.model.EipGraph;
import com.octo.keip.flow.model.EipId;
import com.octo.keip.flow.model.Flow;
import com.octo.keip.flow.xml.GraphTransformer;
import com.octo.keip.flow.xml.NodeTransformer;
import java.io.Writer;
import java.util.List;
import javax.xml.transform.TransformerException;

/** Transforms an EIP {@link Flow} to an XML document. */
public final class FlowTranslator {

  private final GraphTransformer graphTransformer;

  public FlowTranslator(GraphTransformer graphTransformer) {
    this.graphTransformer = graphTransformer;
  }

  /**
   * @param flow The flow input to transform.
   * @param outputXml The result of the transformation.
   * @return a collection of transformation error messages. An empty collection is returned for a
   *     successful transformation.
   * @throws TransformerException thrown only if an unrecoverable error occurs, otherwise errors are
   *     collected and returned once transformation is complete.
   */
  public List<TransformationError> toXml(Flow flow, Writer outputXml) throws TransformerException {
    EipGraph graph = GuavaGraph.from(flow);
    return graphTransformer.toXml(graph, outputXml);
  }

  /**
   * Register a custom {@link NodeTransformer}
   *
   * @param id EipId of the target node
   * @param transformer responsible for transforming the target node to an {@link
   *     com.octo.keip.flow.xml.XmlElement}
   */
  public void registerNodeTransformer(EipId id, NodeTransformer transformer) {
    this.graphTransformer.registerNodeTransformer(id, transformer);
  }
}
