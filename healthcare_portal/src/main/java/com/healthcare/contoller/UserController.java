package com.healthcare.contoller;

import com.healthcare.dto.ApiResponse;
import com.healthcare.dto.UserResponseDTO;
import com.healthcare.dto.UserSignUpDTO;
import com.healthcare.dto.UserProfileUpdateDTO;
import com.healthcare.entity.User;
import com.healthcare.entity.UserRole;
import com.healthcare.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    @GetMapping("/doctors")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get all doctors", description = "Admin only endpoint to get all doctors")
    public ResponseEntity<ApiResponse<List<UserResponseDTO>>> getAllDoctors() {
        try {
            List<User> doctors = userService.getUsersByRoleWithDepartment(UserRole.ROLE_DOCTOR);
            List<UserResponseDTO> doctorDTOs = doctors.stream()
                .map(user -> {
                    UserResponseDTO dto = new UserResponseDTO();
                    dto.setId(user.getId());
                    dto.setFirstName(user.getFirstName());
                    dto.setLastName(user.getLastName());
                    dto.setEmail(user.getEmail());
                    dto.setPhoneNumber(user.getPhoneNumber());
                    dto.setRole(user.getRole());
                    dto.setSpecialization(user.getSpecialization());
                    dto.setLicenseNumber(user.getLicenseNumber());
                    dto.setExperienceYears(user.getExperienceYears());
                    if (user.getDepartment() != null) {
                        dto.setDepartmentId(user.getDepartment().getId());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Doctors retrieved successfully", doctorDTOs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Failed to retrieve doctors: " + e.getMessage(), null));
        }
    }
    
    @GetMapping("/doctors/public")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get all doctors for public view", description = "Public endpoint to get all doctors for patient reviews")
    public ResponseEntity<ApiResponse<List<UserResponseDTO>>> getPublicDoctors() {
        try {
            List<User> doctors = userService.getUsersByRoleWithDepartment(UserRole.ROLE_DOCTOR);
            List<UserResponseDTO> doctorDTOs = doctors.stream()
                .map(user -> {
                    UserResponseDTO dto = new UserResponseDTO();
                    dto.setId(user.getId());
                    dto.setFirstName(user.getFirstName());
                    dto.setLastName(user.getLastName());
                    dto.setEmail(user.getEmail());
                    dto.setPhoneNumber(user.getPhoneNumber());
                    dto.setRole(user.getRole());
                    dto.setSpecialization(user.getSpecialization());
                    dto.setLicenseNumber(user.getLicenseNumber());
                    dto.setExperienceYears(user.getExperienceYears());
                    if (user.getDepartment() != null) {
                        dto.setDepartmentId(user.getDepartment().getId());
                        dto.setDepartmentName(user.getDepartment().getName());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Doctors retrieved successfully", doctorDTOs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Failed to retrieve doctors: " + e.getMessage(), null));
        }
    }
    
    @GetMapping("/patients")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get all patients", description = "Admin only endpoint to get all patients")
    public ResponseEntity<ApiResponse<List<UserResponseDTO>>> getAllPatients() {
        try {
            List<User> patients = userService.getUsersByRole(UserRole.ROLE_PATIENT);
            List<UserResponseDTO> patientDTOs = patients.stream()
                .map(user -> {
                    UserResponseDTO dto = new UserResponseDTO();
                    dto.setId(user.getId());
                    dto.setFirstName(user.getFirstName());
                    dto.setLastName(user.getLastName());
                    dto.setEmail(user.getEmail());
                    dto.setPhoneNumber(user.getPhoneNumber());
                    dto.setRole(user.getRole());
                    dto.setDateOfBirth(user.getDateOfBirth());
                    dto.setGender(user.getGender());
                    dto.setAddress(user.getAddress());
                    return dto;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Patients retrieved successfully", patientDTOs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Failed to retrieve patients: " + e.getMessage(), null));
        }
    }
    
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get all users", description = "Admin only endpoint to get all users")
    public ResponseEntity<ApiResponse<List<UserResponseDTO>>> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            List<UserResponseDTO> userDTOs = users.stream()
                .map(user -> {
                    UserResponseDTO dto = new UserResponseDTO();
                    dto.setId(user.getId());
                    dto.setFirstName(user.getFirstName());
                    dto.setLastName(user.getLastName());
                    dto.setEmail(user.getEmail());
                    dto.setPhoneNumber(user.getPhoneNumber());
                    dto.setRole(user.getRole());
                    
                    // Add role-specific fields
                    if (user.getRole() == UserRole.ROLE_DOCTOR) {
                        dto.setSpecialization(user.getSpecialization());
                        dto.setLicenseNumber(user.getLicenseNumber());
                        dto.setExperienceYears(user.getExperienceYears());
                        if (user.getDepartment() != null) {
                            dto.setDepartmentId(user.getDepartment().getId());
                        }
                    } else if (user.getRole() == UserRole.ROLE_PATIENT) {
                        dto.setDateOfBirth(user.getDateOfBirth());
                        dto.setGender(user.getGender());
                        dto.setAddress(user.getAddress());
                    }
                    
                    return dto;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Users retrieved successfully", userDTOs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Failed to retrieve users: " + e.getMessage(), null));
        }
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get user by ID", description = "Admin only endpoint to get user by ID")
    public ResponseEntity<ApiResponse<UserResponseDTO>> getUserById(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            UserResponseDTO dto = new UserResponseDTO();
            dto.setId(user.getId());
            dto.setFirstName(user.getFirstName());
            dto.setLastName(user.getLastName());
            dto.setEmail(user.getEmail());
            dto.setPhoneNumber(user.getPhoneNumber());
            dto.setRole(user.getRole());
            
            // Add role-specific fields
            if (user.getRole() == UserRole.ROLE_DOCTOR) {
                dto.setSpecialization(user.getSpecialization());
                dto.setLicenseNumber(user.getLicenseNumber());
                dto.setExperienceYears(user.getExperienceYears());
                if (user.getDepartment() != null) {
                    dto.setDepartmentId(user.getDepartment().getId());
                }
            } else if (user.getRole() == UserRole.ROLE_PATIENT) {
                dto.setDateOfBirth(user.getDateOfBirth());
                dto.setGender(user.getGender());
                dto.setAddress(user.getAddress());
            }
            
            return ResponseEntity.ok(new ApiResponse<>(true, "User retrieved successfully", dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Failed to retrieve user: " + e.getMessage(), null));
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete user by ID", description = "Admin only endpoint to delete user by ID")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "User deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Failed to delete user: " + e.getMessage(), null));
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update user by ID", description = "Admin only endpoint to update user by ID")
    public ResponseEntity<ApiResponse<UserResponseDTO>> updateUser(@PathVariable Long id, @RequestBody UserSignUpDTO userData) {
        try {
            User updatedUser = userService.updateUser(id, userData);
            UserResponseDTO dto = new UserResponseDTO();
            dto.setId(updatedUser.getId());
            dto.setFirstName(updatedUser.getFirstName());
            dto.setLastName(updatedUser.getLastName());
            dto.setEmail(updatedUser.getEmail());
            dto.setPhoneNumber(updatedUser.getPhoneNumber());
            dto.setRole(updatedUser.getRole());
            
            // Add role-specific fields
            if (updatedUser.getRole() == UserRole.ROLE_DOCTOR) {
                dto.setSpecialization(updatedUser.getSpecialization());
                dto.setLicenseNumber(updatedUser.getLicenseNumber());
                dto.setExperienceYears(updatedUser.getExperienceYears());
                if (updatedUser.getDepartment() != null) {
                    dto.setDepartmentId(updatedUser.getDepartment().getId());
                }
            } else if (updatedUser.getRole() == UserRole.ROLE_PATIENT) {
                dto.setDateOfBirth(updatedUser.getDateOfBirth());
                dto.setGender(updatedUser.getGender());
                dto.setAddress(updatedUser.getAddress());
            }
            
            return ResponseEntity.ok(new ApiResponse<>(true, "User updated successfully", dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Failed to update user: " + e.getMessage(), null));
        }
    }
    
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update user status", description = "Admin only endpoint to update user status")
    public ResponseEntity<ApiResponse<String>> updateUserStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            userService.updateUserStatus(id, status);
            return ResponseEntity.ok(new ApiResponse<>(true, "User status updated successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Failed to update user status: " + e.getMessage(), null));
        }
    }

    // New endpoints for users to manage their own profiles
    
    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get current user profile", description = "Get profile information for the currently authenticated user")
    public ResponseEntity<ApiResponse<UserResponseDTO>> getCurrentUserProfile() {
        try {
            // Get current user from security context
            String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userService.getUserProfileByEmail(currentUserEmail);
            
            UserResponseDTO dto = new UserResponseDTO();
            dto.setId(user.getId());
            dto.setFirstName(user.getFirstName());
            dto.setLastName(user.getLastName());
            dto.setEmail(user.getEmail());
            dto.setPhoneNumber(user.getPhoneNumber());
            dto.setRole(user.getRole());
            
            // Add role-specific fields
            if (user.getRole() == UserRole.ROLE_DOCTOR) {
                dto.setSpecialization(user.getSpecialization());
                dto.setLicenseNumber(user.getLicenseNumber());
                dto.setExperienceYears(user.getExperienceYears());
                // Handle department safely to avoid lazy loading issues
                if (user.getDepartment() != null) {
                    dto.setDepartmentId(user.getDepartment().getId());
                    dto.setDepartmentName(user.getDepartment().getName());
                }
            } else if (user.getRole() == UserRole.ROLE_PATIENT) {
                dto.setDateOfBirth(user.getDateOfBirth());
                dto.setGender(user.getGender());
                dto.setAddress(user.getAddress());
            }
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Profile retrieved successfully", dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Failed to retrieve profile: " + e.getMessage(), null));
        }
    }
    
    @PutMapping("/profile")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update current user profile", description = "Update profile information for the currently authenticated user")
    public ResponseEntity<ApiResponse<UserResponseDTO>> updateCurrentUserProfile(@RequestBody UserProfileUpdateDTO userData) {
        try {
            // Get current user from security context
            String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            User currentUser = userService.getUserProfileByEmail(currentUserEmail);
            
            // Ensure user can only update their own profile
            if (!currentUser.getId().equals(userData.getId())) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(false, "You can only update your own profile", null));
            }
            
            // Update the user
            User updatedUser = userService.updateUserProfile(currentUser.getId(), userData);
            
            UserResponseDTO dto = new UserResponseDTO();
            dto.setId(updatedUser.getId());
            dto.setFirstName(updatedUser.getFirstName());
            dto.setLastName(updatedUser.getLastName());
            dto.setEmail(updatedUser.getEmail());
            dto.setPhoneNumber(updatedUser.getPhoneNumber());
            dto.setRole(updatedUser.getRole());
            
            // Add role-specific fields
            if (updatedUser.getRole() == UserRole.ROLE_DOCTOR) {
                dto.setSpecialization(updatedUser.getSpecialization());
                dto.setLicenseNumber(updatedUser.getLicenseNumber());
                dto.setExperienceYears(updatedUser.getExperienceYears());
                // Handle department safely to avoid lazy loading issues
                if (updatedUser.getDepartment() != null) {
                    dto.setDepartmentId(updatedUser.getDepartment().getId());
                    dto.setDepartmentName(updatedUser.getDepartment().getName());
                }
            } else if (updatedUser.getRole() == UserRole.ROLE_PATIENT) {
                dto.setDateOfBirth(updatedUser.getDateOfBirth());
                dto.setGender(updatedUser.getGender());
                dto.setAddress(updatedUser.getAddress());
            }
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Profile updated successfully", dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Failed to update profile: " + e.getMessage(), null));
        }
    }
} 