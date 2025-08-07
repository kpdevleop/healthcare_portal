package com.healthcare.entity;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment extends BaseEntity {

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "patient_id", nullable = false)
	@NotNull(message = "Patient must be specified for an appointment")
	private User patient;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "doctor_id", nullable = false)
	@NotNull(message = "Doctor must be specified for an appointment")
	private User doctor;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "schedule_id", nullable = false) // Allow multiple appointments per schedule
	@NotNull(message = "Schedule must be specified for an appointment")
	private DoctorSchedule schedule;

	// Add unique constraint to prevent one patient booking same schedule twice
	@Column(name = "patient_schedule_unique", unique = true)
	private String patientScheduleUnique; // Will be set as "patientId_scheduleId"

	@Column(name = "appointment_date", nullable = false)
	@NotNull(message = "Appointment date cannot be empty")
	@FutureOrPresent(message = "Appointment date must be in the present or future")
	private LocalDate appointmentDate;

	@Column(name = "appointment_time", nullable = false)
	@NotNull(message = "Appointment time cannot be empty")
	private LocalTime appointmentTime;

	@Lob // Used for TEXT type in MySQL
	@Column(columnDefinition = "TEXT")
	private String reason;

	@Column(nullable = false, length = 50)
	@NotBlank(message = "Appointment status cannot be empty")
	@Pattern(regexp = "PENDING|CONFIRMED|COMPLETED|CANCELLED", message = "Invalid appointment status")
	private String status = "PENDING"; // Default status

}