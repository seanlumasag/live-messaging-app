package com.livemessaging.backend.config;

import com.livemessaging.backend.model.Room;
import com.livemessaging.backend.model.RoomType;
import com.livemessaging.backend.model.User;
import com.livemessaging.backend.repository.RoomRepository;
import com.livemessaging.backend.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Component
public class DataInitializer implements ApplicationRunner {

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public DataInitializer(RoomRepository roomRepository, UserRepository userRepository) {
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        backfillUsernames();
        backfillRoomTypes();

        if (!roomRepository.existsByNameIgnoreCase("general")) {
            Room room = new Room();
            room.setName("general");
            room.setType(RoomType.PUBLIC);
            roomRepository.save(room);
        }
    }

    private void backfillUsernames() {
        for (User user : userRepository.findAll()) {
            if (user.getUsername() != null && !user.getUsername().isBlank()) {
                continue;
            }

            String base = usernameBase(user.getEmail());
            String candidate = base;
            int suffix = 1;
            while (userRepository.existsByUsername(candidate)) {
                candidate = base + suffix;
                suffix++;
            }

            user.setUsername(candidate);
            userRepository.save(user);
        }
    }

    private void backfillRoomTypes() {
        for (Room room : roomRepository.findAll()) {
            if (room.getType() != null) {
                continue;
            }
            room.setType(RoomType.PUBLIC);
            roomRepository.save(room);
        }
    }

    private String usernameBase(String email) {
        String value = email == null ? "user" : email.split("@")[0];
        String normalized = value.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9_.-]", "");
        if (normalized.length() < 3) {
            normalized = (normalized + "user").substring(0, 4);
        }
        if (normalized.length() > 24) {
            normalized = normalized.substring(0, 24);
        }
        return normalized;
    }
}
