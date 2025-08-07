package com.healthcare.entity;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "departments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department extends BaseEntity {

	@Column(nullable = false, unique = true, length = 100)
	@NotBlank(message = "Department name cannot be empty")
	@Size(max = 100, message = "Department name cannot exceed 100 characters")
	private String name;

	@Lob // Used for TEXT type in MySQL
	@Column(columnDefinition = "TEXT")
	private String description;
	
	@OneToMany(mappedBy = "department")
	private List<User> users;

}
