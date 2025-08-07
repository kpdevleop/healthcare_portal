package com.healthcare.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication; // <--- IMPORTANT: Add this import
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails; // Make sure this is imported
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.healthcare.custom_exceptions.ResourceNotFoundException;
import com.healthcare.dto.AuthResponseDTO;
import com.healthcare.dto.UserSignInDTO; // <--- IMPORTANT: Ensure this is your DTO package and class name (e.g., 'com.healthcare.dto.UserSignInDTO')
import com.healthcare.dto.UserSignUpDTO; // <--- IMPORTANT: Ensure this is your DTO package and class name
import com.healthcare.entity.Department;
import com.healthcare.entity.User;
import com.healthcare.entity.UserRole;
import com.healthcare.repository.DepartmentRepository; // Make sure this exists
import com.healthcare.repository.UserRepository; // <--- IMPORTANT: Ensure this matches your repository package and name
import com.healthcare.security.JwtUtil; // Make sure this exists

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

    @Autowired
    private DepartmentRepository departmentRepository;

    public AuthResponseDTO signUpUser(UserSignUpDTO signUpDto) {
        if (userRepository.findByEmail(signUpDto.getEmail()).isPresent()) { // <--- Correct usage
            throw new IllegalArgumentException("User with this email already exists.");
        }

        // Restrict signup to only doctors and patients
        if (signUpDto.getRole() == UserRole.ROLE_ADMIN) {
            throw new IllegalArgumentException("Admin accounts cannot be created through public signup. Please contact system administrator.");
        }

        // Validate password before encoding
        if (!isPasswordValid(signUpDto.getPassword())) {
            throw new IllegalArgumentException("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
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
            // Validate department for doctors
            if (signUpDto.getDepartmentId() == null) {
                throw new IllegalArgumentException("Department is mandatory for doctor registration.");
            }
            
            Department department = departmentRepository.findById(signUpDto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + signUpDto.getDepartmentId()));
            newUser.setDepartment(department);
            
            newUser.setSpecialization(signUpDto.getSpecialization());
            newUser.setLicenseNumber(signUpDto.getLicenseNumber());
            newUser.setExperienceYears(signUpDto.getExperienceYears());
        }
        // For ROLE_ADMIN or other roles, no specific fields need to be set here

        User savedUser = userRepository.save(newUser); // <--- Correct usage

        // Directly sign in the user after successful registration
        // IMPORTANT: UserSignInDto must have @AllArgsConstructor
        return signInUser(new UserSignInDTO(signUpDto.getEmail(), signUpDto.getPassword()));
    }

    public AuthResponseDTO createUserByAdmin(UserSignUpDTO signUpDto) {
        if (userRepository.findByEmail(signUpDto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("User with this email already exists.");
        }

        // Admin can create any type of user (including other admins)
        if (signUpDto.getRole() == null) {
            throw new IllegalArgumentException("User role is required.");
        }

        // Validate password before encoding
        if (!isPasswordValid(signUpDto.getPassword())) {
            throw new IllegalArgumentException("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
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
            // Validate department for doctors
            if (signUpDto.getDepartmentId() == null) {
                throw new IllegalArgumentException("Department is mandatory for doctor registration.");
            }
            
            Department department = departmentRepository.findById(signUpDto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + signUpDto.getDepartmentId()));
            newUser.setDepartment(department);
            
            newUser.setSpecialization(signUpDto.getSpecialization());
            newUser.setLicenseNumber(signUpDto.getLicenseNumber());
            newUser.setExperienceYears(signUpDto.getExperienceYears());
        }

        User savedUser = userRepository.save(newUser);

        // Return user info without signing in (admin creates user, doesn't sign in as them)
        return new AuthResponseDTO(
                null, // No token since admin is not signing in as the new user
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getFirstName(),
                savedUser.getLastName()
        );
    }

   public AuthResponseDTO signInUser(UserSignInDTO signInDto) {
    try {
        // Spring Security authentication
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(signInDto.getEmail(), signInDto.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found after authentication."));

        String jwt = jwtUtil.generateToken(user); // Pass the User object!

        return new AuthResponseDTO(
                jwt, // token
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getFirstName(),
                user.getLastName()
        );
    } catch (Exception e) {
        throw new IllegalArgumentException("Invalid email or password", e);
    }
}

    // Password validation method
    private boolean isPasswordValid(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        
        boolean hasLower = false;
        boolean hasUpper = false;
        boolean hasDigit = false;
        boolean hasSpecial = false;
        
        for (char c : password.toCharArray()) {
            if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else hasSpecial = true;
        }
        
        return hasLower && hasUpper && hasDigit && hasSpecial;
    }

    public AuthResponseDTO validateToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Invalid or expired token");
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return new AuthResponseDTO(
                null, // Don't return token again
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getFirstName(),
                user.getLastName()
        );
    }
}