package com.zencas.edhr.compliance.controller;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.List;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.*;

/** Normative CREATE/UPDATE projection and raw historical action are separate concerns. */
class AuditActionFilterPostgresTest extends AuditReadPostgresSupport {
    static Stream<Arguments> filters() {
        return Stream.of(Arguments.of("all", null, null, List.of(10L,9L,8L,7L,6L,5L,4L,3L,2L,1L)),
                Arguments.of("create", null, "CREATE", List.of(8L,7L,1L)),
                Arguments.of("update", null, "UPDATE", List.of(10L,9L,5L,4L,3L,2L)),
                Arguments.of("cancel", null, "CANCEL", List.of(6L)),
                Arguments.of("lower", null, "update", List.of(10L,9L,5L,4L,3L,2L)),
                Arguments.of("work", "WORK_ORDER", "UPDATE", List.of(9L,3L)),
                Arguments.of("object", "PRODUCTION_OBJECT", "UPDATE", List.of(4L,2L)),
                Arguments.of("user_update", "USER_ACCOUNT", "UPDATE", List.of(5L)),
                Arguments.of("user_cancel", "USER_ACCOUNT", "CANCEL", List.of(6L)));
    }
    @ParameterizedTest @MethodSource("filters")
    void filteringUsesExistingProductionProjectionAndKeepsOtherEntitiesRaw(String name, String type, String action, List<Long> expected) throws Exception {
        seed(10, "shared", 0);
        String[] types = {"WORK_ORDER","PRODUCTION_OBJECT","WORK_ORDER","PRODUCTION_OBJECT","USER_ACCOUNT","USER_ACCOUNT","OTHER"," \tproduction_object\r","WORK_ORDER","productıon_object"};
        String[] actions = {"CREATE","UPDATE","CANCEL","STATUS_CHANGE","UPDATE","CANCEL","create"," \tcreate\r","FUTURE_ACTION","STATUS_CHANGE"};
        for (int i = 0; i < types.length; i++) jdbc.update("UPDATE audit_event SET entity_type=?,action=? WHERE id=?", types[i], actions[i], i + 1);
        var before = jdbc.queryForList("SELECT id,entity_type,action,snapshot_hash FROM audit_event ORDER BY id");
        var result = observe("action_" + name, () -> list(1, 20, type, action, null, null));
        assertThat(result.getContent()).extracting(item -> item.getId()).containsExactlyElementsOf(expected); assertThat(result.getTotalElements()).isEqualTo(expected.size());
        assertThat(jdbc.queryForList("SELECT id,entity_type,action,snapshot_hash FROM audit_event ORDER BY id")).isEqualTo(before);
    }
}
