package com.livemessaging.backend.service;

import com.livemessaging.backend.dto.PasswordChangeRequest;
import com.livemessaging.backend.dto.ProfileUpdateRequest;
import com.livemessaging.backend.dto.LoginRequest;
import com.livemessaging.backend.dto.SignupRequest;
import com.livemessaging.backend.model.User;
import com.livemessaging.backend.repository.FriendRequestRepository;
import com.livemessaging.backend.repository.MessageRepository;
import com.livemessaging.backend.repository.RoomMemberRepository;
import com.livemessaging.backend.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoomMemberRepository roomMemberRepository;
    private final MessageRepository messageRepository;
    private final FriendRequestRepository friendRequestRepository;

    @Autowired
    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            RoomMemberRepository roomMemberRepository,
            MessageRepository messageRepository
    ) {
        this(userRepository, passwordEncoder, roomMemberRepository, messageRepository, null);
    }

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            RoomMemberRepository roomMemberRepository,
            MessageRepository messageRepository,
            FriendRequestRepository friendRequestRepository
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roomMemberRepository = roomMemberRepository;
        this.messageRepository = messageRepository;
        this.friendRequestRepository = friendRequestRepository;
    }

    public User register(SignupRequest request) {
        if (request.getEmail() == null || request.getPassword() == null || request.getDisplayName() == null) {
            throw new IllegalArgumentException("Missing required fields");
        }

        String email = request.getEmail().trim().toLowerCase();
        String username = normalizeUsername(request.getUsername());
        if (username == null || username.isBlank()) {
            username = normalizeUsername(email.split("@")[0]);
        }
        if (email.isBlank() || request.getPassword().isBlank() || request.getDisplayName().isBlank()) {
            throw new IllegalArgumentException("Missing required fields");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use");
        }
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already in use");
        }

        User user = new User();
        user.setEmail(email);
        user.setUsername(username);
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

    public User getByEmail(String email) {
        if (email == null || email.trim().isBlank()) {
            throw new IllegalArgumentException("Unauthorized");
        }
        return userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @Transactional
    public User updateProfile(String email, ProfileUpdateRequest request) {
        User user = getByEmail(email);
        if (request.getEmail() != null && !request.getEmail().trim().isBlank()) {
            String newEmail = request.getEmail().trim().toLowerCase();
            if (!newEmail.equals(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                throw new IllegalArgumentException("Email already in use");
            }
            user.setEmail(newEmail);
        }
        if (request.getUsername() != null && !request.getUsername().trim().isBlank()) {
            String username = normalizeUsername(request.getUsername());
            if (!username.equals(user.getUsername()) && userRepository.existsByUsername(username)) {
                throw new IllegalArgumentException("Username already in use");
            }
            user.setUsername(username);
        }
        if (request.getDisplayName() != null && !request.getDisplayName().trim().isBlank()) {
            user.setDisplayName(request.getDisplayName().trim());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio().trim());
        }
        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(String email, PasswordChangeRequest request) {
        if (request == null || request.getCurrentPassword() == null || request.getNewPassword() == null
                || request.getCurrentPassword().isBlank() || request.getNewPassword().isBlank()) {
            throw new BadCredentialsException("Invalid credentials");
        }
        User user = getByEmail(email);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
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
                    if (friendRequestRepository != null) {
                        friendRequestRepository.deleteByRequesterIdOrRecipientId(user.getId(), user.getId());
                    }
                    messageRepository.deleteBySenderId(user.getId());
                    roomMemberRepository.deleteByUserId(user.getId());
                    userRepository.delete(user);
                    return true;
                })
                .orElse(false);
    }

    @Transactional
    public boolean deleteByEmailAndPassword(String email, String password) {
        if (email == null || password == null) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String normalized = email.trim().toLowerCase();
        if (normalized.isBlank() || password.isBlank()) {
            throw new BadCredentialsException("Invalid credentials");
        }

        User user = userRepository.findByEmail(normalized)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        if (friendRequestRepository != null) {
            friendRequestRepository.deleteByRequesterIdOrRecipientId(user.getId(), user.getId());
        }
        messageRepository.deleteBySenderId(user.getId());
        roomMemberRepository.deleteByUserId(user.getId());
        userRepository.delete(user);
        return true;
    }

    private String normalizeUsername(String username) {
        if (username == null) {
            return null;
        }
        String normalized = username.trim().toLowerCase();
        if (!normalized.matches("[a-z0-9_.-]{3,32}")) {
            throw new IllegalArgumentException("Username must be 3-32 characters using letters, numbers, dots, underscores, or dashes");
        }
        return normalized;
    }
}
