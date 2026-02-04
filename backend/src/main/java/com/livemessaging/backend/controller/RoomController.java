package com.livemessaging.backend.controller;

import com.livemessaging.backend.dto.RoomRequest;
import com.livemessaging.backend.dto.RoomResponse;
import com.livemessaging.backend.service.RoomService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    public List<RoomResponse> listRooms(Authentication authentication) {
        String email = requireEmail(authentication);
        return roomService.listRoomsForUser(email);
    }

    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(
            @RequestBody RoomRequest request,
            Authentication authentication
    ) {
        String email = requireEmail(authentication);
        RoomResponse response = roomService.createRoom(request.getName(), email);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{roomId}/join")
    public ResponseEntity<Void> joinRoom(@PathVariable UUID roomId, Authentication authentication) {
        String email = requireEmail(authentication);
        roomService.joinRoom(roomId, email);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/join")
    public ResponseEntity<Void> joinRoomByName(
            @RequestBody RoomRequest request,
            Authentication authentication
    ) {
        String email = requireEmail(authentication);
        roomService.joinRoomByName(request.getName(), email);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteRoom(@PathVariable UUID roomId, Authentication authentication) {
        String email = requireEmail(authentication);
        roomService.deleteRoom(roomId, email);
        return ResponseEntity.noContent().build();
    }

    private String requireEmail(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return authentication.getName();
    }
}
