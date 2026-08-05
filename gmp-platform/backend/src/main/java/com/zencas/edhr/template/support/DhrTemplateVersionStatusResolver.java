package com.zencas.edhr.template.support;

import com.zencas.edhr.template.entity.DhrTemplateVersion;
import com.zencas.edhr.common.util.RdoVersionStatusResolver;

import java.time.LocalDateTime;
import java.util.Collection;

/**
 * Resolves the display status of a DHR template version without changing its persisted lifecycle state.
 */
public final class DhrTemplateVersionStatusResolver {
    public static final String ACTIVE = RdoVersionStatusResolver.ACTIVE;
    public static final String EXPIRED = RdoVersionStatusResolver.EXPIRED;

    private DhrTemplateVersionStatusResolver() {
    }

    public static String resolveVersionStatus(DhrTemplateVersion version) {
        return resolveVersionStatus(version, LocalDateTime.now());
    }

    public static String resolveVersionStatus(DhrTemplateVersion version, LocalDateTime now) {
        if (version == null) return EXPIRED;
        return RdoVersionStatusResolver.resolve(version.getEffectiveFrom(), version.getEffectiveTo(), now);
    }

    public static String resolveTemplateStatus(Collection<String> versionStatuses) {
        return RdoVersionStatusResolver.resolveAggregate(versionStatuses);
    }
}
