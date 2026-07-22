package com.lms.digital.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

public class DashboardDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Admin {
        private long studentCount;
        private long teacherCount;
        private long courseCount;
        private long enrollmentCount;
        private Map<String, Long> categoryWiseCourses;
        private List<CourseDto.Response> recentCourses;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Teacher {
        private long courseCount;
        private long studentCount;
        private long assignmentCount;
        private List<AssignmentDto.SubmissionResponse> pendingGradings;
        private List<CourseDto.Response> courses;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Student {
        private long enrolledCoursesCount;
        private long completedCoursesCount;
        private double averageProgressPercentage;
        private List<EnrollmentDto> recentEnrollments;
        private List<QuizDto.AttemptResponse> recentQuizzes;
    }
}
