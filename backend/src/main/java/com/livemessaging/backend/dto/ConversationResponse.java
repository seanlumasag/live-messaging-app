package com.livemessaging.backend.dto;

import java.time.Instant;
import java.util.List;

public class ConversationResponse {
    private String id;
    private String name;
    private String type;
    private Instant createdAt;
    private List<FriendResponse> members;

    public ConversationResponse(String id, String name, String type, Instant createdAt, List<FriendResponse> members) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.createdAt = createdAt;
        this.members = members;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getType() {
        return type;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public List<FriendResponse> getMembers() {
        return members;
    }
}
