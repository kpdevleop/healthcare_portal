package com.healthcare.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorScheduleResponseDTO {
    
    private Long id;
    private Long doctorId;
    private String doctorName; // Added for a more user-friendly response
    private String doctorFirstName;
    private String doctorLastName;
    private String doctorEmail;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean isAvailable;
    
    // Department information
    private Long departmentId;
    private String departmentName;
    
    // Add bookedTimes for frontend slot filtering
    private java.util.List<String> bookedTimes;
}