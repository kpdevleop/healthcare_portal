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
import com.healthcare.repository.AppointmentRepository;
import com.healthcare.entity.Appointment;
import java.time.format.DateTimeFormatter;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;


@Service
@RequiredArgsConstructor
public class DoctorScheduleServiceImpl implements DoctorScheduleService {
    
    private final DoctorScheduleRepository doctorScheduleRepository;
    private final UserRepository userRepository; // Assuming a UserRepository exists
    private final AppointmentRepository appointmentRepository;

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
            dto.setDoctorName(schedule.getDoctor().getFirstName() + " " + schedule.getDoctor().getLastName());
            dto.setDoctorFirstName(schedule.getDoctor().getFirstName());
            dto.setDoctorLastName(schedule.getDoctor().getLastName());
            dto.setDoctorEmail(schedule.getDoctor().getEmail());
            // Add department information
            if (schedule.getDoctor().getDepartment() != null) {
                dto.setDepartmentId(schedule.getDoctor().getDepartment().getId());
                dto.setDepartmentName(schedule.getDoctor().getDepartment().getName());
            }
        }
        
        // Add bookedTimes - get all appointments for this schedule
        List<Appointment> appointments = appointmentRepository.findByScheduleId(schedule.getId());
        List<String> bookedTimes = appointments.stream()
            .filter(a -> !"CANCELLED".equalsIgnoreCase(a.getStatus()))
            .map(a -> a.getAppointmentTime().toString().substring(0,5))
            .collect(Collectors.toList());
        dto.setBookedTimes(bookedTimes);
        
        return dto;
    }
    
    // Helper method to generate all possible time slots for a schedule
    private List<String> generateTimeSlots(java.time.LocalTime startTime, java.time.LocalTime endTime) {
        List<String> slots = new java.util.ArrayList<>();
        java.time.LocalTime current = startTime;
        while (current.isBefore(endTime)) {
            slots.add(String.format("%02d:%02d", current.getHour(), current.getMinute()));
            current = current.plusMinutes(30);
        }
        return slots;
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
    
    @Override
    @Transactional
    public void deleteMySchedule(Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User doctor = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        
        DoctorSchedule schedule = doctorScheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with ID: " + id));
        
        // Check if the schedule belongs to the authenticated doctor
        if (!schedule.getDoctor().getId().equals(doctor.getId())) {
            throw new ResourceNotFoundException("Schedule not found with ID: " + id);
        }
        
        doctorScheduleRepository.deleteById(id);
    }
}
