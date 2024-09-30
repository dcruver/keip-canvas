package com.octo.keip.flow.web.config;

import com.octo.keip.flow.FlowTranslator;
import com.octo.keip.flow.xml.GraphTransformer;
import com.octo.keip.flow.xml.spring.IntegrationGraphTransformer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlowTranslatorConfig {

  private final NamespaceProps namespaceProps;

  public FlowTranslatorConfig(NamespaceProps namespaceProps) {
    this.namespaceProps = namespaceProps;
  }

  @Bean
  public FlowTranslator springIntegrationFlowTranslator() {
    GraphTransformer integrationTransformer =
        new IntegrationGraphTransformer(this.namespaceProps.namespaceMappings());
    return new FlowTranslator(integrationTransformer);
  }
}
