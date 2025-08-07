package com.healthcare.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentRequestDTO {
    
    @NotBlank(message = "Department name cannot be empty")
    @Size(max = 100, message = "Department name cannot exceed 100 characters")
    private String name;
    
    private String description;
} 