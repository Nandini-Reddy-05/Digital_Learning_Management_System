package com.lms.digital.serviceImpl;

import com.lms.digital.dto.AuthDto;
import com.lms.digital.entity.*;
import com.lms.digital.exception.BadRequestException;
import com.lms.digital.exception.ResourceNotFoundException;
import com.lms.digital.repository.*;
import com.lms.digital.security.JwtUtils;
import com.lms.digital.security.UserDetailsImpl;
import com.lms.digital.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    public AuthDto.JwtResponse authenticateUser(AuthDto.LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsernameOrEmail(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        return AuthDto.JwtResponse.builder()
                .token(jwt)
                .id(userDetails.getId())
                .username(userDetails.getUsername())
                .email(userDetails.getEmail())
                .role(role)
                .build();
    }

    @Override
    @Transactional
    public void registerUser(AuthDto.SignupRequest signupRequest) {
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            throw new BadRequestException("Username is already taken!");
        }

        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new BadRequestException("Email is already in use!");
        }

        ERole eRole;
        try {
            eRole = ERole.valueOf("ROLE_" + signupRequest.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid Role: " + signupRequest.getRole());
        }

        Role role = roleRepository.findByName(eRole)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found in DB"));

        User user = User.builder()
                .username(signupRequest.getUsername())
                .email(signupRequest.getEmail())
                .password(passwordEncoder.encode(signupRequest.getPassword()))
                .role(role)
                .isActive(true)
                .build();

        userRepository.save(user);

        if (eRole == ERole.ROLE_STUDENT) {
            Student student = Student.builder()
                    .user(user)
                    .firstName(signupRequest.getFirstName())
                    .lastName(signupRequest.getLastName())
                    .phone(signupRequest.getPhone())
                    .build();
            studentRepository.save(student);
        } else if (eRole == ERole.ROLE_TEACHER) {
            Teacher teacher = Teacher.builder()
                    .user(user)
                    .firstName(signupRequest.getFirstName())
                    .lastName(signupRequest.getLastName())
                    .phone(signupRequest.getPhone())
                    .specialization(signupRequest.getSpecialization())
                    .qualification(signupRequest.getQualification())
                    .build();
            teacherRepository.save(teacher);
        }
    }

    @Override
    @Transactional
    public void changePassword(String username, AuthDto.ChangePasswordRequest changePasswordRequest) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(changePasswordRequest.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid old password!");
        }

        user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public void forgotPassword(String email) {
        userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        
        System.out.println("Forgot password request received for " + email + ". Triggering recovery email...");
    }
}
