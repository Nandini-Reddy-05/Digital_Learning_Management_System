package com.lms.digital.serviceImpl;

import com.lms.digital.dto.CourseDto;
import com.lms.digital.entity.Course;
import com.lms.digital.entity.Lesson;
import com.lms.digital.exception.BadRequestException;
import com.lms.digital.exception.ResourceNotFoundException;
import com.lms.digital.mapper.LmsMapper;
import com.lms.digital.repository.CourseRepository;
import com.lms.digital.repository.LessonRepository;
import com.lms.digital.service.LessonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LessonServiceImpl implements LessonService {

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Override
    public List<CourseDto.LessonResponse> getLessonsByCourse(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResourceNotFoundException("Course not found with ID: " + courseId);
        }
        return lessonRepository.findByCourseIdOrderBySequenceOrderAsc(courseId).stream()
                .map(LmsMapper::toLessonResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CourseDto.LessonResponse getLessonById(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with ID: " + lessonId));
        return LmsMapper.toLessonResponse(lesson);
    }

    @Override
    @Transactional
    public CourseDto.LessonResponse addLesson(Long courseId, Long teacherUserId, CourseDto.LessonCreate dto) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));

        if (!course.getTeacher().getUser().getId().equals(teacherUserId)) {
            throw new BadRequestException("You are not authorized to add lessons to this course");
        }

        Lesson lesson = Lesson.builder()
                .course(course)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .videoUrl(dto.getVideoUrl())
                .pdfUrl(dto.getPdfUrl())
                .duration(dto.getDuration())
                .sequenceOrder(dto.getSequenceOrder())
                .build();

        Lesson saved = lessonRepository.save(lesson);
        return LmsMapper.toLessonResponse(saved);
    }

    @Override
    @Transactional
    public CourseDto.LessonResponse updateLesson(Long lessonId, Long teacherUserId, CourseDto.LessonCreate dto) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with ID: " + lessonId));

        if (!lesson.getCourse().getTeacher().getUser().getId().equals(teacherUserId)) {
            throw new BadRequestException("You are not authorized to update lessons in this course");
        }

        lesson.setTitle(dto.getTitle());
        lesson.setDescription(dto.getDescription());
        lesson.setVideoUrl(dto.getVideoUrl());
        lesson.setPdfUrl(dto.getPdfUrl());
        lesson.setDuration(dto.getDuration());
        lesson.setSequenceOrder(dto.getSequenceOrder());

        Lesson updated = lessonRepository.save(lesson);
        return LmsMapper.toLessonResponse(updated);
    }

    @Override
    @Transactional
    public void deleteLesson(Long lessonId, Long teacherUserId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with ID: " + lessonId));

        if (!lesson.getCourse().getTeacher().getUser().getId().equals(teacherUserId)) {
            throw new BadRequestException("You are not authorized to delete lessons from this course");
        }

        lessonRepository.delete(lesson);
    }
}
