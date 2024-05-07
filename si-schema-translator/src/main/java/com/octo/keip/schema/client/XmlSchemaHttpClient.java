package com.octo.keip.schema.client;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.time.Duration;
import java.util.Map;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import org.apache.ws.commons.schema.XmlSchemaCollection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

/** Fetches remote XML schemas using HTTP and read them into an {@link XmlSchemaCollection}. */
public class XmlSchemaHttpClient implements XmlSchemaClient {

  private static final Logger LOGGER = LoggerFactory.getLogger(XmlSchemaHttpClient.class);

  private static final Duration CONNECTION_TIMEOUT = Duration.ofSeconds(20);
  private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(20);

  private final Map<String, URI> customSchemaLocations;

  private final HttpClient httpClient;

  public XmlSchemaHttpClient(Map<String, URI> customSchemaLocations) {
    this.customSchemaLocations = customSchemaLocations;
    this.httpClient = HttpClient.newBuilder().connectTimeout(CONNECTION_TIMEOUT).build();
  }

  XmlSchemaHttpClient(HttpClient httpClient, Map<String, URI> customSchemaLocations) {
    this.customSchemaLocations = customSchemaLocations;
    this.httpClient = httpClient;
  }

  @Override
  public XmlSchemaCollection collect(String targetNamespace, URI schemaLocation)
      throws IOException, InterruptedException {
    LOGGER.info("Fetching target schema xml at: {}", schemaLocation);

    HttpRequest request =
        HttpRequest.newBuilder().uri(schemaLocation).timeout(REQUEST_TIMEOUT).GET().build();

    HttpResponse<InputStream> response = httpClient.send(request, BodyHandlers.ofInputStream());
    if (response.statusCode() == 200) {
      var schemaCollection = new XmlSchemaCollection();
      try (var inputStream = response.body()) {
        Document doc = toDomDocument(inputStream);
        overwriteSchemaLocations(doc);
        schemaCollection.read(doc);
        return schemaCollection;
      } catch (ParserConfigurationException | SAXException e) {
        throw new RuntimeException(e);
      }
    }

    LOGGER.error("Response code: {}", response.statusCode());
    throw new RuntimeException("Failed to retrieve the target schema");
  }

  private Document toDomDocument(InputStream xmlStream)
      throws ParserConfigurationException, IOException, SAXException {
    DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
    dbf.setNamespaceAware(true);
    DocumentBuilder builder = dbf.newDocumentBuilder();
    return builder.parse(xmlStream);
  }

  /**
   * Search all import elements in the schema and update any namespaces found in the {@link
   * #customSchemaLocations} map to point to the custom schemaLocation.
   */
  private void overwriteSchemaLocations(Document doc) {
    NodeList importedNodes =
        doc.getElementsByTagNameNS("http://www.w3.org/2001/XMLSchema", "import");
    for (int i = 0; i < importedNodes.getLength(); i++) {
      Node node = importedNodes.item(i);
      if (node.getNodeType() == Node.ELEMENT_NODE) {
        Element el = (Element) node;
        URI schemaLocation = this.customSchemaLocations.get(el.getAttribute("namespace"));
        if (schemaLocation != null) {
          el.setAttribute("schemaLocation", schemaLocation.toString());
        }
      }
    }
  }
}
