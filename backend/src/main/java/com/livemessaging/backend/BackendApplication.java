package com.livemessaging.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.DotenvEntry;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();

        if (dotenv.entries().isEmpty()) {
            dotenv = Dotenv.configure()
                    .ignoreIfMissing()
                    .directory("../")
                    .load();
        }

        for (DotenvEntry entry : dotenv.entries()) {
            String key = entry.getKey();
            if (System.getenv(key) == null && System.getProperty(key) == null) {
                System.setProperty(key, entry.getValue());
            }
        }

        SpringApplication.run(BackendApplication.class, args);
    }

}
