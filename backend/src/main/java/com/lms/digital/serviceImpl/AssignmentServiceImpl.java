package com.lms.digital.serviceImpl;

import com.lms.digital.dto.AssignmentDto;
import com.lms.digital.entity.*;
import com.lms.digital.exception.BadRequestException;
import com.lms.digital.exception.ResourceNotFoundException;
import com.lms.digital.mapper.LmsMapper;
import com.lms.digital.repository.*;
import com.lms.digital.service.AssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssignmentServiceImpl implements AssignmentService {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Override
    @Transactional
    public AssignmentDto.Response createAssignment(Long courseId, Long teacherUserId, AssignmentDto.Create dto) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));

        if (!course.getTeacher().getUser().getId().equals(teacherUserId)) {
            throw new BadRequestException("You are not authorized to create assignments for this course");
        }

        Assignment assignment = Assignment.builder()
                .course(course)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .dueDate(dto.getDueDate())
                .maxPoints(dto.getMaxPoints())
                .fileUrl(dto.getFileUrl())
                .build();

        Assignment saved = assignmentRepository.save(assignment);
        return LmsMapper.toAssignmentResponse(saved);
    }

    @Override
    public List<AssignmentDto.Response> getCourseAssignments(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResourceNotFoundException("Course not found with ID: " + courseId);
        }
        return assignmentRepository.findByCourseId(courseId).stream()
                .map(LmsMapper::toAssignmentResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AssignmentDto.Response getAssignmentById(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with ID: " + assignmentId));
        return LmsMapper.toAssignmentResponse(assignment);
    }

    @Override
    @Transactional
    public void deleteAssignment(Long assignmentId, Long teacherUserId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with ID: " + assignmentId));

        if (!assignment.getCourse().getTeacher().getUser().getId().equals(teacherUserId)) {
            throw new BadRequestException("You are not authorized to delete this assignment");
        }

        assignmentRepository.delete(assignment);
    }

    @Override
    @Transactional
    public AssignmentDto.SubmissionResponse submitAssignment(Long assignmentId, Long studentUserId, AssignmentDto.Submit dto) {
        Student student = studentRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user ID: " + studentUserId));

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with ID: " + assignmentId));

        // Check if submission already exists
        Submission submission = submissionRepository.findByAssignmentIdAndStudentId(assignmentId, student.getId())
                .orElse(null);

        if (submission != null) {
            // Update submission
            submission.setFileUrl(dto.getFileUrl());
            submission.setRemarks(dto.getRemarks());
            submission.setSubmissionDate(LocalDateTime.now());
            submission.setStatus("SUBMITTED");
            submission.setPointsEarned(null); // Reset grade on resubmission
        } else {
            submission = Submission.builder()
                    .assignment(assignment)
                    .student(student)
                    .fileUrl(dto.getFileUrl())
                    .remarks(dto.getRemarks())
                    .status("SUBMITTED")
                    .build();
        }

        Submission saved = submissionRepository.save(submission);
        return LmsMapper.toSubmissionResponse(saved);
    }

    @Override
    public List<AssignmentDto.SubmissionResponse> getAssignmentSubmissions(Long assignmentId, Long teacherUserId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with ID: " + assignmentId));

        if (!assignment.getCourse().getTeacher().getUser().getId().equals(teacherUserId)) {
            throw new BadRequestException("You are not authorized to view submissions for this assignment");
        }

        return submissionRepository.findByAssignmentId(assignmentId).stream()
                .map(LmsMapper::toSubmissionResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AssignmentDto.SubmissionResponse> getStudentSubmissions(Long studentUserId) {
        Student student = studentRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user ID: " + studentUserId));

        return submissionRepository.findByStudentId(student.getId()).stream()
                .map(LmsMapper::toSubmissionResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AssignmentDto.SubmissionResponse gradeSubmission(Long submissionId, Long teacherUserId, AssignmentDto.Grade dto) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with ID: " + submissionId));

        if (!submission.getAssignment().getCourse().getTeacher().getUser().getId().equals(teacherUserId)) {
            throw new BadRequestException("You are not authorized to grade this submission");
        }

        if (dto.getPointsEarned() < 0 || dto.getPointsEarned() > submission.getAssignment().getMaxPoints()) {
            throw new BadRequestException("Points earned must be between 0 and " + submission.getAssignment().getMaxPoints());
        }

        submission.setPointsEarned(dto.getPointsEarned());
        if (dto.getRemarks() != null) {
            submission.setRemarks(dto.getRemarks());
        }
        submission.setStatus("GRADED");

        Submission updated = submissionRepository.save(submission);
        return LmsMapper.toSubmissionResponse(updated);
    }

    @Override
    public List<AssignmentDto.SubmissionResponse> getPendingSubmissions(Long teacherUserId) {
        Teacher teacher = teacherRepository.findByUserId(teacherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found for user ID: " + teacherUserId));

        // Get all courses for teacher
        List<Course> courses = courseRepository.findByTeacherId(teacher.getId());

        // Get submissions that are not graded
        return submissionRepository.findAll().stream()
                .filter(sub -> sub.getStatus().equals("SUBMITTED"))
                .filter(sub -> courses.contains(sub.getAssignment().getCourse()))
                .map(LmsMapper::toSubmissionResponse)
                .collect(Collectors.toList());
    }
}
