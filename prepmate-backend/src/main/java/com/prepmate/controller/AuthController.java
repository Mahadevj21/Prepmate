package com.prepmate.controller;

import com.prepmate.dto.LoginRequest;
import com.prepmate.dto.LoginResponse;
import com.prepmate.dto.RegisterRequest;
import com.prepmate.model.User;
import com.prepmate.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody RegisterRequest request) {
        User savedUser = authService.register(request.getName(), request.getEmail(), request.getPassword());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        Map<String, String> result = authService.login(request.getEmail(), request.getPassword());
        LoginResponse response = new LoginResponse(result.get("token"), result.get("email"));
        return ResponseEntity.ok(response);
    }
}
