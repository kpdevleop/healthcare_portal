package com.healthcare.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.healthcare.custom_exceptions.ResourceNotFoundException;
import com.healthcare.dto.UserSignUpDTO;
import com.healthcare.dto.UserProfileUpdateDTO;
import com.healthcare.entity.Department;
import com.healthcare.entity.User;
import com.healthcare.entity.UserRole;
import com.healthcare.repository.DepartmentRepository;
import com.healthcare.repository.UserRepository;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private DepartmentRepository departmentRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<User> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }

    @Override
    public List<User> getUsersByRoleWithDepartment(UserRole role) {
        return userRepository.findByRoleWithDepartment(role);
    }

    @Override
    public List<User> getDoctorsByDepartment(Long departmentId) {
        // This would need a join with department table
        // For now, return all doctors
        return userRepository.findByRole(UserRole.ROLE_DOCTOR);
    }

    @Override
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }
    
    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }
    
    @Override
    public User getUserProfileByEmail(String email) {
        return userRepository.findByEmailWithDepartment(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    @Override
    public void deleteUser(Long userId) {
        User user = getUserById(userId);
        userRepository.delete(user);
    }
    
    @Override
    public User updateUser(Long userId, UserSignUpDTO userData) {
        User user = getUserById(userId);
        
        // Update basic fields
        user.setFirstName(userData.getFirstName());
        user.setLastName(userData.getLastName());
        user.setEmail(userData.getEmail());
        user.setPhoneNumber(userData.getPhoneNumber());
        user.setRole(userData.getRole());
        
        // Update password if provided
        if (userData.getPassword() != null && !userData.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userData.getPassword()));
        }
        
        // Update role-specific fields
        if (userData.getRole() == UserRole.ROLE_DOCTOR) {
            user.setSpecialization(userData.getSpecialization());
            user.setLicenseNumber(userData.getLicenseNumber());
            user.setExperienceYears(userData.getExperienceYears());
            if (userData.getDepartmentId() != null) {
                Department department = departmentRepository.findById(userData.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + userData.getDepartmentId()));
                user.setDepartment(department);
            }
        } else if (userData.getRole() == UserRole.ROLE_PATIENT) {
            user.setDateOfBirth(userData.getDateOfBirth());
            user.setGender(userData.getGender());
            user.setAddress(userData.getAddress());
        }
        
        return userRepository.save(user);
    }
    
    @Override
    public User updateUserProfile(Long userId, UserProfileUpdateDTO userData) {
        User user = getUserById(userId);
        
        // Update basic fields (excluding password and role for security)
        user.setFirstName(userData.getFirstName());
        user.setLastName(userData.getLastName());
        user.setEmail(userData.getEmail());
        user.setPhoneNumber(userData.getPhoneNumber());
        
        // Update role-specific fields
        if (userData.getRole() == UserRole.ROLE_DOCTOR) {
            user.setSpecialization(userData.getSpecialization());
            user.setLicenseNumber(userData.getLicenseNumber());
            
            // Handle experience years - try experienceYears first, then experience as fallback
            Integer experienceYears = userData.getExperienceYears();
            if (experienceYears == null && userData.getExperience() != null && !userData.getExperience().trim().isEmpty()) {
                try {
                    experienceYears = Integer.parseInt(userData.getExperience().trim());
                } catch (NumberFormatException e) {
                    // If parsing fails, set to null
                    experienceYears = null;
                }
            }
            user.setExperienceYears(experienceYears);
            
            if (userData.getDepartmentId() != null) {
                Department department = departmentRepository.findById(userData.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + userData.getDepartmentId()));
                user.setDepartment(department);
            }
        } else if (userData.getRole() == UserRole.ROLE_PATIENT) {
            user.setDateOfBirth(userData.getDateOfBirth());
            user.setGender(userData.getGender());
            user.setAddress(userData.getAddress());
        }
        
        User savedUser = userRepository.save(user);
        
        // Return the user with department loaded to avoid lazy loading issues
        return userRepository.findByEmailWithDepartment(savedUser.getEmail())
                .orElse(savedUser);
    }
    
    @Override
    public void updateUserStatus(Long userId, String status) {
        User user = getUserById(userId);
       
        userRepository.save(user);
    }
}
