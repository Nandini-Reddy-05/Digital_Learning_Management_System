package com.lms.digital.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrollmentDto {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long courseId;
    private String courseTitle;
    private String courseCategory;
    private String courseImageUrl;
    private LocalDateTime enrollmentDate;
    private Double progressPercentage;
    private String status;
}
