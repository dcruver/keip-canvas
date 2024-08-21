package com.octo.keip.flow.web.cors;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "web.cors")
public record CorsProps(String[] allowedOrigins, String[] allowedMethods) {}
