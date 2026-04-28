package com.livemessaging.backend.controller;

import com.livemessaging.backend.dto.ConversationResponse;
import com.livemessaging.backend.dto.DirectConversationRequest;
import com.livemessaging.backend.dto.GroupConversationRequest;
import com.livemessaging.backend.service.ConversationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    private final ConversationService conversationService;

    public ConversationController(ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    @GetMapping
    public List<ConversationResponse> list(Authentication authentication) {
        return conversationService.list(requireEmail(authentication));
    }

    @PostMapping("/direct")
    public ResponseEntity<ConversationResponse> direct(
            Authentication authentication,
            @RequestBody DirectConversationRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(conversationService.direct(requireEmail(authentication), request.getUsername()));
    }

    @PostMapping("/groups")
    public ResponseEntity<ConversationResponse> group(
            Authentication authentication,
            @RequestBody GroupConversationRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(conversationService.group(requireEmail(authentication), request.getName(), request.getMemberUsernames()));
    }

    private String requireEmail(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalArgumentException("Unauthorized");
        }
        return authentication.getName();
    }
}
