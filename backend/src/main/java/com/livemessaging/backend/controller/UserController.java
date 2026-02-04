package com.livemessaging.backend.controller;

import com.livemessaging.backend.dto.DeleteAccountRequest;
import com.livemessaging.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMe(
            Authentication authentication,
            @RequestBody(required = false) DeleteAccountRequest request
    ) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        if (request == null || request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password required");
        }

        boolean deleted = userService.deleteByEmailAndPassword(
                authentication.getName(),
                request.getPassword()
        );
        if (!deleted) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/me/delete")
    public ResponseEntity<Void> deleteMeViaPost(
            Authentication authentication,
            @RequestBody(required = false) DeleteAccountRequest request
    ) {
        return deleteMe(authentication, request);
    }
}
