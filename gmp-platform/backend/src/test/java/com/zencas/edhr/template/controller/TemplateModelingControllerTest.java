package com.zencas.edhr.template.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.template.dto.TemplateModelingRequest;
import com.zencas.edhr.template.entity.DhrTemplate;
import com.zencas.edhr.template.entity.FormTemplate;
import com.zencas.edhr.template.entity.FormTemplateVersion;
import com.zencas.edhr.template.entity.TemplateCategory;
import com.zencas.edhr.template.repository.DhrTemplateRepository;
import com.zencas.edhr.template.repository.FormTemplateRepository;
import com.zencas.edhr.template.repository.FormTemplateVersionRepository;
import com.zencas.edhr.template.repository.TemplateCategoryRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TemplateModelingControllerTest {

    @Mock private FormTemplateRepository formTemplateRepository;
    @Mock private FormTemplateVersionRepository formTemplateVersionRepository;
    @Mock private DhrTemplateRepository dhrTemplateRepository;
    @Mock private TemplateCategoryRepository templateCategoryRepository;
    @Mock private AuditEventRepository auditEventRepository;
    @Mock private SnowflakeIdGenerator idGenerator;
    @InjectMocks private TemplateModelingController controller;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @AfterEach
    void clearAuditContext() {
        AuditContext.clear();
    }

    @Test
    void templateCategoryResponsesIncludeAllAndUncategorizedCounts() {
        FormTemplate categorized = FormTemplate.builder().id(1L).tenantId("default").code("FT-001").name("巡检表").categoryName("生产表单").build();
        FormTemplate uncategorized = FormTemplate.builder().id(2L).tenantId("default").code("FT-002").name("清场表").build();
        TemplateCategory category = TemplateCategory.builder()
                .id(11L)
                .tenantId("default")
                .templateType("FORM")
                .name("生产表单")
                .sortOrder(10)
                .build();
        when(formTemplateRepository.findAll()).thenReturn(List.of(categorized, uncategorized));
        when(templateCategoryRepository.findByTenantIdAndTemplateTypeOrderBySortOrderAscNameAsc("default", "FORM")).thenReturn(List.of(category));

        var response = controller.listCategories("form-templates");

        assertThat(response.getData())
                .extracting(TemplateModelingController.TemplateCategoryResponse::id)
                .containsExactly("ALL", "UNCATEGORIZED", "11");
        assertThat(response.getData())
                .extracting(TemplateModelingController.TemplateCategoryResponse::name)
                .containsExactly("全部", "未分类", "生产表单");
        assertThat(response.getData())
                .extracting(TemplateModelingController.TemplateCategoryResponse::count)
                .containsExactly(2L, 1L, 1L);
    }

    @Test
    void reorderTemplateCategoriesPersistsSortOrder() {
        TemplateCategory first = TemplateCategory.builder().id(11L).tenantId("default").templateType("DHR").name("默认").sortOrder(10).build();
        TemplateCategory second = TemplateCategory.builder().id(22L).tenantId("default").templateType("DHR").name("验证").sortOrder(20).build();
        when(templateCategoryRepository.findByTenantIdAndTemplateTypeOrderBySortOrderAscNameAsc("default", "DHR")).thenReturn(List.of(first, second));
        when(dhrTemplateRepository.findAll()).thenReturn(List.of());
        when(templateCategoryRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.reorderCategories("batch-record-templates",
                new TemplateModelingController.TemplateCategoryOrderRequest(List.of("22", "11")));

        assertThat(first.getSortOrder()).isEqualTo(20);
        assertThat(second.getSortOrder()).isEqualTo(10);
        assertThat(response.getData())
                .extracting(TemplateModelingController.TemplateCategoryResponse::id)
                .containsExactly("ALL", "UNCATEGORIZED", "22", "11");
    }

    @Test
    void createFormTemplateCreatesInitialVersionAndWritesAuditSnapshot() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        when(formTemplateRepository.findByTenantIdAndCodeIgnoreCase("default", "FT-001")).thenReturn(List.of());
        when(templateCategoryRepository.findByTenantIdAndTemplateTypeAndNameIgnoreCase("default", "FORM", "生产表单"))
                .thenReturn(Optional.of(TemplateCategory.builder().id(11L).tenantId("default").templateType("FORM").name("生产表单").build()));
        when(formTemplateRepository.save(any(FormTemplate.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(101L, 102L, 103L);

        var response = controller.createFormTemplate(TemplateModelingRequest.builder()
                .name("生产巡检表")
                .code("FT-001")
                .categoryName("生产表单")
                .description("巡检记录")
                .versionDescription("首版说明")
                .version("V1.0")
                .effectiveFrom("2026-07-01 08:00:00")
                .effectiveTo("2027-07-01 08:00:00")
                .status("ACTIVE")
                .build());

        assertThat(response.getData().id()).isEqualTo("101");
        assertThat(response.getData().description()).isEqualTo("巡检记录");
        assertThat(response.getData().currentVersionId()).isEqualTo("102");
        assertThat(response.getData().currentVersion().version()).isEqualTo("V1.0");
        assertThat(response.getData().currentVersion().description()).isEqualTo("首版说明");
        ArgumentCaptor<FormTemplateVersion> versionCaptor = ArgumentCaptor.forClass(FormTemplateVersion.class);
        verify(formTemplateVersionRepository).save(versionCaptor.capture());
        assertThat(versionCaptor.getValue().getDescription()).isEqualTo("首版说明");
        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        AuditEvent event = auditCaptor.getValue();
        assertThat(event.getEntityType()).isEqualTo("FORM_TEMPLATE");
        assertThat(event.getMenuName()).isEqualTo("模板建模 · 表单模板");
        assertThat(event.getFunctionName()).isEqualTo("新增表单模板");
        assertThat(objectMapper.readTree(event.getContentAfter()).get("templateCategory").asText()).isEqualTo("生产表单");
        assertThat(objectMapper.readTree(event.getContentAfter()).get("currentVersion").asText()).isEqualTo("V1.0");
        assertThat(objectMapper.readTree(event.getContentAfter()).get("effectiveFrom").asText()).isEqualTo("2026-07-01 08:00:00");
    }

    @Test
    void listFormTemplatesReturnsCompleteVersionRows() {
        FormTemplate template = FormTemplate.builder()
                .id(101L)
                .tenantId("default")
                .code("FT-001")
                .name("生产巡检表")
                .currentVersionId(202L)
                .status("ACTIVE")
                .build();
        FormTemplateVersion current = FormTemplateVersion.builder()
                .id(202L)
                .tenantId("default")
                .templateId(101L)
                .version("V2.0")
                .status("ACTIVE")
                .build();
        FormTemplateVersion history = FormTemplateVersion.builder()
                .id(201L)
                .tenantId("default")
                .templateId(101L)
                .version("V1.0")
                .status("DISABLED")
                .build();
        when(formTemplateRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(template)));
        when(formTemplateVersionRepository.findByIdAndTemplateId(202L, 101L)).thenReturn(Optional.of(current));
        when(formTemplateVersionRepository.findByTemplateIdOrderByCreatedAtDesc(101L)).thenReturn(List.of(current, history));

        var response = controller.listFormTemplates(null, null, null, null, null, 1, 20, "createdAt", "desc");

        assertThat(response.getData().getContent()).hasSize(1);
        TemplateModelingController.FormTemplateResponse record = response.getData().getContent().getFirst();
        assertThat(record.currentVersion().version()).isEqualTo("V2.0");
        assertThat(record.versions())
                .extracting(TemplateModelingController.TemplateVersionResponse::version)
                .containsExactly("V2.0", "V1.0");
    }

    @Test
    void createFormTemplateVersionDoesNotReplaceCurrentTemplateVersion() {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder()
                .id(101L)
                .tenantId("default")
                .code("FT-001")
                .name("生产巡检表")
                .currentVersionId(102L)
                .build();
        FormTemplateVersion current = FormTemplateVersion.builder()
                .id(102L)
                .tenantId("default")
                .templateId(101L)
                .version("V1.0")
                .isCurrent(true)
                .build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByTemplateIdOrderByCreatedAtDesc(101L)).thenReturn(List.of(current));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(201L, 202L);

        var response = controller.createFormTemplateVersion(101L, TemplateModelingRequest.builder()
                .version("V2.0")
                .versionDescription("新增子版本")
                .effectiveFrom("2026-08-01 08:00:00")
                .status("ACTIVE")
                .build());

        assertThat(response.getData().id()).isEqualTo("201");
        assertThat(response.getData().version()).isEqualTo("V2.0");
        assertThat(response.getData().status()).isEqualTo("ACTIVE");
        assertThat(template.getCurrentVersionId()).isEqualTo(102L);
        assertThat(current.getIsCurrent()).isTrue();
        ArgumentCaptor<FormTemplateVersion> versionCaptor = ArgumentCaptor.forClass(FormTemplateVersion.class);
        verify(formTemplateVersionRepository).save(versionCaptor.capture());
        assertThat(versionCaptor.getValue().getIsCurrent()).isFalse();
        verify(formTemplateRepository, never()).save(any(FormTemplate.class));
    }

    @Test
    void saveFormTemplateVersionDesignUpdatesDesignJson() {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder()
                .id(101L)
                .tenantId("default")
                .code("FT-001")
                .name("生产巡检表")
                .currentVersionId(202L)
                .build();
        FormTemplateVersion version = FormTemplateVersion.builder()
                .id(202L)
                .tenantId("default")
                .templateId(101L)
                .version("V1.0")
                .modelDesignJson("{\"fields\":[]}")
                .canvasDesignJson("{\"pages\":[]}")
                .workflowDesignJson("{\"nodes\":[]}")
                .isCurrent(true)
                .build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(202L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.saveFormTemplateVersionDesign(101L, 202L, TemplateModelingRequest.builder()
                .modelDesignJson("{\"fields\":[{\"id\":\"f1\"}]}")
                .canvasDesignJson("{\"pages\":[{\"id\":\"p1\"}]}")
                .workflowDesignJson("{\"nodes\":[{\"id\":\"n1\"}]}")
                .build());

        assertThat(response.getData().modelDesignJson()).contains("\"f1\"");
        assertThat(response.getData().canvasDesignJson()).contains("\"p1\"");
        assertThat(response.getData().workflowDesignJson()).contains("\"n1\"");
        verify(formTemplateVersionRepository).save(version);
        verify(auditEventRepository).save(any(AuditEvent.class));
    }

    @Test
    void createFormTemplateVersionRejectsEndBeforeStart() {
        FormTemplate template = FormTemplate.builder()
                .id(101L)
                .tenantId("default")
                .code("FT-001")
                .name("生产巡检表")
                .currentVersionId(102L)
                .build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));

        assertThatThrownBy(() -> controller.createFormTemplateVersion(101L, TemplateModelingRequest.builder()
                .version("V2.0")
                .effectiveFrom("2026-08-02 00:00:00")
                .effectiveTo("2026-08-01 00:00:00")
                .status("ACTIVE")
                .build()))
                .hasMessageContaining("失效时间不能早于生效时间");
        verify(formTemplateVersionRepository, never()).save(any(FormTemplateVersion.class));
    }

    @Test
    void deleteFormTemplateVersionRemovesChildVersionWithoutDeletingTemplate() {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder()
                .id(101L)
                .tenantId("default")
                .code("FT-001")
                .name("生产巡检表")
                .currentVersionId(102L)
                .build();
        FormTemplateVersion current = FormTemplateVersion.builder()
                .id(102L)
                .tenantId("default")
                .templateId(101L)
                .version("V1.0")
                .isCurrent(true)
                .build();
        FormTemplateVersion child = FormTemplateVersion.builder()
                .id(201L)
                .tenantId("default")
                .templateId(101L)
                .version("V2.0")
                .isCurrent(false)
                .build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByTemplateIdOrderByCreatedAtDesc(101L)).thenReturn(List.of(child, current));
        when(idGenerator.nextId()).thenReturn(301L);

        controller.deleteFormTemplateVersion(101L, 201L);

        verify(formTemplateVersionRepository).delete(child);
        verify(formTemplateRepository, never()).deleteById(101L);
        verify(formTemplateRepository, never()).save(any(FormTemplate.class));
        assertThat(template.getCurrentVersionId()).isEqualTo(102L);
        assertThat(current.getIsCurrent()).isTrue();
    }

    @Test
    void deleteFormTemplateVersionRejectsOnlyRemainingVersion() {
        FormTemplate template = FormTemplate.builder()
                .id(101L)
                .tenantId("default")
                .currentVersionId(102L)
                .build();
        FormTemplateVersion current = FormTemplateVersion.builder()
                .id(102L)
                .tenantId("default")
                .templateId(101L)
                .version("V1.0")
                .isCurrent(true)
                .build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByTemplateIdOrderByCreatedAtDesc(101L)).thenReturn(List.of(current));

        assertThatThrownBy(() -> controller.deleteFormTemplateVersion(101L, 102L))
                .hasMessageContaining("至少保留一个版本");
    }

    @Test
    void deleteFormTemplateDeletesVersionsBeforeTemplateAndWritesAuditSnapshot() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder()
                .id(101L)
                .tenantId("default")
                .code("FT-001")
                .name("生产巡检表")
                .categoryName("生产表单")
                .currentVersionId(202L)
                .status("ACTIVE")
                .build();
        FormTemplateVersion current = FormTemplateVersion.builder()
                .id(202L)
                .tenantId("default")
                .templateId(101L)
                .version("V2.0")
                .isCurrent(true)
                .build();
        FormTemplateVersion history = FormTemplateVersion.builder()
                .id(201L)
                .tenantId("default")
                .templateId(101L)
                .version("V1.0")
                .isCurrent(false)
                .build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(202L, 101L)).thenReturn(Optional.of(current));
        when(formTemplateVersionRepository.findByTemplateIdOrderByCreatedAtDesc(101L)).thenReturn(List.of(current, history));
        when(idGenerator.nextId()).thenReturn(301L);

        controller.deleteFormTemplate(101L);

        InOrder deletionOrder = inOrder(formTemplateVersionRepository, formTemplateRepository);
        deletionOrder.verify(formTemplateVersionRepository).deleteAll(List.of(current, history));
        deletionOrder.verify(formTemplateRepository).delete(template);
        verify(formTemplateRepository, never()).deleteById(101L);
        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        AuditEvent event = auditCaptor.getValue();
        assertThat(event.getEntityType()).isEqualTo("FORM_TEMPLATE");
        assertThat(event.getFunctionName()).isEqualTo("删除表单模板");
        assertThat(objectMapper.readTree(event.getContentBefore()).get("templateName").asText()).isEqualTo("生产巡检表");
        assertThat(objectMapper.readTree(event.getContentBefore()).get("currentVersion").asText()).isEqualTo("V2.0");
        assertThat(objectMapper.readTree(event.getContentAfter()).isEmpty()).isTrue();
    }

    @Test
    void updateBatchRecordTemplateWritesOnlyChangedAuditFields() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        DhrTemplate existing = DhrTemplate.builder()
                .id(201L)
                .tenantId("default")
                .code("BR-001")
                .name("旧批记录")
                .categoryName("默认")
                .status("ACTIVE")
                .createdBy("系统管理员")
                .updatedBy("系统管理员")
                .build();
        when(dhrTemplateRepository.findById(201L)).thenReturn(Optional.of(existing));
        when(dhrTemplateRepository.findByTenantIdAndCodeIgnoreCase("default", "BR-001")).thenReturn(List.of(existing));
        when(dhrTemplateRepository.save(any(DhrTemplate.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(301L);

        controller.updateBatchRecordTemplate(201L, TemplateModelingRequest.builder()
                .name("新批记录")
                .code("BR-001")
                .categoryName("默认")
                .status("ACTIVE")
                .build());

        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        AuditEvent event = auditCaptor.getValue();
        assertThat(event.getEntityType()).isEqualTo("DHR_TEMPLATE");
        assertThat(event.getMenuName()).isEqualTo("模板建模 · 批记录模板");
        assertThat(event.getFunctionName()).isEqualTo("编辑批记录模板");
        assertThat(objectMapper.readTree(event.getContentBefore()).fieldNames()).toIterable().containsExactly("templateName");
        assertThat(objectMapper.readTree(event.getContentAfter()).get("templateName").asText()).isEqualTo("新批记录");
    }
}
