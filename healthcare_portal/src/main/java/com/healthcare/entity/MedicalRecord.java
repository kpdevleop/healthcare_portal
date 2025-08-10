package com.healthcare.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "medical_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalRecord extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @NotNull(message = "Patient must be specified for a medical record")
    private User patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    @NotNull(message = "Doctor must be specified for a medical record")
    private User doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false)
    @NotNull(message = "Appointment must be specified for a medical record")
    private Appointment appointment;

    @Column(name = "record_date", nullable = false)
    @NotNull(message = "Record date cannot be empty")
    @PastOrPresent(message = "Record date must be in the past or present")
    private LocalDate recordDate;

    @Lob // Used for TEXT type in MySQL
    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    @Lob // Used for TEXT type in MySQL
    @Column(columnDefinition = "TEXT")
    private String prescription;

    @Lob // Used for TEXT type in MySQL
    @Column(columnDefinition = "TEXT")
    private String notes;

    @Lob // Used for JSON type in MySQL, stored as String in Java
    @Column(columnDefinition = "JSON")
    private String attachments; // Stores JSON string of file paths/URLs

   
}


