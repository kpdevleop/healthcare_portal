package com.healthcare.entity;

import java.time.LocalDate;
import java.util.Collection; // Needed for getAuthorities()
import java.util.List;     // Needed for getAuthorities()

import org.hibernate.validator.constraints.URL;
// Spring Security Imports: THESE ARE CRUCIAL!
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
// IMPORTANT: Re-add 'implements UserDetails'
public class User extends BaseEntity implements UserDetails {

	@Column(nullable = false, length = 255)
	@NotBlank(message = "Password cannot be empty")
	@Size(min = 8, message = "Password must be at least 8 characters long")
	private String password; // Store hashed password

	@Column(nullable = false, unique = true, length = 100)
	@NotBlank(message = "Email cannot be empty")
	@Email(message = "Invalid email format")
	@Size(max = 100, message = "Email cannot exceed 100 characters")
	private String email;

	@Column(name = "first_name", nullable = false, length = 50)
	@NotBlank(message = "First name cannot be empty")
	@Size(max = 50, message = "First name cannot exceed 50 characters")
	private String firstName;

	@Column(name = "last_name", nullable = false, length = 50)
	@NotBlank(message = "Last name cannot be empty")
	@Size(max = 50, message = "Last name cannot exceed 50 characters")
	private String lastName;

	@Column(name = "phone_number", length = 20)
	@Pattern(regexp = "^\\+?[0-9. ()-]{7,25}$", message = "Invalid phone number format")
	private String phoneNumber;

	@Enumerated(EnumType.STRING) // Store enum as String in the database
	@Column(name = "role", nullable = false, length = 20) // Give the column a name and appropriate length
	@NotNull(message = "User must have a role")
	private UserRole role;

	@Column(name = "profile_photo_url", length = 255)
	@URL(message = "Invalid profile photo URL format")
	private String profilePhotoUrl;

	// Patient specific fields
	@Column(name = "date_of_birth")
	@Past(message = "Date of birth must be in the past")
	private LocalDate dateOfBirth;

	@Column(length = 10)
	@Pattern(regexp = "Male|Female|Other", message = "Gender must be Male, Female, or Other")
	private String gender;

	@Lob // Used for TEXT type in MySQL
	@Column(columnDefinition = "TEXT")
	private String address;

	// Doctor specific fields
	@Column(length = 100)
	@Size(max = 100, message = "Specialization cannot exceed 100 characters")
	private String specialization;

	@Column(name = "license_number", unique = true, length = 50)
	@Size(max = 50, message = "License number cannot exceed 50 characters")
	private String licenseNumber;

	@Column(name = "experience_years")
	@Min(value = 0, message = "Experience years cannot be negative")
	private Integer experienceYears;

	@ManyToOne(fetch = FetchType.LAZY) // Department might not always be loaded
	@JoinColumn(name = "department_id")
	private Department department;


    // Implementation of UserDetails methods (REQUIRED if 'implements UserDetails')
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
	    return List.of(new SimpleGrantedAuthority(this.role.name()));
	}
    @Override
    public String getUsername() {
        return this.email; // Email is used as the username for authentication
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // For now, assuming accounts never expire. Implement actual logic if needed.
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // For now, assuming accounts are never locked. Implement actual logic if needed.
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // For now, assuming credentials never expire. Implement actual logic if needed.
    }

    @Override
    public boolean isEnabled() {
        return true; // For now, assuming accounts are always enabled. Implement actual logic if needed.
    }
    
    // Custom password validation method
    public boolean isPasswordValid() {
        if (password == null || password.length() < 8) {
            return false;
        }
        
        boolean hasLower = false;
        boolean hasUpper = false;
        boolean hasDigit = false;
        boolean hasSpecial = false;
        
        for (char c : password.toCharArray()) {
            if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else hasSpecial = true;
        }
        
        return hasLower && hasUpper && hasDigit && hasSpecial;
    }
    
    // End of UserDetails implementations
}