package com.lms.digital.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CourseDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String title;
        private String description;
        private String category;
        private Long teacherId;
        private String teacherName;
        private BigDecimal price;
        private String status;
        private String imageUrl;
        private Integer lessonCount;
        private Long enrollmentCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Create {
        @NotBlank(message = "Title is required")
        private String title;

        private String description;

        @NotBlank(message = "Category is required")
        private String category;

        @NotNull(message = "Price is required")
        private BigDecimal price;

        private String status; // DRAFT, PUBLISHED
        private String imageUrl;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LessonResponse {
        private Long id;
        private Long courseId;
        private String title;
        private String description;
        private String videoUrl;
        private String pdfUrl;
        private Integer duration;
        private Integer sequenceOrder;
        private LocalDateTime createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LessonCreate {
        @NotBlank(message = "Title is required")
        private String title;

        private String description;
        private String videoUrl;
        private String pdfUrl;

        @NotNull(message = "Duration is required")
        private Integer duration;

        @NotNull(message = "Sequence order is required")
        private Integer sequenceOrder;
    }
}
