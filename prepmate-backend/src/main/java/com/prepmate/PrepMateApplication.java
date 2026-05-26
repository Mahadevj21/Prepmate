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
    public CommandLineRunner initAdmin(UserRepository userRepository) {
        return args -> {
            org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder passwordEncoder =
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();

            String adminEmail = "mahadev@prepmate.com";
            java.util.Optional<com.prepmate.model.User> existing = userRepository.findByEmail(adminEmail);
            if (existing.isPresent()) {
                com.prepmate.model.User admin = existing.get();
                // Only update if not already ADMIN to avoid unnecessary DB writes on every restart
                if (!"ADMIN".equals(admin.getRole())) {
                    admin.setRole("ADMIN");
                    admin.setPassword(passwordEncoder.encode("mahadev123"));
                    userRepository.save(admin);
                }
            } else {
                com.prepmate.model.User admin = new com.prepmate.model.User();
                admin.setName("Mahadev");
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode("mahadev123"));
                admin.setRole("ADMIN");
                userRepository.save(admin);
            }
        };
    }
}
