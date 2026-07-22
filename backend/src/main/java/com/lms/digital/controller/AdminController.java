package com.lms.digital.controller;

import com.lms.digital.dto.CourseDto;
import com.lms.digital.dto.DashboardDto;
import com.lms.digital.dto.ProfileDto;
import com.lms.digital.dto.EnrollmentDto;
import com.lms.digital.entity.User;
import com.lms.digital.exception.ResourceNotFoundException;
import com.lms.digital.mapper.LmsMapper;
import com.lms.digital.repository.UserRepository;
import com.lms.digital.service.CourseService;
import com.lms.digital.service.DashboardService;
import com.lms.digital.service.EnrollmentService;
import com.lms.digital.service.StudentService;
import com.lms.digital.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private EnrollmentService enrollmentService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDto.Admin> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }

    @GetMapping("/users")
    public ResponseEntity<List<ProfileDto.UserDto>> getAllUsers() {
        List<ProfileDto.UserDto> users = userRepository.findAll().stream()
                .map(LmsMapper::toUserDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PostMapping("/users/{userId}/toggle")
    public ResponseEntity<?> toggleUserActive(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
        return ResponseEntity.ok().body("{\"message\": \"User active state updated successfully\"}");
    }

    @GetMapping("/students")
    public ResponseEntity<List<ProfileDto.StudentProfileDto>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<ProfileDto.StudentProfileDto> updateStudent(@PathVariable Long id, @RequestBody ProfileDto.StudentProfileDto dto) {
        return ResponseEntity.ok(studentService.updateStudentByAdmin(id, dto));
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok().body("{\"message\": \"Student deleted successfully\"}");
    }

    @GetMapping("/teachers")
    public ResponseEntity<List<ProfileDto.TeacherProfileDto>> getAllTeachers() {
        return ResponseEntity.ok(teacherService.getAllTeachers());
    }

    @PutMapping("/teachers/{id}")
    public ResponseEntity<ProfileDto.TeacherProfileDto> updateTeacher(@PathVariable Long id, @RequestBody ProfileDto.TeacherProfileDto dto) {
        return ResponseEntity.ok(teacherService.updateTeacherByAdmin(id, dto));
    }

    @DeleteMapping("/teachers/{id}")
    public ResponseEntity<?> deleteTeacher(@PathVariable Long id) {
        teacherService.deleteTeacher(id);
        return ResponseEntity.ok().body("{\"message\": \"Teacher deleted successfully\"}");
    }

    @GetMapping("/courses")
    public ResponseEntity<List<CourseDto.Response>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @PutMapping("/courses/{id}")
    public ResponseEntity<CourseDto.Response> updateCourse(@PathVariable Long id, @RequestBody CourseDto.Create dto) {
        return ResponseEntity.ok(courseService.updateCourseByAdmin(id, dto));
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourseByAdmin(id);
        return ResponseEntity.ok().body("{\"message\": \"Course deleted successfully\"}");
    }

    @PostMapping("/courses/{courseId}/assign-teacher/{teacherId}")
    public ResponseEntity<?> assignTeacher(@PathVariable Long courseId, @PathVariable Long teacherId) {
        courseService.assignTeacherToCourse(courseId, teacherId);
        return ResponseEntity.ok().body("{\"message\": \"Teacher assigned successfully\"}");
    }

    @GetMapping("/enrollments")
    public ResponseEntity<List<EnrollmentDto>> getAllEnrollments() {
        return ResponseEntity.ok(enrollmentService.getAllEnrollments());
    }
}
