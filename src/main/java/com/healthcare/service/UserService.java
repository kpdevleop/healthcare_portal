package com.healthcare.service;

import java.util.List;

import com.healthcare.entity.User;
import com.healthcare.entity.UserRole;

public interface UserService {
    
    List<User> getUsersByRole(UserRole role);
    
    List<User> getDoctorsByDepartment(Long departmentId);
    
    User getUserById(Long userId);
}
