package com.klearity.guidance.controller;

import com.klearity.guidance.dto.PublicDtos;
import com.klearity.guidance.dto.CareerDtos;
import com.klearity.guidance.service.ContactService;
import com.klearity.guidance.service.CareerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.LinkedHashMap;
import com.klearity.guidance.repository.UserRepository;
import com.klearity.guidance.repository.UserFollowRepository;
import com.klearity.guidance.service.CurrentUser;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final ContactService contactService;
    private final CareerService careerService;
    private final UserRepository userRepository;
    private final UserFollowRepository followRepository;
    private final CurrentUser currentUser;
    private final com.klearity.guidance.service.DiscussionService discussionService;

    @GetMapping("/users/{id}")
    public Map<String,Object> profile(@org.springframework.web.bind.annotation.PathVariable Long id) {
        var u = userRepository.findById(id).orElseThrow(() -> new com.klearity.guidance.exception.NotFoundException("Account not found."));
        if (!u.isPublicAccount()) return Map.of("publicAccount", false, "message", "This is a private account. Publications are not available.");
        Long me = currentUser.id();
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("publicAccount", true);
        response.put("id", u.getId());
        response.put("name", u.getFullName());
        response.put("firstName", u.getFirstName());
        response.put("emailVerified", u.isEmailVerified());
        response.put("badgeKey", u.getBadgeKey());
        response.put("followerCount", followRepository.countByFollowingId(id));
        response.put("following", followRepository.existsByFollowerIdAndFollowingId(me, id));
        response.put("publications", discussionService.myPostsFor(id));
        return response;
    }

    @PostMapping("/users/{id}/follow")
    public Map<String,Object> follow(@org.springframework.web.bind.annotation.PathVariable Long id) {
        var target = userRepository.findById(id).orElseThrow(() -> new com.klearity.guidance.exception.NotFoundException("Account not found.")); Long me=currentUser.id();
        if (me.equals(id)) throw new com.klearity.guidance.exception.BadRequestException("You cannot follow your own account.");
        followRepository.findByFollowerIdAndFollowingId(me,id).ifPresentOrElse(followRepository::delete, () -> followRepository.save(com.klearity.guidance.domain.UserFollow.builder().follower(currentUser.fresh()).following(target).build()));
        return Map.of("following", followRepository.existsByFollowerIdAndFollowingId(me,id), "followerCount", followRepository.countByFollowingId(id));
    }

    /** Used by the Home, About and Contact pages. */
    @GetMapping("/settings")
    public PublicDtos.SettingsResponse settings() {
        return contactService.settings();
    }

    /** Safe career summaries used by the public Career Guide chat assistant. */
    @GetMapping("/career-items")
    public java.util.List<CareerDtos.ItemSummary> careerItems() {
        return careerService.listItems(null, null, null, "title");
    }

    @PostMapping("/contact")
    public Map<String, Object> contact(@Valid @RequestBody PublicDtos.ContactRequest request) {
        contactService.save(request);
        return Map.of(
                "message", "Thank you for contacting us. Our team will get back to you shortly.",
                "ok", true);
    }
}
