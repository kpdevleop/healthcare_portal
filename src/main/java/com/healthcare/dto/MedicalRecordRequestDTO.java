package com.healthcare.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalRecordRequestDTO {
    
    @NotNull(message = "Patient ID is required")
    private Long patientId;
    
    @NotNull(message = "Doctor ID is required")
    private Long doctorId;
    
    @NotNull(message = "Record date is required")
    @PastOrPresent(message = "Record date must be in the past or present")
    private LocalDate recordDate;
    
    @Size(max = 2000, message = "Diagnosis cannot exceed 2000 characters")
    private String diagnosis;
    
    @Size(max = 2000, message = "Prescription cannot exceed 2000 characters")
    private String prescription;
    
    @Size(max = 2000, message = "Notes cannot exceed 2000 characters")
    private String notes;
    
    @Size(max = 1000, message = "Attachments JSON cannot exceed 1000 characters")
    private String attachments; // Optional JSON string of file paths/URLs
} 