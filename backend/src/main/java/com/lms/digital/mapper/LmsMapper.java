package com.lms.digital.mapper;

import com.lms.digital.entity.*;
import com.lms.digital.dto.*;

import java.util.stream.Collectors;

public class LmsMapper {

    public static ProfileDto.UserDto toUserDto(User user) {
        if (user == null) return null;
        return ProfileDto.UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().getName().name())
                .isActive(user.getIsActive())
                .build();
    }

    public static ProfileDto.StudentProfileDto toStudentProfileDto(Student student) {
        if (student == null) return null;
        return ProfileDto.StudentProfileDto.builder()
                .id(student.getId())
                .userId(student.getUser().getId())
                .username(student.getUser().getUsername())
                .email(student.getUser().getEmail())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .phone(student.getPhone())
                .dob(student.getDob())
                .address(student.getAddress())
                .bio(student.getBio())
                .profileImage(student.getProfileImage())
                .enrollmentDate(student.getEnrollmentDate())
                .isActive(student.getUser().getIsActive())
                .build();
    }

    public static ProfileDto.TeacherProfileDto toTeacherProfileDto(Teacher teacher) {
        if (teacher == null) return null;
        return ProfileDto.TeacherProfileDto.builder()
                .id(teacher.getId())
                .userId(teacher.getUser().getId())
                .username(teacher.getUser().getUsername())
                .email(teacher.getUser().getEmail())
                .firstName(teacher.getFirstName())
                .lastName(teacher.getLastName())
                .phone(teacher.getPhone())
                .specialization(teacher.getSpecialization())
                .bio(teacher.getBio())
                .profileImage(teacher.getProfileImage())
                .qualification(teacher.getQualification())
                .isActive(teacher.getUser().getIsActive())
                .build();
    }

    public static CourseDto.Response toCourseResponse(Course course, Integer lessonCount, Long enrollmentCount) {
        if (course == null) return null;
        return CourseDto.Response.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .category(course.getCategory())
                .teacherId(course.getTeacher().getId())
                .teacherName(course.getTeacher().getFirstName() + " " + course.getTeacher().getLastName())
                .price(course.getPrice())
                .status(course.getStatus())
                .imageUrl(course.getImageUrl())
                .lessonCount(lessonCount)
                .enrollmentCount(enrollmentCount)
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }

    public static CourseDto.LessonResponse toLessonResponse(Lesson lesson) {
        if (lesson == null) return null;
        return CourseDto.LessonResponse.builder()
                .id(lesson.getId())
                .courseId(lesson.getCourse().getId())
                .title(lesson.getTitle())
                .description(lesson.getDescription())
                .videoUrl(lesson.getVideoUrl())
                .pdfUrl(lesson.getPdfUrl())
                .duration(lesson.getDuration())
                .sequenceOrder(lesson.getSequenceOrder())
                .createdAt(lesson.getCreatedAt())
                .build();
    }

    public static EnrollmentDto toEnrollmentDto(Enrollment enrollment) {
        if (enrollment == null) return null;
        return EnrollmentDto.builder()
                .id(enrollment.getId())
                .studentId(enrollment.getStudent().getId())
                .studentName(enrollment.getStudent().getFirstName() + " " + enrollment.getStudent().getLastName())
                .courseId(enrollment.getCourse().getId())
                .courseTitle(enrollment.getCourse().getTitle())
                .courseCategory(enrollment.getCourse().getCategory())
                .courseImageUrl(enrollment.getCourse().getImageUrl())
                .enrollmentDate(enrollment.getEnrollmentDate())
                .progressPercentage(enrollment.getProgressPercentage())
                .status(enrollment.getStatus())
                .build();
    }

    public static AssignmentDto.Response toAssignmentResponse(Assignment assignment) {
        if (assignment == null) return null;
        return AssignmentDto.Response.builder()
                .id(assignment.getId())
                .courseId(assignment.getCourse().getId())
                .courseTitle(assignment.getCourse().getTitle())
                .title(assignment.getTitle())
                .description(assignment.getDescription())
                .dueDate(assignment.getDueDate())
                .maxPoints(assignment.getMaxPoints())
                .fileUrl(assignment.getFileUrl())
                .createdAt(assignment.getCreatedAt())
                .build();
    }

    public static AssignmentDto.SubmissionResponse toSubmissionResponse(Submission submission) {
        if (submission == null) return null;
        return AssignmentDto.SubmissionResponse.builder()
                .id(submission.getId())
                .assignmentId(submission.getAssignment().getId())
                .assignmentTitle(submission.getAssignment().getTitle())
                .courseId(submission.getAssignment().getCourse().getId())
                .courseTitle(submission.getAssignment().getCourse().getTitle())
                .studentId(submission.getStudent().getId())
                .studentName(submission.getStudent().getFirstName() + " " + submission.getStudent().getLastName())
                .submissionDate(submission.getSubmissionDate())
                .fileUrl(submission.getFileUrl())
                .remarks(submission.getRemarks())
                .pointsEarned(submission.getPointsEarned())
                .status(submission.getStatus())
                .maxPoints(submission.getAssignment().getMaxPoints())
                .build();
    }

    public static QuizDto.Response toQuizResponse(Quiz quiz, boolean maskCorrectOption) {
        if (quiz == null) return null;
        return QuizDto.Response.builder()
                .id(quiz.getId())
                .courseId(quiz.getCourse().getId())
                .courseTitle(quiz.getCourse().getTitle())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .timeLimit(quiz.getTimeLimit())
                .passingScore(quiz.getPassingScore())
                .questions(quiz.getQuestions().stream()
                        .map(q -> toQuestionResponse(q, maskCorrectOption))
                        .collect(Collectors.toList()))
                .createdAt(quiz.getCreatedAt())
                .build();
    }

    public static QuizDto.QuestionResponse toQuestionResponse(Question question, boolean maskCorrectOption) {
        if (question == null) return null;
        return QuizDto.QuestionResponse.builder()
                .id(question.getId())
                .questionText(question.getQuestionText())
                .optionA(question.getOptionA())
                .optionB(question.getOptionB())
                .optionC(question.getOptionC())
                .optionD(question.getOptionD())
                .correctOption(maskCorrectOption ? null : question.getCorrectOption())
                .points(question.getPoints())
                .build();
    }

    public static QuizDto.AttemptResponse toQuizAttemptResponse(QuizAttempt attempt) {
        if (attempt == null) return null;
        return QuizDto.AttemptResponse.builder()
                .id(attempt.getId())
                .quizId(attempt.getQuiz().getId())
                .quizTitle(attempt.getQuiz().getTitle())
                .courseId(attempt.getQuiz().getCourse().getId())
                .courseTitle(attempt.getQuiz().getCourse().getTitle())
                .studentId(attempt.getStudent().getId())
                .studentName(attempt.getStudent().getFirstName() + " " + attempt.getStudent().getLastName())
                .attemptDate(attempt.getAttemptDate())
                .score(attempt.getScore())
                .passed(attempt.getPassed())
                .build();
    }

    public static CertificateDto toCertificateDto(Certificate certificate) {
        if (certificate == null) return null;
        return CertificateDto.builder()
                .id(certificate.getId())
                .studentId(certificate.getStudent().getId())
                .studentName(certificate.getStudent().getFirstName() + " " + certificate.getStudent().getLastName())
                .courseId(certificate.getCourse().getId())
                .courseTitle(certificate.getCourse().getTitle())
                .certificateCode(certificate.getCertificateCode())
                .issueDate(certificate.getIssueDate())
                .build();
    }
}
