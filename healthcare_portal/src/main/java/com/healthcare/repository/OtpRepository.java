package com.healthcare.repository;

import com.healthcare.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {
    
    Optional<Otp> findByEmailAndTypeAndIsUsedFalse(String email, Otp.OtpType type);
    
    @Query("SELECT o FROM Otp o WHERE o.email = :email AND o.type = :type AND o.isUsed = false AND o.expiryTime > CURRENT_TIMESTAMP ORDER BY o.creationDate DESC")
    Optional<Otp> findLatestValidOtp(@Param("email") String email, @Param("type") Otp.OtpType type);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM Otp o WHERE o.email = :email AND o.type = :type")
    void deleteByEmailAndType(@Param("email") String email, @Param("type") Otp.OtpType type);
    
    @Query("SELECT COUNT(o) FROM Otp o WHERE o.email = :email AND o.type = :type AND o.updatedOn > :since")
    long countRecentOtps(@Param("email") String email, @Param("type") Otp.OtpType type, @Param("since") java.time.LocalDateTime since);
}
