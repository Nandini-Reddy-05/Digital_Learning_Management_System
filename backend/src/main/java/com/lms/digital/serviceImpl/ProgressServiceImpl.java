package com.lms.digital.serviceImpl;

import com.lms.digital.entity.*;
import com.lms.digital.exception.BadRequestException;
import com.lms.digital.exception.ResourceNotFoundException;
import com.lms.digital.repository.*;
import com.lms.digital.service.EnrollmentService;
import com.lms.digital.service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProgressServiceImpl implements ProgressService {

    @Autowired
    private LessonProgressRepository lessonProgressRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private EnrollmentService enrollmentService;

    @Override
    @Transactional
    public void markLessonAsCompleted(Long studentUserId, Long lessonId) {
        Student student = studentRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user ID: " + studentUserId));

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with ID: " + lessonId));

        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(student.getId(), lesson.getCourse().getId())
                .orElseThrow(() -> new BadRequestException("Student is not enrolled in the course associated with this lesson"));

        // If not already completed, create progress record
        if (!lessonProgressRepository.findByEnrollmentIdAndLessonId(enrollment.getId(), lessonId).isPresent()) {
            LessonProgress progress = LessonProgress.builder()
                    .enrollment(enrollment)
                    .lesson(lesson)
                    .completed(true)
                    .build();
            lessonProgressRepository.save(progress);

            // Re-calculate total enrollment progress
            enrollmentService.updateEnrollmentProgress(enrollment.getId());
        }
    }

    @Override
    public boolean isLessonCompleted(Long studentUserId, Long lessonId) {
        Student student = studentRepository.findByUserId(studentUserId).orElse(null);
        if (student == null) return false;

        Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
        if (lesson == null) return false;

        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(student.getId(), lesson.getCourse().getId()).orElse(null);
        if (enrollment == null) return false;

        return lessonProgressRepository.findByEnrollmentIdAndLessonId(enrollment.getId(), lessonId).isPresent();
    }

    @Override
    public List<Long> getCompletedLessons(Long studentUserId, Long courseId) {
        Student student = studentRepository.findByUserId(studentUserId).orElse(null);
        if (student == null) return Collections.emptyList();

        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(student.getId(), courseId).orElse(null);
        if (enrollment == null) return Collections.emptyList();

        return lessonProgressRepository.findByEnrollmentId(enrollment.getId()).stream()
                .map(p -> p.getLesson().getId())
                .collect(Collectors.toList());
    }
}
