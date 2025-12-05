package com.app.jiraLite.service.impl;

import com.app.jiraLite.dto.*;
import com.app.jiraLite.entity.Role;
import com.app.jiraLite.entity.User;
import com.app.jiraLite.exception.IssueException;
import com.app.jiraLite.repository.RoleRepository;
import com.app.jiraLite.repository.UserRepository;
import com.app.jiraLite.security.JwtUtil;
import com.app.jiraLite.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    

    // --- Registration & Auth ---

    @Override
    public UserResponseDto register(UserRegisterDto dto) {
        // 1. Validations
        if (userRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new IssueException("User", "username", dto.getUsername());
        }
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new IssueException("User", "email", dto.getEmail());
        }

        // 2. Create Entity
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));

        // 3. Assign Default Role (USER)
        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new IssueException("Default Role USER not found in DB"));
        
        user.getRoles().add(userRole);

        // 4. Save
        User savedUser = userRepository.save(user);
        return UserResponseDto.fromEntity(savedUser);
    }

    @Override
    public AuthResponseDto authenticate(AuthRequestDto dto) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(dto.getUsernameOrEmail(), dto.getPassword())
        );

        if (authentication.isAuthenticated()) {
            String token = jwtUtil.generateToken(dto.getUsernameOrEmail());
            
            // Fetch user details to return with token
            User user = userRepository.findByUsername(dto.getUsernameOrEmail())
                    .orElseThrow(() -> new IssueException("User not found"));
            
            return new AuthResponseDto(token, "Bearer", UserResponseDto.fromEntity(user));
        } else {
            throw new IssueException("Invalid credentials");
        }
    }

    // --- Read / Manage ---

    @Override
    public UserResponseDto getUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IssueException("User", "id", userId));
        return UserResponseDto.fromEntity(user);
    }

    @Override
    public Page<UserResponseDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserResponseDto::fromEntity);
    }

    @Override
    public UserSummaryDto getCurrentUserSummary() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IssueException("Current user not found"));
                
        return UserSummaryDto.fromEntity(user);
    }

    // --- Placeholder Implementations for other Interface Methods ---
    
    @Override
    public UserResponseDto assignRole(AssignRoleDto dto) {
        // 1. Fetch User
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new IssueException("User", "id", dto.getUserId()));

        // 2. Fetch Role
        Role role = roleRepository.findByName(dto.getRoleName())
                .orElseThrow(() -> new IssueException("Role not found: " + dto.getRoleName()));

        // 3. Add Role
        user.getRoles().add(role);
        
        return UserResponseDto.fromEntity(userRepository.save(user));
    }

    @Override
    public UserResponseDto removeRole(AssignRoleDto dto) {
        // Logic to remove role
        return null; 
    }

    @Override
    public UserResponseDto updateUser(Long userId, UserUpdateDto dto) {
         User user = userRepository.findById(userId)
                .orElseThrow(() -> new IssueException("User", "id", userId));
         dto.applyTo(user);
         return UserResponseDto.fromEntity(userRepository.save(user));
    }

    @Override
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    @Override
    public void changePassword(Long userId, ChangePasswordDto dto) {
        // Validate old password, encode new password, save
    }
}