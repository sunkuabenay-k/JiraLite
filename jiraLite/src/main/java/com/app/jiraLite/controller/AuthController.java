package com.app.jiraLite.controller;

import com.app.jiraLite.dto.AuthRequestDto;
import com.app.jiraLite.dto.AuthResponseDto;
import com.app.jiraLite.dto.UserRegisterDto;
import com.app.jiraLite.dto.UserResponseDto;
import com.app.jiraLite.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(@Valid @RequestBody UserRegisterDto dto) {
        return new ResponseEntity<>(userService.register(dto), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody AuthRequestDto dto) {
        return ResponseEntity.ok(userService.authenticate(dto));
    }
}