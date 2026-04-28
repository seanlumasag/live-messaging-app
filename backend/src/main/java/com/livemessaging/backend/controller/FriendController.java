package com.livemessaging.backend.controller;

import com.livemessaging.backend.dto.FriendRequestCreateRequest;
import com.livemessaging.backend.dto.FriendRequestResponse;
import com.livemessaging.backend.dto.FriendResponse;
import com.livemessaging.backend.service.FriendService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    private final FriendService friendService;

    public FriendController(FriendService friendService) {
        this.friendService = friendService;
    }

    @GetMapping
    public List<FriendResponse> list(Authentication authentication) {
        return friendService.listFriends(requireEmail(authentication));
    }

    @GetMapping("/search")
    public FriendResponse search(Authentication authentication, @RequestParam String username) {
        return friendService.searchByUsername(requireEmail(authentication), username);
    }

    @GetMapping("/requests/incoming")
    public List<FriendRequestResponse> incoming(Authentication authentication) {
        return friendService.incoming(requireEmail(authentication));
    }

    @GetMapping("/requests/sent")
    public List<FriendRequestResponse> sent(Authentication authentication) {
        return friendService.sent(requireEmail(authentication));
    }

    @PostMapping("/requests")
    public FriendRequestResponse send(Authentication authentication, @RequestBody FriendRequestCreateRequest request) {
        return friendService.sendRequest(requireEmail(authentication), request.getUsername());
    }

    @PostMapping("/requests/{id}/accept")
    public FriendRequestResponse accept(Authentication authentication, @PathVariable UUID id) {
        return friendService.accept(requireEmail(authentication), id);
    }

    @PostMapping("/requests/{id}/decline")
    public FriendRequestResponse decline(Authentication authentication, @PathVariable UUID id) {
        return friendService.decline(requireEmail(authentication), id);
    }

    @DeleteMapping("/requests/{id}")
    public ResponseEntity<Void> cancel(Authentication authentication, @PathVariable UUID id) {
        friendService.cancel(requireEmail(authentication), id);
        return ResponseEntity.noContent().build();
    }

    private String requireEmail(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalArgumentException("Unauthorized");
        }
        return authentication.getName();
    }
}
