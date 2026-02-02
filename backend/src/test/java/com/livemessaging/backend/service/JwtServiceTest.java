package com.livemessaging.backend.service;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;

class JwtServiceTest {

    @Test
    void generatesAndValidatesToken() {
        String secret = "c3VwZXItc2VjdXJlLWp3dC1zZWNyZXQtMzItYnl0ZXM=";
        JwtService jwtService = new JwtService(secret, 60000);
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                "user@example.com",
                "password",
                Collections.emptyList()
        );

        String token = jwtService.generateToken(userDetails);

        assertEquals("user@example.com", jwtService.extractUsername(token));
        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    void expiredTokenIsInvalid() throws InterruptedException {
        String secret = "c3VwZXItc2VjdXJlLWp3dC1zZWNyZXQtMzItYnl0ZXM=";
        JwtService jwtService = new JwtService(secret, 1);
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                "user@example.com",
                "password",
                Collections.emptyList()
        );

        String token = jwtService.generateToken(userDetails);
        Thread.sleep(5);

        assertFalse(jwtService.isTokenValid(token, userDetails));
    }
}
