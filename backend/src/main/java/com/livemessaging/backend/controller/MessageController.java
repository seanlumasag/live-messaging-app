package com.livemessaging.backend.controller;

import com.livemessaging.backend.dto.ChatMessage;
import com.livemessaging.backend.dto.MessageRequest;
import com.livemessaging.backend.service.MessageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms/{roomId}/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping
    public List<ChatMessage> listMessages(
            @PathVariable UUID roomId,
            @RequestParam(defaultValue = "50") int limit,
            Authentication authentication
    ) {
        String email = requireEmail(authentication);
        return messageService.listMessages(roomId, email, limit);
    }

    @PostMapping
    public ResponseEntity<ChatMessage> sendMessage(
            @PathVariable UUID roomId,
            @RequestBody MessageRequest request,
            Authentication authentication
    ) {
        String email = requireEmail(authentication);
        ChatMessage message = messageService.sendMessage(roomId, email, request.getContent());
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

    private String requireEmail(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return authentication.getName();
    }
}
