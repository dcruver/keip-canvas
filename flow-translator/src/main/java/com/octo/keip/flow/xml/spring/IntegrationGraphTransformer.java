package com.octo.keip.flow.xml.spring;

import com.octo.keip.flow.model.EipId;
import com.octo.keip.flow.xml.GraphTransformer;
import com.octo.keip.flow.xml.NamespaceSpec;
import com.octo.keip.flow.xml.NodeTransformer;
import com.octo.keip.flow.xml.NodeTransformerFactory;
import java.util.Collection;
import java.util.Collections;
import javax.xml.namespace.QName;

public final class IntegrationGraphTransformer extends GraphTransformer {

  private static final String DEFAULT_XML_NAMESPACE = "http://www.springframework.org/schema/beans";
  private static final String DEFAULT_EIP_NAMESPACE = "beans";

  private static final String DEFAULT_NS_SCHEMA_LOCATION =
      "https://www.springframework.org/schema/beans/spring-beans.xsd";

  private final NodeTransformerFactory transformerFactory;

  public IntegrationGraphTransformer() {
    this(Collections.emptyList());
  }

  public IntegrationGraphTransformer(Collection<NamespaceSpec> namespaceSpecs) {
    super(namespaceSpecs);
    this.transformerFactory = new NodeTransformerFactory(new DefaultNodeTransformer());
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

  @Override
  protected NodeTransformer getTransformer(EipId id) {
    return this.transformerFactory.getTransformer(id);
  }
}
