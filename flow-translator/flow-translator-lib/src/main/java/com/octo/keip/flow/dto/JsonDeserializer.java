package com.octo.keip.flow.dto;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.json.JsonMapper;
import java.io.IOException;
import java.io.Reader;

public final class JsonDeserializer {
  static final JsonMapper mapper =
      JsonMapper.builder()
          .enable(MapperFeature.ACCEPT_CASE_INSENSITIVE_ENUMS)
          .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
          .build();

  public static Flow toFlow(Reader flowJson) {
    try {
      return mapper.readValue(flowJson, Flow.class);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }
}
