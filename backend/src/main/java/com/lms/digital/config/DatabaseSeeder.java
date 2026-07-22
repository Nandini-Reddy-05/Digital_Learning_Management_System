package com.lms.digital.config;

import com.lms.digital.entity.*;
import com.lms.digital.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 1. Seed Roles
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(null, ERole.ROLE_ADMIN));
            roleRepository.save(new Role(null, ERole.ROLE_TEACHER));
            roleRepository.save(new Role(null, ERole.ROLE_STUDENT));
        }

        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN).orElse(null);
        Role teacherRole = roleRepository.findByName(ERole.ROLE_TEACHER).orElse(null);
        Role studentRole = roleRepository.findByName(ERole.ROLE_STUDENT).orElse(null);

        // 2. Seed Admin User
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@lms.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(adminRole)
                    .isActive(true)
                    .build();
            userRepository.save(admin);
        }

        // 3. Seed Teacher
        Teacher seededTeacher = null;
        if (!userRepository.existsByUsername("teacher")) {
            User teacherUser = User.builder()
                    .username("teacher")
                    .email("teacher@lms.com")
                    .password(passwordEncoder.encode("teacher123"))
                    .role(teacherRole)
                    .isActive(true)
                    .build();
            userRepository.save(teacherUser);

            Teacher teacher = Teacher.builder()
                    .user(teacherUser)
                    .firstName("Jane")
                    .lastName("Doe")
                    .phone("1234567890")
                    .specialization("Full Stack Java Development")
                    .qualification("Master of Computer Applications")
                    .bio("Experienced computer science professor specializing in Java, Spring Boot, and React.")
                    .build();
            seededTeacher = teacherRepository.save(teacher);
        } else {
            seededTeacher = teacherRepository.findByUserId(userRepository.findByUsername("teacher").get().getId()).orElse(null);
        }

        // 4. Seed Student
        if (!userRepository.existsByUsername("student")) {
            User studentUser = User.builder()
                    .username("student")
                    .email("student@lms.com")
                    .password(passwordEncoder.encode("student123"))
                    .role(studentRole)
                    .isActive(true)
                    .build();
            userRepository.save(studentUser);

            Student student = Student.builder()
                    .user(studentUser)
                    .firstName("John")
                    .lastName("Smith")
                    .phone("9876543210")
                    .dob(LocalDate.of(2001, 5, 15))
                    .address("123, Learning Lane, Education City")
                    .bio("Aspiring software engineer learning modern web technologies.")
                    .build();
            studentRepository.save(student);
        }

        // 5. Seed Sample Courses, Lessons, Quizzes if none exist
        if (courseRepository.count() == 0 && seededTeacher != null) {
            Course course = Course.builder()
                    .title("Full Stack Web Development with Spring Boot & React")
                    .description("Learn how to build complete full-stack web applications using Java Spring Boot on the backend and React JS on the frontend with JWT authentication.")
                    .category("Web Development")
                    .teacher(seededTeacher)
                    .price(new BigDecimal("299.99"))
                    .status("PUBLISHED")
                    .imageUrl("https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800")
                    .build();
            Course savedCourse = courseRepository.save(course);

            // Seed Lessons
            Lesson lesson1 = Lesson.builder()
                    .course(savedCourse)
                    .title("Introduction to Spring Boot Architecture")
                    .description("In this lesson, we will explore the core structure of a Spring Boot application, dependencies management, and controllers.")
                    .videoUrl("uploads/java.mp4")
                    .pdfUrl("sample_intro.pdf")
                    .duration(15)
                    .sequenceOrder(1)
                    .build();

            Lesson lesson2 = Lesson.builder()
                    .course(savedCourse)
                    .title("Setting Up React.js and Tailwind CSS")
                    .description("In this lesson, we learn how to spin up a Vite React project and style it using utility-first classes of Tailwind CSS.")
                    .videoUrl("uploads/frontend.mp4")
                    .pdfUrl("sample_react_setup.pdf")
                    .duration(20)
                    .sequenceOrder(2)
                    .build();

            lessonRepository.save(lesson1);
            lessonRepository.save(lesson2);

            // Seed Quiz
            Quiz quiz = Quiz.builder()
                    .course(savedCourse)
                    .title("Java Core and Spring Basics Quiz")
                    .description("Test your knowledge on OOP concepts, JPA relations, and dependency injections.")
                    .timeLimit(10) // 10 minutes
                    .passingScore(60) // 60%
                    .build();
            Quiz savedQuiz = quizRepository.save(quiz);

            // Questions
            Question q1 = Question.builder()
                    .quiz(savedQuiz)
                    .questionText("Which annotation is used to mark a class as a Spring REST Controller?")
                    .optionA("@Controller")
                    .optionB("@RestController")
                    .optionC("@Service")
                    .optionD("@Component")
                    .correctOption("B")
                    .points(10)
                    .build();

            Question q2 = Question.builder()
                    .quiz(savedQuiz)
                    .questionText("Which relationship denotes that many records in current table belong to one in another?")
                    .optionA("@OneToOne")
                    .optionB("@OneToMany")
                    .optionC("@ManyToOne")
                    .optionD("@ManyToMany")
                    .correctOption("C")
                    .points(10)
                    .build();

            Question q3 = Question.builder()
                    .quiz(savedQuiz)
                    .questionText("Which hook is used in React to manage state?")
                    .optionA("useEffect")
                    .optionB("useContext")
                    .optionC("useReducer")
                    .optionD("useState")
                    .correctOption("D")
                    .points(10)
                    .build();

            questionRepository.saveAll(Arrays.asList(q1, q2, q3));

            // Seed Assignment
            Assignment assignment = Assignment.builder()
                    .course(savedCourse)
                    .title("REST API Development Exercise")
                    .description("Create a complete REST Controller in your spring boot project for 'Book' entity, implementing standard GET/POST/PUT/DELETE operations. Submit your code file or git link.")
                    .dueDate(LocalDateTime.now().plusDays(7))
                    .maxPoints(100)
                    .fileUrl("rest_api_assignment.pdf")
                    .build();
            assignmentRepository.save(assignment);
        }
    }
}
