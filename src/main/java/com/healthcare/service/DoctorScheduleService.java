package com.healthcare.service;

import java.time.LocalDate;
import java.util.List;
import com.healthcare.dto.DoctorScheduleRequestDTO;
import com.healthcare.dto.DoctorScheduleResponseDTO;

public interface DoctorScheduleService {
    
    DoctorScheduleResponseDTO createSchedule(DoctorScheduleRequestDTO dto);
    
    DoctorScheduleResponseDTO updateSchedule(Long id, DoctorScheduleRequestDTO dto);
    
    DoctorScheduleResponseDTO getScheduleById(Long id);
    
    List<DoctorScheduleResponseDTO> getAllSchedules();

    List<DoctorScheduleResponseDTO> getMySchedules();
    
    List<DoctorScheduleResponseDTO> getDoctorSchedules(Long doctorId);
    
    List<DoctorScheduleResponseDTO> findAvailableSchedules(LocalDate date);
    
    DoctorScheduleResponseDTO bookSchedule(Long scheduleId);
    
    void deleteSchedule(Long id);
}