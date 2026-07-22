package com.lms.digital.service;

import com.lms.digital.dto.EnrollmentDto;
import java.util.List;

public interface EnrollmentService {
    EnrollmentDto enrollStudent(Long studentUserId, Long courseId);
    List<EnrollmentDto> getStudentEnrollments(Long studentUserId);
    List<EnrollmentDto> getCourseEnrollments(Long courseId);
    boolean isStudentEnrolled(Long studentUserId, Long courseId);
    Double updateEnrollmentProgress(Long enrollmentId);
    List<EnrollmentDto> getAllEnrollments();
}
