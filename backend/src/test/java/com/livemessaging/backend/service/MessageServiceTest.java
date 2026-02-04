package com.livemessaging.backend.service;

import com.livemessaging.backend.dto.ChatMessage;
import com.livemessaging.backend.model.Message;
import com.livemessaging.backend.model.Room;
import com.livemessaging.backend.model.User;
import com.livemessaging.backend.repository.MessageRepository;
import com.livemessaging.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class MessageServiceTest {

    @Test
    void sendMessageRejectsBlankContent() {
        MessageRepository messageRepository = mock(MessageRepository.class);
        RoomService roomService = mock(RoomService.class);
        UserRepository userRepository = mock(UserRepository.class);
        MessageService service = new MessageService(messageRepository, roomService, userRepository);

        assertThrows(IllegalArgumentException.class, () ->
                service.sendMessage(UUID.randomUUID(), "user@email.com", "   "));

        verifyNoInteractions(messageRepository, roomService, userRepository);
    }

    @Test
    void sendMessageJoinsRoomWhenNotMember() {
        MessageRepository messageRepository = mock(MessageRepository.class);
        RoomService roomService = mock(RoomService.class);
        UserRepository userRepository = mock(UserRepository.class);
        MessageService service = new MessageService(messageRepository, roomService, userRepository);

        UUID roomId = UUID.randomUUID();
        Room room = new Room();
        room.setId(roomId);
        room.setName("general");

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("user@email.com");
        user.setDisplayName("User");

        Message saved = new Message();
        saved.setId(UUID.randomUUID());
        saved.setRoom(room);
        saved.setSender(user);
        saved.setContent("Hello");
        saved.setCreatedAt(Instant.parse("2024-01-01T00:00:00Z"));

        when(roomService.getRoom(roomId)).thenReturn(room);
        when(userRepository.findByEmail("user@email.com")).thenReturn(Optional.of(user));
        when(roomService.isMember(roomId, user.getId())).thenReturn(false);
        when(messageRepository.save(any(Message.class))).thenReturn(saved);

        ChatMessage dto = service.sendMessage(roomId, "USER@email.com", " Hello ");

        assertEquals(saved.getId().toString(), dto.getId());
        assertEquals(roomId.toString(), dto.getRoomId());
        assertEquals("User", dto.getSender());
        assertEquals("Hello", dto.getContent());
        assertEquals(saved.getCreatedAt().toString(), dto.getTimestamp());
        verify(roomService).joinRoom(roomId, "USER@email.com");
    }

    @Test
    void listMessagesRejectsWhenNotMember() {
        MessageRepository messageRepository = mock(MessageRepository.class);
        RoomService roomService = mock(RoomService.class);
        UserRepository userRepository = mock(UserRepository.class);
        MessageService service = new MessageService(messageRepository, roomService, userRepository);

        UUID roomId = UUID.randomUUID();
        Room room = new Room();
        room.setId(roomId);

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("user@email.com");

        when(roomService.getRoom(roomId)).thenReturn(room);
        when(userRepository.findByEmail("user@email.com")).thenReturn(Optional.of(user));
        when(roomService.isMember(roomId, user.getId())).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () ->
                service.listMessages(roomId, "user@email.com", 50));

        verify(messageRepository, never()).findByRoomIdOrderByCreatedAtAsc(any(), any(Pageable.class));
    }

    @Test
    void listMessagesCapsLimitTo200() {
        MessageRepository messageRepository = mock(MessageRepository.class);
        RoomService roomService = mock(RoomService.class);
        UserRepository userRepository = mock(UserRepository.class);
        MessageService service = new MessageService(messageRepository, roomService, userRepository);

        UUID roomId = UUID.randomUUID();
        Room room = new Room();
        room.setId(roomId);

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("user@email.com");

        when(roomService.getRoom(roomId)).thenReturn(room);
        when(userRepository.findByEmail("user@email.com")).thenReturn(Optional.of(user));
        when(roomService.isMember(roomId, user.getId())).thenReturn(true);
        when(messageRepository.findByRoomIdOrderByCreatedAtAsc(eq(roomId), any(Pageable.class)))
                .thenReturn(List.of());

        service.listMessages(roomId, "user@email.com", 500);

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(messageRepository).findByRoomIdOrderByCreatedAtAsc(eq(roomId), captor.capture());
        assertEquals(200, captor.getValue().getPageSize());
    }
}
