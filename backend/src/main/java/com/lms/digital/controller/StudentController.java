package com.lms.digital.controller;

import com.lms.digital.dto.*;
import com.lms.digital.security.UserDetailsImpl;
import com.lms.digital.service.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private EnrollmentService enrollmentService;

    @Autowired
    private ProgressService progressService;

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private QuizService quizService;

    @Autowired
    private com.lms.digital.service.CertificateService certificateService;

    private Long getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDto.Student> getStudentDashboard() {
        return ResponseEntity.ok(dashboardService.getStudentDashboard(getCurrentUserId()));
    }

    @GetMapping("/profile")
    public ResponseEntity<ProfileDto.StudentProfileDto> getProfile() {
        return ResponseEntity.ok(studentService.getProfileByUserId(getCurrentUserId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileDto.StudentProfileDto> updateProfile(@RequestBody ProfileDto.StudentProfileDto dto) {
        return ResponseEntity.ok(studentService.updateProfile(getCurrentUserId(), dto));
    }

    @GetMapping("/courses")
    public ResponseEntity<List<EnrollmentDto>> getEnrolledCourses() {
        return ResponseEntity.ok(enrollmentService.getStudentEnrollments(getCurrentUserId()));
    }

    @PostMapping("/courses/{courseId}/enroll")
    public ResponseEntity<EnrollmentDto> enrollCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(enrollmentService.enrollStudent(getCurrentUserId(), courseId));
    }

    @PostMapping("/lessons/{lessonId}/complete")
    public ResponseEntity<?> completeLesson(@PathVariable Long lessonId) {
        progressService.markLessonAsCompleted(getCurrentUserId(), lessonId);
        return ResponseEntity.ok().body("{\"message\": \"Lesson marked as completed successfully\"}");
    }

    @GetMapping("/courses/{courseId}/completed-lessons")
    public ResponseEntity<List<Long>> getCompletedLessons(@PathVariable Long courseId) {
        return ResponseEntity.ok(progressService.getCompletedLessons(getCurrentUserId(), courseId));
    }

    @PostMapping("/assignments/{assignmentId}/submit")
    public ResponseEntity<AssignmentDto.SubmissionResponse> submitAssignment(@PathVariable Long assignmentId, @Valid @RequestBody AssignmentDto.Submit dto) {
        return ResponseEntity.ok(assignmentService.submitAssignment(assignmentId, getCurrentUserId(), dto));
    }

    @GetMapping("/assignments/submissions")
    public ResponseEntity<List<AssignmentDto.SubmissionResponse>> getSubmissions() {
        return ResponseEntity.ok(assignmentService.getStudentSubmissions(getCurrentUserId()));
    }

    @PostMapping("/quizzes/{quizId}/submit")
    public ResponseEntity<QuizDto.AttemptResponse> submitQuiz(@PathVariable Long quizId, @RequestBody QuizDto.Submit dto) {
        return ResponseEntity.ok(quizService.submitQuiz(quizId, getCurrentUserId(), dto));
    }

    @GetMapping("/quizzes/attempts")
    public ResponseEntity<List<QuizDto.AttemptResponse>> getQuizAttempts() {
        return ResponseEntity.ok(quizService.getStudentAttempts(getCurrentUserId()));
    }

    @GetMapping("/courses/{courseId}/certificate")
    public ResponseEntity<com.lms.digital.dto.CertificateDto> getCertificate(@PathVariable Long courseId) {
        return ResponseEntity.ok(certificateService.getCertificateByCourse(getCurrentUserId(), courseId));
    }

    @GetMapping("/certificates")
    public ResponseEntity<List<com.lms.digital.dto.CertificateDto>> getStudentCertificates() {
        return ResponseEntity.ok(certificateService.getStudentCertificates(getCurrentUserId()));
    }
}
