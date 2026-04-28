package com.livemessaging.backend.dto;

import java.time.Instant;

public class RoomResponse {
    private String id;
    private String name;
    private String type;
    private Instant createdAt;

    public RoomResponse() {
    }

    public RoomResponse(String id, String name, Instant createdAt) {
        this(id, name, "PUBLIC", createdAt);
    }

    public RoomResponse(String id, String name, String type, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
