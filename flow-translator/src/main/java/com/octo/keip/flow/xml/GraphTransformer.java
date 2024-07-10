package com.octo.keip.flow.xml;

import com.ctc.wstx.stax.WstxEventFactory;
import com.ctc.wstx.stax.WstxOutputFactory;
import com.octo.keip.flow.model.EipGraph;
import com.octo.keip.flow.model.EipId;
import java.io.BufferedWriter;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.StringWriter;
import java.io.Writer;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.xml.XMLConstants;
import javax.xml.namespace.QName;
import javax.xml.stream.XMLEventFactory;
import javax.xml.stream.XMLEventWriter;
import javax.xml.stream.XMLOutputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.events.Attribute;
import javax.xml.stream.events.Namespace;
import javax.xml.stream.events.StartElement;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;

// TODO: Provide an option in the output indicating if the transformation encountered any errors.
public abstract class GraphTransformer {

  private final XMLEventFactory eventFactory = WstxEventFactory.newFactory();
  private final XMLOutputFactory outputFactory = WstxOutputFactory.newFactory();

  private static final String XSI_PREFIX = "xsi";

  // maps an eipNamespace to a NamespaceSpec
  private final Map<String, NamespaceSpec> registeredNamespaces;

  protected GraphTransformer(Collection<NamespaceSpec> namespaceSpecs) {
    this.registeredNamespaces = new HashMap<>();
    this.registeredNamespaces.put(defaultNamespace().eipNamespace(), defaultNamespace());
    namespaceSpecs.forEach(s -> this.registeredNamespaces.put(s.eipNamespace(), s));
  }

  public final void registerNamespace(
      String eipNamespace, String xmlNamespace, String schemaLocation) {
    this.registeredNamespaces.put(
        eipNamespace, new NamespaceSpec(eipNamespace, xmlNamespace, schemaLocation));
  }

  // TODO: Could potentially move Writer to ctor
  public final void toXml(EipGraph graph, Writer output) throws XMLStreamException {
    XMLEventWriter writer = outputFactory.createXMLEventWriter(output);
    writer.setDefaultNamespace(defaultNamespace().xmlNamespace());

    writer.add(eventFactory.createStartDocument());

    StartElement root = createRootElement(graph);
    writer.add(root);

    writeNodes(graph, writer);

    writer.add(eventFactory.createEndElement(root.getName(), null));

    writer.add(eventFactory.createEndDocument());

    writer.flush();
    writer.close();
  }

  public final String prettyPrintXml(EipGraph graph) throws TransformerException {
    try (var baos = new ByteArrayOutputStream();
        var writer = new BufferedWriter(new OutputStreamWriter(baos))) {
      toXml(graph, writer);
      return formatXml(baos);
    } catch (IOException | XMLStreamException e) {
      throw new TransformerException(e);
    }
  }

  protected abstract NamespaceSpec defaultNamespace();

  protected abstract QName rootElement();

  protected abstract NodeTransformer getTransformer(EipId id);

  private StartElement createRootElement(EipGraph graph) {
    List<String> eipNamespaces = collectEipNamespaces(graph);
    return eventFactory.createStartElement(
        rootElement(), getRootAttributes(eipNamespaces), getRootNamespaces(eipNamespaces));
  }

  /**
   * Does a first pass through the graph to collect all the included namespaces up-front, in order
   * to define them on the root element. If a node with an unregistered EIP namespace is
   * encountered, an exception is immediately thrown.
   *
   * <p>This approach forces us to do an extra traversal of the graph, so it might prove too
   * inefficient.
   */
  private List<String> collectEipNamespaces(EipGraph graph) {
    return graph
        .traverse()
        .map(
            n -> {
              String ns = n.eipId().namespace();
              if (!this.registeredNamespaces.containsKey(ns)) {
                throw new IllegalArgumentException(String.format("Unregistered namespace: %s", ns));
              }
              return ns;
            })
        .distinct()
        .toList();
  }

  private Iterator<Attribute> getRootAttributes(List<String> eipNamespaces) {
    Stream<String> defaultNamespaceLocation =
        Stream.of(defaultNamespace().xmlNamespace(), defaultNamespace().schemaLocation());
    Stream<String> collectedLocations =
        eipNamespaces.stream().flatMap(ns -> Stream.of(getXmlNamespace(ns), getSchemaLocation(ns)));

    // TODO: Figure out how to use line breaks as the separator
    String locString =
        Stream.concat(defaultNamespaceLocation, collectedLocations)
            .collect(Collectors.joining("\n"));

    return List.of(
            eventFactory.createAttribute(
                XSI_PREFIX,
                XMLConstants.W3C_XML_SCHEMA_INSTANCE_NS_URI,
                "schemaLocation",
                locString))
        .iterator();
  }

  private Iterator<Namespace> getRootNamespaces(List<String> eipNamespaces) {
    Namespace defaultNamespace =
        this.eventFactory.createNamespace(defaultNamespace().xmlNamespace());
    Namespace xsiNamespace =
        this.eventFactory.createNamespace(XSI_PREFIX, XMLConstants.W3C_XML_SCHEMA_INSTANCE_NS_URI);
    Stream<Namespace> collectedNamespaces =
        eipNamespaces.stream()
            .map(ns -> this.eventFactory.createNamespace(ns, getXmlNamespace(ns)));
    return Stream.concat(Stream.of(defaultNamespace, xsiNamespace), collectedNamespaces).iterator();
  }

  private void writeNodes(EipGraph graph, XMLEventWriter writer) {
    graph
        .traverse()
        .forEach(
            node -> {
              NodeTransformer transformer = getTransformer(node.eipId());
              // TODO: Wrap transformation call with a try-catch
              List<XmlElement> elements = transformer.apply(node, graph);
              elements.forEach(e -> writeElement(e, writer));
            });
  }

  private void writeElement(XmlElement element, XMLEventWriter writer) {
    try {
      writer.add(
          this.eventFactory.createStartElement(
              element.prefix(),
              getXmlNamespace(element.prefix()),
              element.localName(),
              attributeIterator(element.attributes()),
              null));

      for (XmlElement c : element.children()) {
        writeElement(c, writer);
      }

      writer.add(
          this.eventFactory.createEndElement(
              element.prefix(), getXmlNamespace(element.prefix()), element.localName()));
    } catch (XMLStreamException e) {
      throw new RuntimeException(e);
    }
  }

  private String getXmlNamespace(String eipNamespace) {
    NamespaceSpec spec = this.registeredNamespaces.get(eipNamespace);
    return spec == null ? null : spec.xmlNamespace();
  }

  private String getSchemaLocation(String eipNamespace) {
    NamespaceSpec spec = this.registeredNamespaces.get(eipNamespace);
    return spec == null ? null : spec.schemaLocation();
  }

  private Iterator<Attribute> attributeIterator(Map<String, Object> attributes) {
    return attributes.entrySet().stream()
        .map(e -> this.eventFactory.createAttribute(e.getKey(), e.getValue().toString()))
        .iterator();
  }

  private static String formatXml(ByteArrayOutputStream baos) throws TransformerException {
    TransformerFactory transformerFactory = TransformerFactory.newInstance();
    Transformer transformer = transformerFactory.newTransformer();

    // pretty print by indention
    transformer.setOutputProperty(OutputKeys.INDENT, "yes");
    // add standalone="yes", add line break before the root element
    transformer.setOutputProperty(OutputKeys.STANDALONE, "yes");

    var source = new StreamSource(new ByteArrayInputStream(baos.toByteArray()));
    var result = new StringWriter();
    transformer.transform(source, new StreamResult(result));
    return result.toString();
  }
}
