package com.livemessaging.backend.service;

import com.livemessaging.backend.dto.FriendRequestResponse;
import com.livemessaging.backend.dto.FriendResponse;
import com.livemessaging.backend.model.FriendRequest;
import com.livemessaging.backend.model.FriendRequestStatus;
import com.livemessaging.backend.model.User;
import com.livemessaging.backend.repository.FriendRequestRepository;
import com.livemessaging.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class FriendService {

    private final FriendRequestRepository friendRequestRepository;
    private final UserRepository userRepository;

    public FriendService(FriendRequestRepository friendRequestRepository, UserRepository userRepository) {
        this.friendRequestRepository = friendRequestRepository;
        this.userRepository = userRepository;
    }

    public List<FriendResponse> listFriends(String email) {
        User user = getUserByEmail(email);
        List<User> friends = new ArrayList<>();
        friendRequestRepository.findByRequesterIdAndStatus(user.getId(), FriendRequestStatus.ACCEPTED)
                .forEach(request -> friends.add(request.getRecipient()));
        friendRequestRepository.findByRecipientIdAndStatus(user.getId(), FriendRequestStatus.ACCEPTED)
                .forEach(request -> friends.add(request.getRequester()));
        return friends.stream()
                .sorted(Comparator.comparing(User::getUsername))
                .map(FriendResponse::new)
                .toList();
    }

    public FriendResponse searchByUsername(String email, String username) {
        User current = getUserByEmail(email);
        String normalized = normalizeUsername(username);
        User found = userRepository.findByUsername(normalized)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (found.getId().equals(current.getId())) {
            throw new IllegalArgumentException("Cannot add yourself");
        }
        return new FriendResponse(found);
    }

    public List<FriendRequestResponse> incoming(String email) {
        User user = getUserByEmail(email);
        return friendRequestRepository.findByRecipientIdAndStatus(user.getId(), FriendRequestStatus.PENDING)
                .stream()
                .map(request -> new FriendRequestResponse(request, request.getRequester()))
                .toList();
    }

    public List<FriendRequestResponse> sent(String email) {
        User user = getUserByEmail(email);
        return friendRequestRepository.findByRequesterIdAndStatus(user.getId(), FriendRequestStatus.PENDING)
                .stream()
                .map(request -> new FriendRequestResponse(request, request.getRecipient()))
                .toList();
    }

    @Transactional
    public FriendRequestResponse sendRequest(String email, String username) {
        User requester = getUserByEmail(email);
        User recipient = userRepository.findByUsername(normalizeUsername(username))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (requester.getId().equals(recipient.getId())) {
            throw new IllegalArgumentException("Cannot add yourself");
        }
        if (areFriends(requester.getId(), recipient.getId())) {
            throw new IllegalArgumentException("Already friends");
        }

        FriendRequest existing = friendRequestRepository
                .findByRequesterIdAndRecipientId(requester.getId(), recipient.getId())
                .orElse(null);
        if (existing != null) {
            if (existing.getStatus() == FriendRequestStatus.DECLINED) {
                existing.setStatus(FriendRequestStatus.PENDING);
                return new FriendRequestResponse(friendRequestRepository.save(existing), recipient);
            }
            throw new IllegalArgumentException("Friend request already exists");
        }

        FriendRequest reverse = friendRequestRepository
                .findByRequesterIdAndRecipientId(recipient.getId(), requester.getId())
                .orElse(null);
        if (reverse != null && reverse.getStatus() == FriendRequestStatus.PENDING) {
            reverse.setStatus(FriendRequestStatus.ACCEPTED);
            return new FriendRequestResponse(friendRequestRepository.save(reverse), recipient);
        }
        if (reverse != null && reverse.getStatus() == FriendRequestStatus.ACCEPTED) {
            throw new IllegalArgumentException("Already friends");
        }

        FriendRequest request = new FriendRequest();
        request.setRequester(requester);
        request.setRecipient(recipient);
        return new FriendRequestResponse(friendRequestRepository.save(request), recipient);
    }

    @Transactional
    public FriendRequestResponse accept(String email, UUID requestId) {
        User user = getUserByEmail(email);
        FriendRequest request = getRequest(requestId);
        if (!request.getRecipient().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Unauthorized");
        }
        request.setStatus(FriendRequestStatus.ACCEPTED);
        return new FriendRequestResponse(friendRequestRepository.save(request), request.getRequester());
    }

    @Transactional
    public FriendRequestResponse decline(String email, UUID requestId) {
        User user = getUserByEmail(email);
        FriendRequest request = getRequest(requestId);
        if (!request.getRecipient().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Unauthorized");
        }
        request.setStatus(FriendRequestStatus.DECLINED);
        return new FriendRequestResponse(friendRequestRepository.save(request), request.getRequester());
    }

    @Transactional
    public void cancel(String email, UUID requestId) {
        User user = getUserByEmail(email);
        FriendRequest request = getRequest(requestId);
        if (!request.getRequester().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Unauthorized");
        }
        friendRequestRepository.delete(request);
    }

    public boolean areFriends(UUID firstUserId, UUID secondUserId) {
        return friendRequestRepository.existsByRequesterIdAndRecipientIdAndStatus(firstUserId, secondUserId, FriendRequestStatus.ACCEPTED)
                || friendRequestRepository.existsByRequesterIdAndRecipientIdAndStatus(secondUserId, firstUserId, FriendRequestStatus.ACCEPTED);
    }

    private FriendRequest getRequest(UUID requestId) {
        return friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Friend request not found"));
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
}
