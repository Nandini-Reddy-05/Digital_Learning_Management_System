package com.lms.digital.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments", uniqueConstraints = {@UniqueConstraint(columnNames = {"student_id", "course_id"})})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "enrollment_date", updatable = false)
    private LocalDateTime enrollmentDate;

    @Column(name = "progress_percentage")
    private Double progressPercentage = 0.0;

    @Column(length = 20)
    private String status = "ACTIVE"; // ACTIVE, COMPLETED

    @PrePersist
    protected void onCreate() {
        enrollmentDate = LocalDateTime.now();
        if (progressPercentage == null) {
            progressPercentage = 0.0;
        }
        if (status == null) {
            status = "ACTIVE";
        }
    }
}
