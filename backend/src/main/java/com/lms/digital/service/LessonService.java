package com.lms.digital.service;

import com.lms.digital.dto.CourseDto;
import java.util.List;

public interface LessonService {
    List<CourseDto.LessonResponse> getLessonsByCourse(Long courseId);
    CourseDto.LessonResponse getLessonById(Long lessonId);
    CourseDto.LessonResponse addLesson(Long courseId, Long teacherUserId, CourseDto.LessonCreate dto);
    CourseDto.LessonResponse updateLesson(Long lessonId, Long teacherUserId, CourseDto.LessonCreate dto);
    void deleteLesson(Long lessonId, Long teacherUserId);
}
