package com.healthcare.service;

import java.util.List;

import com.healthcare.dto.FeedbackRequestDTO;
import com.healthcare.dto.FeedbackResponseDTO;

public interface FeedbackService {
    
    // Create new feedback
    FeedbackResponseDTO createFeedback(FeedbackRequestDTO dto);
    
    // Update feedback
    FeedbackResponseDTO updateFeedback(Long id, FeedbackRequestDTO dto);
    
    // Get feedback by ID
    FeedbackResponseDTO getFeedbackById(Long id);
    
    // Get all feedback (Admin only)
    List<FeedbackResponseDTO> getAllFeedback();
    
    // Get feedback by patient ID
    List<FeedbackResponseDTO> getFeedbackByPatient(Long patientId);
    
    // Get feedback by doctor ID
    List<FeedbackResponseDTO> getFeedbackByDoctor(Long doctorId);
    
    // Get feedback by rating
    List<FeedbackResponseDTO> getFeedbackByRating(Integer rating);
    
    // Get feedback by patient and doctor
    List<FeedbackResponseDTO> getFeedbackByPatientAndDoctor(Long patientId, Long doctorId);
    
    // Get my feedback (for current user)
    List<FeedbackResponseDTO> getMyFeedback();
    
    // Get feedback for my patients (for doctors)
    List<FeedbackResponseDTO> getMyPatientFeedback();
    
    // Get general feedback (no specific doctor)
    List<FeedbackResponseDTO> getGeneralFeedback();
    
    // Get doctor-specific feedback
    List<FeedbackResponseDTO> getDoctorSpecificFeedback();
    
    // Delete feedback
    void deleteFeedback(Long id);
} 