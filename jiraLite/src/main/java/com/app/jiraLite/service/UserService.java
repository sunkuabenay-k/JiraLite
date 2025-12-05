package com.app.jiraLite.service;

import com.app.jiraLite.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {

    // Registration / Authentication
    UserResponseDto register(UserRegisterDto dto);                            // register
    AuthResponseDto authenticate(AuthRequestDto dto);                         // authenticate (returns JWT)

    // Read / List / Manage
    UserResponseDto getUser(Long userId);                                     // getuser
    Page<UserResponseDto> getAllUsers(Pageable pageable);                     // getallusers

    // Role management
    UserResponseDto assignRole(AssignRoleDto dto);                            // assignrole
    UserResponseDto removeRole(AssignRoleDto dto);                            // removerole

    // User lifecycle & security
    UserResponseDto updateUser(Long userId, UserUpdateDto dto);               // update user fields
    void deleteUser(Long userId);                                             // delete user (admin)
    void changePassword(Long userId, ChangePasswordDto dto);                  // change password

    // Utility
    UserSummaryDto getCurrentUserSummary();                                   // current authenticated user
}

