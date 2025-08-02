package com.healthcare.entity;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "doctor_schedules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorSchedule extends BaseEntity{

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    @NotNull(message = "Doctor must be specified for a schedule")
    private User doctor; // Assuming User entity represents doctors

    @Column(nullable = false)
    @NotNull(message = "Schedule date cannot be empty")
    @FutureOrPresent(message = "Schedule date must be in the present or future")
    private LocalDate date;

    @Column(name = "start_time", nullable = false)
    @NotNull(message = "Start time cannot be empty")
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    @NotNull(message = "End time cannot be empty")
    private LocalTime endTime;

    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true; // Default to true

    
}

