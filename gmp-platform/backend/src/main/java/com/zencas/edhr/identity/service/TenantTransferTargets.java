package com.zencas.edhr.identity.service;

import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

/** Shared personnel eligibility for explicit tenant-scoped delegation, not approval candidate resolution. */
@RequiredArgsConstructor
public class TenantTransferTargets {
    private final UserAccountRepository users;

    public List<Map<String, String>> search(Long tenantId, String operatorId, String keyword) {
        if (tenantId == null) throw new IllegalArgumentException("无法确定转办的租户范围");
        String query = keyword == null ? "" : keyword.strip().toLowerCase(Locale.ROOT);
        LocalDateTime now = LocalDateTime.now();
        Specification<UserAccount> specification = (root, ignored, cb) -> {
            var eligible = cb.and(cb.equal(root.get("tenantId"), tenantId), cb.equal(root.get("status"), "ACTIVE"),
                    cb.or(cb.isNull(root.get("lockedUntil")), cb.lessThanOrEqualTo(root.get("lockedUntil"), now)));
            if (query.isBlank()) return eligible;
            String like = "%" + query + "%";
            return cb.and(eligible, cb.or(cb.like(cb.lower(root.get("displayName")), like),
                    cb.like(cb.lower(root.get("username")), like)));
        };
        return users.findAll(specification, PageRequest.of(0, 100,
                        Sort.by("displayName").ascending().and(Sort.by("id").ascending()))).getContent().stream()
                .filter(user -> available(user, tenantId, now))
                .filter(user -> !String.valueOf(user.getId()).equals(operatorId))
                .map(user -> Map.of("id", String.valueOf(user.getId()), "name", user.getDisplayName(), "username", user.getUsername()))
                .toList();
    }

    public UserAccount require(Long tenantId, String operatorId, String targetId) {
        if (tenantId == null) throw new IllegalArgumentException("无法确定转办的租户范围");
        if (targetId == null || targetId.isBlank()) throw new IllegalArgumentException("请选择转办人员");
        UserAccount target;
        try {
            target = users.findById(Long.valueOf(targetId))
                    .orElseThrow(() -> new IllegalArgumentException("转办人员不存在、已停用或当前被锁定"));
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("转办人员不存在、已停用或当前被锁定");
        }
        if (String.valueOf(target.getId()).equals(operatorId)) throw new IllegalArgumentException("不能转办给当前处理人");
        if (!Objects.equals(target.getTenantId(), tenantId)) throw new IllegalArgumentException("转办人员不属于当前租户");
        if (!available(target, tenantId, LocalDateTime.now())) throw new IllegalArgumentException("转办人员不存在、已停用或当前被锁定");
        return target;
    }

    private boolean available(UserAccount user, Long tenantId, LocalDateTime now) {
        return Objects.equals(user.getTenantId(), tenantId) && "ACTIVE".equals(user.getStatus())
                && (user.getLockedUntil() == null || !user.getLockedUntil().isAfter(now));
    }
}
