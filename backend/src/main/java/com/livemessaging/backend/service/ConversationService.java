package com.livemessaging.backend.service;

import com.livemessaging.backend.dto.ConversationResponse;
import com.livemessaging.backend.dto.FriendResponse;
import com.livemessaging.backend.model.Room;
import com.livemessaging.backend.model.RoomMember;
import com.livemessaging.backend.model.RoomType;
import com.livemessaging.backend.model.User;
import com.livemessaging.backend.repository.RoomMemberRepository;
import com.livemessaging.backend.repository.RoomRepository;
import com.livemessaging.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class ConversationService {

    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final UserRepository userRepository;
    private final FriendService friendService;

    public ConversationService(
            RoomRepository roomRepository,
            RoomMemberRepository roomMemberRepository,
            UserRepository userRepository,
            FriendService friendService
    ) {
        this.roomRepository = roomRepository;
        this.roomMemberRepository = roomMemberRepository;
        this.userRepository = userRepository;
        this.friendService = friendService;
    }

    public List<ConversationResponse> list(String email) {
        User user = getUserByEmail(email);
        return roomMemberRepository.findByUserId(user.getId())
                .stream()
                .map(RoomMember::getRoom)
                .sorted(Comparator.comparing(Room::getCreatedAt))
                .map(room -> toResponse(room, user))
                .toList();
    }

    @Transactional
    public ConversationResponse direct(String email, String username) {
        User requester = getUserByEmail(email);
        User recipient = userRepository.findByUsername(normalizeUsername(username))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (requester.getId().equals(recipient.getId())) {
            throw new IllegalArgumentException("Cannot message yourself");
        }
        if (!friendService.areFriends(requester.getId(), recipient.getId())) {
            throw new IllegalArgumentException("You can only message friends");
        }

        String directKey = directKey(requester.getId(), recipient.getId());
        Room room = roomRepository.findByDirectKey(directKey).orElseGet(() -> {
            Room created = new Room();
            created.setType(RoomType.DIRECT);
            created.setDirectKey(directKey);
            created.setName("dm-" + directKey);
            return roomRepository.save(created);
        });
        ensureMember(room, requester);
        ensureMember(room, recipient);
        return toResponse(room, requester);
    }

    @Transactional
    public ConversationResponse group(String email, String name, List<String> memberUsernames) {
        User creator = getUserByEmail(email);
        if (name == null || name.trim().isBlank()) {
            throw new IllegalArgumentException("Group name is required");
        }
        Room room = new Room();
        room.setName(name.trim());
        room.setType(RoomType.GROUP);
        room = roomRepository.save(room);
        ensureMember(room, creator);

        if (memberUsernames != null) {
            for (String username : memberUsernames) {
                User member = userRepository.findByUsername(normalizeUsername(username))
                        .orElseThrow(() -> new IllegalArgumentException("User not found"));
                if (!friendService.areFriends(creator.getId(), member.getId())) {
                    throw new IllegalArgumentException("Only friends can be added to group chats");
                }
                ensureMember(room, member);
            }
        }

        return toResponse(room, creator);
    }

    private ConversationResponse toResponse(Room room, User viewer) {
        RoomType type = room.getType() == null ? RoomType.PUBLIC : room.getType();
        List<FriendResponse> members = roomMemberRepository.findByRoomId(room.getId())
                .stream()
                .map(RoomMember::getUser)
                .map(FriendResponse::new)
                .toList();
        String name = room.getName();
        if (type == RoomType.DIRECT) {
            name = members.stream()
                    .filter(member -> !member.getId().equals(viewer.getId().toString()))
                    .findFirst()
                    .map(FriendResponse::getDisplayName)
                    .orElse("Direct Message");
        }
        return new ConversationResponse(
                room.getId().toString(),
                name,
                type.name(),
                room.getCreatedAt(),
                members
        );
    }

    private void ensureMember(Room room, User user) {
        if (roomMemberRepository.existsByRoomIdAndUserId(room.getId(), user.getId())) {
            return;
        }
        RoomMember member = new RoomMember();
        member.setRoom(room);
        member.setUser(user);
        roomMemberRepository.save(member);
    }

    private User getUserByEmail(String email) {
        if (email == null || email.trim().isBlank()) {
            throw new IllegalArgumentException("Unauthorized");
        }
        return userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private String normalizeUsername(String username) {
        if (username == null || username.trim().isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }
        return username.trim().toLowerCase();
    }

    private String directKey(UUID first, UUID second) {
        return first.compareTo(second) < 0 ? first + ":" + second : second + ":" + first;
    }
}
