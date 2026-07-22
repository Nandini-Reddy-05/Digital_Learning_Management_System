package com.lms.digital.serviceImpl;

import com.lms.digital.dto.CourseDto;
import com.lms.digital.entity.Course;
import com.lms.digital.entity.Teacher;
import com.lms.digital.exception.BadRequestException;
import com.lms.digital.exception.ResourceNotFoundException;
import com.lms.digital.mapper.LmsMapper;
import com.lms.digital.repository.CourseRepository;
import com.lms.digital.repository.EnrollmentRepository;
import com.lms.digital.repository.LessonRepository;
import com.lms.digital.repository.TeacherRepository;
import com.lms.digital.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseServiceImpl implements CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Override
    public Page<CourseDto.Response> getPublishedCourses(String category, String search, Pageable pageable) {
        Page<Course> coursesPage;
        
        boolean hasCategory = category != null && !category.trim().isEmpty();
        boolean hasSearch = search != null && !search.trim().isEmpty();

        if (hasCategory && hasSearch) {
            coursesPage = courseRepository.findByCategoryAndTitleContainingIgnoreCaseAndStatus(category, search, "PUBLISHED", pageable);
        } else if (hasCategory) {
            coursesPage = courseRepository.findByCategoryAndStatus(category, "PUBLISHED", pageable);
        } else if (hasSearch) {
            coursesPage = courseRepository.findByTitleContainingIgnoreCaseAndStatus(search, "PUBLISHED", pageable);
        } else {
            coursesPage = courseRepository.findByStatus("PUBLISHED", pageable);
        }

        return coursesPage.map(this::mapToCourseResponse);
    }

    @Override
    public CourseDto.Response getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + id));
        return mapToCourseResponse(course);
    }

    @Override
    @Transactional
    public CourseDto.Response createCourse(Long teacherUserId, CourseDto.Create dto) {
        Teacher teacher = teacherRepository.findByUserId(teacherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found for user ID: " + teacherUserId));

        Course course = Course.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .teacher(teacher)
                .price(dto.getPrice())
                .status(dto.getStatus() != null ? dto.getStatus().toUpperCase() : "DRAFT")
                .imageUrl(dto.getImageUrl())
                .build();

        Course saved = courseRepository.save(course);
        return mapToCourseResponse(saved);
    }

    @Override
    @Transactional
    public CourseDto.Response updateCourse(Long courseId, Long teacherUserId, CourseDto.Create dto) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));

        if (!course.getTeacher().getUser().getId().equals(teacherUserId)) {
            throw new BadRequestException("You are not authorized to update this course");
        }

        return updateCourseDetails(course, dto);
    }

    @Override
    @Transactional
    public CourseDto.Response updateCourseByAdmin(Long courseId, CourseDto.Create dto) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));
        return updateCourseDetails(course, dto);
    }

    private CourseDto.Response updateCourseDetails(Course course, CourseDto.Create dto) {
        course.setTitle(dto.getTitle());
        course.setDescription(dto.getDescription());
        course.setCategory(dto.getCategory());
        course.setPrice(dto.getPrice());
        if (dto.getStatus() != null) {
            course.setStatus(dto.getStatus().toUpperCase());
        }
        if (dto.getImageUrl() != null) {
            course.setImageUrl(dto.getImageUrl());
        }

        Course updated = courseRepository.save(course);
        return mapToCourseResponse(updated);
    }

    @Override
    @Transactional
    public void deleteCourse(Long courseId, Long teacherUserId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));

        if (!course.getTeacher().getUser().getId().equals(teacherUserId)) {
            throw new BadRequestException("You are not authorized to delete this course");
        }

        courseRepository.delete(course);
    }

    @Override
    @Transactional
    public void deleteCourseByAdmin(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));
        courseRepository.delete(course);
    }

    @Override
    public List<CourseDto.Response> getCoursesByTeacher(Long teacherUserId) {
        Teacher teacher = teacherRepository.findByUserId(teacherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found for user ID: " + teacherUserId));

        return courseRepository.findByTeacherId(teacher.getId()).stream()
                .map(this::mapToCourseResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CourseDto.Response> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::mapToCourseResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void assignTeacherToCourse(Long courseId, Long teacherId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with ID: " + teacherId));

        course.setTeacher(teacher);
        courseRepository.save(course);
    }

    private CourseDto.Response mapToCourseResponse(Course course) {
        int lessonCount = lessonRepository.findByCourseIdOrderBySequenceOrderAsc(course.getId()).size();
        long enrollmentCount = enrollmentRepository.countByCourseId(course.getId());
        return LmsMapper.toCourseResponse(course, lessonCount, enrollmentCount);
    }
}
