// File: com/healthcare/security/SecurityConfig.java
package com.healthcare.security; // Make sure this package matches your actual project structure

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// New CORS-related imports
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays; // Needed for Arrays.asList()

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // Ensure method-level security is enabled
public class SecurityConfig {

    private final JwtRequestFilter jwtRequestFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    public SecurityConfig(JwtRequestFilter jwtRequestFilter, JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint) {
        this.jwtRequestFilter = jwtRequestFilter;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF for stateless REST APIs
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Use stateless sessions for JWT
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll() // Allow unauthenticated access to auth endpoints
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll() // Allow Swagger UI
                .requestMatchers("/api/departments/**").authenticated() // Require authentication for all department endpoints
                .requestMatchers("/api/doctor-schedules/**").authenticated() // Allows authenticated access to all doctor schedule endpoints
                .requestMatchers("/api/appointments/**").authenticated() // Require authentication for all appointment endpoints
                .requestMatchers("/api/medical-records/**").authenticated() // Require authentication for all medical record endpoints
                .requestMatchers("/api/feedback/**").authenticated() // Require authentication for all feedback endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN") // Admin-only endpoints
                .requestMatchers("/api/doctor/**").hasAnyRole("ADMIN", "DOCTOR") // Doctor and admin endpoints
                .requestMatchers("/api/patient/**").hasAnyRole("ADMIN", "DOCTOR", "PATIENT") // Patient endpoints
                .anyRequest().authenticated() // All other requests require authentication
            )
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class) // Add JWT filter
            .exceptionHandling(exceptions -> exceptions.authenticationEntryPoint(jwtAuthenticationEntryPoint));

        return http.build();
    }

    // This Bean configures CORS specifically for Spring Security
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // **IMPORTANT:** Set your React frontend's origin(s)
        config.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:5173")); // Your frontend URLs

        // Allowed HTTP methods for cross-origin requests
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // Allowed headers for cross-origin requests
        // Include "Authorization" if you're sending JWT tokens in headers
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "X-Requested-With"));
        // You can add more headers if your frontend sends custom ones, like "remember-me" if applicable

        // Allow sending credentials (cookies, HTTP authentication, JWT tokens in Authorization header)
        config.setAllowCredentials(true);

        // How long the preflight request (OPTIONS) response can be cached by the browser
        config.setMaxAge(3600L); // 1 hour

        // Apply this CORS configuration to all paths (/**)
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // Your existing password encoder bean
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Your existing authentication manager bean
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
