package com.livemessaging.backend.service;

import com.livemessaging.backend.dto.RoomResponse;
import com.livemessaging.backend.model.Room;
import com.livemessaging.backend.model.RoomMember;
import com.livemessaging.backend.model.User;
import com.livemessaging.backend.repository.MessageRepository;
import com.livemessaging.backend.repository.RoomMemberRepository;
import com.livemessaging.backend.repository.RoomRepository;
import com.livemessaging.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;

    public RoomService(
            RoomRepository roomRepository,
            RoomMemberRepository roomMemberRepository,
            UserRepository userRepository,
            MessageRepository messageRepository
    ) {
        this.roomRepository = roomRepository;
        this.roomMemberRepository = roomMemberRepository;
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
    }

    public List<RoomResponse> listRoomsForUser(String email) {
        User user = getUserByEmail(email);
        return roomMemberRepository.findByUserId(user.getId())
                .stream()
                .map(RoomMember::getRoom)
                .sorted(Comparator.comparing(Room::getCreatedAt))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public RoomResponse createRoom(String name, String email) {
        if (name == null || name.trim().isBlank()) {
            throw new IllegalArgumentException("Room name is required");
        }

        String normalizedName = name.trim();
        if (roomRepository.existsByNameIgnoreCase(normalizedName)) {
            throw new IllegalArgumentException("Room already exists");
        }

        User user = getUserByEmail(email);

        Room room = new Room();
        room.setName(normalizedName);
        room = roomRepository.save(room);

        RoomMember member = new RoomMember();
        member.setRoom(room);
        member.setUser(user);
        roomMemberRepository.save(member);

        return toResponse(room);
    }

    @Transactional
    public void joinRoom(UUID roomId, String email) {
        User user = getUserByEmail(email);
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        if (roomMemberRepository.existsByRoomIdAndUserId(room.getId(), user.getId())) {
            return;
        }

        RoomMember member = new RoomMember();
        member.setRoom(room);
        member.setUser(user);
        roomMemberRepository.save(member);
    }

    @Transactional
    public void joinRoomByName(String name, String email) {
        User user = getUserByEmail(email);
        Room room = roomRepository.findByNameIgnoreCase(name)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        if (roomMemberRepository.existsByRoomIdAndUserId(room.getId(), user.getId())) {
            return;
        }

        RoomMember member = new RoomMember();
        member.setRoom(room);
        member.setUser(user);
        roomMemberRepository.save(member);
    }

    public boolean isMember(UUID roomId, UUID userId) {
        return roomMemberRepository.existsByRoomIdAndUserId(roomId, userId);
    }

    public Room getRoom(UUID roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
    }

    public Room getRoomByName(String name) {
        if (name == null || name.trim().isBlank()) {
            throw new IllegalArgumentException("Room not found");
        }

        return roomRepository.findByNameIgnoreCase(name.trim())
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
    }

    @Transactional
    public void deleteRoom(UUID roomId, String email) {
        User user = getUserByEmail(email);
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        if (!roomMemberRepository.existsByRoomIdAndUserId(roomId, user.getId())) {
            throw new IllegalArgumentException("Unauthorized");
        }

        messageRepository.deleteByRoomId(roomId);
        roomMemberRepository.deleteByRoomId(roomId);
        roomRepository.delete(room);
    }

    private User getUserByEmail(String email) {
        if (email == null || email.trim().isBlank()) {
            throw new IllegalArgumentException("Unauthorized");
        }

        String normalized = email.trim().toLowerCase();
        return userRepository.findByEmail(normalized)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private RoomResponse toResponse(Room room) {
        return new RoomResponse(room.getId().toString(), room.getName(), room.getCreatedAt());
    }
}
