package com.zencas.edhr.compliance.controller;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.*;

/** SQL filtering must match the existing Java trim/equality projection, including their different whitespace rules. */
class AuditActionWhitespacePostgresTest extends AuditReadPostgresSupport {
    static Stream<Arguments> values() {
        return Stream.concat(Stream.of("", "\u0001", "\t", "\u001c", " ", "\u1680", "\u2000", "\u2007", "\u202f", "\u3000", "\u205f")
                        .map(ws -> Arguments.of("action", "WORK_ORDER", ws + "cReAtE" + ws)),
                Stream.of("\u0001", "\t", " ", "\u1680", "\u2000", "\u3000")
                        .map(ws -> Arguments.of("type", ws + "work_order" + ws, "CANCEL")));
    }
    @ParameterizedTest @MethodSource("values")
    void sqlFilterMatchesTheUnchangedDisplayedJavaProjection(String axis, String type, String action) {
        seed(1, "shared", 0); jdbc.update("UPDATE audit_event SET entity_type=?,action=? WHERE id=1", type, action);
        String displayed = list(1, 20, null, null, null, null).getContent().getFirst().getAction();
        var filtered = list(1, 20, null, displayed, null, null);
        assertThat(filtered.getContent()).as("%s type=%s rawAction=%s displayed=%s", axis, type, action, displayed).extracting(item -> item.getId()).containsExactly(1L);
        assertThat(filtered.getTotalElements()).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT action FROM audit_event WHERE id=1", String.class)).isEqualTo(action);
    }
}
