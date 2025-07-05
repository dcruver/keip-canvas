package org.codice.keip.flow.web.config;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import org.codice.keip.flow.xml.NamespaceSpec;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "keip")
@Validated
public record NamespaceProps(@NotEmpty List<NamespaceSpec> namespaceMappings) {}
