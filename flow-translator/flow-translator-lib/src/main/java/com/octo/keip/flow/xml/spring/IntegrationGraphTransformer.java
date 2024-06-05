package com.octo.keip.flow.xml.spring;

import com.octo.keip.flow.xml.GraphTransformer;
import com.octo.keip.flow.xml.NamespaceSpec;
import com.octo.keip.flow.xml.NodeTransformerFactory;
import java.util.Collection;
import javax.xml.namespace.QName;

public final class IntegrationGraphTransformer extends GraphTransformer {

  private static final String DEFAULT_XML_NAMESPACE = "http://www.springframework.org/schema/beans";
  private static final String DEFAULT_EIP_NAMESPACE = "beans";

  private static final String DEFAULT_NS_SCHEMA_LOCATION =
      "https://www.springframework.org/schema/beans/spring-beans.xsd";

  public IntegrationGraphTransformer(Collection<NamespaceSpec> namespaceSpecs) {
    super(new NodeTransformerFactory(new DefaultNodeTransformer()), namespaceSpecs);
  }

  @Override
  protected NamespaceSpec defaultNamespace() {
    return new NamespaceSpec(
        DEFAULT_EIP_NAMESPACE, DEFAULT_XML_NAMESPACE, DEFAULT_NS_SCHEMA_LOCATION);
  }

  @Override
  protected QName rootElement() {
    return new QName(DEFAULT_XML_NAMESPACE, DEFAULT_EIP_NAMESPACE);
  }
}
