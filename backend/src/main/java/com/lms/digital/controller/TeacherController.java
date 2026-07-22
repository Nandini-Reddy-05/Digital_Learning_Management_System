package com.lms.digital.controller;

import com.lms.digital.dto.AssignmentDto;
import com.lms.digital.dto.CourseDto;
import com.lms.digital.dto.DashboardDto;
import com.lms.digital.dto.ProfileDto;
import com.lms.digital.dto.QuizDto;
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
@RequestMapping("/api/teacher")
@PreAuthorize("hasRole('TEACHER')")
public class TeacherController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private LessonService lessonService;

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private QuizService quizService;

    @Autowired
    private TeacherService teacherService;

    private Long getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDto.Teacher> getTeacherDashboard() {
        return ResponseEntity.ok(dashboardService.getTeacherDashboard(getCurrentUserId()));
    }

    @GetMapping("/profile")
    public ResponseEntity<ProfileDto.TeacherProfileDto> getProfile() {
        return ResponseEntity.ok(teacherService.getProfileByUserId(getCurrentUserId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileDto.TeacherProfileDto> updateProfile(@RequestBody ProfileDto.TeacherProfileDto dto) {
        return ResponseEntity.ok(teacherService.updateProfile(getCurrentUserId(), dto));
    }

    @GetMapping("/courses")
    public ResponseEntity<List<CourseDto.Response>> getCourses() {
        return ResponseEntity.ok(courseService.getCoursesByTeacher(getCurrentUserId()));
    }

    @PostMapping("/courses")
    public ResponseEntity<CourseDto.Response> createCourse(@Valid @RequestBody CourseDto.Create dto) {
        return ResponseEntity.ok(courseService.createCourse(getCurrentUserId(), dto));
    }

    @PutMapping("/courses/{id}")
    public ResponseEntity<CourseDto.Response> updateCourse(@PathVariable Long id, @Valid @RequestBody CourseDto.Create dto) {
        return ResponseEntity.ok(courseService.updateCourse(id, getCurrentUserId(), dto));
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id, getCurrentUserId());
        return ResponseEntity.ok().body("{\"message\": \"Course deleted successfully\"}");
    }

    @PostMapping("/courses/{courseId}/lessons")
    public ResponseEntity<CourseDto.LessonResponse> addLesson(@PathVariable Long courseId, @Valid @RequestBody CourseDto.LessonCreate dto) {
        return ResponseEntity.ok(lessonService.addLesson(courseId, getCurrentUserId(), dto));
    }

    @PutMapping("/lessons/{lessonId}")
    public ResponseEntity<CourseDto.LessonResponse> updateLesson(@PathVariable Long lessonId, @Valid @RequestBody CourseDto.LessonCreate dto) {
        return ResponseEntity.ok(lessonService.updateLesson(lessonId, getCurrentUserId(), dto));
    }

    @DeleteMapping("/lessons/{lessonId}")
    public ResponseEntity<?> deleteLesson(@PathVariable Long lessonId) {
        lessonService.deleteLesson(lessonId, getCurrentUserId());
        return ResponseEntity.ok().body("{\"message\": \"Lesson deleted successfully\"}");
    }

    @PostMapping("/courses/{courseId}/assignments")
    public ResponseEntity<AssignmentDto.Response> createAssignment(@PathVariable Long courseId, @Valid @RequestBody AssignmentDto.Create dto) {
        return ResponseEntity.ok(assignmentService.createAssignment(courseId, getCurrentUserId(), dto));
    }

    @DeleteMapping("/assignments/{assignmentId}")
    public ResponseEntity<?> deleteAssignment(@PathVariable Long assignmentId) {
        assignmentService.deleteAssignment(assignmentId, getCurrentUserId());
        return ResponseEntity.ok().body("{\"message\": \"Assignment deleted successfully\"}");
    }

    @GetMapping("/assignments/{assignmentId}/submissions")
    public ResponseEntity<List<AssignmentDto.SubmissionResponse>> getSubmissions(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(assignmentService.getAssignmentSubmissions(assignmentId, getCurrentUserId()));
    }

    @PostMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<AssignmentDto.SubmissionResponse> gradeSubmission(@PathVariable Long submissionId, @Valid @RequestBody AssignmentDto.Grade dto) {
        return ResponseEntity.ok(assignmentService.gradeSubmission(submissionId, getCurrentUserId(), dto));
    }

    @GetMapping("/submissions/pending")
    public ResponseEntity<List<AssignmentDto.SubmissionResponse>> getPendingSubmissions() {
        return ResponseEntity.ok(assignmentService.getPendingSubmissions(getCurrentUserId()));
    }

    @PostMapping("/courses/{courseId}/quizzes")
    public ResponseEntity<QuizDto.Response> createQuiz(@PathVariable Long courseId, @Valid @RequestBody QuizDto.Create dto) {
        return ResponseEntity.ok(quizService.createQuiz(courseId, getCurrentUserId(), dto));
    }

    @DeleteMapping("/quizzes/{quizId}")
    public ResponseEntity<?> deleteQuiz(@PathVariable Long quizId) {
        quizService.deleteQuiz(quizId, getCurrentUserId());
        return ResponseEntity.ok().body("{\"message\": \"Quiz deleted successfully\"}");
    }

    @GetMapping("/quizzes/{quizId}/attempts")
    public ResponseEntity<List<QuizDto.AttemptResponse>> getQuizAttempts(@PathVariable Long quizId) {
        return ResponseEntity.ok(quizService.getQuizAttempts(quizId, getCurrentUserId()));
    }
}
