package com.lms.digital.service;

import com.lms.digital.dto.ProfileDto;
import java.util.List;

public interface TeacherService {
    ProfileDto.TeacherProfileDto getProfileByUserId(Long userId);
    ProfileDto.TeacherProfileDto updateProfile(Long userId, ProfileDto.TeacherProfileDto dto);
    List<ProfileDto.TeacherProfileDto> getAllTeachers();
    ProfileDto.TeacherProfileDto updateTeacherByAdmin(Long teacherId, ProfileDto.TeacherProfileDto dto);
    void deleteTeacher(Long teacherId);
}
