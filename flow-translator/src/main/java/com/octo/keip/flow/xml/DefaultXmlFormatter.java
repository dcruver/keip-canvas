package com.octo.keip.flow.xml;

import java.io.Reader;
import java.io.Writer;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;

// TODO: Test
public final class DefaultXmlFormatter {

  public static void formatXml(Reader input, Writer output) {
    TransformerFactory transformerFactory = TransformerFactory.newInstance();
    try {
      Transformer transformer = transformerFactory.newTransformer();
      // pretty print by indention
      transformer.setOutputProperty(OutputKeys.INDENT, "yes");
      // add standalone="yes", add line break before the root element
      transformer.setOutputProperty(OutputKeys.STANDALONE, "yes");
      transformer.transform(new StreamSource(input), new StreamResult(output));
    } catch (TransformerException e) {
      throw new RuntimeException(e);
    }
  }
}
