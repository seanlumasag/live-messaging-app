package com.livemessaging.backend.dto;

import com.livemessaging.backend.model.FriendRequest;
import com.livemessaging.backend.model.User;

import java.time.Instant;

public class FriendRequestResponse {
    private String id;
    private String userId;
    private String username;
    private String displayName;
    private String status;
    private Instant createdAt;

    public FriendRequestResponse(FriendRequest request, User visibleUser) {
        this.id = request.getId().toString();
        this.userId = visibleUser.getId().toString();
        this.username = visibleUser.getUsername();
        this.displayName = visibleUser.getDisplayName();
        this.status = request.getStatus().name();
        this.createdAt = request.getCreatedAt();
    }

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
