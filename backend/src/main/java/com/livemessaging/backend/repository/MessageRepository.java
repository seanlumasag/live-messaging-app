package com.livemessaging.backend.repository;

import com.livemessaging.backend.model.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findByRoomIdOrderByCreatedAtAsc(UUID roomId, Pageable pageable);
    void deleteByRoomId(UUID roomId);
}
