package com.healthcare.dto;

import com.healthcare.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private UserRole role;
    
    // Patient specific fields
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    
    // Doctor specific fields
    private String specialization;
    private String licenseNumber;
    private Integer experienceYears;
    private Long departmentId;
    private String departmentName;
} 