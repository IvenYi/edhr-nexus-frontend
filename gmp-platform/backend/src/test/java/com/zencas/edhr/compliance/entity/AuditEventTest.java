package com.zencas.edhr.compliance.entity;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AuditEventTest {

    @Test
    void sealSnapshotHashCreatesStableDigestFromOriginalSnapshot() {
        AuditEvent event = AuditEvent.builder()
                .id(1L)
                .tenantId("default")
                .entityType("USER_ACCOUNT")
                .entityId("100")
                .action("UPDATE")
                .contentBefore("{\"organizationName\":\"公司/质量部\"}")
                .contentAfter("{\"organizationName\":\"公司/生产部\"}")
                .operatorId("99")
                .operatorName("系统管理员")
                .operatorAccount("admin")
                .source("UI")
                .moduleName("系统")
                .menuName("用户管理")
                .functionName("编辑用户")
                .dataSummary("账号 test")
                .ipAddress("127.0.0.1")
                .createdAt(LocalDateTime.parse("2026-06-17T10:00:00"))
                .build();

        event.sealSnapshotHash();
        String firstHash = event.getSnapshotHash();
        event.sealSnapshotHash();

        assertThat(firstHash).hasSize(64);
        assertThat(event.getSnapshotHash()).isEqualTo(firstHash);
    }

    @Test
    void preventMutationRejectsAuditEventUpdates() {
        AuditEvent event = AuditEvent.builder().id(1L).build();

        assertThatThrownBy(event::preventMutation)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("immutable snapshots");
    }
}
