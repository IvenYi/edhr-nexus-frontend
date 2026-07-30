package com.zencas.edhr.template.support;

import com.zencas.edhr.template.entity.DhrTemplateVersion;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * Resolves the display status of a DHR template version without changing its persisted lifecycle state.
 */
public final class DhrTemplateVersionStatusResolver {
    public static final String DRAFT = "DRAFT";
    public static final String ACTIVE = "ACTIVE";
    public static final String PENDING = "PENDING";
    public static final String EXPIRED = "EXPIRED";
    public static final String DISABLED = "DISABLED";

    private DhrTemplateVersionStatusResolver() {
    }

    public static String resolveVersionStatus(DhrTemplateVersion version) {
        return resolveVersionStatus(version, LocalDateTime.now());
    }

    public static String resolveVersionStatus(DhrTemplateVersion version, LocalDateTime now) {
        if (version == null) return DISABLED;
        String lifecycleStatus = version.getStatus();
        if (DRAFT.equals(lifecycleStatus)) return DRAFT;
        if (DISABLED.equals(lifecycleStatus)) return DISABLED;
        if (!ACTIVE.equals(lifecycleStatus)) return DISABLED;

        LocalDateTime effectiveAt = version.getEffectiveFrom();
        LocalDateTime expiryAt = version.getEffectiveTo();
        if (effectiveAt != null && effectiveAt.isAfter(now)) return PENDING;
        if (expiryAt != null && !expiryAt.isAfter(now)) return EXPIRED;
        return ACTIVE;
    }

    public static String resolveTemplateStatus(Collection<String> versionStatuses) {
        List<String> statuses = versionStatuses == null ? List.of() : versionStatuses.stream().toList();
        if (statuses.contains(ACTIVE)) return ACTIVE;
        if (!statuses.isEmpty() && statuses.stream().allMatch(EXPIRED::equals)) return DISABLED;
        if (statuses.contains(PENDING)) return PENDING;
        return DISABLED;
    }
}
