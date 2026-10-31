package com.zencas.edhr.workflow.entity;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class WorkflowActionLogTest {

    @Test
    void snapshotUsesJsonJdbcTypeForPostgresJsonbColumn() throws NoSuchFieldException {
        JdbcTypeCode jdbcTypeCode = WorkflowActionLog.class
                .getDeclaredField("snapshot")
                .getAnnotation(JdbcTypeCode.class);

        assertThat(jdbcTypeCode).isNotNull();
        assertThat(jdbcTypeCode.value()).isEqualTo(SqlTypes.JSON);
    }
}
