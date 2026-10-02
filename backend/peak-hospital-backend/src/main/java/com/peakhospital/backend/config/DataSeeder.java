package com.peakhospital.backend.config;

import com.peakhospital.backend.model.Role;
import com.peakhospital.backend.model.User;
import com.peakhospital.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("Default Admin");
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            System.out.println(">>> Seeded default admin account: username 'admin', password 'admin123'. Change this!");
        }
    }
}
