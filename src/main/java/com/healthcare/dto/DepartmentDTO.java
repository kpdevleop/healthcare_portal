package com.healthcare.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.healthcare.entity.Department;

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
public class DepartmentDTO {
    private Long id;
    private String name;
    private String description;
    private LocalDate creationDate;
    private LocalDateTime updatedOn;
    
    // Static method to convert Department entity to DTO
    public static DepartmentDTO fromEntity(Department department) {
        return DepartmentDTO.builder()
                .id(department.getId())
                .name(department.getName())
                .description(department.getDescription())
                .creationDate(department.getCreationDate())
                .updatedOn(department.getUpdatedOn())
                .build();
    }
} 