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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.healthcare.dto.DoctorScheduleRequestDTO;
import com.healthcare.dto.DoctorScheduleResponseDTO;
import com.healthcare.service.DoctorScheduleService;

import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/doctor-schedules")
@RequiredArgsConstructor
public class DoctorScheduleController {
    
    private final DoctorScheduleService doctorScheduleService;
    
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    @PostMapping
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<DoctorScheduleResponseDTO> createSchedule(@Valid @RequestBody DoctorScheduleRequestDTO dto) {
        DoctorScheduleResponseDTO createdSchedule = doctorScheduleService.createSchedule(dto);
        return new ResponseEntity<>(createdSchedule, HttpStatus.CREATED);
    }
    
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    @PutMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<DoctorScheduleResponseDTO> updateSchedule(@PathVariable Long id, @Valid @RequestBody DoctorScheduleRequestDTO dto) {
        DoctorScheduleResponseDTO updatedSchedule = doctorScheduleService.updateSchedule(id, dto);
        return ResponseEntity.ok(updatedSchedule);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<DoctorScheduleResponseDTO> getScheduleById(@PathVariable Long id) {
        DoctorScheduleResponseDTO schedule = doctorScheduleService.getScheduleById(id);
        return ResponseEntity.ok(schedule);
    }
    
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<DoctorScheduleResponseDTO>> getAllSchedules() {
        List<DoctorScheduleResponseDTO> schedules = doctorScheduleService.getAllSchedules();
        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/my-schedules")
    @PreAuthorize("hasRole('DOCTOR')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<DoctorScheduleResponseDTO>> getMySchedules() {
        List<DoctorScheduleResponseDTO> schedules = doctorScheduleService.getMySchedules();
        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR') and authentication.principal.id == #doctorId)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<DoctorScheduleResponseDTO>> getDoctorSchedules(@PathVariable Long doctorId) {
        List<DoctorScheduleResponseDTO> schedules = doctorScheduleService.getDoctorSchedules(doctorId);
        return ResponseEntity.ok(schedules);
    }
    
    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT', 'DOCTOR')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<DoctorScheduleResponseDTO>> getAvailableSchedules(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<DoctorScheduleResponseDTO> schedules = doctorScheduleService.findAvailableSchedules(date);
        return ResponseEntity.ok(schedules);
    }
    
    @PostMapping("/{scheduleId}/book")
    @PreAuthorize("hasRole('PATIENT')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<DoctorScheduleResponseDTO> bookSchedule(@PathVariable Long scheduleId) {
        DoctorScheduleResponseDTO bookedSchedule = doctorScheduleService.bookSchedule(scheduleId);
        return ResponseEntity.ok(bookedSchedule);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id) {
        doctorScheduleService.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/my-schedules/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Void> deleteMySchedule(@PathVariable Long id) {
        doctorScheduleService.deleteMySchedule(id);
        return ResponseEntity.noContent().build();
    }
}

