package com.lms.digital.serviceImpl;

import com.lms.digital.dto.CertificateDto;
import com.lms.digital.entity.Certificate;
import com.lms.digital.entity.Course;
import com.lms.digital.entity.Student;
import com.lms.digital.exception.ResourceNotFoundException;
import com.lms.digital.mapper.LmsMapper;
import com.lms.digital.repository.CertificateRepository;
import com.lms.digital.repository.CourseRepository;
import com.lms.digital.repository.StudentRepository;
import com.lms.digital.service.CertificateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CertificateServiceImpl implements CertificateService {

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Override
    @Transactional
    public CertificateDto generateCertificate(Long studentUserId, Long courseId) {
        Student student = studentRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + studentUserId));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found for ID: " + courseId));

        // Check if certificate already generated
        return certificateRepository.findByStudentIdAndCourseId(student.getId(), courseId)
                .map(LmsMapper::toCertificateDto)
                .orElseGet(() -> {
                    String trackingCode = "LMS-" + UUID.randomUUID().toString().toUpperCase().replaceAll("-", "").substring(0, 12);
                    
                    Certificate certificate = Certificate.builder()
                            .student(student)
                            .course(course)
                            .certificateCode(trackingCode)
                            .build();
                    
                    Certificate saved = certificateRepository.save(certificate);
                    return LmsMapper.toCertificateDto(saved);
                });
    }

    @Override
    public CertificateDto getCertificateByCourse(Long studentUserId, Long courseId) {
        Student student = studentRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + studentUserId));

        Certificate certificate = certificateRepository.findByStudentIdAndCourseId(student.getId(), courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found for course: " + courseId));

        return LmsMapper.toCertificateDto(certificate);
    }

    @Override
    public List<CertificateDto> getStudentCertificates(Long studentUserId) {
        Student student = studentRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + studentUserId));

        return certificateRepository.findByStudentId(student.getId()).stream()
                .map(LmsMapper::toCertificateDto)
                .collect(Collectors.toList());
    }
}
