package com.healthcare.dto;

import com.healthcare.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    private Long userId;
    private String email;
    private UserRole role;
    private String firstName;
    private String lastName;
    // Add other relevant user details for the client
}