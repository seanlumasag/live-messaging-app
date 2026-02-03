package com.livemessaging.backend.config;

import com.livemessaging.backend.model.Room;
import com.livemessaging.backend.repository.RoomRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements ApplicationRunner {

    private final RoomRepository roomRepository;

    public DataInitializer(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!roomRepository.existsByNameIgnoreCase("general")) {
            Room room = new Room();
            room.setName("general");
            roomRepository.save(room);
        }
    }
}
