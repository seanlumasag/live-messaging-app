package com.livemessaging.backend.repository;

import com.livemessaging.backend.model.RoomMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RoomMemberRepository extends JpaRepository<RoomMember, UUID> {
    boolean existsByRoomIdAndUserId(UUID roomId, UUID userId);
    List<RoomMember> findByUserId(UUID userId);
    List<RoomMember> findByRoomId(UUID roomId);
    void deleteByRoomId(UUID roomId);
}
