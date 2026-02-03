package com.livemessaging.backend.service;

import com.livemessaging.backend.dto.LoginRequest;
import com.livemessaging.backend.dto.SignupRequest;
import com.livemessaging.backend.model.User;
import com.livemessaging.backend.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(SignupRequest request) {
        if (request.getEmail() == null || request.getPassword() == null || request.getDisplayName() == null) {
            throw new IllegalArgumentException("Missing required fields");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (email.isBlank() || request.getPassword().isBlank() || request.getDisplayName().isBlank()) {
            throw new IllegalArgumentException("Missing required fields");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use");
        }

        User user = new User();
        user.setEmail(email);
        user.setDisplayName(request.getDisplayName().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        return userRepository.save(user);
    }

    public User authenticate(LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        return user;
    }

    @Transactional
    public boolean deleteByEmail(String email) {
        if (email == null) {
            return false;
        }

        String normalized = email.trim().toLowerCase();
        if (normalized.isBlank()) {
            return false;
        }

        return userRepository.findByEmail(normalized)
                .map(user -> {
                    userRepository.delete(user);
                    return true;
                })
                .orElse(false);
    }
}
