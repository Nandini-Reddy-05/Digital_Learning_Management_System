package com.lms.digital.dto;

import lombok.*;
import java.time.LocalDate;

public class ProfileDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentProfileDto {
        private Long id;
        private Long userId;
        private String username;
        private String email;
        private String firstName;
        private String lastName;
        private String phone;
        private LocalDate dob;
        private String address;
        private String bio;
        private String profileImage;
        private LocalDate enrollmentDate;
        private Boolean isActive;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TeacherProfileDto {
        private Long id;
        private Long userId;
        private String username;
        private String email;
        private String firstName;
        private String lastName;
        private String phone;
        private String specialization;
        private String bio;
        private String profileImage;
        private String qualification;
        private Boolean isActive;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserDto {
        private Long id;
        private String username;
        private String email;
        private String role;
        private Boolean isActive;
    }
}
