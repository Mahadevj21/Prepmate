package com.prepmate.repository;

import com.prepmate.model.Roadmap;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoadmapRepository extends JpaRepository<Roadmap, Long> {
    List<Roadmap> findByUserIdOrderByCreatedAtDesc(Long userId);
}
