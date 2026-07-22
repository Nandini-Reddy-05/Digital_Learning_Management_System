package com.lms.digital.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "submission_date", updatable = false)
    private LocalDateTime submissionDate;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "points_earned")
    private Integer pointsEarned;

    @Column(length = 20)
    private String status = "SUBMITTED"; // SUBMITTED, GRADED

    @PrePersist
    protected void onCreate() {
        submissionDate = LocalDateTime.now();
        if (status == null) {
            status = "SUBMITTED";
        }
    }
}
