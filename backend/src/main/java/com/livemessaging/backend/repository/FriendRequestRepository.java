package com.livemessaging.backend.repository;

import com.livemessaging.backend.model.FriendRequest;
import com.livemessaging.backend.model.FriendRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, UUID> {
    List<FriendRequest> findByRequesterIdAndStatus(UUID requesterId, FriendRequestStatus status);
    List<FriendRequest> findByRecipientIdAndStatus(UUID recipientId, FriendRequestStatus status);
    Optional<FriendRequest> findByRequesterIdAndRecipientId(UUID requesterId, UUID recipientId);
    boolean existsByRequesterIdAndRecipientIdAndStatus(UUID requesterId, UUID recipientId, FriendRequestStatus status);
    void deleteByRequesterIdOrRecipientId(UUID requesterId, UUID recipientId);
}
