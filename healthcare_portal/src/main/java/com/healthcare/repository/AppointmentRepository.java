package com.healthcare.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.healthcare.entity.Appointment;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    // Find appointments by patient ID
    List<Appointment> findByPatientId(Long patientId);
    
    // Find appointments by doctor ID
    List<Appointment> findByDoctorId(Long doctorId);
    
    // Find appointments by status
    List<Appointment> findByStatus(String status);
    
    // Find appointments by date
    List<Appointment> findByAppointmentDate(LocalDate appointmentDate);
    
    // Find appointments by patient ID and date
    List<Appointment> findByPatientIdAndAppointmentDate(Long patientId, LocalDate appointmentDate);
    
    // Find appointments by doctor ID and date
    List<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate appointmentDate);
    
    // Find appointments by patient ID and status
    List<Appointment> findByPatientIdAndStatus(Long patientId, String status);
    
    // Find appointments by doctor ID and status
    List<Appointment> findByDoctorIdAndStatus(Long doctorId, String status);
    
    // Find appointments by schedule ID
    List<Appointment> findByScheduleId(Long scheduleId);
    
    // Check if patient has already booked this schedule
    boolean existsByPatientIdAndScheduleId(Long patientId, Long scheduleId);
    
    // Find appointments by patient ID and schedule ID
    List<Appointment> findByPatientIdAndScheduleId(Long patientId, Long scheduleId);
    
    // Find appointment with all related data
    @Query("SELECT a FROM Appointment a JOIN FETCH a.patient JOIN FETCH a.doctor JOIN FETCH a.schedule WHERE a.id = :id")
    Optional<Appointment> findByIdWithDetails(@Param("id") Long id);
    
    // Find all appointments with related data
    @Query("SELECT a FROM Appointment a JOIN FETCH a.patient JOIN FETCH a.doctor JOIN FETCH a.schedule")
    List<Appointment> findAllWithDetails();
    
    // Find appointments by patient with details
    @Query("SELECT a FROM Appointment a JOIN FETCH a.patient JOIN FETCH a.doctor JOIN FETCH a.schedule WHERE a.patient.id = :patientId")
    List<Appointment> findByPatientIdWithDetails(@Param("patientId") Long patientId);
    
    // Find appointments by doctor with details
    @Query("SELECT a FROM Appointment a JOIN FETCH a.patient JOIN FETCH a.doctor JOIN FETCH a.schedule WHERE a.doctor.id = :doctorId")
    List<Appointment> findByDoctorIdWithDetails(@Param("doctorId") Long doctorId);
    
    // Find appointments by status with details
    @Query("SELECT a FROM Appointment a JOIN FETCH a.patient JOIN FETCH a.doctor JOIN FETCH a.schedule WHERE a.status = :status")
    List<Appointment> findByStatusWithDetails(@Param("status") String status);
    
    // Find appointments by date with details
    @Query("SELECT a FROM Appointment a JOIN FETCH a.patient JOIN FETCH a.doctor JOIN FETCH a.schedule WHERE a.appointmentDate = :date")
    List<Appointment> findByAppointmentDateWithDetails(@Param("date") LocalDate date);
} 