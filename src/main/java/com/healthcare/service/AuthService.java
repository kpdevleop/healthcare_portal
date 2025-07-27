package com.healthcare.service;

import com.healthcare.dto.AuthResponseDTO;
import com.healthcare.dto.UserSignInDTO; // <--- IMPORTANT: Ensure this is your DTO package and class name (e.g., 'com.healthcare.dto.UserSignInDTO')
import com.healthcare.dto.UserSignUpDTO; // <--- IMPORTANT: Ensure this is your DTO package and class name
import com.healthcare.entity.Department;
import com.healthcare.entity.User;
import com.healthcare.entity.UserRole;
import com.healthcare.custom_exceptions.ResourceNotFoundException;
import com.healthcare.repository.DepartmentRepository; // Make sure this exists
import com.healthcare.repository.UserRepository; // <--- IMPORTANT: Ensure this matches your repository package and name
import com.healthcare.security.JwtUtil; // Make sure this exists
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication; // <--- IMPORTANT: Add this import
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails; // Make sure this is imported
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    @Autowired
    private UserRepository userRepository; // <--- IMPORTANT: Use UserRepository

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired(required = false) // Use this if DepartmentRepository might not always be available (e.g. during initial setup)
    private DepartmentRepository departmentRepository;

    public AuthResponseDTO signUpUser(UserSignUpDTO signUpDto) {
        if (userRepository.findByEmail(signUpDto.getEmail()).isPresent()) { // <--- Correct usage
            throw new IllegalArgumentException("User with this email already exists.");
        }

        User newUser = User.builder()
                .email(signUpDto.getEmail())
                .password(passwordEncoder.encode(signUpDto.getPassword()))
                .firstName(signUpDto.getFirstName())
                .lastName(signUpDto.getLastName())
                .phoneNumber(signUpDto.getPhoneNumber())
                .role(signUpDto.getRole())
                .profilePhotoUrl(null) // Optional, can be updated later
                .build();

        // Apply role-specific fields
        if (signUpDto.getRole() == UserRole.ROLE_PATIENT) {
            newUser.setDateOfBirth(signUpDto.getDateOfBirth());
            newUser.setGender(signUpDto.getGender());
            newUser.setAddress(signUpDto.getAddress());
        } else if (signUpDto.getRole() == UserRole.ROLE_DOCTOR) {
            newUser.setSpecialization(signUpDto.getSpecialization());
            newUser.setLicenseNumber(signUpDto.getLicenseNumber());
            newUser.setExperienceYears(signUpDto.getExperienceYears());
            if (signUpDto.getDepartmentId() != null) {
                // Ensure DepartmentRepository is not null before using it
                if (departmentRepository == null) {
                    throw new IllegalStateException("DepartmentRepository is not available for doctor registration.");
                }
                Department department = departmentRepository.findById(signUpDto.getDepartmentId())
                        .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + signUpDto.getDepartmentId()));
                newUser.setDepartment(department);
            }
        }
        // For ROLE_ADMIN or other roles, no specific fields need to be set here

        User savedUser = userRepository.save(newUser); // <--- Correct usage

        // Directly sign in the user after successful registration
        // IMPORTANT: UserSignInDto must have @AllArgsConstructor
        return signInUser(new UserSignInDTO(signUpDto.getEmail(), signUpDto.getPassword()));
    }

    public AuthResponseDTO signInUser(UserSignInDTO signInDto) {
        try {
            // Spring Security authentication
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(signInDto.getEmail(), signInDto.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String jwt = jwtUtil.generateToken(userDetails.getUsername()); // Assuming username is email

            User user = userRepository.findByEmail(userDetails.getUsername()) // <--- Correct usage
                    .orElseThrow(() -> new ResourceNotFoundException("User not found after authentication."));

            return new AuthResponseDTO(
                    jwt,
                    user.getId(),
                    user.getEmail(),
                    user.getRole(),
                    user.getFirstName(),
                    user.getLastName()
            );
        } catch (Exception e) {
            // Handle specific authentication exceptions (e.g., BadCredentialsException)
            throw new IllegalArgumentException("Invalid email or password", e);
        }
    }
}