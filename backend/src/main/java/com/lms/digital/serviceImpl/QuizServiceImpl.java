package com.lms.digital.serviceImpl;

import com.lms.digital.dto.QuizDto;
import com.lms.digital.entity.*;
import com.lms.digital.exception.BadRequestException;
import com.lms.digital.exception.ResourceNotFoundException;
import com.lms.digital.mapper.LmsMapper;
import com.lms.digital.repository.*;
import com.lms.digital.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class QuizServiceImpl implements QuizService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public QuizDto.Response createQuiz(Long courseId, Long teacherUserId, QuizDto.Create dto) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));

        if (!course.getTeacher().getUser().getId().equals(teacherUserId)) {
            throw new BadRequestException("You are not authorized to create quizzes for this course");
        }

        Quiz quiz = Quiz.builder()
                .course(course)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .timeLimit(dto.getTimeLimit())
                .passingScore(dto.getPassingScore())
                .build();

        Quiz savedQuiz = quizRepository.save(quiz);

        List<Question> questions = new ArrayList<>();
        if (dto.getQuestions() != null) {
            for (QuizDto.QuestionCreate qDto : dto.getQuestions()) {
                Question question = Question.builder()
                        .quiz(savedQuiz)
                        .questionText(qDto.getQuestionText())
                        .optionA(qDto.getOptionA())
                        .optionB(qDto.getOptionB())
                        .optionC(qDto.getOptionC())
                        .optionD(qDto.getOptionD())
                        .correctOption(qDto.getCorrectOption().toUpperCase())
                        .points(qDto.getPoints())
                        .build();
                questions.add(question);
            }
            questionRepository.saveAll(questions);
            savedQuiz.setQuestions(questions);
        }

        return LmsMapper.toQuizResponse(savedQuiz, false);
    }

    @Override
    public QuizDto.Response getQuizById(Long quizId, Long userId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with ID: " + quizId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // If student, mask correct options
        boolean maskCorrectOption = user.getRole().getName() == ERole.ROLE_STUDENT;
        return LmsMapper.toQuizResponse(quiz, maskCorrectOption);
    }

    @Override
    public List<QuizDto.Response> getCourseQuizzes(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResourceNotFoundException("Course not found with ID: " + courseId);
        }

        return quizRepository.findByCourseId(courseId).stream()
                .map(quiz -> LmsMapper.toQuizResponse(quiz, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteQuiz(Long quizId, Long teacherUserId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with ID: " + quizId));

        if (!quiz.getCourse().getTeacher().getUser().getId().equals(teacherUserId)) {
            throw new BadRequestException("You are not authorized to delete this quiz");
        }

        quizRepository.delete(quiz);
    }

    @Override
    @Transactional
    public QuizDto.AttemptResponse submitQuiz(Long quizId, Long studentUserId, QuizDto.Submit dto) {
        Student student = studentRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user ID: " + studentUserId));

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with ID: " + quizId));

        List<Question> questions = questionRepository.findByQuizId(quizId);
        Map<Long, Question> questionMap = questions.stream()
                .collect(Collectors.toMap(Question::getId, Function.identity()));

        int totalPoints = 0;
        int pointsEarned = 0;

        for (Question q : questions) {
            totalPoints += q.getPoints();
        }

        if (dto.getAnswers() != null) {
            for (QuizDto.Answer ans : dto.getAnswers()) {
                Question question = questionMap.get(ans.getQuestionId());
                if (question != null && question.getCorrectOption().equalsIgnoreCase(ans.getSelectedOption())) {
                    pointsEarned += question.getPoints();
                }
            }
        }

        int scorePercentage = 0;
        if (totalPoints > 0) {
            scorePercentage = (int) Math.round(((double) pointsEarned / totalPoints) * 100);
        }

        boolean passed = scorePercentage >= quiz.getPassingScore();

        QuizAttempt attempt = QuizAttempt.builder()
                .quiz(quiz)
                .student(student)
                .score(scorePercentage)
                .passed(passed)
                .build();

        QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);
        return LmsMapper.toQuizAttemptResponse(savedAttempt);
    }

    @Override
    public List<QuizDto.AttemptResponse> getStudentAttempts(Long studentUserId) {
        Student student = studentRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user ID: " + studentUserId));

        return quizAttemptRepository.findByStudentId(student.getId()).stream()
                .map(LmsMapper::toQuizAttemptResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<QuizDto.AttemptResponse> getQuizAttempts(Long quizId, Long teacherUserId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with ID: " + quizId));

        if (!quiz.getCourse().getTeacher().getUser().getId().equals(teacherUserId)) {
            throw new BadRequestException("You are not authorized to view attempts for this quiz");
        }

        return quizAttemptRepository.findAll().stream()
                .filter(attempt -> attempt.getQuiz().getId().equals(quizId))
                .map(LmsMapper::toQuizAttemptResponse)
                .collect(Collectors.toList());
    }
}
