package com.healthcare.contoller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.healthcare.dto.MedicalRecordRequestDTO;
import com.healthcare.dto.MedicalRecordResponseDTO;
import com.healthcare.service.MedicalRecordService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import com.healthcare.dto.AppointmentResponseDTO;

@RestController
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {
    
    private final MedicalRecordService medicalRecordService;
    
    // Create medical record (Doctors and Admins can create)
    @PostMapping
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<MedicalRecordResponseDTO> createMedicalRecord(@Valid @RequestBody MedicalRecordRequestDTO dto) {
        MedicalRecordResponseDTO createdMedicalRecord = medicalRecordService.createMedicalRecord(dto);
        return new ResponseEntity<>(createdMedicalRecord, HttpStatus.CREATED);
    }
    
    // Update medical record (Doctors and Admins can update)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<MedicalRecordResponseDTO> updateMedicalRecord(@PathVariable Long id, @Valid @RequestBody MedicalRecordRequestDTO dto) {
        MedicalRecordResponseDTO updatedMedicalRecord = medicalRecordService.updateMedicalRecord(id, dto);
        return ResponseEntity.ok(updatedMedicalRecord);
    }
    
    // Get medical record by ID (Doctors and Admins can view)
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<MedicalRecordResponseDTO> getMedicalRecordById(@PathVariable Long id) {
        MedicalRecordResponseDTO medicalRecord = medicalRecordService.getMedicalRecordById(id);
        return ResponseEntity.ok(medicalRecord);
    }
    
    // Get all medical records (Admin only)
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<MedicalRecordResponseDTO>> getAllMedicalRecords() {
        List<MedicalRecordResponseDTO> medicalRecords = medicalRecordService.getAllMedicalRecords();
        return ResponseEntity.ok(medicalRecords);
    }
    
    // Get medical records by patient ID (Doctors and Admins can view)
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<MedicalRecordResponseDTO>> getMedicalRecordsByPatient(@PathVariable Long patientId) {
        List<MedicalRecordResponseDTO> medicalRecords = medicalRecordService.getMedicalRecordsByPatient(patientId);
        return ResponseEntity.ok(medicalRecords);
    }
    
    // Get medical records by doctor ID (Doctors and Admins can view)
    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<MedicalRecordResponseDTO>> getMedicalRecordsByDoctor(@PathVariable Long doctorId) {
        List<MedicalRecordResponseDTO> medicalRecords = medicalRecordService.getMedicalRecordsByDoctor(doctorId);
        return ResponseEntity.ok(medicalRecords);
    }
    
    // Get medical records by date (Admin and Doctor can view)
    @GetMapping("/date")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<MedicalRecordResponseDTO>> getMedicalRecordsByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<MedicalRecordResponseDTO> medicalRecords = medicalRecordService.getMedicalRecordsByDate(date);
        return ResponseEntity.ok(medicalRecords);
    }
    
    // Get medical records by patient and doctor (Doctors and Admins can view)
    @GetMapping("/patient/{patientId}/doctor/{doctorId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<MedicalRecordResponseDTO>> getMedicalRecordsByPatientAndDoctor(
            @PathVariable Long patientId, @PathVariable Long doctorId) {
        List<MedicalRecordResponseDTO> medicalRecords = medicalRecordService.getMedicalRecordsByPatientAndDoctor(patientId, doctorId);
        return ResponseEntity.ok(medicalRecords);
    }
    
    // Get my medical records (for current user)
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<MedicalRecordResponseDTO>> getMyMedicalRecords() {
        List<MedicalRecordResponseDTO> medicalRecords = medicalRecordService.getMyMedicalRecords();
        return ResponseEntity.ok(medicalRecords);
    }
    
    // Get my patient medical records (for doctors)
    @GetMapping("/my-patients")
    @PreAuthorize("hasRole('DOCTOR')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<MedicalRecordResponseDTO>> getMyPatientMedicalRecords() {
        List<MedicalRecordResponseDTO> medicalRecords = medicalRecordService.getMyPatientMedicalRecords();
        return ResponseEntity.ok(medicalRecords);
    }
    
    // Get available appointments for creating medical records (for doctors)
    @GetMapping("/available-appointments/{patientId}")
    @PreAuthorize("hasRole('DOCTOR')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<AppointmentResponseDTO>> getAvailableAppointmentsForMedicalRecord(@PathVariable Long patientId) {
        List<AppointmentResponseDTO> appointments = medicalRecordService.getAvailableAppointmentsForMedicalRecord(patientId);
        return ResponseEntity.ok(appointments);
    }
    
    // Delete medical record (Doctors and Admins can delete)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Void> deleteMedicalRecord(@PathVariable Long id) {
        medicalRecordService.deleteMedicalRecord(id);
        return ResponseEntity.noContent().build();
    }
} 