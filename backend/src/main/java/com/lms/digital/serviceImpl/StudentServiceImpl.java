package com.lms.digital.serviceImpl;

import com.lms.digital.dto.ProfileDto;
import com.lms.digital.entity.Student;
import com.lms.digital.entity.User;
import com.lms.digital.exception.ResourceNotFoundException;
import com.lms.digital.mapper.LmsMapper;
import com.lms.digital.repository.StudentRepository;
import com.lms.digital.repository.UserRepository;
import com.lms.digital.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentServiceImpl implements StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public ProfileDto.StudentProfileDto getProfileByUserId(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user ID: " + userId));
        return LmsMapper.toStudentProfileDto(student);
    }

    @Override
    @Transactional
    public ProfileDto.StudentProfileDto updateProfile(Long userId, ProfileDto.StudentProfileDto dto) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user ID: " + userId));

        student.setFirstName(dto.getFirstName());
        student.setLastName(dto.getLastName());
        student.setPhone(dto.getPhone());
        student.setDob(dto.getDob());
        student.setAddress(dto.getAddress());
        student.setBio(dto.getBio());
        if (dto.getProfileImage() != null) {
            student.setProfileImage(dto.getProfileImage());
        }

        Student updated = studentRepository.save(student);
        return LmsMapper.toStudentProfileDto(updated);
    }

    @Override
    public List<ProfileDto.StudentProfileDto> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(LmsMapper::toStudentProfileDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProfileDto.StudentProfileDto updateStudentByAdmin(Long studentId, ProfileDto.StudentProfileDto dto) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        student.setFirstName(dto.getFirstName());
        student.setLastName(dto.getLastName());
        student.setPhone(dto.getPhone());
        student.setDob(dto.getDob());
        student.setAddress(dto.getAddress());
        student.setBio(dto.getBio());
        if (dto.getProfileImage() != null) {
            student.setProfileImage(dto.getProfileImage());
        }

        User user = student.getUser();
        if (dto.getEmail() != null) {
            user.setEmail(dto.getEmail());
        }
        if (dto.getIsActive() != null) {
            user.setIsActive(dto.getIsActive());
        }
        userRepository.save(user);

        Student updated = studentRepository.save(student);
        return LmsMapper.toStudentProfileDto(updated);
    }

    @Override
    @Transactional
    public void deleteStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));
        
        userRepository.delete(student.getUser()); // Cascade delete
    }
}
