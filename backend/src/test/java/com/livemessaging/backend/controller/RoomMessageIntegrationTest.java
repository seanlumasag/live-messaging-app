package com.livemessaging.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RoomMessageIntegrationTest extends IntegrationTestSupport {

    @Test
    void roomAndMessageFlowRequiresMembershipForReading() throws Exception {
        RegisteredUser alice = signupUser("alice");
        RegisteredUser bob = signupUser("bob");

        MvcResult roomResult = mockMvc.perform(post("/api/rooms")
                        .header("Authorization", bearer(alice))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("name", "general-" + alice.username()))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("PUBLIC"))
                .andReturn();
        String roomId = responseJson(roomResult).get("id").asText();

        mockMvc.perform(get("/api/rooms/{roomId}/messages", roomId)
                        .header("Authorization", bearer(bob)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Not a member of this room"));

        mockMvc.perform(post("/api/rooms/{roomId}/join", roomId)
                        .header("Authorization", bearer(bob)))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/api/rooms/{roomId}/messages", roomId)
                        .header("Authorization", bearer(alice))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("content", " Hello team "))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sender").value(alice.displayName()))
                .andExpect(jsonPath("$.content").value("Hello team"));

        mockMvc.perform(get("/api/rooms/{roomId}/messages?limit=10", roomId)
                        .header("Authorization", bearer(bob)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].content").value("Hello team"))
                .andExpect(jsonPath("$[0].roomId").value(roomId));

        mockMvc.perform(get("/api/rooms")
                        .header("Authorization", bearer(bob)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(roomId));
    }

    @Test
    void messageCreationRejectsBlankContent() throws Exception {
        RegisteredUser alice = signupUser("alice");

        MvcResult roomResult = mockMvc.perform(post("/api/rooms")
                        .header("Authorization", bearer(alice))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("name", "random-" + alice.username()))))
                .andExpect(status().isCreated())
                .andReturn();
        String roomId = responseJson(roomResult).get("id").asText();

        mockMvc.perform(post("/api/rooms/{roomId}/messages", roomId)
                        .header("Authorization", bearer(alice))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("content", "   "))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Message content is required"));
    }
}
