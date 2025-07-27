package com.healthcare.dto; // <--- IMPORTANT: Ensure this matches your DTO package name (e.g., 'dto')

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor; // <--- ADD THIS
import lombok.Getter;
import lombok.NoArgsConstructor; // Keep this if you want a no-arg constructor too
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor // Keep this if you want an empty constructor
@AllArgsConstructor // <--- ADD THIS to generate the (email, password) constructor
public class UserSignInDTO { // <--- IMPORTANT: Ensure this matches your DTO class name (e.g., 'UserSignInDTO')

    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password cannot be empty")
    private String password;
}