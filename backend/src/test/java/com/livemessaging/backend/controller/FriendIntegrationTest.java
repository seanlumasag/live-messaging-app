package com.livemessaging.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class FriendIntegrationTest extends IntegrationTestSupport {

    @Test
    void friendRequestFlowCreatesAcceptedFriendship() throws Exception {
        RegisteredUser alice = signupUser("alice");
        RegisteredUser bob = signupUser("bob");

        MvcResult sentResult = mockMvc.perform(post("/api/friends/requests")
                        .header("Authorization", bearer(alice))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("username", bob.username()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(bob.username()))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn();
        String requestId = responseJson(sentResult).get("id").asText();

        mockMvc.perform(get("/api/friends/requests/sent")
                        .header("Authorization", bearer(alice)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(requestId));

        mockMvc.perform(get("/api/friends/requests/incoming")
                        .header("Authorization", bearer(bob)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(requestId))
                .andExpect(jsonPath("$[0].username").value(alice.username()));

        mockMvc.perform(post("/api/friends/requests/{id}/accept", requestId)
                        .header("Authorization", bearer(bob)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"))
                .andExpect(jsonPath("$.username").value(alice.username()));

        mockMvc.perform(get("/api/friends")
                        .header("Authorization", bearer(alice)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value(bob.username()));

        mockMvc.perform(get("/api/friends")
                        .header("Authorization", bearer(bob)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value(alice.username()));
    }

    @Test
    void requesterCanCancelPendingFriendRequest() throws Exception {
        RegisteredUser alice = signupUser("alice");
        RegisteredUser bob = signupUser("bob");

        MvcResult sentResult = mockMvc.perform(post("/api/friends/requests")
                        .header("Authorization", bearer(alice))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("username", bob.username()))))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode request = responseJson(sentResult);

        mockMvc.perform(delete("/api/friends/requests/{id}", request.get("id").asText())
                        .header("Authorization", bearer(alice)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/friends/requests/incoming")
                        .header("Authorization", bearer(bob)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }
}
