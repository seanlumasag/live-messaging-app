package com.livemessaging.backend.controller;

import com.livemessaging.backend.dto.DeleteAccountRequest;
import com.livemessaging.backend.dto.PasswordChangeRequest;
import com.livemessaging.backend.dto.ProfileUpdateRequest;
import com.livemessaging.backend.dto.UserResponse;
import com.livemessaging.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        return new UserResponse(userService.getByEmail(requireEmail(authentication)));
    }

    @PatchMapping("/me")
    public UserResponse updateMe(
            Authentication authentication,
            @RequestBody ProfileUpdateRequest request
    ) {
        return new UserResponse(userService.updateProfile(requireEmail(authentication), request));
    }

    @PostMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            Authentication authentication,
            @RequestBody PasswordChangeRequest request
    ) {
        userService.changePassword(requireEmail(authentication), request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMe(
            Authentication authentication,
            @RequestBody(required = false) DeleteAccountRequest request
    ) {
        String email = requireEmail(authentication);
        if (request == null || request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password required");
        }

        boolean deleted = userService.deleteByEmailAndPassword(
                email,
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

    private String requireEmail(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return authentication.getName();
    }
}
