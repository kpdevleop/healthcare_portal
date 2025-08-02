package com.healthcare.security;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private CustomUserDetailsService userDetailsService; // Your custom UserDetailsService

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                // Validate token format and extract username
                if (jwt != null && !jwt.trim().isEmpty()) {
                    username = jwtUtil.extractUsername(jwt);
                }
            } catch (Exception e) {
                // Log the exception for debugging
                System.err.println("JWT Token validation failed: " + e.getMessage());
                // Don't set username, let the request continue without authentication
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            if (jwtUtil.validateToken(jwt, userDetails)) {
                // Extract role from JWT
                String role = jwtUtil.extractClaim(jwt, claims -> claims.get("role", String.class));
                List<org.springframework.security.core.GrantedAuthority> authorities = new ArrayList<>();
                if (role != null) {
                    authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority(role));
                }
                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                usernamePasswordAuthenticationToken
                        .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            }
        }
        chain.doFilter(request, response);
    }
}