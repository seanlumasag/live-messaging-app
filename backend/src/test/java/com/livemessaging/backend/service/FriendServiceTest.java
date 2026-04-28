package com.livemessaging.backend.service;

import com.livemessaging.backend.dto.FriendRequestResponse;
import com.livemessaging.backend.dto.FriendResponse;
import com.livemessaging.backend.model.FriendRequest;
import com.livemessaging.backend.model.FriendRequestStatus;
import com.livemessaging.backend.model.User;
import com.livemessaging.backend.repository.FriendRequestRepository;
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

class FriendServiceTest {

    @Test
    void listFriendsCombinesBothDirectionsAndSortsByUsername() {
        FriendRequestRepository friendRequestRepository = mock(FriendRequestRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        FriendService service = new FriendService(friendRequestRepository, userRepository);

        User current = user("current@example.com", "current", "Current");
        User zoe = user("zoe@example.com", "zoe", "Zoe");
        User amy = user("amy@example.com", "amy", "Amy");

        when(userRepository.findByEmail("current@example.com")).thenReturn(Optional.of(current));
        when(friendRequestRepository.findByRequesterIdAndStatus(current.getId(), FriendRequestStatus.ACCEPTED))
                .thenReturn(List.of(request(current, zoe, FriendRequestStatus.ACCEPTED)));
        when(friendRequestRepository.findByRecipientIdAndStatus(current.getId(), FriendRequestStatus.ACCEPTED))
                .thenReturn(List.of(request(amy, current, FriendRequestStatus.ACCEPTED)));

        List<FriendResponse> friends = service.listFriends(" CURRENT@example.com ");

        assertEquals(List.of("amy", "zoe"), friends.stream().map(FriendResponse::getUsername).toList());
    }

    @Test
    void searchByUsernameRejectsCurrentUser() {
        FriendRequestRepository friendRequestRepository = mock(FriendRequestRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        FriendService service = new FriendService(friendRequestRepository, userRepository);

        User current = user("current@example.com", "current", "Current");

        when(userRepository.findByEmail("current@example.com")).thenReturn(Optional.of(current));
        when(userRepository.findByUsername("current")).thenReturn(Optional.of(current));

        assertThrows(IllegalArgumentException.class, () ->
                service.searchByUsername("current@example.com", " CURRENT "));
    }

    @Test
    void sendRequestCreatesPendingRequest() {
        FriendRequestRepository friendRequestRepository = mock(FriendRequestRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        FriendService service = new FriendService(friendRequestRepository, userRepository);

        User requester = user("requester@example.com", "requester", "Requester");
        User recipient = user("recipient@example.com", "recipient", "Recipient");

        when(userRepository.findByEmail("requester@example.com")).thenReturn(Optional.of(requester));
        when(userRepository.findByUsername("recipient")).thenReturn(Optional.of(recipient));
        when(friendRequestRepository.save(any(FriendRequest.class))).thenAnswer(invocation -> {
            FriendRequest saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        FriendRequestResponse response = service.sendRequest("requester@example.com", " Recipient ");

        assertEquals("recipient", response.getUsername());
        assertEquals(FriendRequestStatus.PENDING.name(), response.getStatus());
    }

    @Test
    void sendRequestReopensDeclinedRequest() {
        FriendRequestRepository friendRequestRepository = mock(FriendRequestRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        FriendService service = new FriendService(friendRequestRepository, userRepository);

        User requester = user("requester@example.com", "requester", "Requester");
        User recipient = user("recipient@example.com", "recipient", "Recipient");
        FriendRequest existing = request(requester, recipient, FriendRequestStatus.DECLINED);

        when(userRepository.findByEmail("requester@example.com")).thenReturn(Optional.of(requester));
        when(userRepository.findByUsername("recipient")).thenReturn(Optional.of(recipient));
        when(friendRequestRepository.findByRequesterIdAndRecipientId(requester.getId(), recipient.getId()))
                .thenReturn(Optional.of(existing));
        when(friendRequestRepository.save(existing)).thenReturn(existing);

        FriendRequestResponse response = service.sendRequest("requester@example.com", "recipient");

        assertEquals(FriendRequestStatus.PENDING.name(), response.getStatus());
        verify(friendRequestRepository).save(existing);
    }

    @Test
    void sendRequestAcceptsReversePendingRequest() {
        FriendRequestRepository friendRequestRepository = mock(FriendRequestRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        FriendService service = new FriendService(friendRequestRepository, userRepository);

        User requester = user("requester@example.com", "requester", "Requester");
        User recipient = user("recipient@example.com", "recipient", "Recipient");
        FriendRequest reverse = request(recipient, requester, FriendRequestStatus.PENDING);

        when(userRepository.findByEmail("requester@example.com")).thenReturn(Optional.of(requester));
        when(userRepository.findByUsername("recipient")).thenReturn(Optional.of(recipient));
        when(friendRequestRepository.findByRequesterIdAndRecipientId(recipient.getId(), requester.getId()))
                .thenReturn(Optional.of(reverse));
        when(friendRequestRepository.save(reverse)).thenReturn(reverse);

        FriendRequestResponse response = service.sendRequest("requester@example.com", "recipient");

        assertEquals(FriendRequestStatus.ACCEPTED.name(), response.getStatus());
        verify(friendRequestRepository).save(reverse);
    }

    @Test
    void acceptRejectsNonRecipient() {
        FriendRequestRepository friendRequestRepository = mock(FriendRequestRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        FriendService service = new FriendService(friendRequestRepository, userRepository);

        User requester = user("requester@example.com", "requester", "Requester");
        User recipient = user("recipient@example.com", "recipient", "Recipient");
        User stranger = user("stranger@example.com", "stranger", "Stranger");
        FriendRequest request = request(requester, recipient, FriendRequestStatus.PENDING);

        when(userRepository.findByEmail("stranger@example.com")).thenReturn(Optional.of(stranger));
        when(friendRequestRepository.findById(request.getId())).thenReturn(Optional.of(request));

        assertThrows(IllegalArgumentException.class, () -> service.accept("stranger@example.com", request.getId()));

        verify(friendRequestRepository, never()).save(any(FriendRequest.class));
    }

    @Test
    void cancelDeletesOnlyRequesterOwnedRequest() {
        FriendRequestRepository friendRequestRepository = mock(FriendRequestRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        FriendService service = new FriendService(friendRequestRepository, userRepository);

        User requester = user("requester@example.com", "requester", "Requester");
        User recipient = user("recipient@example.com", "recipient", "Recipient");
        FriendRequest request = request(requester, recipient, FriendRequestStatus.PENDING);

        when(userRepository.findByEmail("requester@example.com")).thenReturn(Optional.of(requester));
        when(friendRequestRepository.findById(request.getId())).thenReturn(Optional.of(request));

        service.cancel("requester@example.com", request.getId());

        verify(friendRequestRepository).delete(request);
    }

    private static FriendRequest request(User requester, User recipient, FriendRequestStatus status) {
        FriendRequest request = new FriendRequest();
        request.setId(UUID.randomUUID());
        request.setRequester(requester);
        request.setRecipient(recipient);
        request.setStatus(status);
        return request;
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
