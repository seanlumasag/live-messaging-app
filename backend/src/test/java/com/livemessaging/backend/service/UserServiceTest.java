package com.livemessaging.backend.service;

import com.livemessaging.backend.dto.LoginRequest;
import com.livemessaging.backend.dto.SignupRequest;
import com.livemessaging.backend.model.User;
import com.livemessaging.backend.repository.MessageRepository;
import com.livemessaging.backend.repository.RoomMemberRepository;
import com.livemessaging.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class UserServiceTest {

    @Test
    void registerCreatesUserWithHashedPassword() {
        UserRepository userRepository = mock(UserRepository.class);
        RoomMemberRepository roomMemberRepository = mock(RoomMemberRepository.class);
        MessageRepository messageRepository = mock(MessageRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        UserService userService = new UserService(
                userRepository,
                passwordEncoder,
                roomMemberRepository,
                messageRepository
        );

        SignupRequest request = new SignupRequest();
        request.setEmail("Test@Email.com");
        request.setPassword("password123");
        request.setDisplayName("Test User");

        when(userRepository.existsByEmail("test@email.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User user = userService.register(request);

        assertNotNull(user);
        assertEquals("test@email.com", user.getEmail());
        assertEquals("Test User", user.getDisplayName());
        assertEquals("hashed", user.getPasswordHash());
    }

    @Test
    void registerThrowsWhenEmailExists() {
        UserRepository userRepository = mock(UserRepository.class);
        RoomMemberRepository roomMemberRepository = mock(RoomMemberRepository.class);
        MessageRepository messageRepository = mock(MessageRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        UserService userService = new UserService(
                userRepository,
                passwordEncoder,
                roomMemberRepository,
                messageRepository
        );

        SignupRequest request = new SignupRequest();
        request.setEmail("test@email.com");
        request.setPassword("password123");
        request.setDisplayName("Test User");

        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> userService.register(request));
    }

    @Test
    void authenticateThrowsOnBadCredentials() {
        UserRepository userRepository = mock(UserRepository.class);
        RoomMemberRepository roomMemberRepository = mock(RoomMemberRepository.class);
        MessageRepository messageRepository = mock(MessageRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        UserService userService = new UserService(
                userRepository,
                passwordEncoder,
                roomMemberRepository,
                messageRepository
        );

        User stored = new User();
        stored.setEmail("test@email.com");
        stored.setPasswordHash("hashed");

        LoginRequest request = new LoginRequest();
        request.setEmail("test@email.com");
        request.setPassword("wrong");

        when(userRepository.findByEmail("test@email.com")).thenReturn(Optional.of(stored));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> userService.authenticate(request));
    }
}
