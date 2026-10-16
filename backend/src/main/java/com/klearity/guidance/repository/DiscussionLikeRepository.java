package com.klearity.guidance.repository;

import com.klearity.guidance.domain.DiscussionLike;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DiscussionLikeRepository extends JpaRepository<DiscussionLike, Long> {
    long countByPostId(Long postId);
    boolean existsByPostIdAndUserId(Long postId, Long userId);
    Optional<DiscussionLike> findByPostIdAndUserId(Long postId, Long userId);
}
