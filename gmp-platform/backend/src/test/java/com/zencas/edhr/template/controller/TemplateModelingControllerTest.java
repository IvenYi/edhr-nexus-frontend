package com.zencas.edhr.template.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.entity.FileObject;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.compliance.service.PaddleOcrClient;
import com.zencas.edhr.template.dto.TemplateModelingRequest;
import com.zencas.edhr.template.entity.DhrTemplate;
import com.zencas.edhr.template.entity.FormTemplateAnalysis;
import com.zencas.edhr.template.entity.FormTemplate;
import com.zencas.edhr.template.entity.FormTemplateSourceRevision;
import com.zencas.edhr.template.entity.FormTemplateVersion;
import com.zencas.edhr.template.entity.TemplateCategory;
import com.zencas.edhr.template.repository.DhrTemplateRepository;
import com.zencas.edhr.template.repository.FormTemplateAnalysisRepository;
import com.zencas.edhr.template.repository.FormTemplateRepository;
import com.zencas.edhr.template.repository.FormTemplateSourceRevisionRepository;
import com.zencas.edhr.template.repository.FormTemplateVersionRepository;
import com.zencas.edhr.template.repository.TemplateCategoryRepository;
import com.zencas.edhr.template.service.OnlyOfficeDocumentConverter;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.JPEGFactory;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.Document;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.util.ReflectionTestUtils;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TemplateModelingControllerTest {

    @Mock private FormTemplateRepository formTemplateRepository;
    @Mock private FormTemplateVersionRepository formTemplateVersionRepository;
    @Mock private FormTemplateAnalysisRepository formTemplateAnalysisRepository;
    @Mock private FormTemplateSourceRevisionRepository formTemplateSourceRevisionRepository;
    @Mock private DhrTemplateRepository dhrTemplateRepository;
    @Mock private TemplateCategoryRepository templateCategoryRepository;
    @Mock private AuditEventRepository auditEventRepository;
    @Mock private FileObjectRepository fileObjectRepository;
    @Mock private SnowflakeIdGenerator idGenerator;
    @Mock private PaddleOcrClient paddleOcrClient;
    @Mock private OnlyOfficeDocumentConverter onlyOfficeDocumentConverter;
    @InjectMocks private TemplateModelingController controller;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @org.junit.jupiter.api.io.TempDir
    Path tempDir;

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
    void saveFormTemplateDesignUpdatesVersionAndWritesAudit() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder()
                .id(101L)
                .tenantId("default")
                .code("FT-001")
                .name("生产巡检表")
                .currentVersionId(102L)
                .build();
        FormTemplateVersion version = FormTemplateVersion.builder()
                .id(102L)
                .tenantId("default")
                .templateId(101L)
                .version("V1.0")
                .modelDesignJson("{\"fields\":[]}")
                .canvasDesignJson("{}")
                .workflowDesignJson("{}")
                .build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(201L);

        var response = controller.saveFormTemplateDesign(101L, 102L, TemplateModelingRequest.builder()
                .modelDesignJson("{\"fields\":[{\"code\":\"operator\",\"name\":\"操作人\"}]}")
                .canvasDesignJson("{\"layers\":[{\"type\":\"field\",\"x\":12,\"y\":20}]}")
                .workflowDesignJson("{\"nodes\":[{\"id\":\"review\"}]}")
                .build());

        assertThat(response.getData().modelDesignJson()).contains("operator");
        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        AuditEvent event = auditCaptor.getValue();
        assertThat(event.getEntityType()).isEqualTo("FORM_TEMPLATE_VERSION");
        assertThat(event.getFunctionName()).isEqualTo("保存表单设计");
        assertThat(objectMapper.readTree(event.getContentAfter()).fieldNames()).toIterable()
                .contains("modelDesignJson", "canvasDesignJson", "workflowDesignJson");
    }

    @Test
    void importFormTemplateSourceFileStoresFileSnapshotAndReturnsCanvasSchema() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(301L, 302L, 303L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "生产巡检记录.pdf",
                "application/pdf",
                samplePdfBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        assertThat(response.getData().version().sourceFileName()).isEqualTo("生产巡检记录.pdf");
        assertThat(response.getData().version().sourceFileId()).isEqualTo("301");
        assertThat(response.getData().version().importStatus()).isEqualTo("已导入");
        assertThat(response.getData().fieldCandidates()).extracting(TemplateModelingController.TemplateFieldCandidateResponse::name)
                .contains("Batch No")
                .doesNotContain("生产巡检记录", "操作人", "记录时间");
        assertThat(objectMapper.readTree(response.getData().version().canvasDesignJson()).get("pages")).hasSize(1);
        assertThat(objectMapper.readTree(response.getData().version().canvasDesignJson()).get("interactiveFields")).hasSize(0);
        assertThat(response.getData().analysisDraft().get("candidates")).hasSizeGreaterThanOrEqualTo(1);
        assertThat(objectMapper.readTree(response.getData().version().modelDesignJson()).get("source").get("fileId").asText()).isEqualTo("301");
        assertThat(objectMapper.readTree(response.getData().version().canvasDesignJson()).get("pages").get(0).get("background").get("url").asText())
                .isEqualTo("/api/v1/files/302/preview");
        JsonNode analysisPage = response.getData().analysisDraft().get("pages").get(0);
        JsonNode canvasPage = response.getData().canvasDesign().get("pages").get(0);
        JsonNode analysisBackground = analysisPage.get("background");
        JsonNode layerSummary = analysisPage.get("layerSummary");
        assertThat(analysisBackground).isNotNull();
        assertThat(layerSummary).isNotNull();
        assertThat(analysisBackground.get("fileId").asText()).isEqualTo(canvasPage.get("background").get("fileId").asText());
        assertThat(analysisBackground.get("url").asText()).isEqualTo("/api/v1/files/302/preview");
        assertThat(analysisBackground.get("mimeType").asText()).isEqualTo("image/png");
        assertThat(layerSummary.get("textCount").asInt()).isGreaterThanOrEqualTo(1);
        assertThat(layerSummary.get("lineCount").asInt()).isGreaterThanOrEqualTo(1);
        assertThat(layerSummary.get("imageCount").asInt()).isEqualTo(0);
        assertThat(response.getData().canvasDesign().get("strategy").asText()).isEqualTo("图层锚定+格式复刻");
        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        assertThat(auditCaptor.getValue().getFunctionName()).isEqualTo("导入表单源文件");
    }

    @Test
    void importFormTemplateSourceFileReturnsAnalysisDraftWithoutAutoConfirmingAllCandidates() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateAnalysisRepository.save(any(FormTemplateAnalysis.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateSourceRevisionRepository.save(any(FormTemplateSourceRevision.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateSourceRevisionRepository.countByTemplateIdAndVersionId(101L, 102L)).thenReturn(0);
        when(idGenerator.nextId()).thenReturn(301L, 302L, 303L, 304L, 305L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile("file", "生产巡检记录.pdf", "application/pdf", samplePdfBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        JsonNode analysisDraft = response.getData().analysisDraft();
        assertThat(analysisDraft.get("analysisId").asText()).isEqualTo("304");
        assertThat(analysisDraft.get("source").get("fileId").asText()).isEqualTo("301");
        assertThat(analysisDraft.get("pages")).hasSize(1);
        assertThat(analysisDraft.get("pages").get(0).get("orientation").asText()).isIn("portrait", "landscape");
        assertThat(analysisDraft.get("blocks")).isNotEmpty();
        assertThat(analysisDraft.get("candidates")).isNotEmpty();
        assertThat(analysisDraft.get("candidates").get(0).get("status").asText()).isEqualTo("pending");
        assertThat(analysisDraft.get("candidates").get(0).has("reason")).isTrue();
        assertThat(analysisDraft.get("candidates").get(0).has("confidence")).isTrue();
        assertThat(response.getData().version().modelDesignJson()).contains("analysisDraft");
        assertThat(objectMapper.readTree(response.getData().version().canvasDesignJson()).get("interactiveFields")).hasSize(0);
        ArgumentCaptor<FormTemplateAnalysis> analysisCaptor = ArgumentCaptor.forClass(FormTemplateAnalysis.class);
        verify(formTemplateAnalysisRepository).save(analysisCaptor.capture());
        JsonNode persistedAnalysisDraft = objectMapper.readTree(analysisCaptor.getValue().getAnalysisJson());
        assertThat(persistedAnalysisDraft.get("revision").asInt()).isEqualTo(analysisDraft.get("revision").asInt());
        verify(formTemplateSourceRevisionRepository).save(any(FormTemplateSourceRevision.class));
    }

    @Test
    void confirmFormTemplateAnalysisCandidatesPersistsComponentStaticTextAndIgnoreDecisions() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder()
                .id(102L)
                .tenantId("default")
                .templateId(101L)
                .version("V1.0")
                .modelDesignJson("{\"schemaVersion\":\"1.1\",\"source\":{\"fileId\":\"301\"},\"analysisDraft\":{\"analysisId\":\"304\"},\"fields\":[]}")
                .canvasDesignJson("{\"schemaVersion\":\"1.1\",\"pages\":[{\"id\":\"page-1\",\"pageNumber\":1,\"width\":595,\"height\":842,\"orientation\":\"portrait\",\"layers\":[]}],\"interactiveFields\":[],\"fieldBindings\":[],\"fillRuntime\":{\"valueSchemaVersion\":\"1.0\",\"values\":[],\"submissionEvents\":[]}}")
                .build();
        String analysisJson = """
                {"schemaVersion":"1.0","analysisId":"304","source":{"fileId":"301","fileName":"生产巡检记录.pdf","fileType":"pdf"},"pages":[{"id":"page-1","pageNumber":1,"width":595,"height":842,"orientation":"portrait"}],"blocks":[{"id":"block-title","pageId":"page-1","kind":"text","text":"生产巡检记录","x":72,"y":48,"width":220,"height":28},{"id":"block-batch","pageId":"page-1","kind":"text","text":"批号：","x":72,"y":96,"width":80,"height":24}],"candidates":[{"id":"candidate-title","status":"pending","suggestedAction":"staticText","fieldCode":"title","fieldName":"标题字段","sourceText":"生产巡检记录","pageId":"page-1","labelBlockId":"block-title","valueAnchor":{"x":72,"y":48,"width":220,"height":28},"reason":"标题文本","confidence":0.98},{"id":"candidate-batch-no","status":"pending","suggestedAction":"component","suggestedComponent":"TextInput","fieldCode":"batch_no","fieldName":"批号","pageId":"page-1","labelBlockId":"block-batch","valueAnchor":{"x":152,"y":96,"width":180,"height":24},"sourceText":"批号：","keyText":"批号","valueText":"","semanticRole":"keyValue","pairing":{"labelBlockId":"block-batch","strategy":"colon-label","valueAnchor":{"x":152,"y":96,"width":180,"height":24}},"reason":"冒号标签后存在可填写区域","confidence":0.92},{"id":"candidate-noise","status":"pending","suggestedAction":"ignore","fieldCode":"noise","fieldName":"页脚噪声","pageId":"page-1","valueAnchor":{"x":20,"y":800,"width":100,"height":18},"reason":"低置信度文本","confidence":0.31}]}
                """;
        FormTemplateAnalysis analysis = FormTemplateAnalysis.builder()
                .id(304L)
                .tenantId("default")
                .templateId(101L)
                .versionId(102L)
                .sourceFileId(301L)
                .status("PENDING")
                .analysisJson(analysisJson)
                .build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateAnalysisRepository.findByIdAndVersionId(304L, 102L)).thenReturn(Optional.of(analysis));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateAnalysisRepository.save(any(FormTemplateAnalysis.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(401L);
        TemplateModelingController.CandidateDecisionRequest request = new TemplateModelingController.CandidateDecisionRequest(
                "304",
                List.of(
                        new TemplateModelingController.CandidateDecisionItem("candidate-batch-no", "component", "batch_no", "批号", "TextInput", true),
                        new TemplateModelingController.CandidateDecisionItem("candidate-title", "staticText", null, null, null, false),
                        new TemplateModelingController.CandidateDecisionItem("candidate-noise", "ignore", null, null, null, false)
                ));

        var response = controller.confirmFormTemplateAnalysisCandidates(101L, 102L, 304L, request);

        JsonNode modelDesign = objectMapper.readTree(response.getData().modelDesignJson());
        JsonNode canvasDesign = objectMapper.readTree(response.getData().canvasDesignJson());
        assertThat(modelDesign.get("fields")).hasSize(1);
        JsonNode confirmedField = modelDesign.get("fields").get(0);
        assertThat(confirmedField.get("code").asText()).isEqualTo("batch_no");
        assertThat(confirmedField.get("sourceText").asText()).isEqualTo("批号：");
        assertThat(confirmedField.get("keyText").asText()).isEqualTo("批号");
        assertThat(confirmedField.get("valueText").asText()).isEmpty();
        assertThat(confirmedField.get("semanticRole").asText()).isEqualTo("keyValue");
        assertThat(confirmedField.get("pairing").get("strategy").asText()).isEqualTo("colon-label");
        assertThat(confirmedField.get("pairing").get("valueAnchor").get("x").asDouble()).isEqualTo(152);
        assertThat(canvasDesign.get("interactiveFields")).hasSize(1);
        JsonNode interactiveField = canvasDesign.get("interactiveFields").get(0);
        assertThat(interactiveField.get("component").asText()).isEqualTo("TextInput");
        assertThat(interactiveField.get("sourceText").asText()).isEqualTo("批号：");
        assertThat(interactiveField.get("keyText").asText()).isEqualTo("批号");
        assertThat(interactiveField.get("semanticRole").asText()).isEqualTo("keyValue");
        assertThat(interactiveField.get("pairing").get("strategy").asText()).isEqualTo("colon-label");
        assertThat(interactiveField.get("pairing").get("valueAnchor").get("width").asDouble()).isEqualTo(180);
        assertThat(canvasDesign.get("fieldBindings")).hasSize(1);
        JsonNode fieldBinding = canvasDesign.get("fieldBindings").get(0);
        assertThat(fieldBinding.get("fieldId").asText()).isEqualTo("field-batch_no");
        assertThat(fieldBinding.get("fieldCode").asText()).isEqualTo("batch_no");
        assertThat(fieldBinding.get("pageId").asText()).isEqualTo("page-1");
        assertThat(fieldBinding.get("sourceCandidateId").asText()).isEqualTo("candidate-batch-no");
        assertThat(fieldBinding.get("valuePath").asText()).isEqualTo("fields.batch_no");
        assertThat(fieldBinding.get("submissionPath").asText()).isEqualTo("submission.fields.batch_no");
        assertThat(canvasDesign.get("fillRuntime").get("valueSchemaVersion").asText()).isEqualTo("1.0");
        assertThat(canvasDesign.get("fillRuntime").get("values")).isEmpty();
        assertThat(canvasDesign.get("fillRuntime").get("submissionEvents")).isEmpty();
        JsonNode staticLayer = findNodeByText(canvasDesign.get("pages").get(0).get("layers"), "sourceCandidateId", "candidate-title");
        assertThat(staticLayer.get("id").asText()).isEqualTo("static-candidate-candidate-title");
        assertThat(staticLayer.get("text").asText()).isEqualTo("生产巡检记录");
        assertThat(staticLayer.get("sourceType").asText()).isEqualTo("analysis-candidate");
        assertThat(staticLayer.get("confidence").asDouble()).isEqualTo(0.98);
        assertThat(canvasDesign.toString()).doesNotContain("candidate-noise");
        assertThat(analysis.getStatus()).isEqualTo("CONFIRMED");
        JsonNode decisionLedger = objectMapper.readTree(analysis.getDecisionJson());
        assertThat(decisionLedger.get("schemaVersion").asText()).isEqualTo("1.0");
        assertThat(decisionLedger.get("analysisId").asText()).isEqualTo("304");
        assertThat(decisionLedger.get("source").get("fileId").asText()).isEqualTo("301");
        JsonNode componentDecision = findNodeByText(decisionLedger.get("decisions"), "candidateId", "candidate-batch-no");
        assertThat(componentDecision.get("action").asText()).isEqualTo("component");
        assertThat(componentDecision.get("fieldCode").asText()).isEqualTo("batch_no");
        assertThat(componentDecision.get("sourceText").asText()).isEqualTo("批号：");
        assertThat(componentDecision.get("keyText").asText()).isEqualTo("批号");
        assertThat(componentDecision.get("semanticRole").asText()).isEqualTo("keyValue");
        assertThat(componentDecision.get("pairing").get("strategy").asText()).isEqualTo("colon-label");
        assertThat(componentDecision.get("valueAnchor").get("x").asDouble()).isEqualTo(152);
        JsonNode staticDecision = findNodeByText(decisionLedger.get("decisions"), "candidateId", "candidate-title");
        assertThat(staticDecision.get("action").asText()).isEqualTo("staticText");
        assertThat(staticDecision.get("fieldName").asText()).isEqualTo("标题字段");
        assertThat(staticDecision.get("sourceText").asText()).isEqualTo("生产巡检记录");
        assertThat(staticDecision.get("reason").asText()).contains("标题文本");
        JsonNode ignoredDecision = findNodeByText(decisionLedger.get("decisions"), "candidateId", "candidate-noise");
        assertThat(ignoredDecision.get("action").asText()).isEqualTo("ignore");
        assertThat(ignoredDecision.get("fieldName").asText()).isEqualTo("页脚噪声");
        assertThat(ignoredDecision.get("confidence").asDouble()).isEqualTo(0.31);
        verify(auditEventRepository).save(any(AuditEvent.class));
    }

    @Test
    void confirmFormTemplateAnalysisCandidatesRequiresExplicitDecisionForEveryCandidate() {
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder()
                .id(102L)
                .tenantId("default")
                .templateId(101L)
                .version("V1.0")
                .modelDesignJson("{\"schemaVersion\":\"1.1\",\"fields\":[]}")
                .canvasDesignJson("{\"schemaVersion\":\"1.1\",\"pages\":[],\"interactiveFields\":[],\"fieldBindings\":[]}")
                .build();
        FormTemplateAnalysis analysis = FormTemplateAnalysis.builder()
                .id(304L)
                .tenantId("default")
                .templateId(101L)
                .versionId(102L)
                .sourceFileId(301L)
                .status("PENDING")
                .analysisJson("{\"analysisId\":\"304\",\"candidates\":[{\"id\":\"candidate-batch-no\",\"status\":\"pending\",\"fieldCode\":\"batch_no\",\"fieldName\":\"批号\",\"pageId\":\"page-1\"}]}")
                .build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateAnalysisRepository.findByIdAndVersionId(304L, 102L)).thenReturn(Optional.of(analysis));

        assertThatThrownBy(() -> controller.confirmFormTemplateAnalysisCandidates(
                101L,
                102L,
                304L,
                new TemplateModelingController.CandidateDecisionRequest("304", List.of())))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("请确认所有解析候选");

        assertThat(analysis.getStatus()).isEqualTo("PENDING");
        verify(formTemplateVersionRepository, never()).save(any(FormTemplateVersion.class));
        verify(formTemplateAnalysisRepository, never()).save(any(FormTemplateAnalysis.class));
        verify(auditEventRepository, never()).save(any(AuditEvent.class));
    }

    @Test
    void confirmFormTemplateAnalysisCandidatesClampsStaticTextLayerLikeCanvasPreview() throws Exception {
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder()
                .id(102L)
                .tenantId("default")
                .templateId(101L)
                .version("V1.0")
                .modelDesignJson("{\"schemaVersion\":\"1.1\",\"fields\":[]}")
                .canvasDesignJson("{\"schemaVersion\":\"1.1\",\"pages\":[{\"id\":\"page-1\",\"pageNumber\":1,\"width\":100,\"height\":100,\"orientation\":\"portrait\",\"layers\":[]}],\"interactiveFields\":[],\"fieldBindings\":[]}")
                .build();
        FormTemplateAnalysis analysis = FormTemplateAnalysis.builder()
                .id(304L)
                .tenantId("default")
                .templateId(101L)
                .versionId(102L)
                .sourceFileId(301L)
                .status("PENDING")
                .analysisJson("""
                        {"analysisId":"304","candidates":[{"id":"candidate-title","status":"pending","suggestedAction":"staticText","fieldCode":"title","fieldName":"标题","sourceText":"生产巡检记录","pageId":"page-1","valueAnchor":{"x":95,"y":95,"width":50,"height":20}}]}
                        """)
                .build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateAnalysisRepository.findByIdAndVersionId(304L, 102L)).thenReturn(Optional.of(analysis));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateAnalysisRepository.save(any(FormTemplateAnalysis.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.confirmFormTemplateAnalysisCandidates(
                101L,
                102L,
                304L,
                new TemplateModelingController.CandidateDecisionRequest(
                        "304",
                        List.of(new TemplateModelingController.CandidateDecisionItem("candidate-title", "staticText", null, null, null, false))));

        JsonNode canvasDesign = objectMapper.readTree(response.getData().canvasDesignJson());
        JsonNode layer = canvasDesign.get("pages").get(0).get("layers").get(0);
        assertThat(layer.get("x").asDouble()).isEqualTo(50);
        assertThat(layer.get("y").asDouble()).isEqualTo(80);
        assertThat(layer.get("width").asDouble()).isEqualTo(50);
        assertThat(layer.get("height").asDouble()).isEqualTo(20);
    }

    @Test
    void confirmFormTemplateAnalysisCandidatesAddsFillRuntimeWhenCanvasDoesNotHaveOne() throws Exception {
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder()
                .id(102L)
                .tenantId("default")
                .templateId(101L)
                .version("V1.0")
                .modelDesignJson("{\"schemaVersion\":\"1.1\",\"fields\":[]}")
                .canvasDesignJson("{\"schemaVersion\":\"1.1\",\"pages\":[{\"id\":\"page-1\",\"pageNumber\":1,\"width\":595,\"height\":842,\"orientation\":\"portrait\",\"layers\":[]}],\"interactiveFields\":[],\"fieldBindings\":[]}")
                .build();
        FormTemplateAnalysis analysis = FormTemplateAnalysis.builder()
                .id(304L)
                .tenantId("default")
                .templateId(101L)
                .versionId(102L)
                .sourceFileId(301L)
                .status("PENDING")
                .analysisJson("""
                        {"analysisId":"304","candidates":[{"id":"candidate-batch-no","status":"pending","suggestedAction":"component","suggestedComponent":"TextInput","fieldCode":"batch_no","fieldName":"批号","pageId":"page-1","valueAnchor":{"x":152,"y":96,"width":180,"height":24}}]}
                        """)
                .build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateAnalysisRepository.findByIdAndVersionId(304L, 102L)).thenReturn(Optional.of(analysis));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateAnalysisRepository.save(any(FormTemplateAnalysis.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.confirmFormTemplateAnalysisCandidates(
                101L,
                102L,
                304L,
                new TemplateModelingController.CandidateDecisionRequest(
                        "304",
                        List.of(new TemplateModelingController.CandidateDecisionItem("candidate-batch-no", "component", "batch_no", "批号", "TextInput", true))));

        JsonNode canvasDesign = objectMapper.readTree(response.getData().canvasDesignJson());
        assertThat(canvasDesign.get("fillRuntime").get("valueSchemaVersion").asText()).isEqualTo("1.0");
        assertThat(canvasDesign.get("fillRuntime").get("values")).isEmpty();
        assertThat(canvasDesign.get("fillRuntime").get("submissionEvents")).isEmpty();
    }

    @Test
    void confirmFormTemplateAnalysisCandidatesPreservesExistingFillRuntimeValues() throws Exception {
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder()
                .id(102L)
                .tenantId("default")
                .templateId(101L)
                .version("V1.0")
                .modelDesignJson("{\"schemaVersion\":\"1.1\",\"fields\":[]}")
                .canvasDesignJson("{\"schemaVersion\":\"1.1\",\"pages\":[{\"id\":\"page-1\",\"pageNumber\":1,\"width\":595,\"height\":842,\"orientation\":\"portrait\",\"layers\":[]}],\"interactiveFields\":[],\"fieldBindings\":[],\"fillRuntime\":{\"valueSchemaVersion\":\"1.0\",\"values\":[{\"fieldCode\":\"existing\",\"value\":\"old\"}],\"submissionEvents\":[{\"action\":\"draft\"}]}}")
                .build();
        FormTemplateAnalysis analysis = FormTemplateAnalysis.builder()
                .id(304L)
                .tenantId("default")
                .templateId(101L)
                .versionId(102L)
                .sourceFileId(301L)
                .status("PENDING")
                .analysisJson("""
                        {"analysisId":"304","candidates":[{"id":"candidate-batch-no","status":"pending","suggestedAction":"component","suggestedComponent":"TextInput","fieldCode":"batch_no","fieldName":"批号","pageId":"page-1","valueAnchor":{"x":152,"y":96,"width":180,"height":24}}]}
                        """)
                .build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateAnalysisRepository.findByIdAndVersionId(304L, 102L)).thenReturn(Optional.of(analysis));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateAnalysisRepository.save(any(FormTemplateAnalysis.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.confirmFormTemplateAnalysisCandidates(
                101L,
                102L,
                304L,
                new TemplateModelingController.CandidateDecisionRequest(
                        "304",
                        List.of(new TemplateModelingController.CandidateDecisionItem("candidate-batch-no", "component", "batch_no", "批号", "TextInput", true))));

        JsonNode fillRuntime = objectMapper.readTree(response.getData().canvasDesignJson()).get("fillRuntime");
        assertThat(fillRuntime.get("values").get(0).get("fieldCode").asText()).isEqualTo("existing");
        assertThat(fillRuntime.get("values").get(0).get("value").asText()).isEqualTo("old");
        assertThat(fillRuntime.get("submissionEvents").get(0).get("action").asText()).isEqualTo("draft");
    }

    @Test
    void confirmFormTemplateAnalysisCandidatesRejectsStaleSourceFileDraft() {
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder()
                .id(102L)
                .tenantId("default")
                .templateId(101L)
                .version("V1.0")
                .sourceFileId(302L)
                .modelDesignJson("{\"schemaVersion\":\"1.1\",\"fields\":[]}")
                .canvasDesignJson("{\"schemaVersion\":\"1.1\",\"pages\":[],\"interactiveFields\":[],\"fieldBindings\":[]}")
                .build();
        FormTemplateAnalysis analysis = FormTemplateAnalysis.builder()
                .id(304L)
                .tenantId("default")
                .templateId(101L)
                .versionId(102L)
                .sourceFileId(301L)
                .status("PENDING")
                .analysisJson("{\"analysisId\":\"304\",\"source\":{\"fileId\":\"301\"},\"candidates\":[{\"id\":\"candidate-batch-no\",\"status\":\"pending\",\"fieldCode\":\"batch_no\",\"fieldName\":\"批号\",\"pageId\":\"page-1\"}]}")
                .build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateAnalysisRepository.findByIdAndVersionId(304L, 102L)).thenReturn(Optional.of(analysis));

        assertThatThrownBy(() -> controller.confirmFormTemplateAnalysisCandidates(
                101L,
                102L,
                304L,
                new TemplateModelingController.CandidateDecisionRequest(
                        "304",
                        List.of(new TemplateModelingController.CandidateDecisionItem("candidate-batch-no", "component", "batch_no", "批号", "TextInput", true)))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("解析草稿源文件已过期");

        assertThat(analysis.getStatus()).isEqualTo("PENDING");
        verify(formTemplateVersionRepository, never()).save(any(FormTemplateVersion.class));
        verify(formTemplateAnalysisRepository, never()).save(any(FormTemplateAnalysis.class));
        verify(auditEventRepository, never()).save(any(AuditEvent.class));
    }

    @Test
    void confirmFormTemplateAnalysisCandidatesRejectsMismatchedBodyAnalysisIdAndAlreadyConfirmedDraft() {
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder()
                .id(102L)
                .tenantId("default")
                .templateId(101L)
                .version("V1.0")
                .modelDesignJson("{\"schemaVersion\":\"1.1\",\"fields\":[]}")
                .canvasDesignJson("{\"schemaVersion\":\"1.1\",\"pages\":[],\"interactiveFields\":[],\"fieldBindings\":[]}")
                .build();
        FormTemplateAnalysis analysis = FormTemplateAnalysis.builder()
                .id(304L)
                .tenantId("default")
                .templateId(101L)
                .versionId(102L)
                .sourceFileId(301L)
                .status("PENDING")
                .analysisJson("{\"analysisId\":\"304\",\"candidates\":[{\"id\":\"candidate-batch-no\",\"status\":\"pending\",\"fieldCode\":\"batch_no\",\"fieldName\":\"批号\",\"pageId\":\"page-1\"}]}")
                .build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateAnalysisRepository.findByIdAndVersionId(304L, 102L)).thenReturn(Optional.of(analysis));

        assertThatThrownBy(() -> controller.confirmFormTemplateAnalysisCandidates(
                101L,
                102L,
                304L,
                new TemplateModelingController.CandidateDecisionRequest(
                        "999",
                        List.of(new TemplateModelingController.CandidateDecisionItem("candidate-batch-no", "component", "batch_no", "批号", "TextInput", true)))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("解析草稿不匹配");

        analysis.setStatus("CONFIRMED");

        assertThatThrownBy(() -> controller.confirmFormTemplateAnalysisCandidates(
                101L,
                102L,
                304L,
                new TemplateModelingController.CandidateDecisionRequest(
                        "304",
                        List.of(new TemplateModelingController.CandidateDecisionItem("candidate-batch-no", "component", "batch_no", "批号", "TextInput", true)))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("解析草稿已确认");

        verify(formTemplateVersionRepository, never()).save(any(FormTemplateVersion.class));
        verify(formTemplateAnalysisRepository, never()).save(any(FormTemplateAnalysis.class));
        verify(auditEventRepository, never()).save(any(AuditEvent.class));
    }

    @Test
    void confirmFormTemplateAnalysisCandidatesRejectsUnsupportedComponentAndDuplicateFieldCodes() {
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder()
                .id(102L)
                .tenantId("default")
                .templateId(101L)
                .version("V1.0")
                .modelDesignJson("{\"schemaVersion\":\"1.1\",\"fields\":[]}")
                .canvasDesignJson("{\"schemaVersion\":\"1.1\",\"pages\":[],\"interactiveFields\":[],\"fieldBindings\":[]}")
                .build();
        FormTemplateAnalysis analysis = FormTemplateAnalysis.builder()
                .id(304L)
                .tenantId("default")
                .templateId(101L)
                .versionId(102L)
                .sourceFileId(301L)
                .status("PENDING")
                .analysisJson("{\"analysisId\":\"304\",\"candidates\":[{\"id\":\"candidate-batch-no\",\"status\":\"pending\",\"fieldCode\":\"batch_no\",\"fieldName\":\"批号\",\"pageId\":\"page-1\"},{\"id\":\"candidate-lot-no\",\"status\":\"pending\",\"fieldCode\":\"lot_no\",\"fieldName\":\"批次\",\"pageId\":\"page-1\"}]}")
                .build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateAnalysisRepository.findByIdAndVersionId(304L, 102L)).thenReturn(Optional.of(analysis));

        assertThatThrownBy(() -> controller.confirmFormTemplateAnalysisCandidates(
                101L,
                102L,
                304L,
                new TemplateModelingController.CandidateDecisionRequest(
                        "304",
                        List.of(
                                new TemplateModelingController.CandidateDecisionItem("candidate-batch-no", "component", "batch_no", "批号", "HtmlEmbed", true),
                                new TemplateModelingController.CandidateDecisionItem("candidate-lot-no", "ignore", null, null, null, false)))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("解析候选组件类型无效");

        reset(formTemplateVersionRepository, formTemplateAnalysisRepository, auditEventRepository);
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateAnalysisRepository.findByIdAndVersionId(304L, 102L)).thenReturn(Optional.of(analysis));

        assertThatThrownBy(() -> controller.confirmFormTemplateAnalysisCandidates(
                101L,
                102L,
                304L,
                new TemplateModelingController.CandidateDecisionRequest(
                        "304",
                        List.of(
                                new TemplateModelingController.CandidateDecisionItem("candidate-batch-no", "component", "batch_no", "批号", "TextInput", true),
                                new TemplateModelingController.CandidateDecisionItem("candidate-lot-no", "component", "batch_no", "批次", "TextInput", true)))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("解析候选字段编码重复");

        reset(formTemplateVersionRepository, formTemplateAnalysisRepository, auditEventRepository);
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateAnalysisRepository.findByIdAndVersionId(304L, 102L)).thenReturn(Optional.of(analysis));

        assertThatThrownBy(() -> controller.confirmFormTemplateAnalysisCandidates(
                101L,
                102L,
                304L,
                new TemplateModelingController.CandidateDecisionRequest(
                        "304",
                        List.of(
                                new TemplateModelingController.CandidateDecisionItem("candidate-batch-no", "component", "batch.no", "批号", "TextInput", true),
                                new TemplateModelingController.CandidateDecisionItem("candidate-lot-no", "ignore", null, null, null, false)))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("解析候选字段编码格式无效");

        verify(formTemplateVersionRepository, never()).save(any(FormTemplateVersion.class));
        verify(formTemplateAnalysisRepository, never()).save(any(FormTemplateAnalysis.class));
        verify(auditEventRepository, never()).save(any(AuditEvent.class));
    }

    @Test
    void confirmFormTemplateAnalysisCandidatesPersistsSignaturePadComponent() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder()
                .id(102L)
                .tenantId("default")
                .templateId(101L)
                .version("V1.0")
                .modelDesignJson("{\"schemaVersion\":\"1.1\",\"fields\":[]}")
                .canvasDesignJson("{\"schemaVersion\":\"1.1\",\"pages\":[{\"id\":\"page-1\",\"layers\":[]}],\"interactiveFields\":[],\"fieldBindings\":[]}")
                .build();
        FormTemplateAnalysis analysis = FormTemplateAnalysis.builder()
                .id(304L)
                .tenantId("default")
                .templateId(101L)
                .versionId(102L)
                .sourceFileId(301L)
                .status("PENDING")
                .analysisJson("{\"analysisId\":\"304\",\"candidates\":[{\"id\":\"candidate-operator-signature\",\"status\":\"pending\",\"suggestedAction\":\"component\",\"suggestedComponent\":\"SignaturePad\",\"fieldCode\":\"operator_signature\",\"fieldName\":\"操作人签名\",\"pageId\":\"page-1\",\"valueAnchor\":{\"x\":72,\"y\":96,\"width\":180,\"height\":48}}]}")
                .build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateAnalysisRepository.findByIdAndVersionId(304L, 102L)).thenReturn(Optional.of(analysis));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateAnalysisRepository.save(any(FormTemplateAnalysis.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.confirmFormTemplateAnalysisCandidates(
                101L,
                102L,
                304L,
                new TemplateModelingController.CandidateDecisionRequest(
                        "304",
                        List.of(new TemplateModelingController.CandidateDecisionItem("candidate-operator-signature", "component", "operator_signature", "操作人签名", "SignaturePad", true))));

        JsonNode modelDesign = objectMapper.readTree(response.getData().modelDesignJson());
        JsonNode canvasDesign = objectMapper.readTree(response.getData().canvasDesignJson());
        assertThat(modelDesign.get("fields").get(0).get("type").asText()).isEqualTo("signature");
        assertThat(modelDesign.get("fields").get(0).get("component").asText()).isEqualTo("SignaturePad");
        assertThat(canvasDesign.get("interactiveFields").get(0).get("type").asText()).isEqualTo("signature");
        assertThat(canvasDesign.get("interactiveFields").get(0).get("component").asText()).isEqualTo("SignaturePad");
        assertThat(canvasDesign.get("interactiveFields").get(0).get("binding").get("component").asText()).isEqualTo("SignaturePad");
        verify(auditEventRepository).save(any(AuditEvent.class));
    }

    @Test
    void confirmFormTemplateAnalysisCandidatesPersistsTextAreaComponent() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder()
                .id(102L)
                .tenantId("default")
                .templateId(101L)
                .version("V1.0")
                .modelDesignJson("{\"schemaVersion\":\"1.1\",\"fields\":[]}")
                .canvasDesignJson("{\"schemaVersion\":\"1.1\",\"pages\":[{\"id\":\"page-1\",\"layers\":[]}],\"interactiveFields\":[],\"fieldBindings\":[]}")
                .build();
        FormTemplateAnalysis analysis = FormTemplateAnalysis.builder()
                .id(304L)
                .tenantId("default")
                .templateId(101L)
                .versionId(102L)
                .sourceFileId(301L)
                .status("PENDING")
                .analysisJson("{\"analysisId\":\"304\",\"candidates\":[{\"id\":\"candidate-disposal-opinion\",\"status\":\"pending\",\"suggestedAction\":\"component\",\"suggestedComponent\":\"TextArea\",\"fieldCode\":\"disposal_opinion\",\"fieldName\":\"处理意见\",\"pageId\":\"page-1\",\"valueAnchor\":{\"x\":72,\"y\":96,\"width\":240,\"height\":72}}]}")
                .build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateAnalysisRepository.findByIdAndVersionId(304L, 102L)).thenReturn(Optional.of(analysis));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateAnalysisRepository.save(any(FormTemplateAnalysis.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.confirmFormTemplateAnalysisCandidates(
                101L,
                102L,
                304L,
                new TemplateModelingController.CandidateDecisionRequest(
                        "304",
                        List.of(new TemplateModelingController.CandidateDecisionItem("candidate-disposal-opinion", "component", "disposal_opinion", "处理意见", "TextArea", false))));

        JsonNode modelDesign = objectMapper.readTree(response.getData().modelDesignJson());
        JsonNode canvasDesign = objectMapper.readTree(response.getData().canvasDesignJson());
        assertThat(modelDesign.get("fields").get(0).get("type").asText()).isEqualTo("textarea");
        assertThat(modelDesign.get("fields").get(0).get("component").asText()).isEqualTo("TextArea");
        assertThat(canvasDesign.get("interactiveFields").get(0).get("type").asText()).isEqualTo("textarea");
        assertThat(canvasDesign.get("interactiveFields").get(0).get("component").asText()).isEqualTo("TextArea");
        assertThat(canvasDesign.get("interactiveFields").get(0).get("binding").get("component").asText()).isEqualTo("TextArea");
        verify(auditEventRepository).save(any(AuditEvent.class));
    }

    @Test
    void importPdfTemplateSourceFileProposesTextLayerCandidateCoordinates() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(301L, 302L, 303L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "production-record.pdf",
                "application/pdf",
                samplePdfBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        JsonNode layers = response.getData().canvasDesign().get("pages").get(0).get("layers");
        JsonNode candidates = response.getData().analysisDraft().get("candidates");
        JsonNode batchLayer = null;
        JsonNode batchCandidate = null;
        for (JsonNode layer : layers) {
            if ("Batch No".equals(layer.path("text").asText())) batchLayer = layer;
        }
        for (JsonNode candidate : candidates) {
            if ("Batch No".equals(candidate.path("fieldName").asText())) batchCandidate = candidate;
        }

        assertThat(batchLayer).isNotNull();
        assertThat(batchCandidate).isNotNull();
        assertThat(batchCandidate.get("pageId").asText()).isEqualTo("page-1");
        assertThat(batchCandidate.get("labelBlockId").asText()).isEqualTo(batchLayer.get("id").asText());
        assertThat(batchCandidate.get("valueAnchor").get("x").asDouble()).isEqualTo(batchLayer.get("x").asDouble());
        assertThat(batchCandidate.get("valueAnchor").get("y").asDouble()).isEqualTo(batchLayer.get("y").asDouble());
        assertThat(batchCandidate.get("valueAnchor").get("width").asDouble()).isEqualTo(batchLayer.get("width").asDouble());
        assertThat(batchCandidate.get("valueAnchor").get("height").asDouble()).isEqualTo(batchLayer.get("height").asDouble());
        JsonNode batchBlock = findNodeByText(response.getData().analysisDraft().get("blocks"), "id", batchLayer.get("id").asText());
        assertThat(batchBlock).isNotNull();
        assertThat(batchBlock.get("sourceType").asText()).isEqualTo("pdf-text");
        assertThat(batchBlock.get("sourceRef").get("pageNumber").asInt()).isEqualTo(1);
        assertThat(response.getData().canvasDesign().get("interactiveFields")).hasSize(0);
    }

    @Test
    void importPdfTemplateSourceFilePlacesColonStyleValueAnchorAfterLabel() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(301L, 302L, 303L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "production-record.pdf",
                "application/pdf",
                samplePdfWithColonLabelBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        JsonNode batchLayer = findNodeByText(response.getData().analysisDraft().get("blocks"), "text", "Batch No:");
        JsonNode batchCandidate = findNodeByText(response.getData().analysisDraft().get("candidates"), "fieldName", "Batch No");
        assertThat(batchLayer).isNotNull();
        assertThat(batchCandidate).isNotNull();
        assertThat(batchCandidate.get("suggestedAction").asText()).isEqualTo("component");
        assertThat(batchCandidate.get("reason").asText()).contains("冒号标签");
        assertThat(batchCandidate.get("sourceText").asText()).isEqualTo("Batch No:");
        assertThat(batchCandidate.get("keyText").asText()).isEqualTo("Batch No");
        assertThat(batchCandidate.get("valueText").asText()).isEmpty();
        assertThat(batchCandidate.get("semanticRole").asText()).isEqualTo("keyValue");
        assertThat(batchCandidate.get("pairing").get("strategy").asText()).isEqualTo("colon-label");
        assertThat(batchCandidate.get("valueAnchor").get("x").asDouble())
                .isGreaterThan(batchLayer.get("x").asDouble() + batchLayer.get("width").asDouble());
        assertThat(batchCandidate.get("valueAnchor").get("width").asDouble()).isGreaterThan(batchLayer.get("width").asDouble());
    }

    @Test
    void importPdfTemplateSourceFileUsesRotationForLandscapeOrientation() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("横向记录表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(301L, 302L, 303L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "landscape-rotated.pdf",
                "application/pdf",
                sampleRotatedLandscapePdfBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        JsonNode canvasDesign = response.getData().canvasDesign();
        JsonNode canvasPage = canvasDesign.get("pages").get(0);
        JsonNode analysisPage = response.getData().analysisDraft().get("pages").get(0);
        assertThat(canvasPage.get("orientation").asText()).isEqualTo("landscape");
        assertThat(canvasPage.get("width").asInt()).isGreaterThan(canvasPage.get("height").asInt());
        assertThat(canvasDesign.get("orientation").asText()).isEqualTo("landscape");
        assertThat(analysisPage.get("orientation").asText()).isEqualTo("landscape");
        JsonNode textLayer = findNodeByText(canvasPage.get("layers"), "text", "Rotated Landscape");
        assertThat(textLayer).isNotNull();
        assertThat(textLayer.path("sourceType").asText()).isEqualTo("pdf-text");
        assertThat(textLayer.path("sourceRef").path("pageNumber").asInt()).isEqualTo(1);
        assertThat(textLayer.path("sourceRef").path("rotation").asInt()).isEqualTo(90);
        JsonNode textBlock = findNodeByText(response.getData().analysisDraft().get("blocks"), "text", "Rotated Landscape");
        assertThat(textBlock).isNotNull();
        assertThat(textBlock.path("sourceType").asText()).isEqualTo("pdf-text");
        assertThat(textBlock.path("sourceRef").path("rotation").asInt()).isEqualTo(90);
    }

    @Test
    void importPdfTemplateSourceFileRestoresDrawableLineLayers() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(301L, 302L, 303L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "production-record.pdf",
                "application/pdf",
                samplePdfBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        assertThat(response.getData().canvasDesign().get("pages").get(0).get("layers"))
                .anySatisfy(layer -> {
                    assertThat(layer.get("type").asText()).isEqualTo("line");
                    assertThat(layer.get("x").asDouble()).isEqualTo(72);
                    assertThat(layer.get("y").asDouble()).isEqualTo(142);
                    assertThat(layer.get("width").asDouble()).isEqualTo(220);
                    assertThat(layer.get("height").asDouble()).isEqualTo(1);
                    assertThat(layer.get("borderStyle").asText()).isEqualTo("solid");
                    assertThat(layer.get("borderWidth").asDouble()).isEqualTo(1);
                    assertThat(layer.get("selectable").asBoolean()).isTrue();
                    assertThat(layer.get("draggable").asBoolean()).isTrue();
                    assertThat(layer.get("resizable").asBoolean()).isTrue();
                })
                .anySatisfy(layer -> {
                    assertThat(layer.get("type").asText()).isEqualTo("line");
                    assertThat(layer.get("x").asDouble()).isEqualTo(72);
                    assertThat(layer.get("y").asDouble()).isEqualTo(192);
                    assertThat(layer.get("width").asDouble()).isEqualTo(220);
                    assertThat(layer.get("height").asDouble()).isEqualTo(1);
                })
                .anySatisfy(layer -> {
                    assertThat(layer.get("type").asText()).isEqualTo("line");
                    assertThat(layer.get("x").asDouble()).isEqualTo(72);
                    assertThat(layer.get("y").asDouble()).isEqualTo(192);
                    assertThat(layer.get("width").asDouble()).isEqualTo(1);
                    assertThat(layer.get("height").asDouble()).isEqualTo(40);
                });
    }

    @Test
    void importPdfTemplateSourceFileRestoresRasterLineLayersFromRenderedBackground() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(301L, 302L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "scanned-form.pdf",
                "application/pdf",
                sampleImageOnlyPdfWithFormLinesBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        assertThat(response.getData().canvasDesign().get("pages").get(0).get("layers"))
                .anySatisfy(layer -> {
                    assertThat(layer.get("type").asText()).isEqualTo("line");
                    assertThat(layer.get("sourceType").asText()).isEqualTo("pdf-raster-line");
                    assertThat(layer.get("width").asDouble()).isGreaterThan(280);
                    assertThat(layer.get("height").asDouble()).isLessThanOrEqualTo(3);
                    assertThat(layer.get("selectable").asBoolean()).isTrue();
                    assertThat(layer.get("editable").asBoolean()).isTrue();
                    assertThat(layer.get("deletable").asBoolean()).isTrue();
                })
                .anySatisfy(layer -> {
                    assertThat(layer.get("type").asText()).isEqualTo("line");
                    assertThat(layer.get("sourceType").asText()).isEqualTo("pdf-raster-line");
                    assertThat(layer.get("width").asDouble()).isLessThanOrEqualTo(3);
                    assertThat(layer.get("height").asDouble()).isGreaterThan(90);
                });
    }

    @Test
    void importPdfTemplateSourceFileCreatesOcrTextLayersFromRenderedPageBackground() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(301L, 302L);
        when(paddleOcrClient.recognizeTextBoxes(any(Path.class))).thenReturn(List.of(
                new PaddleOcrClient.OcrTextBox("检验结论", 144, 192, 180, 36, 0.93)
        ));
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "扫描检验记录.pdf",
                "application/pdf",
                samplePdfBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        JsonNode layers = response.getData().canvasDesign().get("pages").get(0).get("layers");
        JsonNode candidates = response.getData().analysisDraft().get("candidates");
        JsonNode ocrLayer = null;
        JsonNode ocrCandidate = null;
        for (JsonNode layer : layers) {
            if ("检验结论".equals(layer.path("text").asText())) ocrLayer = layer;
        }
        for (JsonNode candidate : candidates) {
            if ("检验结论".equals(candidate.path("fieldName").asText())) ocrCandidate = candidate;
        }

        assertThat(response.getData().fieldCandidates())
                .extracting(TemplateModelingController.TemplateFieldCandidateResponse::name)
                .contains("检验结论");
        assertThat(ocrLayer).isNotNull();
        assertThat(ocrLayer.path("sourceType").asText()).isEqualTo("pdf-ocr");
        assertThat(ocrLayer.path("sourceRef").path("pageNumber").asInt()).isEqualTo(1);
        assertThat(ocrLayer.path("confidence").asDouble()).isEqualTo(0.93);
        assertThat(ocrCandidate).isNotNull();
        assertThat(ocrCandidate.path("labelBlockId").asText()).isEqualTo(ocrLayer.path("id").asText());
        assertThat(ocrCandidate.path("valueAnchor").path("x").asDouble()).isEqualTo(ocrLayer.path("x").asDouble());
        JsonNode ocrBlock = findNodeByText(response.getData().analysisDraft().get("blocks"), "id", ocrLayer.path("id").asText());
        assertThat(ocrBlock).isNotNull();
        assertThat(ocrBlock.path("sourceType").asText()).isEqualTo("pdf-ocr");
    }

    @Test
    void importBlankPdfTemplateSourceFileDoesNotCreateCandidateFromSourceFileName() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateAnalysisRepository.save(any(FormTemplateAnalysis.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateSourceRevisionRepository.save(any(FormTemplateSourceRevision.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateSourceRevisionRepository.countByTemplateIdAndVersionId(101L, 102L)).thenReturn(0);
        when(idGenerator.nextId()).thenReturn(301L, 302L, 303L, 304L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "blank-template.pdf",
                "application/pdf",
                blankPdfBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        assertThat(response.getData().fieldCandidates()).isEmpty();
        assertThat(response.getData().analysisDraft().get("candidates")).isEmpty();
        assertThat(response.getData().analysisDraft().get("blocks")).isEmpty();
        assertThat(response.getData().canvasDesign().get("pages").get(0).get("background").get("fileId").asText()).isEqualTo("302");
        assertThat(response.getData().canvasDesign().get("interactiveFields")).hasSize(0);
    }

    @Test
    void importImageTemplateSourceFileCreatesPortraitBackgroundCanvas() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(311L, 312L, 313L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile("file", "现场记录.png", "image/png", samplePngBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        assertThat(response.getData().version().sourceFileType()).isEqualTo("png");
        assertThat(response.getData().version().sourceFileId()).isEqualTo("311");
        assertThat(response.getData().canvasDesign().get("orientation").asText()).isEqualTo("portrait");
        assertThat(response.getData().canvasDesign().get("pages").get(0).get("background").get("fileId").asText()).isEqualTo("312");
        assertThat(response.getData().canvasDesign().get("pages").get(0).get("deskewApplied").asBoolean()).isTrue();
        assertThat(response.getData().canvasDesign().get("editorCapabilities").get("draggableFields").asBoolean()).isTrue();
    }

    @Test
    void importImageTemplateSourceFileRestoresRasterLineLayers() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(311L, 312L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile("file", "线框记录.png", "image/png", samplePngWithFormLinesBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        assertThat(response.getData().canvasDesign().get("pages").get(0).get("layers"))
                .anySatisfy(layer -> {
                    assertThat(layer.get("type").asText()).isEqualTo("line");
                    assertThat(layer.get("x").asDouble()).isEqualTo(40);
                    assertThat(layer.get("y").asDouble()).isEqualTo(80);
                    assertThat(layer.get("width").asDouble()).isEqualTo(240);
                    assertThat(layer.get("height").asDouble()).isEqualTo(2);
                    assertThat(layer.get("selectable").asBoolean()).isTrue();
                    assertThat(layer.get("editable").asBoolean()).isTrue();
                    assertThat(layer.get("deletable").asBoolean()).isTrue();
                })
                .anySatisfy(layer -> {
                    assertThat(layer.get("type").asText()).isEqualTo("line");
                    assertThat(layer.get("x").asDouble()).isEqualTo(40);
                    assertThat(layer.get("y").asDouble()).isEqualTo(80);
                    assertThat(layer.get("width").asDouble()).isEqualTo(2);
                    assertThat(layer.get("height").asDouble()).isEqualTo(82);
                });
    }

    @Test
    void importImageTemplateSourceFileCreatesOcrTextLayersAndAnchoredFields() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(311L, 312L);
        when(paddleOcrClient.recognizeTextBoxes(any(Path.class))).thenReturn(List.of(
                new PaddleOcrClient.OcrTextBox("设备编号", 72, 96, 120, 24, 0.91)
        ));
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile("file", "扫码记录.png", "image/png", samplePngBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        JsonNode layers = response.getData().canvasDesign().get("pages").get(0).get("layers");
        JsonNode candidates = response.getData().analysisDraft().get("candidates");
        JsonNode ocrLayer = null;
        JsonNode ocrCandidate = null;
        for (JsonNode layer : layers) {
            if ("设备编号".equals(layer.path("text").asText())) ocrLayer = layer;
        }
        for (JsonNode candidate : candidates) {
            if ("设备编号".equals(candidate.path("fieldName").asText())) ocrCandidate = candidate;
        }

        assertThat(response.getData().fieldCandidates())
                .extracting(TemplateModelingController.TemplateFieldCandidateResponse::name)
                .contains("设备编号");
        assertThat(ocrLayer).isNotNull();
        assertThat(ocrLayer.path("type").asText()).isEqualTo("text");
        assertThat(ocrLayer.path("sourceType").asText()).isEqualTo("image-ocr");
        assertThat(ocrLayer.path("x").asDouble()).isEqualTo(72);
        assertThat(ocrLayer.path("y").asDouble()).isEqualTo(96);
        assertThat(ocrLayer.path("width").asDouble()).isEqualTo(120);
        assertThat(ocrLayer.path("height").asDouble()).isEqualTo(24);
        assertThat(ocrCandidate).isNotNull();
        assertThat(ocrCandidate.path("labelBlockId").asText()).isEqualTo(ocrLayer.path("id").asText());
        assertThat(ocrCandidate.path("valueAnchor").path("x").asDouble()).isEqualTo(ocrLayer.path("x").asDouble());
        assertThat(ocrCandidate.path("confidence").asDouble()).isEqualTo(0.91);
        JsonNode ocrBlock = findNodeByText(response.getData().analysisDraft().get("blocks"), "id", ocrLayer.path("id").asText());
        assertThat(ocrBlock).isNotNull();
        assertThat(ocrBlock.path("sourceType").asText()).isEqualTo("image-ocr");
        assertThat(response.getData().canvasDesign().get("interactiveFields")).hasSize(0);
    }

    @Test
    void importFormTemplateSourceFileKeepsExcelSourceLayersLocked() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(331L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "检验记录.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                sampleXlsxBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        for (JsonNode layer : response.getData().canvasDesign().get("pages").get(0).get("layers")) {
            assertThat(layer.get("editable").asBoolean()).isFalse();
            assertThat(layer.get("deletable").asBoolean()).isFalse();
            assertThat(layer.get("selectable").asBoolean()).isFalse();
            assertThat(layer.get("draggable").asBoolean()).isFalse();
            assertThat(layer.get("resizable").asBoolean()).isFalse();
        }
    }

    @Test
    void importExcelTemplateSourceFileDoesNotCreateCandidateFromSourceFileName() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateAnalysisRepository.save(any(FormTemplateAnalysis.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateSourceRevisionRepository.save(any(FormTemplateSourceRevision.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateSourceRevisionRepository.countByTemplateIdAndVersionId(101L, 102L)).thenReturn(0);
        when(idGenerator.nextId()).thenReturn(331L, 332L, 333L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "zencas-form-template-import-e2e.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                sampleXlsxBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        assertThat(response.getData().analysisDraft().get("candidates"))
                .noneSatisfy(candidate -> assertThat(candidate.get("fieldName").asText()).isEqualTo("zencas-form-template-import-e2e"));
        assertThat(response.getData().fieldCandidates())
                .extracting(TemplateModelingController.TemplateFieldCandidateResponse::name)
                .doesNotContain("zencas-form-template-import-e2e", "操作人", "记录时间");
    }

    @Test
    void importEmptyExcelTemplateSourceFileDoesNotCreateCandidateFromSourceFileName() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateAnalysisRepository.save(any(FormTemplateAnalysis.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateSourceRevisionRepository.save(any(FormTemplateSourceRevision.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateSourceRevisionRepository.countByTemplateIdAndVersionId(101L, 102L)).thenReturn(0);
        when(idGenerator.nextId()).thenReturn(331L, 332L, 333L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "empty-template.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                emptyXlsxBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        assertThat(response.getData().fieldCandidates()).isEmpty();
        assertThat(response.getData().analysisDraft().get("candidates")).isEmpty();
        assertThat(response.getData().canvasDesign().get("interactiveFields")).hasSize(0);
    }

    @Test
    void importEmptyWordTemplateSourceFileDoesNotCreateCandidateFromSourceFileName() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateAnalysisRepository.save(any(FormTemplateAnalysis.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateSourceRevisionRepository.save(any(FormTemplateSourceRevision.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateSourceRevisionRepository.countByTemplateIdAndVersionId(101L, 102L)).thenReturn(0);
        when(idGenerator.nextId()).thenReturn(321L, 322L, 323L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "empty-template.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                emptyDocxBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        assertThat(response.getData().fieldCandidates()).isEmpty();
        assertThat(response.getData().analysisDraft().get("candidates")).isEmpty();
        assertThat(response.getData().canvasDesign().get("interactiveFields")).hasSize(0);
    }

    @Test
    void importWordTemplateSourceFileCreatesFieldCandidatesFromParagraphs() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(321L, 322L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "清场检查.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                sampleDocxBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        assertThat(response.getData().version().sourceFileType()).isEqualTo("docx");
        assertThat(response.getData().fieldCandidates()).extracting(TemplateModelingController.TemplateFieldCandidateResponse::name)
                .contains("设备编号", "清洁确认");
        assertThat(response.getData().canvasDesign().get("pages").get(0).get("layers")).hasSizeGreaterThanOrEqualTo(2);
        assertThat(response.getData().canvasDesign().get("fillRuntime").get("valueSchemaVersion").asText()).isEqualTo("1.0");
    }

    @Test
    void importWordTemplateSourceFileUsesOnlyOfficeConvertedPdfBackground() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateAnalysisRepository.save(any(FormTemplateAnalysis.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateSourceRevisionRepository.save(any(FormTemplateSourceRevision.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateSourceRevisionRepository.countByTemplateIdAndVersionId(101L, 102L)).thenReturn(0);
        when(idGenerator.nextId()).thenReturn(321L, 322L, 323L, 324L, 325L);
        when(onlyOfficeDocumentConverter.convertToPdf(any(OnlyOfficeDocumentConverter.ConversionRequest.class))).thenReturn(samplePdfBytes());
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficeDocumentServerUrl", "http://localhost:8088");
        ReflectionTestUtils.setField(controller, "onlyOfficeConverterUrl", "http://onlyoffice-document-server");
        ReflectionTestUtils.setField(controller, "onlyOfficePublicBackendUrl", "http://localhost:8081");
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "清场检查.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                sampleDocxBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        assertThat(response.getData().version().sourceFileType()).isEqualTo("docx");
        assertThat(response.getData().version().sourceFileId()).isEqualTo("321");
        assertThat(response.getData().modelDesign().get("source").get("fileId").asText()).isEqualTo("321");
        JsonNode canvasPage = response.getData().canvasDesign().get("pages").get(0);
        JsonNode analysisPage = response.getData().analysisDraft().get("pages").get(0);
        assertThat(canvasPage.get("background").get("fileId").asText()).isEqualTo("323");
        assertThat(canvasPage.get("background").get("url").asText()).isEqualTo("/api/v1/files/323/preview");
        assertThat(canvasPage.get("background").get("mimeType").asText()).isEqualTo("image/png");
        assertThat(canvasPage.get("layers")).isEmpty();
        assertThat(analysisPage.get("background").get("fileId").asText()).isEqualTo("323");
        assertThat(response.getData().analysisDraft().get("blocks")).isNotEmpty();
        assertThat(response.getData().canvasDesign().get("interactiveFields")).hasSize(0);
        assertThat(response.getData().fieldCandidates()).extracting(TemplateModelingController.TemplateFieldCandidateResponse::name)
                .contains("设备编号", "清洁确认");
        ArgumentCaptor<OnlyOfficeDocumentConverter.ConversionRequest> requestCaptor = ArgumentCaptor.forClass(OnlyOfficeDocumentConverter.ConversionRequest.class);
        verify(onlyOfficeDocumentConverter).convertToPdf(requestCaptor.capture());
        assertThat(requestCaptor.getValue().documentServerUrl()).isEqualTo("http://onlyoffice-document-server");
        assertThat(requestCaptor.getValue().fileType()).isEqualTo("docx");
        assertThat(requestCaptor.getValue().outputType()).isEqualTo("pdf");
    }

    @Test
    void importPdfTemplateSourceFileUsesOnlyOfficeConvertedPdfBackgroundWhenEnabled() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateAnalysisRepository.save(any(FormTemplateAnalysis.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateSourceRevisionRepository.save(any(FormTemplateSourceRevision.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateSourceRevisionRepository.countByTemplateIdAndVersionId(101L, 102L)).thenReturn(0);
        when(idGenerator.nextId()).thenReturn(341L, 342L, 343L, 344L, 345L);
        when(onlyOfficeDocumentConverter.convertToPdf(any(OnlyOfficeDocumentConverter.ConversionRequest.class))).thenReturn(samplePdfBytes());
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficeConverterUrl", "http://onlyoffice-document-server");
        ReflectionTestUtils.setField(controller, "onlyOfficePublicBackendUrl", "http://localhost:8081");
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "生产巡检记录.pdf",
                "application/pdf",
                samplePdfBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        assertThat(response.getData().version().sourceFileType()).isEqualTo("pdf");
        assertThat(response.getData().version().sourceFileId()).isEqualTo("341");
        assertThat(response.getData().modelDesign().get("source").get("fileId").asText()).isEqualTo("341");
        JsonNode canvasPage = response.getData().canvasDesign().get("pages").get(0);
        JsonNode analysisPage = response.getData().analysisDraft().get("pages").get(0);
        assertThat(canvasPage.get("background").get("fileId").asText()).isEqualTo("343");
        assertThat(canvasPage.get("background").get("url").asText()).isEqualTo("/api/v1/files/343/preview");
        assertThat(canvasPage.get("background").get("mimeType").asText()).isEqualTo("image/png");
        assertThat(canvasPage.get("layers")).isEmpty();
        assertThat(analysisPage.get("background").get("fileId").asText()).isEqualTo("343");
        assertThat(response.getData().analysisDraft().get("blocks")).isNotEmpty();
        assertThat(response.getData().fieldCandidates()).extracting(TemplateModelingController.TemplateFieldCandidateResponse::name)
                .contains("Batch No");
        ArgumentCaptor<OnlyOfficeDocumentConverter.ConversionRequest> requestCaptor = ArgumentCaptor.forClass(OnlyOfficeDocumentConverter.ConversionRequest.class);
        verify(onlyOfficeDocumentConverter).convertToPdf(requestCaptor.capture());
        assertThat(requestCaptor.getValue().documentServerUrl()).isEqualTo("http://onlyoffice-document-server");
        assertThat(requestCaptor.getValue().fileType()).isEqualTo("pdf");
        assertThat(requestCaptor.getValue().outputType()).isEqualTo("pdf");
    }

    @Test
    void importExcelTemplateSourceFileKeepsLocalCanvasWhenOnlyOfficeEnabled() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateAnalysisRepository.save(any(FormTemplateAnalysis.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateSourceRevisionRepository.save(any(FormTemplateSourceRevision.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateSourceRevisionRepository.countByTemplateIdAndVersionId(101L, 102L)).thenReturn(0);
        when(idGenerator.nextId()).thenReturn(331L, 332L, 333L, 334L, 335L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficePublicBackendUrl", "http://localhost:8081");
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "检验记录.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                sampleXlsxBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        assertThat(response.getData().version().sourceFileType()).isEqualTo("xlsx");
        assertThat(response.getData().version().sourceFileId()).isEqualTo("331");
        assertThat(response.getData().modelDesign().get("source").get("fileId").asText()).isEqualTo("331");
        JsonNode canvasPage = response.getData().canvasDesign().get("pages").get(0);
        JsonNode analysisPage = response.getData().analysisDraft().get("pages").get(0);
        assertThat(canvasPage.has("background")).isFalse();
        assertThat(canvasPage.get("layers"))
                .anySatisfy(layer -> assertThat(layer.get("type").asText()).isEqualTo("table"))
                .anySatisfy(layer -> {
                    assertThat(layer.get("type").asText()).isEqualTo("cell");
                    assertThat(layer.get("text").asText()).isEqualTo("批号");
                });
        assertThat(analysisPage.has("background")).isFalse();
        assertThat(response.getData().analysisDraft().get("blocks")).isNotEmpty();
        assertThat(response.getData().canvasDesign().get("interactiveFields")).hasSize(0);
        assertThat(response.getData().fieldCandidates()).extracting(TemplateModelingController.TemplateFieldCandidateResponse::name)
                .contains("批号", "检验结果");
        verify(onlyOfficeDocumentConverter, never()).convertToPdf(any(OnlyOfficeDocumentConverter.ConversionRequest.class));
    }

    @Test
    void importWordTemplateSourceFileWrapsOnlyOfficeIOExceptionAndCleansSourceFile() throws Exception {
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(331L, 332L);
        when(onlyOfficeDocumentConverter.convertToPdf(any(OnlyOfficeDocumentConverter.ConversionRequest.class)))
                .thenThrow(new IOException("OnlyOffice unavailable"));
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficePublicBackendUrl", "http://localhost:8081");
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "清场检查.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                sampleDocxBytes());

        assertThatThrownBy(() -> controller.importFormTemplateSourceFile(101L, 102L, file))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("OnlyOffice 文档转换失败");

        assertThat(Files.exists(tempDir.resolve("template-imports/101/102/331_清场检查.docx"))).isFalse();
        verify(formTemplateAnalysisRepository, never()).save(any(FormTemplateAnalysis.class));
        verify(formTemplateSourceRevisionRepository, never()).save(any(FormTemplateSourceRevision.class));
        verify(formTemplateVersionRepository, never()).save(any(FormTemplateVersion.class));
    }

    @Test
    void importWordTemplateSourceFileCleansSourceAndConvertedPdfWhenOnlyOfficeConvertedPdfCannotBeParsed() throws Exception {
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(331L, 332L, 333L);
        when(onlyOfficeDocumentConverter.convertToPdf(any(OnlyOfficeDocumentConverter.ConversionRequest.class)))
                .thenReturn("%PDF-1.4\nbroken".getBytes());
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficePublicBackendUrl", "http://localhost:8081");
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "清场检查.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                sampleDocxBytes());

        assertThatThrownBy(() -> controller.importFormTemplateSourceFile(101L, 102L, file))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("文件解析失败");

        assertThat(Files.exists(tempDir.resolve("template-imports/101/102/331_清场检查.docx"))).isFalse();
        assertThat(Files.exists(tempDir.resolve("template-imports/101/102/333_清场检查_onlyoffice.pdf"))).isFalse();
        verify(formTemplateAnalysisRepository, never()).save(any(FormTemplateAnalysis.class));
        verify(formTemplateSourceRevisionRepository, never()).save(any(FormTemplateSourceRevision.class));
        verify(formTemplateVersionRepository, never()).save(any(FormTemplateVersion.class));
    }

    @Test
    void importWordTemplateSourceFileUsesDocumentLandscapePageSize() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(321L, 322L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "横向清场检查.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                sampleLandscapeDocxBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        JsonNode page = response.getData().canvasDesign().get("pages").get(0);
        assertThat(response.getData().canvasDesign().get("orientation").asText()).isEqualTo("landscape");
        assertThat(page.get("orientation").asText()).isEqualTo("landscape");
        assertThat(page.get("width").asInt()).isGreaterThan(page.get("height").asInt());
    }

    @Test
    void importWordTemplateSourceFileRestoresParagraphStyleLayers() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(322L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "清场检查.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                sampleStyledDocxBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        assertThat(response.getData().canvasDesign().get("pages").get(0).get("layers"))
                .anySatisfy(layer -> {
                    assertThat(layer.get("type").asText()).isEqualTo("text");
                    assertThat(layer.get("text").asText()).isEqualTo("清场检查记录");
                    assertThat(layer.get("fontSize").asInt()).isGreaterThanOrEqualTo(20);
                    assertThat(layer.get("fontWeight").asText()).isEqualTo("bold");
                    assertThat(layer.get("textAlign").asText()).isEqualTo("center");
                    assertThat(layer.get("selectable").asBoolean()).isTrue();
                    assertThat(layer.get("draggable").asBoolean()).isTrue();
                });
    }

    @Test
    void importWordTemplateSourceFileProposesParagraphCandidateCoordinates() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(322L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "清场检查.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                sampleStyledDocxBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        JsonNode layers = response.getData().canvasDesign().get("pages").get(0).get("layers");
        JsonNode candidates = response.getData().analysisDraft().get("candidates");
        JsonNode titleLayer = null;
        JsonNode titleCandidate = null;
        for (JsonNode layer : layers) {
            if ("清场检查记录".equals(layer.path("text").asText())) titleLayer = layer;
        }
        for (JsonNode candidate : candidates) {
            if ("清场检查记录".equals(candidate.path("fieldName").asText())) titleCandidate = candidate;
        }

        assertThat(titleLayer).isNotNull();
        assertThat(titleCandidate).isNotNull();
        assertThat(titleCandidate.get("pageId").asText()).isEqualTo("page-1");
        assertThat(titleCandidate.get("labelBlockId").asText()).isEqualTo(titleLayer.get("id").asText());
        assertThat(titleCandidate.get("valueAnchor").get("x").asDouble()).isEqualTo(titleLayer.get("x").asDouble());
        assertThat(titleCandidate.get("valueAnchor").get("y").asDouble()).isEqualTo(titleLayer.get("y").asDouble());
        assertThat(titleCandidate.get("valueAnchor").get("width").asDouble()).isEqualTo(titleLayer.get("width").asDouble());
        assertThat(titleCandidate.get("valueAnchor").get("height").asDouble()).isEqualTo(titleLayer.get("height").asDouble());
        JsonNode titleBlock = findNodeByText(response.getData().analysisDraft().get("blocks"), "id", titleLayer.get("id").asText());
        assertThat(titleBlock).isNotNull();
        assertThat(titleBlock.get("sourceType").asText()).isEqualTo("word-paragraph");
        assertThat(titleBlock.get("sourceRef").get("paragraphIndex").asInt()).isEqualTo(0);
        assertThat(response.getData().canvasDesign().get("interactiveFields")).hasSize(0);
    }

    @Test
    void importWordTemplateSourceFileRecommendsDocumentTitleAsStaticText() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(322L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "清场检查.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                sampleStyledDocxBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        JsonNode titleCandidate = findNodeByText(response.getData().analysisDraft().get("candidates"), "fieldName", "清场检查记录");
        assertThat(titleCandidate).isNotNull();
        assertThat(titleCandidate.get("suggestedAction").asText()).isEqualTo("staticText");
        assertThat(titleCandidate.get("reason").asText()).contains("标题文本");
        assertThat(titleCandidate.get("sourceText").asText()).isEqualTo("清场检查记录");
        assertThat(titleCandidate.get("keyText").asText()).isEqualTo("清场检查记录");
        assertThat(titleCandidate.get("semanticRole").asText()).isEqualTo("staticText");
    }

    @Test
    void importWordTemplateSourceFileRequiresConfirmationForInstructionParagraphsAsStaticText() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(322L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "清场检查说明.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                sampleInstructionDocxBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        JsonNode instructionLayer = findNodeByText(response.getData().canvasDesign().get("pages").get(0).get("layers"), "text", "说明：请按实际状态填写，完成后签名。");
        JsonNode instructionCandidate = findNodeByText(response.getData().analysisDraft().get("candidates"), "fieldName", "说明：请按实际状态填写，完成后签名。");
        assertThat(instructionLayer).isNotNull();
        assertThat(instructionCandidate).isNotNull();
        assertThat(instructionCandidate.get("suggestedAction").asText()).isEqualTo("staticText");
        assertThat(instructionCandidate.get("semanticRole").asText()).isEqualTo("staticText");
        assertThat(instructionCandidate.get("reason").asText()).contains("说明性文本");
        assertThat(instructionCandidate.get("labelBlockId").asText()).isEqualTo(instructionLayer.get("id").asText());
        assertThat(instructionCandidate.get("valueAnchor").get("x").asDouble()).isEqualTo(instructionLayer.get("x").asDouble());
        assertThat(instructionCandidate.get("valueAnchor").get("y").asDouble()).isEqualTo(instructionLayer.get("y").asDouble());
    }

    @Test
    void importWordTemplateSourceFileRestoresTableCellLayers() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(323L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "清场检查.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                sampleDocxWithTableBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        assertThat(response.getData().fieldCandidates()).extracting(TemplateModelingController.TemplateFieldCandidateResponse::name)
                .contains("设备编号", "清洁确认");
        assertThat(response.getData().canvasDesign().get("pages").get(0).get("layers"))
                .anySatisfy(layer -> {
                    assertThat(layer.get("type").asText()).isEqualTo("table");
                    assertThat(layer.get("rows").asInt()).isEqualTo(2);
                    assertThat(layer.get("columns").asInt()).isEqualTo(2);
                });
        assertThat(response.getData().canvasDesign().get("pages").get(0).get("layers"))
                .anySatisfy(layer -> {
                    assertThat(layer.get("type").asText()).isEqualTo("cell");
                    assertThat(layer.get("text").asText()).isEqualTo("设备编号");
                    assertThat(layer.get("backgroundColor").asText()).isEqualTo("#D9EAF7");
                    assertThat(layer.get("fontWeight").asText()).isEqualTo("bold");
                    assertThat(layer.get("selectable").asBoolean()).isTrue();
                    assertThat(layer.get("draggable").asBoolean()).isTrue();
                });
    }

    @Test
    void importWordTemplateSourceFileRestoresTableCellTextAlignment() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(323L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "对齐清场检查.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                sampleDocxWithAlignedTableCellBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        assertThat(response.getData().canvasDesign().get("pages").get(0).get("layers"))
                .anySatisfy(layer -> {
                    assertThat(layer.get("type").asText()).isEqualTo("cell");
                    assertThat(layer.get("text").asText()).isEqualTo("复核结论");
                    assertThat(layer.get("textAlign").asText()).isEqualTo("right");
                    assertThat(layer.get("verticalAlign").asText()).isEqualTo("bottom");
                });
    }

    @Test
    void importWordTemplateSourceFileRestoresMergedTableCellSpan() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(323L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "合并单元格清场检查.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                sampleDocxWithMergedTableCellBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        JsonNode layers = response.getData().canvasDesign().get("pages").get(0).get("layers");
        JsonNode tableLayer = findNodeByText(layers, "id", "layer-word-table-0");
        JsonNode mergedCell = findNodeByText(layers, "text", "合并标题");
        assertThat(tableLayer).isNotNull();
        assertThat(tableLayer.get("columns").asInt()).isEqualTo(2);
        assertThat(mergedCell).isNotNull();
        assertThat(mergedCell.get("colSpan").asInt()).isEqualTo(2);
        assertThat(mergedCell.get("width").asDouble()).isGreaterThan(mergedCell.get("height").asDouble() * 2);
        assertThat(response.getData().analysisDraft().get("blocks"))
                .anySatisfy(block -> {
                    assertThat(block.get("text").asText()).isEqualTo("合并标题");
                    assertThat(block.get("sourceType").asText()).isEqualTo("word-table-cell");
                    assertThat(block.get("sourceRef").get("tableIndex").asInt()).isEqualTo(0);
                    assertThat(block.get("sourceRef").get("rowIndex").asInt()).isEqualTo(0);
                    assertThat(block.get("sourceRef").get("columnIndex").asInt()).isEqualTo(0);
                });
    }

    @Test
    void importWordTemplateSourceFileRestoresVerticalMergedTableCellSpan() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(323L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "纵向合并单元格清场检查.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                sampleDocxWithVerticalMergedTableCellBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        JsonNode layers = response.getData().canvasDesign().get("pages").get(0).get("layers");
        JsonNode mergedCell = findNodeByText(layers, "text", "纵向合并项");
        JsonNode rightTopCell = findNodeByText(layers, "text", "上层确认");
        JsonNode rightBottomCell = findNodeByText(layers, "text", "下层确认");
        assertThat(mergedCell).isNotNull();
        assertThat(rightTopCell).isNotNull();
        assertThat(rightBottomCell).isNotNull();
        assertThat(mergedCell.get("rowSpan").asInt()).isEqualTo(2);
        assertThat(mergedCell.get("height").asDouble()).isEqualTo(rightTopCell.get("height").asDouble() + rightBottomCell.get("height").asDouble());
        assertThat(mergedCell.get("colSpan").asInt()).isEqualTo(1);
        assertThat(response.getData().analysisDraft().get("blocks"))
                .anySatisfy(block -> {
                    assertThat(block.get("text").asText()).isEqualTo("纵向合并项");
                    assertThat(block.get("sourceType").asText()).isEqualTo("word-table-cell");
                    assertThat(block.path("rowSpan").asInt()).isEqualTo(2);
                    assertThat(block.path("colSpan").asInt()).isEqualTo(1);
                    assertThat(block.path("height").asDouble()).isEqualTo(mergedCell.get("height").asDouble());
                    assertThat(block.path("backgroundColor").asText()).isEqualTo(mergedCell.get("backgroundColor").asText());
                    assertThat(block.path("textAlign").asText()).isEqualTo(mergedCell.get("textAlign").asText());
                    assertThat(block.path("verticalAlign").asText()).isEqualTo(mergedCell.get("verticalAlign").asText());
                    assertThat(block.get("sourceRef").get("rowIndex").asInt()).isEqualTo(0);
                    assertThat(block.get("sourceRef").get("columnIndex").asInt()).isEqualTo(0);
                });
    }

    @Test
    void importWordTemplateSourceFileRestoresEmbeddedImageLayers() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(324L, 325L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "带图片清场检查.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                sampleDocxWithImageBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        assertThat(response.getData().canvasDesign().get("pages").get(0).get("layers"))
                .anySatisfy(layer -> {
                    assertThat(layer.get("type").asText()).isEqualTo("image");
                    assertThat(layer.get("fileId").asText()).isEqualTo("325");
                    assertThat(layer.get("url").asText()).isEqualTo("/api/v1/files/325/preview");
                    assertThat(layer.get("mimeType").asText()).isEqualTo("image/png");
                    assertThat(layer.get("width").asDouble()).isEqualTo(96);
                    assertThat(layer.get("height").asDouble()).isEqualTo(48);
                    assertThat(layer.get("objectFit").asText()).isEqualTo("contain");
                    assertThat(layer.get("selectable").asBoolean()).isTrue();
                    assertThat(layer.get("draggable").asBoolean()).isTrue();
                    assertThat(layer.get("resizable").asBoolean()).isTrue();
                });
        assertThat(Files.exists(tempDir.resolve("template-imports/101/102/325_embedded_image_1.png"))).isTrue();
    }

    @Test
    void importWordTemplateSourceFileProposesTableCellCandidateCoordinates() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(323L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "清场检查.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                sampleDocxWithTableBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        JsonNode layers = response.getData().canvasDesign().get("pages").get(0).get("layers");
        JsonNode candidates = response.getData().analysisDraft().get("candidates");
        JsonNode deviceCell = null;
        JsonNode deviceCandidate = null;
        for (JsonNode layer : layers) {
            if ("设备编号".equals(layer.path("text").asText())) deviceCell = layer;
        }
        for (JsonNode candidate : candidates) {
            if ("设备编号".equals(candidate.path("fieldName").asText())) deviceCandidate = candidate;
        }

        assertThat(deviceCell).isNotNull();
        assertThat(deviceCandidate).isNotNull();
        assertThat(deviceCandidate.get("labelBlockId").asText()).isEqualTo(deviceCell.get("id").asText());
        assertThat(deviceCandidate.get("sourceText").asText()).isEqualTo("设备编号");
        assertThat(deviceCandidate.get("keyText").asText()).isEqualTo("设备编号");
        assertThat(deviceCandidate.get("semanticRole").asText()).isEqualTo("keyValue");
        assertThat(deviceCandidate.get("valueAnchor").get("x").asDouble()).isEqualTo(deviceCell.get("x").asDouble());
        assertThat(deviceCandidate.get("valueAnchor").get("y").asDouble()).isEqualTo(deviceCell.get("y").asDouble());
        assertThat(deviceCandidate.get("valueAnchor").get("width").asDouble()).isEqualTo(deviceCell.get("width").asDouble());
        assertThat(deviceCandidate.get("valueAnchor").get("height").asDouble()).isEqualTo(deviceCell.get("height").asDouble());
        JsonNode deviceBlock = findNodeByText(response.getData().analysisDraft().get("blocks"), "id", deviceCell.get("id").asText());
        assertThat(deviceBlock).isNotNull();
        assertThat(deviceBlock.get("sourceType").asText()).isEqualTo("word-table-cell");
        assertThat(deviceBlock.get("sourceRef").get("tableIndex").asInt()).isEqualTo(0);
        assertThat(deviceBlock.get("sourceRef").get("rowIndex").asInt()).isEqualTo(0);
        assertThat(deviceBlock.get("sourceRef").get("columnIndex").asInt()).isEqualTo(0);
        assertThat(response.getData().canvasDesign().get("interactiveFields")).hasSize(0);
    }

    @Test
    void importExcelTemplateSourceFileCreatesLandscapeTableCanvas() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(331L, 332L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "检验记录.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                sampleXlsxBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        assertThat(response.getData().version().sourceFileType()).isEqualTo("xlsx");
        assertThat(response.getData().fieldCandidates()).extracting(TemplateModelingController.TemplateFieldCandidateResponse::name)
                .contains("批号", "检验结果");
        assertThat(response.getData().canvasDesign().get("orientation").asText()).isEqualTo("landscape");
        assertThat(response.getData().canvasDesign().get("pages").get(0).get("layers"))
                .anySatisfy(layer -> assertThat(layer.get("type").asText()).isEqualTo("table"));
        JsonNode page = response.getData().canvasDesign().get("pages").get(0);
        JsonNode tableLayer = findNodeByText(page.get("layers"), "type", "table");
        assertThat(tableLayer).isNotNull();
        assertThat(page.get("width").asDouble()).isCloseTo(
                tableLayer.get("x").asDouble() + tableLayer.get("width").asDouble() + 48,
                org.assertj.core.data.Offset.offset(1.0));
        assertThat(page.get("height").asDouble()).isCloseTo(
                tableLayer.get("y").asDouble() + tableLayer.get("height").asDouble() + 48,
                org.assertj.core.data.Offset.offset(1.0));
        assertThat(response.getData().canvasDesign().get("pages").get(0).get("layers"))
                .anySatisfy(layer -> {
                    assertThat(layer.get("type").asText()).isEqualTo("cell");
                    assertThat(layer.get("text").asText()).isEqualTo("批号");
                    assertThat(layer.get("backgroundColor").asText()).isEqualTo("#CCCCFF");
                    assertThat(layer.get("fontWeight").asText()).isEqualTo("bold");
                    assertThat(layer.get("textAlign").asText()).isEqualTo("center");
                    assertThat(layer.get("borderTop").asText()).isEqualTo("solid");
                    assertThat(layer.get("borderRight").asText()).isEqualTo("solid");
                    assertThat(layer.get("borderBottom").asText()).isEqualTo("solid");
                    assertThat(layer.get("borderLeft").asText()).isEqualTo("solid");
                });
        var layers = response.getData().canvasDesign().get("pages").get(0).get("layers");
        JsonNode batchCell = null;
        JsonNode resultCell = null;
        for (JsonNode layer : layers) {
            if ("批号".equals(layer.path("text").asText())) batchCell = layer;
            if ("检验结果".equals(layer.path("text").asText())) resultCell = layer;
        }
        assertThat(batchCell).isNotNull();
        assertThat(resultCell).isNotNull();
        assertThat(resultCell.get("x").asDouble()).isEqualTo(batchCell.get("x").asDouble() + batchCell.get("width").asDouble());
        assertThat(response.getData().canvasDesign().get("coordinateSystem").get("origin").asText()).isEqualTo("top-left");
    }

    @Test
    void importExcelTemplateSourceFilePaginatesLongSheetsAndKeepsBorders() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("长表单").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(331L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "长表格检验记录.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                sampleLongBorderedXlsxBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        JsonNode pages = response.getData().canvasDesign().get("pages");
        assertThat(pages).hasSizeGreaterThan(1);
        assertThat(pages.get(0).get("layers")).anySatisfy(layer -> {
            assertThat(layer.get("type").asText()).isEqualTo("cell");
            assertThat(layer.get("text").asText()).isEqualTo("记录-1");
            assertThat(layer.get("borderTop").asText()).isEqualTo("solid");
            assertThat(layer.get("borderRight").asText()).isEqualTo("solid");
            assertThat(layer.get("borderBottom").asText()).isEqualTo("solid");
            assertThat(layer.get("borderLeft").asText()).isEqualTo("solid");
            assertThat(layer.get("selectable").asBoolean()).isFalse();
            assertThat(layer.get("draggable").asBoolean()).isFalse();
        });
        assertThat(pages.get(pages.size() - 1).get("layers"))
                .anySatisfy(layer -> assertThat(layer.path("text").asText()).isEqualTo("记录-35"));
    }

    @Test
    void importExcelTemplateSourceFileKeepsBordersWhenXlsxStyleOnlyUsesBorderId() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("兼容边框表单").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(331L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "openpyxl风格边框.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                sampleBorderIdOnlyXlsxBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        assertThat(response.getData().canvasDesign().get("pages").get(0).get("layers"))
                .anySatisfy(layer -> {
                    assertThat(layer.path("type").asText()).isEqualTo("cell");
                    assertThat(layer.path("text").asText()).isEqualTo("记录-1");
                    assertThat(layer.path("borderTop").asText()).isEqualTo("solid");
                    assertThat(layer.path("borderRight").asText()).isEqualTo("solid");
                    assertThat(layer.path("borderBottom").asText()).isEqualTo("solid");
                    assertThat(layer.path("borderLeft").asText()).isEqualTo("solid");
                    assertThat(layer.path("borderColor").asText()).isEqualTo("#303133");
                });
    }

    @Test
    void importExcelTemplateSourceFileUsesSheetPortraitPrintSetup() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(331L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "竖向检验记录.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                samplePortraitXlsxBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        JsonNode page = response.getData().canvasDesign().get("pages").get(0);
        JsonNode tableLayer = findNodeByText(page.get("layers"), "type", "table");
        assertThat(tableLayer).isNotNull();
        assertThat(response.getData().canvasDesign().get("orientation").asText()).isEqualTo("portrait");
        assertThat(page.get("orientation").asText()).isEqualTo("portrait");
        assertThat(page.get("width").asDouble()).isCloseTo(
                tableLayer.get("x").asDouble() + tableLayer.get("width").asDouble() + 48,
                org.assertj.core.data.Offset.offset(1.0));
        assertThat(page.get("height").asDouble()).isCloseTo(
                tableLayer.get("y").asDouble() + tableLayer.get("height").asDouble() + 48,
                org.assertj.core.data.Offset.offset(1.0));
    }

    @Test
    void importExcelTemplateSourceFileProposesDetectedCellCandidateCoordinates() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(331L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "检验记录.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                sampleXlsxBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        JsonNode layers = response.getData().canvasDesign().get("pages").get(0).get("layers");
        JsonNode candidates = response.getData().analysisDraft().get("candidates");
        JsonNode batchCell = null;
        JsonNode batchCandidate = null;
        for (JsonNode layer : layers) {
            if ("批号".equals(layer.path("text").asText())) batchCell = layer;
        }
        for (JsonNode candidate : candidates) {
            if ("批号".equals(candidate.path("fieldName").asText())) batchCandidate = candidate;
        }

        assertThat(batchCell).isNotNull();
        assertThat(batchCandidate).isNotNull();
        assertThat(batchCandidate.get("pageId").asText()).isEqualTo("page-1");
        assertThat(batchCandidate.get("labelBlockId").asText()).isEqualTo(batchCell.get("id").asText());
        assertThat(batchCandidate.get("valueAnchor").get("x").asDouble()).isEqualTo(batchCell.get("x").asDouble());
        assertThat(batchCandidate.get("valueAnchor").get("y").asDouble()).isEqualTo(batchCell.get("y").asDouble());
        assertThat(batchCandidate.get("valueAnchor").get("width").asDouble()).isEqualTo(batchCell.get("width").asDouble());
        assertThat(batchCandidate.get("valueAnchor").get("height").asDouble()).isEqualTo(batchCell.get("height").asDouble());
        JsonNode batchBlock = findNodeByText(response.getData().analysisDraft().get("blocks"), "id", batchCell.get("id").asText());
        assertThat(batchBlock).isNotNull();
        assertThat(batchBlock.get("sourceType").asText()).isEqualTo("excel-cell");
        assertThat(batchBlock.get("sourceRef").get("cellAddress").asText()).isEqualTo("A1");
        assertThat(response.getData().canvasDesign().get("interactiveFields")).hasSize(0);
    }

    @Test
    void importExcelTemplateSourceFileUsesRightBlankCellAsKeyValueAnchor() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(331L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "键值检验记录.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                sampleXlsxWithRightBlankValueCellBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        JsonNode layers = response.getData().canvasDesign().get("pages").get(0).get("layers");
        JsonNode labelCell = findNodeByText(layers, "text", "批号：");
        JsonNode blankValueCell = findNodeByText(layers, "id", "layer-cell-0-1");
        JsonNode batchCandidate = findNodeByText(response.getData().analysisDraft().get("candidates"), "fieldName", "批号");
        assertThat(labelCell).isNotNull();
        assertThat(blankValueCell).isNotNull();
        assertThat(blankValueCell.get("text").asText()).isEmpty();
        assertThat(batchCandidate).isNotNull();
        assertThat(batchCandidate.get("suggestedAction").asText()).isEqualTo("component");
        assertThat(batchCandidate.get("labelBlockId").asText()).isEqualTo(labelCell.get("id").asText());
        assertThat(batchCandidate.get("valueAnchor").get("x").asDouble()).isEqualTo(blankValueCell.get("x").asDouble());
        assertThat(batchCandidate.get("valueAnchor").get("y").asDouble()).isEqualTo(blankValueCell.get("y").asDouble());
        assertThat(batchCandidate.get("valueAnchor").get("width").asDouble()).isEqualTo(blankValueCell.get("width").asDouble());
        assertThat(batchCandidate.get("valueAnchor").get("height").asDouble()).isEqualTo(blankValueCell.get("height").asDouble());
        assertThat(batchCandidate.get("pairing").get("strategy").asText()).isEqualTo("right-blank-cell");
        assertThat(batchCandidate.get("pairing").get("valueSourceRef").get("cellAddress").asText()).isEqualTo("B1");
        assertThat(response.getData().canvasDesign().get("interactiveFields")).hasSize(0);
    }

    @Test
    void importExcelTemplateSourceFileAutoFitsWrappedRowsWithoutOverlap() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(331L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "长文本行高检验.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                sampleWrappedRowHeightXlsxBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        JsonNode layers = response.getData().canvasDesign().get("pages").get(0).get("layers");
        JsonNode tableLayer = findNodeByText(layers, "type", "table");
        JsonNode longTextCell = findNodeByText(layers, "id", "layer-cell-0-0");
        JsonNode nextRowCell = findNodeByText(layers, "id", "layer-cell-1-0");
        assertThat(tableLayer).isNotNull();
        assertThat(longTextCell).isNotNull();
        assertThat(nextRowCell).isNotNull();
        assertThat(longTextCell.get("height").asDouble()).isGreaterThan(64);
        assertThat(nextRowCell.get("y").asDouble()).isEqualTo(longTextCell.get("y").asDouble() + longTextCell.get("height").asDouble());
        assertThat(tableLayer.get("height").asDouble()).isEqualTo(longTextCell.get("height").asDouble() + nextRowCell.get("height").asDouble());
        assertThat(longTextCell.get("borderBottom").asText()).isEqualTo("solid");
        assertThat(nextRowCell.get("borderTop").asText()).isEqualTo("solid");
    }

    @Test
    void importExcelTemplateSourceFileSuggestsTextAreaForLongTextFields() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(331L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "处理意见记录.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                sampleXlsxWithTextAreaFieldBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        JsonNode opinionCandidate = findNodeByText(response.getData().analysisDraft().get("candidates"), "fieldName", "处理意见");
        assertThat(opinionCandidate).isNotNull();
        assertThat(opinionCandidate.get("suggestedAction").asText()).isEqualTo("component");
        assertThat(opinionCandidate.get("suggestedComponent").asText()).isEqualTo("TextArea");
        assertThat(response.getData().fieldCandidates())
                .anySatisfy(candidate -> {
                    assertThat(candidate.name()).isEqualTo("处理意见");
                    assertThat(candidate.type()).isEqualTo("textarea");
                    assertThat(candidate.suggestedComponent()).isEqualTo("TextArea");
                });
        assertThat(response.getData().canvasDesign().get("interactiveFields")).hasSize(0);
    }

    @Test
    void importExcelTemplateSourceFileKeepsIdentifierFieldsAsTextInput() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(331L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "设备编号记录.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                samplePortraitXlsxBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        JsonNode identifierCandidate = findNodeByText(response.getData().analysisDraft().get("candidates"), "fieldName", "设备编号");
        assertThat(identifierCandidate).isNotNull();
        assertThat(identifierCandidate.get("suggestedComponent").asText()).isEqualTo("TextInput");
        assertThat(response.getData().fieldCandidates())
                .anySatisfy(candidate -> {
                    assertThat(candidate.name()).isEqualTo("设备编号");
                    assertThat(candidate.type()).isEqualTo("text");
                    assertThat(candidate.suggestedComponent()).isEqualTo("TextInput");
                });
    }

    @Test
    void importExcelTemplateSourceFileSuggestsSignaturePadForSignatureFields() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(331L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "签名检验记录.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                sampleXlsxWithSignatureFieldBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        JsonNode signatureCandidate = findNodeByText(response.getData().analysisDraft().get("candidates"), "fieldName", "操作人签名");
        assertThat(signatureCandidate).isNotNull();
        assertThat(signatureCandidate.get("suggestedAction").asText()).isEqualTo("component");
        assertThat(signatureCandidate.get("suggestedComponent").asText()).isEqualTo("SignaturePad");
        assertThat(response.getData().fieldCandidates())
                .anySatisfy(candidate -> {
                    assertThat(candidate.name()).isEqualTo("操作人签名");
                    assertThat(candidate.type()).isEqualTo("signature");
                    assertThat(candidate.suggestedComponent()).isEqualTo("SignaturePad");
                });
    }

    @Test
    void importExcelTemplateSourceFileRestoresMergedCellSpan() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(333L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "合并单元格检验记录.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                sampleMergedCellXlsxBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        JsonNode layers = response.getData().canvasDesign().get("pages").get(0).get("layers");
        JsonNode titleCell = null;
        JsonNode leftHeaderCell = null;
        JsonNode rightHeaderCell = null;
        for (JsonNode layer : layers) {
            if ("合并标题".equals(layer.path("text").asText())) titleCell = layer;
            if ("左列".equals(layer.path("text").asText())) leftHeaderCell = layer;
            if ("右列".equals(layer.path("text").asText())) rightHeaderCell = layer;
        }

        assertThat(titleCell).isNotNull();
        assertThat(leftHeaderCell).isNotNull();
        assertThat(rightHeaderCell).isNotNull();
        assertThat(titleCell.get("colSpan").asInt()).isEqualTo(2);
        assertThat(titleCell.get("rowSpan").asInt()).isEqualTo(1);
        assertThat(titleCell.get("width").asDouble()).isEqualTo(leftHeaderCell.get("width").asDouble() + rightHeaderCell.get("width").asDouble());
        assertThat(titleCell.get("textAlign").asText()).isEqualTo("center");
    }

    @Test
    void importExcelTemplateSourceFileKeepsDisplayedCellValues() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(331L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "格式化单元格.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                sampleFormattedCellXlsxBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        JsonNode layers = response.getData().canvasDesign().get("pages").get(0).get("layers");
        assertThat(layers)
                .anySatisfy(layer -> assertThat(layer.path("text").asText()).isEqualTo("00123"))
                .anySatisfy(layer -> assertThat(layer.path("text").asText()).isEqualTo("98.50%"));
        assertThat(layers.toString()).doesNotContain("123.0", "0.985", "B1");
    }

    @Test
    void importExcelTemplateSourceFileRestoresEmbeddedImageLayers() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(331L, 332L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "带图片检验记录.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                sampleXlsxWithImageBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        assertThat(response.getData().canvasDesign().get("pages").get(0).get("layers"))
                .anySatisfy(layer -> {
                    assertThat(layer.get("type").asText()).isEqualTo("image");
                    assertThat(layer.get("fileId").asText()).isEqualTo("332");
                    assertThat(layer.get("url").asText()).isEqualTo("/api/v1/files/332/preview");
                    assertThat(layer.get("mimeType").asText()).isEqualTo("image/png");
                    assertThat(layer.get("x").asDouble()).isEqualTo(192);
                    assertThat(layer.get("y").asDouble()).isEqualTo(80);
                    assertThat(layer.get("width").asDouble()).isEqualTo(96);
                    assertThat(layer.get("height").asDouble()).isEqualTo(48);
                    assertThat(layer.get("objectFit").asText()).isEqualTo("contain");
                    assertThat(layer.get("selectable").asBoolean()).isFalse();
                    assertThat(layer.get("draggable").asBoolean()).isFalse();
                    assertThat(layer.get("resizable").asBoolean()).isFalse();
                });
        assertThat(Files.exists(tempDir.resolve("template-imports/101/102/332_excel_image_1.png"))).isTrue();
    }

    @Test
    void importFormTemplateSourceFileReplacesExistingModelAndCanvasDesign() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder()
                .id(102L)
                .tenantId("default")
                .templateId(101L)
                .version("V1.0")
                .modelDesignJson("{\"fields\":[{\"code\":\"old_field\",\"name\":\"旧字段\"}]}")
                .canvasDesignJson("{\"pages\":[{\"id\":\"old-page\",\"layers\":[{\"id\":\"old-layer\",\"type\":\"text\",\"text\":\"旧画布\"}]}],\"interactiveFields\":[{\"id\":\"old_field\",\"code\":\"old_field\",\"pageId\":\"old-page\",\"x\":1,\"y\":1,\"width\":10,\"height\":10}],\"fieldBindings\":[{\"fieldCode\":\"old_field\",\"sourceLayerId\":\"old-layer\"}]}")
                .build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(351L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "检验记录.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                sampleXlsxBytes());

        var response = controller.importFormTemplateSourceFile(101L, 102L, file);

        JsonNode modelDesign = objectMapper.readTree(response.getData().version().modelDesignJson());
        JsonNode canvasDesign = objectMapper.readTree(response.getData().version().canvasDesignJson());
        assertThat(modelDesign.toString()).doesNotContain("old_field", "旧字段");
        assertThat(canvasDesign.toString()).doesNotContain("old-page", "old-layer", "旧画布", "old_field");
        assertThat(canvasDesign.get("pages").get(0).get("id").asText()).isEqualTo("page-1");
        assertThat(canvasDesign.get("pages").get(0).get("layers"))
                .anySatisfy(layer -> assertThat(layer.path("text").asText()).isEqualTo("批号"));
        assertThat(canvasDesign.get("fieldBindings")).hasSize(0);
        assertThat(response.getData().analysisDraft().get("candidates"))
                .anySatisfy(candidate -> assertThat(candidate.path("fieldName").asText()).isEqualTo("批号"));
    }

    @Test
    void importFormTemplateSourceFileRejectsPowerPointBecausePptIsOutOfScope() {
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "生产过程流转卡.pptx",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                new byte[] {1, 2, 3});

        assertThatThrownBy(() -> controller.importFormTemplateSourceFile(101L, 102L, file))
                .hasMessageContaining("仅支持 PDF、Word、Excel、图片")
                .hasMessageNotContaining("PPT");

        verify(formTemplateVersionRepository, never()).save(any(FormTemplateVersion.class));
    }

    @Test
    void importFormTemplateSourceFileRejectsUnsupportedFileTypeWithFriendlyMessage() {
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        MockMultipartFile file = new MockMultipartFile("file", "archive.zip", "application/zip", new byte[] {1, 2, 3});

        assertThatThrownBy(() -> controller.importFormTemplateSourceFile(101L, 102L, file))
                .hasMessageContaining("仅支持 PDF、Word、Excel、图片")
                .hasMessageNotContaining("PPT");

        verify(formTemplateVersionRepository, never()).save(any(FormTemplateVersion.class));
    }

    @Test
    void importFormTemplateSourceFileRejectsBrokenPdfWithFriendlyMessage() {
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(301L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile("file", "broken.pdf", "application/pdf", "%PDF-1.4\nbroken".getBytes());

        assertThatThrownBy(() -> controller.importFormTemplateSourceFile(101L, 102L, file))
                .hasMessageContaining("文件解析失败");

        assertThat(Files.exists(tempDir.resolve("template-imports/101/102/301_broken.pdf"))).isFalse();
        verify(formTemplateVersionRepository, never()).save(any(FormTemplateVersion.class));
    }

    @Test
    void importFormTemplateSourceFileRejectsBrokenExcelWithFriendlyMessage() {
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(301L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "broken.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                new byte[] {1, 2, 3});

        assertThatThrownBy(() -> controller.importFormTemplateSourceFile(101L, 102L, file))
                .hasMessageContaining("文件解析失败");

        assertThat(Files.exists(tempDir.resolve("template-imports/101/102/301_broken.xlsx"))).isFalse();
        verify(formTemplateVersionRepository, never()).save(any(FormTemplateVersion.class));
    }

    @Test
    void getFormTemplateOnlyOfficeConfigRequiresEnabledServiceAndSourceFile() {
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").sourceFileId(301L).sourceFileName("生产巡检记录.xlsx").sourceFileType("xlsx").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficeDocumentServerUrl", "http://localhost:8088");
        ReflectionTestUtils.setField(controller, "onlyOfficePublicBackendUrl", "http://localhost:8081");
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");

        var response = controller.getFormTemplateOnlyOfficeConfig(101L, 102L);

        assertThat(response.getData().get("documentType")).isEqualTo("cell");
        JsonNode config = objectMapper.valueToTree(response.getData());
        assertThat(config.get("document").get("key").asText()).isEqualTo("form-template-102-301");
        assertThat(config.get("document").get("url").asText()).contains("/api/v1/master-data/template-modeling/form-templates/101/versions/102/onlyoffice/source?token=");
        assertThat(config.get("document").get("url").asText()).doesNotContain("/api/v1/files/301/preview");
        JsonNode permissions = config.get("document").get("permissions");
        assertThat(permissions).isNotNull();
        assertThat(permissions.get("edit").asBoolean()).isTrue();
        assertThat(permissions.get("download").asBoolean()).isFalse();
        assertThat(permissions.get("print").asBoolean()).isFalse();
        assertThat(config.get("editorConfig").get("callbackUrl").asText()).contains("/onlyoffice/callback");
        assertThat(response.getData().get("documentServerUrl")).isEqualTo("http://localhost:8088");
        assertThat(response.getData().get("token")).isNotNull();
        JsonNode tokenDocument = objectMapper.valueToTree(com.auth0.jwt.JWT.decode(String.valueOf(response.getData().get("token"))).getClaim("document").asMap());
        assertThat(tokenDocument.get("permissions").get("edit").asBoolean()).isTrue();
        assertThat(tokenDocument.get("permissions").get("download").asBoolean()).isFalse();
    }

    @Test
    void getFormTemplateOnlyOfficeConfigKeepsPdfViewOnly() {
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").sourceFileId(301L).sourceFileName("生产巡检记录.pdf").sourceFileType("pdf").build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficeDocumentServerUrl", "http://localhost:8088");
        ReflectionTestUtils.setField(controller, "onlyOfficePublicBackendUrl", "http://localhost:8081");
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");

        var response = controller.getFormTemplateOnlyOfficeConfig(101L, 102L);

        JsonNode config = objectMapper.valueToTree(response.getData());
        assertThat(response.getData().get("documentType")).isEqualTo("pdf");
        assertThat(config.get("editorConfig").get("mode").asText()).isEqualTo("view");
        JsonNode permissions = config.get("document").get("permissions");
        assertThat(permissions).isNotNull();
        assertThat(permissions.get("edit").asBoolean()).isFalse();
        assertThat(permissions.get("download").asBoolean()).isFalse();
        assertThat(permissions.get("print").asBoolean()).isFalse();
    }

    @Test
    void getFormTemplateOnlyOfficeSourceRequiresSignedTokenForExpectedSourceFile() throws Exception {
        Path sourcePath = tempDir.resolve("onlyoffice-source.xlsx");
        Files.write(sourcePath, new byte[] {1, 2, 3});
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").sourceFileId(301L).sourceFileName("生产巡检记录.xlsx").sourceFileType("xlsx").build();
        FileObject sourceFile = FileObject.builder()
                .id(301L)
                .originalName("生产巡检记录.xlsx")
                .storedPath(sourcePath.toString())
                .mimeType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .fileSize(3L)
                .targetType("FORM_TEMPLATE_SOURCE")
                .targetId("102")
                .build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(fileObjectRepository.findById(301L)).thenReturn(Optional.of(sourceFile));
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficePublicBackendUrl", "http://localhost:8081");
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
        var configResponse = controller.getFormTemplateOnlyOfficeConfig(101L, 102L);
        String token = String.valueOf(objectMapper.valueToTree(configResponse.getData()).get("document").get("url").asText()).split("token=", 2)[1];
        assertThat(com.auth0.jwt.JWT.decode(token).getExpiresAt()).isAfter(Date.from(Instant.now()));

        var response = controller.getFormTemplateOnlyOfficeSource(101L, 102L, token);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getHeaders().getContentType().toString()).isEqualTo("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        assertThat(response.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION)).contains("inline");
    }

    @Test
    void getFormTemplateOnlyOfficeSourceRequiresEnabledServiceAndSourceFileOwnership() throws Exception {
        Path sourcePath = tempDir.resolve("wrong-owner.xlsx");
        Files.write(sourcePath, new byte[] {1, 2, 3});
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").sourceFileId(301L).sourceFileName("生产巡检记录.xlsx").sourceFileType("xlsx").build();
        FileObject wrongOwnerFile = FileObject.builder()
                .id(301L)
                .originalName("生产巡检记录.xlsx")
                .storedPath(sourcePath.toString())
                .mimeType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .fileSize(3L)
                .targetType("DHR_ATTACHMENT")
                .targetId("102")
                .build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficePublicBackendUrl", "http://localhost:8081");
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
        var configResponse = controller.getFormTemplateOnlyOfficeConfig(101L, 102L);
        String token = String.valueOf(objectMapper.valueToTree(configResponse.getData()).get("document").get("url").asText()).split("token=", 2)[1];
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", false);

        assertThatThrownBy(() -> controller.getFormTemplateOnlyOfficeSource(101L, 102L, token))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("OnlyOffice 文档服务未启用");

        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        when(fileObjectRepository.findById(301L)).thenReturn(Optional.of(wrongOwnerFile));
        assertThatThrownBy(() -> controller.getFormTemplateOnlyOfficeSource(101L, 102L, token))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("OnlyOffice 源文件不属于当前模板版本");
    }

    @Test
    void getFormTemplateOnlyOfficeSourceRejectsInvalidOrMismatchedToken() {
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").sourceFileId(301L).sourceFileName("生产巡检记录.xlsx").sourceFileType("xlsx").build();
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
        String mismatchedToken = com.auth0.jwt.JWT.create()
                .withClaim("purpose", "onlyoffice-source")
                .withClaim("templateId", "101")
                .withClaim("versionId", "999")
                .withClaim("sourceFileId", "301")
                .withClaim("key", "form-template-999-301")
                .sign(com.auth0.jwt.algorithms.Algorithm.HMAC256("test-secret"));

        assertThatThrownBy(() -> controller.getFormTemplateOnlyOfficeSource(101L, 102L, "bad-token"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("OnlyOffice 源文件签名校验失败");
        assertThatThrownBy(() -> controller.getFormTemplateOnlyOfficeSource(101L, 102L, mismatchedToken))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("OnlyOffice 源文件签名校验失败");
        verify(fileObjectRepository, never()).findById(any());
    }

    @Test
    void getFormTemplateOnlyOfficeSourceRejectsExpiredSourceToken() {
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").sourceFileId(301L).sourceFileName("生产巡检记录.xlsx").sourceFileType("xlsx").build();
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
        String expiredToken = com.auth0.jwt.JWT.create()
                .withClaim("purpose", "onlyoffice-source")
                .withClaim("templateId", "101")
                .withClaim("versionId", "102")
                .withClaim("sourceFileId", "301")
                .withClaim("key", "form-template-102-301")
                .withExpiresAt(Date.from(Instant.now().minusSeconds(60)))
                .sign(com.auth0.jwt.algorithms.Algorithm.HMAC256("test-secret"));

        assertThatThrownBy(() -> controller.getFormTemplateOnlyOfficeSource(101L, 102L, expiredToken))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("OnlyOffice 源文件签名校验失败");
        verify(fileObjectRepository, never()).findById(any());
    }

    @Test
    void getFormTemplateOnlyOfficeConversionSourceLoadsCurrentFileFromRepository() throws Exception {
        Path sourcePath = tempDir.resolve("conversion-source.xlsx");
        Files.write(sourcePath, new byte[] {1, 2, 3});
        FileObject sourceFile = FileObject.builder()
                .id(301L)
                .tenantId("default")
                .originalName("生产巡检记录.xlsx")
                .storedPath(sourcePath.toString())
                .mimeType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .fileSize(3L)
                .targetType("FORM_TEMPLATE_SOURCE")
                .targetId("102")
                .build();
        when(fileObjectRepository.findById(301L)).thenReturn(Optional.of(sourceFile));
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
        String token = com.auth0.jwt.JWT.create()
                .withClaim("purpose", "onlyoffice-conversion-source")
                .withClaim("templateId", "101")
                .withClaim("versionId", "102")
                .withClaim("sourceFileId", "301")
                .withClaim("targetId", "102")
                .withClaim("storedPath", tempDir.resolve("forged.xlsx").toString())
                .withClaim("originalName", "forged.xlsx")
                .withClaim("mimeType", "application/octet-stream")
                .sign(com.auth0.jwt.algorithms.Algorithm.HMAC256("test-secret"));

        var response = controller.getFormTemplateOnlyOfficeConversionSource(101L, 102L, token);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getHeaders().getContentType().toString()).isEqualTo("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        assertThat(response.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION)).contains("inline");
        verify(fileObjectRepository).findById(301L);
    }

    @Test
    void getFormTemplateOnlyOfficeConversionSourceCanServeSignedUncommittedImportFile() throws Exception {
        Path sourcePath = tempDir.resolve("template-imports/101/102/conversion-source.pdf");
        Files.createDirectories(sourcePath.getParent());
        Files.write(sourcePath, new byte[] {1, 2, 3, 4});
        when(fileObjectRepository.findById(301L)).thenReturn(Optional.empty());
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
        String token = com.auth0.jwt.JWT.create()
                .withClaim("purpose", "onlyoffice-conversion-source")
                .withClaim("templateId", "101")
                .withClaim("versionId", "102")
                .withClaim("sourceFileId", "301")
                .withClaim("targetId", "102")
                .withClaim("storedPath", sourcePath.toString())
                .withClaim("originalName", "生产巡检记录.pdf")
                .withClaim("mimeType", "application/pdf")
                .withClaim("fileSize", 4L)
                .sign(com.auth0.jwt.algorithms.Algorithm.HMAC256("test-secret"));

        var response = controller.getFormTemplateOnlyOfficeConversionSource(101L, 102L, token);

        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().contentLength()).isEqualTo(4L);
        assertThat(response.getHeaders().getContentType().toString()).isEqualTo("application/pdf");
        assertThat(response.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION)).contains("%E7%94%9F%E4%BA%A7%E5%B7%A1%E6%A3%80%E8%AE%B0%E5%BD%95.pdf");
    }

    @Test
    void getFormTemplateOnlyOfficeConversionSourceRejectsSignedFallbackPathOutsideStorageRoot() throws Exception {
        Path sourcePath = tempDir.getParent().resolve("outside-conversion-source.pdf");
        Files.write(sourcePath, new byte[] {1, 2, 3, 4});
        when(fileObjectRepository.findById(301L)).thenReturn(Optional.empty());
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
        String token = com.auth0.jwt.JWT.create()
                .withClaim("purpose", "onlyoffice-conversion-source")
                .withClaim("templateId", "101")
                .withClaim("versionId", "102")
                .withClaim("sourceFileId", "301")
                .withClaim("targetId", "102")
                .withClaim("storedPath", sourcePath.toString())
                .withClaim("originalName", "outside.pdf")
                .withClaim("mimeType", "application/pdf")
                .withClaim("fileSize", 4L)
                .sign(com.auth0.jwt.algorithms.Algorithm.HMAC256("test-secret"));

        assertThatThrownBy(() -> controller.getFormTemplateOnlyOfficeConversionSource(101L, 102L, token))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("OnlyOffice 转换源文件签名校验失败");
    }

    @Test
    void getFormTemplateOnlyOfficeConversionSourceRejectsStaleOrWrongOwnerFile() throws Exception {
        Path sourcePath = tempDir.resolve("wrong-owner-conversion-source.xlsx");
        Files.write(sourcePath, new byte[] {1, 2, 3});
        FileObject wrongOwnerFile = FileObject.builder()
                .id(301L)
                .tenantId("default")
                .originalName("生产巡检记录.xlsx")
                .storedPath(sourcePath.toString())
                .mimeType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .fileSize(3L)
                .targetType("DHR_ATTACHMENT")
                .targetId("102")
                .build();
        when(fileObjectRepository.findById(301L)).thenReturn(Optional.of(wrongOwnerFile));
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
        String token = com.auth0.jwt.JWT.create()
                .withClaim("purpose", "onlyoffice-conversion-source")
                .withClaim("templateId", "101")
                .withClaim("versionId", "102")
                .withClaim("sourceFileId", "301")
                .withClaim("targetId", "102")
                .withClaim("storedPath", sourcePath.toString())
                .withClaim("originalName", "生产巡检记录.xlsx")
                .withClaim("mimeType", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .sign(com.auth0.jwt.algorithms.Algorithm.HMAC256("test-secret"));

        assertThatThrownBy(() -> controller.getFormTemplateOnlyOfficeConversionSource(101L, 102L, token))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("OnlyOffice 源文件不属于当前模板版本");

        verify(fileObjectRepository).findById(301L);
    }

    @Test
    void onlyOfficeCallbackStoresEditedFileRevisionAndWritesAuditForSaveStatus() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").sourceFileId(301L).sourceFileName("生产巡检记录.xlsx").sourceFileType("xlsx").build();
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateSourceRevisionRepository.countByTemplateIdAndVersionId(101L, 102L)).thenReturn(1);
        when(formTemplateSourceRevisionRepository.save(any(FormTemplateSourceRevision.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(401L, 402L, 403L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
        ReflectionTestUtils.setField(controller, "onlyOfficeDownloadAllowedHosts", "localhost");
        com.sun.net.httpserver.HttpServer server = com.sun.net.httpserver.HttpServer.create(new InetSocketAddress("localhost", 0), 0);
        server.createContext("/edited.xlsx", exchange -> {
            byte[] bytes = new byte[] {1, 2, 3, 4};
            exchange.sendResponseHeaders(200, bytes.length);
            exchange.getResponseBody().write(bytes);
            exchange.close();
        });
        server.start();
        try {
            String editedUrl = "http://localhost:" + server.getAddress().getPort() + "/edited.xlsx";
            Map<String, Object> callback = Map.of("status", 2, "url", editedUrl, "key", "form-template-102-301");
            String callbackToken = com.auth0.jwt.JWT.create()
                    .withClaim("payload", callback)
                    .sign(com.auth0.jwt.algorithms.Algorithm.HMAC256("test-secret"));
            callback = new LinkedHashMap<>(callback);
            callback.put("token", callbackToken);
            MockHttpServletRequest request = new MockHttpServletRequest();
            request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + callbackToken);

            Map<String, Object> response = controller.handleFormTemplateOnlyOfficeCallback(101L, 102L, callback, request);

            assertThat(response.get("error")).isEqualTo(0);
            assertThat(version.getSourceFileId()).isEqualTo(401L);
            assertThat(version.getImportStatus()).isEqualTo("源文档已更新，待重新解析");
            verify(fileObjectRepository).save(any(FileObject.class));
            verify(formTemplateSourceRevisionRepository).save(any(FormTemplateSourceRevision.class));
            verify(auditEventRepository).save(any(AuditEvent.class));
        } finally {
            server.stop(0);
        }
    }

    @Test
    void onlyOfficeCallbackStoresEditedFileRevisionWhenSaveStatusIsString() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").sourceFileId(301L).sourceFileName("生产巡检记录.xlsx").sourceFileType("xlsx").build();
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateSourceRevisionRepository.countByTemplateIdAndVersionId(101L, 102L)).thenReturn(1);
        when(formTemplateSourceRevisionRepository.save(any(FormTemplateSourceRevision.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(401L, 402L, 403L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
        ReflectionTestUtils.setField(controller, "onlyOfficeDownloadAllowedHosts", "localhost");
        com.sun.net.httpserver.HttpServer server = com.sun.net.httpserver.HttpServer.create(new InetSocketAddress("localhost", 0), 0);
        server.createContext("/edited.xlsx", exchange -> {
            byte[] bytes = new byte[] {5, 6, 7, 8};
            exchange.sendResponseHeaders(200, bytes.length);
            exchange.getResponseBody().write(bytes);
            exchange.close();
        });
        server.start();
        try {
            String editedUrl = "http://localhost:" + server.getAddress().getPort() + "/edited.xlsx";
            Map<String, Object> callback = Map.of("status", "6", "url", editedUrl, "key", "form-template-102-301");
            String callbackToken = com.auth0.jwt.JWT.create()
                    .withClaim("payload", callback)
                    .sign(com.auth0.jwt.algorithms.Algorithm.HMAC256("test-secret"));
            callback = new LinkedHashMap<>(callback);
            callback.put("token", callbackToken);
            MockHttpServletRequest request = new MockHttpServletRequest();
            request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + callbackToken);

            Map<String, Object> response = controller.handleFormTemplateOnlyOfficeCallback(101L, 102L, callback, request);

            assertThat(response.get("error")).isEqualTo(0);
            assertThat(version.getSourceFileId()).isEqualTo(401L);
            assertThat(version.getImportStatus()).isEqualTo("源文档已更新，待重新解析");
            verify(fileObjectRepository).save(any(FileObject.class));
            verify(formTemplateSourceRevisionRepository).save(any(FormTemplateSourceRevision.class));
            verify(formTemplateVersionRepository).save(any(FormTemplateVersion.class));
        } finally {
            server.stop(0);
        }
    }

    @Test
    void onlyOfficeCallbackStoresEditedFileRevisionWhenDownloadOriginIsAllowed() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").sourceFileId(301L).sourceFileName("生产巡检记录.xlsx").sourceFileType("xlsx").build();
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateSourceRevisionRepository.countByTemplateIdAndVersionId(101L, 102L)).thenReturn(1);
        when(formTemplateSourceRevisionRepository.save(any(FormTemplateSourceRevision.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(401L, 402L, 403L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
        com.sun.net.httpserver.HttpServer server = com.sun.net.httpserver.HttpServer.create(new InetSocketAddress("localhost", 0), 0);
        server.createContext("/edited.xlsx", exchange -> {
            byte[] bytes = new byte[] {9, 10, 11, 12};
            exchange.sendResponseHeaders(200, bytes.length);
            exchange.getResponseBody().write(bytes);
            exchange.close();
        });
        server.start();
        try {
            ReflectionTestUtils.setField(controller, "onlyOfficeDownloadAllowedHosts", "http://localhost:" + server.getAddress().getPort());
            String editedUrl = "http://localhost:" + server.getAddress().getPort() + "/edited.xlsx";
            Map<String, Object> callback = Map.of("status", 2, "url", editedUrl, "key", "form-template-102-301");
            String callbackToken = com.auth0.jwt.JWT.create()
                    .withClaim("payload", callback)
                    .sign(com.auth0.jwt.algorithms.Algorithm.HMAC256("test-secret"));
            callback = new LinkedHashMap<>(callback);
            callback.put("token", callbackToken);
            MockHttpServletRequest request = new MockHttpServletRequest();
            request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + callbackToken);

            Map<String, Object> response = controller.handleFormTemplateOnlyOfficeCallback(101L, 102L, callback, request);

            assertThat(response.get("error")).isEqualTo(0);
            assertThat(version.getSourceFileId()).isEqualTo(401L);
            verify(fileObjectRepository).save(any(FileObject.class));
            verify(formTemplateVersionRepository).save(any(FormTemplateVersion.class));
        } finally {
            server.stop(0);
        }
    }

    @Test
    void reparseFormTemplateSourceFileCreatesPendingAnalysisDraftFromCurrentSourceFile() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        Path sourcePath = tempDir.resolve("onlyoffice-edited.xlsx");
        Files.write(sourcePath, sampleXlsxBytes());
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder()
                .id(102L)
                .tenantId("default")
                .templateId(101L)
                .version("V1.0")
                .sourceFileId(301L)
                .sourceFileName("onlyoffice-edited.xlsx")
                .sourceFileType("xlsx")
                .modelDesignJson("{\"fields\":[{\"code\":\"old\",\"name\":\"旧字段\"}]}")
                .canvasDesignJson("{\"pages\":[{\"id\":\"old-page\",\"layers\":[]}],\"interactiveFields\":[{\"id\":\"old\",\"code\":\"old\",\"pageId\":\"old-page\",\"x\":1,\"y\":1,\"width\":10,\"height\":10}],\"fieldBindings\":[{\"fieldCode\":\"old\"}]}")
                .build();
        FileObject sourceFile = FileObject.builder()
                .id(301L)
                .tenantId("default")
                .originalName("onlyoffice-edited.xlsx")
                .storedPath(sourcePath.toString())
                .mimeType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .fileSize(Files.size(sourcePath))
                .targetType("FORM_TEMPLATE_SOURCE")
                .targetId("102")
                .build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(fileObjectRepository.findById(301L)).thenReturn(Optional.of(sourceFile));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateAnalysisRepository.save(any(FormTemplateAnalysis.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateSourceRevisionRepository.countByTemplateIdAndVersionId(101L, 102L)).thenReturn(1);
        when(formTemplateSourceRevisionRepository.save(any(FormTemplateSourceRevision.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(401L, 402L);

        var response = controller.reparseFormTemplateSourceFile(101L, 102L);

        assertThat(response.getData().version().sourceFileId()).isEqualTo("301");
        assertThat(response.getData().version().importStatus()).isEqualTo("已重新解析");
        assertThat(response.getData().analysisDraft().get("analysisId").asText()).isEqualTo("402");
        assertThat(response.getData().analysisDraft().get("source").get("fileId").asText()).isEqualTo("301");
        assertThat(response.getData().analysisDraft().get("source").get("revision").asInt()).isEqualTo(2);
        ArgumentCaptor<FormTemplateSourceRevision> revisionCaptor = ArgumentCaptor.forClass(FormTemplateSourceRevision.class);
        verify(formTemplateSourceRevisionRepository).save(revisionCaptor.capture());
        assertThat(revisionCaptor.getValue().getFileId()).isEqualTo(301L);
        assertThat(revisionCaptor.getValue().getRevisionNo()).isEqualTo(2);
        assertThat(revisionCaptor.getValue().getSource()).isEqualTo("REPARSE");
        assertThat(response.getData().analysisDraft().get("candidates"))
                .anySatisfy(candidate -> assertThat(candidate.path("fieldName").asText()).isEqualTo("批号"));
        assertThat(response.getData().canvasDesign().get("interactiveFields")).hasSize(0);
        assertThat(response.getData().version().modelDesignJson()).contains("analysisDraft");
        assertThat(response.getData().version().modelDesignJson()).doesNotContain("旧字段");
        verify(formTemplateAnalysisRepository).save(any(FormTemplateAnalysis.class));
        verify(formTemplateVersionRepository).save(any(FormTemplateVersion.class));
        verify(auditEventRepository).save(any(AuditEvent.class));
    }

    @Test
    void reparseFormTemplateSourceFileKeepsLocalExcelCanvasWhenOnlyOfficeEnabled() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        Path sourcePath = tempDir.resolve("onlyoffice-edited.xlsx");
        Files.write(sourcePath, sampleXlsxBytes());
        FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
        FormTemplateVersion version = FormTemplateVersion.builder()
                .id(102L)
                .tenantId("default")
                .templateId(101L)
                .version("V1.0")
                .sourceFileId(301L)
                .sourceFileName("onlyoffice-edited.xlsx")
                .sourceFileType("xlsx")
                .build();
        FileObject sourceFile = FileObject.builder()
                .id(301L)
                .tenantId("default")
                .originalName("onlyoffice-edited.xlsx")
                .storedPath(sourcePath.toString())
                .mimeType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .fileSize(Files.size(sourcePath))
                .targetType("FORM_TEMPLATE_SOURCE")
                .targetId("102")
                .build();
        when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(fileObjectRepository.findById(301L)).thenReturn(Optional.of(sourceFile));
        when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateAnalysisRepository.save(any(FormTemplateAnalysis.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(formTemplateSourceRevisionRepository.countByTemplateIdAndVersionId(101L, 102L)).thenReturn(1);
        when(formTemplateSourceRevisionRepository.save(any(FormTemplateSourceRevision.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(401L, 402L, 403L, 404L);
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficePublicBackendUrl", "http://localhost:8081");
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");

        var response = controller.reparseFormTemplateSourceFile(101L, 102L);

        assertThat(response.getData().version().sourceFileType()).isEqualTo("xlsx");
        assertThat(response.getData().version().sourceFileId()).isEqualTo("301");
        JsonNode canvasPage = response.getData().canvasDesign().get("pages").get(0);
        JsonNode analysisPage = response.getData().analysisDraft().get("pages").get(0);
        assertThat(canvasPage.has("background")).isFalse();
        assertThat(canvasPage.get("layers"))
                .anySatisfy(layer -> assertThat(layer.get("type").asText()).isEqualTo("table"))
                .anySatisfy(layer -> {
                    assertThat(layer.get("type").asText()).isEqualTo("cell");
                    assertThat(layer.get("text").asText()).isEqualTo("批号");
                });
        assertThat(analysisPage.has("background")).isFalse();
        assertThat(response.getData().analysisDraft().get("blocks")).isNotEmpty();
        assertThat(response.getData().fieldCandidates()).extracting(TemplateModelingController.TemplateFieldCandidateResponse::name)
                .contains("批号", "检验结果");
        verify(onlyOfficeDocumentConverter, never()).convertToPdf(any(OnlyOfficeDocumentConverter.ConversionRequest.class));
        verify(formTemplateVersionRepository).save(any(FormTemplateVersion.class));
        verify(auditEventRepository).save(any(AuditEvent.class));
    }

    @Test
    void onlyOfficeCallbackRejectsRedirectToUntrustedEditedFileHost() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").sourceFileId(301L).sourceFileName("生产巡检记录.xlsx").sourceFileType("xlsx").build();
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(idGenerator.nextId()).thenReturn(401L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
        ReflectionTestUtils.setField(controller, "onlyOfficeDownloadAllowedHosts", "localhost");
        com.sun.net.httpserver.HttpServer server = com.sun.net.httpserver.HttpServer.create(new InetSocketAddress("localhost", 0), 0);
        server.createContext("/redirect.xlsx", exchange -> {
            exchange.getResponseHeaders().add("Location", "http://example.com/edited.xlsx");
            exchange.sendResponseHeaders(302, -1);
            exchange.close();
        });
        server.start();
        try {
            String editedUrl = "http://localhost:" + server.getAddress().getPort() + "/redirect.xlsx";
            Map<String, Object> tokenPayload = Map.of("status", 2, "url", editedUrl, "key", "form-template-102-301");
            String callbackToken = com.auth0.jwt.JWT.create()
                    .withClaim("payload", tokenPayload)
                    .sign(com.auth0.jwt.algorithms.Algorithm.HMAC256("test-secret"));
            Map<String, Object> callback = new LinkedHashMap<>(tokenPayload);
            callback.put("token", callbackToken);
            MockHttpServletRequest request = new MockHttpServletRequest();
            request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + callbackToken);

            assertThatThrownBy(() -> controller.handleFormTemplateOnlyOfficeCallback(101L, 102L, callback, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("OnlyOffice 回调文件地址不受信任");

            verify(fileObjectRepository, never()).save(any(FileObject.class));
            verify(formTemplateSourceRevisionRepository, never()).save(any(FormTemplateSourceRevision.class));
            verify(formTemplateVersionRepository, never()).save(any(FormTemplateVersion.class));
            ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
            verify(auditEventRepository).save(auditCaptor.capture());
            assertThat(auditCaptor.getValue().getFunctionName()).contains("OnlyOffice 回调文件下载失败");
        } finally {
            server.stop(0);
        }
    }

    @Test
    void onlyOfficeCallbackRejectsEditedFileUrlFromAllowedHostButUnexpectedPort() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").sourceFileId(301L).sourceFileName("生产巡检记录.xlsx").sourceFileType("xlsx").build();
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(idGenerator.nextId()).thenReturn(401L);
        ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
        ReflectionTestUtils.setField(controller, "onlyOfficeDownloadAllowedHosts", "localhost:80");
        com.sun.net.httpserver.HttpServer server = com.sun.net.httpserver.HttpServer.create(new InetSocketAddress("localhost", 0), 0);
        server.createContext("/edited.xlsx", exchange -> {
            byte[] bytes = new byte[] {1, 2, 3, 4};
            exchange.sendResponseHeaders(200, bytes.length);
            exchange.getResponseBody().write(bytes);
            exchange.close();
        });
        server.start();
        try {
            String editedUrl = "http://localhost:" + server.getAddress().getPort() + "/edited.xlsx";
            Map<String, Object> tokenPayload = Map.of("status", 2, "url", editedUrl, "key", "form-template-102-301");
            String callbackToken = com.auth0.jwt.JWT.create()
                    .withClaim("payload", tokenPayload)
                    .sign(com.auth0.jwt.algorithms.Algorithm.HMAC256("test-secret"));
            Map<String, Object> callback = new LinkedHashMap<>(tokenPayload);
            callback.put("token", callbackToken);
            MockHttpServletRequest request = new MockHttpServletRequest();
            request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + callbackToken);

            assertThatThrownBy(() -> controller.handleFormTemplateOnlyOfficeCallback(101L, 102L, callback, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("OnlyOffice 回调文件地址不受信任");

            verify(fileObjectRepository, never()).save(any(FileObject.class));
            verify(formTemplateSourceRevisionRepository, never()).save(any(FormTemplateSourceRevision.class));
            verify(formTemplateVersionRepository, never()).save(any(FormTemplateVersion.class));
        } finally {
            server.stop(0);
        }
    }

    @Test
    void onlyOfficeCallbackRejectsInvalidTokenAndWritesSecurityAudit() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").sourceFileId(301L).sourceFileName("生产巡检记录.xlsx").sourceFileType("xlsx").build();
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(idGenerator.nextId()).thenReturn(901L);
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer bad-token");

        assertThatThrownBy(() -> controller.handleFormTemplateOnlyOfficeCallback(101L, 102L, Map.of("status", 2, "url", "http://localhost/edited.xlsx"), request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("OnlyOffice 回调签名校验失败");

        assertThat(version.getSourceFileId()).isEqualTo(301L);
        verify(fileObjectRepository, never()).save(any(FileObject.class));
        verify(formTemplateSourceRevisionRepository, never()).save(any(FormTemplateSourceRevision.class));
        verify(formTemplateVersionRepository, never()).save(any(FormTemplateVersion.class));
        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        assertThat(auditCaptor.getValue().getAction()).isEqualTo("SECURITY");
        assertThat(auditCaptor.getValue().getFunctionName()).contains("OnlyOffice 回调签名校验失败");
    }

    @Test
    void onlyOfficeCallbackRejectsWhenDocumentServiceDisabled() {
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
        Map<String, Object> callback = Map.of("status", 7, "error", 1, "key", "form-template-102-301");
        String callbackToken = com.auth0.jwt.JWT.create()
                .withClaim("payload", callback)
                .sign(com.auth0.jwt.algorithms.Algorithm.HMAC256("test-secret"));
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + callbackToken);
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", false);

        assertThatThrownBy(() -> controller.handleFormTemplateOnlyOfficeCallback(101L, 102L, callback, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("OnlyOffice 文档服务未启用");
        verify(auditEventRepository, never()).save(any(AuditEvent.class));
    }

    @Test
    void onlyOfficeCallbackRejectsMismatchedDocumentKeyAndWritesSecurityAudit() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").sourceFileId(301L).sourceFileName("生产巡检记录.xlsx").sourceFileType("xlsx").build();
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(idGenerator.nextId()).thenReturn(905L);
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
        Map<String, Object> callback = Map.of("status", 7, "error", 1, "key", "form-template-999-301");
        String callbackToken = com.auth0.jwt.JWT.create()
                .withClaim("payload", callback)
                .sign(com.auth0.jwt.algorithms.Algorithm.HMAC256("test-secret"));
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + callbackToken);

        assertThatThrownBy(() -> controller.handleFormTemplateOnlyOfficeCallback(101L, 102L, callback, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("OnlyOffice 回调签名校验失败");

        verify(fileObjectRepository, never()).save(any(FileObject.class));
        verify(formTemplateSourceRevisionRepository, never()).save(any(FormTemplateSourceRevision.class));
        verify(formTemplateVersionRepository, never()).save(any(FormTemplateVersion.class));
        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        assertThat(auditCaptor.getValue().getAction()).isEqualTo("SECURITY");
        assertThat(auditCaptor.getValue().getFunctionName()).contains("OnlyOffice 回调文档标识不匹配");
    }

    @Test
    void onlyOfficeCallbackRejectsMissingTokenBeforeDownloadingEditedFile() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").sourceFileId(301L).sourceFileName("生产巡检记录.xlsx").sourceFileType("xlsx").build();
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(idGenerator.nextId()).thenReturn(902L);
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
        MockHttpServletRequest request = new MockHttpServletRequest();

        assertThatThrownBy(() -> controller.handleFormTemplateOnlyOfficeCallback(101L, 102L, Map.of("status", 2, "url", "http://localhost/edited.xlsx"), request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("OnlyOffice 回调签名校验失败");

        assertThat(version.getSourceFileId()).isEqualTo(301L);
        verify(fileObjectRepository, never()).save(any(FileObject.class));
        verify(formTemplateSourceRevisionRepository, never()).save(any(FormTemplateSourceRevision.class));
        verify(formTemplateVersionRepository, never()).save(any(FormTemplateVersion.class));
        verify(auditEventRepository).save(any(AuditEvent.class));
    }

    @Test
    void onlyOfficeCallbackAuditsMissingEditedFileUrlBeforeRejectingSaveStatus() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").sourceFileId(301L).sourceFileName("生产巡检记录.xlsx").sourceFileType("xlsx").build();
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(idGenerator.nextId()).thenReturn(903L);
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
        Map<String, Object> callback = Map.of("status", 2, "key", "form-template-102-301");
        String callbackToken = com.auth0.jwt.JWT.create()
                .withClaim("payload", callback)
                .sign(com.auth0.jwt.algorithms.Algorithm.HMAC256("test-secret"));
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + callbackToken);

        assertThatThrownBy(() -> controller.handleFormTemplateOnlyOfficeCallback(101L, 102L, callback, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("OnlyOffice 回调缺少文件地址");

        verify(fileObjectRepository, never()).save(any(FileObject.class));
        verify(formTemplateSourceRevisionRepository, never()).save(any(FormTemplateSourceRevision.class));
        verify(formTemplateVersionRepository, never()).save(any(FormTemplateVersion.class));
        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        assertThat(auditCaptor.getValue().getAction()).isEqualTo("SECURITY");
        assertThat(auditCaptor.getValue().getFunctionName()).contains("OnlyOffice 回调缺少文件地址");
    }

    @Test
    void onlyOfficeCallbackAuditsFailedStatusWithoutSavingSourceFile() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").sourceFileId(301L).sourceFileName("生产巡检记录.xlsx").sourceFileType("xlsx").build();
        when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
        when(idGenerator.nextId()).thenReturn(904L);
        ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
        ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
        Map<String, Object> callback = Map.of("status", 7, "error", 1, "key", "form-template-102-301");
        String callbackToken = com.auth0.jwt.JWT.create()
                .withClaim("payload", callback)
                .sign(com.auth0.jwt.algorithms.Algorithm.HMAC256("test-secret"));
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + callbackToken);

        Map<String, Object> response = controller.handleFormTemplateOnlyOfficeCallback(101L, 102L, callback, request);

        assertThat(response.get("error")).isEqualTo(0);
        assertThat(version.getSourceFileId()).isEqualTo(301L);
        verify(fileObjectRepository, never()).save(any(FileObject.class));
        verify(formTemplateSourceRevisionRepository, never()).save(any(FormTemplateSourceRevision.class));
        verify(formTemplateVersionRepository, never()).save(any(FormTemplateVersion.class));
        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        assertThat(auditCaptor.getValue().getAction()).isEqualTo("SECURITY");
        assertThat(auditCaptor.getValue().getFunctionName()).contains("OnlyOffice 回调状态异常");
    }

    private byte[] samplePdfBytes() throws Exception {
        try (PDDocument document = new PDDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            document.addPage(page);
            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                content.beginText();
                content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                content.newLineAtOffset(72, 720);
                content.showText("Batch No");
                content.endText();
                content.moveTo(72, 650);
                content.lineTo(292, 650);
                content.stroke();
                content.addRect(72, 560, 220, 40);
                content.stroke();
            }
            document.save(output);
            return output.toByteArray();
        }
    }

    private byte[] samplePdfWithColonLabelBytes() throws Exception {
        try (PDDocument document = new PDDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            document.addPage(page);
            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                content.beginText();
                content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                content.newLineAtOffset(72, 720);
                content.showText("Batch No:");
                content.endText();
                content.moveTo(128, 718);
                content.lineTo(292, 718);
                content.stroke();
            }
            document.save(output);
            return output.toByteArray();
        }
    }

    private byte[] sampleRotatedLandscapePdfBytes() throws Exception {
        try (PDDocument document = new PDDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            page.setRotation(90);
            document.addPage(page);
            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                content.beginText();
                content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                content.newLineAtOffset(72, 720);
                content.showText("Rotated Landscape");
                content.endText();
            }
            document.save(output);
            return output.toByteArray();
        }
    }

    private byte[] blankPdfBytes() throws Exception {
        try (PDDocument document = new PDDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            document.addPage(new PDPage());
            document.save(output);
            return output.toByteArray();
        }
    }

    private byte[] sampleImageOnlyPdfWithFormLinesBytes() throws Exception {
        try (PDDocument document = new PDDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            document.addPage(page);
            BufferedImage image = new BufferedImage(500, 300, BufferedImage.TYPE_INT_RGB);
            Graphics2D graphics = image.createGraphics();
            try {
                graphics.setColor(Color.WHITE);
                graphics.fillRect(0, 0, 500, 300);
                graphics.setColor(Color.BLACK);
                graphics.fillRect(70, 90, 360, 3);
                graphics.fillRect(70, 210, 360, 3);
                graphics.fillRect(70, 90, 3, 123);
                graphics.fillRect(427, 90, 3, 123);
            } finally {
                graphics.dispose();
            }
            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                content.drawImage(JPEGFactory.createFromImage(document, image), 56, 420, 400, 240);
            }
            document.save(output);
            return output.toByteArray();
        }
    }

    private byte[] samplePngBytes() throws Exception {
        BufferedImage image = new BufferedImage(320, 480, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = image.createGraphics();
        try {
            graphics.setColor(Color.WHITE);
            graphics.fillRect(0, 0, 320, 480);
            graphics.setColor(Color.BLACK);
            graphics.drawString("现场记录", 48, 96);
        } finally {
            graphics.dispose();
        }
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            ImageIO.write(image, "png", output);
            return output.toByteArray();
        }
    }

    private byte[] samplePngWithFormLinesBytes() throws Exception {
        BufferedImage image = new BufferedImage(320, 240, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = image.createGraphics();
        try {
            graphics.setColor(Color.WHITE);
            graphics.fillRect(0, 0, 320, 240);
            graphics.setColor(Color.BLACK);
            graphics.fillRect(40, 80, 240, 2);
            graphics.fillRect(40, 160, 240, 2);
            graphics.fillRect(40, 80, 2, 82);
            graphics.fillRect(278, 80, 2, 82);
        } finally {
            graphics.dispose();
        }
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            ImageIO.write(image, "png", output);
            return output.toByteArray();
        }
    }

    private JsonNode findNodeByText(JsonNode nodes, String fieldName, String expectedValue) {
        for (JsonNode node : nodes) {
            if (expectedValue.equals(node.path(fieldName).asText())) {
                return node;
            }
        }
        return null;
    }

    private byte[] sampleDocxBytes() throws Exception {
        try (XWPFDocument document = new XWPFDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            document.createParagraph().createRun().setText("设备编号");
            document.createParagraph().createRun().setText("清洁确认");
            document.write(output);
            return output.toByteArray();
        }
    }

    private byte[] emptyDocxBytes() throws Exception {
        try (XWPFDocument document = new XWPFDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            document.write(output);
            return output.toByteArray();
        }
    }

    private byte[] sampleLandscapeDocxBytes() throws Exception {
        try (XWPFDocument document = new XWPFDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            var section = document.getDocument().getBody().isSetSectPr()
                    ? document.getDocument().getBody().getSectPr()
                    : document.getDocument().getBody().addNewSectPr();
            var pageSize = section.isSetPgSz() ? section.getPgSz() : section.addNewPgSz();
            pageSize.setW(java.math.BigInteger.valueOf(16838));
            pageSize.setH(java.math.BigInteger.valueOf(11906));
            document.createParagraph().createRun().setText("横向页面");
            document.write(output);
            return output.toByteArray();
        }
    }

    private byte[] sampleStyledDocxBytes() throws Exception {
        try (XWPFDocument document = new XWPFDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            var title = document.createParagraph();
            title.setAlignment(org.apache.poi.xwpf.usermodel.ParagraphAlignment.CENTER);
            var titleRun = title.createRun();
            titleRun.setText("清场检查记录");
            titleRun.setBold(true);
            titleRun.setFontSize(22);
            document.createParagraph().createRun().setText("设备编号");
            document.write(output);
            return output.toByteArray();
        }
    }

    private byte[] sampleInstructionDocxBytes() throws Exception {
        try (XWPFDocument document = new XWPFDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            document.createParagraph().createRun().setText("设备编号");
            document.createParagraph().createRun().setText("说明：请按实际状态填写，完成后签名。");
            document.write(output);
            return output.toByteArray();
        }
    }

    private byte[] sampleDocxWithTableBytes() throws Exception {
        try (XWPFDocument document = new XWPFDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            XWPFTable table = document.createTable(2, 2);
            table.setWidth(7200);
            String[][] values = { { "设备编号", "清洁确认" }, { "EQ-001", "已完成" } };
            for (int row = 0; row < 2; row++) {
                for (int column = 0; column < 2; column++) {
                    var cell = table.getRow(row).getCell(column);
                    cell.setText(values[row][column]);
                    if (row == 0) {
                        cell.setColor("D9EAF7");
                        cell.getParagraphs().getFirst().getRuns().getFirst().setBold(true);
                    }
                }
            }
            document.write(output);
            return output.toByteArray();
        }
    }

    private byte[] sampleDocxWithAlignedTableCellBytes() throws Exception {
        try (XWPFDocument document = new XWPFDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            XWPFTable table = document.createTable(1, 1);
            table.setWidth(3600);
            var cell = table.getRow(0).getCell(0);
            cell.setText("复核结论");
            cell.setVerticalAlignment(org.apache.poi.xwpf.usermodel.XWPFTableCell.XWPFVertAlign.BOTTOM);
            cell.getParagraphs().getFirst().setAlignment(org.apache.poi.xwpf.usermodel.ParagraphAlignment.RIGHT);
            document.write(output);
            return output.toByteArray();
        }
    }

    private byte[] sampleDocxWithMergedTableCellBytes() throws Exception {
        try (XWPFDocument document = new XWPFDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            XWPFTable table = document.createTable(2, 2);
            table.setWidth(7200);
            var mergedCell = table.getRow(0).getCell(0);
            mergedCell.setText("合并标题");
            var tcPr = mergedCell.getCTTc().isSetTcPr() ? mergedCell.getCTTc().getTcPr() : mergedCell.getCTTc().addNewTcPr();
            var gridSpan = tcPr.isSetGridSpan() ? tcPr.getGridSpan() : tcPr.addNewGridSpan();
            gridSpan.setVal(java.math.BigInteger.valueOf(2));
            table.getRow(0).removeCell(1);
            table.getRow(1).getCell(0).setText("设备编号");
            table.getRow(1).getCell(1).setText("EQ-001");
            document.write(output);
            return output.toByteArray();
        }
    }

    private byte[] sampleDocxWithVerticalMergedTableCellBytes() throws Exception {
        try (XWPFDocument document = new XWPFDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            XWPFTable table = document.createTable(2, 2);
            table.setWidth(7200);
            var restartCell = table.getRow(0).getCell(0);
            restartCell.setText("纵向合并项");
            var restartPr = restartCell.getCTTc().isSetTcPr() ? restartCell.getCTTc().getTcPr() : restartCell.getCTTc().addNewTcPr();
            var restartMerge = restartPr.isSetVMerge() ? restartPr.getVMerge() : restartPr.addNewVMerge();
            restartMerge.setVal(org.openxmlformats.schemas.wordprocessingml.x2006.main.STMerge.RESTART);
            var continueCell = table.getRow(1).getCell(0);
            var continuePr = continueCell.getCTTc().isSetTcPr() ? continueCell.getCTTc().getTcPr() : continueCell.getCTTc().addNewTcPr();
            var continueMerge = continuePr.isSetVMerge() ? continuePr.getVMerge() : continuePr.addNewVMerge();
            continueMerge.setVal(org.openxmlformats.schemas.wordprocessingml.x2006.main.STMerge.CONTINUE);
            table.getRow(0).getCell(1).setText("上层确认");
            table.getRow(1).getCell(1).setText("下层确认");
            document.write(output);
            return output.toByteArray();
        }
    }

    private byte[] sampleDocxWithImageBytes() throws Exception {
        try (XWPFDocument document = new XWPFDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            document.createParagraph().createRun().setText("设备图片");
            byte[] png = sampleSmallPngBytes();
            document.createParagraph().createRun().addPicture(
                    new java.io.ByteArrayInputStream(png),
                    Document.PICTURE_TYPE_PNG,
                    "embedded_image_1.png",
                    96 * 12700,
                    48 * 12700);
            document.write(output);
            return output.toByteArray();
        }
    }

    private byte[] sampleSmallPngBytes() throws Exception {
        BufferedImage image = new BufferedImage(96, 48, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = image.createGraphics();
        try {
            graphics.setColor(Color.WHITE);
            graphics.fillRect(0, 0, 96, 48);
            graphics.setColor(Color.BLUE);
            graphics.fillRect(8, 8, 80, 32);
        } finally {
            graphics.dispose();
        }
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            ImageIO.write(image, "png", output);
            return output.toByteArray();
        }
    }

    private byte[] sampleXlsxBytes() throws Exception {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet("检验记录");
            sheet.getPrintSetup().setLandscape(true);
            var header = sheet.createRow(0);
            var font = workbook.createFont();
            font.setBold(true);
            var headerStyle = workbook.createCellStyle();
            headerStyle.setFont(font);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            var batchCell = header.createCell(0);
            batchCell.setCellValue("批号");
            batchCell.setCellStyle(headerStyle);
            var resultCell = header.createCell(1);
            resultCell.setCellValue("检验结果");
            resultCell.setCellStyle(headerStyle);
            sheet.setColumnWidth(0, 32 * 256);
            sheet.setColumnWidth(1, 22 * 256);
            workbook.write(output);
            return output.toByteArray();
        }
    }

    private byte[] sampleLongBorderedXlsxBytes() throws Exception {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet("长表格");
            sheet.getPrintSetup().setLandscape(false);
            var style = workbook.createCellStyle();
            style.setBorderTop(BorderStyle.THIN);
            style.setBorderRight(BorderStyle.THIN);
            style.setBorderBottom(BorderStyle.THIN);
            style.setBorderLeft(BorderStyle.THIN);
            style.setVerticalAlignment(VerticalAlignment.CENTER);
            for (int rowIndex = 0; rowIndex < 35; rowIndex++) {
                var row = sheet.createRow(rowIndex);
                row.setHeightInPoints(24);
                for (int columnIndex = 0; columnIndex < 4; columnIndex++) {
                    var cell = row.createCell(columnIndex);
                    cell.setCellValue(columnIndex == 0 ? "记录-" + (rowIndex + 1) : "内容-" + (rowIndex + 1) + "-" + (columnIndex + 1));
                    cell.setCellStyle(style);
                }
            }
            for (int columnIndex = 0; columnIndex < 4; columnIndex++) {
                sheet.setColumnWidth(columnIndex, 18 * 256);
            }
            workbook.write(output);
            return output.toByteArray();
        }
    }

    private byte[] sampleBorderIdOnlyXlsxBytes() throws Exception {
        return removeApplyBorderAttributes(sampleLongBorderedXlsxBytes());
    }

    private byte[] removeApplyBorderAttributes(byte[] source) throws IOException {
        try (ZipInputStream input = new ZipInputStream(new java.io.ByteArrayInputStream(source));
             ByteArrayOutputStream output = new ByteArrayOutputStream();
             ZipOutputStream zipOutput = new ZipOutputStream(output)) {
            ZipEntry entry;
            while ((entry = input.getNextEntry()) != null) {
                zipOutput.putNextEntry(new ZipEntry(entry.getName()));
                byte[] bytes = input.readAllBytes();
                if ("xl/styles.xml".equals(entry.getName())) {
                    String styles = new String(bytes, java.nio.charset.StandardCharsets.UTF_8)
                            .replace(" applyBorder=\"true\"", "")
                            .replace(" applyBorder=\"1\"", "");
                    bytes = styles.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                }
                zipOutput.write(bytes);
                zipOutput.closeEntry();
            }
            zipOutput.finish();
            return output.toByteArray();
        }
    }

    private byte[] emptyXlsxBytes() throws Exception {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            workbook.createSheet("空白模板");
            workbook.write(output);
            return output.toByteArray();
        }
    }

    private byte[] samplePortraitXlsxBytes() throws Exception {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet("竖向检验记录");
            sheet.getPrintSetup().setLandscape(false);
            sheet.createRow(0).createCell(0).setCellValue("设备编号");
            workbook.write(output);
            return output.toByteArray();
        }
    }

    private byte[] sampleXlsxWithRightBlankValueCellBytes() throws Exception {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet("键值检验记录");
            var style = workbook.createCellStyle();
            style.setBorderTop(BorderStyle.THIN);
            style.setBorderRight(BorderStyle.THIN);
            style.setBorderBottom(BorderStyle.THIN);
            style.setBorderLeft(BorderStyle.THIN);
            var row = sheet.createRow(0);
            var labelCell = row.createCell(0);
            labelCell.setCellValue("批号：");
            labelCell.setCellStyle(style);
            var blankValueCell = row.createCell(1);
            blankValueCell.setCellStyle(style);
            sheet.setColumnWidth(0, 16 * 256);
            sheet.setColumnWidth(1, 28 * 256);
            workbook.write(output);
            return output.toByteArray();
        }
    }

    private byte[] sampleXlsxWithTextAreaFieldBytes() throws Exception {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet("处理意见记录");
            var style = workbook.createCellStyle();
            style.setBorderTop(BorderStyle.THIN);
            style.setBorderRight(BorderStyle.THIN);
            style.setBorderBottom(BorderStyle.THIN);
            style.setBorderLeft(BorderStyle.THIN);
            var row = sheet.createRow(0);
            row.setHeightInPoints(48);
            var labelCell = row.createCell(0);
            labelCell.setCellValue("处理意见：");
            labelCell.setCellStyle(style);
            var blankValueCell = row.createCell(1);
            blankValueCell.setCellStyle(style);
            sheet.setColumnWidth(0, 16 * 256);
            sheet.setColumnWidth(1, 36 * 256);
            workbook.write(output);
            return output.toByteArray();
        }
    }

    private byte[] sampleWrappedRowHeightXlsxBytes() throws Exception {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet("长文本行高");
            var style = workbook.createCellStyle();
            style.setWrapText(true);
            style.setBorderTop(BorderStyle.THIN);
            style.setBorderRight(BorderStyle.THIN);
            style.setBorderBottom(BorderStyle.THIN);
            style.setBorderLeft(BorderStyle.THIN);
            var longTextRow = sheet.createRow(0);
            var longTextCell = longTextRow.createCell(0);
            longTextCell.setCellValue("这是一个需要自动换行展示的很长的检验说明文本，用于验证导入画布后行高会随着内容变高，不会压住下一行。");
            longTextCell.setCellStyle(style);
            var nextRow = sheet.createRow(1);
            var nextRowCell = nextRow.createCell(0);
            nextRowCell.setCellValue("下一行内容");
            nextRowCell.setCellStyle(style);
            sheet.setColumnWidth(0, 12 * 256);
            workbook.write(output);
            return output.toByteArray();
        }
    }

    private byte[] sampleXlsxWithSignatureFieldBytes() throws Exception {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet("签名检验记录");
            var row = sheet.createRow(0);
            row.createCell(0).setCellValue("操作人签名");
            sheet.setColumnWidth(0, 24 * 256);
            workbook.write(output);
            return output.toByteArray();
        }
    }

    private byte[] sampleMergedCellXlsxBytes() throws Exception {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet("合并单元格");
            var font = workbook.createFont();
            font.setBold(true);
            var titleStyle = workbook.createCellStyle();
            titleStyle.setFont(font);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);
            titleStyle.setFillForegroundColor(IndexedColors.LIGHT_YELLOW.getIndex());
            titleStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            titleStyle.setBorderTop(BorderStyle.THIN);
            titleStyle.setBorderRight(BorderStyle.THIN);
            titleStyle.setBorderBottom(BorderStyle.THIN);
            titleStyle.setBorderLeft(BorderStyle.THIN);
            var titleRow = sheet.createRow(0);
            var titleCell = titleRow.createCell(0);
            titleCell.setCellValue("合并标题");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 1));
            var header = sheet.createRow(1);
            header.createCell(0).setCellValue("左列");
            header.createCell(1).setCellValue("右列");
            sheet.setColumnWidth(0, 20 * 256);
            sheet.setColumnWidth(1, 30 * 256);
            workbook.write(output);
            return output.toByteArray();
        }
    }

    private byte[] sampleFormattedCellXlsxBytes() throws Exception {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet("格式化单元格");
            var dataFormat = workbook.createDataFormat();
            var numberStyle = workbook.createCellStyle();
            numberStyle.setDataFormat(dataFormat.getFormat("00000"));
            var percentStyle = workbook.createCellStyle();
            percentStyle.setDataFormat(dataFormat.getFormat("0.00%"));
            var row = sheet.createRow(0);
            var numberCell = row.createCell(0);
            numberCell.setCellValue(123);
            numberCell.setCellStyle(numberStyle);
            var sourcePercentCell = row.createCell(1);
            sourcePercentCell.setCellValue(0.985);
            sourcePercentCell.setCellStyle(percentStyle);
            var formulaCell = row.createCell(2);
            formulaCell.setCellFormula("B1");
            formulaCell.setCellStyle(percentStyle);
            workbook.getCreationHelper().createFormulaEvaluator().evaluateFormulaCell(formulaCell);
            workbook.write(output);
            return output.toByteArray();
        }
    }

    private byte[] sampleXlsxWithImageBytes() throws Exception {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet("图片检验记录");
            sheet.createRow(0).createCell(0).setCellValue("设备照片");
            sheet.setColumnWidth(0, 20 * 256);
            byte[] png = sampleSmallPngBytes();
            int imageIndex = workbook.addPicture(png, Workbook.PICTURE_TYPE_PNG);
            var anchor = workbook.getCreationHelper().createClientAnchor();
            anchor.setCol1(1);
            anchor.setRow1(1);
            sheet.createDrawingPatriarch().createPicture(anchor, imageIndex);
            workbook.write(output);
            return output.toByteArray();
        }
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
