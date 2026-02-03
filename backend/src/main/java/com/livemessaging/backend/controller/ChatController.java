package com.livemessaging.backend.controller;

import com.livemessaging.backend.dto.ChatMessage;
import com.livemessaging.backend.dto.MessageRequest;
import com.livemessaging.backend.service.MessageService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(MessageService messageService, SimpMessagingTemplate messagingTemplate) {
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/rooms/{roomName}/send")
    public void sendMessage(
            @DestinationVariable String roomName,
            @Payload MessageRequest request,
            Authentication authentication
    ) {
        String email = authentication != null ? authentication.getName() : request.getSender();
        if (email == null || email.trim().isBlank()) {
            throw new IllegalArgumentException("Unauthorized");
        }

        ChatMessage saved = messageService.sendMessage(roomName, email, request.getContent());
        messagingTemplate.convertAndSend("/topic/rooms/" + roomName, saved);
    }
}
