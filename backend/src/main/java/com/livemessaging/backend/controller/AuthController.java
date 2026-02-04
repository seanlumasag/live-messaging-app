package com.livemessaging.backend.controller;

import com.livemessaging.backend.dto.AuthResponse;
import com.livemessaging.backend.dto.LoginRequest;
import com.livemessaging.backend.dto.SignupRequest;
import com.livemessaging.backend.model.User;
import com.livemessaging.backend.security.CustomUserDetailsService;
import com.livemessaging.backend.service.JwtService;
import com.livemessaging.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public AuthController(UserService userService, JwtService jwtService, CustomUserDetailsService userDetailsService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request) {
        User user = userService.register(request);
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(token, user.getId(), user.getEmail(), user.getDisplayName()));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        User user = userService.authenticate(request);
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);
        return ResponseEntity.ok(new AuthResponse(token, user.getId(), user.getEmail(), user.getDisplayName()));
    }

    @PostMapping("/delete")
    public ResponseEntity<Void> deleteAccount(@RequestBody LoginRequest request) {
        User user = userService.authenticate(request);
        userService.deleteByEmail(user.getEmail());
        return ResponseEntity.noContent().build();
    }
}
