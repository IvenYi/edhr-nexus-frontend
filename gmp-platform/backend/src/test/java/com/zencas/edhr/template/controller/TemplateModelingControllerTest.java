package com.zencas.edhr.template.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.template.dto.TemplateModelingRequest;
import com.zencas.edhr.template.dto.TemplateImportGridResponse;
import com.zencas.edhr.template.entity.DhrTemplate;
import com.zencas.edhr.template.entity.DhrTemplateItem;
import com.zencas.edhr.template.entity.DhrTemplateVersion;
import com.zencas.edhr.template.entity.DhrDirectory;
import com.zencas.edhr.template.entity.FormTemplate;
import com.zencas.edhr.template.entity.FormTemplateVersion;
import com.zencas.edhr.template.entity.TemplateCategory;
import com.zencas.edhr.template.repository.DhrDirectoryRepository;
import com.zencas.edhr.template.repository.DhrTemplateItemRepository;
import com.zencas.edhr.template.repository.DhrTemplateRepository;
import com.zencas.edhr.template.repository.DhrTemplateVersionRepository;
import com.zencas.edhr.template.repository.FormTemplateRepository;
import com.zencas.edhr.template.repository.FormTemplateVersionRepository;
import com.zencas.edhr.template.repository.TemplateCategoryRepository;
import com.zencas.edhr.template.service.TemplateLegacyWordImportService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TemplateModelingControllerTest {

    @Mock private FormTemplateRepository formTemplateRepository;
    @Mock private FormTemplateVersionRepository formTemplateVersionRepository;
    @Mock private DhrTemplateRepository dhrTemplateRepository;
    @Mock private DhrTemplateVersionRepository dhrTemplateVersionRepository;
    @Mock private DhrDirectoryRepository dhrDirectoryRepository;
    @Mock private DhrTemplateItemRepository dhrTemplateItemRepository;
    @Mock private TemplateCategoryRepository templateCategoryRepository;
    @Mock private AuditEventRepository auditEventRepository;
    @Mock private SnowflakeIdGenerator idGenerator;
    @Mock private TemplateLegacyWordImportService templateLegacyWordImportService;
    @InjectMocks private TemplateModelingController controller;
    @InjectMocks private DhrTemplateWorkspaceController workspaceController;

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
        assertThat(response.getData().versions()).hasSize(1);
        assertThat(response.getData().versions().getFirst().version()).isEqualTo("V1.0");
        assertThat(response.getData().versions().getFirst().description()).isEqualTo("首版说明");
        ArgumentCaptor<FormTemplateVersion> versionCaptor = ArgumentCaptor.forClass(FormTemplateVersion.class);
        verify(formTemplateVersionRepository).save(versionCaptor.capture());
        assertThat(versionCaptor.getValue().getDescription()).isEqualTo("首版说明");
        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository, times(2)).save(auditCaptor.capture());
        AuditEvent event = auditCaptor.getAllValues().getFirst();
        assertThat(event.getEntityType()).isEqualTo("FORM_TEMPLATE");
        assertThat(event.getMenuName()).isEqualTo("模板建模 · 表单模板");
        assertThat(event.getFunctionName()).isEqualTo("新增表单模板");
        assertThat(objectMapper.readTree(event.getContentAfter()).get("templateCategory").asText()).isEqualTo("生产表单");
        AuditEvent versionEvent = auditCaptor.getAllValues().get(1);
        assertThat(objectMapper.readTree(versionEvent.getContentAfter()).get("version").asText()).isEqualTo("V1.0");
        assertThat(objectMapper.readTree(versionEvent.getContentAfter()).get("effectiveFrom").asText()).isEqualTo("2026-07-01 08:00:00");
    }

    @Test
    void importLegacyWordTemplateDelegatesToService() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "sample.doc", "application/msword", "doc".getBytes());
        TemplateImportGridResponse expected = new TemplateImportGridResponse(
                "portrait",
                "paper",
                "free",
                new TemplateImportGridResponse.Grid(List.of(36), List.of(98), Map.of(), List.of())
        );
        when(templateLegacyWordImportService.importDoc(file)).thenReturn(expected);

        var response = controller.importLegacyWordTemplate(file);

        assertThat(response.getData()).isEqualTo(expected);
        verify(templateLegacyWordImportService).importDoc(file);
    }

    @Test
    void listFormTemplatesReturnsCompleteVersionRows() {
        FormTemplate template = FormTemplate.builder()
                .id(101L)
                .tenantId("default")
                .code("FT-001")
                .name("生产巡检表")
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
        when(formTemplateVersionRepository.findByTemplateIdOrderByCreatedAtDesc(101L)).thenReturn(List.of(current, history));

        var response = controller.listFormTemplates(null, null, null, null, null, 1, 20, "createdAt", "desc");

        assertThat(response.getData().getContent()).hasSize(1);
        TemplateModelingController.FormTemplateResponse record = response.getData().getContent().getFirst();
        assertThat(record.versions())
                .extracting(TemplateModelingController.TemplateVersionResponse::version)
                .containsExactly("V2.0", "V1.0");
    }

    @Test
    void createFormTemplateVersionCreatesAnIndependentChildVersion() {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder()
                .id(101L)
                .tenantId("default")
                .code("FT-001")
                .name("生产巡检表")
                .build();
        FormTemplateVersion current = FormTemplateVersion.builder()
                .id(102L)
                .tenantId("default")
                .templateId(101L)
                .version("V1.0")
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
        ArgumentCaptor<FormTemplateVersion> versionCaptor = ArgumentCaptor.forClass(FormTemplateVersion.class);
        verify(formTemplateVersionRepository).save(versionCaptor.capture());
        assertThat(versionCaptor.getValue().getVersion()).isEqualTo("V2.0");
        verify(formTemplateRepository, never()).save(any(FormTemplate.class));
    }

    @Test
    void createFormTemplateVersionRejectsADuplicateVersionLabel() {
        FormTemplate template = FormTemplate.builder()
                .id(101L)
                .tenantId("default")
                .code("FT-001")
                .name("生产巡检表")
                .build();
        FormTemplateVersion existing = FormTemplateVersion.builder()
                .id(102L)
                .templateId(101L)
                .versionNumber(1)
                .version("V1.0")
                .build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByTemplateIdOrderByCreatedAtDesc(101L)).thenReturn(List.of(existing));

        assertThatThrownBy(() -> controller.createFormTemplateVersion(101L, TemplateModelingRequest.builder()
                .version("v1.0")
                .effectiveFrom("2026-08-01T08:00")
                .build()))
                .hasMessageContaining("模板版本已存在");

        verify(formTemplateVersionRepository, never()).save(any(FormTemplateVersion.class));
    }

    @Test
    void saveFormTemplateVersionDesignUpdatesDesignJson() {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder()
                .id(101L)
                .tenantId("default")
                .code("FT-001")
                .name("生产巡检表")
                .build();
        FormTemplateVersion version = FormTemplateVersion.builder()
                .id(202L)
                .tenantId("default")
                .templateId(101L)
                .version("V1.0")
                .modelDesignJson("{\"fields\":[]}")
                .canvasDesignJson("{\"pages\":[]}")
                .workflowDesignJson("{\"nodes\":[]}")
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
                .build();
        FormTemplateVersion current = FormTemplateVersion.builder()
                .id(102L)
                .tenantId("default")
                .templateId(101L)
                .version("V1.0")
                .build();
        FormTemplateVersion child = FormTemplateVersion.builder()
                .id(201L)
                .tenantId("default")
                .templateId(101L)
                .version("V2.0")
                .build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByTemplateIdOrderByCreatedAtDesc(101L)).thenReturn(List.of(child, current));
        when(idGenerator.nextId()).thenReturn(301L);

        controller.deleteFormTemplateVersion(101L, 201L);

        verify(formTemplateVersionRepository).delete(child);
        verify(formTemplateRepository, never()).deleteById(101L);
        verify(formTemplateRepository, never()).save(any(FormTemplate.class));
    }

    @Test
    void deleteFormTemplateVersionRejectsOnlyRemainingVersion() {
        FormTemplate template = FormTemplate.builder()
                .id(101L)
                .tenantId("default")
                .build();
        FormTemplateVersion current = FormTemplateVersion.builder()
                .id(102L)
                .tenantId("default")
                .templateId(101L)
                .version("V1.0")
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
                .status("ACTIVE")
                .build();
        FormTemplateVersion current = FormTemplateVersion.builder()
                .id(202L)
                .tenantId("default")
                .templateId(101L)
                .version("V2.0")
                .build();
        FormTemplateVersion history = FormTemplateVersion.builder()
                .id(201L)
                .tenantId("default")
                .templateId(101L)
                .version("V1.0")
                .build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
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

    @Test
    void createBatchRecordTemplateCreatesInitialVersion() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        when(dhrTemplateRepository.save(any(DhrTemplate.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(dhrTemplateVersionRepository.save(any(DhrTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(301L, 401L, 501L, 601L);

        var response = controller.createBatchRecordTemplate(TemplateModelingRequest.builder()
                .name("生产批记录")
                .code("DHR-001")
                .version("V1.0")
                .offlineVersion("DHR-REV-01")
                .versionDescription("初始批记录版本")
                .effectiveFrom("2026-08-01T08:00")
                .effectiveTo("2026-12-31T23:59")
                .status("ACTIVE")
                .build());

        assertThat(response.getData().versions()).hasSize(1);
        var initialVersion = response.getData().versions().getFirst();
        assertThat(initialVersion.version()).isEqualTo("V1.0");
        assertThat(initialVersion.description()).isEqualTo("初始批记录版本");
        assertThat(initialVersion.code()).isEqualTo("DHR-001");
        assertThat(initialVersion.offlineVersion()).isEqualTo("DHR-REV-01");
        assertThat(initialVersion.effectiveFrom()).isEqualTo("2026-08-01 08:00:00");
        assertThat(initialVersion.effectiveTo()).isEqualTo("2026-12-31 23:59:00");
        ArgumentCaptor<DhrTemplateVersion> versionCaptor = ArgumentCaptor.forClass(DhrTemplateVersion.class);
        verify(dhrTemplateVersionRepository).save(versionCaptor.capture());
        ArgumentCaptor<DhrTemplate> templateCaptor = ArgumentCaptor.forClass(DhrTemplate.class);
        verify(dhrTemplateRepository).save(templateCaptor.capture());
        assertThat(templateCaptor.getValue().getCode()).isNull();
        assertThat(versionCaptor.getValue().getDhrTemplateId()).isEqualTo(301L);
        assertThat(versionCaptor.getValue().getVersionNumber()).isEqualTo(1);
        assertThat(versionCaptor.getValue().getVersionLabel()).isEqualTo("V1.0");
        assertThat(versionCaptor.getValue().getCode()).isEqualTo("DHR-001");
        assertThat(versionCaptor.getValue().getOfflineVersion()).isEqualTo("DHR-REV-01");
        assertThat(versionCaptor.getValue().getDescription()).isEqualTo("初始批记录版本");
        assertThat(versionCaptor.getValue().getEffectiveFrom()).isEqualTo(LocalDateTime.of(2026, 8, 1, 8, 0));
        assertThat(versionCaptor.getValue().getEffectiveTo()).isEqualTo(LocalDateTime.of(2026, 12, 31, 23, 59));

        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository, times(2)).save(auditCaptor.capture());
        List<AuditEvent> auditEvents = auditCaptor.getAllValues();
        AuditEvent templateCreated = auditEvents.get(0);
        AuditEvent initialVersionCreated = auditEvents.get(1);
        assertThat(templateCreated.getEntityType()).isEqualTo("DHR_TEMPLATE");
        assertThat(templateCreated.getEntityId()).isEqualTo("301");
        assertThat(initialVersionCreated.getEntityType()).isEqualTo("DHR_TEMPLATE_VERSION");
        assertThat(initialVersionCreated.getEntityId()).isEqualTo("401");
        assertThat(initialVersionCreated.getFunctionName()).isEqualTo("新建初始批记录模板版本");
        assertThat(objectMapper.readTree(initialVersionCreated.getContentAfter()).get("version").asText()).isEqualTo("V1.0");
        assertThat(objectMapper.readTree(initialVersionCreated.getContentAfter()).get("directoryCount").asInt()).isZero();
        assertThat(objectMapper.readTree(initialVersionCreated.getContentAfter()).get("evidenceCount").asInt()).isZero();
    }

    @Test
    void createBatchRecordTemplateRejectsAnInvalidInitialVersionDateRangeBeforeSaving() {

        assertThatThrownBy(() -> controller.createBatchRecordTemplate(TemplateModelingRequest.builder()
                .name("生产批记录")
                .code("DHR-001")
                .effectiveFrom("2026-08-02T08:00")
                .effectiveTo("2026-08-01T08:00")
                .build()))
                .hasMessageContaining("失效时间不能早于生效时间");

        verify(dhrTemplateRepository, never()).save(any(DhrTemplate.class));
        verify(dhrTemplateVersionRepository, never()).save(any(DhrTemplateVersion.class));
    }

    @Test
    void listBatchRecordTemplatesReturnsVersionHistory() {
        DhrTemplate template = DhrTemplate.builder()
                .id(301L)
                .tenantId("default")
                .code("DHR-001")
                .name("生产批记录")
                .status("ACTIVE")
                .build();
        DhrTemplateVersion draft = DhrTemplateVersion.builder()
                .id(402L)
                .dhrTemplateId(301L)
                .versionNumber(2)
                .status("DRAFT")
                .build();
        DhrTemplateVersion active = DhrTemplateVersion.builder()
                .id(401L)
                .dhrTemplateId(301L)
                .versionNumber(1)
                .status("ACTIVE")
                .build();
        when(dhrTemplateRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(template)));
        when(dhrTemplateVersionRepository.findByDhrTemplateIdInOrderByDhrTemplateIdAscVersionNumberDesc(List.of(301L))).thenReturn(List.of(draft, active));
        when(dhrDirectoryRepository.findByVersionIdInOrderByVersionIdAscSortOrderAscIdAsc(List.of(402L, 401L))).thenReturn(List.of());

        var response = controller.listBatchRecordTemplates(null, null, null, 1, 20, "createdAt", "desc");

        assertThat(response.getData().getContent()).hasSize(1);
        var record = response.getData().getContent().getFirst();
        assertThat(record.status()).isEqualTo("ACTIVE");
        assertThat(record.versions()).extracting(TemplateModelingController.DhrTemplateVersionResponse::version)
                .containsExactly("V2.0", "V1.0");
    }

    @Test
    void listBatchRecordTemplatesDerivesVersionStatusesFromEffectiveDateRange() {
        DhrTemplate template = DhrTemplate.builder()
                .id(301L)
                .tenantId("default")
                .code("DHR-001")
                .name("生产批记录")
                .build();
        DhrTemplateVersion pending = DhrTemplateVersion.builder()
                .id(403L)
                .dhrTemplateId(301L)
                .versionNumber(3)
                .status("ACTIVE")
                .effectiveFrom(LocalDateTime.now().plusDays(1))
                .build();
        DhrTemplateVersion expired = DhrTemplateVersion.builder()
                .id(402L)
                .dhrTemplateId(301L)
                .versionNumber(2)
                .status("ACTIVE")
                .effectiveTo(LocalDateTime.now().minusSeconds(1))
                .build();
        when(dhrTemplateRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(template)));
        when(dhrTemplateVersionRepository.findByDhrTemplateIdInOrderByDhrTemplateIdAscVersionNumberDesc(List.of(301L))).thenReturn(List.of(pending, expired));
        when(dhrDirectoryRepository.findByVersionIdInOrderByVersionIdAscSortOrderAscIdAsc(List.of(403L, 402L))).thenReturn(List.of());

        var response = controller.listBatchRecordTemplates(null, null, null, 1, 20, "createdAt", "desc");

        var record = response.getData().getContent().getFirst();
        assertThat(record.status()).isEqualTo("EXPIRED");
        assertThat(record.versions())
                .extracting(TemplateModelingController.DhrTemplateVersionResponse::status)
                .containsExactly("EXPIRED", "EXPIRED");
    }

    @Test
    void createDhrTemplateVersionClonesDirectoryTreeAndEvidenceReferences() {
        AuditContext.setOperator("99", "系统管理员", "admin");
        DhrTemplate template = DhrTemplate.builder().id(301L).tenantId("default").code("DHR-001").name("生产批记录").build();
        DhrTemplateVersion source = DhrTemplateVersion.builder().id(401L).dhrTemplateId(301L).versionNumber(1).status("ACTIVE").build();
        DhrDirectory root = DhrDirectory.builder().id(501L).versionId(401L).name("生产记录").sortOrder(10).build();
        DhrDirectory child = DhrDirectory.builder().id(502L).versionId(401L).name("检验记录").parentId(501L).sortOrder(20).build();
        DhrTemplateItem evidence = DhrTemplateItem.builder().id(601L).directoryId(502L).formTemplateId(701L).formTemplateVersionId(702L).displayName("DHR 工序巡检").sortOrder(10).isRequired(true).build();
        when(dhrTemplateRepository.findById(301L)).thenReturn(Optional.of(template));
        when(dhrTemplateVersionRepository.findByDhrTemplateIdOrderByVersionNumberDesc(301L)).thenReturn(List.of(source));
        when(dhrDirectoryRepository.findByVersionIdOrderBySortOrderAscIdAsc(401L)).thenReturn(List.of(root, child));
        when(dhrTemplateItemRepository.findByDirectoryIdInOrderBySortOrderAscIdAsc(List.of(501L, 502L))).thenReturn(List.of(evidence));
        when(dhrTemplateVersionRepository.save(any(DhrTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(dhrDirectoryRepository.save(any(DhrDirectory.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(dhrTemplateItemRepository.save(any(DhrTemplateItem.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(801L, 802L, 803L, 804L, 805L);

        var response = workspaceController.createDhrTemplateVersion(301L, new DhrTemplateWorkspaceController.DhrVersionRequest(401L, "基于已启用版本复制", "2026-07-29T08:00", "2026-12-31T23:59"));

        assertThat(response.getData().version()).isEqualTo("V2.0");
        assertThat(response.getData().status()).isEqualTo("ACTIVE");
        assertThat(response.getData().description()).isEqualTo("基于已启用版本复制");
        assertThat(response.getData().effectiveFrom()).isEqualTo("2026-07-29 08:00:00");
        ArgumentCaptor<DhrDirectory> directoryCaptor = ArgumentCaptor.forClass(DhrDirectory.class);
        verify(dhrDirectoryRepository, org.mockito.Mockito.times(2)).save(directoryCaptor.capture());
        assertThat(directoryCaptor.getAllValues())
                .extracting(DhrDirectory::getParentId)
                .containsExactly(null, 802L);
        ArgumentCaptor<DhrTemplateItem> evidenceCaptor = ArgumentCaptor.forClass(DhrTemplateItem.class);
        verify(dhrTemplateItemRepository).save(evidenceCaptor.capture());
        assertThat(evidenceCaptor.getValue().getFormTemplateVersionId()).isEqualTo(702L);
        assertThat(evidenceCaptor.getValue().getDirectoryId()).isEqualTo(803L);
        assertThat(evidenceCaptor.getValue().getDisplayName()).isEqualTo("DHR 工序巡检");
    }

    @Test
    void createDhrTemplateVersionWithoutSourceStartsWithAnEmptyComposition() {
        DhrTemplate template = DhrTemplate.builder().id(301L).tenantId("default").code("DHR-001").name("生产批记录").build();
        DhrTemplateVersion existing = DhrTemplateVersion.builder().id(401L).dhrTemplateId(301L).versionNumber(1).status("ACTIVE").build();
        when(dhrTemplateRepository.findById(301L)).thenReturn(Optional.of(template));
        when(dhrTemplateVersionRepository.findByDhrTemplateIdOrderByVersionNumberDesc(301L)).thenReturn(List.of(existing));
        when(dhrTemplateVersionRepository.save(any(DhrTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(801L, 802L);

        var response = workspaceController.createDhrTemplateVersion(301L, new DhrTemplateWorkspaceController.DhrVersionRequest(null));

        assertThat(response.getData().version()).isEqualTo("V2.0");
        verify(dhrDirectoryRepository, never()).save(any(DhrDirectory.class));
        verify(dhrTemplateItemRepository, never()).save(any(DhrTemplateItem.class));
    }

    @Test
    void createDhrTemplateVersionAcceptsCustomMetadata() {
        DhrTemplate template = DhrTemplate.builder().id(301L).tenantId("default").name("生产批记录").build();
        DhrTemplateVersion existing = DhrTemplateVersion.builder().id(401L).dhrTemplateId(301L).versionNumber(1).versionLabel("V1.0").code("DHR-001").status("ACTIVE").build();
        when(dhrTemplateRepository.findById(301L)).thenReturn(Optional.of(template));
        when(dhrTemplateVersionRepository.findByDhrTemplateIdOrderByVersionNumberDesc(301L)).thenReturn(List.of(existing));
        when(dhrTemplateVersionRepository.save(any(DhrTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(801L, 802L);

        var response = workspaceController.createDhrTemplateVersion(301L,
                new DhrTemplateWorkspaceController.DhrVersionRequest(null, "V2.1", "DHR-002", "DHR-REV-02", "第二版", "2026-08-01T08:00", "2026-12-31T23:59"));

        assertThat(response.getData().version()).isEqualTo("V2.1");
        assertThat(response.getData().code()).isEqualTo("DHR-002");
        assertThat(response.getData().offlineVersion()).isEqualTo("DHR-REV-02");
        ArgumentCaptor<DhrTemplateVersion> versionCaptor = ArgumentCaptor.forClass(DhrTemplateVersion.class);
        verify(dhrTemplateVersionRepository).save(versionCaptor.capture());
        assertThat(versionCaptor.getValue().getVersionNumber()).isEqualTo(2);
        assertThat(versionCaptor.getValue().getVersionLabel()).isEqualTo("V2.1");
        assertThat(versionCaptor.getValue().getCode()).isEqualTo("DHR-002");
        assertThat(versionCaptor.getValue().getOfflineVersion()).isEqualTo("DHR-REV-02");
    }

    @Test
    void createDhrTemplateVersionRejectsDuplicateVersionLabelAndCode() {
        DhrTemplate template = DhrTemplate.builder().id(301L).tenantId("default").name("生产批记录").build();
        DhrTemplateVersion existing = DhrTemplateVersion.builder().id(401L).dhrTemplateId(301L).versionNumber(1).versionLabel("V1.0").code("DHR-001").status("ACTIVE").build();
        when(dhrTemplateRepository.findById(301L)).thenReturn(Optional.of(template));
        when(dhrTemplateVersionRepository.findByDhrTemplateIdOrderByVersionNumberDesc(301L)).thenReturn(List.of(existing));
        when(dhrTemplateVersionRepository.findByDhrTemplateIdAndVersionLabelIgnoreCase(301L, "V1.0")).thenReturn(List.of(existing));

        assertThatThrownBy(() -> workspaceController.createDhrTemplateVersion(301L,
                new DhrTemplateWorkspaceController.DhrVersionRequest(null, "V1.0", "DHR-002", null, null, null, null)))
                .hasMessageContaining("版本号已存在");

        when(dhrTemplateVersionRepository.findByDhrTemplateIdAndVersionLabelIgnoreCase(301L, "V2.0")).thenReturn(List.of());
        when(dhrTemplateVersionRepository.findByCodeIgnoreCase("DHR-001")).thenReturn(List.of(existing));

        assertThatThrownBy(() -> workspaceController.createDhrTemplateVersion(301L,
                new DhrTemplateWorkspaceController.DhrVersionRequest(null, "V2.0", "DHR-001", null, null, null, null)))
                .hasMessageContaining("模板编码已存在");
        verify(dhrTemplateVersionRepository, never()).save(any(DhrTemplateVersion.class));
    }

    @Test
    void updateDhrTemplateVersionEditsDraftMetadata() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        DhrTemplate template = DhrTemplate.builder().id(301L).tenantId("default").name("生产批记录").build();
        DhrTemplateVersion version = DhrTemplateVersion.builder()
                .id(401L).dhrTemplateId(301L).versionNumber(1).versionLabel("V1.0").code("DHR-001").offlineVersion("DHR-REV-01").status("DRAFT")
                .effectiveFrom(LocalDateTime.of(2026, 8, 1, 8, 0)).build();
        when(dhrTemplateRepository.findById(301L)).thenReturn(Optional.of(template));
        when(dhrTemplateVersionRepository.findByIdAndDhrTemplateId(401L, 301L)).thenReturn(Optional.of(version));
        when(dhrTemplateVersionRepository.findByDhrTemplateIdAndVersionLabelIgnoreCase(301L, "V1.1")).thenReturn(List.of());
        when(dhrTemplateVersionRepository.findByCodeIgnoreCase("DHR-002")).thenReturn(List.of());
        when(dhrTemplateVersionRepository.save(any(DhrTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(dhrTemplateRepository.save(any(DhrTemplate.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(801L);

        var response = workspaceController.updateDhrTemplateVersion(301L, 401L,
                new DhrTemplateWorkspaceController.DhrVersionRequest(null, "V1.1", "DHR-002", "DHR-REV-02", "修订说明", "2026-08-02T08:00", "2026-12-31T23:59"));

        assertThat(response.getData().version()).isEqualTo("V1.1");
        assertThat(response.getData().code()).isEqualTo("DHR-002");
        assertThat(response.getData().offlineVersion()).isEqualTo("DHR-REV-02");
        assertThat(response.getData().description()).isEqualTo("修订说明");
        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        assertThat(auditCaptor.getValue().getEntityType()).isEqualTo("DHR_TEMPLATE_VERSION");
        assertThat(objectMapper.readTree(auditCaptor.getValue().getContentAfter()).get("version").asText()).isEqualTo("V1.1");
    }

    @Test
    void listDhrFormOptionsReturnsParentChildRdoTreeAndMarksActiveVersionsReferenceable() {
        DhrTemplate dhrTemplate = DhrTemplate.builder().id(301L).tenantId("default").code("DHR-001").name("生产批记录").build();
        FormTemplate activeTemplate = FormTemplate.builder().id(701L).code("FORM-001").name("生产巡检表").categoryName("基础表单").status("ACTIVE").build();
        FormTemplate disabledTemplate = FormTemplate.builder().id(711L).code("FORM-002").name("历史巡检表").categoryName("基础表单").status("DISABLED").build();
        FormTemplateVersion latestVersion = FormTemplateVersion.builder().id(702L).templateId(701L).version("V2.0").status("ACTIVE").build();
        FormTemplateVersion earlierActiveVersion = FormTemplateVersion.builder().id(7011L).templateId(701L).version("V1.0").status("ACTIVE").build();
        FormTemplateVersion disabledParentVersion = FormTemplateVersion.builder()
                .id(712L)
                .templateId(711L)
                .version("V1.0")
                .effectiveTo(LocalDateTime.now().minusSeconds(1))
                .build();
        when(dhrTemplateRepository.findById(301L)).thenReturn(Optional.of(dhrTemplate));
        when(formTemplateRepository.findAll()).thenReturn(List.of(activeTemplate, disabledTemplate));
        when(formTemplateVersionRepository.findByTemplateIdOrderByCreatedAtDesc(701L)).thenReturn(List.of(latestVersion, earlierActiveVersion));
        when(formTemplateVersionRepository.findByTemplateIdOrderByCreatedAtDesc(711L)).thenReturn(List.of(disabledParentVersion));

        var response = workspaceController.listFormOptions(301L);

        assertThat(response.getData()).hasSize(2);
        var activeOption = response.getData().stream().filter(option -> option.templateId().equals("701")).findFirst().orElseThrow();
        assertThat(activeOption.categoryName()).isEqualTo("基础表单");
        assertThat(activeOption.versions()).extracting(DhrTemplateWorkspaceController.DhrFormTemplateVersionOption::version)
                .containsExactly("V2.0", "V1.0");
        assertThat(activeOption.versions()).filteredOn(DhrTemplateWorkspaceController.DhrFormTemplateVersionOption::referenceable)
                .extracting(DhrTemplateWorkspaceController.DhrFormTemplateVersionOption::version)
                .containsExactly("V2.0", "V1.0");
        var disabledOption = response.getData().stream().filter(option -> option.templateId().equals("711")).findFirst().orElseThrow();
        assertThat(disabledOption.versions()).allMatch(version -> !version.referenceable());
    }

    @Test
    void createDhrTemplateVersionRejectsAnInvalidEffectiveDateRange() {
        DhrTemplate template = DhrTemplate.builder().id(301L).tenantId("default").code("DHR-001").name("生产批记录").build();
        when(dhrTemplateRepository.findById(301L)).thenReturn(Optional.of(template));

        assertThatThrownBy(() -> workspaceController.createDhrTemplateVersion(301L, new DhrTemplateWorkspaceController.DhrVersionRequest(null, null, "2026-07-30T08:00", "2026-07-29T08:00")))
                .hasMessageContaining("失效时间不能早于生效时间");
    }

    @Test
    void publishDhrTemplateVersionSnapshotsCompositionWithoutSelectingACurrentVersion() {
        DhrTemplate template = DhrTemplate.builder().id(301L).tenantId("default").code("DHR-001").name("生产批记录").build();
        DhrTemplateVersion futureVersion = DhrTemplateVersion.builder()
                .id(402L)
                .dhrTemplateId(301L)
                .versionNumber(2)
                .status("DRAFT")
                .effectiveFrom(LocalDateTime.now().plusDays(1))
                .build();
        DhrTemplateVersion existingVersion = DhrTemplateVersion.builder()
                .id(401L)
                .dhrTemplateId(301L)
                .versionNumber(1)
                .status("ACTIVE")
                .effectiveFrom(LocalDateTime.now().minusDays(1))
                .build();
        DhrDirectory directory = DhrDirectory.builder().id(501L).versionId(402L).name("生产记录").sortOrder(10).build();
        DhrTemplateItem evidence = DhrTemplateItem.builder().id(601L).directoryId(501L).formTemplateId(701L).formTemplateVersionId(702L).sortOrder(10).isRequired(true).build();
        FormTemplate formTemplate = FormTemplate.builder().id(701L).code("FORM-001").name("生产巡检表").status("ACTIVE").build();
        FormTemplateVersion formVersion = FormTemplateVersion.builder().id(702L).templateId(701L).version("V1.0").status("ACTIVE").build();
        when(dhrTemplateRepository.findById(301L)).thenReturn(Optional.of(template));
        when(dhrTemplateVersionRepository.findByIdAndDhrTemplateId(402L, 301L)).thenReturn(Optional.of(futureVersion));
        when(dhrDirectoryRepository.findByVersionIdOrderBySortOrderAscIdAsc(402L)).thenReturn(List.of(directory));
        when(dhrTemplateItemRepository.findByDirectoryIdInOrderBySortOrderAscIdAsc(List.of(501L))).thenReturn(List.of(evidence));
        when(formTemplateRepository.findAllById(any())).thenReturn(List.of(formTemplate));
        when(formTemplateVersionRepository.findAllById(any())).thenReturn(List.of(formVersion));
        when(dhrTemplateVersionRepository.save(any(DhrTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(dhrTemplateRepository.save(any(DhrTemplate.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(801L);

        var response = workspaceController.publishDhrTemplateVersion(301L, 402L);

        assertThat(response.getData().status()).isEqualTo("EXPIRED");
        assertThat(futureVersion.getDirectorySnapshot()).isNotBlank();
        assertThat(existingVersion.getDirectorySnapshot()).isNull();
        verify(dhrTemplateVersionRepository, never()).saveAll(any());
    }

    @Test
    void deleteDhrTemplateVersionAllowsDeletingAnActiveVersion() {
        DhrTemplate template = DhrTemplate.builder().id(301L).tenantId("default").code("DHR-001").name("生产批记录").build();
        DhrTemplateVersion draft = DhrTemplateVersion.builder().id(402L).dhrTemplateId(301L).versionNumber(2).status("DRAFT").build();
        DhrTemplateVersion active = DhrTemplateVersion.builder().id(401L).dhrTemplateId(301L).versionNumber(1).status("ACTIVE").build();
        when(dhrTemplateRepository.findById(301L)).thenReturn(Optional.of(template));
        when(dhrTemplateVersionRepository.findByDhrTemplateIdOrderByVersionNumberDesc(301L)).thenReturn(List.of(draft, active));
        when(dhrTemplateVersionRepository.findByIdAndDhrTemplateId(401L, 301L)).thenReturn(Optional.of(active));
        when(dhrDirectoryRepository.findByVersionIdOrderBySortOrderAscIdAsc(401L)).thenReturn(List.of());

        workspaceController.deleteDhrTemplateVersion(301L, 401L);

        verify(dhrTemplateVersionRepository).delete(active);
    }

    @Test
    void saveDhrTemplateCompositionRejectsNewInactiveReferencesBeforeRemovingExistingRecords() {
        DhrTemplate template = DhrTemplate.builder().id(301L).tenantId("default").name("生产批记录").build();
        DhrTemplateVersion draft = DhrTemplateVersion.builder().id(401L).dhrTemplateId(301L).versionNumber(1).status("DRAFT").build();
        FormTemplate formTemplate = FormTemplate.builder().id(701L).name("生产巡检表").status("ACTIVE").build();
        FormTemplateVersion inactiveFormVersion = FormTemplateVersion.builder()
                .id(702L)
                .templateId(701L)
                .version("V1.0")
                .effectiveFrom(LocalDateTime.now().plusDays(1))
                .build();
        when(dhrTemplateRepository.findById(301L)).thenReturn(Optional.of(template));
        when(dhrTemplateVersionRepository.findByIdAndDhrTemplateId(401L, 301L)).thenReturn(Optional.of(draft));
        when(formTemplateVersionRepository.findById(702L)).thenReturn(Optional.of(inactiveFormVersion));
        when(formTemplateRepository.findById(701L)).thenReturn(Optional.of(formTemplate));

        var request = new DhrTemplateWorkspaceController.DhrCompositionRequest(
                List.of(new DhrTemplateWorkspaceController.DhrCompositionDirectoryRequest("directory-a", null, "生产记录", 10)),
                List.of(new DhrTemplateWorkspaceController.DhrCompositionItemRequest("directory-a", 702L, null, true, 10)));

        assertThatThrownBy(() -> workspaceController.saveDhrTemplateComposition(301L, 401L, request))
                .hasMessageContaining("仅能引用生效中的表单模板版本");

        verify(dhrTemplateItemRepository, never()).deleteAll(any());
        verify(dhrDirectoryRepository, never()).deleteAll(any());
    }

    @Test
    void saveDhrTemplateCompositionKeepsAnExistingInactiveReferenceInItsOriginalDirectory() {
        DhrTemplate template = DhrTemplate.builder().id(301L).tenantId("default").name("生产批记录").build();
        DhrTemplateVersion dhrVersion = DhrTemplateVersion.builder().id(401L).dhrTemplateId(301L).versionNumber(1).build();
        DhrDirectory directory = DhrDirectory.builder().id(501L).versionId(401L).name("生产记录").build();
        DhrTemplateItem item = DhrTemplateItem.builder().id(601L).directoryId(501L).formTemplateId(701L).formTemplateVersionId(702L).build();
        FormTemplate formTemplate = FormTemplate.builder().id(701L).name("生产巡检表").build();
        FormTemplateVersion inactiveFormVersion = FormTemplateVersion.builder()
                .id(702L)
                .templateId(701L)
                .version("V1.0")
                .effectiveTo(LocalDateTime.now().minusSeconds(1))
                .build();
        when(dhrTemplateRepository.findById(301L)).thenReturn(Optional.of(template));
        when(dhrTemplateVersionRepository.findByIdAndDhrTemplateId(401L, 301L)).thenReturn(Optional.of(dhrVersion));
        when(dhrDirectoryRepository.findByVersionIdOrderBySortOrderAscIdAsc(401L)).thenReturn(List.of(directory));
        when(dhrTemplateItemRepository.findByDirectoryIdInOrderBySortOrderAscIdAsc(List.of(501L))).thenReturn(List.of(item));
        when(formTemplateVersionRepository.findById(702L)).thenReturn(Optional.of(inactiveFormVersion));
        when(formTemplateRepository.findById(701L)).thenReturn(Optional.of(formTemplate));
        when(dhrDirectoryRepository.save(any(DhrDirectory.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(dhrTemplateItemRepository.save(any(DhrTemplateItem.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(801L, 802L);

        workspaceController.saveDhrTemplateComposition(301L, 401L,
                new DhrTemplateWorkspaceController.DhrCompositionRequest(
                        List.of(new DhrTemplateWorkspaceController.DhrCompositionDirectoryRequest("501", null, "生产记录", 10)),
                        List.of(new DhrTemplateWorkspaceController.DhrCompositionItemRequest("501", 702L, null, true, 10))));

        ArgumentCaptor<DhrTemplateItem> itemCaptor = ArgumentCaptor.forClass(DhrTemplateItem.class);
        verify(dhrTemplateItemRepository).save(itemCaptor.capture());
        assertThat(itemCaptor.getValue().getFormTemplateVersionId()).isEqualTo(702L);
    }

    @Test
    void updateCategoryRejectsCategoryFromAnotherTemplateType() {
        TemplateCategory formCategory = TemplateCategory.builder()
                .id(11L)
                .tenantId("default")
                .templateType("FORM")
                .name("生产表单")
                .build();
        when(templateCategoryRepository.findByIdAndTenantIdAndTemplateType(11L, "default", "DHR")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> controller.updateCategory(
                "batch-record-templates", 11L, new TemplateModelingController.TemplateCategoryRequest("生产批记录")))
                .hasMessageContaining("模板分类不存在");

        verify(templateCategoryRepository, never()).save(any(TemplateCategory.class));
    }

    @Test
    void deleteCategoryRejectsCategoryFromAnotherTemplateType() {
        TemplateCategory formCategory = TemplateCategory.builder()
                .id(11L)
                .tenantId("default")
                .templateType("FORM")
                .name("生产表单")
                .build();
        when(templateCategoryRepository.findByIdAndTenantIdAndTemplateType(11L, "default", "DHR")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> controller.deleteCategory("batch-record-templates", 11L))
                .hasMessageContaining("模板分类不存在");

        verify(templateCategoryRepository, never()).deleteById(11L);
    }

    @Test
    void reorderCategoriesWritesAnAuditEventWhenOrderChanges() {
        TemplateCategory first = TemplateCategory.builder().id(11L).tenantId("default").templateType("DHR").name("默认").sortOrder(10).build();
        TemplateCategory second = TemplateCategory.builder().id(22L).tenantId("default").templateType("DHR").name("验证").sortOrder(20).build();
        when(templateCategoryRepository.findByTenantIdAndTemplateTypeOrderBySortOrderAscNameAsc("default", "DHR")).thenReturn(List.of(first, second));
        when(dhrTemplateRepository.findAll()).thenReturn(List.of());
        when(templateCategoryRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        controller.reorderCategories("batch-record-templates",
                new TemplateModelingController.TemplateCategoryOrderRequest(List.of("22", "11")));

        verify(auditEventRepository, times(2)).save(any(AuditEvent.class));
    }

    @Test
    void dhrDirectorySnapshotUsesJsonJdbcBinding() throws Exception {
        JdbcTypeCode jdbcTypeCode = DhrTemplateVersion.class
                .getDeclaredField("directorySnapshot")
                .getAnnotation(JdbcTypeCode.class);

        assertThat(jdbcTypeCode).isNotNull();
        assertThat(jdbcTypeCode.value()).isEqualTo(SqlTypes.JSON);
    }

    @Test
    void batchRecordTemplateIdSerializesAsAStringToPreserveSnowflakePrecision() throws Exception {
        DhrTemplate template = DhrTemplate.builder()
                .id(357602945757958144L)
                .code("DHR-001")
                .name("生产批记录")
                .build();

        var serialized = objectMapper.readTree(objectMapper.writeValueAsString(template));

        assertThat(serialized.get("id").isTextual()).isTrue();
        assertThat(serialized.get("id").asText()).isEqualTo("357602945757958144");
    }

    @Test
    void addDhrDirectoryAllowsEditingAnActiveVersion() {
        DhrTemplate template = DhrTemplate.builder().id(301L).tenantId("default").code("DHR-001").name("生产批记录").build();
        DhrTemplateVersion version = DhrTemplateVersion.builder().id(401L).dhrTemplateId(301L).versionNumber(1).status("ACTIVE").build();
        when(dhrTemplateRepository.findById(301L)).thenReturn(Optional.of(template));
        when(dhrTemplateVersionRepository.findByIdAndDhrTemplateId(401L, 301L)).thenReturn(Optional.of(version));
        when(dhrDirectoryRepository.save(any(DhrDirectory.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(501L, 502L);

        workspaceController.createDhrDirectory(301L, 401L, new DhrTemplateWorkspaceController.DhrDirectoryRequest("生产记录", null));

        verify(dhrDirectoryRepository).save(any(DhrDirectory.class));
    }

    @Test
    void addDhrEvidenceRejectsAnInactiveFormTemplateVersion() {
        DhrTemplate template = DhrTemplate.builder().id(301L).tenantId("default").code("DHR-001").name("生产批记录").build();
        DhrTemplateVersion dhrVersion = DhrTemplateVersion.builder().id(401L).dhrTemplateId(301L).versionNumber(1).status("DRAFT").build();
        DhrDirectory directory = DhrDirectory.builder().id(501L).versionId(401L).name("生产记录").build();
        FormTemplateVersion formVersion = FormTemplateVersion.builder()
                .id(702L)
                .templateId(701L)
                .version("V1.0")
                .effectiveFrom(LocalDateTime.now().plusDays(1))
                .build();
        FormTemplate formTemplate = FormTemplate.builder().id(701L).code("FORM-001").name("生产巡检表").status("ACTIVE").build();
        when(dhrTemplateRepository.findById(301L)).thenReturn(Optional.of(template));
        when(dhrTemplateVersionRepository.findByIdAndDhrTemplateId(401L, 301L)).thenReturn(Optional.of(dhrVersion));
        when(dhrDirectoryRepository.findById(501L)).thenReturn(Optional.of(directory));
        when(formTemplateVersionRepository.findById(702L)).thenReturn(Optional.of(formVersion));
        when(formTemplateRepository.findById(701L)).thenReturn(Optional.of(formTemplate));

        assertThatThrownBy(() -> workspaceController.createDhrEvidenceItem(301L, 401L, 501L,
                new DhrTemplateWorkspaceController.DhrEvidenceItemRequest(702L, true)))
                .hasMessageContaining("仅能引用生效中的表单模板版本");

        verify(dhrTemplateItemRepository, never()).save(any(DhrTemplateItem.class));
    }

    @Test
    void addDhrEvidenceRejectsSameFormTemplateInSameDirectory() {
        DhrTemplate template = DhrTemplate.builder().id(301L).tenantId("default").code("DHR-001").name("生产批记录").build();
        DhrTemplateVersion dhrVersion = DhrTemplateVersion.builder().id(401L).dhrTemplateId(301L).versionNumber(1).status("DRAFT").build();
        DhrDirectory directory = DhrDirectory.builder().id(501L).versionId(401L).name("生产记录").build();
        FormTemplateVersion formVersion = FormTemplateVersion.builder().id(702L).templateId(701L).version("V1.0").status("ACTIVE").build();
        FormTemplate formTemplate = FormTemplate.builder().id(701L).code("FORM-001").name("生产巡检表").status("ACTIVE").build();
        when(dhrTemplateRepository.findById(301L)).thenReturn(Optional.of(template));
        when(dhrTemplateVersionRepository.findByIdAndDhrTemplateId(401L, 301L)).thenReturn(Optional.of(dhrVersion));
        when(dhrDirectoryRepository.findById(501L)).thenReturn(Optional.of(directory));
        when(formTemplateVersionRepository.findById(702L)).thenReturn(Optional.of(formVersion));
        when(formTemplateRepository.findById(701L)).thenReturn(Optional.of(formTemplate));
        when(dhrTemplateItemRepository.existsByDirectoryIdAndFormTemplateId(501L, 701L)).thenReturn(true);

        assertThatThrownBy(() -> workspaceController.createDhrEvidenceItem(301L, 401L, 501L,
                new DhrTemplateWorkspaceController.DhrEvidenceItemRequest(702L, true)))
                .hasMessageContaining("该目录已引用此表单模板");

        verify(dhrTemplateItemRepository, never()).save(any(DhrTemplateItem.class));
    }

    @Test
    void updateDhrEvidenceDisplayNameKeepsSourceFormNameAndAuditsTheDhrSpecificName() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        DhrTemplate template = DhrTemplate.builder().id(301L).tenantId("default").code("DHR-001").name("生产批记录").build();
        DhrTemplateVersion dhrVersion = DhrTemplateVersion.builder().id(401L).dhrTemplateId(301L).versionNumber(1).status("DRAFT").build();
        DhrDirectory directory = DhrDirectory.builder().id(501L).versionId(401L).name("生产记录").build();
        DhrTemplateItem evidence = DhrTemplateItem.builder().id(601L).directoryId(501L).formTemplateId(701L).formTemplateVersionId(702L).sortOrder(10).isRequired(true).build();
        FormTemplate sourceForm = FormTemplate.builder().id(701L).code("FORM-001").name("生产巡检表").status("ACTIVE").build();
        FormTemplateVersion sourceFormVersion = FormTemplateVersion.builder().id(702L).templateId(701L).version("V1.0").status("ACTIVE").build();
        when(dhrTemplateRepository.findById(301L)).thenReturn(Optional.of(template));
        when(dhrTemplateVersionRepository.findByIdAndDhrTemplateId(401L, 301L)).thenReturn(Optional.of(dhrVersion));
        when(dhrTemplateItemRepository.findById(601L)).thenReturn(Optional.of(evidence));
        when(dhrDirectoryRepository.findById(501L)).thenReturn(Optional.of(directory));
        when(dhrTemplateItemRepository.save(any(DhrTemplateItem.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(dhrTemplateRepository.save(any(DhrTemplate.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateRepository.findById(701L)).thenReturn(Optional.of(sourceForm));
        when(formTemplateVersionRepository.findById(702L)).thenReturn(Optional.of(sourceFormVersion));
        when(formTemplateRepository.findAllById(any())).thenReturn(List.of(sourceForm));
        when(formTemplateVersionRepository.findAllById(any())).thenReturn(List.of(sourceFormVersion));
        when(idGenerator.nextId()).thenReturn(901L);

        var response = workspaceController.updateDhrEvidenceItem(301L, 401L, 601L,
                new DhrTemplateWorkspaceController.DhrEvidenceItemUpdateRequest(null, "DHR 首工巡检"));

        assertThat(response.getData().displayName()).isEqualTo("DHR 首工巡检");
        assertThat(response.getData().formName()).isEqualTo("生产巡检表");
        assertThat(sourceForm.getName()).isEqualTo("生产巡检表");
        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository, times(2)).save(auditCaptor.capture());
        List<AuditEvent> events = auditCaptor.getAllValues();
        AuditEvent itemAudit = events.get(0);
        AuditEvent versionActivityAudit = events.get(1);
        assertThat(itemAudit.getEntityType()).isEqualTo("DHR_TEMPLATE_ITEM");
        assertThat(objectMapper.readTree(itemAudit.getContentAfter()).get("displayName").asText()).isEqualTo("DHR 首工巡检");
        assertThat(versionActivityAudit.getEntityType()).isEqualTo("DHR_TEMPLATE_VERSION");
        assertThat(versionActivityAudit.getEntityId()).isEqualTo("401");
        assertThat(objectMapper.readTree(versionActivityAudit.getContentAfter()).get("modelingChange").get("details").get("formName").asText()).isEqualTo("生产巡检表");
        assertThat(objectMapper.readTree(versionActivityAudit.getContentAfter()).get("modelingChange").get("details").get("formVersion").asText()).isEqualTo("V1.0");
    }

    @Test
    void publishDhrTemplateVersionStoresEvidenceIdentityInFrozenSnapshot() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        DhrTemplate template = DhrTemplate.builder().id(301L).tenantId("default").code("DHR-001").name("生产批记录").build();
        DhrTemplateVersion dhrVersion = DhrTemplateVersion.builder().id(401L).dhrTemplateId(301L).versionNumber(1).status("DRAFT").build();
        DhrDirectory directory = DhrDirectory.builder().id(501L).versionId(401L).name("生产记录").sortOrder(10).build();
        DhrTemplateItem evidence = DhrTemplateItem.builder().id(601L).directoryId(501L).formTemplateId(701L).formTemplateVersionId(702L).displayName("DHR 成品巡检").sortOrder(10).isRequired(true).build();
        FormTemplate formTemplate = FormTemplate.builder().id(701L).code("FORM-001").name("生产巡检表").status("ACTIVE").build();
        FormTemplateVersion formVersion = FormTemplateVersion.builder().id(702L).templateId(701L).version("V2.0").status("ACTIVE").build();
        when(dhrTemplateRepository.findById(301L)).thenReturn(Optional.of(template));
        when(dhrTemplateVersionRepository.findByIdAndDhrTemplateId(401L, 301L)).thenReturn(Optional.of(dhrVersion));
        when(dhrDirectoryRepository.findByVersionIdOrderBySortOrderAscIdAsc(401L)).thenReturn(List.of(directory));
        when(dhrTemplateItemRepository.findByDirectoryIdInOrderBySortOrderAscIdAsc(List.of(501L))).thenReturn(List.of(evidence));
        when(formTemplateRepository.findAllById(any())).thenReturn(List.of(formTemplate));
        when(formTemplateVersionRepository.findAllById(any())).thenReturn(List.of(formVersion));
        when(dhrTemplateVersionRepository.save(any(DhrTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(dhrTemplateRepository.save(any(DhrTemplate.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(801L);

        workspaceController.publishDhrTemplateVersion(301L, 401L);

        ArgumentCaptor<DhrTemplateVersion> versionCaptor = ArgumentCaptor.forClass(DhrTemplateVersion.class);
        verify(dhrTemplateVersionRepository).save(versionCaptor.capture());
        var evidenceSnapshot = objectMapper.readTree(versionCaptor.getValue().getDirectorySnapshot())
                .get("directories").get(0).get("items").get(0);
        assertThat(evidenceSnapshot.get("formCode").asText()).isEqualTo("FORM-001");
        assertThat(evidenceSnapshot.get("formName").asText()).isEqualTo("生产巡检表");
        assertThat(evidenceSnapshot.get("formVersion").asText()).isEqualTo("V2.0");
        assertThat(evidenceSnapshot.get("displayName").asText()).isEqualTo("DHR 成品巡检");
    }

    @Test
    void deleteBatchRecordTemplateAllowsDeletingAnActiveVersion() {
        DhrTemplate template = DhrTemplate.builder().id(301L).tenantId("default").code("DHR-001").name("生产批记录").build();
        DhrTemplateVersion activeVersion = DhrTemplateVersion.builder().id(401L).dhrTemplateId(301L).versionNumber(1).status("ACTIVE").build();
        when(dhrTemplateRepository.findById(301L)).thenReturn(Optional.of(template));
        when(dhrTemplateVersionRepository.findByDhrTemplateIdOrderByVersionNumberDesc(301L)).thenReturn(List.of(activeVersion));
        when(dhrDirectoryRepository.findByVersionIdOrderBySortOrderAscIdAsc(401L)).thenReturn(List.of());

        controller.deleteBatchRecordTemplate(301L);

        verify(dhrTemplateRepository).delete(template);
    }

    @Test
    void deleteBatchRecordTemplateRemovesDhrWorkspaceRecordsBeforeTemplate() {
        DhrTemplate template = DhrTemplate.builder().id(301L).tenantId("default").code("DHR-001").name("生产批记录").build();
        DhrTemplateVersion version = DhrTemplateVersion.builder().id(401L).dhrTemplateId(301L).versionNumber(1).build();
        DhrDirectory directory = DhrDirectory.builder().id(501L).versionId(401L).name("生产记录").build();
        DhrTemplateItem item = DhrTemplateItem.builder().id(601L).directoryId(501L).formTemplateId(701L).build();
        when(dhrTemplateRepository.findById(301L)).thenReturn(Optional.of(template));
        when(dhrTemplateVersionRepository.findByDhrTemplateIdOrderByVersionNumberDesc(301L)).thenReturn(List.of(version));
        when(dhrDirectoryRepository.findByVersionIdOrderBySortOrderAscIdAsc(401L)).thenReturn(List.of(directory));
        when(dhrTemplateItemRepository.findByDirectoryIdInOrderBySortOrderAscIdAsc(List.of(501L))).thenReturn(List.of(item));
        when(idGenerator.nextId()).thenReturn(801L);

        controller.deleteBatchRecordTemplate(301L);

        InOrder deletionOrder = inOrder(dhrTemplateItemRepository, dhrDirectoryRepository, dhrTemplateVersionRepository, dhrTemplateRepository);
        deletionOrder.verify(dhrTemplateItemRepository).deleteAll(List.of(item));
        deletionOrder.verify(dhrDirectoryRepository).deleteAll(List.of(directory));
        deletionOrder.verify(dhrTemplateVersionRepository).deleteAll(List.of(version));
        deletionOrder.verify(dhrTemplateRepository).delete(template);
    }
}
