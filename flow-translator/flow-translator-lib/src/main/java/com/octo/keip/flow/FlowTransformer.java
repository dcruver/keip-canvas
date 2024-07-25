package com.octo.keip.flow;

import com.octo.keip.flow.error.TransformationError;
import com.octo.keip.flow.model.EipId;
import com.octo.keip.flow.model.Flow;
import com.octo.keip.flow.xml.NodeTransformer;
import java.io.Writer;
import java.util.List;
import javax.xml.transform.TransformerException;

/** Implementations of this interface transform a JSON representation of an EIP flow to an XML. */
public interface FlowTransformer {

  /**
   * @param flow The flow input to transform.
   * @param outputXml The result of the transformation.
   * @return a collection of transformation error messages. An empty collection is returned for a
   *     successful transformation.
   * @throws TransformerException thrown only if an unrecoverable error occurs, otherwise errors are
   *     collected and returned once transformation is complete.
   */
  List<TransformationError> toXml(Flow flow, Writer outputXml) throws TransformerException;

  void registerNodeTransformer(EipId id, NodeTransformer transformer);
}
