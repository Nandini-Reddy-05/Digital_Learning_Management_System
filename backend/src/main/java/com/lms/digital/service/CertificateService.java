package com.lms.digital.service;

import com.lms.digital.dto.CertificateDto;
import java.util.List;

public interface CertificateService {
    CertificateDto generateCertificate(Long studentUserId, Long courseId);
    CertificateDto getCertificateByCourse(Long studentUserId, Long courseId);
    List<CertificateDto> getStudentCertificates(Long studentUserId);
}
