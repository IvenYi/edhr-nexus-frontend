package com.zencas.edhr.compliance.entity;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SignatureTest {

    @Test
    void snapshotDataUsesJsonJdbcTypeForPostgresJsonbColumn() throws NoSuchFieldException {
        JdbcTypeCode jdbcTypeCode = Signature.class
                .getDeclaredField("snapshotData")
                .getAnnotation(JdbcTypeCode.class);

        assertThat(jdbcTypeCode).isNotNull();
        assertThat(jdbcTypeCode.value()).isEqualTo(SqlTypes.JSON);
    }
}
