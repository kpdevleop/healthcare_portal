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

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponseDTO> signUp(@Valid @RequestBody UserSignUpDTO signUpDto) {
        // You might want to add logic here to restrict which roles can be signed up publicly
        // e.g., only allow ROLE_PATIENT for public signup.
        // For ADMIN and DOCTOR roles, you might have an admin-only endpoint.
        if (signUpDto.getRole() == null || signUpDto.getRole() == UserRole.ROLE_ADMIN || signUpDto.getRole() == UserRole.ROLE_DOCTOR) {
             // For public signup, you might enforce ROLE_PATIENT or remove the role field from DTO
             // and set it to ROLE_PATIENT directly in the service for public users.
             // Or have separate signup endpoints for patient and admin/doctor roles.
             // For this example, we proceed assuming the service handles the role.
        }

        AuthResponseDTO response = authService.signUpUser(signUpDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/signin")
    public ResponseEntity<AuthResponseDTO> signIn(@Valid @RequestBody UserSignInDTO signInDto) {
        AuthResponseDTO response = authService.signInUser(signInDto);
        return ResponseEntity.ok(response);
    }
}