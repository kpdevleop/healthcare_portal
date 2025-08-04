// File: com/healthcare/config/OpenApiConfig.java
package com.healthcare.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

// This annotation defines the security scheme at the OpenAPI level.
@SecurityScheme(
    name = "bearerAuth", // The name of the security scheme, referenced later
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT"
)
@OpenAPIDefinition(
    info = @Info(
        title = "Healthcare API",
        version = "1.0",
        description = "API documentation for the Healthcare application"
    )
    // Removed global security requirement to allow public endpoints
)
@Configuration
public class OpenApiConfig {
    // This class is a configuration placeholder.
    // The annotations handle all the OpenAPI setup.
}
