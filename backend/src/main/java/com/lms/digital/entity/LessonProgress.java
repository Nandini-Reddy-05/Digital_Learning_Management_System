package com.lms.digital.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "progress", uniqueConstraints = {@UniqueConstraint(columnNames = {"enrollment_id", "lesson_id"})})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonProgress {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Builder.Default
    private Boolean completed = true;

    @Column(name = "completion_date", updatable = false)
    private LocalDateTime completionDate;

    @PrePersist
    protected void onCreate() {
        completionDate = LocalDateTime.now();
        if (completed == null) {
            completed = true;
        }
    }
}
