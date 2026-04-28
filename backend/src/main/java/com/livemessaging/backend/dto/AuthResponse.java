package com.livemessaging.backend.dto;

import java.util.UUID;

public class AuthResponse {
    private String token;
    private UUID userId;
    private String email;
    private String username;
    private String displayName;

    public AuthResponse(String token, UUID userId, String email, String displayName) {
        this(token, userId, email, null, displayName);
    }

    public AuthResponse(String token, UUID userId, String email, String username, String displayName) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.username = username;
        this.displayName = displayName;
    }

    public String getToken() {
        return token;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getUsername() {
        return username;
    }

    public String getDisplayName() {
        return displayName;
    }
}
