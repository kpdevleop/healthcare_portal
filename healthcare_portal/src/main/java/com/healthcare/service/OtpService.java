package com.healthcare.service;

import com.healthcare.entity.Otp;

public interface OtpService {
    
    /**
     * Generate and send OTP for signup verification
     */
    void sendSignupOtp(String email);
    
    /**
     * Generate and send OTP for password reset
     */
    void sendPasswordResetOtp(String email);
    
    /**
     * Verify OTP for signup
     */
    boolean verifySignupOtp(String email, String otp);
    
    /**
     * Verify OTP for password reset
     */
    boolean verifyPasswordResetOtp(String email, String otp);
    
    /**
     * Generate a new OTP code
     */
    String generateOtp();
    
    /**
     * Check if user can request new OTP
     */
    boolean canRequestOtp(String email, Otp.OtpType type);
}
