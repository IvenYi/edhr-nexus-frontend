package com.zencas.edhr.production.controller;

import com.zencas.edhr.compliance.controller.SignatureController;
import com.zencas.edhr.compliance.entity.Signature;
import com.zencas.edhr.compliance.repository.SignatureRepository;
import com.zencas.edhr.workflow.controller.*;
import com.zencas.edhr.workflow.engine.WorkflowEngine;
import com.zencas.edhr.workflow.entity.*;
import com.zencas.edhr.workflow.repository.*;
import jakarta.persistence.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.support.JpaRepositoryFactory;
import org.springframework.orm.jpa.SharedEntityManagerCreator;
import org.springframework.orm.jpa.persistenceunit.PersistenceManagedTypes;
import org.springframework.test.util.ReflectionTestUtils;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest(classes=DhrGenericAccessTest.Config.class, webEnvironment=SpringBootTest.WebEnvironment.NONE, properties={
    "spring.liquibase.enabled=false", "spring.datasource.url=jdbc:h2:mem:dhr-generic-access;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect", "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect", "spring.jpa.hibernate.ddl-auto=create-drop"})
@org.springframework.transaction.annotation.Transactional
class DhrGenericAccessTest {
    @Autowired WorkflowInstanceRepository instances;
    @Autowired WorkflowTaskRepository tasks;
    @Autowired WorkflowActionLogRepository logs;
    @Autowired SignatureRepository signatures;
    WorkflowEngine engine;
    @BeforeEach void seed() {
        logs.deleteAll(); tasks.deleteAll(); instances.deleteAll(); signatures.deleteAll();
        instances.saveAndFlush(WorkflowInstance.builder().id(1L).businessType("DHR_SUMMARY").build());
        instances.saveAndFlush(WorkflowInstance.builder().id(2L).businessType("CHANGE").build());
        tasks.saveAndFlush(WorkflowTask.builder().id(10L).instanceId(1L).build());
        tasks.saveAndFlush(WorkflowTask.builder().id(20L).instanceId(2L).build());
        logs.saveAndFlush(WorkflowActionLog.builder().id(100L).instanceId(1L).taskId(10L).comment("DHR original").build());
        logs.saveAndFlush(WorkflowActionLog.builder().id(200L).instanceId(2L).taskId(20L).build());
        signatures.saveAndFlush(Signature.builder().id(1000L).targetType("DHR_SUMMARY").targetId("3").build());
        signatures.saveAndFlush(Signature.builder().id(2000L).targetType("OTHER").targetId("4").build());
        engine = mock(WorkflowEngine.class, CALLS_REAL_METHODS);
        ReflectionTestUtils.setField(engine, "instanceRepository", instances);
        ReflectionTestUtils.setField(engine, "taskRepository", tasks);
    }
    @Test void databasePaginationExcludesDhrBeforeComputingCounts() {
        var page = PageRequest.of(0, 20);
        assertThat(instances.findNonDhr(page).getContent()).extracting(WorkflowInstance::getId).containsExactly(2L);
        assertThat(instances.findNonDhr(page).getTotalElements()).isEqualTo(1);
        assertThat(tasks.findNonDhr(page).getContent()).extracting(WorkflowTask::getId).containsExactly(20L);
        assertThat(logs.findNonDhr(page).getContent()).extracting(WorkflowActionLog::getId).containsExactly(200L);
        assertThat(signatures.findNonDhr(page).getContent()).extracting(Signature::getId).containsExactly(2000L);
    }
    @Test void allGenericSingleObjectReadsRejectDhrBeforeReturningEvidence() {
        var taskController = new WorkflowTaskController(tasks, engine);
        var instanceController = new WorkflowInstanceController(instances, mock(WorkflowNodeRepository.class), mock(WorkflowEdgeRepository.class), logs, mock(WorkflowDefinitionVersionRepository.class), engine);
        var logController = new WorkflowLogController(logs, engine);
        assertThatThrownBy(() -> taskController.getById(10L)).hasMessageContaining("DHR");
        assertThatThrownBy(() -> instanceController.getById(1L)).hasMessageContaining("DHR");
        assertThatThrownBy(() -> instanceController.graph(1L)).hasMessageContaining("DHR");
        assertThatThrownBy(() -> instanceController.logs(1L)).hasMessageContaining("DHR");
        assertThatThrownBy(() -> logController.getById(100L)).hasMessageContaining("DHR");
        assertThatThrownBy(() -> new SignatureController(signatures).getById(1000L)).hasMessageContaining("DHR");
        assertThat(taskController.getById(20L).getData().getId()).isEqualTo(20L);
    }
    @Test void cannotForgeReparentOverwriteOrDeleteDhrAuditLogs() {
        var controller = new WorkflowLogController(logs, engine);
        assertThatThrownBy(() -> controller.create(WorkflowActionLog.builder().id(101L).instanceId(1L).build())).hasMessageContaining("DHR");
        assertThatThrownBy(() -> controller.create(WorkflowActionLog.builder().id(101L).instanceId(2L).taskId(10L).build())).hasMessageContaining("DHR");
        assertThatThrownBy(() -> controller.create(WorkflowActionLog.builder().id(100L).instanceId(2L).build())).hasMessageContaining("DHR");
        assertThatThrownBy(() -> controller.update(100L, WorkflowActionLog.builder().instanceId(2L).build())).hasMessageContaining("DHR");
        assertThatThrownBy(() -> controller.delete(100L)).hasMessageContaining("DHR");
        assertThat(logs.findById(100L).orElseThrow().getComment()).isEqualTo("DHR original");
        assertThat(logs.count()).isEqualTo(2);
    }
    @Configuration(proxyBeanMethods=false) @EnableAutoConfiguration(exclude=JpaRepositoriesAutoConfiguration.class)
    static class Config {
        @Bean EntityManager em(EntityManagerFactory factory) { return SharedEntityManagerCreator.createSharedEntityManager(factory); }
        @Bean PersistenceManagedTypes types() { return PersistenceManagedTypes.of(WorkflowInstance.class.getName(), WorkflowTask.class.getName(), WorkflowActionLog.class.getName(), Signature.class.getName()); }
        @Bean WorkflowInstanceRepository instances(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(WorkflowInstanceRepository.class); }
        @Bean WorkflowTaskRepository tasks(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(WorkflowTaskRepository.class); }
        @Bean WorkflowActionLogRepository logs(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(WorkflowActionLogRepository.class); }
        @Bean SignatureRepository signatures(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(SignatureRepository.class); }
    }
}
