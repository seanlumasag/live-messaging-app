package com.livemessaging.backend.dto;

import com.livemessaging.backend.model.User;

public class UserResponse {
    private String id;
    private String email;
    private String username;
    private String displayName;
    private String bio;

    public UserResponse(User user) {
        this.id = user.getId().toString();
        this.email = user.getEmail();
        this.username = user.getUsername() == null ? "" : user.getUsername();
        this.displayName = user.getDisplayName();
        this.bio = user.getBio();
    }

    public String getId() {
        return id;
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

    public String getBio() {
        return bio;
    }
}
