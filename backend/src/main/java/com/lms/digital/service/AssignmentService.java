package com.lms.digital.service;

import com.lms.digital.dto.AssignmentDto;
import java.util.List;

public interface AssignmentService {
    AssignmentDto.Response createAssignment(Long courseId, Long teacherUserId, AssignmentDto.Create dto);
    List<AssignmentDto.Response> getCourseAssignments(Long courseId);
    AssignmentDto.Response getAssignmentById(Long assignmentId);
    void deleteAssignment(Long assignmentId, Long teacherUserId);
    AssignmentDto.SubmissionResponse submitAssignment(Long assignmentId, Long studentUserId, AssignmentDto.Submit dto);
    List<AssignmentDto.SubmissionResponse> getAssignmentSubmissions(Long assignmentId, Long teacherUserId);
    List<AssignmentDto.SubmissionResponse> getStudentSubmissions(Long studentUserId);
    AssignmentDto.SubmissionResponse gradeSubmission(Long submissionId, Long teacherUserId, AssignmentDto.Grade dto);
    List<AssignmentDto.SubmissionResponse> getPendingSubmissions(Long teacherUserId);
}
