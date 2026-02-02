package com.livemessaging.backend.dto;

import java.util.UUID;

public class AuthResponse {
    private String token;
    private UUID userId;
    private String email;
    private String displayName;

    public AuthResponse(String token, UUID userId, String email, String displayName) {
        this.token = token;
        this.userId = userId;
        this.email = email;
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

    public String getDisplayName() {
        return displayName;
    }
}
