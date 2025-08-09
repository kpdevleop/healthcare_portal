package com.healthcare.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.healthcare.entity.User;
import com.healthcare.entity.UserRole;

public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByEmail(String email);
	
	@Query("SELECT u FROM User u LEFT JOIN FETCH u.department WHERE u.email = :email")
	Optional<User> findByEmailWithDepartment(@Param("email") String email);
	
	List<User> findByRole(UserRole role);
	
	@Query("SELECT u FROM User u LEFT JOIN FETCH u.department WHERE u.role = :role")
	List<User> findByRoleWithDepartment(@Param("role") UserRole role);
}
