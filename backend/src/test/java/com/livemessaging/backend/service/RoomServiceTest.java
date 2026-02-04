package com.livemessaging.backend.service;

import com.livemessaging.backend.dto.RoomResponse;
import com.livemessaging.backend.model.Room;
import com.livemessaging.backend.model.RoomMember;
import com.livemessaging.backend.model.User;
import com.livemessaging.backend.repository.MessageRepository;
import com.livemessaging.backend.repository.RoomMemberRepository;
import com.livemessaging.backend.repository.RoomRepository;
import com.livemessaging.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;

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

class RoomServiceTest {

    @Test
    void createRoomRejectsBlankName() {
        RoomRepository roomRepository = mock(RoomRepository.class);
        RoomMemberRepository roomMemberRepository = mock(RoomMemberRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        MessageRepository messageRepository = mock(MessageRepository.class);
        RoomService service = new RoomService(roomRepository, roomMemberRepository, userRepository, messageRepository);

        assertThrows(IllegalArgumentException.class, () -> service.createRoom("   ", "user@email.com"));

        verifyNoInteractions(roomRepository, roomMemberRepository, userRepository, messageRepository);
    }

    @Test
    void createRoomThrowsWhenExists() {
        RoomRepository roomRepository = mock(RoomRepository.class);
        RoomMemberRepository roomMemberRepository = mock(RoomMemberRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        MessageRepository messageRepository = mock(MessageRepository.class);
        RoomService service = new RoomService(roomRepository, roomMemberRepository, userRepository, messageRepository);

        when(roomRepository.existsByNameIgnoreCase("general")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> service.createRoom("general", "user@email.com"));

        verify(roomRepository, never()).save(any(Room.class));
        verify(roomMemberRepository, never()).save(any(RoomMember.class));
    }

    @Test
    void createRoomCreatesMember() {
        RoomRepository roomRepository = mock(RoomRepository.class);
        RoomMemberRepository roomMemberRepository = mock(RoomMemberRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        MessageRepository messageRepository = mock(MessageRepository.class);
        RoomService service = new RoomService(roomRepository, roomMemberRepository, userRepository, messageRepository);

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("user@email.com");

        Room room = new Room();
        room.setId(UUID.randomUUID());
        room.setName("general");
        room.setCreatedAt(Instant.parse("2024-01-01T00:00:00Z"));

        when(roomRepository.existsByNameIgnoreCase("general")).thenReturn(false);
        when(userRepository.findByEmail("user@email.com")).thenReturn(Optional.of(user));
        when(roomRepository.save(any(Room.class))).thenReturn(room);

        RoomResponse response = service.createRoom("general", "user@email.com");

        assertEquals(room.getId().toString(), response.getId());
        assertEquals("general", response.getName());
        assertEquals(room.getCreatedAt(), response.getCreatedAt());
        verify(roomMemberRepository).save(any(RoomMember.class));
    }

    @Test
    void joinRoomByNameAddsMemberWhenMissing() {
        RoomRepository roomRepository = mock(RoomRepository.class);
        RoomMemberRepository roomMemberRepository = mock(RoomMemberRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        MessageRepository messageRepository = mock(MessageRepository.class);
        RoomService service = new RoomService(roomRepository, roomMemberRepository, userRepository, messageRepository);

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("user@email.com");

        Room room = new Room();
        room.setId(UUID.randomUUID());
        room.setName("general");

        when(userRepository.findByEmail("user@email.com")).thenReturn(Optional.of(user));
        when(roomRepository.findByNameIgnoreCase("general")).thenReturn(Optional.of(room));
        when(roomMemberRepository.existsByRoomIdAndUserId(room.getId(), user.getId())).thenReturn(false);

        service.joinRoomByName("general", "user@email.com");

        verify(roomMemberRepository).save(any(RoomMember.class));
    }

    @Test
    void joinRoomByNameNoopWhenAlreadyMember() {
        RoomRepository roomRepository = mock(RoomRepository.class);
        RoomMemberRepository roomMemberRepository = mock(RoomMemberRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        MessageRepository messageRepository = mock(MessageRepository.class);
        RoomService service = new RoomService(roomRepository, roomMemberRepository, userRepository, messageRepository);

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("user@email.com");

        Room room = new Room();
        room.setId(UUID.randomUUID());
        room.setName("general");

        when(userRepository.findByEmail("user@email.com")).thenReturn(Optional.of(user));
        when(roomRepository.findByNameIgnoreCase("general")).thenReturn(Optional.of(room));
        when(roomMemberRepository.existsByRoomIdAndUserId(room.getId(), user.getId())).thenReturn(true);

        service.joinRoomByName("general", "user@email.com");

        verify(roomMemberRepository, never()).save(any(RoomMember.class));
    }

    @Test
    void deleteRoomRequiresMembership() {
        RoomRepository roomRepository = mock(RoomRepository.class);
        RoomMemberRepository roomMemberRepository = mock(RoomMemberRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        MessageRepository messageRepository = mock(MessageRepository.class);
        RoomService service = new RoomService(roomRepository, roomMemberRepository, userRepository, messageRepository);

        UUID roomId = UUID.randomUUID();
        Room room = new Room();
        room.setId(roomId);

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("user@email.com");

        when(userRepository.findByEmail("user@email.com")).thenReturn(Optional.of(user));
        when(roomRepository.findById(roomId)).thenReturn(Optional.of(room));
        when(roomMemberRepository.existsByRoomIdAndUserId(roomId, user.getId())).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> service.deleteRoom(roomId, "user@email.com"));

        verify(messageRepository, never()).deleteByRoomId(any(UUID.class));
        verify(roomRepository, never()).delete(any(Room.class));
    }

    @Test
    void deleteRoomRemovesMessagesMembersAndRoom() {
        RoomRepository roomRepository = mock(RoomRepository.class);
        RoomMemberRepository roomMemberRepository = mock(RoomMemberRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        MessageRepository messageRepository = mock(MessageRepository.class);
        RoomService service = new RoomService(roomRepository, roomMemberRepository, userRepository, messageRepository);

        UUID roomId = UUID.randomUUID();
        Room room = new Room();
        room.setId(roomId);

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("user@email.com");

        when(userRepository.findByEmail("user@email.com")).thenReturn(Optional.of(user));
        when(roomRepository.findById(roomId)).thenReturn(Optional.of(room));
        when(roomMemberRepository.existsByRoomIdAndUserId(roomId, user.getId())).thenReturn(true);

        service.deleteRoom(roomId, "user@email.com");

        verify(messageRepository).deleteByRoomId(roomId);
        verify(roomMemberRepository).deleteByRoomId(roomId);
        verify(roomRepository).delete(room);
    }

    @Test
    void listRoomsForUserSortsByCreatedAt() {
        RoomRepository roomRepository = mock(RoomRepository.class);
        RoomMemberRepository roomMemberRepository = mock(RoomMemberRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        MessageRepository messageRepository = mock(MessageRepository.class);
        RoomService service = new RoomService(roomRepository, roomMemberRepository, userRepository, messageRepository);

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("user@email.com");

        Room early = new Room();
        early.setId(UUID.randomUUID());
        early.setName("early");
        early.setCreatedAt(Instant.parse("2024-01-01T00:00:00Z"));

        Room late = new Room();
        late.setId(UUID.randomUUID());
        late.setName("late");
        late.setCreatedAt(Instant.parse("2024-02-01T00:00:00Z"));

        RoomMember earlyMember = new RoomMember();
        earlyMember.setRoom(early);
        earlyMember.setUser(user);

        RoomMember lateMember = new RoomMember();
        lateMember.setRoom(late);
        lateMember.setUser(user);

        when(userRepository.findByEmail("user@email.com")).thenReturn(Optional.of(user));
        when(roomMemberRepository.findByUserId(user.getId()))
                .thenReturn(List.of(lateMember, earlyMember));

        List<RoomResponse> rooms = service.listRoomsForUser("user@email.com");

        assertEquals(List.of("early", "late"),
                rooms.stream().map(RoomResponse::getName).toList());
        verify(roomMemberRepository).findByUserId(eq(user.getId()));
    }
}
