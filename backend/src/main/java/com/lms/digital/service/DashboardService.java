package com.lms.digital.service;

import com.lms.digital.dto.DashboardDto;

public interface DashboardService {
    DashboardDto.Admin getAdminDashboard();
    DashboardDto.Teacher getTeacherDashboard(Long teacherUserId);
    DashboardDto.Student getStudentDashboard(Long studentUserId);
}
