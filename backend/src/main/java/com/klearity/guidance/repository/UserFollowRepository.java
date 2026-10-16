package com.klearity.guidance.repository;
import com.klearity.guidance.domain.UserFollow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserFollowRepository extends JpaRepository<UserFollow, Long> {
    @Query("select count(f) from UserFollow f where f.following.id = :userId")
    long countByFollowingId(@Param("userId") Long id);

    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

    Optional<UserFollow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);
}
