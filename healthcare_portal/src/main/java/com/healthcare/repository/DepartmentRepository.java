package com.healthcare.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.healthcare.entity.Department;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
	
	Optional<Department> findByNameIgnoreCase(String name);
	
	@Query("SELECT d FROM Department d WHERE LOWER(d.name) = LOWER(:name) AND d.id != :id")
	Optional<Department> findByNameIgnoreCaseAndIdNot(@Param("name") String name, @Param("id") Long id);
	
	@Query("SELECT d FROM Department d")
	List<Department> findAllDepartments();
	
	@Query("SELECT COUNT(u) > 0 FROM User u WHERE u.department.id = :departmentId")
	boolean hasUsers(@Param("departmentId") Long departmentId);
}
