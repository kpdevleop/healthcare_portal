package com.healthcare.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.healthcare.custom_exceptions.ResourceNotFoundException;
import com.healthcare.custom_exceptions.ScheduleAlreadyBookedException;
import com.healthcare.custom_exceptions.TimeConflictException;
import com.healthcare.dto.DoctorScheduleRequestDTO;
import com.healthcare.dto.DoctorScheduleResponseDTO;
import com.healthcare.entity.DoctorSchedule;
import com.healthcare.entity.User;
import com.healthcare.repository.DoctorScheduleRepository;
import com.healthcare.repository.UserRepository;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;


@Service
@RequiredArgsConstructor
public class DoctorScheduleServiceImpl implements DoctorScheduleService {
    
    private final DoctorScheduleRepository doctorScheduleRepository;
    private final UserRepository userRepository; // Assuming a UserRepository exists

    // Converts an entity to a DTO
    private DoctorScheduleResponseDTO toDTO(DoctorSchedule schedule) {
        DoctorScheduleResponseDTO dto = new DoctorScheduleResponseDTO();
        dto.setId(schedule.getId());
        dto.setDate(schedule.getDate());
        dto.setStartTime(schedule.getStartTime());
        dto.setEndTime(schedule.getEndTime());
        dto.setIsAvailable(schedule.getIsAvailable());
        if (schedule.getDoctor() != null) {
            dto.setDoctorId(schedule.getDoctor().getId());
            // Use email instead of username to avoid lazy loading issues
            dto.setDoctorName(schedule.getDoctor().getEmail());
        }
        return dto;
    }
    
    @Override
    @Transactional
    public DoctorScheduleResponseDTO createSchedule(DoctorScheduleRequestDTO dto) {
        User doctor = userRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + dto.getDoctorId()));

        // Check for time conflicts for the same doctor on the same day
        List<DoctorSchedule> existingSchedules = doctorScheduleRepository.findByDoctorIdAndDate(doctor.getId(), dto.getDate());
        boolean hasConflict = existingSchedules.stream()
                .anyMatch(schedule -> 
                    dto.getStartTime().isBefore(schedule.getEndTime()) && 
                    dto.getEndTime().isAfter(schedule.getStartTime())
                );

        if (hasConflict) {
            throw new TimeConflictException("The new schedule conflicts with an existing one for the doctor.");
        }

        DoctorSchedule newSchedule = DoctorSchedule.builder()
                .doctor(doctor)
                .date(dto.getDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .isAvailable(true)
                .build();
        
        DoctorSchedule savedSchedule = doctorScheduleRepository.save(newSchedule);
        return toDTO(savedSchedule);
    }

    @Override
    @Transactional
    public DoctorScheduleResponseDTO updateSchedule(Long id, DoctorScheduleRequestDTO dto) {
        DoctorSchedule existingSchedule = doctorScheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with ID: " + id));

        User doctor = userRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + dto.getDoctorId()));
        
        // Check for time conflicts, excluding the schedule being updated
        List<DoctorSchedule> existingSchedules = doctorScheduleRepository.findByDoctorIdAndDate(doctor.getId(), dto.getDate());
        boolean hasConflict = existingSchedules.stream()
                .filter(schedule -> !schedule.getId().equals(id)) // Exclude the current schedule
                .anyMatch(schedule -> 
                    dto.getStartTime().isBefore(schedule.getEndTime()) && 
                    dto.getEndTime().isAfter(schedule.getStartTime())
                );
        
        if (hasConflict) {
            throw new TimeConflictException("The updated schedule conflicts with an existing one for the doctor.");
        }

        existingSchedule.setDoctor(doctor);
        existingSchedule.setDate(dto.getDate());
        existingSchedule.setStartTime(dto.getStartTime());
        existingSchedule.setEndTime(dto.getEndTime());
        
        DoctorSchedule updatedSchedule = doctorScheduleRepository.save(existingSchedule);
        return toDTO(updatedSchedule);
    }

    @Override
    @Transactional
    public DoctorScheduleResponseDTO getScheduleById(Long id) {
        DoctorSchedule schedule = doctorScheduleRepository.findByIdWithDoctor(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with ID: " + id));
        return toDTO(schedule);
    }

    @Override
    @Transactional
    public List<DoctorScheduleResponseDTO> getAllSchedules() {
        List<DoctorSchedule> schedules = doctorScheduleRepository.findAllWithDoctor();
        return schedules.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<DoctorScheduleResponseDTO> getMySchedules() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User doctor = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        
        List<DoctorSchedule> schedules = doctorScheduleRepository.findByDoctorIdWithDoctor(doctor.getId());
        return schedules.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<DoctorScheduleResponseDTO> getDoctorSchedules(Long doctorId) {
        List<DoctorSchedule> schedules = doctorScheduleRepository.findByDoctorIdWithDoctor(doctorId);
        return schedules.stream().map(this::toDTO).collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public List<DoctorScheduleResponseDTO> findAvailableSchedules(LocalDate date) {
        List<DoctorSchedule> schedules = doctorScheduleRepository.findAvailableSchedulesWithDoctor(date);
        return schedules.stream().map(this::toDTO).collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public DoctorScheduleResponseDTO bookSchedule(Long scheduleId) {
        DoctorSchedule schedule = doctorScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with ID: " + scheduleId));
        
        if (!schedule.getIsAvailable()) {
            throw new ScheduleAlreadyBookedException("This schedule is already booked.");
        }
        
        schedule.setIsAvailable(false);
        DoctorSchedule bookedSchedule = doctorScheduleRepository.save(schedule);
        return toDTO(bookedSchedule);
    }
    
    @Override
    @Transactional
    public void deleteSchedule(Long id) {
        if (!doctorScheduleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Schedule not found with ID: " + id);
        }
        doctorScheduleRepository.deleteById(id);
    }
}
