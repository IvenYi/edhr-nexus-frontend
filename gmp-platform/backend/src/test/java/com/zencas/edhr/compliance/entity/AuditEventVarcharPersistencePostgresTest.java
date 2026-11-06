package com.zencas.edhr.compliance.entity;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.BeanWrapperImpl;

import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.*;

class AuditEventVarcharPersistencePostgresTest extends AuditEventPostgresSupport {
    static Stream<Arguments> boundedColumns() {
        return Stream.of(Arguments.of("tenantId", 64), Arguments.of("entityType", 128), Arguments.of("entityId", 128), Arguments.of("action", 64),
                Arguments.of("operatorId", 64), Arguments.of("operatorName", 128), Arguments.of("operatorAccount", 128), Arguments.of("source", 32),
                Arguments.of("moduleName", 128), Arguments.of("menuName", 128), Arguments.of("functionName", 128), Arguments.of("dataSummary", 512), Arguments.of("ipAddress", 64));
    }
    @ParameterizedTest @MethodSource("boundedColumns")
    void allThirteenRealVarcharColumnsRetainHashWhenPostgresDropsExcessPadding(String field, int size) throws Exception {
        var event = event(21).build(); String stored = "x".repeat(size), input = stored + " ";
        new BeanWrapperImpl(event).setPropertyValue(field, input);
        var reloaded = roundTrip("varchar_" + field, event);
        assertThat(new BeanWrapperImpl(reloaded).getPropertyValue(field)).isEqualTo(stored);
        assertThat(new BeanWrapperImpl(event).getPropertyValue(field)).isEqualTo(input);
        assertThat(reloaded.computeSnapshotHash()).isEqualTo(reloaded.getSnapshotHash());
    }
    @Test void varcharCountsUnicodeCodePointsAndDoesNotRejectValidSupplementaryCharacters() throws Exception {
        String text = "😀".repeat(128); var read = roundTrip("varchar_unicode", event(22).operatorName(text + " ").build());
        assertThat(read.getOperatorName()).isEqualTo(text); assertThat(read.computeSnapshotHash()).isEqualTo(read.getSnapshotHash());
    }
    @Test void nonPaddingOverlengthStillFailsTheOriginalDatabaseConstraint() {
        assertThatThrownBy(() -> roundTrip("varchar_invalid", event(23).operatorName("x".repeat(129)).build())).hasStackTraceContaining("value too long");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_event", Integer.class)).isZero();
    }
}
