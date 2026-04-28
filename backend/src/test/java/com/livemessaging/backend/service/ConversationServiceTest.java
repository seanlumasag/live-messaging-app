package com.livemessaging.backend.service;

import com.livemessaging.backend.dto.ConversationResponse;
import com.livemessaging.backend.model.Room;
import com.livemessaging.backend.model.RoomMember;
import com.livemessaging.backend.model.RoomType;
import com.livemessaging.backend.model.User;
import com.livemessaging.backend.repository.RoomMemberRepository;
import com.livemessaging.backend.repository.RoomRepository;
import com.livemessaging.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ConversationServiceTest {

    @Test
    void directRequiresFriendship() {
        RoomRepository roomRepository = mock(RoomRepository.class);
        RoomMemberRepository roomMemberRepository = mock(RoomMemberRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        FriendService friendService = mock(FriendService.class);
        ConversationService service = new ConversationService(roomRepository, roomMemberRepository, userRepository, friendService);

        User requester = user("requester@example.com", "requester", "Requester");
        User recipient = user("recipient@example.com", "recipient", "Recipient");

        when(userRepository.findByEmail("requester@example.com")).thenReturn(Optional.of(requester));
        when(userRepository.findByUsername("recipient")).thenReturn(Optional.of(recipient));
        when(friendService.areFriends(requester.getId(), recipient.getId())).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> service.direct("requester@example.com", "recipient"));

        verify(roomRepository, never()).save(any(Room.class));
    }

    @Test
    void directReusesExistingRoomAndEnsuresMembers() {
        RoomRepository roomRepository = mock(RoomRepository.class);
        RoomMemberRepository roomMemberRepository = mock(RoomMemberRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        FriendService friendService = mock(FriendService.class);
        ConversationService service = new ConversationService(roomRepository, roomMemberRepository, userRepository, friendService);

        User requester = user("requester@example.com", "requester", "Requester");
        User recipient = user("recipient@example.com", "recipient", "Recipient");
        Room room = room("dm", RoomType.DIRECT);

        when(userRepository.findByEmail("requester@example.com")).thenReturn(Optional.of(requester));
        when(userRepository.findByUsername("recipient")).thenReturn(Optional.of(recipient));
        when(friendService.areFriends(requester.getId(), recipient.getId())).thenReturn(true);
        when(roomRepository.findByDirectKey(directKey(requester.getId(), recipient.getId()))).thenReturn(Optional.of(room));
        when(roomMemberRepository.existsByRoomIdAndUserId(room.getId(), requester.getId())).thenReturn(true);
        when(roomMemberRepository.existsByRoomIdAndUserId(room.getId(), recipient.getId())).thenReturn(false);
        when(roomMemberRepository.findByRoomId(room.getId()))
                .thenReturn(List.of(member(room, requester), member(room, recipient)));

        ConversationResponse response = service.direct("requester@example.com", "recipient");

        assertEquals(room.getId().toString(), response.getId());
        assertEquals("Recipient", response.getName());
        assertEquals(RoomType.DIRECT.name(), response.getType());
        verify(roomRepository, never()).save(any(Room.class));
        verify(roomMemberRepository).save(any(RoomMember.class));
    }

    @Test
    void groupRequiresName() {
        RoomRepository roomRepository = mock(RoomRepository.class);
        RoomMemberRepository roomMemberRepository = mock(RoomMemberRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        FriendService friendService = mock(FriendService.class);
        ConversationService service = new ConversationService(roomRepository, roomMemberRepository, userRepository, friendService);

        User creator = user("creator@example.com", "creator", "Creator");
        when(userRepository.findByEmail("creator@example.com")).thenReturn(Optional.of(creator));

        assertThrows(IllegalArgumentException.class, () -> service.group("creator@example.com", " ", List.of()));

        verify(roomRepository, never()).save(any(Room.class));
    }

    @Test
    void groupRejectsNonFriendMembers() {
        RoomRepository roomRepository = mock(RoomRepository.class);
        RoomMemberRepository roomMemberRepository = mock(RoomMemberRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        FriendService friendService = mock(FriendService.class);
        ConversationService service = new ConversationService(roomRepository, roomMemberRepository, userRepository, friendService);

        User creator = user("creator@example.com", "creator", "Creator");
        User member = user("member@example.com", "member", "Member");
        Room room = room("team", RoomType.GROUP);

        when(userRepository.findByEmail("creator@example.com")).thenReturn(Optional.of(creator));
        when(roomRepository.save(any(Room.class))).thenReturn(room);
        when(userRepository.findByUsername("member")).thenReturn(Optional.of(member));
        when(friendService.areFriends(creator.getId(), member.getId())).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> service.group("creator@example.com", "Team", List.of("member")));
    }

    @Test
    void groupCreatesRoomAndSkipsDuplicateMembers() {
        RoomRepository roomRepository = mock(RoomRepository.class);
        RoomMemberRepository roomMemberRepository = mock(RoomMemberRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        FriendService friendService = mock(FriendService.class);
        ConversationService service = new ConversationService(roomRepository, roomMemberRepository, userRepository, friendService);

        User creator = user("creator@example.com", "creator", "Creator");
        User member = user("member@example.com", "member", "Member");
        Room room = room("Team", RoomType.GROUP);

        when(userRepository.findByEmail("creator@example.com")).thenReturn(Optional.of(creator));
        when(roomRepository.save(any(Room.class))).thenReturn(room);
        when(userRepository.findByUsername("member")).thenReturn(Optional.of(member));
        when(friendService.areFriends(creator.getId(), member.getId())).thenReturn(true);
        when(roomMemberRepository.existsByRoomIdAndUserId(room.getId(), creator.getId())).thenReturn(false);
        when(roomMemberRepository.existsByRoomIdAndUserId(room.getId(), member.getId())).thenReturn(true);
        when(roomMemberRepository.findByRoomId(room.getId()))
                .thenReturn(List.of(member(room, creator), member(room, member)));

        ConversationResponse response = service.group("creator@example.com", " Team ", List.of("member"));

        assertEquals("Team", response.getName());
        assertEquals(RoomType.GROUP.name(), response.getType());
        assertEquals(List.of("creator", "member"), response.getMembers().stream().map(m -> m.getUsername()).toList());
        verify(roomMemberRepository).save(any(RoomMember.class));
    }

    private static String directKey(UUID first, UUID second) {
        return first.compareTo(second) < 0 ? first + ":" + second : second + ":" + first;
    }

    private static RoomMember member(Room room, User user) {
        RoomMember member = new RoomMember();
        member.setId(UUID.randomUUID());
        member.setRoom(room);
        member.setUser(user);
        return member;
    }

    private static Room room(String name, RoomType type) {
        Room room = new Room();
        room.setId(UUID.randomUUID());
        room.setName(name);
        room.setType(type);
        return room;
    }

    private static User user(String email, String username, String displayName) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(email);
        user.setUsername(username);
        user.setDisplayName(displayName);
        return user;
    }
}
