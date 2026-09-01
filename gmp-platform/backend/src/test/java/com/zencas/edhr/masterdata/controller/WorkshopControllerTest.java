package com.zencas.edhr.masterdata.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.identity.entity.Workshop;
import com.zencas.edhr.identity.repository.ProductionLineRepository;
import com.zencas.edhr.identity.repository.WorkshopRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDateTime;
import java.util.ArrayDeque;
import java.util.List;
import java.util.Optional;
import java.util.Queue;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkshopControllerTest {

    @Mock private WorkshopRepository workshopRepository;
    @Mock private ProductionLineRepository productionLineRepository;
    @Mock private AuditEventRepository auditEventRepository;
    private DeterministicSnowflakeIdGenerator idGenerator;
    private WorkshopController controller;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        idGenerator = new DeterministicSnowflakeIdGenerator();
        controller = new WorkshopController(workshopRepository, productionLineRepository, auditEventRepository, idGenerator);
    }

    @AfterEach
    void clearAuditContext() {
        AuditContext.clear();
    }

    @Test
    void requiresWorkshopPagePermissionForEveryEndpoint() {
        PreAuthorize authorization = WorkshopController.class.getAnnotation(PreAuthorize.class);

        assertThat(authorization).isNotNull();
        assertThat(authorization.value()).isEqualTo("hasAuthority('master-data.workshops')");
    }

    @Test
    void createsWorkshopWithDefaultActiveStatusAndAudit() throws Exception {
        AuditContext.setOperator("1", "系统管理员", "admin");
        idGenerator.given(340800000000000101L, 340800000000000102L);
        when(workshopRepository.save(any(Workshop.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.create(new WorkshopController.WorkshopRequest(
                " WS-01 ", " 无菌车间 ", " 核心生产区域 ", null));

        assertThat(response.getData().id()).isEqualTo("340800000000000101");
        assertThat(response.getData().code()).isEqualTo("WS-01");
        assertThat(response.getData().name()).isEqualTo("无菌车间");
        assertThat(response.getData().description()).isEqualTo("核心生产区域");
        assertThat(response.getData().status()).isEqualTo("ACTIVE");

        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        AuditEvent audit = auditCaptor.getValue();
        assertThat(audit.getEntityType()).isEqualTo("WORKSHOP");
        assertThat(audit.getMenuName()).isEqualTo("工厂建模 · 车间管理");
        assertThat(audit.getFunctionName()).isEqualTo("新增");
        assertThat(objectMapper.readTree(audit.getContentAfter()).get("status").asText()).isEqualTo("ACTIVE");
    }

    @Test
    void refusesDuplicateWorkshopCodeWithinTenantIgnoringCase() {
        when(workshopRepository.existsByTenantIdAndCodeIgnoreCase(1L, "ws-01")).thenReturn(true);

        assertThatThrownBy(() -> controller.create(new WorkshopController.WorkshopRequest(
                "ws-01", "重复车间", null, "ACTIVE")))
                .isInstanceOf(BusinessException.class)
                .hasMessage("车间编码已存在");

        verify(workshopRepository, never()).save(any(Workshop.class));
        verify(auditEventRepository, never()).save(any(AuditEvent.class));
    }

    @Test
    void referencedWorkshopLocksCodeButStillAllowsOtherFieldsToChange() {
        Workshop workshop = workshop();
        when(workshopRepository.findByIdAndTenantId(101L, 1L)).thenReturn(Optional.of(workshop));
        when(productionLineRepository.existsByWorkshopId(101L)).thenReturn(true);

        assertThatThrownBy(() -> controller.update(101L, new WorkshopController.WorkshopRequest(
                "WS-02", "新名称", "新描述", "INACTIVE")))
                .isInstanceOf(BusinessException.class)
                .hasMessage("车间已被引用，不能修改车间编码");

        when(workshopRepository.save(workshop)).thenAnswer(invocation -> invocation.getArgument(0));
        idGenerator.given(340800000000000103L);
        var response = controller.update(101L, new WorkshopController.WorkshopRequest(
                "WS-01", "新名称", "新描述", "INACTIVE"));

        assertThat(response.getData().name()).isEqualTo("新名称");
        assertThat(response.getData().description()).isEqualTo("新描述");
        assertThat(response.getData().status()).isEqualTo("INACTIVE");
        assertThat(response.getData().codeEditable()).isFalse();
        assertThat(response.getData().deletable()).isFalse();
        verify(auditEventRepository).save(any(AuditEvent.class));
    }

    @Test
    void refusesToDeleteReferencedWorkshop() {
        when(workshopRepository.findByIdAndTenantId(101L, 1L)).thenReturn(Optional.of(workshop()));
        when(productionLineRepository.existsByWorkshopId(101L)).thenReturn(true);

        assertThatThrownBy(() -> controller.delete(101L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("车间已被引用，不能删除，请停用该车间");

        verify(workshopRepository, never()).delete(any(Workshop.class));
        verify(auditEventRepository, never()).save(any(AuditEvent.class));
    }

    @Test
    void deletesUnreferencedWorkshopAndRecordsBeforeSnapshot() throws Exception {
        AuditContext.setOperator("1", "系统管理员", "admin");
        Workshop workshop = workshop();
        when(workshopRepository.findByIdAndTenantId(101L, 1L)).thenReturn(Optional.of(workshop));
        idGenerator.given(340800000000000104L);

        controller.delete(101L);

        verify(workshopRepository).delete(workshop);
        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        assertThat(auditCaptor.getValue().getAction()).isEqualTo("DELETE");
        assertThat(objectMapper.readTree(auditCaptor.getValue().getContentBefore()).get("code").asText()).isEqualTo("WS-01");
    }

    private Workshop workshop() {
        return Workshop.builder()
                .id(101L)
                .tenantId(1L)
                .code("WS-01")
                .name("原车间")
                .description("原描述")
                .status("ACTIVE")
                .createdAt(LocalDateTime.of(2026, 8, 30, 9, 0))
                .updatedAt(LocalDateTime.of(2026, 8, 30, 9, 0))
                .build();
    }

    private static class DeterministicSnowflakeIdGenerator extends SnowflakeIdGenerator {
        private final Queue<Long> ids = new ArrayDeque<>();

        DeterministicSnowflakeIdGenerator() {
            super(1);
        }

        void given(Long... ids) {
            this.ids.addAll(List.of(ids));
        }

        @Override
        public synchronized long nextId() {
            Long next = ids.poll();
            return next == null ? super.nextId() : next;
        }
    }
}
