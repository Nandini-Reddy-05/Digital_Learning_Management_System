package com.lms.digital.serviceImpl;

import com.lms.digital.dto.EnrollmentDto;
import com.lms.digital.entity.Course;
import com.lms.digital.entity.Enrollment;
import com.lms.digital.entity.Student;
import com.lms.digital.exception.BadRequestException;
import com.lms.digital.exception.ResourceNotFoundException;
import com.lms.digital.mapper.LmsMapper;
import com.lms.digital.repository.*;
import com.lms.digital.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EnrollmentServiceImpl implements EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private LessonProgressRepository lessonProgressRepository;

    @Autowired
    private com.lms.digital.service.CertificateService certificateService;

    @Override
    @Transactional
    public EnrollmentDto enrollStudent(Long studentUserId, Long courseId) {
        Student student = studentRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user ID: " + studentUserId));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));

        if (enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new BadRequestException("Student is already enrolled in this course");
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .progressPercentage(0.0)
                .status("ACTIVE")
                .build();

        Enrollment saved = enrollmentRepository.save(enrollment);
        return LmsMapper.toEnrollmentDto(saved);
    }

    @Override
    public List<EnrollmentDto> getStudentEnrollments(Long studentUserId) {
        Student student = studentRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user ID: " + studentUserId));

        return enrollmentRepository.findByStudentId(student.getId()).stream()
                .map(LmsMapper::toEnrollmentDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<EnrollmentDto> getCourseEnrollments(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResourceNotFoundException("Course not found with ID: " + courseId);
        }

        return enrollmentRepository.findByCourseId(courseId).stream()
                .map(LmsMapper::toEnrollmentDto)
                .collect(Collectors.toList());
    }

    @Override
    public boolean isStudentEnrolled(Long studentUserId, Long courseId) {
        Student student = studentRepository.findByUserId(studentUserId).orElse(null);
        if (student == null) return false;
        return enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId);
    }

    @Override
    @Transactional
    public Double updateEnrollmentProgress(Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment record not found"));

        long totalLessons = lessonRepository.findByCourseIdOrderBySequenceOrderAsc(enrollment.getCourse().getId()).size();
        if (totalLessons == 0) {
            enrollment.setProgressPercentage(100.0);
            enrollment.setStatus("COMPLETED");
            enrollmentRepository.save(enrollment);
            return 100.0;
        }

        long completedLessons = lessonProgressRepository.countByEnrollmentIdAndCompleted(enrollmentId, true);
        double progress = ((double) completedLessons / totalLessons) * 100;
        progress = Math.round(progress * 100.0) / 100.0; // Round to 2 decimal places

        enrollment.setProgressPercentage(progress);
        if (progress >= 100.0) {
            enrollment.setStatus("COMPLETED");
        } else {
            enrollment.setStatus("ACTIVE");
        }

        enrollmentRepository.save(enrollment);

        if (enrollment.getStatus().equals("COMPLETED")) {
            try {
                certificateService.generateCertificate(enrollment.getStudent().getUser().getId(), enrollment.getCourse().getId());
            } catch (Exception e) {
                // Skip if error to avoid blocking progress save transaction
            }
        }

        return progress;
    }

    @Override
    public List<EnrollmentDto> getAllEnrollments() {
        return enrollmentRepository.findAll().stream()
                .map(LmsMapper::toEnrollmentDto)
                .collect(Collectors.toList());
    }
}
