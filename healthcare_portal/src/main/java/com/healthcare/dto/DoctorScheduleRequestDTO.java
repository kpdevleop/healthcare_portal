package com.healthcare.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorScheduleRequestDTO {
    
    @NotNull(message = "Doctor ID must be specified")
    private Long doctorId;
    
    @NotNull(message = "Schedule date cannot be empty")
    @FutureOrPresent(message = "Schedule date must be in the present or future")
    private LocalDate date;
    
    @NotNull(message = "Start time cannot be empty")
    private LocalTime startTime;
    
    @NotNull(message = "End time cannot be empty")
    private LocalTime endTime;
}