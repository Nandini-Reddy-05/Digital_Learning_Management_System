package com.lms.digital.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

public class QuizDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private Long courseId;
        private String courseTitle;
        private String title;
        private String description;
        private Integer timeLimit;
        private Integer passingScore;
        private List<QuestionResponse> questions;
        private LocalDateTime createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Create {
        @NotBlank(message = "Title is required")
        private String title;

        private String description;

        @NotNull(message = "Time limit is required")
        private Integer timeLimit; // in minutes

        @NotNull(message = "Passing score is required")
        private Integer passingScore; // percentage

        private List<QuestionCreate> questions;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionResponse {
        private Long id;
        private String questionText;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private String correctOption; // Masked for students, shown to teacher/admin
        private Integer points;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionCreate {
        @NotBlank(message = "Question text is required")
        private String questionText;

        @NotBlank(message = "Option A is required")
        private String optionA;

        @NotBlank(message = "Option B is required")
        private String optionB;

        @NotBlank(message = "Option C is required")
        private String optionC;

        @NotBlank(message = "Option D is required")
        private String optionD;

        @NotBlank(message = "Correct option is required")
        private String correctOption; // A, B, C, D

        private Integer points = 1;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Submit {
        private List<Answer> answers;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Answer {
        private Long questionId;
        private String selectedOption; // A, B, C, D
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AttemptResponse {
        private Long id;
        private Long quizId;
        private String quizTitle;
        private Long courseId;
        private String courseTitle;
        private Long studentId;
        private String studentName;
        private LocalDateTime attemptDate;
        private Integer score;
        private Boolean passed;
    }
}
