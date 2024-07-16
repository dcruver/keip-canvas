package com.octo.keip.flow;

import java.io.Reader;
import java.io.Writer;
import javax.xml.transform.ErrorListener;
import javax.xml.transform.TransformerException;

/** Implementations of this interface transform a JSON representation of an EIP flow to an XML. */
public interface FlowTransformer {

  /**
   * @param flowJson The JSON flow input to transform.
   * @param outputXml The result of the transformation.
   * @throws TransformerException thrown only if an unrecoverable error occurs, otherwise errors are
   *     delegated to the error listener.
   */
  void toXml(Reader flowJson, Writer outputXml) throws TransformerException;

  /**
   * Set the error listener to be used by the transformer.
   *
   * @param listener the error listener
   */
  void setErrorListener(ErrorListener listener);
}
