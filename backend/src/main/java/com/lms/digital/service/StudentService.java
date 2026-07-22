package com.lms.digital.service;

import com.lms.digital.dto.ProfileDto;
import java.util.List;

public interface StudentService {
    ProfileDto.StudentProfileDto getProfileByUserId(Long userId);
    ProfileDto.StudentProfileDto updateProfile(Long userId, ProfileDto.StudentProfileDto dto);
    List<ProfileDto.StudentProfileDto> getAllStudents();
    ProfileDto.StudentProfileDto updateStudentByAdmin(Long studentId, ProfileDto.StudentProfileDto dto);
    void deleteStudent(Long studentId);
}
