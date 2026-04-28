package com.livemessaging.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ConversationIntegrationTest extends IntegrationTestSupport {

    @Test
    void directConversationRequiresFriendshipAndReusesExistingRoom() throws Exception {
        RegisteredUser alice = signupUser("alice");
        RegisteredUser bob = signupUser("bob");

        mockMvc.perform(post("/api/conversations/direct")
                        .header("Authorization", bearer(alice))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("username", bob.username()))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("You can only message friends"));

        acceptFriendship(alice, bob);

        MvcResult firstDirect = mockMvc.perform(post("/api/conversations/direct")
                        .header("Authorization", bearer(alice))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("username", bob.username()))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("DIRECT"))
                .andExpect(jsonPath("$.name").value(bob.displayName()))
                .andExpect(jsonPath("$.members.length()").value(2))
                .andReturn();
        String conversationId = responseJson(firstDirect).get("id").asText();

        mockMvc.perform(post("/api/conversations/direct")
                        .header("Authorization", bearer(bob))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("username", alice.username()))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(conversationId))
                .andExpect(jsonPath("$.name").value(alice.displayName()));

        mockMvc.perform(get("/api/conversations")
                        .header("Authorization", bearer(alice)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(conversationId));
    }

    @Test
    void groupConversationOnlyAllowsFriendMembers() throws Exception {
        RegisteredUser alice = signupUser("alice");
        RegisteredUser bob = signupUser("bob");
        RegisteredUser charlie = signupUser("charlie");
        acceptFriendship(alice, bob);

        mockMvc.perform(post("/api/conversations/groups")
                        .header("Authorization", bearer(alice))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "name", "Team",
                                "memberUsernames", List.of(bob.username(), charlie.username())
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Only friends can be added to group chats"));

        mockMvc.perform(post("/api/conversations/groups")
                        .header("Authorization", bearer(alice))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "name", "Team",
                                "memberUsernames", List.of(bob.username())
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("GROUP"))
                .andExpect(jsonPath("$.name").value("Team"))
                .andExpect(jsonPath("$.members.length()").value(2));
    }

    private void acceptFriendship(RegisteredUser requester, RegisteredUser recipient) throws Exception {
        MvcResult sentResult = mockMvc.perform(post("/api/friends/requests")
                        .header("Authorization", bearer(requester))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("username", recipient.username()))))
                .andExpect(status().isOk())
                .andReturn();

        mockMvc.perform(post("/api/friends/requests/{id}/accept", responseJson(sentResult).get("id").asText())
                        .header("Authorization", bearer(recipient)))
                .andExpect(status().isOk());
    }
}
