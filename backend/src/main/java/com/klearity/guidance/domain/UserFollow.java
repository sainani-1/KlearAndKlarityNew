package com.klearity.guidance.domain;
import jakarta.persistence.*; import lombok.*; import java.time.Instant;
@Entity @Table(name="user_follows", uniqueConstraints=@UniqueConstraint(columnNames={"follower_id","following_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserFollow { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="follower_id") private User follower; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="following_id") private User following; @Builder.Default private Instant createdAt=Instant.now(); }
