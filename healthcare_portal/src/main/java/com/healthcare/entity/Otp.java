package com.healthcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Entity
@Table(name = "otps",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"email", "type", "is_used"})
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class Otp extends BaseEntity {
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String otpCode;
    
    @Column(nullable = false)
    private OtpType type; // SIGNUP, FORGOT_PASSWORD
    
    @Column(nullable = false)
    private LocalDateTime expiryTime;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isUsed = false;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer attempts = 0;
    
    public enum OtpType {
        SIGNUP,
        FORGOT_PASSWORD
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryTime);
    }
    
    public boolean canAttempt() {
        return attempts < 3 && !isExpired() && !isUsed;
    }
    
    public void incrementAttempts() {
        this.attempts++;
    }
}
