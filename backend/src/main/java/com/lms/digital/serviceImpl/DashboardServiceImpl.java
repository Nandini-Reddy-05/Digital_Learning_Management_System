package com.lms.digital.serviceImpl;

import com.lms.digital.dto.*;
import com.lms.digital.entity.*;
import com.lms.digital.exception.ResourceNotFoundException;
import com.lms.digital.mapper.LmsMapper;
import com.lms.digital.repository.*;
import com.lms.digital.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Override
    public DashboardDto.Admin getAdminDashboard() {
        long students = studentRepository.count();
        long teachers = teacherRepository.count();
        long courses = courseRepository.count();
        long enrollments = enrollmentRepository.count();

        // Calculate category wise courses
        Map<String, Long> categoryWise = courseRepository.findAll().stream()
                .collect(Collectors.groupingBy(Course::getCategory, Collectors.counting()));

        // Recent courses (latest 5)
        List<CourseDto.Response> recentCourses = courseRepository.findAll().stream()
                .sorted(Comparator.comparing(Course::getCreatedAt).reversed())
                .limit(5)
                .map(course -> {
                    int lessons = lessonRepository.findByCourseIdOrderBySequenceOrderAsc(course.getId()).size();
                    long enrolled = enrollmentRepository.countByCourseId(course.getId());
                    return LmsMapper.toCourseResponse(course, lessons, enrolled);
                })
                .collect(Collectors.toList());

        return DashboardDto.Admin.builder()
                .studentCount(students)
                .teacherCount(teachers)
                .courseCount(courses)
                .enrollmentCount(enrollments)
                .categoryWiseCourses(categoryWise)
                .recentCourses(recentCourses)
                .build();
    }

    @Override
    public DashboardDto.Teacher getTeacherDashboard(Long teacherUserId) {
        Teacher teacher = teacherRepository.findByUserId(teacherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found for user ID: " + teacherUserId));

        List<Course> teacherCourses = courseRepository.findByTeacherId(teacher.getId());

        long courseCount = teacherCourses.size();

        // Enrolled students count in teacher's courses (distinct)
        Set<Long> studentIds = new HashSet<>();
        for (Course c : teacherCourses) {
            List<Enrollment> enrolls = enrollmentRepository.findByCourseId(c.getId());
            for (Enrollment e : enrolls) {
                studentIds.add(e.getStudent().getId());
            }
        }
        long studentCount = studentIds.size();

        // Pending gradings count for teacher's courses
        List<Submission> allSubmissions = submissionRepository.findAll().stream()
                .filter(sub -> sub.getStatus().equals("SUBMITTED"))
                .filter(sub -> teacherCourses.contains(sub.getAssignment().getCourse()))
                .collect(Collectors.toList());
        
        long pendingCount = allSubmissions.size();

        List<AssignmentDto.SubmissionResponse> recentPending = allSubmissions.stream()
                .sorted(Comparator.comparing(Submission::getSubmissionDate).reversed())
                .limit(5)
                .map(LmsMapper::toSubmissionResponse)
                .collect(Collectors.toList());

        List<CourseDto.Response> courseResponses = teacherCourses.stream()
                .map(course -> {
                    int lessons = lessonRepository.findByCourseIdOrderBySequenceOrderAsc(course.getId()).size();
                    long enrolled = enrollmentRepository.countByCourseId(course.getId());
                    return LmsMapper.toCourseResponse(course, lessons, enrolled);
                })
                .collect(Collectors.toList());

        return DashboardDto.Teacher.builder()
                .courseCount(courseCount)
                .studentCount(studentCount)
                .assignmentCount(pendingCount)
                .pendingGradings(recentPending)
                .courses(courseResponses)
                .build();
    }

    @Override
    public DashboardDto.Student getStudentDashboard(Long studentUserId) {
        Student student = studentRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user ID: " + studentUserId));

        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());

        long enrolledCount = enrollments.size();
        long completedCount = enrollments.stream()
                .filter(e -> e.getStatus().equals("COMPLETED"))
                .count();

        double avgProgress = 0.0;
        if (enrolledCount > 0) {
            double totalProgress = enrollments.stream()
                    .mapToDouble(Enrollment::getProgressPercentage)
                    .sum();
            avgProgress = Math.round((totalProgress / enrolledCount) * 100.0) / 100.0;
        }

        List<EnrollmentDto> recentEnrollments = enrollments.stream()
                .sorted(Comparator.comparing(Enrollment::getEnrollmentDate).reversed())
                .limit(5)
                .map(LmsMapper::toEnrollmentDto)
                .collect(Collectors.toList());

        List<QuizDto.AttemptResponse> recentQuizzes = quizAttemptRepository.findByStudentId(student.getId()).stream()
                .sorted(Comparator.comparing(QuizAttempt::getAttemptDate).reversed())
                .limit(5)
                .map(LmsMapper::toQuizAttemptResponse)
                .collect(Collectors.toList());

        return DashboardDto.Student.builder()
                .enrolledCoursesCount(enrolledCount)
                .completedCoursesCount(completedCount)
                .averageProgressPercentage(avgProgress)
                .recentEnrollments(recentEnrollments)
                .recentQuizzes(recentQuizzes)
                .build();
    }
}
