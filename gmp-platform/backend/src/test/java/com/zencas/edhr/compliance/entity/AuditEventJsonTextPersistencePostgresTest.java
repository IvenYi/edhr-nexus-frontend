package com.zencas.edhr.compliance.entity;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.Map;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.*;

class AuditEventJsonTextPersistencePostgresTest extends AuditEventPostgresSupport {
    static Stream<Arguments> jsonTextValues() throws Exception {
        return Stream.of(Arguments.of("paired", "{\"value\":\"中文😀\"}"),
                Arguments.of("raw_high_value", "{\"value\":\"\uD800\"}"), Arguments.of("raw_low_key", "{\"\uDC00\":1}"),
                Arguments.of("mapper_high", new ObjectMapper().writeValueAsString(Map.of("value", "\uD800"))));
    }
    @ParameterizedTest @MethodSource("jsonTextValues")
    void hashParsesTheJsonTextThatJdbcActuallyTransmits(String name, String json) throws Exception {
        var event = event(24).contentAfter(json).build(); var reloaded = roundTrip("jsontext_" + name, event);
        if (!name.equals("paired")) assertThat(reloaded.getContentAfter()).contains("?");
        assertThat(event.getContentAfter()).isEqualTo(json);
        assertThat(reloaded.computeSnapshotHash()).isEqualTo(reloaded.getSnapshotHash());
    }
    @Test void literalUnpairedJsonEscapeStillFailsTheOriginalJsonbConstraint() {
        assertThatThrownBy(() -> roundTrip("jsontext_escaped_reject", event(25).contentAfter("{\"value\":\"\\uD800\"}").build()))
                .hasStackTraceContaining("invalid input syntax for type json");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_event", Integer.class)).isZero();
    }
}
