package com.lms.digital.serviceImpl;

import com.lms.digital.dto.ProfileDto;
import com.lms.digital.entity.Teacher;
import com.lms.digital.entity.User;
import com.lms.digital.exception.ResourceNotFoundException;
import com.lms.digital.mapper.LmsMapper;
import com.lms.digital.repository.TeacherRepository;
import com.lms.digital.repository.UserRepository;
import com.lms.digital.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeacherServiceImpl implements TeacherService {

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public ProfileDto.TeacherProfileDto getProfileByUserId(Long userId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found for user ID: " + userId));
        return LmsMapper.toTeacherProfileDto(teacher);
    }

    @Override
    @Transactional
    public ProfileDto.TeacherProfileDto updateProfile(Long userId, ProfileDto.TeacherProfileDto dto) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found for user ID: " + userId));

        teacher.setFirstName(dto.getFirstName());
        teacher.setLastName(dto.getLastName());
        teacher.setPhone(dto.getPhone());
        teacher.setSpecialization(dto.getSpecialization());
        teacher.setQualification(dto.getQualification());
        teacher.setBio(dto.getBio());
        if (dto.getProfileImage() != null) {
            teacher.setProfileImage(dto.getProfileImage());
        }

        Teacher updated = teacherRepository.save(teacher);
        return LmsMapper.toTeacherProfileDto(updated);
    }

    @Override
    public List<ProfileDto.TeacherProfileDto> getAllTeachers() {
        return teacherRepository.findAll().stream()
                .map(LmsMapper::toTeacherProfileDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProfileDto.TeacherProfileDto updateTeacherByAdmin(Long teacherId, ProfileDto.TeacherProfileDto dto) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with ID: " + teacherId));

        teacher.setFirstName(dto.getFirstName());
        teacher.setLastName(dto.getLastName());
        teacher.setPhone(dto.getPhone());
        teacher.setSpecialization(dto.getSpecialization());
        teacher.setQualification(dto.getQualification());
        teacher.setBio(dto.getBio());
        if (dto.getProfileImage() != null) {
            teacher.setProfileImage(dto.getProfileImage());
        }

        User user = teacher.getUser();
        if (dto.getEmail() != null) {
            user.setEmail(dto.getEmail());
        }
        if (dto.getIsActive() != null) {
            user.setIsActive(dto.getIsActive());
        }
        userRepository.save(user);

        Teacher updated = teacherRepository.save(teacher);
        return LmsMapper.toTeacherProfileDto(updated);
    }

    @Override
    @Transactional
    public void deleteTeacher(Long teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with ID: " + teacherId));
        
        userRepository.delete(teacher.getUser()); // Cascade delete
    }
}
