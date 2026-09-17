package com.zencas.edhr.workflow.repository;

import com.zencas.edhr.workflow.entity.WorkflowDefinition;
import liquibase.Contexts;
import liquibase.LabelExpression;
import liquibase.Liquibase;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.hibernate.cfg.Configuration;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class WorkflowDefinitionMigrationTest {
    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void upgradePreservesDefinitionsAndSupportsExistingSchema(boolean existingCategory) throws Exception {
        String url = "jdbc:h2:mem:workflow_category_" + UUID.randomUUID() + ";MODE=PostgreSQL;DB_CLOSE_DELAY=-1";
        try (var sessions = new Configuration()
                .addAnnotatedClass(WorkflowDefinition.class)
                .setProperty("hibernate.connection.driver_class", "org.h2.Driver")
                .setProperty("hibernate.connection.url", url)
                .setProperty("hibernate.connection.username", "sa")
                .setProperty("hibernate.connection.password", "")
                .setProperty("hibernate.hbm2ddl.auto", "create-drop")
                .buildSessionFactory()) {
            try (var connection = DriverManager.getConnection(url, "sa", ""); var sql = connection.createStatement()) {
                if (existingCategory) {
                    sql.execute("ALTER TABLE workflow_definition ADD CONSTRAINT ck_workflow_definition_record_control_category CHECK (type <> 'RECORD_CONTROL' OR business_type IN ('CHANGE', 'OBSOLETE'))");
                    sql.execute("CREATE INDEX idx_workflow_definition_business_type ON workflow_definition(type, business_type)");
                } else {
                    sql.execute("ALTER TABLE workflow_definition DROP COLUMN business_type");
                }
                sql.execute("INSERT INTO workflow_definition(id, name, type, status) VALUES(1, '历史作业模板', 'WORK', 'DRAFT'), (2, '历史表单流程', 'FORM', 'DRAFT'), (3, '历史审核模板', 'RECORD_CONTROL', 'DRAFT')");
                if (existingCategory) {
                    sql.execute("UPDATE workflow_definition SET business_type='CHANGE' WHERE id=3");
                }
            }
            for (int i = 0; i < 2; i++) {
                try (var connection = DriverManager.getConnection(url, "sa", "");
                     var migration = new Liquibase("db/changelog/0088-workflow-definition-business-type.sql",
                             new ClassLoaderResourceAccessor(), new JdbcConnection(connection))) {
                    migration.update(new Contexts(), new LabelExpression());
                }
            }
            try (var session = sessions.openSession()) {
                assertThat(session.createQuery("from WorkflowDefinition order by id", WorkflowDefinition.class).list())
                        .extracting(WorkflowDefinition::getName)
                        .containsExactly("历史作业模板", "历史表单流程", "历史审核模板");
                assertThat(session.find(WorkflowDefinition.class, 1L).getBusinessType()).isNull();
                assertThat(session.find(WorkflowDefinition.class, 3L).getBusinessType()).isEqualTo(existingCategory ? "CHANGE" : null);
            }
            try (var connection = DriverManager.getConnection(url, "sa", ""); var sql = connection.createStatement()) {
                assertThatThrownBy(() -> sql.execute("UPDATE workflow_definition SET business_type='INVALID' WHERE id=3"))
                        .isInstanceOf(SQLException.class);
                sql.execute("UPDATE workflow_definition SET business_type='OBSOLETE' WHERE id=3");
                var changes = sql.executeQuery("SELECT count(*) FROM databasechangelog WHERE id LIKE '0088-%'");
                assertThat(changes.next()).isTrue();
                assertThat(changes.getInt(1)).isEqualTo(2);
            }
        }
    }
}
