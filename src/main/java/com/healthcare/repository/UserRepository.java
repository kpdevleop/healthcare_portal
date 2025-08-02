package com.healthcare.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.healthcare.entity.User;
import com.healthcare.entity.UserRole;

public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByEmail(String email);
	
	List<User> findByRole(UserRole role);
}
