package com.livemessaging.backend.repository;

import com.livemessaging.backend.model.Room;
import com.livemessaging.backend.model.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoomRepository extends JpaRepository<Room, UUID> {
    boolean existsByNameIgnoreCase(String name);
    Optional<Room> findByNameIgnoreCase(String name);
    Optional<Room> findByDirectKey(String directKey);
    List<Room> findByType(RoomType type);
}
