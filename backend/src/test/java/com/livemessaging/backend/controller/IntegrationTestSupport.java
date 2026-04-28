package com.livemessaging.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.livemessaging.backend.dto.SignupRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
abstract class IntegrationTestSupport {

    private static final AtomicInteger USER_COUNTER = new AtomicInteger();

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    protected RegisteredUser signupUser(String label) throws Exception {
        int suffix = USER_COUNTER.incrementAndGet();
        String username = label.toLowerCase() + suffix;
        String email = username + "@example.com";
        String displayName = label + " " + suffix;

        SignupRequest request = new SignupRequest();
        request.setEmail(email);
        request.setUsername(username);
        request.setPassword("password123");
        request.setDisplayName(displayName);

        MvcResult result = mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return new RegisteredUser(
                json.get("userId").asText(),
                json.get("token").asText(),
                email,
                username,
                displayName
        );
    }

    protected String bearer(RegisteredUser user) {
        return "Bearer " + user.token();
    }

    protected String json(Map<String, ?> values) throws Exception {
        return objectMapper.writeValueAsString(values);
    }

    protected JsonNode responseJson(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    protected record RegisteredUser(
            String id,
            String token,
            String email,
            String username,
            String displayName
    ) {
    }
}
