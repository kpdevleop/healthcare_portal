package com.healthcare.service;

import java.util.List;

import com.healthcare.dto.UserSignUpDTO;
import com.healthcare.dto.UserProfileUpdateDTO;
import com.healthcare.entity.User;
import com.healthcare.entity.UserRole;

public interface UserService {
    
    List<User> getUsersByRole(UserRole role);
    
    List<User> getDoctorsByDepartment(Long departmentId);
    
    User getUserById(Long userId);
    
    User getUserByEmail(String email);
    
    User getUserProfileByEmail(String email);
    
    List<User> getAllUsers();
    
    void deleteUser(Long userId);
    
    User updateUser(Long userId, UserSignUpDTO userData);
    
    User updateUserProfile(Long userId, UserProfileUpdateDTO userData);
    
    void updateUserStatus(Long userId, String status);
}
