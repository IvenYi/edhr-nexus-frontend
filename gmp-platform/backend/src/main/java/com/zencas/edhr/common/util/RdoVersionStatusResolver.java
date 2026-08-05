package com.zencas.edhr.common.util;

import java.time.LocalDateTime;
import java.util.Collection;

/**
 * MVP/1.0 presentation contract for versioned RDOs: resolves the only two
 * user-visible states from the effective time window. Persisted lifecycle
 * flags must not participate. Future version-governance capabilities must
 * extend this central policy instead of introducing a current/default version
 * or automatic replacement of concrete version references.
 */
public final class RdoVersionStatusResolver {
    public static final String ACTIVE = "ACTIVE";
    public static final String EXPIRED = "EXPIRED";

    private RdoVersionStatusResolver() {
    }

    public static String resolve(LocalDateTime effectiveFrom, LocalDateTime effectiveTo) {
        return resolve(effectiveFrom, effectiveTo, LocalDateTime.now());
    }

    public static String resolve(LocalDateTime effectiveFrom, LocalDateTime effectiveTo, LocalDateTime now) {
        if (effectiveFrom != null && effectiveFrom.isAfter(now)) return EXPIRED;
        if (effectiveTo != null && !effectiveTo.isAfter(now)) return EXPIRED;
        return ACTIVE;
    }

    public static boolean isReferenceable(LocalDateTime effectiveFrom, LocalDateTime effectiveTo) {
        return ACTIVE.equals(resolve(effectiveFrom, effectiveTo));
    }

    public static String resolveAggregate(Collection<String> versionStatuses) {
        if (versionStatuses != null && versionStatuses.stream().anyMatch(ACTIVE::equals)) return ACTIVE;
        return EXPIRED;
    }
}
