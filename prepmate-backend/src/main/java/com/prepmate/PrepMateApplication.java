package com.prepmate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import com.prepmate.repository.UserRepository;

@SpringBootApplication
public class PrepMateApplication {

    public static void main(String[] args) {
        SpringApplication.run(PrepMateApplication.class, args);
    }

    @Bean
    public CommandLineRunner initDatabase(
            UserRepository userRepository,
            @org.springframework.beans.factory.annotation.Value("${ADMIN_EMAIL:admin@prepmate.com}") String adminEmail,
            @org.springframework.beans.factory.annotation.Value("${ADMIN_PASSWORD:admin123}") String adminPassword) {
        return args -> {
            org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder passwordEncoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();

            // Seed Admin User
            if (userRepository.findByEmail(adminEmail).isEmpty()) {
                com.prepmate.model.User admin = new com.prepmate.model.User();
                admin.setName("System Admin");
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setRole("ADMIN");
                userRepository.save(admin);
            }

            // Seed Guest User for Sandbox
            String guestEmail = "guest@prepmate.com";
            if (userRepository.findByEmail(guestEmail).isEmpty()) {
                com.prepmate.model.User guest = new com.prepmate.model.User();
                guest.setName("Sandbox Guest");
                guest.setEmail(guestEmail);
                guest.setPassword(passwordEncoder.encode("password123"));
                guest.setRole("USER");
                userRepository.save(guest);
            }
        };
    }
}
