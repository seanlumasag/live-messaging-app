package com.livemessaging.backend.repository;

import com.livemessaging.backend.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RoomRepository extends JpaRepository<Room, UUID> {
    boolean existsByNameIgnoreCase(String name);
    Optional<Room> findByNameIgnoreCase(String name);
}
