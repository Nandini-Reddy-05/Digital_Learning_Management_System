package com.lms.digital.controller;

import com.lms.digital.dto.AssignmentDto;
import com.lms.digital.dto.CourseDto;
import com.lms.digital.dto.QuizDto;
import com.lms.digital.entity.ERole;
import com.lms.digital.exception.BadRequestException;
import com.lms.digital.security.UserDetailsImpl;
import com.lms.digital.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private LessonService lessonService;

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private QuizService quizService;

    @Autowired
    private EnrollmentService enrollmentService;

    private UserDetailsImpl getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            return (UserDetailsImpl) principal;
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<Page<CourseDto.Response>> getCourses(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String[] sort) {

        String sortField = sort[0];
        Sort.Direction sortDirection = Sort.Direction.fromString(sort.length > 1 ? sort[1] : "desc");
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortField));

        return ResponseEntity.ok(courseService.getPublishedCourses(category, search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDto.Response> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @GetMapping("/{courseId}/lessons")
    public ResponseEntity<List<CourseDto.LessonResponse>> getLessonsByCourse(@PathVariable Long courseId) {
        UserDetailsImpl user = getCurrentUser();
        if (user != null) {
            String role = user.getAuthorities().iterator().next().getAuthority();
            if (role.equals(ERole.ROLE_STUDENT.name())) {
                boolean isEnrolled = enrollmentService.isStudentEnrolled(user.getId(), courseId);
                if (!isEnrolled) {
                    throw new BadRequestException("You must be enrolled to view these lessons");
                }
            }
        }
        return ResponseEntity.ok(lessonService.getLessonsByCourse(courseId));
    }

    @GetMapping("/{courseId}/assignments")
    public ResponseEntity<List<AssignmentDto.Response>> getAssignmentsByCourse(@PathVariable Long courseId) {
        UserDetailsImpl user = getCurrentUser();
        if (user != null) {
            String role = user.getAuthorities().iterator().next().getAuthority();
            if (role.equals(ERole.ROLE_STUDENT.name())) {
                boolean isEnrolled = enrollmentService.isStudentEnrolled(user.getId(), courseId);
                if (!isEnrolled) {
                    throw new BadRequestException("You must be enrolled to view these assignments");
                }
            }
        }
        return ResponseEntity.ok(assignmentService.getCourseAssignments(courseId));
    }

    @GetMapping("/{courseId}/quizzes")
    public ResponseEntity<List<QuizDto.Response>> getQuizzesByCourse(@PathVariable Long courseId) {
        UserDetailsImpl user = getCurrentUser();
        if (user != null) {
            String role = user.getAuthorities().iterator().next().getAuthority();
            if (role.equals(ERole.ROLE_STUDENT.name())) {
                boolean isEnrolled = enrollmentService.isStudentEnrolled(user.getId(), courseId);
                if (!isEnrolled) {
                    throw new BadRequestException("You must be enrolled to view these quizzes");
                }
            }
        }
        return ResponseEntity.ok(quizService.getCourseQuizzes(courseId));
    }
}
