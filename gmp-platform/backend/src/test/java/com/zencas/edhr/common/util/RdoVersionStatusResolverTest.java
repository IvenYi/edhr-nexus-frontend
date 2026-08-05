package com.zencas.edhr.common.util;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class RdoVersionStatusResolverTest {

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 8, 5, 10, 0);

    @Test
    void resolvesOnlyActiveAndExpiredFromTheEffectiveWindow() {
        assertThat(RdoVersionStatusResolver.resolve(null, null, NOW)).isEqualTo(RdoVersionStatusResolver.ACTIVE);
        assertThat(RdoVersionStatusResolver.resolve(NOW.minusMinutes(1), NOW.plusMinutes(1), NOW)).isEqualTo(RdoVersionStatusResolver.ACTIVE);
        assertThat(RdoVersionStatusResolver.resolve(NOW.plusMinutes(1), null, NOW)).isEqualTo(RdoVersionStatusResolver.EXPIRED);
        assertThat(RdoVersionStatusResolver.resolve(null, NOW, NOW)).isEqualTo(RdoVersionStatusResolver.EXPIRED);
    }

    @Test
    void onlyActiveVersionsAreReferenceableAndMakeTheParentActive() {
        assertThat(RdoVersionStatusResolver.isReferenceable(LocalDateTime.now().plusMinutes(1), null)).isFalse();
        assertThat(RdoVersionStatusResolver.resolveAggregate(List.of(RdoVersionStatusResolver.EXPIRED, RdoVersionStatusResolver.ACTIVE)))
                .isEqualTo(RdoVersionStatusResolver.ACTIVE);
        assertThat(RdoVersionStatusResolver.resolveAggregate(List.of(RdoVersionStatusResolver.EXPIRED)))
                .isEqualTo(RdoVersionStatusResolver.EXPIRED);
    }
}
