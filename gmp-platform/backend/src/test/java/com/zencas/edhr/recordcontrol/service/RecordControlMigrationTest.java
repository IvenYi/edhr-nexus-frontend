package com.zencas.edhr.recordcontrol.service;

import liquibase.Contexts;
import liquibase.LabelExpression;
import liquibase.Liquibase;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.api.Test;

import java.sql.DriverManager;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RecordControlMigrationTest {
    @Test void schemaKeepsOneRevisionNumberPerRecordAndRejectsInvalidRequestState() throws Exception {
        try (var connection = DriverManager.getConnection("jdbc:h2:mem:record-control-migration;MODE=PostgreSQL", "sa", "")) {
            var statement = connection.createStatement();
            statement.execute("CREATE SEQUENCE hibernate_sequence START WITH 1000");
            statement.execute("CREATE TABLE form_instance_record (id BIGINT PRIMARY KEY, tenant_id VARCHAR(64), status VARCHAR(32), values_json TEXT, created_by VARCHAR(192), created_at TIMESTAMP)");
            statement.execute("CREATE TABLE signature (id BIGINT PRIMARY KEY)");
            statement.execute("INSERT INTO form_instance_record VALUES (1,'default','COMPLETED','{}',NULL,NULL)");
            statement.execute("INSERT INTO signature VALUES (10)");
            try (var migration = new Liquibase("db/changelog/0087-record-control.sql", new ClassLoaderResourceAccessor(), new JdbcConnection(connection))) {
                migration.update(new Contexts(), new LabelExpression());
                migration.update(new Contexts(), new LabelExpression());
                connection.commit(); connection.setAutoCommit(true);
                statement.execute("INSERT INTO form_instance_revision (id,tenant_id,record_id,revision_no,status,values_json) VALUES (2,'default',1,1,'EFFECTIVE','{}')");
                assertThatThrownBy(() -> statement.execute("INSERT INTO form_instance_revision (id,tenant_id,record_id,revision_no,status,values_json) VALUES (3,'default',1,1,'EFFECTIVE','{}')"))
                        .isInstanceOf(java.sql.SQLException.class);
                assertThatThrownBy(() -> statement.execute("INSERT INTO form_instance_revision (id,tenant_id,record_id,revision_no,status,values_json) VALUES (4,'default',1,2,'DRAFT','{}')"))
                        .isInstanceOf(java.sql.SQLException.class);
                statement.execute("UPDATE form_instance_record SET current_revision_id=2 WHERE id=1");
                var pointer = statement.executeQuery("SELECT current_revision_id FROM form_instance_record WHERE id=1");
                assertThat(pointer.next()).isTrue(); assertThat(pointer.getLong(1)).isEqualTo(2);
                assertThatThrownBy(() -> statement.execute("INSERT INTO record_control_request (id,tenant_id,request_no,request_type,status,record_id,source_revision_id,source_values_json,reason_text,applicant_id,applicant_signature_id,workflow_definition_id,workflow_version_id,idempotency_key,audit_correlation_id,submitted_at) VALUES (1,'default','RC-1','CHANGE','DRAFT',1,2,'{}','reason','42',10,'100','101','key','audit',CURRENT_TIMESTAMP)"))
                        .isInstanceOf(java.sql.SQLException.class);
            }
        }
    }
}
