package com.livemessaging.backend.controller;

import com.livemessaging.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
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
    public ResponseEntity<Void> deleteMe(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        boolean deleted = userService.deleteByEmail(authentication.getName());
        if (!deleted) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        return ResponseEntity.noContent().build();
    }
}
