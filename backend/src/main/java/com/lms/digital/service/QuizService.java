package com.lms.digital.service;

import com.lms.digital.dto.QuizDto;
import java.util.List;

public interface QuizService {
    QuizDto.Response createQuiz(Long courseId, Long teacherUserId, QuizDto.Create dto);
    QuizDto.Response getQuizById(Long quizId, Long userId);
    List<QuizDto.Response> getCourseQuizzes(Long courseId);
    void deleteQuiz(Long quizId, Long teacherUserId);
    QuizDto.AttemptResponse submitQuiz(Long quizId, Long studentUserId, QuizDto.Submit dto);
    List<QuizDto.AttemptResponse> getStudentAttempts(Long studentUserId);
    List<QuizDto.AttemptResponse> getQuizAttempts(Long quizId, Long teacherUserId);
}
