package com.healthcare.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.healthcare.entity.Feedback;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    
    // Find feedback by patient ID
    List<Feedback> findByPatientId(Long patientId);
    
    // Find feedback by doctor ID
    List<Feedback> findByDoctorId(Long doctorId);
    
    // Find feedback by rating
    List<Feedback> findByRating(Integer rating);
    
    // Find feedback by patient ID and doctor ID
    List<Feedback> findByPatientIdAndDoctorId(Long patientId, Long doctorId);
    
    // Find feedback with all related data
    @Query("SELECT f FROM Feedback f JOIN FETCH f.patient LEFT JOIN FETCH f.doctor WHERE f.id = :id")
    Optional<Feedback> findByIdWithDetails(@Param("id") Long id);
    
    // Find all feedback with related data
    @Query("SELECT f FROM Feedback f JOIN FETCH f.patient LEFT JOIN FETCH f.doctor")
    List<Feedback> findAllWithDetails();
    
    // Find feedback by patient with details
    @Query("SELECT f FROM Feedback f JOIN FETCH f.patient LEFT JOIN FETCH f.doctor WHERE f.patient.id = :patientId")
    List<Feedback> findByPatientIdWithDetails(@Param("patientId") Long patientId);
    
    // Find feedback by doctor with details
    @Query("SELECT f FROM Feedback f JOIN FETCH f.patient LEFT JOIN FETCH f.doctor WHERE f.doctor.id = :doctorId")
    List<Feedback> findByDoctorIdWithDetails(@Param("doctorId") Long doctorId);
    
    // Find feedback by rating with details
    @Query("SELECT f FROM Feedback f JOIN FETCH f.patient LEFT JOIN FETCH f.doctor WHERE f.rating = :rating")
    List<Feedback> findByRatingWithDetails(@Param("rating") Integer rating);
    
    // Find feedback by patient and doctor with details
    @Query("SELECT f FROM Feedback f JOIN FETCH f.patient LEFT JOIN FETCH f.doctor WHERE f.patient.id = :patientId AND f.doctor.id = :doctorId")
    List<Feedback> findByPatientIdAndDoctorIdWithDetails(@Param("patientId") Long patientId, @Param("doctorId") Long doctorId);
    
    // Find general feedback (where doctor is null)
    @Query("SELECT f FROM Feedback f JOIN FETCH f.patient WHERE f.doctor IS NULL")
    List<Feedback> findGeneralFeedbackWithDetails();
    
    // Find doctor-specific feedback
    @Query("SELECT f FROM Feedback f JOIN FETCH f.patient LEFT JOIN FETCH f.doctor WHERE f.doctor IS NOT NULL")
    List<Feedback> findDoctorFeedbackWithDetails();
} 