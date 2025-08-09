package com.healthcare.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${app.name:Healthcare Portal}")
    private String appName;
    
    @Override
    public void sendSignupOtp(String to, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Verify Your Email - " + appName);
            
            Context context = new Context();
            context.setVariable("otp", otp);
            context.setVariable("appName", appName);
            context.setVariable("type", "signup");
            
            String htmlContent = templateEngine.process("otp-email", context);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send signup OTP email", e);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send signup OTP email", e);
        }
    }
    
    @Override
    public void sendPasswordResetOtp(String to, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Password Reset - " + appName);
            
            Context context = new Context();
            context.setVariable("otp", otp);
            context.setVariable("appName", appName);
            context.setVariable("type", "password-reset");
            
            String htmlContent = templateEngine.process("otp-email", context);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send password reset OTP email", e);
        }
    }
    
    @Override
    public void sendWelcomeEmail(String to, String firstName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Welcome to " + appName);
            
            Context context = new Context();
            context.setVariable("firstName", firstName);
            context.setVariable("appName", appName);
            
            String htmlContent = templateEngine.process("welcome-email", context);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send welcome email", e);
        }
    }
    
    @Override
    public void sendPasswordResetConfirmation(String to, String firstName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Password Reset Successful - " + appName);
            
            Context context = new Context();
            context.setVariable("firstName", firstName);
            context.setVariable("appName", appName);
            
            String htmlContent = templateEngine.process("password-reset-confirmation", context);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send password reset confirmation email", e);
        }
    }
}
