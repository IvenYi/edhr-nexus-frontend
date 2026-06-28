package com.zencas.edhr.template.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.entity.FileObject;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.compliance.service.PaddleOcrClient;
import com.zencas.edhr.template.dto.TemplateModelingRequest;
import com.zencas.edhr.template.entity.DhrTemplate;
import com.zencas.edhr.template.entity.FormTemplate;
import com.zencas.edhr.template.entity.FormTemplateAnalysis;
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
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.contentstream.PDFGraphicsStreamEngine;
import org.apache.pdfbox.cos.COSName;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.graphics.image.PDImage;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.text.TextPosition;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.ClientAnchor;
import org.apache.poi.ss.usermodel.Color;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Drawing;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.FormulaEvaluator;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Picture;
import org.apache.poi.ss.usermodel.PictureData;
import org.apache.poi.ss.usermodel.PrintSetup;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.util.CellReference;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.extensions.XSSFCellBorder;
import org.apache.poi.xssf.model.StylesTable;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFPictureData;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableCell;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.awt.geom.Point2D;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.math.BigInteger;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.Date;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/master-data/template-modeling")
@RequiredArgsConstructor
public class TemplateModelingController {

    private static final String TENANT_ID = "default";
    private static final String CATEGORY_ALL = "ALL";
    private static final String CATEGORY_UNCATEGORIZED = "UNCATEGORIZED";
    private static final String FORM_TYPE = "FORM";
    private static final String DHR_TYPE = "DHR";
    private static final long TEMPLATE_SOURCE_MAX_FILE_SIZE = 50L * 1024 * 1024;
    private static final int TEMPLATE_CANVAS_RENDER_DPI = 144;
    private static final int TEMPLATE_CANVAS_MAX_PREVIEW_WIDTH = 1600;
    private static final int EXCEL_ROWS_PER_CANVAS_PAGE = 30;
    private static final int ONLYOFFICE_SOURCE_TOKEN_TTL_SECONDS = 15 * 60;
    private static final int ONLYOFFICE_CONVERSION_SOURCE_TOKEN_TTL_SECONDS = 5 * 60;
    private static final int ONLYOFFICE_DOWNLOAD_CONNECT_TIMEOUT_MILLIS = 5_000;
    private static final int ONLYOFFICE_DOWNLOAD_READ_TIMEOUT_MILLIS = 15_000;
    private static final int ONLYOFFICE_DOWNLOAD_MAX_REDIRECTS = 3;
    private static final Set<String> SUPPORTED_CANDIDATE_COMPONENTS = Set.of("TextInput", "NumberInput", "DateTimePicker", "SignaturePad", "TextArea");
    private static final Pattern CANDIDATE_FIELD_CODE_PATTERN = Pattern.compile("[A-Za-z_][A-Za-z0-9_]*");
    private static final List<String> SUPPORTED_TEMPLATE_IMPORT_EXTENSIONS = List.of("pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "jpeg");
    private static final List<String> SUPPORTED_TEMPLATE_IMPORT_MIME_TYPES = List.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "image/png",
            "image/jpeg"
    );
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter DATE_TIME_MINUTE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final Field XSSF_CELL_STYLE_STYLES_SOURCE_FIELD = xssfCellStyleStylesSourceField();
    private static final ObjectMapper AUDIT_OBJECT_MAPPER = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    private final FormTemplateRepository formTemplateRepository;
    private final FormTemplateVersionRepository formTemplateVersionRepository;
    private final FormTemplateAnalysisRepository formTemplateAnalysisRepository;
    private final FormTemplateSourceRevisionRepository formTemplateSourceRevisionRepository;
    private final DhrTemplateRepository dhrTemplateRepository;
    private final TemplateCategoryRepository templateCategoryRepository;
    private final AuditEventRepository auditEventRepository;
    private final FileObjectRepository fileObjectRepository;
    private final PaddleOcrClient paddleOcrClient;
    private final SnowflakeIdGenerator idGenerator;
    private final OnlyOfficeDocumentConverter onlyOfficeDocumentConverter;

    @Value("${edhr.file.storage-path:#{systemProperties['user.home'] + '/.edhr/files'}}")
    private String storagePath;

    @Value("${edhr.onlyoffice.enabled:false}")
    private boolean onlyOfficeEnabled;

    @Value("${edhr.onlyoffice.document-server-url:http://localhost:8088}")
    private String onlyOfficeDocumentServerUrl;

    @Value("${edhr.onlyoffice.converter-url:${edhr.onlyoffice.document-server-url:http://localhost:8088}}")
    private String onlyOfficeConverterUrl;

    @Value("${edhr.onlyoffice.public-backend-url:http://localhost:8081}")
    private String onlyOfficePublicBackendUrl;

    @Value("${edhr.onlyoffice.jwt-secret:dev-onlyoffice-secret-change-me}")
    private String onlyOfficeJwtSecret;

    @Value("${edhr.onlyoffice.download-allowed-hosts:localhost,127.0.0.1,onlyoffice-document-server}")
    private String onlyOfficeDownloadAllowedHosts;

    @GetMapping("/form-templates")
    public ApiResponse<PageResult<FormTemplateResponse>> listFormTemplates(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String categoryName,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        Page<FormTemplate> result = formTemplateRepository.findAll(
                formTemplateSpec(keyword, name, code, categoryName, status),
                pageable(page, size, sort, order));
        List<FormTemplateResponse> content = result.getContent().stream()
                .map(template -> toFormTemplateResponse(template, loadCurrentVersion(template), loadTemplateVersions(template.getId())))
                .toList();
        return ApiResponse.success(PageResult.of(content, page, size, result.getTotalElements()));
    }

    @PostMapping("/form-templates")
    @Transactional
    public ApiResponse<FormTemplateResponse> createFormTemplate(@RequestBody TemplateModelingRequest request) {
        String code = requireCode(request);
        ensureFormTemplateCodeAvailable(code, null);
        validateEffectiveDateRange(request);
        LocalDateTime now = LocalDateTime.now();
        FormTemplate entity = FormTemplate.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .code(code)
                .name(requireName(request))
                .type(FORM_TYPE)
                .categoryName(resolveTemplateCategory(FORM_TYPE, request))
                .description(trimToNull(request.getDescription()))
                .status(resolveStatus(request, "ACTIVE"))
                .createdBy(currentOperatorName())
                .createdAt(now)
                .updatedBy(currentOperatorName())
                .updatedAt(now)
                .build();
        FormTemplate saved = formTemplateRepository.save(entity);
        FormTemplateVersion version = formTemplateVersionRepository.save(buildFormTemplateVersion(saved.getId(), request, 1, true));
        saved.setCurrentVersionId(version.getId());
        saved = formTemplateRepository.save(saved);
        writeAudit("FORM_TEMPLATE", saved.getId(), "CREATE", "表单模板", "新增表单模板", Map.of(), formTemplateSnapshot(saved, version));
        return ApiResponse.success(toFormTemplateResponse(saved, version));
    }

    @PutMapping("/form-templates/{id}")
    @Transactional
    public ApiResponse<FormTemplateResponse> updateFormTemplate(@PathVariable Long id, @RequestBody TemplateModelingRequest request) {
        FormTemplate existing = formTemplateRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "表单模板不存在"));
        String code = requireCode(request);
        ensureFormTemplateCodeAvailable(code, id);
        FormTemplateVersion version = loadCurrentVersion(existing);
        validateEffectiveDateRange(request, version);
        Map<String, Object> before = formTemplateSnapshot(existing, version);
        existing.setCode(code);
        existing.setName(requireName(request));
        existing.setCategoryName(resolveTemplateCategory(FORM_TYPE, request));
        existing.setDescription(trimToNull(request.getDescription()));
        existing.setStatus(resolveStatus(request, existing.getStatus()));
        existing.setUpdatedBy(currentOperatorName());
        existing.setUpdatedAt(LocalDateTime.now());
        FormTemplate saved = formTemplateRepository.save(existing);
        FormTemplateVersion savedVersion = updateCurrentVersionBasics(saved, version, request);
        writeChangedAudit("FORM_TEMPLATE", saved.getId(), "表单模板", "编辑表单模板", before, formTemplateSnapshot(saved, savedVersion));
        return ApiResponse.success(toFormTemplateResponse(saved, savedVersion));
    }

    @DeleteMapping("/form-templates/{id}")
    @Transactional
    public ApiResponse<Void> deleteFormTemplate(@PathVariable Long id) {
        FormTemplate existing = formTemplateRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "表单模板不存在"));
        FormTemplateVersion currentVersion = loadCurrentVersion(existing);
        List<FormTemplateVersion> versions = loadTemplateVersions(id);
        Map<String, Object> before = formTemplateSnapshot(existing, currentVersion);
        formTemplateVersionRepository.deleteAll(versions);
        formTemplateRepository.delete(existing);
        writeAudit("FORM_TEMPLATE", id, "DELETE", "表单模板", "删除表单模板", before, Map.of());
        return ApiResponse.success(null);
    }

    @PostMapping("/form-templates/{id}/versions")
    @Transactional
    public ApiResponse<TemplateVersionResponse> createFormTemplateVersion(@PathVariable Long id, @RequestBody TemplateModelingRequest request) {
        FormTemplate template = formTemplateRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "表单模板不存在"));
        validateEffectiveDateRange(request);
        FormTemplateVersion version = formTemplateVersionRepository.save(buildFormTemplateVersion(template.getId(), request, nextVersionNumber(template.getId()), false));
        writeAudit("FORM_TEMPLATE_VERSION", version.getId(), "CREATE", "表单模板", "版本创建", Map.of(), versionSnapshot(version));
        return ApiResponse.success(toVersionResponse(version));
    }

    @GetMapping("/form-templates/{id}/versions/{versionId}")
    public ApiResponse<TemplateVersionResponse> getFormTemplateVersion(@PathVariable Long id, @PathVariable Long versionId) {
        formTemplateRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "表单模板不存在"));
        return ApiResponse.success(toVersionResponse(findVersion(id, versionId)));
    }

    @DeleteMapping("/form-templates/{id}/versions/{versionId}")
    @Transactional
    public ApiResponse<Void> deleteFormTemplateVersion(@PathVariable Long id, @PathVariable Long versionId) {
        FormTemplate template = formTemplateRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "表单模板不存在"));
        List<FormTemplateVersion> versions = loadTemplateVersions(id);
        if (versions.size() <= 1) {
            throw new BusinessException(ErrorCode.GENERAL_001, "表单模板至少保留一个版本");
        }
        FormTemplateVersion target = versions.stream()
                .filter(version -> Objects.equals(version.getId(), versionId))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "表单模板版本不存在"));
        Map<String, Object> before = versionSnapshot(target);
        formTemplateVersionRepository.delete(target);
        if (Objects.equals(template.getCurrentVersionId(), target.getId())) {
            FormTemplateVersion replacement = versions.stream()
                    .filter(version -> !Objects.equals(version.getId(), target.getId()))
                    .findFirst()
                    .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "表单模板至少保留一个版本"));
            replacement.setIsCurrent(true);
            replacement.setUpdatedBy(currentOperatorName());
            replacement.setUpdatedAt(LocalDateTime.now());
            formTemplateVersionRepository.save(replacement);
            template.setCurrentVersionId(replacement.getId());
            template.setUpdatedBy(currentOperatorName());
            template.setUpdatedAt(LocalDateTime.now());
            formTemplateRepository.save(template);
        }
        writeAudit("FORM_TEMPLATE_VERSION", target.getId(), "DELETE", "表单模板", "删除表单模板版本", before, Map.of());
        return ApiResponse.success(null);
    }

    @PutMapping("/form-templates/{id}/versions/{versionId}/design")
    @Transactional
    public ApiResponse<TemplateVersionResponse> saveFormTemplateDesign(
            @PathVariable Long id,
            @PathVariable Long versionId,
            @RequestBody TemplateModelingRequest request) {
        formTemplateRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "表单模板不存在"));
        FormTemplateVersion version = findVersion(id, versionId);
        Map<String, Object> before = versionSnapshot(version);
        if (request != null && request.getModelDesignJson() != null) version.setModelDesignJson(request.getModelDesignJson());
        if (request != null && request.getCanvasDesignJson() != null) version.setCanvasDesignJson(request.getCanvasDesignJson());
        if (request != null && request.getWorkflowDesignJson() != null) version.setWorkflowDesignJson(request.getWorkflowDesignJson());
        version.setUpdatedBy(currentOperatorName());
        version.setUpdatedAt(LocalDateTime.now());
        FormTemplateVersion saved = formTemplateVersionRepository.save(version);
        writeChangedAudit("FORM_TEMPLATE_VERSION", saved.getId(), "表单模板", "保存表单设计", before, versionSnapshot(saved));
        return ApiResponse.success(toVersionResponse(saved));
    }

    @PostMapping("/form-templates/{id}/versions/{versionId}/import")
    @Transactional
    public ApiResponse<TemplateImportResponse> importFormTemplateSourceFile(
            @PathVariable Long id,
            @PathVariable Long versionId,
            @RequestParam("file") MultipartFile file) throws IOException {
        formTemplateRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "表单模板不存在"));
        FormTemplateVersion version = findVersion(id, versionId);
        validateTemplateImportFile(file);
        Map<String, Object> before = versionSnapshot(version);
        List<FileObject> createdFiles = new ArrayList<>();
        try {
            FileObject sourceFile = storeTemplateSourceFile(file, id, versionId, "FORM_TEMPLATE_SOURCE");
            createdFiles.add(sourceFile);
            TemplateImportArtifacts artifacts = parseTemplateImport(id, versionId, sourceFile, createdFiles);
            FormTemplateSourceRevision revision = createSourceRevision(id, versionId, sourceFile.getId(), "IMPORT");
            Long analysisId = idGenerator.nextId();
            Map<String, Object> analysisDraft = buildAnalysisDraft(analysisId, id, versionId, sourceFile, artifacts);
            analysisDraft.put("revision", revision.getRevisionNo());
            Object sourceMetadata = analysisDraft.get("source");
            if (sourceMetadata instanceof Map<?, ?> sourceMap) {
                @SuppressWarnings("unchecked")
                Map<String, Object> mutableSource = (Map<String, Object>) sourceMap;
                mutableSource.put("revision", revision.getRevisionNo());
            }
            FormTemplateAnalysis analysis = FormTemplateAnalysis.builder()
                    .id(analysisId)
                    .tenantId(TENANT_ID)
                    .templateId(id)
                    .versionId(versionId)
                    .sourceFileId(sourceFile.getId())
                    .analysisJson(toDesignJson(analysisDraft))
                    .status("PENDING")
                    .createdBy(currentOperatorName())
                    .createdAt(LocalDateTime.now())
                    .updatedBy(currentOperatorName())
                    .updatedAt(LocalDateTime.now())
                    .build();
            FormTemplateAnalysis savedAnalysis = formTemplateAnalysisRepository.save(analysis);
            if (savedAnalysis != null) analysis = savedAnalysis;
            Map<String, Object> modelDesign = new LinkedHashMap<>(artifacts.modelDesign());
            modelDesign.put("analysisDraft", Map.of("analysisId", String.valueOf(analysis.getId()), "status", analysis.getStatus()));
            modelDesign.put("fields", List.of());
            Map<String, Object> canvasDesign = new LinkedHashMap<>(artifacts.canvasDesign());
            canvasDesign.put("interactiveFields", List.of());
            canvasDesign.put("fieldBindings", List.of());
            version.setSourceFileName(sourceFile.getOriginalName());
            version.setSourceFileId(sourceFile.getId());
            version.setSourceFileType(artifacts.fileType());
            version.setImportStatus("已导入");
            version.setModelDesignJson(toDesignJson(modelDesign));
            version.setCanvasDesignJson(toDesignJson(canvasDesign));
            if (!StringUtils.hasText(version.getWorkflowDesignJson())) version.setWorkflowDesignJson(defaultWorkflowDesignJson());
            version.setUpdatedBy(currentOperatorName());
            version.setUpdatedAt(LocalDateTime.now());
            FormTemplateVersion saved = formTemplateVersionRepository.save(version);
            writeChangedAudit("FORM_TEMPLATE_VERSION", saved.getId(), "表单模板", "导入表单源文件", before, versionSnapshot(saved));
            return ApiResponse.success(new TemplateImportResponse(
                    toVersionResponse(saved),
                    artifacts.fieldCandidates(),
                    toJsonNode(modelDesign),
                    toJsonNode(canvasDesign),
                    toJsonNode(analysisDraft)));
        } catch (RuntimeException | IOException e) {
            cleanupTemplateImportFiles(createdFiles);
            throw wrapTemplateImportFailure(e);
        }
    }

    @PostMapping("/form-templates/{id}/versions/{versionId}/source/reparse")
    @Transactional
    public ApiResponse<TemplateImportResponse> reparseFormTemplateSourceFile(
            @PathVariable Long id,
            @PathVariable Long versionId) throws IOException {
        formTemplateRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "表单模板不存在"));
        FormTemplateVersion version = findVersion(id, versionId);
        if (version.getSourceFileId() == null) {
            throw new BusinessException(ErrorCode.GENERAL_001, "当前模板版本没有可重新解析的源文件");
        }
        FileObject sourceFile = fileObjectRepository.findById(version.getSourceFileId())
                .orElseThrow(() -> new BusinessException(ErrorCode.FILE_001, "源文件不存在"));
        validateOnlyOfficeSourceFile(sourceFile, versionId);
        Map<String, Object> before = versionSnapshot(version);
        List<FileObject> createdFiles = new ArrayList<>();
        try {
            TemplateImportArtifacts artifacts = parseTemplateImport(id, versionId, sourceFile, createdFiles);
            FormTemplateSourceRevision revision = createSourceRevision(id, versionId, sourceFile.getId(), "REPARSE");
            Long analysisId = idGenerator.nextId();
            Map<String, Object> analysisDraft = buildAnalysisDraft(analysisId, id, versionId, sourceFile, artifacts);
            analysisDraft.put("revision", revision.getRevisionNo());
            Object sourceMetadata = analysisDraft.get("source");
            if (sourceMetadata instanceof Map<?, ?> sourceMap) {
                @SuppressWarnings("unchecked")
                Map<String, Object> mutableSource = (Map<String, Object>) sourceMap;
                mutableSource.put("revision", revision.getRevisionNo());
            }
            FormTemplateAnalysis analysis = FormTemplateAnalysis.builder()
                    .id(analysisId)
                    .tenantId(TENANT_ID)
                    .templateId(id)
                    .versionId(versionId)
                    .sourceFileId(sourceFile.getId())
                    .analysisJson(toDesignJson(analysisDraft))
                    .status("PENDING")
                    .createdBy(currentOperatorName())
                    .createdAt(LocalDateTime.now())
                    .updatedBy(currentOperatorName())
                    .updatedAt(LocalDateTime.now())
                    .build();
            FormTemplateAnalysis savedAnalysis = formTemplateAnalysisRepository.save(analysis);
            if (savedAnalysis != null) analysis = savedAnalysis;
            Map<String, Object> modelDesign = new LinkedHashMap<>(artifacts.modelDesign());
            modelDesign.put("analysisDraft", Map.of("analysisId", String.valueOf(analysis.getId()), "status", analysis.getStatus()));
            modelDesign.put("fields", List.of());
            Map<String, Object> canvasDesign = new LinkedHashMap<>(artifacts.canvasDesign());
            canvasDesign.put("interactiveFields", List.of());
            canvasDesign.put("fieldBindings", List.of());
            version.setSourceFileName(sourceFile.getOriginalName());
            version.setSourceFileId(sourceFile.getId());
            version.setSourceFileType(artifacts.fileType());
            version.setImportStatus("已重新解析");
            version.setModelDesignJson(toDesignJson(modelDesign));
            version.setCanvasDesignJson(toDesignJson(canvasDesign));
            if (!StringUtils.hasText(version.getWorkflowDesignJson())) version.setWorkflowDesignJson(defaultWorkflowDesignJson());
            version.setUpdatedBy(currentOperatorName());
            version.setUpdatedAt(LocalDateTime.now());
            FormTemplateVersion saved = formTemplateVersionRepository.save(version);
            writeChangedAudit("FORM_TEMPLATE_VERSION", saved.getId(), "表单模板", "重新解析表单源文件", before, versionSnapshot(saved));
            return ApiResponse.success(new TemplateImportResponse(
                    toVersionResponse(saved),
                    artifacts.fieldCandidates(),
                    toJsonNode(modelDesign),
                    toJsonNode(canvasDesign),
                    toJsonNode(analysisDraft)));
        } catch (RuntimeException | IOException e) {
            cleanupTemplateImportFiles(createdFiles);
            throw wrapTemplateImportFailure(e);
        }
    }

    private RuntimeException wrapTemplateImportFailure(Exception e) {
        if (e instanceof RuntimeException runtimeException) return runtimeException;
        return new BusinessException(ErrorCode.GENERAL_001, "文件导入失败，请稍后重试");
    }

    @GetMapping("/form-templates/{id}/versions/{versionId}/analysis/{analysisId}")
    public ApiResponse<JsonNode> getFormTemplateAnalysisDraft(
            @PathVariable Long id,
            @PathVariable Long versionId,
            @PathVariable Long analysisId) {
        formTemplateRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "表单模板不存在"));
        findVersion(id, versionId);
        FormTemplateAnalysis analysis = formTemplateAnalysisRepository.findByIdAndVersionId(analysisId, versionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "解析草稿不存在"));
        return ApiResponse.success(toJsonNode(analysis.getAnalysisJson()));
    }

    @PutMapping("/form-templates/{id}/versions/{versionId}/analysis/{analysisId}/decisions")
    @Transactional
    public ApiResponse<TemplateVersionResponse> confirmFormTemplateAnalysisCandidates(
            @PathVariable Long id,
            @PathVariable Long versionId,
            @PathVariable Long analysisId,
            @RequestBody CandidateDecisionRequest request) {
        formTemplateRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "表单模板不存在"));
        FormTemplateVersion version = findVersion(id, versionId);
        FormTemplateAnalysis analysis = formTemplateAnalysisRepository.findByIdAndVersionId(analysisId, versionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "解析草稿不存在"));
        Map<String, Object> before = versionSnapshot(version);
        JsonNode analysisDraft = toJsonNode(analysis.getAnalysisJson());
        validateAnalysisDecisionRequest(analysisId, version, analysis, analysisDraft, request);
        validateCandidateDecisions(analysisDraft, request);
        Map<String, Object> modelDesign = buildConfirmedModelDesign(toJsonNode(version.getModelDesignJson()), analysisDraft, request);
        Map<String, Object> canvasDesign = buildConfirmedCanvasDesign(toJsonNode(version.getCanvasDesignJson()), analysisDraft, request);
        version.setModelDesignJson(toDesignJson(modelDesign));
        version.setCanvasDesignJson(toDesignJson(canvasDesign));
        version.setUpdatedBy(currentOperatorName());
        version.setUpdatedAt(LocalDateTime.now());
        FormTemplateVersion saved = formTemplateVersionRepository.save(version);

        analysis.setStatus("CONFIRMED");
        analysis.setDecisionJson(toDesignJson(buildCandidateDecisionLedger(analysisId, analysisDraft, request)));
        analysis.setUpdatedBy(currentOperatorName());
        analysis.setUpdatedAt(LocalDateTime.now());
        formTemplateAnalysisRepository.save(analysis);

        writeChangedAudit("FORM_TEMPLATE_VERSION", saved.getId(), "表单模板", "确认导入候选", before, versionSnapshot(saved));
        return ApiResponse.success(toVersionResponse(saved));
    }

    private void validateAnalysisDecisionRequest(Long analysisId, FormTemplateVersion version, FormTemplateAnalysis analysis, JsonNode analysisDraft, CandidateDecisionRequest request) {
        if (request != null && StringUtils.hasText(request.analysisId()) && !Objects.equals(request.analysisId(), String.valueOf(analysisId))) {
            throw new BusinessException(ErrorCode.GENERAL_001, "解析草稿不匹配");
        }
        if (analysisDraft != null && StringUtils.hasText(analysisDraft.path("analysisId").asText()) && !Objects.equals(analysisDraft.path("analysisId").asText(), String.valueOf(analysisId))) {
            throw new BusinessException(ErrorCode.GENERAL_001, "解析草稿不匹配");
        }
        if (analysis != null && "CONFIRMED".equalsIgnoreCase(analysis.getStatus())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "解析草稿已确认");
        }
        validateAnalysisSourceFileIsCurrent(version, analysis, analysisDraft);
    }

    private void validateAnalysisSourceFileIsCurrent(FormTemplateVersion version, FormTemplateAnalysis analysis, JsonNode analysisDraft) {
        if (version == null || version.getSourceFileId() == null) return;
        String currentSourceFileId = String.valueOf(version.getSourceFileId());
        if (analysis != null && analysis.getSourceFileId() != null && !Objects.equals(currentSourceFileId, String.valueOf(analysis.getSourceFileId()))) {
            throw new BusinessException(ErrorCode.GENERAL_001, "解析草稿源文件已过期，请重新解析后再确认");
        }
        String draftSourceFileId = analysisDraft == null ? null : analysisDraft.path("source").path("fileId").asText(null);
        if (StringUtils.hasText(draftSourceFileId) && !Objects.equals(currentSourceFileId, draftSourceFileId)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "解析草稿源文件已过期，请重新解析后再确认");
        }
    }

    private void validateCandidateDecisions(JsonNode analysisDraft, CandidateDecisionRequest request) {
        Map<String, JsonNode> candidates = candidatesById(analysisDraft);
        if (candidates.isEmpty()) return;
        if (request == null || request.decisions() == null || request.decisions().size() != candidates.size()) {
            throw new BusinessException(ErrorCode.GENERAL_001, "请确认所有解析候选");
        }
        Set<String> decidedIds = request.decisions().stream()
                .map(CandidateDecisionItem::candidateId)
                .filter(StringUtils::hasText)
                .collect(Collectors.toSet());
        if (!decidedIds.containsAll(candidates.keySet())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "请确认所有解析候选");
        }
        boolean hasInvalidAction = request.decisions().stream()
                .map(CandidateDecisionItem::action)
                .anyMatch(action -> !"component".equals(action) && !"staticText".equals(action) && !"ignore".equals(action));
        if (hasInvalidAction) {
            throw new BusinessException(ErrorCode.GENERAL_001, "解析候选处理方式无效");
        }
        Set<String> fieldCodes = new java.util.HashSet<>();
        for (CandidateDecisionItem decision : request.decisions()) {
            if (!"component".equals(decision.action())) continue;
            JsonNode candidate = candidates.get(decision.candidateId());
            String component = StringUtils.hasText(decision.component())
                    ? decision.component()
                    : candidate.path("suggestedComponent").asText("TextInput");
            if (!SUPPORTED_CANDIDATE_COMPONENTS.contains(component)) {
                throw new BusinessException(ErrorCode.GENERAL_001, "解析候选组件类型无效");
            }
            String fieldCode = StringUtils.hasText(decision.fieldCode())
                    ? decision.fieldCode()
                    : candidate.path("fieldCode").asText();
            if (!StringUtils.hasText(fieldCode)) {
                throw new BusinessException(ErrorCode.GENERAL_001, "解析候选字段编码不能为空");
            }
            if (!CANDIDATE_FIELD_CODE_PATTERN.matcher(fieldCode).matches()) {
                throw new BusinessException(ErrorCode.GENERAL_001, "解析候选字段编码格式无效");
            }
            if (!fieldCodes.add(fieldCode)) {
                throw new BusinessException(ErrorCode.GENERAL_001, "解析候选字段编码重复");
            }
        }
    }

    @GetMapping("/form-templates/{id}/versions/{versionId}/onlyoffice/config")
    public ApiResponse<Map<String, Object>> getFormTemplateOnlyOfficeConfig(@PathVariable Long id, @PathVariable Long versionId) {
        formTemplateRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "表单模板不存在"));
        FormTemplateVersion version = findVersion(id, versionId);
        if (!onlyOfficeEnabled) {
            throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 文档服务未启用");
        }
        if (version.getSourceFileId() == null) {
            throw new BusinessException(ErrorCode.GENERAL_001, "请先导入源文件");
        }
        String fileType = StringUtils.hasText(version.getSourceFileType()) ? version.getSourceFileType() : resolveFileExtension(version.getSourceFileName());
        Map<String, Object> document = new LinkedHashMap<>();
        document.put("fileType", fileType);
        document.put("key", onlyOfficeDocumentKey(versionId, version.getSourceFileId()));
        document.put("title", version.getSourceFileName());
        document.put("url", onlyOfficePublicBackendUrl + "/api/v1/master-data/template-modeling/form-templates/" + id + "/versions/" + versionId
                + "/onlyoffice/source?token=" + onlyOfficeSourceToken(id, versionId, version.getSourceFileId()));
        document.put("permissions", onlyOfficeDocumentPermissions(fileType));

        Map<String, Object> editorConfig = new LinkedHashMap<>();
        editorConfig.put("callbackUrl", onlyOfficePublicBackendUrl + "/api/v1/master-data/template-modeling/form-templates/" + id + "/versions/" + versionId + "/onlyoffice/callback");
        editorConfig.put("mode", "pdf".equalsIgnoreCase(fileType) ? "view" : "edit");

        Map<String, Object> config = new LinkedHashMap<>();
        config.put("document", document);
        config.put("documentType", onlyOfficeDocumentType(fileType));
        config.put("editorConfig", editorConfig);
        config.put("documentServerUrl", onlyOfficeDocumentServerUrl);
        config.put("token", onlyOfficeToken(document, editorConfig, config.get("documentType")));
        return ApiResponse.success(config);
    }

    @GetMapping("/form-templates/{id}/versions/{versionId}/onlyoffice/source")
    public ResponseEntity<Resource> getFormTemplateOnlyOfficeSource(
            @PathVariable Long id,
            @PathVariable Long versionId,
            @RequestParam("token") String token) {
        ensureOnlyOfficeEnabled();
        FormTemplateVersion version = findVersion(id, versionId);
        verifyOnlyOfficeSourceToken(token, id, versionId, version.getSourceFileId());
        FileObject sourceFile = fileObjectRepository.findById(version.getSourceFileId())
                .orElseThrow(() -> new BusinessException(ErrorCode.FILE_001, "源文件不存在"));
        validateOnlyOfficeSourceFile(sourceFile, versionId);
        Path filePath = Path.of(sourceFile.getStoredPath());
        if (!Files.exists(filePath)) {
            throw new BusinessException(ErrorCode.FILE_001, "源文件物理存储丢失");
        }
        Resource resource = new FileSystemResource(filePath);
        return ResponseEntity.ok()
                .contentType(resolveMediaType(sourceFile.getMimeType()))
                .header(HttpHeaders.CACHE_CONTROL, "private, max-age=300")
                .header("X-Content-Type-Options", "nosniff")
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + encodeFileName(sourceFile.getOriginalName()) + "\"")
                .body(resource);
    }

    @GetMapping("/form-templates/{id}/versions/{versionId}/onlyoffice/conversion-source")
    public ResponseEntity<Resource> getFormTemplateOnlyOfficeConversionSource(
            @PathVariable Long id,
            @PathVariable Long versionId,
            @RequestParam("token") String token) {
        ensureOnlyOfficeEnabled();
        FileObject sourceFile = verifyOnlyOfficeConversionSourceToken(token, id, versionId);
        Path filePath = Path.of(sourceFile.getStoredPath());
        if (!Files.exists(filePath)) {
            throw new BusinessException(ErrorCode.FILE_001, "源文件物理存储丢失");
        }
        Resource resource = new FileSystemResource(filePath);
        return ResponseEntity.ok()
                .contentType(resolveMediaType(sourceFile.getMimeType()))
                .header(HttpHeaders.CACHE_CONTROL, "private, max-age=300")
                .header("X-Content-Type-Options", "nosniff")
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + encodeFileName(sourceFile.getOriginalName()) + "\"")
                .body(resource);
    }

    @PostMapping("/form-templates/{id}/versions/{versionId}/onlyoffice/callback")
    @Transactional
    public Map<String, Object> handleFormTemplateOnlyOfficeCallback(
            @PathVariable Long id,
            @PathVariable Long versionId,
            @RequestBody Map<String, Object> callback,
            HttpServletRequest request) throws IOException {
        ensureOnlyOfficeEnabled();
        FormTemplateVersion version = findVersion(id, versionId);
        verifyOnlyOfficeCallbackToken(callback, request, id, versionId, onlyOfficeDocumentKey(versionId, version.getSourceFileId()));
        Object status = callback == null ? null : callback.get("status");
        if (isOnlyOfficeSaveStatus(status)) {
            String editedFileUrl = callback == null ? null : String.valueOf(callback.get("url"));
            if (!StringUtils.hasText(editedFileUrl) || "null".equals(editedFileUrl)) {
                writeOnlyOfficeSecurityAudit(id, versionId, "OnlyOffice 回调缺少文件地址", callback);
                throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 回调缺少文件地址");
            }
            Map<String, Object> before = versionSnapshot(version);
            FileObject editedFile;
            try {
                editedFile = storeOnlyOfficeEditedSourceFile(editedFileUrl, id, versionId, version);
            } catch (IOException | RuntimeException e) {
                writeAudit("FORM_TEMPLATE_VERSION", version.getId(), "SECURITY", "表单模板", "OnlyOffice 回调文件下载失败", Map.of(), Map.of(
                        "templateId", id,
                        "versionId", versionId,
                        "url", editedFileUrl,
                        "message", e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage()));
                throw e;
            }
            FormTemplateSourceRevision revision = createSourceRevision(id, versionId, editedFile.getId(), "ONLYOFFICE");
            version.setSourceFileId(editedFile.getId());
            version.setSourceFileName(editedFile.getOriginalName());
            version.setSourceFileType(resolveFileExtension(editedFile.getOriginalName()));
            version.setImportStatus("源文档已更新，待重新解析");
            version.setUpdatedBy(currentOperatorName());
            version.setUpdatedAt(LocalDateTime.now());
            FormTemplateVersion saved = formTemplateVersionRepository.save(version);
            Map<String, Object> after = versionSnapshot(saved);
            after.put("sourceRevisionNo", revision.getRevisionNo());
            writeChangedAudit("FORM_TEMPLATE_VERSION", saved.getId(), "表单模板", "OnlyOffice 源文档保存回调", before, after);
        } else if (isOnlyOfficeFailureStatus(status)) {
            writeOnlyOfficeSecurityAudit(id, versionId, "OnlyOffice 回调状态异常", callback);
        }
        return Map.of("error", 0);
    }

    private boolean isOnlyOfficeFailureStatus(Object status) {
        if (status == null) return false;
        String value = String.valueOf(status);
        return "3".equals(value) || "7".equals(value);
    }

    private boolean isOnlyOfficeSaveStatus(Object status) {
        if (status == null) return false;
        String value = String.valueOf(status);
        return "2".equals(value) || "6".equals(value);
    }

    @GetMapping("/batch-record-templates")
    public ApiResponse<PageResult<DhrTemplate>> listBatchRecordTemplates(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String categoryName,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        Page<DhrTemplate> result = dhrTemplateRepository.findAll(
                dhrTemplateSpec(keyword, categoryName, status),
                pageable(page, size, sort, order));
        return ApiResponse.success(PageResult.of(result.getContent(), page, size, result.getTotalElements()));
    }

    @PostMapping("/batch-record-templates")
    @Transactional
    public ApiResponse<DhrTemplate> createBatchRecordTemplate(@RequestBody TemplateModelingRequest request) {
        String code = requireCode(request);
        ensureDhrTemplateCodeAvailable(code, null);
        LocalDateTime now = LocalDateTime.now();
        DhrTemplate entity = DhrTemplate.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .code(code)
                .name(requireName(request))
                .categoryName(resolveTemplateCategory(DHR_TYPE, request))
                .description(trimToNull(request.getDescription()))
                .status(resolveStatus(request, "ACTIVE"))
                .createdBy(currentOperatorName())
                .createdAt(now)
                .updatedBy(currentOperatorName())
                .updatedAt(now)
                .build();
        DhrTemplate saved = dhrTemplateRepository.save(entity);
        writeAudit("DHR_TEMPLATE", saved.getId(), "CREATE", "批记录模板", "新增批记录模板", Map.of(), dhrTemplateSnapshot(saved));
        return ApiResponse.success(saved);
    }

    @PutMapping("/batch-record-templates/{id}")
    @Transactional
    public ApiResponse<DhrTemplate> updateBatchRecordTemplate(@PathVariable Long id, @RequestBody TemplateModelingRequest request) {
        DhrTemplate existing = dhrTemplateRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "批记录模板不存在"));
        String code = requireCode(request);
        ensureDhrTemplateCodeAvailable(code, id);
        Map<String, Object> before = dhrTemplateSnapshot(existing);
        existing.setCode(code);
        existing.setName(requireName(request));
        existing.setCategoryName(resolveTemplateCategory(DHR_TYPE, request));
        existing.setDescription(trimToNull(request.getDescription()));
        existing.setStatus(resolveStatus(request, existing.getStatus()));
        existing.setUpdatedBy(currentOperatorName());
        existing.setUpdatedAt(LocalDateTime.now());
        DhrTemplate saved = dhrTemplateRepository.save(existing);
        writeChangedAudit("DHR_TEMPLATE", saved.getId(), "批记录模板", "编辑批记录模板", before, dhrTemplateSnapshot(saved));
        return ApiResponse.success(saved);
    }

    @DeleteMapping("/batch-record-templates/{id}")
    @Transactional
    public ApiResponse<Void> deleteBatchRecordTemplate(@PathVariable Long id) {
        DhrTemplate existing = dhrTemplateRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "批记录模板不存在"));
        dhrTemplateRepository.deleteById(id);
        writeAudit("DHR_TEMPLATE", id, "DELETE", "批记录模板", "删除批记录模板", dhrTemplateSnapshot(existing), Map.of());
        return ApiResponse.success(null);
    }

    @GetMapping("/{templateType}/categories")
    public ApiResponse<List<TemplateCategoryResponse>> listCategories(@PathVariable String templateType) {
        return ApiResponse.success(toTemplateCategoryResponses(resolveTemplateType(templateType)));
    }

    @PostMapping("/{templateType}/categories")
    @Transactional
    public ApiResponse<TemplateCategoryResponse> createCategory(@PathVariable String templateType, @RequestBody TemplateCategoryRequest request) {
        String type = resolveTemplateType(templateType);
        String name = requireCategoryName(request);
        if (templateCategoryRepository.existsByTenantIdAndTemplateTypeAndNameIgnoreCase(TENANT_ID, type, name)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "模板分类已存在");
        }
        TemplateCategory saved = templateCategoryRepository.save(TemplateCategory.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .templateType(type)
                .name(name)
                .sortOrder(nextCategorySortOrder(type))
                .createdBy(currentOperatorName())
                .createdAt(LocalDateTime.now())
                .updatedBy(currentOperatorName())
                .updatedAt(LocalDateTime.now())
                .build());
        writeAudit("TEMPLATE_CATEGORY", saved.getId(), "CREATE", menuName(type), "新增模板分类", Map.of(), categorySnapshot(saved, 0L));
        return ApiResponse.success(toCategoryResponse(saved, 0L));
    }

    @PutMapping("/{templateType}/categories/{id}")
    @Transactional
    public ApiResponse<TemplateCategoryResponse> updateCategory(@PathVariable String templateType, @PathVariable Long id, @RequestBody TemplateCategoryRequest request) {
        String type = resolveTemplateType(templateType);
        TemplateCategory existing = templateCategoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "模板分类不存在"));
        String name = requireCategoryName(request);
        templateCategoryRepository.findByTenantIdAndTemplateTypeAndNameIgnoreCase(TENANT_ID, type, name)
                .filter(category -> !Objects.equals(category.getId(), existing.getId()))
                .ifPresent(category -> {
                    throw new BusinessException(ErrorCode.GENERAL_001, "模板分类已存在");
                });
        String oldName = existing.getName();
        Map<String, Object> before = categorySnapshot(existing, countByCategory(type, oldName));
        existing.setName(name);
        existing.setUpdatedBy(currentOperatorName());
        existing.setUpdatedAt(LocalDateTime.now());
        TemplateCategory saved = templateCategoryRepository.save(existing);
        renameTemplateCategory(type, oldName, name);
        writeChangedAudit("TEMPLATE_CATEGORY", saved.getId(), menuName(type), "编辑模板分类", before, categorySnapshot(saved, countByCategory(type, name)));
        return ApiResponse.success(toCategoryResponse(saved, countByCategory(type, name)));
    }

    @DeleteMapping("/{templateType}/categories/{id}")
    @Transactional
    public ApiResponse<Void> deleteCategory(@PathVariable String templateType, @PathVariable Long id) {
        String type = resolveTemplateType(templateType);
        TemplateCategory existing = templateCategoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "模板分类不存在"));
        if (countByCategory(type, existing.getName()) > 0) {
            throw new BusinessException(ErrorCode.GENERAL_001, "分类下存在模板，不允许删除");
        }
        templateCategoryRepository.deleteById(id);
        writeAudit("TEMPLATE_CATEGORY", id, "DELETE", menuName(type), "删除模板分类", categorySnapshot(existing, 0L), Map.of());
        return ApiResponse.success(null);
    }

    @PutMapping("/{templateType}/categories/order")
    @Transactional
    public ApiResponse<List<TemplateCategoryResponse>> reorderCategories(@PathVariable String templateType, @RequestBody TemplateCategoryOrderRequest request) {
        String type = resolveTemplateType(templateType);
        List<String> orderedIds = request == null || request.ids() == null ? List.of() : request.ids();
        Map<Long, Integer> orderById = new LinkedHashMap<>();
        for (int i = 0; i < orderedIds.size(); i++) {
            Long id = parseCategoryId(orderedIds.get(i));
            if (id != null) orderById.put(id, (i + 1) * 10);
        }
        List<TemplateCategory> categories = templateCategoryRepository.findByTenantIdAndTemplateTypeOrderBySortOrderAscNameAsc(TENANT_ID, type);
        categories.forEach(category -> {
            Integer sortOrder = orderById.get(category.getId());
            if (sortOrder != null) category.setSortOrder(sortOrder);
        });
        templateCategoryRepository.saveAll(categories);
        return ApiResponse.success(toTemplateCategoryResponses(type));
    }

    private Specification<FormTemplate> formTemplateSpec(String keyword, String name, String code, String categoryName, String status) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("tenantId"), TENANT_ID));
            if (StringUtils.hasText(keyword)) {
                String like = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), like),
                        cb.like(cb.lower(root.get("code")), like)));
            }
            if (StringUtils.hasText(name)) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + name.trim().toLowerCase() + "%"));
            }
            if (StringUtils.hasText(code)) {
                predicates.add(cb.like(cb.lower(root.get("code")), "%" + code.trim().toLowerCase() + "%"));
            }
            addCategoryPredicate(categoryName, root.get("categoryName"), predicates, cb);
            addStatusPredicate(status, root.get("status"), predicates, cb);
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private Specification<DhrTemplate> dhrTemplateSpec(String keyword, String categoryName, String status) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("tenantId"), TENANT_ID));
            if (StringUtils.hasText(keyword)) {
                String like = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), like),
                        cb.like(cb.lower(root.get("code")), like)));
            }
            addCategoryPredicate(categoryName, root.get("categoryName"), predicates, cb);
            addStatusPredicate(status, root.get("status"), predicates, cb);
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private void addCategoryPredicate(
            String categoryName,
            jakarta.persistence.criteria.Path<String> categoryPath,
            List<jakarta.persistence.criteria.Predicate> predicates,
            jakarta.persistence.criteria.CriteriaBuilder cb) {
        if (!StringUtils.hasText(categoryName) || CATEGORY_ALL.equals(categoryName)) return;
        if (CATEGORY_UNCATEGORIZED.equals(categoryName)) {
            predicates.add(cb.or(cb.isNull(categoryPath), cb.equal(cb.trim(categoryPath), "")));
            return;
        }
        predicates.add(cb.equal(categoryPath, categoryName.trim()));
    }

    private void addStatusPredicate(
            String status,
            jakarta.persistence.criteria.Path<String> statusPath,
            List<jakarta.persistence.criteria.Predicate> predicates,
            jakarta.persistence.criteria.CriteriaBuilder cb) {
        if (StringUtils.hasText(status) && !"ALL".equals(status)) {
            predicates.add(cb.equal(statusPath, status.trim()));
        }
    }

    private Pageable pageable(int page, int size, String sort, String order) {
        int safePage = Math.max(page, 1) - 1;
        int safeSize = Math.max(size, 1);
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(safePage, safeSize, Sort.by(direction, safeSort(sort)));
    }

    private String safeSort(String sort) {
        return switch (sort) {
            case "name", "code", "status", "createdAt", "updatedAt" -> sort;
            default -> "createdAt";
        };
    }

    private String resolveTemplateType(String templateType) {
        if ("form-templates".equals(templateType) || FORM_TYPE.equalsIgnoreCase(templateType)) return FORM_TYPE;
        if ("batch-record-templates".equals(templateType) || DHR_TYPE.equalsIgnoreCase(templateType)) return DHR_TYPE;
        throw new BusinessException(ErrorCode.GENERAL_001, "模板类型不正确");
    }

    private String requireCode(TemplateModelingRequest request) {
        if (request == null || !StringUtils.hasText(request.getCode())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "请输入模板编码");
        }
        return request.getCode().trim();
    }

    private String requireName(TemplateModelingRequest request) {
        if (request == null || !StringUtils.hasText(request.getName())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "请输入模板名称");
        }
        return request.getName().trim();
    }

    private String requireCategoryName(TemplateCategoryRequest request) {
        if (request == null || !StringUtils.hasText(request.name())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "请输入分类名称");
        }
        return request.name().trim();
    }

    private String requireVersion(TemplateModelingRequest request) {
        if (request == null || !StringUtils.hasText(request.getVersion())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "请输入模板版本");
        }
        return request.getVersion().trim();
    }

    private String resolveStatus(TemplateModelingRequest request, String fallback) {
        if (request != null && StringUtils.hasText(request.getStatus())) return request.getStatus().trim();
        return StringUtils.hasText(fallback) ? fallback : "ACTIVE";
    }

    private String resolveTemplateCategory(String type, TemplateModelingRequest request) {
        String category = request == null ? null : trimToNull(request.getCategoryName());
        if (category == null) return null;
        templateCategoryRepository.findByTenantIdAndTemplateTypeAndNameIgnoreCase(TENANT_ID, type, category)
                .orElseGet(() -> templateCategoryRepository.save(TemplateCategory.builder()
                        .id(idGenerator.nextId())
                        .tenantId(TENANT_ID)
                        .templateType(type)
                        .name(category)
                        .sortOrder(nextCategorySortOrder(type))
                        .createdBy(currentOperatorName())
                        .createdAt(LocalDateTime.now())
                        .updatedBy(currentOperatorName())
                        .updatedAt(LocalDateTime.now())
                        .build()));
        return category;
    }

    private void ensureFormTemplateCodeAvailable(String code, Long currentId) {
        boolean exists = formTemplateRepository.findByTenantIdAndCodeIgnoreCase(TENANT_ID, code).stream()
                .anyMatch(template -> !Objects.equals(template.getId(), currentId));
        if (exists) throw new BusinessException(ErrorCode.GENERAL_001, "模板编码已存在");
    }

    private void ensureDhrTemplateCodeAvailable(String code, Long currentId) {
        boolean exists = dhrTemplateRepository.findByTenantIdAndCodeIgnoreCase(TENANT_ID, code).stream()
                .anyMatch(template -> !Objects.equals(template.getId(), currentId));
        if (exists) throw new BusinessException(ErrorCode.GENERAL_001, "模板编码已存在");
    }

    private FormTemplateVersion buildFormTemplateVersion(Long templateId, TemplateModelingRequest request, int versionNumber, boolean current) {
        LocalDateTime now = LocalDateTime.now();
        return FormTemplateVersion.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .templateId(templateId)
                .versionNumber(versionNumber)
                .version(requireVersion(request))
                .description(trimToNull(request.getVersionDescription()))
                .effectiveFrom(parseDateTime(request.getEffectiveFrom()))
                .effectiveTo(parseDateTime(request.getEffectiveTo()))
                .status(resolveStatus(request, "DRAFT"))
                .isCurrent(current)
                .importStatus("未导入")
                .modelDesignJson(defaultModelDesignJson())
                .canvasDesignJson(defaultCanvasDesignJson())
                .workflowDesignJson(defaultWorkflowDesignJson())
                .createdBy(currentOperatorName())
                .createdAt(now)
                .updatedBy(currentOperatorName())
                .updatedAt(now)
                .build();
    }

    private FormTemplateVersion updateCurrentVersionBasics(FormTemplate template, FormTemplateVersion version, TemplateModelingRequest request) {
        FormTemplateVersion current = version;
        if (current == null && request != null && StringUtils.hasText(request.getVersion())) {
            current = formTemplateVersionRepository.save(buildFormTemplateVersion(template.getId(), request, nextVersionNumber(template.getId()), true));
            template.setCurrentVersionId(current.getId());
            formTemplateRepository.save(template);
            return current;
        }
        if (current == null) return null;
        if (request != null && StringUtils.hasText(request.getVersion())) current.setVersion(request.getVersion().trim());
        if (request != null && request.getEffectiveFrom() != null) current.setEffectiveFrom(parseDateTime(request.getEffectiveFrom()));
        if (request != null && request.getEffectiveTo() != null) current.setEffectiveTo(parseDateTime(request.getEffectiveTo()));
        if (request != null) current.setDescription(trimToNull(request.getVersionDescription()));
        current.setUpdatedBy(currentOperatorName());
        current.setUpdatedAt(LocalDateTime.now());
        return formTemplateVersionRepository.save(current);
    }

    private int nextVersionNumber(Long templateId) {
        return formTemplateVersionRepository.findByTemplateIdOrderByCreatedAtDesc(templateId).stream()
                .map(FormTemplateVersion::getVersionNumber)
                .filter(Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(0) + 1;
    }

    private FormTemplateVersion loadCurrentVersion(FormTemplate template) {
        if (template == null) return null;
        if (template.getCurrentVersionId() != null) {
            return formTemplateVersionRepository.findByIdAndTemplateId(template.getCurrentVersionId(), template.getId()).orElse(null);
        }
        return formTemplateVersionRepository.findByTemplateIdOrderByCreatedAtDesc(template.getId()).stream().findFirst().orElse(null);
    }

    private List<FormTemplateVersion> loadTemplateVersions(Long templateId) {
        if (templateId == null) return List.of();
        return formTemplateVersionRepository.findByTemplateIdOrderByCreatedAtDesc(templateId);
    }

    private FormTemplateVersion findVersion(Long templateId, Long versionId) {
        return formTemplateVersionRepository.findByIdAndTemplateId(versionId, templateId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "表单模板版本不存在"));
    }

    private void validateEffectiveDateRange(TemplateModelingRequest request) {
        validateEffectiveDateRange(request, null);
    }

    private void validateEffectiveDateRange(TemplateModelingRequest request, FormTemplateVersion fallback) {
        if (request == null) return;
        LocalDateTime effectiveFrom = request.getEffectiveFrom() == null && fallback != null
                ? fallback.getEffectiveFrom()
                : parseDateTime(request.getEffectiveFrom());
        LocalDateTime effectiveTo = request.getEffectiveTo() == null && fallback != null
                ? fallback.getEffectiveTo()
                : parseDateTime(request.getEffectiveTo());
        if (effectiveFrom != null && effectiveTo != null && effectiveTo.isBefore(effectiveFrom)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "失效时间不能早于生效时间");
        }
    }

    private LocalDateTime parseDateTime(String value) {
        if (!StringUtils.hasText(value)) return null;
        String trimmed = value.trim();
        try {
            return LocalDateTime.parse(trimmed);
        } catch (DateTimeParseException ignored) {
            try {
                return LocalDateTime.parse(trimmed, DATE_TIME_FORMATTER);
            } catch (DateTimeParseException ignoredAgain) {
                try {
                    return LocalDateTime.parse(trimmed, DATE_TIME_MINUTE_FORMATTER);
                } catch (DateTimeParseException e) {
                    throw new BusinessException(ErrorCode.GENERAL_001, "时间格式应为 yyyy-MM-dd HH:mm:ss");
                }
            }
        }
    }

    private String formatDateTime(LocalDateTime value) {
        return value == null ? null : value.format(DATE_TIME_FORMATTER);
    }

    private String defaultModelDesignJson() {
        return "{\"fields\":[]}";
    }

    private String defaultCanvasDesignJson() {
        return "{\"layers\":[],\"strategy\":\"图层锚定+格式复刻\"}";
    }

    private String defaultWorkflowDesignJson() {
        return "{\"nodes\":[],\"edges\":[]}";
    }

    private List<TemplateFieldCandidateResponse> defaultFieldCandidates() {
        return List.of();
    }

    private void validateTemplateImportFile(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new BusinessException(ErrorCode.GENERAL_001, "上传文件不能为空");
        if (file.getSize() > TEMPLATE_SOURCE_MAX_FILE_SIZE) throw new BusinessException(ErrorCode.FILE_002, "文件大小不能超过 50MB");
        String extension = resolveFileExtension(file.getOriginalFilename());
        String contentType = file.getContentType();
        boolean supportedExtension = SUPPORTED_TEMPLATE_IMPORT_EXTENSIONS.contains(extension);
        boolean supportedContentType = contentType != null && SUPPORTED_TEMPLATE_IMPORT_MIME_TYPES.contains(contentType);
        if (!supportedExtension || !supportedContentType) {
            throw new BusinessException(ErrorCode.FILE_003, "仅支持 PDF、Word、Excel、图片格式文件");
        }
    }

    private FileObject storeTemplateSourceFile(MultipartFile file, Long templateId, Long versionId, String targetType) throws IOException {
        Long fileId = idGenerator.nextId();
        Path storageDir = Path.of(storagePath, "template-imports", String.valueOf(templateId), String.valueOf(versionId));
        Files.createDirectories(storageDir);
        Path targetPath = storageDir.resolve(fileId + "_" + sanitizeFileName(file.getOriginalFilename()));
        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            FileObject fileObject = FileObject.builder()
                    .id(fileId)
                    .tenantId(TENANT_ID)
                    .originalName(file.getOriginalFilename())
                    .storedPath(targetPath.toString())
                    .mimeType(file.getContentType())
                    .fileSize(file.getSize())
                    .md5Hash(computeMd5(file.getInputStream()))
                    .targetType(targetType)
                    .targetId(String.valueOf(versionId))
                    .uploadedBy(AuditContext.getOperatorId())
                    .createdAt(LocalDateTime.now())
                    .build();
            return fileObjectRepository.save(fileObject);
        } catch (IOException | RuntimeException e) {
            Files.deleteIfExists(targetPath);
            throw e;
        }
    }

    private FormTemplateSourceRevision createSourceRevision(Long templateId, Long versionId, Long fileId, String source) {
        int nextRevisionNo = formTemplateSourceRevisionRepository.countByTemplateIdAndVersionId(templateId, versionId) + 1;
        FormTemplateSourceRevision revision = FormTemplateSourceRevision.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .templateId(templateId)
                .versionId(versionId)
                .fileId(fileId)
                .revisionNo(nextRevisionNo)
                .source(source)
                .createdBy(currentOperatorName())
                .createdAt(LocalDateTime.now())
                .build();
        FormTemplateSourceRevision saved = formTemplateSourceRevisionRepository.save(revision);
        return saved == null ? revision : saved;
    }

    private Map<String, Object> buildAnalysisDraft(Long analysisId, Long templateId, Long versionId, FileObject sourceFile, TemplateImportArtifacts artifacts) {
        Map<String, Object> source = sourceMetadata(sourceFile, artifacts.fileType());
        source.put("revision", formTemplateSourceRevisionRepository.countByTemplateIdAndVersionId(templateId, versionId));
        List<Map<String, Object>> pages = extractAnalysisPages(artifacts.analysisCanvasDesign());
        List<Map<String, Object>> blocks = extractAnalysisBlocks(artifacts.analysisCanvasDesign(), artifacts.anchoredFieldSeeds());
        Map<String, Map<String, Object>> blockByText = blocks.stream()
                .filter(block -> block.get("text") != null)
                .collect(Collectors.toMap(block -> String.valueOf(block.get("text")), block -> block, (first, second) -> first, LinkedHashMap::new));
        List<Map<String, Object>> candidates = artifacts.fieldCandidates().stream()
                .map(candidate -> candidateToAnalysisCandidate(candidate, pages, blockByText))
                .toList();

        Map<String, Object> draft = new LinkedHashMap<>();
        draft.put("schemaVersion", "1.0");
        draft.put("analysisId", String.valueOf(analysisId));
        draft.put("templateId", String.valueOf(templateId));
        draft.put("versionId", String.valueOf(versionId));
        draft.put("source", source);
        draft.put("pages", pages);
        draft.put("blocks", blocks);
        draft.put("candidates", candidates);
        return draft;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> extractAnalysisPages(Map<String, Object> canvasDesign) {
        Object rawPages = canvasDesign.get("pages");
        if (!(rawPages instanceof List<?> pages)) return List.of();
        return pages.stream()
                .filter(Map.class::isInstance)
                .map(page -> {
                    Map<String, Object> sourcePage = (Map<String, Object>) page;
                    Map<String, Object> result = new LinkedHashMap<>();
                    result.put("id", sourcePage.get("id"));
                    result.put("pageNumber", sourcePage.get("pageNumber"));
                    result.put("width", sourcePage.get("width"));
                    result.put("height", sourcePage.get("height"));
                    result.put("orientation", sourcePage.getOrDefault("orientation", numberValue(sourcePage.get("width"), 0) >= numberValue(sourcePage.get("height"), 0) ? "landscape" : "portrait"));
                    result.put("rotation", sourcePage.getOrDefault("rotation", 0));
                    result.put("dpi", TEMPLATE_CANVAS_RENDER_DPI);
                    result.put("scanDetected", Boolean.TRUE.equals(sourcePage.get("deskewApplied")));
                    Object background = sourcePage.get("background");
                    if (background instanceof Map<?, ?> backgroundMap) {
                        result.put("background", new LinkedHashMap<>(mapValue(backgroundMap)));
                    }
                    result.put("layerSummary", analysisLayerSummary(sourcePage.get("layers")));
                    return result;
                })
                .toList();
    }

    private Map<String, Object> analysisLayerSummary(Object rawLayers) {
        Map<String, Object> summary = new LinkedHashMap<>();
        int textCount = 0;
        int lineCount = 0;
        int imageCount = 0;
        if (rawLayers instanceof List<?> layers) {
            for (Object rawLayer : layers) {
                if (!(rawLayer instanceof Map<?, ?> layer)) continue;
                Object typeValue = layer.get("type");
                String type = typeValue == null ? "" : String.valueOf(typeValue);
                if ("text".equals(type) || "cell".equals(type)) textCount++;
                if ("line".equals(type)) lineCount++;
                if ("image".equals(type)) imageCount++;
            }
        }
        summary.put("textCount", textCount);
        summary.put("lineCount", lineCount);
        summary.put("imageCount", imageCount);
        return summary;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> extractAnalysisBlocks(Map<String, Object> canvasDesign, List<AnchoredFieldSeed> anchoredFieldSeeds) {
        Object rawPages = canvasDesign.get("pages");
        if (!(rawPages instanceof List<?> pages)) return List.of();
        List<Map<String, Object>> blocks = new ArrayList<>();
        Map<String, AnchoredFieldSeed> seedByLayerId = anchoredFieldSeeds.stream()
                .filter(seed -> StringUtils.hasText(seed.sourceLayerId()))
                .collect(Collectors.toMap(AnchoredFieldSeed::sourceLayerId, seed -> seed, (first, second) -> first, LinkedHashMap::new));
        for (Object rawPage : pages) {
            if (!(rawPage instanceof Map<?, ?> page)) continue;
            Object pageId = page.get("id");
            Object rawLayers = page.get("layers");
            if (!(rawLayers instanceof List<?> layers)) continue;
            for (Object rawLayer : layers) {
                if (!(rawLayer instanceof Map<?, ?> layer)) continue;
                Object text = layer.get("text");
                if (!StringUtils.hasText(text == null ? null : String.valueOf(text))) continue;
                Map<String, Object> block = new LinkedHashMap<>();
                block.put("id", layer.get("id"));
                block.put("pageId", pageId);
                block.put("kind", "text");
                block.put("text", text);
                block.put("x", layer.get("x"));
                block.put("y", layer.get("y"));
                block.put("width", layer.get("width"));
                block.put("height", layer.get("height"));
                AnchoredFieldSeed seed = seedByLayerId.get(String.valueOf(layer.get("id")));
                Object sourceType = layer.get("sourceType");
                Object sourceRef = layer.get("sourceRef");
                Object confidence = layer.get("confidence");
                block.put("sourceType", sourceType == null ? seed == null ? layer.get("type") : seed.sourceType() : sourceType);
                block.put("sourceRef", sourceRef == null ? seed == null ? Map.of() : seed.sourceRef() : sourceRef);
                block.put("confidence", confidence == null ? seed == null ? 0.8 : seed.confidence() : confidence);
                copyAnalysisBlockLayerMetadata(block, layer);
                blocks.add(block);
            }
        }
        return blocks;
    }

    private void copyAnalysisBlockLayerMetadata(Map<String, Object> block, Map<?, ?> layer) {
        List<String> metadataFields = List.of(
                "fontFamily",
                "fontSize",
                "fontWeight",
                "fontStyle",
                "textAlign",
                "verticalAlign",
                "backgroundColor",
                "borderTop",
                "borderRight",
                "borderBottom",
                "borderLeft",
                "borderColor",
                "colSpan",
                "rowSpan"
        );
        for (String field : metadataFields) {
            Object value = layer.get(field);
            if (value != null) block.put(field, value);
        }
    }

    private Map<String, Object> candidateToAnalysisCandidate(TemplateFieldCandidateResponse candidate, List<Map<String, Object>> pages, Map<String, Map<String, Object>> blockByText) {
        Map<String, Object> labelBlock = findCandidateLabelBlock(candidate.name(), blockByText);
        String sourceText = labelBlock == null ? candidate.name() : String.valueOf(labelBlock.getOrDefault("text", candidate.name()));
        Map<String, Object> anchor = new LinkedHashMap<>();
        anchor.put("x", labelBlock == null ? 96 : labelBlock.get("x"));
        anchor.put("y", labelBlock == null ? 128 : labelBlock.get("y"));
        anchor.put("width", labelBlock == null ? 160 : labelBlock.get("width"));
        anchor.put("height", labelBlock == null ? 28 : labelBlock.get("height"));
        boolean keyValueLabel = isKeyValueLabel(sourceText);
        Map<String, Object> valueSourceRef = null;
        String pairingStrategy = null;
        if (labelBlock != null) {
            Object sourceRef = labelBlock.get("sourceRef");
            if (sourceRef instanceof Map<?, ?> sourceRefMap) {
                applyCandidateAnchorMetadata(anchor, sourceRefMap.get("valueAnchor"));
                valueSourceRef = mapValue(sourceRefMap.get("valueSourceRef"));
                pairingStrategy = sourceRefMap.get("pairingStrategy") == null ? null : String.valueOf(sourceRefMap.get("pairingStrategy"));
            }
        }
        if (keyValueLabel && labelBlock != null && !StringUtils.hasText(pairingStrategy)) {
            double labelX = numberValue(labelBlock.get("x"), 96);
            double labelWidth = numberValue(labelBlock.get("width"), 80);
            anchor.put("x", roundCanvasNumber(labelX + labelWidth + 12));
            anchor.put("width", roundCanvasNumber(Math.max(120, labelWidth * 2)));
        }
        boolean staticText = isStaticTextCandidate(candidate.name(), labelBlock);
        String type = candidate.type();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", "candidate-" + candidate.code());
        result.put("status", "pending");
        result.put("suggestedAction", staticText ? "staticText" : "component");
        result.put("suggestedComponent", componentForFieldType(type));
        result.put("fieldCode", candidate.code());
        result.put("fieldName", candidate.name());
        result.put("required", candidate.required());
        result.put("pageId", labelBlock == null ? String.valueOf(pages.isEmpty() ? "page-1" : pages.get(0).get("id")) : String.valueOf(labelBlock.get("pageId")));
        if (labelBlock != null) result.put("labelBlockId", labelBlock.get("id"));
        result.put("valueAnchor", anchor);
        result.putAll(candidateSemanticMetadata(candidate.name(), sourceText, staticText, keyValueLabel, labelBlock, anchor, pairingStrategy, valueSourceRef));
        result.put("reason", reasonForCandidate(sourceText, staticText, keyValueLabel));
        result.put("confidence", labelBlock == null ? 0.7 : labelBlock.getOrDefault("confidence", 0.85));
        return result;
    }

    private void applyCandidateAnchorMetadata(Map<String, Object> anchor, Object rawAnchor) {
        Map<String, Object> valueAnchor = mapValue(rawAnchor);
        if (valueAnchor == null) return;
        if (valueAnchor.containsKey("x")) anchor.put("x", valueAnchor.get("x"));
        if (valueAnchor.containsKey("y")) anchor.put("y", valueAnchor.get("y"));
        if (valueAnchor.containsKey("width")) anchor.put("width", valueAnchor.get("width"));
        if (valueAnchor.containsKey("height")) anchor.put("height", valueAnchor.get("height"));
    }

    private Map<String, Object> mapValue(Object value) {
        if (!(value instanceof Map<?, ?> rawMap)) return null;
        Map<String, Object> result = new LinkedHashMap<>();
        rawMap.forEach((key, item) -> {
            if (key != null) result.put(String.valueOf(key), item);
        });
        return result;
    }

    private Map<String, Object> candidateSemanticMetadata(
            String fieldName,
            String sourceText,
            boolean staticText,
            boolean keyValueLabel,
            Map<String, Object> labelBlock,
            Map<String, Object> valueAnchor,
            String pairingStrategy,
            Map<String, Object> valueSourceRef) {
        String keyText = normalizedCandidateLabel(StringUtils.hasText(sourceText) ? sourceText : fieldName);
        Map<String, Object> pairing = new LinkedHashMap<>();
        pairing.put("labelBlockId", labelBlock == null ? null : labelBlock.get("id"));
        pairing.put("strategy", staticText ? "static-text" : StringUtils.hasText(pairingStrategy) ? pairingStrategy : keyValueLabel ? "colon-label" : "same-block");
        pairing.put("valueAnchor", valueAnchor);
        if (valueSourceRef != null) pairing.put("valueSourceRef", valueSourceRef);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("sourceText", StringUtils.hasText(sourceText) ? sourceText : fieldName);
        result.put("keyText", keyText);
        result.put("valueText", "");
        result.put("semanticRole", staticText ? "staticText" : "keyValue");
        result.put("pairing", pairing);
        return result;
    }

    private Map<String, Object> findCandidateLabelBlock(String name, Map<String, Map<String, Object>> blockByText) {
        Map<String, Object> exact = blockByText.get(name);
        if (exact != null) return exact;
        Map<String, Object> fullWidthColon = blockByText.get(name + "：");
        if (fullWidthColon != null) return fullWidthColon;
        return blockByText.get(name + ":");
    }

    private String reasonForCandidate(String name, boolean staticText, boolean keyValueLabel) {
        if (!StringUtils.hasText(name)) return "解析生成的字段候选";
        if (staticText) return isInstructionText(name) ? "说明性文本，建议保留为静态文字" : "标题文本，建议保留为静态文字";
        if (keyValueLabel) return "冒号标签后存在可填写区域";
        if (name.contains("时间") || name.contains("日期") || name.contains("批号") || name.contains("编号")) return "业务关键词建议为填报字段";
        return "解析生成的字段候选";
    }

    private boolean isKeyValueLabel(String name) {
        return StringUtils.hasText(name) && (name.endsWith("：") || name.endsWith(":"));
    }

    private boolean isStaticTextCandidate(String name, Map<String, Object> labelBlock) {
        return isInstructionText(name) || isTitleCandidate(name, labelBlock);
    }

    private boolean isInstructionText(String name) {
        if (!StringUtils.hasText(name) || name.length() < 6) return false;
        return name.startsWith("说明")
                || name.startsWith("备注")
                || name.startsWith("注意")
                || name.startsWith("声明")
                || name.contains("请按")
                || name.contains("不得")
                || name.contains("必须");
    }

    private boolean isTitleCandidate(String name, Map<String, Object> labelBlock) {
        if (!StringUtils.hasText(name)) return false;
        if (isKeyValueLabel(name)) return false;
        if (name.contains("标题")) return true;
        if (!name.contains("记录") && !name.contains("表") && !name.contains("检查")) return false;
        if (labelBlock == null) return name.length() >= 6;
        double fontSize = numberValue(labelBlock.get("fontSize"), 12);
        double width = numberValue(labelBlock.get("width"), 0);
        String textAlign = String.valueOf(labelBlock.getOrDefault("textAlign", ""));
        return fontSize >= 18 || width >= 240 || "center".equals(textAlign);
    }

    private FileObject storeTemplateBackgroundImage(BufferedImage image, FileObject sourceFile, int pageNumber, List<FileObject> createdFiles) throws IOException {
        Long fileId = idGenerator.nextId();
        Path sourcePath = Path.of(sourceFile.getStoredPath());
        Path storageDir = sourcePath.getParent() == null ? Path.of(storagePath, "template-imports") : sourcePath.getParent();
        Files.createDirectories(storageDir);
        String fileName = fileId + "_" + stripExtension(sourceFile.getOriginalName()) + "_page_" + pageNumber + ".png";
        Path targetPath = storageDir.resolve(sanitizeFileName(fileName));
        try {
            ImageIO.write(image, "png", targetPath.toFile());
            byte[] bytes = Files.readAllBytes(targetPath);
            FileObject fileObject = FileObject.builder()
                    .id(fileId)
                    .tenantId(TENANT_ID)
                    .originalName(stripExtension(sourceFile.getOriginalName()) + "_第" + pageNumber + "页.png")
                    .storedPath(targetPath.toString())
                    .mimeType("image/png")
                    .fileSize((long) bytes.length)
                    .md5Hash(computeMd5(bytes))
                    .targetType("FORM_TEMPLATE_BACKGROUND")
                    .targetId(sourceFile.getTargetId())
                    .uploadedBy(AuditContext.getOperatorId())
                    .createdAt(LocalDateTime.now())
                    .build();
            FileObject saved = fileObjectRepository.save(fileObject);
            createdFiles.add(saved);
            return saved;
        } catch (IOException | RuntimeException e) {
            Files.deleteIfExists(targetPath);
            throw e;
        }
    }

    private FileObject storeTemplateConvertedPdf(byte[] bytes, FileObject sourceFile, List<FileObject> createdFiles) throws IOException {
        Long fileId = idGenerator.nextId();
        Path sourcePath = Path.of(sourceFile.getStoredPath());
        Path storageDir = sourcePath.getParent() == null ? Path.of(storagePath, "template-imports") : sourcePath.getParent();
        Files.createDirectories(storageDir);
        String fileName = fileId + "_" + stripExtension(sourceFile.getOriginalName()) + "_onlyoffice.pdf";
        Path targetPath = storageDir.resolve(sanitizeFileName(fileName));
        try {
            Files.write(targetPath, bytes);
            FileObject fileObject = FileObject.builder()
                    .id(fileId)
                    .tenantId(TENANT_ID)
                    .originalName(stripExtension(sourceFile.getOriginalName()) + "_OnlyOffice渲染.pdf")
                    .storedPath(targetPath.toString())
                    .mimeType("application/pdf")
                    .fileSize((long) bytes.length)
                    .md5Hash(computeMd5(bytes))
                    .targetType("FORM_TEMPLATE_CONVERTED_PDF")
                    .targetId(sourceFile.getTargetId())
                    .uploadedBy(AuditContext.getOperatorId())
                    .createdAt(LocalDateTime.now())
                    .build();
            FileObject saved = fileObjectRepository.save(fileObject);
            createdFiles.add(saved);
            return saved;
        } catch (IOException | RuntimeException e) {
            Files.deleteIfExists(targetPath);
            throw e;
        }
    }

    private FileObject storeTemplateEmbeddedImage(byte[] bytes, String originalName, String mimeType, FileObject sourceFile, List<FileObject> createdFiles) throws IOException {
        Long fileId = idGenerator.nextId();
        Path sourcePath = Path.of(sourceFile.getStoredPath());
        Path storageDir = sourcePath.getParent() == null ? Path.of(storagePath, "template-imports") : sourcePath.getParent();
        Files.createDirectories(storageDir);
        Path targetPath = storageDir.resolve(fileId + "_" + sanitizeFileName(originalName));
        try {
            Files.write(targetPath, bytes);
            FileObject fileObject = FileObject.builder()
                    .id(fileId)
                    .tenantId(TENANT_ID)
                    .originalName(originalName)
                    .storedPath(targetPath.toString())
                    .mimeType(mimeType)
                    .fileSize((long) bytes.length)
                    .md5Hash(computeMd5(bytes))
                    .targetType("FORM_TEMPLATE_EMBEDDED_IMAGE")
                    .targetId(sourceFile.getTargetId())
                    .uploadedBy(AuditContext.getOperatorId())
                    .createdAt(LocalDateTime.now())
                    .build();
            FileObject saved = fileObjectRepository.save(fileObject);
            createdFiles.add(saved);
            return saved;
        } catch (IOException | RuntimeException e) {
            Files.deleteIfExists(targetPath);
            throw e;
        }
    }

    private String onlyOfficeDocumentType(String fileType) {
        if ("xls".equalsIgnoreCase(fileType) || "xlsx".equalsIgnoreCase(fileType)) return "cell";
        if ("pdf".equalsIgnoreCase(fileType)) return "pdf";
        return "word";
    }

    private String onlyOfficeDocumentKey(Long versionId, Long sourceFileId) {
        return "form-template-" + versionId + "-" + sourceFileId;
    }

    private void ensureOnlyOfficeEnabled() {
        if (!onlyOfficeEnabled) {
            throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 文档服务未启用");
        }
    }

    private void validateOnlyOfficeSourceFile(FileObject sourceFile, Long versionId) {
        if (sourceFile == null
                || !"FORM_TEMPLATE_SOURCE".equals(sourceFile.getTargetType())
                || !Objects.equals(String.valueOf(versionId), sourceFile.getTargetId())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 源文件不属于当前模板版本");
        }
    }

    private String onlyOfficeSourceToken(Long templateId, Long versionId, Long sourceFileId) {
        return com.auth0.jwt.JWT.create()
                .withClaim("purpose", "onlyoffice-source")
                .withClaim("templateId", String.valueOf(templateId))
                .withClaim("versionId", String.valueOf(versionId))
                .withClaim("sourceFileId", String.valueOf(sourceFileId))
                .withClaim("key", onlyOfficeDocumentKey(versionId, sourceFileId))
                .withExpiresAt(Date.from(Instant.now().plusSeconds(ONLYOFFICE_SOURCE_TOKEN_TTL_SECONDS)))
                .sign(com.auth0.jwt.algorithms.Algorithm.HMAC256(onlyOfficeJwtSecret));
    }

    private String onlyOfficeConversionSourceToken(Long templateId, Long versionId, FileObject sourceFile) {
        return com.auth0.jwt.JWT.create()
                .withClaim("purpose", "onlyoffice-conversion-source")
                .withClaim("templateId", String.valueOf(templateId))
                .withClaim("versionId", String.valueOf(versionId))
                .withClaim("sourceFileId", String.valueOf(sourceFile.getId()))
                .withClaim("targetId", sourceFile.getTargetId())
                .withClaim("storedPath", sourceFile.getStoredPath())
                .withClaim("originalName", sourceFile.getOriginalName())
                .withClaim("mimeType", sourceFile.getMimeType())
                .withClaim("fileSize", sourceFile.getFileSize())
                .withExpiresAt(Date.from(Instant.now().plusSeconds(ONLYOFFICE_CONVERSION_SOURCE_TOKEN_TTL_SECONDS)))
                .sign(com.auth0.jwt.algorithms.Algorithm.HMAC256(onlyOfficeJwtSecret));
    }

    private FileObject verifyOnlyOfficeConversionSourceToken(String token, Long templateId, Long versionId) {
        if (!StringUtils.hasText(token)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 转换源文件签名校验失败");
        }
        try {
            com.auth0.jwt.interfaces.DecodedJWT jwt = com.auth0.jwt.JWT.require(com.auth0.jwt.algorithms.Algorithm.HMAC256(onlyOfficeJwtSecret))
                    .build()
                    .verify(token);
            if (!Objects.equals("onlyoffice-conversion-source", jwt.getClaim("purpose").asString())
                    || !Objects.equals(String.valueOf(templateId), jwt.getClaim("templateId").asString())
                    || !Objects.equals(String.valueOf(versionId), jwt.getClaim("versionId").asString())
                    || !Objects.equals(String.valueOf(versionId), jwt.getClaim("targetId").asString())) {
                throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 转换源文件签名校验失败");
            }
            Long sourceFileId = Long.valueOf(jwt.getClaim("sourceFileId").asString());
            return fileObjectRepository.findById(sourceFileId)
                    .map(sourceFile -> {
                        validateOnlyOfficeSourceFile(sourceFile, versionId);
                        return sourceFile;
                    })
                    .orElseGet(() -> onlyOfficeConversionSourceFileFromToken(jwt, sourceFileId, versionId));
        } catch (JWTVerificationException | NumberFormatException e) {
            throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 转换源文件签名校验失败");
        }
    }

    private FileObject onlyOfficeConversionSourceFileFromToken(com.auth0.jwt.interfaces.DecodedJWT jwt, Long sourceFileId, Long versionId) {
        String storedPath = jwt.getClaim("storedPath").asString();
        String originalName = jwt.getClaim("originalName").asString();
        String mimeType = jwt.getClaim("mimeType").asString();
        if (!StringUtils.hasText(storedPath) || !StringUtils.hasText(originalName) || !StringUtils.hasText(mimeType)) {
            throw new BusinessException(ErrorCode.FILE_001, "源文件不存在");
        }
        Path storageRoot = Path.of(storagePath).normalize().toAbsolutePath();
        Path sourcePath = Path.of(storedPath).normalize().toAbsolutePath();
        if (!sourcePath.startsWith(storageRoot)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 转换源文件签名校验失败");
        }
        Long fileSize = jwt.getClaim("fileSize").asLong();
        FileObject sourceFile = FileObject.builder()
                .id(sourceFileId)
                .tenantId(TENANT_ID)
                .originalName(originalName)
                .storedPath(sourcePath.toString())
                .mimeType(mimeType)
                .fileSize(fileSize == null ? 0L : fileSize)
                .targetType("FORM_TEMPLATE_SOURCE")
                .targetId(String.valueOf(versionId))
                .build();
        validateOnlyOfficeSourceFile(sourceFile, versionId);
        return sourceFile;
    }

    private void verifyOnlyOfficeSourceToken(String token, Long templateId, Long versionId, Long sourceFileId) {
        if (!StringUtils.hasText(token)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 源文件签名校验失败");
        }
        try {
            com.auth0.jwt.interfaces.DecodedJWT jwt = com.auth0.jwt.JWT.require(com.auth0.jwt.algorithms.Algorithm.HMAC256(onlyOfficeJwtSecret))
                    .build()
                    .verify(token);
            if (!Objects.equals("onlyoffice-source", jwt.getClaim("purpose").asString())
                    || !Objects.equals(String.valueOf(templateId), jwt.getClaim("templateId").asString())
                    || !Objects.equals(String.valueOf(versionId), jwt.getClaim("versionId").asString())
                    || !Objects.equals(String.valueOf(sourceFileId), jwt.getClaim("sourceFileId").asString())
                    || !Objects.equals(onlyOfficeDocumentKey(versionId, sourceFileId), jwt.getClaim("key").asString())) {
                throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 源文件签名校验失败");
            }
        } catch (JWTVerificationException e) {
            throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 源文件签名校验失败");
        }
    }

    private String onlyOfficeToken(Map<String, Object> document, Map<String, Object> editorConfig, Object documentType) {
        return com.auth0.jwt.JWT.create()
                .withClaim("document", document)
                .withClaim("documentType", String.valueOf(documentType))
                .withClaim("editorConfig", editorConfig)
                .sign(com.auth0.jwt.algorithms.Algorithm.HMAC256(onlyOfficeJwtSecret));
    }

    private Map<String, Object> onlyOfficeDocumentPermissions(String fileType) {
        Map<String, Object> permissions = new LinkedHashMap<>();
        permissions.put("edit", !"pdf".equalsIgnoreCase(fileType));
        permissions.put("download", false);
        permissions.put("print", false);
        return permissions;
    }

    private void verifyOnlyOfficeCallbackToken(Map<String, Object> callback, HttpServletRequest request, Long templateId, Long versionId, String expectedDocumentKey) {
        String token = extractOnlyOfficeCallbackToken(callback, request);
        if (!StringUtils.hasText(token)) {
            writeOnlyOfficeSecurityAudit(templateId, versionId, "OnlyOffice 回调缺少签名", callback);
            throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 回调签名校验失败");
        }
        try {
            com.auth0.jwt.interfaces.DecodedJWT jwt = com.auth0.jwt.JWT.require(com.auth0.jwt.algorithms.Algorithm.HMAC256(onlyOfficeJwtSecret))
                    .build()
                    .verify(token);
            Map<String, Object> payload = jwt.getClaim("payload").asMap();
            if (payload == null || !Objects.equals(String.valueOf(payload.get("status")), String.valueOf(callback == null ? null : callback.get("status")))) {
                writeOnlyOfficeSecurityAudit(templateId, versionId, "OnlyOffice 回调签名载荷不匹配", callback);
                throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 回调签名校验失败");
            }
            Object callbackUrl = callback == null ? null : callback.get("url");
            if (callbackUrl != null && !Objects.equals(String.valueOf(payload.get("url")), String.valueOf(callbackUrl))) {
                writeOnlyOfficeSecurityAudit(templateId, versionId, "OnlyOffice 回调签名文件地址不匹配", callback);
                throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 回调签名校验失败");
            }
            Object callbackKey = callback == null ? null : callback.get("key");
            Object payloadKey = payload.get("key");
            if (!Objects.equals(String.valueOf(payloadKey), String.valueOf(callbackKey)) || !Objects.equals(String.valueOf(callbackKey), expectedDocumentKey)) {
                writeOnlyOfficeSecurityAudit(templateId, versionId, "OnlyOffice 回调文档标识不匹配", callback);
                throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 回调签名校验失败");
            }
        } catch (JWTVerificationException e) {
            writeOnlyOfficeSecurityAudit(templateId, versionId, "OnlyOffice 回调签名校验失败", callback);
            throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 回调签名校验失败");
        }
    }

    private String extractOnlyOfficeCallbackToken(Map<String, Object> callback, HttpServletRequest request) {
        String authorization = request == null ? null : request.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(authorization) && authorization.startsWith("Bearer ")) {
            return authorization.substring("Bearer ".length()).trim();
        }
        Object bodyToken = callback == null ? null : callback.get("token");
        return bodyToken == null ? null : String.valueOf(bodyToken);
    }

    private void writeOnlyOfficeSecurityAudit(Long templateId, Long versionId, String message, Map<String, Object> callback) {
        writeAudit("FORM_TEMPLATE_VERSION", versionId, "SECURITY", "表单模板", message, Map.of(), Map.of(
                "templateId", templateId,
                "versionId", versionId,
                "status", callback == null ? null : callback.get("status"),
                "hasUrl", callback != null && StringUtils.hasText(String.valueOf(callback.get("url")))));
    }

    private FileObject storeOnlyOfficeEditedSourceFile(String editedFileUrl, Long templateId, Long versionId, FormTemplateVersion version) throws IOException {
        URI editedUri = URI.create(editedFileUrl);
        validateOnlyOfficeDownloadUrl(editedUri);
        Long fileId = idGenerator.nextId();
        String originalName = StringUtils.hasText(version.getSourceFileName()) ? version.getSourceFileName() : "onlyoffice-edited-" + versionId + ".docx";
        Path storageDir = Path.of(storagePath, "template-imports", String.valueOf(templateId), String.valueOf(versionId));
        Files.createDirectories(storageDir);
        Path targetPath = storageDir.resolve(fileId + "_" + sanitizeFileName(originalName));
        try {
            downloadOnlyOfficeEditedFile(editedUri, targetPath);
        } catch (IOException | RuntimeException e) {
            Files.deleteIfExists(targetPath);
            throw e;
        }
        byte[] bytes = Files.readAllBytes(targetPath);
        FileObject fileObject = FileObject.builder()
                .id(fileId)
                .tenantId(TENANT_ID)
                .originalName(originalName)
                .storedPath(targetPath.toString())
                .mimeType(resolveOnlyOfficeMimeType(originalName))
                .fileSize((long) bytes.length)
                .md5Hash(computeMd5(bytes))
                .targetType("FORM_TEMPLATE_SOURCE")
                .targetId(String.valueOf(versionId))
                .uploadedBy(AuditContext.getOperatorId())
                .createdAt(LocalDateTime.now())
                .build();
        return fileObjectRepository.save(fileObject);
    }

    private void downloadOnlyOfficeEditedFile(URI editedUri, Path targetPath) throws IOException {
        URI currentUri = editedUri;
        for (int redirectCount = 0; redirectCount <= ONLYOFFICE_DOWNLOAD_MAX_REDIRECTS; redirectCount++) {
            validateOnlyOfficeDownloadUrl(currentUri);
            HttpURLConnection connection = (HttpURLConnection) currentUri.toURL().openConnection();
            connection.setInstanceFollowRedirects(false);
            connection.setConnectTimeout(ONLYOFFICE_DOWNLOAD_CONNECT_TIMEOUT_MILLIS);
            connection.setReadTimeout(ONLYOFFICE_DOWNLOAD_READ_TIMEOUT_MILLIS);
            connection.setRequestMethod("GET");
            int status = connection.getResponseCode();
            if (status >= 300 && status < 400) {
                String location = connection.getHeaderField("Location");
                connection.disconnect();
                if (!StringUtils.hasText(location)) {
                    throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 回调文件地址不受信任");
                }
                currentUri = currentUri.resolve(location);
                continue;
            }
            if (status < 200 || status >= 300) {
                connection.disconnect();
                throw new IOException("OnlyOffice 回调文件下载失败：" + status);
            }
            long contentLength = connection.getContentLengthLong();
            if (contentLength > TEMPLATE_SOURCE_MAX_FILE_SIZE) {
                connection.disconnect();
                throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 回调文件大小超过限制");
            }
            try (InputStream inputStream = connection.getInputStream();
                 OutputStream outputStream = Files.newOutputStream(targetPath)) {
                copyOnlyOfficeEditedFile(inputStream, outputStream);
            } finally {
                connection.disconnect();
            }
            return;
        }
        throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 回调文件地址重定向过多");
    }

    private void copyOnlyOfficeEditedFile(InputStream inputStream, OutputStream outputStream) throws IOException {
        byte[] buffer = new byte[8192];
        long totalBytes = 0;
        int bytesRead;
        while ((bytesRead = inputStream.read(buffer)) != -1) {
            totalBytes += bytesRead;
            if (totalBytes > TEMPLATE_SOURCE_MAX_FILE_SIZE) {
                throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 回调文件大小超过限制");
            }
            outputStream.write(buffer, 0, bytesRead);
        }
    }

    private void validateOnlyOfficeDownloadUrl(URI editedUri) {
        String scheme = editedUri.getScheme();
        String host = editedUri.getHost();
        if (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 回调文件地址不受信任");
        }
        if (!isOnlyOfficeDownloadOriginAllowed(editedUri, host)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 回调文件地址不受信任");
        }
    }

    private boolean isOnlyOfficeDownloadOriginAllowed(URI editedUri, String host) {
        for (String entry : Arrays.stream(onlyOfficeDownloadAllowedHosts.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .toList()) {
            if (entry.contains("://")) {
                URI allowedOrigin = URI.create(entry);
                if (sameOrigin(editedUri, allowedOrigin)) return true;
            } else if (entry.equalsIgnoreCase(host)) {
                return true;
            }
        }
        return false;
    }

    private boolean sameOrigin(URI first, URI second) {
        return StringUtils.hasText(first.getScheme())
                && StringUtils.hasText(first.getHost())
                && first.getScheme().equalsIgnoreCase(second.getScheme())
                && first.getHost().equalsIgnoreCase(second.getHost())
                && effectivePort(first) == effectivePort(second);
    }

    private int effectivePort(URI uri) {
        if (uri.getPort() >= 0) return uri.getPort();
        if ("http".equalsIgnoreCase(uri.getScheme())) return 80;
        if ("https".equalsIgnoreCase(uri.getScheme())) return 443;
        return -1;
    }

    private String resolveOnlyOfficeMimeType(String fileName) {
        String extension = resolveFileExtension(fileName);
        if ("xlsx".equals(extension)) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        if ("xls".equals(extension)) return "application/vnd.ms-excel";
        if ("pdf".equals(extension)) return "application/pdf";
        if ("doc".equals(extension)) return "application/msword";
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }

    private MediaType resolveMediaType(String mimeType) {
        if (!StringUtils.hasText(mimeType)) return MediaType.APPLICATION_OCTET_STREAM;
        try {
            return MediaType.parseMediaType(mimeType);
        } catch (Exception e) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
    }

    private String encodeFileName(String name) {
        if (!StringUtils.hasText(name)) return "file";
        try {
            return java.net.URLEncoder.encode(name, java.nio.charset.StandardCharsets.UTF_8)
                    .replace("+", "%20");
        } catch (Exception e) {
            return "file";
        }
    }

    private void cleanupTemplateImportFiles(List<FileObject> files) {
        for (FileObject fileObject : files) {
            if (fileObject == null || !StringUtils.hasText(fileObject.getStoredPath())) continue;
            try {
                Files.deleteIfExists(Path.of(fileObject.getStoredPath()));
            } catch (IOException ignored) {
                // Import transactions roll back database rows; best-effort cleanup handles non-transactional files.
            }
        }
    }

    private TemplateImportArtifacts parseTemplateImport(Long templateId, Long versionId, FileObject sourceFile, List<FileObject> createdFiles) throws IOException {
        String fileType = resolveFileExtension(sourceFile.getOriginalName());
        if ("pdf".equals(fileType)) return parsePdfTemplateWithOnlyOfficeBackground(templateId, versionId, sourceFile, createdFiles);
        if ("png".equals(fileType) || "jpg".equals(fileType) || "jpeg".equals(fileType)) return parseImageTemplate(sourceFile, createdFiles);
        if ("doc".equals(fileType) || "docx".equals(fileType)) return parseOfficeTemplateWithOnlyOfficeBackground(templateId, versionId, sourceFile, fileType, parseWordTemplate(sourceFile, createdFiles), createdFiles);
        if ("xls".equals(fileType) || "xlsx".equals(fileType)) return parseExcelTemplate(sourceFile, createdFiles);
        throw new BusinessException(ErrorCode.FILE_003, "仅支持 PDF、Word、Excel、图片格式文件");
    }

    private TemplateImportArtifacts parsePdfTemplate(FileObject sourceFile, List<FileObject> createdFiles) throws IOException {
        return parsePdfTemplateFromPdfFile(sourceFile, sourceFile, "pdf", createdFiles);
    }

    private TemplateImportArtifacts parsePdfTemplateWithOnlyOfficeBackground(Long templateId, Long versionId, FileObject sourceFile, List<FileObject> createdFiles) throws IOException {
        if (!onlyOfficeEnabled) return parsePdfTemplate(sourceFile, createdFiles);
        byte[] convertedPdf;
        try {
            convertedPdf = onlyOfficeDocumentConverter.convertToPdf(new OnlyOfficeDocumentConverter.ConversionRequest(
                    onlyOfficeConverterUrl,
                    "pdf",
                    onlyOfficeDocumentKey(versionId, sourceFile.getId()),
                    sourceFile.getOriginalName(),
                    onlyOfficePublicBackendUrl + "/api/v1/master-data/template-modeling/form-templates/" + templateId + "/versions/" + versionId
                            + "/onlyoffice/conversion-source?token=" + onlyOfficeConversionSourceToken(templateId, versionId, sourceFile),
                    "pdf",
                    onlyOfficeJwtSecret));
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 文档转换失败，请稍后重试或检查文档服务");
        }
        FileObject convertedPdfFile = storeTemplateConvertedPdf(convertedPdf, sourceFile, createdFiles);
        TemplateImportArtifacts artifacts = parsePdfTemplateFromPdfFile(sourceFile, convertedPdfFile, "pdf", createdFiles);
        Map<String, Object> canvasDesign = new LinkedHashMap<>(artifacts.canvasDesign());
        canvasDesign.put("pages", displayOnlyPages(canvasDesign.get("pages")));
        return new TemplateImportArtifacts(
                artifacts.fileType(),
                artifacts.modelDesign(),
                canvasDesign,
                artifacts.analysisCanvasDesign(),
                artifacts.fieldCandidates(),
                artifacts.anchoredFieldSeeds());
    }

    private TemplateImportArtifacts parsePdfTemplateFromPdfFile(FileObject sourceFile, FileObject pdfFile, String sourceFileType, List<FileObject> createdFiles) throws IOException {
        List<Map<String, Object>> pages = new ArrayList<>();
        List<TemplateFieldCandidateResponse> candidates = defaultCandidatesForSource(sourceFile);
        List<AnchoredFieldSeed> anchoredFieldSeeds = new ArrayList<>();
        try (PDDocument document = Loader.loadPDF(Path.of(pdfFile.getStoredPath()).toFile())) {
            PDFRenderer renderer = new PDFRenderer(document);
            for (int index = 0; index < Math.max(1, document.getNumberOfPages()); index++) {
                PDPage page = document.getPage(index);
                TemplatePageSize pageSize = pdfPageSize(page);
                double width = pageSize.width();
                double height = pageSize.height();
                BufferedImage image = scalePreviewImage(renderer.renderImageWithDPI(index, TEMPLATE_CANVAS_RENDER_DPI, ImageType.RGB));
                FileObject background = storeTemplateBackgroundImage(image, sourceFile, index + 1, createdFiles);
                List<Map<String, Object>> textLayers = textLayersFromPdf(document, page, index);
                List<Map<String, Object>> lineLayers = lineLayersFromPdf(page, index + 1);
                if (lineLayers.isEmpty()) {
                    lineLayers = pdfRasterLineLayers(
                            image,
                            index + 1,
                            width / Math.max(1.0, image.getWidth()),
                            height / Math.max(1.0, image.getHeight()));
                }
                List<Map<String, Object>> ocrLayers = ocrTextLayers(
                        Path.of(background.getStoredPath()),
                        "page-" + (index + 1),
                        index + 1,
                        width / Math.max(1.0, image.getWidth()),
                        height / Math.max(1.0, image.getHeight()),
                        "pdf-ocr",
                        anchoredFieldSeeds,
                        lineLayers.size() + textLayers.size());
                List<Map<String, Object>> layers = new ArrayList<>(lineLayers);
                layers.addAll(textLayers);
                layers.addAll(ocrLayers);
                pdfAnchoredFieldSeeds(textLayers, index + 1, anchoredFieldSeeds);
                pages.add(canvasPage("page-" + (index + 1), index + 1, width, height, background, false, layers));
            }
            candidates = mergeCandidates(candidates, fieldCandidatesFromPdf(document));
            candidates = mergeCandidates(candidates, candidatesFromAnchoredSeeds(anchoredFieldSeeds));
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.GENERAL_001, "文件解析失败，请确认 PDF 文件未损坏");
        }
        return artifacts(sourceFile, sourceFileType, pages, candidates, anchoredFieldSeeds);
    }

    private TemplateImportArtifacts parseOfficeTemplateWithOnlyOfficeBackground(Long templateId, Long versionId, FileObject sourceFile, String sourceFileType, TemplateImportArtifacts officeArtifacts, List<FileObject> createdFiles) throws IOException {
        if (!onlyOfficeEnabled) return officeArtifacts;
        byte[] convertedPdf;
        try {
            convertedPdf = onlyOfficeDocumentConverter.convertToPdf(new OnlyOfficeDocumentConverter.ConversionRequest(
                    onlyOfficeConverterUrl,
                    sourceFileType,
                    onlyOfficeDocumentKey(versionId, sourceFile.getId()),
                    sourceFile.getOriginalName(),
                    onlyOfficePublicBackendUrl + "/api/v1/master-data/template-modeling/form-templates/" + templateId + "/versions/" + versionId
                            + "/onlyoffice/conversion-source?token=" + onlyOfficeConversionSourceToken(templateId, versionId, sourceFile),
                    "pdf",
                    onlyOfficeJwtSecret));
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 文档转换失败，请稍后重试或检查文档服务");
        }
        FileObject convertedPdfFile = storeTemplateConvertedPdf(convertedPdf, sourceFile, createdFiles);
        TemplateImportArtifacts pdfArtifacts = parsePdfTemplateFromPdfFile(sourceFile, convertedPdfFile, sourceFileType, createdFiles);
        return mergeOfficeAnalysisWithRenderedPages(officeArtifacts, pdfArtifacts);
    }

    @SuppressWarnings("unchecked")
    private TemplateImportArtifacts mergeOfficeAnalysisWithRenderedPages(TemplateImportArtifacts officeArtifacts, TemplateImportArtifacts pdfArtifacts) {
        List<Map<String, Object>> renderedPages = (List<Map<String, Object>>) pdfArtifacts.canvasDesign().getOrDefault("pages", List.of());
        Map<String, Object> modelDesign = new LinkedHashMap<>(officeArtifacts.modelDesign());
        Map<String, Object> canvasDesign = new LinkedHashMap<>(officeArtifacts.canvasDesign());
        canvasDesign.put("pages", displayOnlyPages(renderedPages));
        canvasDesign.put("orientation", renderedPages.stream().findFirst().map(page -> String.valueOf(page.get("orientation"))).orElse(String.valueOf(canvasDesign.getOrDefault("orientation", "portrait"))));
        modelDesign.put("source", canvasDesign.get("source"));
        Map<String, Object> analysisCanvasDesign = new LinkedHashMap<>(officeArtifacts.analysisCanvasDesign());
        analysisCanvasDesign.put("pages", mergeRenderedBackgroundPages(renderedPages, analysisCanvasDesign.get("pages")));
        analysisCanvasDesign.put("orientation", canvasDesign.get("orientation"));
        return new TemplateImportArtifacts(
                officeArtifacts.fileType(),
                modelDesign,
                canvasDesign,
                analysisCanvasDesign,
                officeArtifacts.fieldCandidates(),
                officeArtifacts.anchoredFieldSeeds());
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> mergeRenderedBackgroundPages(List<Map<String, Object>> renderedPages, Object rawOfficePages) {
        List<Map<String, Object>> officePages = new ArrayList<>();
        if (rawOfficePages instanceof List<?> rawPages) {
            for (Object rawPage : rawPages) {
                if (rawPage instanceof Map<?, ?> page) {
                    officePages.add(new LinkedHashMap<>((Map<String, Object>) page));
                }
            }
        }
        if (renderedPages.isEmpty()) return officePages;
        List<Map<String, Object>> pages = new ArrayList<>();
        for (int index = 0; index < renderedPages.size(); index++) {
            Map<String, Object> renderedPage = renderedPages.get(index);
            Map<String, Object> page = new LinkedHashMap<>(renderedPage);
            List<Map<String, Object>> layers = index < officePages.size()
                    ? (List<Map<String, Object>>) officePages.get(index).getOrDefault("layers", List.of())
                    : List.of();
            page.put("layers", layers);
            pages.add(page);
        }
        return pages;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> displayOnlyPages(Object rawPages) {
        if (!(rawPages instanceof List<?> pages)) return List.of();
        List<Map<String, Object>> displayPages = new ArrayList<>();
        for (Object rawPage : pages) {
            if (!(rawPage instanceof Map<?, ?> page)) continue;
            Map<String, Object> displayPage = new LinkedHashMap<>((Map<String, Object>) page);
            displayPage.put("layers", List.of());
            displayPages.add(displayPage);
        }
        return displayPages;
    }

    private TemplatePageSize pdfPageSize(PDPage page) {
        double width = page.getMediaBox().getWidth();
        double height = page.getMediaBox().getHeight();
        int normalizedRotation = Math.floorMod(page.getRotation(), 360);
        if (normalizedRotation == 90 || normalizedRotation == 270) {
            return new TemplatePageSize(height, width);
        }
        return new TemplatePageSize(width, height);
    }

    private TemplateImportArtifacts parseImageTemplate(FileObject sourceFile, List<FileObject> createdFiles) throws IOException {
        BufferedImage image = ImageIO.read(Path.of(sourceFile.getStoredPath()).toFile());
        if (image == null) throw new BusinessException(ErrorCode.FILE_003, "图片文件无法解析");
        BufferedImage normalized = scalePreviewImage(image);
        FileObject background = storeTemplateBackgroundImage(normalized, sourceFile, 1, createdFiles);
        List<AnchoredFieldSeed> anchoredFieldSeeds = new ArrayList<>();
        List<Map<String, Object>> layers = rasterLineLayers(normalized);
        layers.addAll(ocrTextLayers(
                Path.of(sourceFile.getStoredPath()),
                "page-1",
                1,
                normalized.getWidth() / Math.max(1.0, image.getWidth()),
                normalized.getHeight() / Math.max(1.0, image.getHeight()),
                "image-ocr",
                anchoredFieldSeeds,
                layers.size()));
        List<Map<String, Object>> pages = List.of(canvasPage("page-1", 1, normalized.getWidth(), normalized.getHeight(), background, true, layers));
        List<TemplateFieldCandidateResponse> candidates = mergeCandidates(defaultCandidatesForSource(sourceFile), candidatesFromAnchoredSeeds(anchoredFieldSeeds));
        return artifacts(sourceFile, resolveFileExtension(sourceFile.getOriginalName()), pages, candidates, anchoredFieldSeeds);
    }

    private List<Map<String, Object>> ocrTextLayers(
            Path imagePath,
            String pageId,
            int pageNumber,
            double scaleX,
            double scaleY,
            String sourceType,
            List<AnchoredFieldSeed> anchoredFieldSeeds,
            int startIndex) {
        List<PaddleOcrClient.OcrTextBox> textBoxes = safeOcrTextBoxes(imagePath);
        if (textBoxes.isEmpty()) return List.of();
        List<Map<String, Object>> layers = new ArrayList<>();
        int index = 0;
        for (PaddleOcrClient.OcrTextBox box : textBoxes) {
            String value = trimToNull(box.text());
            if (value == null) continue;
            double x = roundCanvasNumber(box.x() * scaleX);
            double y = roundCanvasNumber(box.y() * scaleY);
            double width = roundCanvasNumber(Math.max(12, box.width() * scaleX));
            double height = roundCanvasNumber(Math.max(12, box.height() * scaleY));
            String layerId = "layer-" + sourceType + "-" + pageNumber + "-" + index;
            Map<String, Object> sourceRef = new LinkedHashMap<>();
            sourceRef.put("pageNumber", pageNumber);
            sourceRef.put("ocrIndex", index);
            Map<String, Object> layer = textLayer(layerId, value, x, y, width, height, Math.max(10, (int) Math.round(height * 0.6)));
            layer.put("sourceType", sourceType);
            layer.put("sourceRef", sourceRef);
            layer.put("confidence", roundCanvasNumber(box.confidence()));
            layer.put("zIndex", startIndex + index + 1);
            layers.add(layer);
            if (value.length() <= 40) {
                anchoredFieldSeeds.add(new AnchoredFieldSeed(
                        toFieldCode(value),
                        value,
                        guessFieldType(value),
                        false,
                        pageId,
                        x,
                        y,
                        width,
                        height,
                        layerId,
                        sourceType,
                        sourceRef,
                        box.confidence()
                ));
            }
            index++;
            if (layers.size() >= 80) break;
        }
        return layers;
    }

    private List<PaddleOcrClient.OcrTextBox> safeOcrTextBoxes(Path imagePath) {
        try {
            List<PaddleOcrClient.OcrTextBox> textBoxes = paddleOcrClient.recognizeTextBoxes(imagePath);
            return textBoxes == null ? List.of() : textBoxes;
        } catch (RuntimeException e) {
            return List.of();
        }
    }

    private List<Map<String, Object>> rasterLineLayers(BufferedImage image) {
        List<Map<String, Object>> layers = new ArrayList<>();
        int width = image.getWidth();
        int height = image.getHeight();
        int minHorizontalLength = Math.max(32, Math.round(width * 0.30f));
        int minVerticalLength = Math.max(32, Math.round(height * 0.08f));
        int horizontalThreshold = Math.max(minHorizontalLength, Math.round(width * 0.35f));
        int verticalThreshold = Math.max(minVerticalLength, Math.round(height * 0.10f));
        boolean[] horizontalRows = new boolean[height];
        boolean[] verticalColumns = new boolean[width];
        for (int y = 0; y < height; y++) {
            int darkPixels = 0;
            for (int x = 0; x < width; x++) {
                if (isDarkPixel(image.getRGB(x, y))) darkPixels++;
            }
            horizontalRows[y] = darkPixels >= horizontalThreshold;
        }
        for (int x = 0; x < width; x++) {
            int darkPixels = 0;
            for (int y = 0; y < height; y++) {
                if (isDarkPixel(image.getRGB(x, y))) darkPixels++;
            }
            verticalColumns[x] = darkPixels >= verticalThreshold;
        }
        addRasterHorizontalLines(image, horizontalRows, minHorizontalLength, layers);
        addRasterVerticalLines(image, verticalColumns, minVerticalLength, layers);
        return layers;
    }

    private List<Map<String, Object>> pdfRasterLineLayers(BufferedImage image, int pageNumber, double scaleX, double scaleY) {
        List<Map<String, Object>> layers = rasterLineLayers(image);
        for (int index = 0; index < layers.size(); index++) {
            Map<String, Object> layer = layers.get(index);
            layer.put("id", "layer-pdf-raster-line-" + pageNumber + "-" + index);
            layer.put("x", roundCanvasNumber(numberValue(layer.get("x"), 0) * scaleX));
            layer.put("y", roundCanvasNumber(numberValue(layer.get("y"), 0) * scaleY));
            layer.put("width", roundCanvasNumber(Math.max(1, numberValue(layer.get("width"), 1) * scaleX)));
            layer.put("height", roundCanvasNumber(Math.max(1, numberValue(layer.get("height"), 1) * scaleY)));
            layer.put("borderWidth", roundCanvasNumber(Math.max(1, Math.min(numberValue(layer.get("width"), 1) * scaleX, numberValue(layer.get("height"), 1) * scaleY))));
            layer.put("sourceType", "pdf-raster-line");
            layer.put("sourceRef", Map.of("pageNumber", pageNumber, "rasterLineIndex", index));
        }
        return layers;
    }

    private void addRasterHorizontalLines(BufferedImage image, boolean[] horizontalRows, int minLength, List<Map<String, Object>> layers) {
        int y = 0;
        while (y < horizontalRows.length) {
            if (!horizontalRows[y]) {
                y++;
                continue;
            }
            int startY = y;
            while (y < horizontalRows.length && horizontalRows[y]) y++;
            int endY = y - 1;
            int minX = image.getWidth();
            int maxX = -1;
            for (int row = startY; row <= endY; row++) {
                for (int x = 0; x < image.getWidth(); x++) {
                    if (isDarkPixel(image.getRGB(x, row))) {
                        minX = Math.min(minX, x);
                        maxX = Math.max(maxX, x);
                    }
                }
            }
            int lineLength = maxX - minX + 1;
            if (lineLength >= minLength) {
                layers.add(rasterLineLayer("layer-image-line-" + layers.size(), minX, startY, lineLength, endY - startY + 1, layers.size() + 1));
            }
        }
    }

    private void addRasterVerticalLines(BufferedImage image, boolean[] verticalColumns, int minLength, List<Map<String, Object>> layers) {
        int x = 0;
        while (x < verticalColumns.length) {
            if (!verticalColumns[x]) {
                x++;
                continue;
            }
            int startX = x;
            while (x < verticalColumns.length && verticalColumns[x]) x++;
            int endX = x - 1;
            int minY = image.getHeight();
            int maxY = -1;
            for (int column = startX; column <= endX; column++) {
                for (int y = 0; y < image.getHeight(); y++) {
                    if (isDarkPixel(image.getRGB(column, y))) {
                        minY = Math.min(minY, y);
                        maxY = Math.max(maxY, y);
                    }
                }
            }
            int lineLength = maxY - minY + 1;
            if (lineLength >= minLength) {
                layers.add(rasterLineLayer("layer-image-line-" + layers.size(), startX, minY, endX - startX + 1, lineLength, layers.size() + 1));
            }
        }
    }

    private boolean isDarkPixel(int rgb) {
        int red = (rgb >> 16) & 0xFF;
        int green = (rgb >> 8) & 0xFF;
        int blue = rgb & 0xFF;
        return (red + green + blue) / 3 < 80;
    }

    private Map<String, Object> rasterLineLayer(String id, double x, double y, double width, double height, int zIndex) {
        Map<String, Object> layer = new LinkedHashMap<>();
        layer.put("id", id);
        layer.put("type", "line");
        layer.put("x", roundCanvasNumber(x));
        layer.put("y", roundCanvasNumber(y));
        layer.put("width", roundCanvasNumber(Math.max(1, width)));
        layer.put("height", roundCanvasNumber(Math.max(1, height)));
        layer.put("borderStyle", "solid");
        layer.put("borderWidth", roundCanvasNumber(Math.max(1, Math.min(width, height))));
        layer.put("borderColor", "#111111");
        layer.put("selectable", true);
        layer.put("draggable", true);
        layer.put("resizable", true);
        layer.put("zIndex", zIndex);
        return layer;
    }

    private TemplateImportArtifacts parseWordTemplate(FileObject sourceFile, List<FileObject> createdFiles) throws IOException {
        List<String> labels = new ArrayList<>();
        List<Map<String, Object>> layers = new ArrayList<>();
        List<AnchoredFieldSeed> anchoredFieldSeeds = new ArrayList<>();
        String extension = resolveFileExtension(sourceFile.getOriginalName());
        TemplatePageSize pageSize = new TemplatePageSize(595, 842);
        if ("docx".equals(extension)) {
            try (InputStream input = Files.newInputStream(Path.of(sourceFile.getStoredPath())); XWPFDocument document = new XWPFDocument(input)) {
                pageSize = wordPageSize(document);
                layers = wordParagraphLayers(document, anchoredFieldSeeds);
                layers.addAll(wordTableLayers(document, layers.size(), anchoredFieldSeeds));
                layers.addAll(wordImageLayers(document, sourceFile, createdFiles, layers.size()));
                labels = layers.stream()
                        .map(layer -> trimToNull(String.valueOf(layer.getOrDefault("text", ""))))
                        .filter(Objects::nonNull)
                        .limit(20)
                        .toList();
            } catch (Exception e) {
                throw new BusinessException(ErrorCode.GENERAL_001, "文件解析失败，请确认 Word 文件未损坏");
            }
        } else if ("doc".equals(extension)) {
            try (InputStream input = Files.newInputStream(Path.of(sourceFile.getStoredPath())); HWPFDocument document = new HWPFDocument(input); WordExtractor extractor = new WordExtractor(document)) {
                labels = Arrays.stream(extractor.getParagraphText())
                        .map(this::trimToNull)
                        .filter(Objects::nonNull)
                        .limit(20)
                        .toList();
            } catch (IOException e) {
                throw new BusinessException(ErrorCode.GENERAL_001, "文件解析失败，请确认 Word 文件未损坏");
            }
        }
        List<TemplateFieldCandidateResponse> candidates = mergeCandidates(defaultCandidatesForSource(sourceFile), candidatesFromLabels(labels));
        List<Map<String, Object>> pages = List.of(canvasPage("page-1", 1, pageSize.width(), pageSize.height(), null, false, layers.isEmpty() ? textLayersFromLabels(labels) : layers));
        return artifacts(sourceFile, resolveFileExtension(sourceFile.getOriginalName()), pages, candidates, anchoredFieldSeeds);
    }

    private TemplateImportArtifacts parseExcelTemplate(FileObject sourceFile, List<FileObject> createdFiles) throws IOException {
        List<String> labels = new ArrayList<>();
        List<Map<String, Object>> pages = new ArrayList<>();
        List<AnchoredFieldSeed> anchoredFieldSeeds = new ArrayList<>();
        int width = 842;
        int height = 595;
        String pageOrientation = "landscape";
        try (InputStream input = Files.newInputStream(Path.of(sourceFile.getStoredPath())); Workbook workbook = WorkbookFactory.create(input)) {
            DataFormatter dataFormatter = new DataFormatter(Locale.ROOT);
            FormulaEvaluator formulaEvaluator = workbook.getCreationHelper().createFormulaEvaluator();
            if (workbook.getNumberOfSheets() > 0) {
                var sheet = workbook.getSheetAt(0);
                TemplatePageSize pageSize = excelPageSize(sheet);
                width = (int) pageSize.width();
                height = (int) pageSize.height();
                pageOrientation = width > height ? "landscape" : "portrait";
                int firstRow = Math.max(0, sheet.getFirstRowNum());
                int lastRow = Math.max(sheet.getLastRowNum(), excelLastAnchoredImageRow(sheet));
                int maxColumn = 0;
                for (int rowIndex = firstRow; rowIndex <= lastRow; rowIndex++) {
                    Row row = sheet.getRow(rowIndex);
                    if (row != null) maxColumn = Math.max(maxColumn, Math.min(row.getLastCellNum(), 12));
                }
                if (maxColumn > 0) {
                    double[] columnWidths = excelColumnWidths(sheet, maxColumn);
                    int pageNumber = 1;
                    for (int pageStartRow = firstRow; pageStartRow <= lastRow; pageStartRow += EXCEL_ROWS_PER_CANVAS_PAGE) {
                        int pageEndRow = Math.min(lastRow, pageStartRow + EXCEL_ROWS_PER_CANVAS_PAGE - 1);
                        String pageId = "page-" + pageNumber;
                        List<Map<String, Object>> pageLayers = new ArrayList<>();
                        double tableWidth = 0;
                        for (double columnWidth : columnWidths) tableWidth += columnWidth;
                        ExcelPageLayout pageLayout = excelPageLayout(workbook, sheet, dataFormatter, formulaEvaluator, columnWidths, maxColumn, pageStartRow, pageEndRow);
                        pageLayers.add(lockImportedSourceLayer(excelTableLayer(pageNumber - 1, maxColumn, Math.max(1, pageEndRow - pageStartRow + 1), tableWidth, pageLayout.tableHeight())));
                        Map<String, Map<String, Object>> cellLayersByAddress = new LinkedHashMap<>();
                        List<ExcelFieldSeedSource> excelSeedSources = new ArrayList<>();
                        for (int rowIndex = pageStartRow; rowIndex <= pageEndRow; rowIndex++) {
                            Row row = sheet.getRow(rowIndex);
                            if (row == null) continue;
                            for (Cell cell : row) {
                                if (cell.getColumnIndex() >= maxColumn) continue;
                                String value = trimToNull(cellText(cell, dataFormatter, formulaEvaluator));
                                if (value != null) labels.add(value);
                                CellRangeAddress mergedRegion = excelMergedRegionForCell(sheet, rowIndex, cell.getColumnIndex());
                                if (mergedRegion != null && !excelIsMergedRegionTopLeft(mergedRegion, rowIndex, cell.getColumnIndex())) continue;
                                Map<String, Object> cellLayer = lockImportedSourceLayer(excelCellLayer(workbook, columnWidths, pageLayout, row, cell, value, mergedRegion));
                                pageLayers.add(cellLayer);
                                cellLayersByAddress.put(excelCellAddress(rowIndex, cell.getColumnIndex()), cellLayer);
                                if (value != null) excelSeedSources.add(new ExcelFieldSeedSource(sheet, cell, value, pageId, cellLayer));
                            }
                        }
                        excelSeedSources.forEach(seed -> anchoredFieldSeeds.add(excelAnchoredFieldSeed(seed.sheet(), seed.cell(), seed.value(), seed.pageId(), seed.cellLayer(), cellLayersByAddress)));
                        pageLayers.addAll(excelImageLayers(workbook, sheet, sourceFile, createdFiles, columnWidths, pageLayout, pageStartRow, pageEndRow, pageLayers.size()));
                        TemplatePageSize contentPageSize = excelContentPageSize(pageLayers, new TemplatePageSize(width, height));
                        Map<String, Object> page = canvasPage(pageId, pageNumber, contentPageSize.width(), contentPageSize.height(), null, false, pageLayers);
                        page.put("orientation", pageOrientation);
                        pages.add(page);
                        pageNumber++;
                    }
                }
            }
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.GENERAL_001, "文件解析失败，请确认 Excel 文件未损坏");
        }
        List<TemplateFieldCandidateResponse> candidates = mergeCandidates(defaultCandidatesForSource(sourceFile), candidatesFromLabels(labels));
        if (pages.isEmpty()) {
            List<Map<String, Object>> pageLayers = tableLayersFromLabels(labels);
            TemplatePageSize pageSize = excelContentPageSize(pageLayers, new TemplatePageSize(width, height));
            Map<String, Object> page = canvasPage("page-1", 1, pageSize.width(), pageSize.height(), null, false, pageLayers);
            page.put("orientation", pageOrientation);
            pages = List.of(page);
        }
        return artifacts(sourceFile, resolveFileExtension(sourceFile.getOriginalName()), pages, candidates, anchoredFieldSeeds);
    }

    private TemplatePageSize wordPageSize(XWPFDocument document) {
        try {
            var body = document.getDocument().getBody();
            if (body == null || !body.isSetSectPr() || !body.getSectPr().isSetPgSz()) return new TemplatePageSize(595, 842);
            var pageSize = body.getSectPr().getPgSz();
            double width = numberValue(pageSize.getW(), 11900) / 20.0;
            double height = numberValue(pageSize.getH(), 16840) / 20.0;
            if (width <= 0 || height <= 0) return new TemplatePageSize(595, 842);
            return new TemplatePageSize(roundCanvasNumber(width), roundCanvasNumber(height));
        } catch (RuntimeException e) {
            return new TemplatePageSize(595, 842);
        }
    }

    private TemplatePageSize excelPageSize(Sheet sheet) {
        PrintSetup printSetup = sheet.getPrintSetup();
        boolean landscape = printSetup == null || printSetup.getLandscape();
        return landscape ? new TemplatePageSize(842, 595) : new TemplatePageSize(595, 842);
    }

    private TemplatePageSize excelContentPageSize(List<Map<String, Object>> layers, TemplatePageSize fallback) {
        if (layers == null || layers.isEmpty()) return fallback;
        double maxRight = 0;
        double maxBottom = 0;
        for (Map<String, Object> layer : layers) {
            double x = numberValue(layer.get("x"), 0);
            double y = numberValue(layer.get("y"), 0);
            double width = numberValue(layer.get("width"), 0);
            double height = numberValue(layer.get("height"), 0);
            maxRight = Math.max(maxRight, x + width);
            maxBottom = Math.max(maxBottom, y + height);
        }
        if (maxRight <= 0 || maxBottom <= 0) return fallback;
        double width = roundCanvasNumber(maxRight + 48);
        double height = roundCanvasNumber(maxBottom + 48);
        return new TemplatePageSize(width, height);
    }

    private TemplateImportArtifacts artifacts(FileObject sourceFile, String fileType, List<Map<String, Object>> pages, List<TemplateFieldCandidateResponse> candidates) {
        return artifacts(sourceFile, fileType, pages, candidates, List.of());
    }

    private TemplateImportArtifacts artifacts(FileObject sourceFile, String fileType, List<Map<String, Object>> pages, List<TemplateFieldCandidateResponse> candidates, List<AnchoredFieldSeed> anchoredFieldSeeds) {
        Map<String, Object> source = sourceMetadata(sourceFile, fileType);
        List<Map<String, Object>> interactiveFields = anchoredFields(candidates, anchoredFieldSeeds);
        List<Map<String, Object>> fieldBindings = fieldBindings(interactiveFields);
        Map<String, Object> modelDesign = new LinkedHashMap<>();
        modelDesign.put("schemaVersion", "1.0");
        modelDesign.put("source", source);
        modelDesign.put("fields", interactiveFields);
        Map<String, Object> canvasDesign = new LinkedHashMap<>();
        canvasDesign.put("schemaVersion", "1.0");
        canvasDesign.put("strategy", "图层锚定+格式复刻");
        canvasDesign.put("coordinateSystem", Map.of("unit", "source-point", "origin", "top-left", "scaleMode", "fit-page"));
        canvasDesign.put("editorCapabilities", Map.of("draggableFields", true, "resizableFields", true, "fillableRuntime", true));
        canvasDesign.put("orientation", pages.stream().findFirst().map(page -> String.valueOf(page.get("orientation"))).orElse("portrait"));
        canvasDesign.put("source", source);
        canvasDesign.put("pages", pages);
        canvasDesign.put("interactiveFields", interactiveFields);
        canvasDesign.put("fieldBindings", fieldBindings);
        canvasDesign.put("fillRuntime", Map.of("valueSchemaVersion", "1.0", "values", List.of(), "submissionEvents", List.of()));
        return new TemplateImportArtifacts(fileType, modelDesign, canvasDesign, canvasDesign, candidates, anchoredFieldSeeds);
    }

    private Map<String, Object> sourceMetadata(FileObject sourceFile, String fileType) {
        Map<String, Object> source = new LinkedHashMap<>();
        source.put("fileId", String.valueOf(sourceFile.getId()));
        source.put("fileName", sourceFile.getOriginalName());
        source.put("fileType", fileType);
        source.put("mimeType", sourceFile.getMimeType());
        source.put("previewUrl", "/api/v1/files/" + sourceFile.getId() + "/preview");
        return source;
    }

    private Map<String, Object> canvasPage(String id, int pageNumber, double width, double height, FileObject background, boolean deskewApplied, List<Map<String, Object>> layers) {
        Map<String, Object> page = new LinkedHashMap<>();
        page.put("id", id);
        page.put("pageNumber", pageNumber);
        page.put("width", Math.max(1, Math.round(width)));
        page.put("height", Math.max(1, Math.round(height)));
        page.put("orientation", width > height ? "landscape" : "portrait");
        page.put("deskewApplied", deskewApplied);
        if (background != null) {
            Map<String, Object> backgroundLayer = new LinkedHashMap<>();
            backgroundLayer.put("type", "image");
            backgroundLayer.put("fileId", String.valueOf(background.getId()));
            backgroundLayer.put("url", "/api/v1/files/" + background.getId() + "/preview");
            backgroundLayer.put("mimeType", background.getMimeType());
            page.put("background", backgroundLayer);
        }
        page.put("layers", editableCanvasLayers(layers));
        return page;
    }

    private List<Map<String, Object>> editableCanvasLayers(List<Map<String, Object>> layers) {
        for (Map<String, Object> layer : layers) {
            layer.putIfAbsent("editable", true);
            layer.putIfAbsent("deletable", true);
            layer.putIfAbsent("selectable", true);
            layer.putIfAbsent("draggable", true);
            layer.putIfAbsent("resizable", true);
        }
        return layers;
    }

    private List<Map<String, Object>> anchoredFields(List<TemplateFieldCandidateResponse> candidates) {
        return anchoredFields(candidates, List.of());
    }

    private List<Map<String, Object>> anchoredFields(List<TemplateFieldCandidateResponse> candidates, List<AnchoredFieldSeed> anchoredFieldSeeds) {
        List<Map<String, Object>> fields = new ArrayList<>();
        Map<String, AnchoredFieldSeed> seedByCode = new LinkedHashMap<>();
        for (AnchoredFieldSeed seed : anchoredFieldSeeds) {
            seedByCode.putIfAbsent(seed.code(), seed);
        }
        int index = 0;
        for (TemplateFieldCandidateResponse candidate : candidates) {
            AnchoredFieldSeed seed = seedByCode.get(candidate.code());
            Map<String, Object> field = new LinkedHashMap<>();
            field.put("id", candidate.code());
            field.put("code", candidate.code());
            field.put("name", candidate.name());
            field.put("type", candidate.type());
            field.put("required", candidate.required());
            field.put("pageId", seed == null ? "page-1" : seed.pageId());
            field.put("x", seed == null ? 96 : seed.x());
            field.put("y", seed == null ? 128 + index * 42 : seed.y());
            field.put("width", seed == null ? 160 : seed.width());
            field.put("height", seed == null ? 28 : seed.height());
            field.put("fontFamily", "default");
            field.put("fontSize", 12);
            field.put("textAlign", "left");
            field.put("component", componentForFieldType(candidate.type()));
            field.put("fillable", true);
            field.put("draggable", true);
            field.put("resizable", true);
            field.put("anchor", seed == null ? Map.of("pageId", "page-1", "source", "import-parser", "unit", "source-point") : fieldAnchor(seed));
            field.put("validation", Map.of("required", candidate.required(), "rules", List.of()));
            field.put("dataBinding", Map.of("valuePath", "fields." + candidate.code(), "submissionPath", "submission.fields." + candidate.code()));
            field.put("binding", Map.of("fillable", true, "component", componentForFieldType(candidate.type())));
            fields.add(field);
            index++;
        }
        return fields;
    }

    private Map<String, Object> fieldAnchor(AnchoredFieldSeed seed) {
        Map<String, Object> anchor = new LinkedHashMap<>();
        anchor.put("pageId", seed.pageId());
        anchor.put("source", "import-parser");
        anchor.put("sourceType", seed.sourceType());
        anchor.put("sourceLayerId", seed.sourceLayerId());
        anchor.put("unit", "source-point");
        anchor.put("x", seed.x());
        anchor.put("y", seed.y());
        anchor.put("width", seed.width());
        anchor.put("height", seed.height());
        anchor.put("confidence", seed.confidence());
        anchor.put("sourceRef", seed.sourceRef());
        return anchor;
    }

    private List<Map<String, Object>> fieldBindings(List<Map<String, Object>> interactiveFields) {
        List<Map<String, Object>> bindings = new ArrayList<>();
        for (Map<String, Object> field : interactiveFields) {
            if (!(field.get("anchor") instanceof Map<?, ?> anchor)) continue;
            Object sourceLayerId = anchor.get("sourceLayerId");
            Object sourceType = anchor.get("sourceType");
            if (sourceLayerId == null || sourceType == null) continue;
            String fieldCode = String.valueOf(field.get("code"));
            Map<String, Object> binding = new LinkedHashMap<>();
            binding.put("fieldId", field.get("id"));
            binding.put("fieldCode", fieldCode);
            binding.put("pageId", field.get("pageId"));
            binding.put("sourceLayerId", sourceLayerId);
            binding.put("sourceType", sourceType);
            binding.put("valuePath", "fields." + fieldCode);
            binding.put("submissionPath", "submission.fields." + fieldCode);
            bindings.add(binding);
        }
        return bindings;
    }

    private String componentForFieldType(String type) {
        return componentForFieldTypeStatic(type);
    }

    private static String componentForFieldTypeStatic(String type) {
        if ("datetime".equals(type)) return "DateTimePicker";
        if ("number".equals(type)) return "NumberInput";
        if ("signature".equals(type)) return "SignaturePad";
        if ("textarea".equals(type)) return "TextArea";
        return "TextInput";
    }

    private List<TemplateFieldCandidateResponse> defaultCandidatesForSource(FileObject sourceFile) {
        List<TemplateFieldCandidateResponse> candidates = new ArrayList<>();
        candidates.addAll(defaultFieldCandidates());
        return candidates;
    }

    private List<TemplateFieldCandidateResponse> candidatesFromLabels(List<String> labels) {
        List<TemplateFieldCandidateResponse> candidates = new ArrayList<>();
        for (String label : labels) {
            String normalized = trimToNull(label);
            if (normalized == null || normalized.length() > 40) continue;
            String candidateName = normalizedCandidateLabel(normalized);
            candidates.add(new TemplateFieldCandidateResponse(toFieldCode(candidateName), candidateName, guessFieldType(candidateName), false));
        }
        return candidates;
    }

    private List<TemplateFieldCandidateResponse> candidatesFromAnchoredSeeds(List<AnchoredFieldSeed> anchoredFieldSeeds) {
        return anchoredFieldSeeds.stream()
                .map(seed -> {
                    String candidateName = normalizedCandidateLabel(seed.name());
                    return new TemplateFieldCandidateResponse(toFieldCode(candidateName), candidateName, seed.type(), seed.required());
                })
                .toList();
    }

    private String normalizedCandidateLabel(String label) {
        String normalized = trimToNull(label);
        if (normalized == null) return "字段";
        return normalized.replaceAll("[：:]+$", "").trim();
    }

    private List<TemplateFieldCandidateResponse> mergeCandidates(List<TemplateFieldCandidateResponse> first, List<TemplateFieldCandidateResponse> second) {
        Map<String, TemplateFieldCandidateResponse> byCode = new LinkedHashMap<>();
        first.forEach(candidate -> byCode.put(candidate.code(), candidate));
        second.forEach(candidate -> byCode.putIfAbsent(candidate.code(), candidate));
        return byCode.values().stream().limit(40).toList();
    }

    private String guessFieldType(String label) {
        if (label.contains("签名") || label.contains("签字") || label.contains("签署") || label.contains("签章")) return "signature";
        if (label.contains("时间") || label.contains("日期")) return "datetime";
        if (label.contains("数量") || label.contains("重量") || label.contains("温度")) return "number";
        if (isLongTextFieldLabel(label)) return "textarea";
        return "text";
    }

    private boolean isLongTextFieldLabel(String label) {
        if (!StringUtils.hasText(label)) return false;
        return label.contains("处理意见")
                || label.contains("异常说明")
                || label.contains("异常原因")
                || label.contains("问题描述")
                || label.contains("原因分析")
                || label.contains("整改措施")
                || label.contains("备注")
                || label.contains("结论");
    }

    private String cellText(Cell cell, DataFormatter dataFormatter, FormulaEvaluator formulaEvaluator) {
        if (cell == null) return null;
        return dataFormatter.formatCellValue(cell, formulaEvaluator);
    }

    private List<Map<String, Object>> textLayersFromLabels(List<String> labels) {
        List<Map<String, Object>> layers = new ArrayList<>();
        int index = 0;
        for (String label : labels.stream().limit(16).toList()) {
            layers.add(textLayer("layer-text-" + index, label, 48, 48 + index * 28, 360, 22, 12));
            index++;
        }
        return layers;
    }

    private List<Map<String, Object>> tableLayersFromLabels(List<String> labels) {
        List<Map<String, Object>> layers = new ArrayList<>();
        int tableCellCount = Math.min(24, labels.size());
        int tableRows = Math.max(1, (int) Math.ceil(tableCellCount / 4.0));
        Map<String, Object> table = new LinkedHashMap<>();
        table.put("id", "layer-table-0");
        table.put("type", "table");
        table.put("x", 48);
        table.put("y", 48);
        table.put("width", 720);
        table.put("height", tableRows * 32 + 16);
        table.put("rows", tableRows);
        table.put("columns", 4);
        table.put("borderStyle", "solid");
        table.put("borderWidth", 1);
        layers.add(table);
        int index = 0;
        for (String label : labels.stream().limit(24).toList()) {
            int column = index % 4;
            int row = index / 4;
            layers.add(textLayer("layer-cell-" + index, label, 48 + column * 180, 56 + row * 32, 170, 28, 12));
            index++;
        }
        return layers;
    }

    private record ExcelPageLayout(int pageStartRow, int pageEndRow, Map<Integer, Double> rowTops, Map<Integer, Double> rowHeights, double tableHeight) {
        double rowTop(int rowIndex) {
            return rowTops.getOrDefault(rowIndex, 48.0);
        }

        double rowHeight(int rowIndex) {
            return rowHeights.getOrDefault(rowIndex, 32.0);
        }

        double spanHeight(int rowIndex, int rowSpan) {
            double height = 0;
            int lastRow = Math.min(pageEndRow, rowIndex + Math.max(1, rowSpan) - 1);
            for (int index = rowIndex; index <= lastRow; index++) {
                height += rowHeight(index);
            }
            return Math.max(28, height);
        }
    }

    private ExcelPageLayout excelPageLayout(Workbook workbook, Sheet sheet, DataFormatter dataFormatter, FormulaEvaluator formulaEvaluator, double[] columnWidths, int maxColumn, int pageStartRow, int pageEndRow) {
        Map<Integer, Double> rowHeights = new LinkedHashMap<>();
        for (int rowIndex = pageStartRow; rowIndex <= pageEndRow; rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            rowHeights.put(rowIndex, excelBaseRowHeight(row));
        }
        for (int rowIndex = pageStartRow; rowIndex <= pageEndRow; rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            if (row == null) continue;
            for (Cell cell : row) {
                if (cell.getColumnIndex() >= maxColumn) continue;
                CellRangeAddress mergedRegion = excelMergedRegionForCell(sheet, rowIndex, cell.getColumnIndex());
                if (mergedRegion != null && !excelIsMergedRegionTopLeft(mergedRegion, rowIndex, cell.getColumnIndex())) continue;
                int colSpan = excelColumnSpan(mergedRegion, cell.getColumnIndex(), columnWidths.length);
                int rowSpan = excelRowSpan(mergedRegion, row.getRowNum());
                double width = excelCellWidth(columnWidths, cell.getColumnIndex(), colSpan);
                String value = trimToNull(cellText(cell, dataFormatter, formulaEvaluator));
                double requiredHeight = excelRequiredCellHeight(workbook, cell, value, width);
                if (rowSpan <= 1) {
                    rowHeights.put(rowIndex, Math.max(rowHeights.getOrDefault(rowIndex, 32.0), requiredHeight));
                } else {
                    double perRowHeight = requiredHeight / rowSpan;
                    int lastRow = Math.min(pageEndRow, rowIndex + rowSpan - 1);
                    for (int spanRowIndex = rowIndex; spanRowIndex <= lastRow; spanRowIndex++) {
                        rowHeights.put(spanRowIndex, Math.max(rowHeights.getOrDefault(spanRowIndex, 32.0), perRowHeight));
                    }
                }
            }
        }
        Map<Integer, Double> rowTops = new LinkedHashMap<>();
        double y = 48;
        for (int rowIndex = pageStartRow; rowIndex <= pageEndRow; rowIndex++) {
            rowTops.put(rowIndex, roundCanvasNumber(y));
            y += rowHeights.getOrDefault(rowIndex, 32.0);
        }
        return new ExcelPageLayout(pageStartRow, pageEndRow, rowTops, rowHeights, roundCanvasNumber(y - 48));
    }

    private double excelBaseRowHeight(Row row) {
        return row == null || row.getHeightInPoints() <= 0 ? 32 : Math.max(32, row.getHeightInPoints() * 1.35);
    }

    private double excelRequiredCellHeight(Workbook workbook, Cell cell, String value, double width) {
        CellStyle style = cell.getCellStyle();
        Font font = workbook.getFontAt(style.getFontIndexAsInt());
        double fontSize = Math.max(8, font.getFontHeightInPoints());
        int lines = excelEstimatedWrappedLineCount(value, width, fontSize);
        double contentHeight = lines * fontSize * 1.35 + 10;
        return Math.max(excelBaseRowHeight(cell.getRow()), contentHeight);
    }

    private int excelEstimatedWrappedLineCount(String value, double width, double fontSize) {
        if (!StringUtils.hasText(value)) return 1;
        double availableWidth = Math.max(24, width - 10);
        double charWidth = Math.max(6, fontSize * 0.8);
        int charsPerLine = Math.max(1, (int) Math.floor(availableWidth / charWidth));
        int lines = 0;
        for (String rawLine : value.split("\\R", -1)) {
            double weightedLength = 0;
            for (int offset = 0; offset < rawLine.length();) {
                int codePoint = rawLine.codePointAt(offset);
                weightedLength += codePoint < 128 ? 0.55 : 1.0;
                offset += Character.charCount(codePoint);
            }
            lines += Math.max(1, (int) Math.ceil(weightedLength / charsPerLine));
        }
        return Math.max(1, lines);
    }

    private Map<String, Object> excelTableLayer(int pageIndex, int columns, int rows, double tableWidth, double tableHeight) {
        Map<String, Object> table = new LinkedHashMap<>();
        table.put("id", "layer-table-" + pageIndex);
        table.put("type", "table");
        table.put("x", 48);
        table.put("y", 48);
        table.put("width", Math.max(120, tableWidth));
        table.put("height", Math.max(32, tableHeight));
        table.put("rows", rows);
        table.put("columns", columns);
        table.put("borderStyle", "solid");
        table.put("borderWidth", 0);
        table.put("borderColor", "transparent");
        table.put("showGrid", false);
        return table;
    }

    private double[] excelColumnWidths(org.apache.poi.ss.usermodel.Sheet sheet, int maxColumn) {
        double[] widths = new double[maxColumn];
        for (int columnIndex = 0; columnIndex < maxColumn; columnIndex++) {
            widths[columnIndex] = Math.max(72, Math.min(220, sheet.getColumnWidth(columnIndex) / 256.0 * 7.2));
        }
        return widths;
    }

    private double excelColumnX(double[] columnWidths, int columnIndex) {
        double x = 48;
        for (int index = 0; index < Math.min(columnIndex, columnWidths.length); index++) {
            x += columnWidths[index];
        }
        return x;
    }

    private Map<String, Object> excelCellLayer(Workbook workbook, double[] columnWidths, ExcelPageLayout pageLayout, Row row, Cell cell, String value, CellRangeAddress mergedRegion) {
        CellStyle style = cell.getCellStyle();
        Font font = workbook.getFontAt(style.getFontIndexAsInt());
        double x = excelColumnX(columnWidths, cell.getColumnIndex());
        double y = pageLayout.rowTop(row.getRowNum());
        int colSpan = excelColumnSpan(mergedRegion, cell.getColumnIndex(), columnWidths.length);
        int rowSpan = excelRowSpan(mergedRegion, row.getRowNum());
        double width = excelCellWidth(columnWidths, cell.getColumnIndex(), colSpan);
        double height = pageLayout.spanHeight(row.getRowNum(), rowSpan);
        Map<String, Object> layer = new LinkedHashMap<>();
        layer.put("id", "layer-cell-" + row.getRowNum() + "-" + cell.getColumnIndex());
        layer.put("type", "cell");
        layer.put("text", value == null ? "" : value);
        layer.put("x", x);
        layer.put("y", y);
        layer.put("width", width);
        layer.put("height", height);
        layer.put("fontFamily", StringUtils.hasText(font.getFontName()) ? font.getFontName() : "default");
        layer.put("fontSize", Math.max(8, font.getFontHeightInPoints()));
        layer.put("fontWeight", font.getBold() ? "bold" : "normal");
        layer.put("fontStyle", font.getItalic() ? "italic" : "normal");
        layer.put("textAlign", textAlign(style.getAlignment()));
        layer.put("verticalAlign", style.getVerticalAlignment().name().toLowerCase(Locale.ROOT));
        layer.put("backgroundColor", colorToHex(style.getFillForegroundColorColor()));
        layer.put("borderTop", excelBorderStyle(style, XSSFCellBorder.BorderSide.TOP));
        layer.put("borderRight", excelBorderStyle(style, XSSFCellBorder.BorderSide.RIGHT));
        layer.put("borderBottom", excelBorderStyle(style, XSSFCellBorder.BorderSide.BOTTOM));
        layer.put("borderLeft", excelBorderStyle(style, XSSFCellBorder.BorderSide.LEFT));
        layer.put("borderColor", excelHasVisibleBorder(style) ? "#303133" : "#DCDCDC");
        layer.put("colSpan", colSpan);
        layer.put("rowSpan", rowSpan);
        return layer;
    }

    private List<Map<String, Object>> excelImageLayers(Workbook workbook, Sheet sheet, FileObject sourceFile, List<FileObject> createdFiles, double[] columnWidths, ExcelPageLayout pageLayout, int pageStartRow, int pageEndRow, int startIndex) throws IOException {
        Drawing<?> drawing = sheet.getDrawingPatriarch();
        if (drawing == null) return List.of();
        List<Map<String, Object>> layers = new ArrayList<>();
        int imageIndex = 0;
        for (Object shape : drawing) {
            if (!(shape instanceof Picture picture)) continue;
            PictureData pictureData = picture.getPictureData();
            if (pictureData == null || pictureData.getData() == null || pictureData.getData().length == 0) continue;
            ClientAnchor anchor = picture.getClientAnchor();
            if (anchor != null && (anchor.getRow1() < pageStartRow || anchor.getRow1() > pageEndRow)) continue;
            byte[] bytes = pictureData.getData();
            String extension = resolveImageExtension(pictureData.suggestFileExtension());
            imageIndex++;
            String originalName = "excel_image_" + imageIndex + "." + extension;
            FileObject imageFile = storeTemplateEmbeddedImage(bytes, originalName, imageMimeType(extension), sourceFile, createdFiles);
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(bytes));
            double width = image == null ? 160 : Math.max(24, Math.min(360, image.getWidth()));
            double height = image == null ? 96 : Math.max(24, Math.min(240, image.getHeight()));
            Map<String, Object> layer = new LinkedHashMap<>();
            layer.put("id", "layer-excel-image-" + (imageIndex - 1));
            layer.put("type", "image");
            layer.put("fileId", String.valueOf(imageFile.getId()));
            layer.put("url", "/api/v1/files/" + imageFile.getId() + "/preview");
            layer.put("mimeType", imageFile.getMimeType());
            layer.put("x", anchor == null ? 48 : excelColumnX(sheet, columnWidths, anchor.getCol1()));
            layer.put("y", anchor == null ? 48 : pageLayout.rowTop(anchor.getRow1()));
            layer.put("width", width);
            layer.put("height", height);
            layer.put("objectFit", "contain");
            layer.put("opacity", 1);
            layer.put("rotation", 0);
            layer.put("zIndex", startIndex + layers.size() + 1);
            layer.put("sourceRef", excelImageSourceRef(workbook, sheet, anchor));
            layers.add(lockImportedSourceLayer(layer));
            if (layers.size() >= 20) break;
        }
        return layers;
    }

    private int excelLastAnchoredImageRow(Sheet sheet) {
        Drawing<?> drawing = sheet.getDrawingPatriarch();
        if (drawing == null) return sheet.getLastRowNum();
        int lastRow = sheet.getLastRowNum();
        for (Object shape : drawing) {
            if (!(shape instanceof Picture picture)) continue;
            ClientAnchor anchor = picture.getClientAnchor();
            if (anchor != null) lastRow = Math.max(lastRow, anchor.getRow1());
        }
        return lastRow;
    }

    private Map<String, Object> lockImportedSourceLayer(Map<String, Object> layer) {
        layer.put("editable", false);
        layer.put("deletable", false);
        layer.put("selectable", false);
        layer.put("draggable", false);
        layer.put("resizable", false);
        return layer;
    }

    private boolean excelHasVisibleBorder(CellStyle style) {
        return !"none".equals(excelBorderStyle(style, XSSFCellBorder.BorderSide.TOP))
                || !"none".equals(excelBorderStyle(style, XSSFCellBorder.BorderSide.RIGHT))
                || !"none".equals(excelBorderStyle(style, XSSFCellBorder.BorderSide.BOTTOM))
                || !"none".equals(excelBorderStyle(style, XSSFCellBorder.BorderSide.LEFT));
    }

    private double excelColumnX(Sheet sheet, double[] columnWidths, int columnIndex) {
        double x = 48;
        for (int index = 0; index < Math.max(0, columnIndex); index++) {
            x += index < columnWidths.length ? columnWidths[index] : Math.max(72, Math.min(220, sheet.getColumnWidth(index) / 256.0 * 7.2));
        }
        return x;
    }

    private Map<String, Object> excelImageSourceRef(Workbook workbook, Sheet sheet, ClientAnchor anchor) {
        Map<String, Object> sourceRef = new LinkedHashMap<>();
        sourceRef.put("sheetIndex", workbook.getSheetIndex(sheet));
        sourceRef.put("sheetName", sheet.getSheetName());
        if (anchor != null) {
            sourceRef.put("fromRow", anchor.getRow1());
            sourceRef.put("fromColumn", anchor.getCol1());
            sourceRef.put("toRow", anchor.getRow2());
            sourceRef.put("toColumn", anchor.getCol2());
        }
        return sourceRef;
    }

    private AnchoredFieldSeed excelAnchoredFieldSeed(Sheet sheet, Cell cell, String value, String pageId, Map<String, Object> cellLayer, Map<String, Map<String, Object>> cellLayersByAddress) {
        Map<String, Object> sourceRef = new LinkedHashMap<>();
        sourceRef.put("sheetIndex", sheet.getWorkbook().getSheetIndex(sheet));
        sourceRef.put("sheetName", sheet.getSheetName());
        sourceRef.put("cellAddress", excelCellAddress(cell.getRowIndex(), cell.getColumnIndex()));
        sourceRef.put("rowIndex", cell.getRowIndex());
        sourceRef.put("columnIndex", cell.getColumnIndex());
        Map<String, Object> rightBlankCellLayer = excelRightBlankCellLayer(cell, cellLayersByAddress);
        if (rightBlankCellLayer != null) {
            sourceRef.put("pairingStrategy", "right-blank-cell");
            sourceRef.put("valueAnchor", canvasAnchor(rightBlankCellLayer));
            sourceRef.put("valueSourceRef", Map.of(
                    "sheetIndex", sheet.getWorkbook().getSheetIndex(sheet),
                    "sheetName", sheet.getSheetName(),
                    "cellAddress", excelCellAddress(cell.getRowIndex(), cell.getColumnIndex() + 1),
                    "rowIndex", cell.getRowIndex(),
                    "columnIndex", cell.getColumnIndex() + 1));
        }
        return new AnchoredFieldSeed(
                toFieldCode(value),
                value,
                guessFieldType(value),
                false,
                pageId,
                numberValue(cellLayer.get("x"), 96),
                numberValue(cellLayer.get("y"), 128),
                numberValue(cellLayer.get("width"), 160),
                numberValue(cellLayer.get("height"), 28),
                String.valueOf(cellLayer.get("id")),
                "excel-cell",
                sourceRef,
                1
        );
    }

    private Map<String, Object> excelRightBlankCellLayer(Cell cell, Map<String, Map<String, Object>> cellLayersByAddress) {
        Map<String, Object> rightCellLayer = cellLayersByAddress.get(excelCellAddress(cell.getRowIndex(), cell.getColumnIndex() + 1));
        if (rightCellLayer == null) return null;
        String rightCellText = trimToNull(String.valueOf(rightCellLayer.getOrDefault("text", "")));
        return rightCellText == null ? rightCellLayer : null;
    }

    private String excelCellAddress(int rowIndex, int columnIndex) {
        return CellReference.convertNumToColString(columnIndex) + (rowIndex + 1);
    }

    private Map<String, Object> canvasAnchor(Map<String, Object> layer) {
        Map<String, Object> anchor = new LinkedHashMap<>();
        anchor.put("x", layer.get("x"));
        anchor.put("y", layer.get("y"));
        anchor.put("width", layer.get("width"));
        anchor.put("height", layer.get("height"));
        return anchor;
    }

    private double numberValue(Object value, double fallback) {
        return value instanceof Number number ? number.doubleValue() : fallback;
    }

    private double roundCanvasNumber(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private CellRangeAddress excelMergedRegionForCell(Sheet sheet, int rowIndex, int columnIndex) {
        for (int index = 0; index < sheet.getNumMergedRegions(); index++) {
            CellRangeAddress region = sheet.getMergedRegion(index);
            if (region.isInRange(rowIndex, columnIndex)) return region;
        }
        return null;
    }

    private boolean excelIsMergedRegionTopLeft(CellRangeAddress region, int rowIndex, int columnIndex) {
        return region.getFirstRow() == rowIndex && region.getFirstColumn() == columnIndex;
    }

    private int excelColumnSpan(CellRangeAddress region, int columnIndex, int columnCount) {
        if (region == null) return 1;
        int lastColumn = Math.min(region.getLastColumn(), columnCount - 1);
        return Math.max(1, lastColumn - columnIndex + 1);
    }

    private int excelRowSpan(CellRangeAddress region, int rowIndex) {
        if (region == null) return 1;
        return Math.max(1, region.getLastRow() - rowIndex + 1);
    }

    private double excelCellWidth(double[] columnWidths, int columnIndex, int colSpan) {
        double width = 0;
        for (int index = columnIndex; index < Math.min(columnWidths.length, columnIndex + colSpan); index++) {
            width += columnWidths[index];
        }
        return Math.max(1, width);
    }

    private String textAlign(HorizontalAlignment alignment) {
        if (alignment == HorizontalAlignment.CENTER) return "center";
        if (alignment == HorizontalAlignment.RIGHT) return "right";
        return "left";
    }

    private String borderStyle(org.apache.poi.ss.usermodel.BorderStyle style) {
        if (style == null || style == org.apache.poi.ss.usermodel.BorderStyle.NONE) return "none";
        if (style == org.apache.poi.ss.usermodel.BorderStyle.DASHED || style == org.apache.poi.ss.usermodel.BorderStyle.DOTTED) return "dashed";
        return "solid";
    }

    private String excelBorderStyle(CellStyle style, XSSFCellBorder.BorderSide side) {
        org.apache.poi.ss.usermodel.BorderStyle border = switch (side) {
            case TOP -> style.getBorderTop();
            case RIGHT -> style.getBorderRight();
            case BOTTOM -> style.getBorderBottom();
            case LEFT -> style.getBorderLeft();
            default -> org.apache.poi.ss.usermodel.BorderStyle.NONE;
        };
        if (border != null && border != org.apache.poi.ss.usermodel.BorderStyle.NONE) {
            return borderStyle(border);
        }
        org.apache.poi.ss.usermodel.BorderStyle xssfBorder = xssfBorderStyleFromStyleTable(style, side);
        return xssfBorder == null ? "none" : borderStyle(xssfBorder);
    }

    private org.apache.poi.ss.usermodel.BorderStyle xssfBorderStyleFromStyleTable(CellStyle style, XSSFCellBorder.BorderSide side) {
        if (!(style instanceof XSSFCellStyle xssfStyle) || XSSF_CELL_STYLE_STYLES_SOURCE_FIELD == null) return null;
        try {
            if (!xssfStyle.getCoreXf().isSetBorderId()) return null;
            long borderId = xssfStyle.getCoreXf().getBorderId();
            StylesTable stylesSource = (StylesTable) XSSF_CELL_STYLE_STYLES_SOURCE_FIELD.get(xssfStyle);
            if (stylesSource == null || borderId < 0 || borderId >= stylesSource.getBorders().size()) return null;
            org.apache.poi.ss.usermodel.BorderStyle border = stylesSource.getBorderAt((int) borderId).getBorderStyle(side);
            return border == org.apache.poi.ss.usermodel.BorderStyle.NONE ? null : border;
        } catch (IllegalAccessException | RuntimeException e) {
            return null;
        }
    }

    private static Field xssfCellStyleStylesSourceField() {
        try {
            Field field = XSSFCellStyle.class.getDeclaredField("_stylesSource");
            field.setAccessible(true);
            return field;
        } catch (NoSuchFieldException | RuntimeException e) {
            return null;
        }
    }

    private String colorToHex(Color color) {
        if (color instanceof XSSFColor xssfColor) {
            byte[] rgb = xssfColor.getRGB();
            if (rgb != null && rgb.length >= 3) {
                return "#" + HexFormat.of().formatHex(new byte[] { rgb[0], rgb[1], rgb[2] }).toUpperCase(Locale.ROOT);
            }
        }
        return "transparent";
    }

    private List<Map<String, Object>> wordParagraphLayers(XWPFDocument document, List<AnchoredFieldSeed> anchoredFieldSeeds) {
        List<Map<String, Object>> layers = new ArrayList<>();
        int index = 0;
        for (XWPFParagraph paragraph : document.getParagraphs()) {
            String text = trimToNull(paragraph.getText());
            if (text == null) continue;
            int fontSize = wordParagraphFontSize(paragraph);
            Map<String, Object> layer = textLayer("layer-word-text-" + index, text, 48, 48 + index * 30, 500, Math.max(24, fontSize + 8), fontSize);
            layer.put("fontFamily", wordParagraphFontFamily(paragraph));
            layer.put("fontWeight", wordParagraphBold(paragraph) ? "bold" : "normal");
            layer.put("fontStyle", wordParagraphItalic(paragraph) ? "italic" : "normal");
            layer.put("textAlign", wordParagraphTextAlign(paragraph));
            layer.put("selectable", true);
            layer.put("draggable", true);
            layer.put("resizable", true);
            layer.put("zIndex", index + 1);
            layers.add(layer);
            anchoredFieldSeeds.add(wordAnchoredFieldSeed(text, layer, "word-paragraph", Map.of("paragraphIndex", index)));
            index++;
            if (layers.size() >= 40) break;
        }
        return layers;
    }

    private List<Map<String, Object>> wordTableLayers(XWPFDocument document, int startIndex, List<AnchoredFieldSeed> anchoredFieldSeeds) {
        List<Map<String, Object>> layers = new ArrayList<>();
        int tableIndex = 0;
        int zIndex = startIndex + 1;
        for (XWPFTable table : document.getTables()) {
            int rows = Math.max(1, table.getNumberOfRows());
            int columns = wordTableColumnCount(table);
            double x = 48;
            double y = 48 + startIndex * 30 + tableIndex * Math.max(96, rows * 32 + 32);
            double cellWidth = Math.max(96, Math.min(240, wordTableWidth(table) / Math.max(1, columns)));
            double cellHeight = 32;
            double tableWidth = cellWidth * columns;
            Map<String, Object> tableLayer = new LinkedHashMap<>();
            tableLayer.put("id", "layer-word-table-" + tableIndex);
            tableLayer.put("type", "table");
            tableLayer.put("x", x);
            tableLayer.put("y", y);
            tableLayer.put("width", tableWidth);
            tableLayer.put("height", cellHeight * rows);
            tableLayer.put("rows", rows);
            tableLayer.put("columns", columns);
            tableLayer.put("borderStyle", "solid");
            tableLayer.put("borderWidth", 1);
            tableLayer.put("borderColor", "#DCDCDC");
            tableLayer.put("selectable", true);
            tableLayer.put("draggable", true);
            tableLayer.put("resizable", true);
            tableLayer.put("zIndex", zIndex++);
            layers.add(tableLayer);
            for (int rowIndex = 0; rowIndex < table.getRows().size(); rowIndex++) {
                XWPFTableRow row = table.getRow(rowIndex);
                List<XWPFTableCell> cells = row.getTableCells();
                int gridColumnIndex = 0;
                for (int columnIndex = 0; columnIndex < cells.size(); columnIndex++) {
                    XWPFTableCell cell = cells.get(columnIndex);
                    int colSpan = wordCellColSpan(cell);
                    if (wordCellVerticalMergeContinue(cell)) {
                        gridColumnIndex += colSpan;
                        continue;
                    }
                    int rowSpan = wordCellRowSpan(table, rowIndex, gridColumnIndex, cell);
                    Map<String, Object> cellLayer = wordTableCellLayer(
                            "layer-word-cell-" + tableIndex + "-" + rowIndex + "-" + columnIndex,
                            cell,
                            x + gridColumnIndex * cellWidth,
                            y + rowIndex * cellHeight,
                            cellWidth * colSpan,
                            cellHeight * rowSpan,
                            colSpan,
                            rowSpan,
                            zIndex++);
                    layers.add(cellLayer);
                    String value = trimToNull(cell.getText());
                    if (value != null) {
                        Map<String, Object> sourceRef = new LinkedHashMap<>();
                        sourceRef.put("tableIndex", tableIndex);
                        sourceRef.put("rowIndex", rowIndex);
                        sourceRef.put("columnIndex", columnIndex);
                        anchoredFieldSeeds.add(wordAnchoredFieldSeed(value, cellLayer, "word-table-cell", sourceRef));
                    }
                    gridColumnIndex += colSpan;
                }
            }
            tableIndex++;
            if (layers.size() >= 80) break;
        }
        return layers;
    }

    private List<Map<String, Object>> wordImageLayers(XWPFDocument document, FileObject sourceFile, List<FileObject> createdFiles, int startIndex) throws IOException {
        List<Map<String, Object>> layers = new ArrayList<>();
        List<XWPFPictureData> pictures = document.getAllPictures();
        for (int index = 0; index < pictures.size(); index++) {
            XWPFPictureData picture = pictures.get(index);
            byte[] bytes = picture.getData();
            if (bytes == null || bytes.length == 0) continue;
            String extension = resolveImageExtension(picture.suggestFileExtension());
            String originalName = "embedded_image_" + (index + 1) + "." + extension;
            FileObject imageFile = storeTemplateEmbeddedImage(bytes, originalName, imageMimeType(extension), sourceFile, createdFiles);
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(bytes));
            double width = image == null ? 160 : Math.max(24, Math.min(360, image.getWidth()));
            double height = image == null ? 96 : Math.max(24, Math.min(240, image.getHeight()));
            Map<String, Object> layer = new LinkedHashMap<>();
            layer.put("id", "layer-word-image-" + index);
            layer.put("type", "image");
            layer.put("fileId", String.valueOf(imageFile.getId()));
            layer.put("url", "/api/v1/files/" + imageFile.getId() + "/preview");
            layer.put("mimeType", imageFile.getMimeType());
            layer.put("x", 48);
            layer.put("y", 48 + startIndex * 30 + layers.size() * (height + 16));
            layer.put("width", width);
            layer.put("height", height);
            layer.put("objectFit", "contain");
            layer.put("opacity", 1);
            layer.put("rotation", 0);
            layer.put("selectable", true);
            layer.put("draggable", true);
            layer.put("resizable", true);
            layer.put("zIndex", startIndex + layers.size() + 1);
            layers.add(layer);
            if (layers.size() >= 20) break;
        }
        return layers;
    }

    private AnchoredFieldSeed wordAnchoredFieldSeed(String value, Map<String, Object> layer, String sourceType, Map<String, Object> sourceRef) {
        return new AnchoredFieldSeed(
                toFieldCode(value),
                value,
                guessFieldType(value),
                false,
                "page-1",
                numberValue(layer.get("x"), 96),
                numberValue(layer.get("y"), 128),
                numberValue(layer.get("width"), 160),
                numberValue(layer.get("height"), 28),
                String.valueOf(layer.get("id")),
                sourceType,
                sourceRef,
                0.85
        );
    }

    private int wordTableColumnCount(XWPFTable table) {
        return table.getRows().stream()
                .mapToInt(row -> row.getTableCells().stream().mapToInt(this::wordCellColSpan).sum())
                .max()
                .orElse(1);
    }

    private double wordTableWidth(XWPFTable table) {
        int width = table.getWidth();
        if (width > 0) return Math.max(240, Math.min(760, width / 10.0));
        return 480;
    }

    private int wordCellColSpan(XWPFTableCell cell) {
        if (cell.getCTTc() != null
                && cell.getCTTc().getTcPr() != null
                && cell.getCTTc().getTcPr().getGridSpan() != null
                && cell.getCTTc().getTcPr().getGridSpan().getVal() != null) {
            BigInteger span = cell.getCTTc().getTcPr().getGridSpan().getVal();
            return Math.max(1, span.intValue());
        }
        return 1;
    }

    private int wordCellRowSpan(XWPFTable table, int rowIndex, int gridColumnIndex, XWPFTableCell cell) {
        if (!wordCellVerticalMergeRestart(cell)) return 1;
        int rowSpan = 1;
        for (int nextRowIndex = rowIndex + 1; nextRowIndex < table.getRows().size(); nextRowIndex++) {
            XWPFTableCell nextCell = wordCellAtGridColumn(table.getRow(nextRowIndex), gridColumnIndex);
            if (nextCell == null || !wordCellVerticalMergeContinue(nextCell)) break;
            rowSpan++;
        }
        return rowSpan;
    }

    private XWPFTableCell wordCellAtGridColumn(XWPFTableRow row, int gridColumnIndex) {
        int currentGridColumn = 0;
        for (XWPFTableCell cell : row.getTableCells()) {
            int colSpan = wordCellColSpan(cell);
            if (gridColumnIndex >= currentGridColumn && gridColumnIndex < currentGridColumn + colSpan) {
                return cell;
            }
            currentGridColumn += colSpan;
        }
        return null;
    }

    private boolean wordCellVerticalMergeRestart(XWPFTableCell cell) {
        String value = wordCellVerticalMergeValue(cell);
        return value != null && "restart".equalsIgnoreCase(value);
    }

    private boolean wordCellVerticalMergeContinue(XWPFTableCell cell) {
        String value = wordCellVerticalMergeValue(cell);
        return value != null && !"restart".equalsIgnoreCase(value);
    }

    private String wordCellVerticalMergeValue(XWPFTableCell cell) {
        if (cell.getCTTc() == null
                || cell.getCTTc().getTcPr() == null
                || cell.getCTTc().getTcPr().getVMerge() == null) {
            return null;
        }
        Object value = cell.getCTTc().getTcPr().getVMerge().getVal();
        return value == null ? "continue" : value.toString();
    }

    private Map<String, Object> wordTableCellLayer(String id, XWPFTableCell cell, double x, double y, double width, double height, int colSpan, int rowSpan, int zIndex) {
        Map<String, Object> layer = new LinkedHashMap<>();
        String text = trimToNull(cell.getText());
        layer.put("id", id);
        layer.put("type", "cell");
        layer.put("text", text == null ? "" : text);
        layer.put("x", x);
        layer.put("y", y);
        layer.put("width", width);
        layer.put("height", height);
        layer.put("fontFamily", wordCellFontFamily(cell));
        layer.put("fontSize", wordCellFontSize(cell));
        layer.put("fontWeight", wordCellBold(cell) ? "bold" : "normal");
        layer.put("fontStyle", wordCellItalic(cell) ? "italic" : "normal");
        layer.put("textAlign", wordCellTextAlign(cell));
        layer.put("verticalAlign", wordCellVerticalAlign(cell));
        layer.put("backgroundColor", wordCellBackgroundColor(cell));
        layer.put("borderTop", "solid");
        layer.put("borderRight", "solid");
        layer.put("borderBottom", "solid");
        layer.put("borderLeft", "solid");
        layer.put("borderColor", "#DCDCDC");
        layer.put("colSpan", colSpan);
        layer.put("rowSpan", rowSpan);
        layer.put("selectable", true);
        layer.put("draggable", true);
        layer.put("resizable", true);
        layer.put("zIndex", zIndex);
        return layer;
    }

    private int wordCellFontSize(XWPFTableCell cell) {
        return cell.getParagraphs().stream()
                .flatMap(paragraph -> paragraph.getRuns().stream())
                .map(XWPFRun::getFontSize)
                .filter(size -> size != null && size > 0)
                .findFirst()
                .orElse(12);
    }

    private String wordCellFontFamily(XWPFTableCell cell) {
        return cell.getParagraphs().stream()
                .flatMap(paragraph -> paragraph.getRuns().stream())
                .map(XWPFRun::getFontFamily)
                .filter(StringUtils::hasText)
                .findFirst()
                .orElse("default");
    }

    private boolean wordCellBold(XWPFTableCell cell) {
        return cell.getParagraphs().stream()
                .flatMap(paragraph -> paragraph.getRuns().stream())
                .anyMatch(XWPFRun::isBold);
    }

    private boolean wordCellItalic(XWPFTableCell cell) {
        return cell.getParagraphs().stream()
                .flatMap(paragraph -> paragraph.getRuns().stream())
                .anyMatch(XWPFRun::isItalic);
    }

    private String wordCellTextAlign(XWPFTableCell cell) {
        return cell.getParagraphs().stream()
                .map(this::wordParagraphTextAlign)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse("left");
    }

    private String wordCellVerticalAlign(XWPFTableCell cell) {
        XWPFTableCell.XWPFVertAlign alignment = cell.getVerticalAlignment();
        if (alignment == XWPFTableCell.XWPFVertAlign.TOP) return "top";
        if (alignment == XWPFTableCell.XWPFVertAlign.BOTTOM) return "bottom";
        return "middle";
    }

    private String wordCellBackgroundColor(XWPFTableCell cell) {
        String color = trimToNull(cell.getColor());
        return color == null ? "transparent" : "#" + color.toUpperCase(Locale.ROOT);
    }

    private int wordParagraphFontSize(XWPFParagraph paragraph) {
        return paragraph.getRuns().stream()
                .map(XWPFRun::getFontSize)
                .filter(size -> size != null && size > 0)
                .findFirst()
                .orElse(12);
    }

    private String wordParagraphFontFamily(XWPFParagraph paragraph) {
        return paragraph.getRuns().stream()
                .map(XWPFRun::getFontFamily)
                .filter(StringUtils::hasText)
                .findFirst()
                .orElse("default");
    }

    private boolean wordParagraphBold(XWPFParagraph paragraph) {
        return paragraph.getRuns().stream().anyMatch(XWPFRun::isBold);
    }

    private boolean wordParagraphItalic(XWPFParagraph paragraph) {
        return paragraph.getRuns().stream().anyMatch(XWPFRun::isItalic);
    }

    private String wordParagraphTextAlign(XWPFParagraph paragraph) {
        if (paragraph.getAlignment() == org.apache.poi.xwpf.usermodel.ParagraphAlignment.CENTER) return "center";
        if (paragraph.getAlignment() == org.apache.poi.xwpf.usermodel.ParagraphAlignment.RIGHT) return "right";
        return "left";
    }

    private List<Map<String, Object>> textLayersFromPdf(PDDocument document, PDPage page, int pageIndex) {
        try {
            PdfLayerTextStripper stripper = new PdfLayerTextStripper(pageIndex + 1, page.getRotation());
            stripper.getText(document);
            return stripper.layers().stream().limit(80).toList();
        } catch (IOException e) {
            return List.of();
        }
    }

    private List<TemplateFieldCandidateResponse> fieldCandidatesFromPdf(PDDocument document) {
        try {
            String text = new PDFTextStripper().getText(document);
            List<String> labels = text.lines()
                    .map(this::trimToNull)
                    .filter(Objects::nonNull)
                    .filter(line -> line.length() <= 40)
                    .limit(30)
                    .toList();
            return candidatesFromLabels(labels);
        } catch (IOException e) {
            return List.of();
        }
    }

    private List<Map<String, Object>> lineLayersFromPdf(PDPage page, int pageNumber) {
        try {
            PdfLineLayerExtractor extractor = new PdfLineLayerExtractor(page, pageNumber);
            extractor.processPage(page);
            return extractor.layers().stream().limit(120).toList();
        } catch (IOException e) {
            return List.of();
        }
    }

    private void pdfAnchoredFieldSeeds(List<Map<String, Object>> layers, int pageNumber, List<AnchoredFieldSeed> anchoredFieldSeeds) {
        int textIndex = 0;
        for (Map<String, Object> layer : layers) {
            String value = trimToNull(String.valueOf(layer.getOrDefault("text", "")));
            if (value == null || value.length() > 40) continue;
            Map<String, Object> sourceRef = mapValue(layer.get("sourceRef"));
            if (sourceRef.isEmpty()) {
                sourceRef = new LinkedHashMap<>();
                sourceRef.put("pageNumber", pageNumber);
                sourceRef.put("textIndex", textIndex);
            }
            anchoredFieldSeeds.add(new AnchoredFieldSeed(
                    toFieldCode(value),
                    value,
                    guessFieldType(value),
                    false,
                    "page-" + pageNumber,
                    numberValue(layer.get("x"), 96),
                    numberValue(layer.get("y"), 128),
                    numberValue(layer.get("width"), 160),
                    numberValue(layer.get("height"), 28),
                    String.valueOf(layer.get("id")),
                    "pdf-text",
                    sourceRef,
                    0.8
            ));
            textIndex++;
            if (anchoredFieldSeeds.size() >= 40) break;
        }
    }

    private Map<String, Object> fallbackTextLayer(String fileName) {
        return textLayer("layer-source-name", stripExtension(fileName), 48, 48, 360, 24, 14);
    }

    private Map<String, Object> textLayer(String id, String text, double x, double y, double width, double height, int fontSize) {
        Map<String, Object> layer = new LinkedHashMap<>();
        layer.put("id", id);
        layer.put("type", "text");
        layer.put("text", text);
        layer.put("x", x);
        layer.put("y", y);
        layer.put("width", width);
        layer.put("height", height);
        layer.put("fontFamily", "default");
        layer.put("fontSize", fontSize);
        layer.put("textAlign", "left");
        return layer;
    }

    private BufferedImage scalePreviewImage(BufferedImage image) {
        if (image.getWidth() <= TEMPLATE_CANVAS_MAX_PREVIEW_WIDTH) return image;
        int targetWidth = TEMPLATE_CANVAS_MAX_PREVIEW_WIDTH;
        int targetHeight = Math.max(1, Math.round((float) image.getHeight() * targetWidth / image.getWidth()));
        BufferedImage scaled = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = scaled.createGraphics();
        graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        graphics.drawImage(image, 0, 0, targetWidth, targetHeight, null);
        graphics.dispose();
        return scaled;
    }

    private String toDesignJson(Map<String, Object> content) {
        try {
            return AUDIT_OBJECT_MAPPER.writeValueAsString(content);
        } catch (JsonProcessingException e) {
            throw new BusinessException(ErrorCode.GENERAL_001, "导入解析结果序列化失败");
        }
    }

    private JsonNode toJsonNode(Map<String, Object> content) {
        return AUDIT_OBJECT_MAPPER.valueToTree(content);
    }

    private JsonNode toJsonNode(String json) {
        try {
            return AUDIT_OBJECT_MAPPER.readTree(StringUtils.hasText(json) ? json : "{}");
        } catch (JsonProcessingException e) {
            throw new BusinessException(ErrorCode.GENERAL_001, "设计内容解析失败");
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> jsonNodeToMap(JsonNode node) {
        return AUDIT_OBJECT_MAPPER.convertValue(node == null || node.isMissingNode() || node.isNull() ? Map.of() : node, LinkedHashMap.class);
    }

    private Map<String, Object> buildConfirmedModelDesign(JsonNode currentModel, JsonNode analysisDraft, CandidateDecisionRequest request) {
        Map<String, Object> result = jsonNodeToMap(currentModel);
        result.put("schemaVersion", "1.1");
        result.put("analysis", Map.of(
                "analysisId", analysisDraft.path("analysisId").asText(),
                "confirmedAt", formatDateTime(LocalDateTime.now()),
                "confirmedBy", currentOperatorName()));
        result.put("fields", confirmedFields(analysisDraft, request));
        result.remove("analysisDraft");
        return result;
    }

    private Map<String, Object> buildConfirmedCanvasDesign(JsonNode currentCanvas, JsonNode analysisDraft, CandidateDecisionRequest request) {
        Map<String, Object> result = jsonNodeToMap(currentCanvas);
        result.put("schemaVersion", "1.1");
        List<Map<String, Object>> fields = confirmedFields(analysisDraft, request);
        result.put("interactiveFields", fields);
        result.put("fieldBindings", confirmedFieldBindings(fields));
        result.put("pages", pagesWithStaticTextLayers(result.get("pages"), analysisDraft, request));
        result.putIfAbsent("fillRuntime", defaultFillRuntime());
        return result;
    }

    private Map<String, Object> defaultFillRuntime() {
        return Map.of("valueSchemaVersion", "1.0", "values", List.of(), "submissionEvents", List.of());
    }

    private Map<String, Object> buildCandidateDecisionLedger(Long analysisId, JsonNode analysisDraft, CandidateDecisionRequest request) {
        Map<String, Object> ledger = new LinkedHashMap<>();
        ledger.put("schemaVersion", "1.0");
        ledger.put("analysisId", String.valueOf(analysisId));
        JsonNode source = analysisDraft == null ? null : analysisDraft.get("source");
        if (source != null && !source.isNull()) {
            ledger.put("source", jsonNodeToMap(source));
        }
        Map<String, JsonNode> candidates = candidatesById(analysisDraft);
        List<Map<String, Object>> decisions = new ArrayList<>();
        if (request != null && request.decisions() != null) {
            for (CandidateDecisionItem decision : request.decisions()) {
                JsonNode candidate = candidates.get(decision.candidateId());
                decisions.add(candidateDecisionLedgerItem(candidate, decision));
            }
        }
        ledger.put("decisions", decisions);
        return ledger;
    }

    private Map<String, Object> candidateDecisionLedgerItem(JsonNode candidate, CandidateDecisionItem decision) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("candidateId", decision.candidateId());
        item.put("action", decision.action());
        String fieldCode = resolveDecisionText(decision.fieldCode(), candidate, "fieldCode");
        String fieldName = resolveDecisionText(decision.fieldName(), candidate, "fieldName");
        String component = resolveDecisionText(decision.component(), candidate, "suggestedComponent");
        if (StringUtils.hasText(fieldCode)) item.put("fieldCode", fieldCode);
        if (StringUtils.hasText(fieldName)) item.put("fieldName", fieldName);
        if (StringUtils.hasText(component)) item.put("component", component);
        item.put("required", decision.required());
        if (candidate != null && !candidate.isNull()) {
            copyCandidateLedgerValue(candidate, item, "suggestedAction");
            copyCandidateLedgerValue(candidate, item, "suggestedComponent");
            copyCandidateLedgerValue(candidate, item, "pageId");
            copyCandidateLedgerValue(candidate, item, "labelBlockId");
            copyCandidateLedgerValue(candidate, item, "sourceText");
            copyCandidateLedgerValue(candidate, item, "keyText");
            copyCandidateLedgerValue(candidate, item, "valueText");
            copyCandidateLedgerValue(candidate, item, "semanticRole");
            copyCandidateLedgerValue(candidate, item, "reason");
            copyCandidateLedgerValue(candidate, item, "confidence");
            copyCandidateLedgerValue(candidate, item, "valueAnchor");
            copyCandidateLedgerValue(candidate, item, "pairing");
        }
        return item;
    }

    private String resolveDecisionText(String requestValue, JsonNode candidate, String candidateField) {
        if (StringUtils.hasText(requestValue)) return requestValue;
        if (candidate == null || candidate.isNull()) return null;
        JsonNode value = candidate.get(candidateField);
        return value == null || value.isNull() ? null : value.asText();
    }

    private void copyCandidateLedgerValue(JsonNode candidate, Map<String, Object> item, String field) {
        JsonNode value = candidate.get(field);
        if (value == null || value.isNull()) return;
        if (value.isObject()) {
            item.put(field, jsonNodeToMap(value));
        } else if (value.isArray()) {
            item.put(field, AUDIT_OBJECT_MAPPER.convertValue(value, List.class));
        } else if (value.isNumber()) {
            item.put(field, value.numberValue());
        } else if (value.isBoolean()) {
            item.put(field, value.asBoolean());
        } else {
            item.put(field, value.asText());
        }
    }

    private List<Map<String, Object>> confirmedFieldBindings(List<Map<String, Object>> fields) {
        return fields.stream()
                .map(field -> {
                    String fieldCode = String.valueOf(field.get("code"));
                    Map<String, Object> binding = new LinkedHashMap<>();
                    binding.put("fieldId", field.get("id"));
                    binding.put("fieldCode", fieldCode);
                    binding.put("pageId", field.get("pageId"));
                    binding.put("sourceCandidateId", field.get("sourceCandidateId"));
                    binding.put("valuePath", "fields." + fieldCode);
                    binding.put("submissionPath", "submission.fields." + fieldCode);
                    return binding;
                })
                .toList();
    }

    private List<Map<String, Object>> confirmedFields(JsonNode analysisDraft, CandidateDecisionRequest request) {
        Map<String, JsonNode> candidates = candidatesById(analysisDraft);
        List<Map<String, Object>> fields = new ArrayList<>();
        if (request == null || request.decisions() == null) return fields;
        for (CandidateDecisionItem decision : request.decisions()) {
            if (!"component".equals(decision.action())) continue;
            JsonNode candidate = candidates.get(decision.candidateId());
            if (candidate == null) continue;
            JsonNode anchor = candidate.path("valueAnchor");
            String code = StringUtils.hasText(decision.fieldCode()) ? decision.fieldCode() : candidate.path("fieldCode").asText();
            String component = StringUtils.hasText(decision.component()) ? decision.component() : candidate.path("suggestedComponent").asText("TextInput");
            Map<String, Object> field = new LinkedHashMap<>();
            field.put("id", "field-" + code);
            field.put("code", code);
            field.put("name", StringUtils.hasText(decision.fieldName()) ? decision.fieldName() : candidate.path("fieldName").asText(code));
            field.put("type", typeForComponent(component));
            field.put("required", decision.required());
            field.put("pageId", candidate.path("pageId").asText("page-1"));
            field.put("x", anchor.path("x").asDouble(96));
            field.put("y", anchor.path("y").asDouble(128));
            field.put("width", anchor.path("width").asDouble(160));
            field.put("height", anchor.path("height").asDouble(28));
            field.put("component", component);
            field.put("fillable", true);
            field.put("sourceCandidateId", decision.candidateId());
            copyCandidateSemanticMetadata(candidate, field);
            field.put("validation", Map.of("required", decision.required(), "rules", List.of()));
            field.put("dataBinding", Map.of("valuePath", "fields." + code, "submissionPath", "submission.fields." + code));
            field.put("binding", Map.of("fillable", true, "component", component));
            fields.add(field);
        }
        return fields;
    }

    private void copyCandidateSemanticMetadata(JsonNode candidate, Map<String, Object> field) {
        copyCandidateTextMetadata(candidate, field, "sourceText");
        copyCandidateTextMetadata(candidate, field, "keyText");
        copyCandidateTextMetadata(candidate, field, "valueText");
        copyCandidateTextMetadata(candidate, field, "semanticRole");
        JsonNode pairing = candidate.get("pairing");
        if (pairing != null && !pairing.isNull()) {
            field.put("pairing", jsonNodeToMap(pairing));
        }
    }

    private void copyCandidateTextMetadata(JsonNode candidate, Map<String, Object> field, String name) {
        JsonNode value = candidate.get(name);
        if (value != null && !value.isNull()) {
            field.put(name, value.asText());
        }
    }

    private String typeForComponent(String component) {
        if ("DateTimePicker".equals(component)) return "datetime";
        if ("NumberInput".equals(component)) return "number";
        if ("SignaturePad".equals(component)) return "signature";
        if ("TextArea".equals(component)) return "textarea";
        return "text";
    }

    private Map<String, JsonNode> candidatesById(JsonNode analysisDraft) {
        Map<String, JsonNode> candidates = new LinkedHashMap<>();
        analysisDraft.path("candidates").forEach(candidate -> candidates.put(candidate.path("id").asText(), candidate));
        return candidates;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> pagesWithStaticTextLayers(Object rawPages, JsonNode analysisDraft, CandidateDecisionRequest request) {
        List<Map<String, Object>> pages = new ArrayList<>();
        if (rawPages instanceof List<?> list) {
            pages.addAll(list.stream()
                    .filter(Map.class::isInstance)
                    .map(page -> new LinkedHashMap<>((Map<String, Object>) page))
                    .toList());
        }
        Map<String, JsonNode> candidates = candidatesById(analysisDraft);
        if (request == null || request.decisions() == null) return pages;
        for (CandidateDecisionItem decision : request.decisions()) {
            if (!"staticText".equals(decision.action())) continue;
            JsonNode candidate = candidates.get(decision.candidateId());
            if (candidate == null) continue;
            String pageId = candidate.path("pageId").asText("page-1");
            Map<String, Object> targetPage = pages.stream()
                    .filter(page -> Objects.equals(String.valueOf(page.get("id")), pageId))
                    .findFirst()
                    .orElse(null);
            if (targetPage == null) continue;
            JsonNode anchor = candidate.path("valueAnchor");
            double width = Math.max(anchor.path("width").asDouble(180), 48);
            double height = Math.max(anchor.path("height").asDouble(28), 20);
            Map<String, Object> layer = new LinkedHashMap<>();
            layer.put("id", "static-candidate-" + decision.candidateId());
            layer.put("type", "text");
            layer.put("text", staticCandidateLayerText(candidate, decision));
            layer.put("x", clampCanvasPosition(anchor.path("x").asDouble(96), width, numberValue(targetPage.get("width"), 0)));
            layer.put("y", clampCanvasPosition(anchor.path("y").asDouble(144), height, numberValue(targetPage.get("height"), 0)));
            layer.put("width", width);
            layer.put("height", height);
            layer.put("fontSize", 12);
            layer.put("textAlign", "left");
            layer.put("selectable", true);
            layer.put("draggable", true);
            layer.put("zIndex", 3);
            layer.put("sourceCandidateId", decision.candidateId());
            layer.put("sourceType", "analysis-candidate");
            JsonNode confidence = candidate.get("confidence");
            if (confidence != null && !confidence.isNull()) {
                layer.put("confidence", confidence.isNumber() ? confidence.numberValue() : confidence.asText());
            }
            List<Map<String, Object>> layers = targetPage.get("layers") instanceof List<?> existing
                    ? existing.stream().filter(Map.class::isInstance).map(item -> new LinkedHashMap<>((Map<String, Object>) item)).collect(Collectors.toCollection(ArrayList::new))
                    : new ArrayList<>();
            layers.add(layer);
            targetPage.put("layers", layers);
        }
        return pages;
    }

    private double clampCanvasPosition(double value, double size, double total) {
        double max = Math.max(0, total - size);
        return Math.min(Math.max(0, value), max);
    }

    private String staticCandidateLayerText(JsonNode candidate, CandidateDecisionItem decision) {
        String sourceText = candidate.path("sourceText").asText();
        if (StringUtils.hasText(sourceText)) return sourceText;
        if (decision != null && StringUtils.hasText(decision.fieldName())) return decision.fieldName();
        return candidate.path("fieldName").asText();
    }

    private String resolveFileExtension(String fileName) {
        if (!StringUtils.hasText(fileName) || !fileName.contains(".")) return "";
        return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }

    private String resolveImageExtension(String extension) {
        String normalized = StringUtils.hasText(extension) ? extension.toLowerCase(Locale.ROOT) : "png";
        if ("jpeg".equals(normalized)) return "jpg";
        if (List.of("png", "jpg", "gif", "bmp", "tif", "tiff").contains(normalized)) return normalized;
        return "png";
    }

    private String imageMimeType(String extension) {
        return switch (resolveImageExtension(extension)) {
            case "jpg" -> "image/jpeg";
            case "gif" -> "image/gif";
            case "bmp" -> "image/bmp";
            case "tif", "tiff" -> "image/tiff";
            default -> "image/png";
        };
    }

    private String stripExtension(String fileName) {
        if (!StringUtils.hasText(fileName)) return "导入文件";
        String normalized = sanitizeFileName(fileName);
        int index = normalized.lastIndexOf('.');
        return index > 0 ? normalized.substring(0, index) : normalized;
    }

    private String sanitizeFileName(String fileName) {
        if (!StringUtils.hasText(fileName)) return "template-source";
        return fileName.trim().replaceAll("[\\\\/:*?\"<>|]", "_");
    }

    private String toFieldCode(String label) {
        String normalized = label == null ? "field" : label.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9\\u4e00-\\u9fa5]+", "_");
        if (!StringUtils.hasText(normalized)) normalized = "field";
        if (normalized.length() > 32) normalized = normalized.substring(0, 32);
        return "field_" + Integer.toHexString(normalized.hashCode()).replace("-", "");
    }

    private String computeMd5(InputStream inputStream) throws IOException {
        try (InputStream input = inputStream) {
            MessageDigest digest = MessageDigest.getInstance("MD5");
            byte[] buffer = new byte[8192];
            int read;
            while ((read = input.read(buffer)) != -1) digest.update(buffer, 0, read);
            return HexFormat.of().formatHex(digest.digest());
        } catch (NoSuchAlgorithmException e) {
            throw new BusinessException(ErrorCode.GENERAL_001, "文件指纹计算失败");
        }
    }

    private String computeMd5(byte[] bytes) {
        try {
            MessageDigest digest = MessageDigest.getInstance("MD5");
            return HexFormat.of().formatHex(digest.digest(bytes));
        } catch (NoSuchAlgorithmException e) {
            throw new BusinessException(ErrorCode.GENERAL_001, "文件指纹计算失败");
        }
    }

    private List<TemplateCategoryResponse> toTemplateCategoryResponses(String type) {
        List<String> categories = templateCategories(type);
        Map<String, Long> counts = categories.stream()
                .filter(StringUtils::hasText)
                .map(String::trim)
                .collect(Collectors.groupingBy(category -> category, LinkedHashMap::new, Collectors.counting()));
        long total = categories.size();
        long uncategorized = categories.stream().filter(category -> !StringUtils.hasText(category)).count();
        List<TemplateCategoryResponse> responses = new ArrayList<>();
        responses.add(new TemplateCategoryResponse(CATEGORY_ALL, "全部", total, 0));
        responses.add(new TemplateCategoryResponse(CATEGORY_UNCATEGORIZED, "未分类", uncategorized, 1));
        templateCategoryRepository.findByTenantIdAndTemplateTypeOrderBySortOrderAscNameAsc(TENANT_ID, type).stream()
                .sorted(Comparator.comparing(TemplateCategory::getSortOrder, Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(TemplateCategory::getName, Comparator.nullsLast(String::compareToIgnoreCase)))
                .map(category -> toCategoryResponse(category, counts.getOrDefault(category.getName(), 0L)))
                .forEach(responses::add);
        return responses;
    }

    private List<String> templateCategories(String type) {
        if (FORM_TYPE.equals(type)) return formTemplateRepository.findAll().stream().map(FormTemplate::getCategoryName).toList();
        return dhrTemplateRepository.findAll().stream().map(DhrTemplate::getCategoryName).toList();
    }

    private TemplateCategoryResponse toCategoryResponse(TemplateCategory category, Long count) {
        return new TemplateCategoryResponse(String.valueOf(category.getId()), category.getName(), count == null ? 0L : count, category.getSortOrder() == null ? 0 : category.getSortOrder());
    }

    private long countByCategory(String type, String categoryName) {
        if (!StringUtils.hasText(categoryName)) return 0L;
        return templateCategories(type).stream().filter(category -> sameText(category, categoryName)).count();
    }

    private int nextCategorySortOrder(String type) {
        return templateCategoryRepository.findByTenantIdAndTemplateTypeOrderBySortOrderAscNameAsc(TENANT_ID, type).stream()
                .map(TemplateCategory::getSortOrder)
                .filter(Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(0) + 10;
    }

    private void renameTemplateCategory(String type, String oldName, String newName) {
        if (!StringUtils.hasText(oldName) || !StringUtils.hasText(newName) || sameText(oldName, newName)) return;
        if (FORM_TYPE.equals(type)) {
            formTemplateRepository.findAll().stream()
                    .filter(template -> sameText(template.getCategoryName(), oldName))
                    .forEach(template -> template.setCategoryName(newName));
            return;
        }
        dhrTemplateRepository.findAll().stream()
                .filter(template -> sameText(template.getCategoryName(), oldName))
                .forEach(template -> template.setCategoryName(newName));
    }

    private Long parseCategoryId(String id) {
        try {
            if (!StringUtils.hasText(id) || CATEGORY_ALL.equals(id) || CATEGORY_UNCATEGORIZED.equals(id)) return null;
            return Long.parseLong(id);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Map<String, Object> formTemplateSnapshot(FormTemplate entity, FormTemplateVersion version) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("templateCode", entity.getCode());
        snapshot.put("templateName", entity.getName());
        snapshot.put("templateCategory", entity.getCategoryName());
        snapshot.put("description", entity.getDescription());
        snapshot.put("currentVersion", version == null ? null : version.getVersion());
        snapshot.put("effectiveFrom", version == null ? null : formatDateTime(version.getEffectiveFrom()));
        snapshot.put("effectiveTo", version == null ? null : formatDateTime(version.getEffectiveTo()));
        snapshot.put("status", entity.getStatus());
        snapshot.put("createdBy", entity.getCreatedBy());
        snapshot.put("createdAt", entity.getCreatedAt());
        snapshot.put("updatedBy", entity.getUpdatedBy());
        snapshot.put("updatedAt", entity.getUpdatedAt());
        return snapshot;
    }

    private Map<String, Object> versionSnapshot(FormTemplateVersion entity) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("currentVersion", entity.getVersion());
        snapshot.put("effectiveFrom", formatDateTime(entity.getEffectiveFrom()));
        snapshot.put("effectiveTo", formatDateTime(entity.getEffectiveTo()));
        snapshot.put("sourceFileName", entity.getSourceFileName());
        snapshot.put("sourceFileId", entity.getSourceFileId() == null ? null : String.valueOf(entity.getSourceFileId()));
        snapshot.put("sourceFileType", entity.getSourceFileType());
        snapshot.put("importStatus", entity.getImportStatus());
        snapshot.put("modelDesignJson", entity.getModelDesignJson());
        snapshot.put("canvasDesignJson", entity.getCanvasDesignJson());
        snapshot.put("workflowDesignJson", entity.getWorkflowDesignJson());
        snapshot.put("status", entity.getStatus());
        snapshot.put("createdBy", entity.getCreatedBy());
        snapshot.put("createdAt", entity.getCreatedAt());
        snapshot.put("updatedBy", entity.getUpdatedBy());
        snapshot.put("updatedAt", entity.getUpdatedAt());
        return snapshot;
    }

    private Map<String, Object> dhrTemplateSnapshot(DhrTemplate entity) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("templateCode", entity.getCode());
        snapshot.put("templateName", entity.getName());
        snapshot.put("templateCategory", entity.getCategoryName());
        snapshot.put("description", entity.getDescription());
        snapshot.put("status", entity.getStatus());
        snapshot.put("createdBy", entity.getCreatedBy());
        snapshot.put("createdAt", entity.getCreatedAt());
        snapshot.put("updatedBy", entity.getUpdatedBy());
        snapshot.put("updatedAt", entity.getUpdatedAt());
        return snapshot;
    }

    private Map<String, Object> categorySnapshot(TemplateCategory entity, Long count) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("categoryName", entity.getName());
        snapshot.put("templateType", entity.getTemplateType());
        snapshot.put("templateCount", count == null ? 0L : count);
        snapshot.put("sortOrder", entity.getSortOrder());
        snapshot.put("createdBy", entity.getCreatedBy());
        snapshot.put("createdAt", entity.getCreatedAt());
        snapshot.put("updatedBy", entity.getUpdatedBy());
        snapshot.put("updatedAt", entity.getUpdatedAt());
        return snapshot;
    }

    private void writeChangedAudit(String entityType, Long entityId, String menuName, String functionName, Map<String, Object> before, Map<String, Object> after) {
        Map<String, Object> changedBefore = new LinkedHashMap<>();
        Map<String, Object> changedAfter = new LinkedHashMap<>();
        before.forEach((field, beforeValue) -> {
            if (isUpdateAuditSystemField(field)) return;
            Object afterValue = after.get(field);
            if (!Objects.equals(beforeValue, afterValue)) {
                changedBefore.put(field, beforeValue);
                changedAfter.put(field, afterValue);
            }
        });
        if (changedBefore.isEmpty()) return;
        writeAudit(entityType, entityId, "UPDATE", menuName, functionName, changedBefore, changedAfter);
    }

    private boolean isUpdateAuditSystemField(String field) {
        return "updatedBy".equals(field) || "updatedAt".equals(field);
    }

    private FormTemplateResponse toFormTemplateResponse(FormTemplate entity, FormTemplateVersion version) {
        return toFormTemplateResponse(entity, version, version == null ? List.of() : List.of(version));
    }

    private FormTemplateResponse toFormTemplateResponse(FormTemplate entity, FormTemplateVersion version, List<FormTemplateVersion> versions) {
        return new FormTemplateResponse(
                String.valueOf(entity.getId()),
                entity.getTenantId(),
                entity.getCode(),
                entity.getName(),
                entity.getType(),
                entity.getCategoryName(),
                entity.getDescription(),
                version == null ? (entity.getCurrentVersionId() == null ? null : String.valueOf(entity.getCurrentVersionId())) : String.valueOf(version.getId()),
                toVersionResponse(version),
                versions == null ? List.of() : versions.stream().map(this::toVersionResponse).toList(),
                entity.getStatus(),
                entity.getCreatedBy(),
                formatDateTime(entity.getCreatedAt()),
                entity.getUpdatedBy(),
                formatDateTime(entity.getUpdatedAt())
        );
    }

    private TemplateVersionResponse toVersionResponse(FormTemplateVersion version) {
        if (version == null) return null;
        return new TemplateVersionResponse(
                String.valueOf(version.getId()),
                version.getTemplateId() == null ? null : String.valueOf(version.getTemplateId()),
                version.getVersion(),
                version.getDescription(),
                formatDateTime(version.getEffectiveFrom()),
                formatDateTime(version.getEffectiveTo()),
                version.getSourceFileName(),
                version.getSourceFileId() == null ? null : String.valueOf(version.getSourceFileId()),
                version.getSourceFileType(),
                version.getImportStatus(),
                version.getModelDesignJson(),
                version.getCanvasDesignJson(),
                version.getWorkflowDesignJson(),
                version.getStatus(),
                version.getCreatedBy(),
                formatDateTime(version.getCreatedAt()),
                version.getUpdatedBy(),
                formatDateTime(version.getUpdatedAt())
        );
    }

    private void writeAudit(String entityType, Long entityId, String action, String menuName, String functionName, Map<String, Object> before, Map<String, Object> after) {
        auditEventRepository.save(AuditEvent.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .entityType(entityType)
                .entityId(entityId == null ? "" : String.valueOf(entityId))
                .action(action)
                .contentBefore(toAuditJson(before))
                .contentAfter(toAuditJson(after))
                .operatorId(AuditContext.getOperatorId())
                .operatorName(AuditContext.getOperatorName())
                .operatorAccount(AuditContext.getOperatorAccount())
                .source(AuditContext.getSource())
                .moduleName("数据")
                .menuName("模板建模 · " + menuName)
                .functionName(functionName)
                .dataSummary(menuName + " #" + entityId)
                .ipAddress(AuditContext.getIpAddress())
                .createdAt(LocalDateTime.now())
                .build());
    }

    private String toAuditJson(Map<String, Object> content) {
        try {
            return AUDIT_OBJECT_MAPPER.writeValueAsString(content);
        } catch (JsonProcessingException e) {
            throw new BusinessException(ErrorCode.GENERAL_001, "审计内容序列化失败");
        }
    }

    private String menuName(String type) {
        return FORM_TYPE.equals(type) ? "表单模板" : "批记录模板";
    }

    private String currentOperatorName() {
        if (StringUtils.hasText(AuditContext.getOperatorName())) return AuditContext.getOperatorName();
        if (StringUtils.hasText(AuditContext.getOperatorAccount())) return AuditContext.getOperatorAccount();
        return "系统管理员";
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private boolean sameText(String left, String right) {
        String leftValue = StringUtils.hasText(left) ? left.trim() : "";
        String rightValue = StringUtils.hasText(right) ? right.trim() : "";
        return leftValue.equalsIgnoreCase(rightValue);
    }

    private record TemplateImportArtifacts(
            String fileType,
            Map<String, Object> modelDesign,
            Map<String, Object> canvasDesign,
            Map<String, Object> analysisCanvasDesign,
            List<TemplateFieldCandidateResponse> fieldCandidates,
            List<AnchoredFieldSeed> anchoredFieldSeeds) {
    }

    private record ExcelFieldSeedSource(Sheet sheet, Cell cell, String value, String pageId, Map<String, Object> cellLayer) {
    }

    private record AnchoredFieldSeed(
            String code,
            String name,
            String type,
            boolean required,
            String pageId,
            double x,
            double y,
            double width,
            double height,
            String sourceLayerId,
            String sourceType,
            Map<String, Object> sourceRef,
            double confidence) {
    }

    private record TemplatePageSize(double width, double height) {
    }

    private class PdfLayerTextStripper extends PDFTextStripper {
        private final List<Map<String, Object>> layers = new ArrayList<>();
        private final int rotation;

        PdfLayerTextStripper(int pageNumber, int rotation) throws IOException {
            this.rotation = Math.floorMod(rotation, 360);
            setStartPage(pageNumber);
            setEndPage(pageNumber);
            setSortByPosition(true);
        }

        @Override
        protected void writeString(String text, List<TextPosition> textPositions) {
            String value = trimToNull(text);
            if (value == null || textPositions == null || textPositions.isEmpty()) return;
            TextPosition first = textPositions.get(0);
            TextPosition last = textPositions.get(textPositions.size() - 1);
            double width = Math.max(24, last.getXDirAdj() + last.getWidthDirAdj() - first.getXDirAdj());
            Map<String, Object> layer = textLayer("layer-pdf-text-" + layers.size(), value, first.getXDirAdj(), first.getYDirAdj(), width, Math.max(12, first.getHeightDir()), Math.round(first.getFontSizeInPt()));
            layer.put("sourceType", "pdf-text");
            layer.put("sourceRef", Map.of(
                    "pageNumber", getCurrentPageNo(),
                    "textIndex", layers.size(),
                    "rotation", rotation
            ));
            layers.add(layer);
        }

        List<Map<String, Object>> layers() {
            return layers;
        }
    }

    private class PdfLineLayerExtractor extends PDFGraphicsStreamEngine {
        private final List<Map<String, Object>> layers = new ArrayList<>();
        private final double pageHeight;
        private final int pageNumber;
        private Point2D currentPoint;

        PdfLineLayerExtractor(PDPage page, int pageNumber) {
            super(page);
            this.pageHeight = page.getMediaBox().getHeight();
            this.pageNumber = pageNumber;
        }

        @Override
        public void appendRectangle(Point2D p0, Point2D p1, Point2D p2, Point2D p3) {
            addLine(p0, p1);
            addLine(p1, p2);
            addLine(p2, p3);
            addLine(p3, p0);
        }

        @Override
        public void drawImage(PDImage pdImage) {
            // Image content is represented by the rendered page background in this phase.
        }

        @Override
        public void clip(int windingRule) {
        }

        @Override
        public void moveTo(float x, float y) {
            currentPoint = transformedPoint(x, y);
        }

        @Override
        public void lineTo(float x, float y) {
            Point2D nextPoint = transformedPoint(x, y);
            addLine(currentPoint, nextPoint);
            currentPoint = nextPoint;
        }

        @Override
        public void curveTo(float x1, float y1, float x2, float y2, float x3, float y3) {
            currentPoint = transformedPoint(x3, y3);
        }

        @Override
        public Point2D getCurrentPoint() {
            return currentPoint;
        }

        @Override
        public void closePath() {
        }

        @Override
        public void endPath() {
        }

        @Override
        public void strokePath() {
        }

        @Override
        public void fillPath(int windingRule) {
        }

        @Override
        public void fillAndStrokePath(int windingRule) {
        }

        @Override
        public void shadingFill(COSName shadingName) {
        }

        private void addLine(Point2D from, Point2D to) {
            if (from == null || to == null) return;
            double x1 = from.getX();
            double y1 = from.getY();
            double x2 = to.getX();
            double y2 = to.getY();
            boolean horizontal = Math.abs(y1 - y2) <= 0.75 && Math.abs(x1 - x2) >= 2;
            boolean vertical = Math.abs(x1 - x2) <= 0.75 && Math.abs(y1 - y2) >= 2;
            if (!horizontal && !vertical) return;
            double lineWidth = Math.max(1, getGraphicsState().getLineWidth());
            double x = Math.min(x1, x2);
            double topY = pageHeight - Math.max(y1, y2);
            double width = horizontal ? Math.abs(x2 - x1) : lineWidth;
            double height = vertical ? Math.abs(y2 - y1) : lineWidth;
            Map<String, Object> layer = new LinkedHashMap<>();
            layer.put("id", "layer-pdf-line-" + pageNumber + "-" + layers.size());
            layer.put("type", "line");
            layer.put("x", roundCanvasNumber(x));
            layer.put("y", roundCanvasNumber(topY));
            layer.put("width", roundCanvasNumber(Math.max(1, width)));
            layer.put("height", roundCanvasNumber(Math.max(1, height)));
            layer.put("borderStyle", "solid");
            layer.put("borderWidth", roundCanvasNumber(lineWidth));
            layer.put("borderColor", pdfStrokeColor());
            layer.put("selectable", true);
            layer.put("draggable", true);
            layer.put("resizable", true);
            layer.put("zIndex", layers.size() + 1);
            layers.add(layer);
        }

        private String pdfStrokeColor() {
            try {
                int rgb = getGraphicsState().getStrokingColor().toRGB();
                return String.format("#%06X", rgb & 0xFFFFFF);
            } catch (Exception e) {
                return "#303133";
            }
        }

        List<Map<String, Object>> layers() {
            return layers;
        }
    }

    public record TemplateCategoryRequest(String name) {
    }

    public record TemplateCategoryOrderRequest(List<String> ids) {
    }

    public record TemplateCategoryResponse(String id, String name, Long count, Integer sortOrder) {
    }

    public record FormTemplateResponse(
            String id,
            String tenantId,
            String code,
            String name,
            String type,
            String categoryName,
            String description,
            String currentVersionId,
            TemplateVersionResponse currentVersion,
            List<TemplateVersionResponse> versions,
            String status,
            String createdBy,
            String createdAt,
            String updatedBy,
            String updatedAt) {
    }

    public record TemplateVersionResponse(
            String id,
            String templateId,
            String version,
            String description,
            String effectiveFrom,
            String effectiveTo,
            String sourceFileName,
            String sourceFileId,
            String sourceFileType,
            String importStatus,
            String modelDesignJson,
            String canvasDesignJson,
            String workflowDesignJson,
            String status,
            String createdBy,
            String createdAt,
            String updatedBy,
            String updatedAt) {
    }

    public record TemplateImportResponse(
            TemplateVersionResponse version,
            List<TemplateFieldCandidateResponse> fieldCandidates,
            JsonNode modelDesign,
            JsonNode canvasDesign,
            JsonNode analysisDraft) {
    }

    public record TemplateFieldCandidateResponse(
            String id,
            String code,
            String name,
            String type,
            boolean required,
            String status,
            String suggestedAction,
            String suggestedComponent,
            String pageId,
            Map<String, Object> valueAnchor,
            String reason,
            double confidence) {

        public TemplateFieldCandidateResponse(String code, String name, String type, boolean required) {
            this("candidate-" + code, code, name, type, required, "pending", "component", componentForFieldTypeStatic(type),
                    "page-1", Map.of("x", 96, "y", 128, "width", 160, "height", 28), "解析生成的字段候选", 0.7);
        }
    }

    public record CandidateDecisionRequest(String analysisId, List<CandidateDecisionItem> decisions) {
    }

    public record CandidateDecisionItem(
            String candidateId,
            String action,
            String fieldCode,
            String fieldName,
            String component,
            boolean required) {
    }
}
