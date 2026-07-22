package com.lms.digital.service;

import java.util.List;

public interface ProgressService {
    void markLessonAsCompleted(Long studentUserId, Long lessonId);
    boolean isLessonCompleted(Long studentUserId, Long lessonId);
    List<Long> getCompletedLessons(Long studentUserId, Long courseId);
}
