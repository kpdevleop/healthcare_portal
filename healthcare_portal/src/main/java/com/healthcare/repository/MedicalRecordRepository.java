package com.healthcare.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.healthcare.entity.MedicalRecord;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    
    // Find medical records by patient ID
    List<MedicalRecord> findByPatientId(Long patientId);
    
    // Find medical records by doctor ID
    List<MedicalRecord> findByDoctorId(Long doctorId);
    
    // Find medical records by date
    List<MedicalRecord> findByRecordDate(LocalDate recordDate);
    
    // Find medical records by patient ID and date
    List<MedicalRecord> findByPatientIdAndRecordDate(Long patientId, LocalDate recordDate);
    
    // Find medical records by doctor ID and date
    List<MedicalRecord> findByDoctorIdAndRecordDate(Long doctorId, LocalDate recordDate);
    
    // Find medical records by patient ID and doctor ID
    List<MedicalRecord> findByPatientIdAndDoctorId(Long patientId, Long doctorId);
    
    // Find medical records with all related data
    @Query("SELECT mr FROM MedicalRecord mr JOIN FETCH mr.patient JOIN FETCH mr.doctor WHERE mr.id = :id")
    Optional<MedicalRecord> findByIdWithDetails(@Param("id") Long id);
    
    // Find all medical records with related data
    @Query("SELECT mr FROM MedicalRecord mr JOIN FETCH mr.patient JOIN FETCH mr.doctor")
    List<MedicalRecord> findAllWithDetails();
    
    // Find medical records by patient with details
    @Query("SELECT mr FROM MedicalRecord mr JOIN FETCH mr.patient JOIN FETCH mr.doctor WHERE mr.patient.id = :patientId")
    List<MedicalRecord> findByPatientIdWithDetails(@Param("patientId") Long patientId);
    
    // Find medical records by doctor with details
    @Query("SELECT mr FROM MedicalRecord mr JOIN FETCH mr.patient JOIN FETCH mr.doctor WHERE mr.doctor.id = :doctorId")
    List<MedicalRecord> findByDoctorIdWithDetails(@Param("doctorId") Long doctorId);
    
    // Find medical records by date with details
    @Query("SELECT mr FROM MedicalRecord mr JOIN FETCH mr.patient JOIN FETCH mr.doctor WHERE mr.recordDate = :date")
    List<MedicalRecord> findByRecordDateWithDetails(@Param("date") LocalDate date);
    
    // Find medical records by patient and doctor with details
    @Query("SELECT mr FROM MedicalRecord mr JOIN FETCH mr.patient JOIN FETCH mr.doctor WHERE mr.patient.id = :patientId AND mr.doctor.id = :doctorId")
    List<MedicalRecord> findByPatientIdAndDoctorIdWithDetails(@Param("patientId") Long patientId, @Param("doctorId") Long doctorId);
} 