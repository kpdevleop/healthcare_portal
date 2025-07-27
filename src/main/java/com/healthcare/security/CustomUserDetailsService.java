package com.healthcare.security;

import com.healthcare.entity.User;
import com.healthcare.custom_exceptions.ResourceNotFoundException;
import com.healthcare.repository.UserRepository; // <--- IMPORTANT: Ensure this matches your repository package and name (e.g., 'com.healthcare.dao.UserDao' if you're using 'dao')
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository; // <--- IMPORTANT: Ensure this matches your repository interface name and type

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email) // <--- Correct usage
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Use the User entity directly if it implements UserDetails, otherwise wrap it
        return user; // Assuming User.java implements UserDetails and its methods
    }
}