package com.lms.digital.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;

public class AssignmentDto {

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
        private LocalDateTime dueDate;
        private Integer maxPoints;
        private String fileUrl;
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

        @NotNull(message = "Due date is required")
        private LocalDateTime dueDate;

        @NotNull(message = "Max points is required")
        private Integer maxPoints;

        private String fileUrl;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubmissionResponse {
        private Long id;
        private Long assignmentId;
        private String assignmentTitle;
        private Long courseId;
        private String courseTitle;
        private Long studentId;
        private String studentName;
        private LocalDateTime submissionDate;
        private String fileUrl;
        private String remarks;
        private Integer pointsEarned;
        private String status;
        private Integer maxPoints;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Submit {
        @NotBlank(message = "File URL is required")
        private String fileUrl;
        private String remarks;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Grade {
        @NotNull(message = "Points earned is required")
        private Integer pointsEarned;
        private String remarks;
    }
}
