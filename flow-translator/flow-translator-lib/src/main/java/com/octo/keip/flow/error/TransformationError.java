package com.octo.keip.flow.error;

public record TransformationError(String source, Exception exception) {}
