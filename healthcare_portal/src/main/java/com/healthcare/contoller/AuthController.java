package com.healthcare.contoller;

import com.healthcare.dto.*;
import com.healthcare.entity.Otp;
import com.healthcare.entity.UserRole;
import com.healthcare.repository.OtpRepository;
import com.healthcare.repository.UserRepository;
import com.healthcare.service.AuthService;
import com.healthcare.service.OtpService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	
    @Autowired
    private AuthService authService;
    
    @Autowired
    private OtpService otpService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private OtpRepository otpRepository;

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Healthcare Portal Backend is running!");
    }
    
    @PostMapping("/test-otp")
    public ResponseEntity<ApiResponse<String>> testOtp(@RequestBody OtpRequestDTO request) {
        try {
            // Just return success without sending email for testing
            return ResponseEntity.ok(new ApiResponse<>(true, "Test OTP endpoint working", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @PostMapping("/test-otp-generation")
    public ResponseEntity<ApiResponse<String>> testOtpGeneration(@RequestBody OtpRequestDTO request) {
        try {
            System.out.println("Testing OTP generation for email: " + request.getEmail());
            
            // Check if user already exists
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(false, "User with this email already exists", null));
            }
            
            // Generate OTP without sending email
            String otpCode = "123456"; // Fixed OTP for testing
            Otp otp = Otp.builder()
                    .email(request.getEmail())
                    .otpCode(otpCode)
                    .type(Otp.OtpType.SIGNUP)
                    .expiryTime(LocalDateTime.now().plusMinutes(10))
                    .isUsed(false)
                    .attempts(0)
                    .build();
            
            otpRepository.save(otp);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "OTP generated and stored successfully. OTP: " + otpCode, null));
        } catch (Exception e) {
            System.err.println("Error in test OTP generation: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

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

    @PostMapping("/admin/create-user")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<AuthResponseDTO> createUserByAdmin(@Valid @RequestBody UserSignUpDTO signUpDto) {
        try {
            if (signUpDto.getRole() == null) {
                throw new IllegalArgumentException("User role is required.");
            }
            
            AuthResponseDTO response = authService.createUserByAdmin(signUpDto);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            throw e; // Re-throw to be handled by GlobalExceptionHandler
        } catch (Exception e) {
            throw new IllegalArgumentException("User creation failed: " + e.getMessage());
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

    // OTP and Password Reset Endpoints
    
    @PostMapping("/send-signup-otp")
    public ResponseEntity<ApiResponse<String>> sendSignupOtp(@Valid @RequestBody OtpRequestDTO request) {
        try {
            otpService.sendSignupOtp(request.getEmail());
            return ResponseEntity.ok(new ApiResponse<>(true, "OTP sent successfully to your email", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @PostMapping("/verify-signup-otp")
    public ResponseEntity<ApiResponse<String>> verifySignupOtp(@Valid @RequestBody OtpVerificationDTO request) {
        try {
            boolean isValid = otpService.verifySignupOtp(request.getEmail(), request.getOtp());
            if (isValid) {
                return ResponseEntity.ok(new ApiResponse<>(true, "OTP verified successfully", null));
            } else {
                return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Invalid or expired OTP", null));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody OtpRequestDTO request) {
        try {
            otpService.sendPasswordResetOtp(request.getEmail());
            return ResponseEntity.ok(new ApiResponse<>(true, "Password reset OTP sent successfully to your email", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody PasswordResetDTO request) {
        try {
            boolean isValid = otpService.verifyPasswordResetOtp(request.getEmail(), request.getOtp());
            if (isValid) {
                authService.resetPassword(request.getEmail(), request.getNewPassword());
                return ResponseEntity.ok(new ApiResponse<>(true, "Password reset successfully", null));
            } else {
                return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Invalid or expired OTP", null));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

}