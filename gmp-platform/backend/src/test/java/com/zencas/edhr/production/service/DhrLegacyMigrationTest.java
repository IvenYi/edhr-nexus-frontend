package com.zencas.edhr.production.service;

import com.zencas.edhr.workflow.entity.WorkflowActionLog;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.hibernate.cfg.Configuration;
import liquibase.Contexts;
import liquibase.LabelExpression;
import liquibase.Liquibase;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;

import java.sql.Connection;
import java.sql.DriverManager;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@EnabledIfSystemProperty(named = "dhr.migration.test.url", matches = "jdbc:postgresql:.*edhr_startup_qa_.*")
class DhrLegacyMigrationTest {
    private static final String PREPARATION = "0088a-dhr-instance-legacy-table-preparation.sql";
    private static final String REGISTRY = "0089-dhr-instance-management.sql";
    private final String schema = "dhr_migration_" + UUID.randomUUID().toString().replace("-", "");

    private Connection connection() throws Exception {
        var connection = DriverManager.getConnection(System.getProperty("dhr.migration.test.url"),
                "edhr", System.getenv().getOrDefault("PGPASSWORD", ""));
        connection.setSchema(schema);
        return connection;
    }

    @BeforeEach
    void prepareSchema() throws Exception {
        execute("CREATE SCHEMA " + schema);
        execute("CREATE SEQUENCE hibernate_sequence START WITH 1000");
        execute("CREATE TABLE permission(id BIGINT PRIMARY KEY,code VARCHAR(128) UNIQUE,name VARCHAR(128),type VARCHAR(32),parent_code VARCHAR(128),sort_order INT)");
        execute("CREATE TABLE role(id BIGINT PRIMARY KEY,code VARCHAR(64))");
        execute("CREATE TABLE role_permission(id BIGINT PRIMARY KEY,role_id BIGINT,permission_id BIGINT)");
        for (String parent : new String[]{"production_object", "work_order", "material", "product_process_version", "route_version", "dhr_template", "dhr_template_version"}) {
            execute("CREATE TABLE " + parent + "(id BIGINT PRIMARY KEY)");
        }
        execute("INSERT INTO permission VALUES(1,'records','记录','PAGE',NULL,5)");
        execute("INSERT INTO role VALUES(1,'ADMIN'),(2,'OPERATOR')");
    }

    @AfterEach
    void removeSchema() throws Exception {
        execute("DROP SCHEMA " + schema + " CASCADE");
    }

    @Test
    void emptyLegacyTableNoLongerBlocksRegistryAndKeepsLegacyForeignKeys() throws Exception {
        legacyTable();
        migrate(PREPARATION);
        migrate(REGISTRY);
        migrate(PREPARATION);
        migrate(REGISTRY);
        assertThat(scalar("SELECT count(*) FROM dhr_instance_legacy")).isEqualTo("0");
        assertThat(scalar("SELECT count(*) FROM dhr_instance")).isEqualTo("0");
        assertThat(scalar("SELECT count(*) FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='dhr_instance' AND column_name IN ('production_object_id','context_snapshot','dhr_no')")).isEqualTo("3");
        assertThat(scalar("SELECT count(*) FROM pg_constraint WHERE conrelid='dhr_evidence_item'::regclass AND confrelid='dhr_instance_legacy'::regclass")).isEqualTo("1");
        assertThat(scalar("SELECT count(*) FROM databasechangelog WHERE exectype='EXECUTED'")).isEqualTo("2");
    }

    @Test
    void freshSchemaStillCreatesRegistry() throws Exception {
        migrate(PREPARATION);
        migrate(REGISTRY);
        assertThat(scalar("SELECT count(*) FROM dhr_instance")).isEqualTo("0");
        assertThat(scalar("SELECT exectype FROM databasechangelog WHERE id='0088a-dhr-instance-legacy-table-preparation'")).isEqualTo("MARK_RAN");
    }

    @Test
    void alreadyUpgradedRegistryAndItsRecordsAreUntouched() throws Exception {
        migrate(REGISTRY);
        for (String parent : new String[]{"production_object", "work_order", "material", "product_process_version", "route_version", "dhr_template", "dhr_template_version"}) {
            execute("INSERT INTO " + parent + " VALUES(1)");
        }
        execute("INSERT INTO dhr_instance(id,tenant_id,dhr_no,production_object_id,object_no,object_type,work_order_id,work_order_no,product_id,process_version_id,route_version_id,dhr_template_id,dhr_template_version_id,context_snapshot,directory_snapshot,status,created_at,updated_at) VALUES(1,'default','DHR-1',1,'B1','BATCH',1,'WO1',1,1,1,1,1,'{}','{}','IN_PROGRESS',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)");
        migrate(PREPARATION);
        migrate(REGISTRY);
        assertThat(scalar("SELECT dhr_no FROM dhr_instance WHERE id=1")).isEqualTo("DHR-1");
        assertThat(scalar("SELECT to_regclass('dhr_instance_legacy')")).isNull();
    }

    @Test
    void nonemptyLegacyRegistryFailsWithoutChangingRowsOrReferences() throws Exception {
        legacyTable();
        execute("INSERT INTO dhr_instance(id,code) VALUES(1,'OLD-1')");
        execute("INSERT INTO dhr_evidence_item VALUES(1,1)");
        assertThatThrownBy(() -> migrate(PREPARATION))
                .hasStackTraceContaining("explicit data migration is required");
        assertThat(scalar("SELECT code FROM dhr_instance WHERE id=1")).isEqualTo("OLD-1");
        assertThat(scalar("SELECT count(*) FROM dhr_evidence_item WHERE dhr_instance_id=1")).isEqualTo("1");
        assertThat(scalar("SELECT to_regclass('dhr_instance_legacy')")).isNull();
        assertThat(scalar("SELECT count(*) FROM databasechangelog")).isEqualTo("0");
    }

    private void legacyTable() throws Exception {
        execute("CREATE TABLE dhr_instance(id BIGINT PRIMARY KEY,code VARCHAR(64) NOT NULL,batch_id BIGINT,workflow_instance_id BIGINT,tenant_id BIGINT)");
        execute("CREATE TABLE dhr_evidence_item(id BIGINT PRIMARY KEY,dhr_instance_id BIGINT REFERENCES dhr_instance(id))");
    }

    @Test
    void workflowActionSnapshotRoundTripsAsJsonObject() throws Exception {
        try (var sessions = new Configuration().addAnnotatedClass(WorkflowActionLog.class)
                .setProperty("hibernate.connection.url", System.getProperty("dhr.migration.test.url"))
                .setProperty("hibernate.connection.username", "edhr")
                .setProperty("hibernate.connection.password", System.getenv().getOrDefault("PGPASSWORD", ""))
                .setProperty("hibernate.default_schema", schema)
                .setProperty("hibernate.hbm2ddl.auto", "create-drop")
                .buildSessionFactory()) {
            String snapshot = "{\"field\":\"原始值\",\"revision\":3}";
            try (var session = sessions.openSession()) {
                var transaction = session.beginTransaction();
                session.persist(WorkflowActionLog.builder().id(1L).instanceId(1L).action("APPROVE").snapshot(snapshot).build());
                session.persist(WorkflowActionLog.builder().id(2L).instanceId(1L).action("APPROVE").build());
                transaction.commit();
            }
            assertThat(scalar("SELECT jsonb_typeof(snapshot) FROM workflow_action_log WHERE id=1")).isEqualTo("object");
            try (var session = sessions.openSession()) {
                var mapper = new ObjectMapper();
                assertThat(mapper.readTree(session.find(WorkflowActionLog.class, 1L).getSnapshot())).isEqualTo(mapper.readTree(snapshot));
                assertThat(session.find(WorkflowActionLog.class, 2L).getSnapshot()).isNull();
            }
        }
    }

    private void migrate(String file) throws Exception {
        try (var connection = connection(); var migration = new Liquibase("db/changelog/" + file,
                new ClassLoaderResourceAccessor(), new JdbcConnection(connection))) {
            migration.update(new Contexts(), new LabelExpression());
        }
    }

    private void execute(String sql) throws Exception {
        try (var connection = connection(); var statement = connection.createStatement()) {
            statement.execute(sql);
        }
    }

    private String scalar(String sql) throws Exception {
        try (var connection = connection(); var statement = connection.createStatement(); var rows = statement.executeQuery(sql)) {
            assertThat(rows.next()).isTrue();
            return rows.getString(1);
        }
    }
}
