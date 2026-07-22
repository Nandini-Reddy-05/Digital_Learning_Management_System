package com.lms.digital.repository;

import com.lms.digital.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Page<Course> findByStatus(String status, Pageable pageable);
    Page<Course> findByCategoryAndStatus(String category, String status, Pageable pageable);
    Page<Course> findByTitleContainingIgnoreCaseAndStatus(String title, String status, Pageable pageable);
    Page<Course> findByCategoryAndTitleContainingIgnoreCaseAndStatus(String category, String title, String status, Pageable pageable);
    List<Course> findByTeacherId(Long teacherId);
    List<Course> findByStatus(String status);
}
