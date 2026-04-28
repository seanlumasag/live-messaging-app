package com.livemessaging.backend.dto;

import com.livemessaging.backend.model.User;

public class FriendResponse {
    private String id;
    private String username;
    private String displayName;
    private boolean online;

    public FriendResponse(User user) {
        this.id = user.getId().toString();
        this.username = user.getUsername() == null ? "" : user.getUsername();
        this.displayName = user.getDisplayName();
        this.online = false;
    }

    public String getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getDisplayName() {
        return displayName;
    }

    public boolean isOnline() {
        return online;
    }
}
