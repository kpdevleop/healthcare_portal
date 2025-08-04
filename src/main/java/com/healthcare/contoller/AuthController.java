package com.healthcare.contoller;

import com.healthcare.dto.AuthResponseDTO;
import com.healthcare.dto.UserSignInDTO;
import com.healthcare.dto.UserSignUpDTO;
import com.healthcare.entity.UserRole;
import com.healthcare.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	
    @Autowired
    private AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponseDTO> signUp(@Valid @RequestBody UserSignUpDTO signUpDto) {
        try {
            if (signUpDto.getRole() == null) {
                throw new IllegalArgumentException("User role is required.");
            }
            
            AuthResponseDTO response = authService.signUpUser(signUpDto);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            throw e; // Re-throw to be handled by GlobalExceptionHandler
        } catch (Exception e) {
            throw new IllegalArgumentException("Signup failed: " + e.getMessage());
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<AuthResponseDTO> signIn(@Valid @RequestBody UserSignInDTO signInDto) {
        try {
            AuthResponseDTO response = authService.signInUser(signInDto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new IllegalArgumentException("Signin failed: " + e.getMessage());
        }
    }

    @PostMapping("/test-token")
    public ResponseEntity<AuthResponseDTO> testToken() {
        try {
            // This endpoint validates the JWT token and returns user info
            AuthResponseDTO response = authService.validateToken();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new IllegalArgumentException("Token validation failed: " + e.getMessage());
        }
    }

}