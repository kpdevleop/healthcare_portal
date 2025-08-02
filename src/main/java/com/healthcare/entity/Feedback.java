package com.healthcare.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback extends BaseEntity {

   
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @NotNull(message = "Patient must be specified for feedback")
    private User patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id") // doctor_id is nullable in DB
    private User doctor;

    @Column(nullable = false)
    @NotNull(message = "Rating cannot be empty")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot exceed 5")
    private Integer rating;

    @Lob // Used for TEXT type in MySQL
    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(name = "submitted_at", nullable = false)
    @CreationTimestamp
    private LocalDateTime submittedAt;

   
}
