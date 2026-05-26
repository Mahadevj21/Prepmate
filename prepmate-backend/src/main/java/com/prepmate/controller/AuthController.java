package com.prepmate.controller;

import com.prepmate.dto.LoginRequest;
import com.prepmate.dto.LoginResponse;
import com.prepmate.dto.RegisterRequest;
import com.prepmate.model.User;
import com.prepmate.repository.UserRepository;
import com.prepmate.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(AuthService authService,
                          UserRepository userRepository,
                          BCryptPasswordEncoder passwordEncoder) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request.getName(), request.getEmail(), request.getPassword());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Registration successful"));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        Map<String, String> result = authService.login(request.getEmail(), request.getPassword());
        LoginResponse response = new LoginResponse(
                result.get("token"),
                result.get("email"),
                Long.valueOf(result.get("userId")),
                result.get("name"),
                result.get("role")
        );
        return ResponseEntity.ok(response);
    }

    /**
     * Allows any authenticated user to change their own password.
     * Uses userId from the request body — the JWT filter already verified the token.
     */
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    // Inner DTO — only used by this endpoint
    public static class ChangePasswordRequest {
        @NotNull
        private Long userId;

        @NotBlank
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String newPassword;

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
