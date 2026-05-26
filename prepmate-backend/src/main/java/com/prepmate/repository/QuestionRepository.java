package com.prepmate.repository;

import com.prepmate.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findBySessionIdOrderById(Long sessionId);
}
