package com.healthcare.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.healthcare.custom_exceptions.ResourceNotFoundException;
import com.healthcare.entity.User;
import com.healthcare.entity.UserRole;
import com.healthcare.repository.UserRepository;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<User> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
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
}
