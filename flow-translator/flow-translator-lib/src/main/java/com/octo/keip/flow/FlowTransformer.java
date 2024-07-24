package com.octo.keip.flow;

import com.octo.keip.flow.dto.Flow;
import com.octo.keip.flow.model.EipId;
import com.octo.keip.flow.xml.NodeTransformer;
import java.io.Writer;
import javax.xml.transform.ErrorListener;
import javax.xml.transform.TransformerException;

/** Implementations of this interface transform a JSON representation of an EIP flow to an XML. */
public interface FlowTransformer {

  /**
   * @param flow The flow input to transform.
   * @param outputXml The result of the transformation.
   * @throws TransformerException thrown only if an unrecoverable error occurs, otherwise errors are
   *     delegated to the error listener.
   */
  void toXml(Flow flow, Writer outputXml) throws TransformerException;

  /**
   * Set the error listener to be used by the transformer.
   *
   * @param listener the error listener
   */
  void setErrorListener(ErrorListener listener);

  void registerNodeTransformer(EipId id, NodeTransformer transformer);
}
