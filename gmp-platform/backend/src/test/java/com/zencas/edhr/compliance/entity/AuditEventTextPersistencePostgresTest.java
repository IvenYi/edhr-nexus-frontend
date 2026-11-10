package com.zencas.edhr.compliance.entity;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

class AuditEventTextPersistencePostgresTest extends AuditEventPostgresSupport {
    static Stream<Arguments> textValues() {
        return Stream.of(Arguments.of("paired", "中文😀", "中文😀"), Arguments.of("high", "\uD800", "?"),
                Arguments.of("low", "\uDC00", "?"), Arguments.of("embedded", "x\uD800y", "x?y"));
    }
    @ParameterizedTest @MethodSource("textValues")
    void ordinaryTextHashUsesTheSameValueThatJdbcActuallyPersists(String name, String input, String stored) throws Exception {
        var event = event(20).operatorName(input).reason(input).build();
        var reloaded = roundTrip("text_" + name, event);
        assertThat(reloaded.getOperatorName()).isEqualTo(stored); assertThat(reloaded.getReason()).isEqualTo(stored);
        assertThat(event.getOperatorName()).isEqualTo(input); assertThat(event.getReason()).isEqualTo(input);
        assertThat(reloaded.computeSnapshotHash()).isEqualTo(reloaded.getSnapshotHash());
    }
}
