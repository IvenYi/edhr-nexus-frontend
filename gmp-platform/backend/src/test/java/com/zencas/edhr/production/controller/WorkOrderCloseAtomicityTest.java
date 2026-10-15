package com.zencas.edhr.production.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.masterdata.entity.Material;
import com.zencas.edhr.masterdata.repository.MaterialRepository;
import com.zencas.edhr.masterdata.repository.ProductProcessVersionRepository;
import com.zencas.edhr.masterdata.service.ProductProcessResolutionService;
import com.zencas.edhr.production.engine.WorkOrderStatusMachine;
import com.zencas.edhr.production.entity.WorkOrder;
import com.zencas.edhr.production.repository.ProductionObjectRepository;
import com.zencas.edhr.production.repository.WorkOrderRepository;
import com.zencas.edhr.production.service.DhrInstanceService;
import com.zencas.edhr.production.service.ProductionOutputService;
import com.zencas.edhr.production.service.ProductionService;
import com.zencas.edhr.workflow.engine.StateMachineRegistry;
import com.zencas.edhr.workflow.engine.StateMachineService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.data.jpa.repository.support.JpaRepositoryFactory;
import org.springframework.orm.jpa.vendor.HibernateJpaDialect;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.SharedEntityManagerCreator;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.support.TransactionTemplate;

import jakarta.persistence.EntityManagerFactory;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** Real Spring transactions, Hibernate WorkOrder repository and isolated H2; other repositories are doubles. */
@SpringJUnitConfig(WorkOrderCloseAtomicityTest.Config.class)
class WorkOrderCloseAtomicityTest {
    @Autowired WorkOrderController controller;
    @Autowired JdbcTemplate jdbc;
    @Autowired WorkOrderRepository orders;
    @Autowired MaterialRepository materials;
    @Autowired AuditEventRepository audits;
    @Autowired SnowflakeIdGenerator ids;
    @Autowired ObjectMapper mapper;
    @Autowired PlatformTransactionManager transactions;

    @BeforeEach void prepare() {
        reset(materials, audits, ids, mapper);
        jdbc.execute("CREATE TABLE IF NOT EXISTS test_audit(id BIGINT PRIMARY KEY,before_json TEXT,after_json TEXT,operator_id VARCHAR(64))");
        jdbc.update("DELETE FROM test_audit");
        jdbc.update("DELETE FROM work_order");
        new TransactionTemplate(transactions).executeWithoutResult(ignored -> orders.saveAndFlush(WorkOrder.builder()
                .id(100L).tenantId("default").orderNo("QA-WO").productId(7L)
                .plannedQuantity(BigDecimal.TEN).status("COMPLETED").build()));
        AuditContext.setOperator("385762229210103809", "QA", "qa-audit");
        when(ids.nextId()).thenReturn(101L);
        when(materials.findByTenantIdAndId("default", 7L))
                .thenReturn(Optional.of(Material.builder().id(7L).code("QA-P").name("QA product").build()));
        when(audits.save(any(AuditEvent.class))).thenAnswer(invocation -> {
            AuditEvent event = invocation.getArgument(0);
            jdbc.update("INSERT INTO test_audit VALUES(?,?,?,?)", event.getId(), event.getContentBefore(), event.getContentAfter(), event.getOperatorId());
            return event;
        });
    }

    @AfterEach void clear() { AuditContext.clear(); }

    @Test void auditWriteFailureRollsBackTheAlreadyExecutedClose() {
        doThrow(new IllegalStateException("audit write failed")).when(audits).save(any(AuditEvent.class));
        assertThatThrownBy(() -> controller.close(100L)).hasMessage("audit write failed");
        assertThat(status()).isEqualTo("COMPLETED");
        assertThat(auditCount()).isZero();
    }

    @Test void auditSerializationFailureAlsoRollsBackTheClose() throws Exception {
        doThrow(new JsonProcessingException("audit serialization failed") {}).when(mapper).writeValueAsString(any());
        assertThatThrownBy(() -> controller.close(100L)).hasMessage("工单审计快照格式化失败");
        assertThat(status()).isEqualTo("COMPLETED");
        assertThat(auditCount()).isZero();
    }

    @Test void successfulCloseCommitsBothStatusAndExactBeforeAfterAudit() throws Exception {
        assertThat(controller.close(100L).getData().status()).isEqualTo("CLOSED");
        assertThat(status()).isEqualTo("CLOSED");
        assertThat(auditCount()).isEqualTo(1);
        var row = jdbc.queryForMap("SELECT before_json,after_json,operator_id FROM test_audit");
        assertThat(mapper.readTree(row.get("BEFORE_JSON").toString()).path("status").asText()).isEqualTo("COMPLETED");
        assertThat(mapper.readTree(row.get("AFTER_JSON").toString()).path("status").asText()).isEqualTo("CLOSED");
        assertThat(row.get("OPERATOR_ID")).isEqualTo("385762229210103809");
        var capture = org.mockito.ArgumentCaptor.forClass(AuditEvent.class);
        verify(audits).save(capture.capture());
        assertThat(capture.getValue().getAction()).isEqualTo("UPDATE");
        assertThat(capture.getValue().getEntityId()).isEqualTo("100");
    }

    @Test void invalidStateRemainsRejectedWithoutStatusOrAuditWrite() {
        jdbc.update("UPDATE work_order SET status='CREATED'");
        assertThatThrownBy(() -> controller.close(100L)).hasMessage("只有已完成的工单可以关闭");
        assertThat(status()).isEqualTo("CREATED");
        assertThat(auditCount()).isZero();
        verify(audits, never()).save(any());
    }

    @Test void concurrentCloseIsAcceptedOnceWithOneAccurateAudit() throws Exception {
        AtomicLong auditIds = new AtomicLong(100);
        when(ids.nextId()).thenAnswer(ignored -> auditIds.incrementAndGet());
        Thread firstCaller = Thread.currentThread();
        AtomicBoolean firstSnapshot = new AtomicBoolean(true);
        AtomicReference<Future<String>> competingClose = new AtomicReference<>();
        ExecutorService competitor = Executors.newSingleThreadExecutor();
        when(materials.findByTenantIdAndId("default", 7L)).thenAnswer(ignored -> {
            if (Thread.currentThread() == firstCaller && firstSnapshot.compareAndSet(true, false)) {
                competingClose.set(competitor.submit(() -> {
                    AuditContext.setOperator("385762229210103810", "QA2", "qa-race");
                    try {
                        controller.close(100L);
                        return "accepted";
                    } catch (BusinessException rejected) {
                        return rejected.getMessage();
                    } finally { AuditContext.clear(); }
                }));
                // Before the fix B can commit while A retains an old managed entity.
                // With the fix B waits for A's lock, then must reject CLOSED.
                try { competingClose.get().get(2, TimeUnit.SECONDS); }
                catch (TimeoutException waitingForRowLock) { /* A now completes and releases its lock. */ }
            }
            return Optional.of(Material.builder().id(7L).code("QA-P").name("QA product").build());
        });
        try {
            assertThat(controller.close(100L).getData().status()).isEqualTo("CLOSED");
            assertThat(competingClose.get().get(5, TimeUnit.SECONDS)).isEqualTo("只有已完成的工单可以关闭");
            assertThat(status()).isEqualTo("CLOSED");
            assertThat(auditCount()).isEqualTo(1);
            var row = jdbc.queryForMap("SELECT before_json,after_json FROM test_audit");
            assertThat(mapper.readTree(row.get("BEFORE_JSON").toString()).path("status").asText()).isEqualTo("COMPLETED");
            assertThat(mapper.readTree(row.get("AFTER_JSON").toString()).path("status").asText()).isEqualTo("CLOSED");
        } finally {
            competitor.shutdownNow();
            assertThat(competitor.awaitTermination(5, TimeUnit.SECONDS)).isTrue();
        }
    }

    private String status() { return jdbc.queryForObject("SELECT status FROM work_order WHERE id=100", String.class); }
    private int auditCount() { return jdbc.queryForObject("SELECT count(*) FROM test_audit", Integer.class); }

    @Configuration
    @EnableTransactionManagement(proxyTargetClass = true)
    @Import({WorkOrderController.class, ProductionService.class, StateMachineRegistry.class, StateMachineService.class, WorkOrderStatusMachine.class})
    static class Config {
        @Bean DataSource dataSource() { return new DriverManagerDataSource("jdbc:h2:mem:work_order_close_atomicity;DB_CLOSE_DELAY=-1;LOCK_TIMEOUT=10000", "sa", ""); }
        @Bean JdbcTemplate jdbc(DataSource source) { return new JdbcTemplate(source); }
        @Bean(destroyMethod = "close") EntityManagerFactory entityManagerFactory(DataSource source) {
            var configuration = new org.hibernate.cfg.Configuration().addAnnotatedClass(WorkOrder.class)
                    .setProperty("hibernate.hbm2ddl.auto", "create-drop");
            configuration.getProperties().put("hibernate.connection.datasource", source);
            return configuration.buildSessionFactory();
        }
        @Bean PlatformTransactionManager transactionManager(EntityManagerFactory factory, DataSource source) {
            var manager = new JpaTransactionManager(factory);
            manager.setDataSource(source);
            manager.setJpaDialect(new HibernateJpaDialect());
            return manager;
        }
        @Bean WorkOrderRepository orders(EntityManagerFactory factory) {
            return new JpaRepositoryFactory(SharedEntityManagerCreator.createSharedEntityManager(factory))
                    .getRepository(WorkOrderRepository.class);
        }
        @Bean ProductionObjectRepository objects() { return mock(ProductionObjectRepository.class); }
        @Bean MaterialRepository materials() { return mock(MaterialRepository.class); }
        @Bean ProductProcessVersionRepository processVersions() { return mock(ProductProcessVersionRepository.class); }
        @Bean ProductProcessResolutionService resolution() { return mock(ProductProcessResolutionService.class); }
        @Bean ProductionOutputService outputs() { return mock(ProductionOutputService.class); }
        @Bean DhrInstanceService instances() { return mock(DhrInstanceService.class); }
        @Bean AuditEventRepository audits() { return mock(AuditEventRepository.class); }
        @Bean SnowflakeIdGenerator ids() { return mock(SnowflakeIdGenerator.class); }
        @Bean ObjectMapper mapper() { return spy(new ObjectMapper()); }
    }
}
