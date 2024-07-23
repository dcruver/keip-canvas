package com.octo.keip.flow.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.networknt.schema.AbsoluteIri;
import com.networknt.schema.JsonSchema;
import com.networknt.schema.JsonSchemaFactory;
import com.networknt.schema.JsonSchemaFactory.Builder;
import com.networknt.schema.SchemaLocation;
import com.networknt.schema.SchemaValidatorsConfig;
import com.networknt.schema.SpecVersion.VersionFlag;
import com.networknt.schema.ValidationMessage;
import com.networknt.schema.resource.ClasspathSchemaLoader;
import com.networknt.schema.resource.DisallowSchemaLoader;
import com.networknt.schema.resource.SchemaMapper;
import java.io.IOException;
import java.io.Reader;
import java.util.Set;
import java.util.stream.Collectors;

/** Validates an EIP flow against the defined JSON schema. */
public final class FlowJsonValidator {

  private static final String SCHEMAS_PREFIX =
      "https://github.com/OctoConsulting/keip-canvas/schemas/";

  private final JsonSchema flowSchema;

  public FlowJsonValidator() {
    JsonSchemaFactory jsonSchemaFactory =
        JsonSchemaFactory.getInstance(VersionFlag.V7, this::configureFactoryBuilder);

    SchemaValidatorsConfig config = SchemaValidatorsConfig.builder().failFast(true).build();

    this.flowSchema =
        jsonSchemaFactory.getSchema(
            SchemaLocation.of(SCHEMAS_PREFIX + "eipFlow.schema.json"), config);

    // Eagerly check for $ref resolution errors
    this.flowSchema.initializeValidators();
  }

  /**
   * Validates a {@link Flow} JSON.
   *
   * @param flow the flow JSON
   * @return a collection of validation error messages. For a successful validation, an empty
   *     collection is returned.
   */
  public Set<String> validate(Reader flow) {
    JsonNode json = toJsonNode(flow);
    return toStrings(this.flowSchema.validate(json));
  }

  /**
   * Validates a {@link Flow} JSON. By default, the validation will
   *
   * @param flow the flow JSON
   * @param failFast
   * @return a collection of validation error messages. For a successful validation, an empty
   *     collection is returned.
   */
  public Set<String> validate(Reader flow, boolean failFast) {
    JsonNode json = toJsonNode(flow);
    return toStrings(
        this.flowSchema.validate(json, executionContext -> executionContext.setFailFast(failFast)));
  }

  private JsonNode toJsonNode(Reader r) {
    try {
      return JsonDeserializer.mapper.readTree(r);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  private Set<String> toStrings(Set<ValidationMessage> validationMessages) {
    return validationMessages.stream()
        .map(ValidationMessage::getMessage)
        .collect(Collectors.toSet());
  }

  /**
   * Configures the jsonSchemaFactory to use a version-less schema mapper and restricts the schema
   * retriever to the classpath (network requests are disabled).
   */
  private void configureFactoryBuilder(Builder builder) {
    builder
        .schemaMappers(sm -> sm.add(new VersionlessSchemaMapper()))
        .schemaLoaders(
            sl -> sl.add(new ClasspathSchemaLoader()).add(DisallowSchemaLoader.getInstance()));
  }

  /**
   * Enables loading JSON schemas from the classpath without needing to specify an explicit schema
   * version. Consequently, schema versions can be controlled solely through dependency management,
   * without requiring any code changes. However, this approach does restrict the validator to using
   * a single schema version.
   */
  private static class VersionlessSchemaMapper implements SchemaMapper {
    @Override
    public AbsoluteIri map(AbsoluteIri absoluteIri) {
      String iri = absoluteIri.toString();
      if (iri.startsWith(SCHEMAS_PREFIX) && iri.endsWith(".json")) {
        String[] parts = iri.split("/");
        return AbsoluteIri.of("classpath:schemas/").resolve(parts[parts.length - 1]);
      }
      return null;
    }
  }
}
