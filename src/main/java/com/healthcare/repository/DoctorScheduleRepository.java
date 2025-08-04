package com.healthcare.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.healthcare.entity.DoctorSchedule;

@Repository
public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Long> {
    
    List<DoctorSchedule> findByDoctorIdAndDate(Long doctorId, LocalDate date);
    
    List<DoctorSchedule> findByIsAvailableTrueAndDate(LocalDate date);
    
    List<DoctorSchedule> findByDoctorId(Long doctorId);
    
    @Query("SELECT ds FROM DoctorSchedule ds JOIN FETCH ds.doctor WHERE ds.id = :id")
    Optional<DoctorSchedule> findByIdWithDoctor(@Param("id") Long id);
    
    @Query("SELECT ds FROM DoctorSchedule ds JOIN FETCH ds.doctor")
    List<DoctorSchedule> findAllWithDoctor();
    
    @Query("SELECT ds FROM DoctorSchedule ds JOIN FETCH ds.doctor WHERE ds.doctor.id = :doctorId")
    List<DoctorSchedule> findByDoctorIdWithDoctor(@Param("doctorId") Long doctorId);
    
    @Query("SELECT ds FROM DoctorSchedule ds JOIN FETCH ds.doctor WHERE ds.isAvailable = true AND ds.date = :date")
    List<DoctorSchedule> findAvailableSchedulesWithDoctor(@Param("date") LocalDate date);
}