package com.lms.digital.service;

import com.lms.digital.dto.CourseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CourseService {
    Page<CourseDto.Response> getPublishedCourses(String category, String search, Pageable pageable);
    CourseDto.Response getCourseById(Long id);
    CourseDto.Response createCourse(Long teacherUserId, CourseDto.Create dto);
    CourseDto.Response updateCourse(Long courseId, Long teacherUserId, CourseDto.Create dto);
    CourseDto.Response updateCourseByAdmin(Long courseId, CourseDto.Create dto);
    void deleteCourse(Long courseId, Long teacherUserId);
    void deleteCourseByAdmin(Long courseId);
    List<CourseDto.Response> getCoursesByTeacher(Long teacherUserId);
    List<CourseDto.Response> getAllCourses();
    void assignTeacherToCourse(Long courseId, Long teacherId);
}
