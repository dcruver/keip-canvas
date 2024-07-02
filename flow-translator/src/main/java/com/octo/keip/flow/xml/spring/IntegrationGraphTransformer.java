package com.octo.keip.flow.xml.spring;

import com.octo.keip.flow.model.EipId;
import com.octo.keip.flow.xml.GraphTransformer;
import com.octo.keip.flow.xml.NodeTransformer;
import com.octo.keip.flow.xml.NodeTransformerFactory;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import javax.xml.namespace.QName;

public class IntegrationGraphTransformer extends GraphTransformer {

  private static final String DEFAULT_NAMESPACE = "http://www.springframework.org/schema/beans";

  private static final URI BASE_SCHEMA_LOCATION =
      URI.create("https://www.springframework.org/schema/integration/");

  private final NodeTransformerFactory transformerFactory;

  private final Map<String, String> prefixToNamespace;

  public IntegrationGraphTransformer() {
    this(new HashMap<>());
  }

  public IntegrationGraphTransformer(Map<String, String> prefixToNamespace) {
    this.transformerFactory = new NodeTransformerFactory(new DefaultNodeTransformer());
    this.prefixToNamespace = prefixToNamespace;
  }

  @Override
  protected String defaultNamespace() {
    return DEFAULT_NAMESPACE;
  }

  @Override
  protected QName rootElement() {
    return new QName(DEFAULT_NAMESPACE, "beans");
  }

  @Override
  protected NodeTransformer getTransformer(EipId id) {
    return this.transformerFactory.getTransformer(id);
  }

  @Override
  protected String getNamespace(String prefix) {
    return this.prefixToNamespace.get(prefix);
  }

  @Override
  protected String getSchemaLocation(String namespaceUri) {
    String path =
        ("integration".equals(namespaceUri))
            ? "spring-integration.xsd"
            : String.format("%s/spring-integration-%s.xsd", namespaceUri, namespaceUri);
    return BASE_SCHEMA_LOCATION.resolve(path).toString();
  }

  public void addPrefixMapping(String prefix, String namespace) {
    this.prefixToNamespace.put(prefix, namespace);
  }
}
