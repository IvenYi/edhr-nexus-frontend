package com.zencas.edhr.identity.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.identity.dto.LoginLogItem;
import com.zencas.edhr.identity.entity.LoginLog;
import com.zencas.edhr.identity.repository.LoginLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/identity/login-logs")
@RequiredArgsConstructor
public class LoginLogController {

    private final LoginLogRepository loginLogRepository;

    @GetMapping
    public ApiResponse<PageResult<LoginLogItem>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "occurredAt") String sort,
            @RequestParam(defaultValue = "desc") String order,
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) LocalDateTime startTime,
            @RequestParam(required = false) LocalDateTime endTime) {
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(Math.max(page - 1, 0), size, Sort.by(direction, sort));
        Page<LoginLog> result = loginLogRepository.findAll(
                buildSpecification(eventType, keyword, startTime, endTime),
                pageable);
        List<LoginLogItem> items = result.getContent().stream()
                .map(this::toItem)
                .toList();
        return ApiResponse.success(PageResult.of(items, page, size, result.getTotalElements()));
    }

    private Specification<LoginLog> buildSpecification(
            String eventType,
            String keyword,
            LocalDateTime startTime,
            LocalDateTime endTime) {
        return (root, query, cb) -> {
            var predicates = cb.conjunction();
            if (StringUtils.hasText(eventType)) {
                predicates = cb.and(predicates, cb.equal(
                        cb.upper(root.get("eventType")),
                        eventType.trim().toUpperCase(Locale.ROOT)));
            }
            if (StringUtils.hasText(keyword)) {
                String like = "%" + keyword.trim().toLowerCase(Locale.ROOT) + "%";
                predicates = cb.and(predicates, cb.or(
                        cb.like(cb.lower(cb.coalesce(root.get("operatorName"), "")), like),
                        cb.like(cb.lower(cb.coalesce(root.get("username"), "")), like)));
            }
            if (startTime != null) {
                predicates = cb.and(predicates, cb.greaterThanOrEqualTo(root.get("occurredAt"), startTime));
            }
            if (endTime != null) {
                predicates = cb.and(predicates, cb.lessThanOrEqualTo(root.get("occurredAt"), endTime));
            }
            return predicates;
        };
    }

    private LoginLogItem toItem(LoginLog log) {
        String eventType = normalize(log.getEventType());
        String authMethod = normalize(log.getAuthMethod());
        String platform = normalize(log.getPlatform());
        String clientType = normalize(log.getClientType());
        return LoginLogItem.builder()
                .id(log.getId())
                .operatorId(log.getOperatorId())
                .operatorName(log.getOperatorName())
                .username(log.getUsername())
                .eventType(eventType)
                .eventTypeLabel(EVENT_TYPE_LABELS.getOrDefault(eventType, fallback(log.getEventType())))
                .actionLabel(EVENT_TYPE_LABELS.getOrDefault(eventType, fallback(log.getEventType())))
                .authMethod(authMethod)
                .authMethodLabel(AUTH_METHOD_LABELS.getOrDefault(authMethod, fallback(log.getAuthMethod())))
                .occurredAt(log.getOccurredAt())
                .platform(platform)
                .platformLabel(PLATFORM_LABELS.getOrDefault(platform, fallback(log.getPlatform())))
                .clientType(clientType)
                .clientTypeLabel(CLIENT_TYPE_LABELS.getOrDefault(clientType, fallback(log.getClientType())))
                .browser(fallback(log.getBrowser()))
                .ipAddress(fallback(log.getIpAddress()))
                .build();
    }

    private String normalize(String value) {
        return StringUtils.hasText(value) ? value.trim().toUpperCase(Locale.ROOT) : "";
    }

    private String fallback(String value) {
        return StringUtils.hasText(value) ? value : "-";
    }

    private static final Map<String, String> EVENT_TYPE_LABELS = Map.of(
            "LOGIN", "登录",
            "LOGOUT", "登出"
    );
    private static final Map<String, String> AUTH_METHOD_LABELS = Map.of(
            "PASSWORD", "密码",
            "TOKEN", "令牌",
            "SSO", "单点登录",
            "UNKNOWN", "未知"
    );
    private static final Map<String, String> PLATFORM_LABELS = Map.of(
            "PC", "PC",
            "MOBILE", "移动端"
    );
    private static final Map<String, String> CLIENT_TYPE_LABELS = Map.of(
            "WEB", "Web",
            "H5", "H5",
            "APP", "App",
            "UNKNOWN", "未知"
    );
}
