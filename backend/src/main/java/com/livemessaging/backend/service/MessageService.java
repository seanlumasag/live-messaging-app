package com.livemessaging.backend.service;

import com.livemessaging.backend.dto.ChatMessage;
import com.livemessaging.backend.model.Message;
import com.livemessaging.backend.model.Room;
import com.livemessaging.backend.model.User;
import com.livemessaging.backend.repository.MessageRepository;
import com.livemessaging.backend.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final RoomService roomService;
    private final UserRepository userRepository;

    public MessageService(MessageRepository messageRepository, RoomService roomService, UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.roomService = roomService;
        this.userRepository = userRepository;
    }

    @Transactional
    public ChatMessage sendMessage(UUID roomId, String senderEmail, String content) {
        if (content == null || content.trim().isBlank()) {
            throw new IllegalArgumentException("Message content is required");
        }

        Room room = roomService.getRoom(roomId);
        User sender = getUserByEmail(senderEmail);

        if (!roomService.isMember(roomId, sender.getId())) {
            roomService.joinRoom(roomId, senderEmail);
        }

        Message message = new Message();
        message.setRoom(room);
        message.setSender(sender);
        message.setContent(content.trim());

        Message saved = messageRepository.save(message);
        return toDto(saved);
    }

    @Transactional
    public ChatMessage sendMessage(String roomName, String senderEmail, String content) {
        if (content == null || content.trim().isBlank()) {
            throw new IllegalArgumentException("Message content is required");
        }

        Room room = roomService.getRoomByName(roomName);
        return sendMessage(room.getId(), senderEmail, content);
    }

    public List<ChatMessage> listMessages(UUID roomId, String requesterEmail, int limit) {
        Room room = roomService.getRoom(roomId);
        User requester = getUserByEmail(requesterEmail);

        if (!roomService.isMember(roomId, requester.getId())) {
            throw new IllegalArgumentException("Not a member of this room");
        }

        int safeLimit = Math.min(Math.max(limit, 1), 200);
        Pageable pageable = PageRequest.of(0, safeLimit);

        return messageRepository.findByRoomIdOrderByCreatedAtAsc(room.getId(), pageable)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ChatMessage toDto(Message message) {
        ChatMessage dto = new ChatMessage();
        dto.setId(message.getId().toString());
        dto.setRoomId(message.getRoom().getId().toString());
        dto.setSender(message.getSender().getDisplayName());
        dto.setContent(message.getContent());
        dto.setTimestamp(message.getCreatedAt().toString());
        return dto;
    }

    private User getUserByEmail(String email) {
        if (email == null || email.trim().isBlank()) {
            throw new IllegalArgumentException("Unauthorized");
        }

        String normalized = email.trim().toLowerCase();
        return userRepository.findByEmail(normalized)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
