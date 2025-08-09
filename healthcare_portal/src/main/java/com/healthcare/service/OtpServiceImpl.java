package com.healthcare.service;

import com.healthcare.entity.Otp;
import com.healthcare.entity.User;
import com.healthcare.repository.OtpRepository;
import com.healthcare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@Transactional
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {
    
    private final OtpRepository otpRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    
    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final int MAX_OTP_REQUESTS_PER_HOUR = 3;
    
    @Override
    public void sendSignupOtp(String email) {
        // Check if user already exists
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("User with this email already exists");
        }
        
        // Check rate limiting
        if (!canRequestOtp(email, Otp.OtpType.SIGNUP)) {
            throw new RuntimeException("Too many OTP requests. Please wait before requesting another.");
        }
        
        // Delete any existing OTP for this email and type
        otpRepository.deleteByEmailAndType(email, Otp.OtpType.SIGNUP);
        
        // Generate and save OTP
        String otpCode = generateOtp();
        Otp otp = Otp.builder()
                .email(email)
                .otpCode(otpCode)
                .type(Otp.OtpType.SIGNUP)
                .expiryTime(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .isUsed(false)
                .attempts(0)
                .build();
        
        otpRepository.save(otp);
        
        // Send email asynchronously to avoid blocking the response
        try {
            // Use a separate thread for email sending to avoid blocking
            new Thread(() -> {
                try {
                    emailService.sendSignupOtp(email, otpCode);
                } catch (Exception e) {
                    // Log the error but don't fail the OTP generation
                    System.err.println("Email sending failed for " + email + ": " + e.getMessage());
                }
            }).start();
        } catch (Exception emailException) {
            // For now, let's continue without failing the entire process
            // In production, you might want to handle this differently
        }
    }
    
    @Override
    public void sendPasswordResetOtp(String email) {
        // Check if user exists
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            throw new RuntimeException("User with this email does not exist");
        }
        
        // Check rate limiting
        if (!canRequestOtp(email, Otp.OtpType.FORGOT_PASSWORD)) {
            throw new RuntimeException("Too many OTP requests. Please wait before requesting another.");
        }
        
        // Delete any existing OTP for this email and type
        otpRepository.deleteByEmailAndType(email, Otp.OtpType.FORGOT_PASSWORD);
        
        // Generate and save OTP
        String otpCode = generateOtp();
        Otp otp = Otp.builder()
                .email(email)
                .otpCode(otpCode)
                .type(Otp.OtpType.FORGOT_PASSWORD)
                .expiryTime(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .isUsed(false)
                .attempts(0)
                .build();
        
        otpRepository.save(otp);
        
        // Send email asynchronously to avoid blocking the response
        new Thread(() -> {
            try {
                emailService.sendPasswordResetOtp(email, otpCode);
            } catch (Exception e) {
                // Log the error but don't fail the OTP generation
                System.err.println("Email sending failed for " + email + ": " + e.getMessage());
            }
        }).start();
    }
    
    @Override
    public boolean verifySignupOtp(String email, String otp) {
        Optional<Otp> otpEntity = otpRepository.findLatestValidOtp(email, Otp.OtpType.SIGNUP);
        
        if (otpEntity.isEmpty()) {
            return false;
        }
        
        Otp otpObj = otpEntity.get();
        
        // Check if OTP is expired or already used
        if (otpObj.isExpired() || otpObj.getIsUsed()) {
            return false;
        }
        
        // Check attempts
        if (!otpObj.canAttempt()) {
            return false;
        }
        
        // Verify OTP
        if (otpObj.getOtpCode().equals(otp)) {
            otpObj.setIsUsed(true);
            otpRepository.save(otpObj);
            return true;
        } else {
            otpObj.incrementAttempts();
            otpRepository.save(otpObj);
            return false;
        }
    }
    
    @Override
    public boolean verifyPasswordResetOtp(String email, String otp) {
        Optional<Otp> otpEntity = otpRepository.findLatestValidOtp(email, Otp.OtpType.FORGOT_PASSWORD);
        
        if (otpEntity.isEmpty()) {
            return false;
        }
        
        Otp otpObj = otpEntity.get();
        
        // Check if OTP is expired or already used
        if (otpObj.isExpired() || otpObj.getIsUsed()) {
            return false;
        }
        
        // Check attempts
        if (!otpObj.canAttempt()) {
            return false;
        }
        
        // Verify OTP
        if (otpObj.getOtpCode().equals(otp)) {
            otpObj.setIsUsed(true);
            otpRepository.save(otpObj);
            return true;
        } else {
            otpObj.incrementAttempts();
            otpRepository.save(otpObj);
            return false;
        }
    }
    
    @Override
    public String generateOtp() {
        Random random = new Random();
        StringBuilder otp = new StringBuilder();
        
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        
        return otp.toString();
    }
    
    @Override
    public boolean canRequestOtp(String email, Otp.OtpType type) {
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        long recentOtps = otpRepository.countRecentOtps(email, type, oneHourAgo);
        
        return recentOtps < MAX_OTP_REQUESTS_PER_HOUR;
    }
}
