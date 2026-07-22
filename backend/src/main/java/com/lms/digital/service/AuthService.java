package com.lms.digital.service;

import com.lms.digital.dto.AuthDto;

public interface AuthService {
    AuthDto.JwtResponse authenticateUser(AuthDto.LoginRequest loginRequest);
    void registerUser(AuthDto.SignupRequest signupRequest);
    void changePassword(String username, AuthDto.ChangePasswordRequest changePasswordRequest);
    void forgotPassword(String email);
}
