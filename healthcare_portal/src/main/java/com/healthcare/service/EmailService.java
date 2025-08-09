package com.healthcare.service;

public interface EmailService {
    
    /**
     * Send OTP email for signup verification
     */
    void sendSignupOtp(String to, String otp);
    
    /**
     * Send OTP email for password reset
     */
    void sendPasswordResetOtp(String to, String otp);
    
    /**
     * Send welcome email after successful signup
     */
    void sendWelcomeEmail(String to, String firstName);
    
    /**
     * Send password reset confirmation
     */
    void sendPasswordResetConfirmation(String to, String firstName);
}
