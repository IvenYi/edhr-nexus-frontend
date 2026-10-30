package com.zencas.edhr.masterdata.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.RdoVersionStatusResolver;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.entity.FileObject;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.masterdata.entity.DocumentCategory;
import com.zencas.edhr.masterdata.entity.DocumentVersion;
import com.zencas.edhr.masterdata.entity.SopDocument;
import com.zencas.edhr.masterdata.repository.DocumentCategoryRepository;
import com.zencas.edhr.masterdata.repository.DocumentVersionRepository;
import com.zencas.edhr.masterdata.repository.ProductProcessOperationDocumentBindingRepository;
import com.zencas.edhr.masterdata.repository.SopDocumentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
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

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.ArrayList;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/master-data/documents")
@RequiredArgsConstructor
public class DocumentManagementController {

    private static final String TENANT_ID = "default";
    private static final String DOCUMENT_CATEGORY_ALL = "ALL";
    private static final String DOCUMENT_CATEGORY_UNCATEGORIZED = "UNCATEGORIZED";
    private static final Set<String> RESERVED_CATEGORY_NAMES = Set.of("全部", "未分类", DOCUMENT_CATEGORY_ALL, DOCUMENT_CATEGORY_UNCATEGORIZED);
    private static final ObjectMapper AUDIT_OBJECT_MAPPER = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    private final SopDocumentRepository documentRepository;
    private final DocumentCategoryRepository documentCategoryRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final ProductProcessOperationDocumentBindingRepository operationDocumentBindingRepository;
    private final FileObjectRepository fileObjectRepository;
    private final AuditEventRepository auditEventRepository;
    private final SnowflakeIdGenerator idGenerator;

    @GetMapping
    public ApiResponse<PageResult<DocumentResponse>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String categoryId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        String normalizedCategoryId = normalizeCategoryFilter(categoryId);
        List<SopDocument> documents = documentRepository.findAll().stream()
                .filter(document -> matchesCategory(document, normalizedCategoryId))
                .filter(document -> matchesKeyword(document, keyword))
                .sorted(Comparator.comparing(SopDocument::getUpdatedAt, Comparator.nullsLast(LocalDateTime::compareTo)).reversed())
                .toList();
        Map<Long, DocumentCategory> categoriesById = documentCategoriesById();
        Map<Long, List<DocumentVersion>> versionsByDocument = documents.isEmpty() ? Map.of() : documentVersionRepository
                .findByDocumentIdInOrderByCreatedAtDesc(documents.stream().map(SopDocument::getId).toList())
                .stream().collect(Collectors.groupingBy(DocumentVersion::getDocumentId));
        int safePage = Math.max(page, 1);
        int safeSize = Math.max(size, 1);
        int from = Math.min((safePage - 1) * safeSize, documents.size());
        int to = Math.min(from + safeSize, documents.size());
        return ApiResponse.success(PageResult.of(documents.subList(from, to).stream()
                .map(document -> toResponse(document, versionsByDocument.getOrDefault(document.getId(), List.of()), categoriesById))
                .toList(), safePage, safeSize, documents.size()));
    }

    @GetMapping("/categories")
    public ApiResponse<List<DocumentCategoryResponse>> listCategories() {
        return ApiResponse.success(toDocumentCategoryResponses());
    }

    @PostMapping("/categories")
    @Transactional
    public ApiResponse<DocumentCategoryResponse> createCategory(@RequestBody DocumentCategoryRequest request) {
        String name = requireCategoryName(request);
        if (documentCategoryRepository.existsByTenantIdAndNameIgnoreCase(TENANT_ID, name)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "文档分类已存在");
        }
        DocumentCategory saved = documentCategoryRepository.save(DocumentCategory.builder()
                .id(idGenerator.nextId()).tenantId(TENANT_ID).name(name).sortOrder(nextDocumentCategorySortOrder())
                .createdBy(currentOperatorName()).createdAt(LocalDateTime.now()).updatedBy(currentOperatorName()).updatedAt(LocalDateTime.now())
                .build());
        writeAudit("DOCUMENT_CATEGORY", saved.getId(), "CREATE", "新增", Map.of(), documentCategorySnapshot(saved, 0L));
        return ApiResponse.success(toDocumentCategoryResponse(saved, 0L));
    }

    @PutMapping("/categories/{categoryId}")
    @Transactional
    public ApiResponse<DocumentCategoryResponse> updateCategory(@PathVariable Long categoryId, @RequestBody DocumentCategoryRequest request) {
        DocumentCategory category = requireDocumentCategory(categoryId);
        ensureCustomDocumentCategory(category);
        String name = requireCategoryName(request);
        documentCategoryRepository.findByTenantIdAndNameIgnoreCase(TENANT_ID, name)
                .filter(existing -> !Objects.equals(existing.getId(), category.getId()))
                .ifPresent(existing -> { throw new BusinessException(ErrorCode.GENERAL_001, "文档分类已存在"); });
        Map<String, Object> before = documentCategorySnapshot(category, countDocumentsByCategory(category.getId()));
        category.setName(name);
        category.setUpdatedBy(currentOperatorName());
        category.setUpdatedAt(LocalDateTime.now());
        DocumentCategory saved = documentCategoryRepository.save(category);
        writeChangedAudit("DOCUMENT_CATEGORY", saved.getId(), "编辑", before, documentCategorySnapshot(saved, countDocumentsByCategory(saved.getId())));
        return ApiResponse.success(toDocumentCategoryResponse(saved, countDocumentsByCategory(saved.getId())));
    }

    @DeleteMapping("/categories/{categoryId}")
    @Transactional
    public ApiResponse<Void> deleteCategory(@PathVariable Long categoryId) {
        DocumentCategory category = requireDocumentCategory(categoryId);
        ensureCustomDocumentCategory(category);
        Map<String, Object> before = documentCategorySnapshot(category, countDocumentsByCategory(category.getId()));
        List<SopDocument> documents = documentRepository.findAll().stream()
                .filter(document -> Objects.equals(document.getCategoryId(), category.getId()))
                .peek(document -> {
                    Map<String, Object> documentBefore = documentSnapshot(document);
                    document.setCategoryId(null);
                    document.setDocumentType("OTHER");
                    document.setUpdatedBy(currentOperatorName());
                    document.setUpdatedAt(LocalDateTime.now());
                    writeChangedAudit("PROCESS_DOCUMENT", document.getId(), "编辑", documentBefore, documentSnapshot(document));
                })
                .toList();
        documentRepository.saveAll(documents);
        documentCategoryRepository.delete(category);
        writeAudit("DOCUMENT_CATEGORY", category.getId(), "DELETE", "删除", before, Map.of());
        return ApiResponse.success(null);
    }

    @PutMapping("/categories/order")
    @Transactional
    public ApiResponse<List<DocumentCategoryResponse>> reorderCategories(@RequestBody DocumentCategoryOrderRequest request) {
        List<String> orderedIds = request == null || request.ids() == null ? List.of() : request.ids();
        if (orderedIds.isEmpty()) return ApiResponse.success(toDocumentCategoryResponses());
        Map<String, DocumentCategory> customCategories = documentCategoryRepository.findByTenantIdOrderBySortOrderAscNameAsc(TENANT_ID).stream()
                .filter(category -> !category.isSystemCategory())
                .collect(Collectors.toMap(category -> String.valueOf(category.getId()), Function.identity(), (left, right) -> left, LinkedHashMap::new));
        int sortOrder = 30;
        for (String id : orderedIds) {
            DocumentCategory category = customCategories.get(String.valueOf(id));
            if (category == null) continue;
            category.setSortOrder(sortOrder);
            category.setUpdatedBy(currentOperatorName());
            category.setUpdatedAt(LocalDateTime.now());
            sortOrder += 10;
        }
        documentCategoryRepository.saveAll(new ArrayList<>(customCategories.values()));
        return ApiResponse.success(toDocumentCategoryResponses());
    }

    @GetMapping("/{documentId}")
    public ApiResponse<DocumentResponse> get(@PathVariable Long documentId) {
        SopDocument document = requireDocument(documentId);
        return ApiResponse.success(toResponse(document, documentVersionRepository.findByDocumentIdOrderByCreatedAtDesc(documentId), documentCategoriesById()));
    }

    @PostMapping
    @Transactional
    public ApiResponse<DocumentResponse> create(@RequestBody DocumentWriteRequest request) {
        DocumentCategory category = resolveDocumentCategory(request.categoryId());
        String code = requireText(request.code(), "文档编码不能为空");
        if (documentRepository.existsByTenantIdAndCodeIgnoreCase(TENANT_ID, code)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "文档编码已存在，请更换后重试");
        }
        LocalDateTime now = LocalDateTime.now();
        SopDocument document = documentRepository.save(SopDocument.builder()
                .id(idGenerator.nextId()).tenantId(TENANT_ID).code(code).title(requireText(request.title(), "文档名称不能为空"))
                .categoryId(category == null ? null : category.getId()).documentType(legacyDocumentType(category)).description(trimToNull(request.description())).remark(trimToNull(request.remark()))
                .createdBy(currentOperatorName()).createdAt(now).updatedBy(currentOperatorName()).updatedAt(now).build());
        DocumentVersion version = createVersionEntity(document.getId(), request.version(), request.fileId(), request.fileReference(),
                request.versionDescription(), request.versionRemark(), request.effectiveDate(), request.expiryDate(), now);
        DocumentVersion savedVersion = documentVersionRepository.save(version);
        writeAudit("PROCESS_DOCUMENT", document.getId(), "CREATE", "新增", Map.of(), documentSnapshot(document));
        writeAudit("DOCUMENT_VERSION", savedVersion.getId(), "CREATE", "新增", Map.of(), versionSnapshot(document, savedVersion));
        return ApiResponse.success(toResponse(document, List.of(savedVersion), category == null ? Map.of() : Map.of(category.getId(), category)));
    }

    @PutMapping("/{documentId}")
    @Transactional
    public ApiResponse<DocumentResponse> update(@PathVariable Long documentId, @RequestBody DocumentMasterWriteRequest request) {
        SopDocument document = requireDocument(documentId);
        Map<String, Object> before = documentSnapshot(document);
        String code = requireText(request.code(), "文档编码不能为空");
        if (!code.equalsIgnoreCase(document.getCode()) && documentRepository.existsByTenantIdAndCodeIgnoreCase(TENANT_ID, code)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "文档编码已存在，请更换后重试");
        }
        document.setCode(code);
        document.setTitle(requireText(request.title(), "文档名称不能为空"));
        document.setDescription(trimToNull(request.description()));
        document.setRemark(trimToNull(request.remark()));
        document.setUpdatedBy(currentOperatorName());
        document.setUpdatedAt(LocalDateTime.now());
        SopDocument saved = documentRepository.save(document);
        writeChangedAudit("PROCESS_DOCUMENT", saved.getId(), "编辑", before, documentSnapshot(saved));
        return ApiResponse.success(toResponse(saved, documentVersionRepository.findByDocumentIdOrderByCreatedAtDesc(saved.getId()), documentCategoriesById()));
    }

    @PostMapping("/{documentId}/versions")
    @Transactional
    public ApiResponse<DocumentVersionResponse> createVersion(@PathVariable Long documentId, @RequestBody DocumentVersionWriteRequest request) {
        SopDocument document = requireDocument(documentId);
        DocumentVersion version = createVersionEntity(documentId, request.version(), request.fileId(), request.fileReference(),
                request.description(), request.remark(), request.effectiveDate(), request.expiryDate(), LocalDateTime.now());
        DocumentVersion saved = documentVersionRepository.save(version);
        writeAudit("DOCUMENT_VERSION", saved.getId(), "CREATE", "新增", Map.of(), versionSnapshot(document, saved));
        return ApiResponse.success(toVersionResponse(saved));
    }

    @PutMapping("/{documentId}/versions/{versionId}")
    @Transactional
    public ApiResponse<DocumentVersionResponse> updateVersion(
            @PathVariable Long documentId, @PathVariable Long versionId, @RequestBody DocumentVersionWriteRequest request) {
        SopDocument document = requireDocument(documentId);
        DocumentVersion version = requireVersion(documentId, versionId);
        Map<String, Object> before = versionSnapshot(document, version);
        String label = requireText(request.version(), "版本号不能为空");
        if (!label.equalsIgnoreCase(version.getVersion()) && documentVersionRepository.existsByDocumentIdAndVersionIgnoreCase(documentId, label)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "版本号已存在，请更换后重试");
        }
        validateWindow(request.effectiveDate(), request.expiryDate());
        validateFile(request.fileId());
        version.setVersion(label);
        version.setFileId(request.fileId());
        version.setFileReference(trimToNull(request.fileReference()));
        version.setDescription(trimToNull(request.description()));
        version.setRemark(trimToNull(request.remark()));
        version.setEffectiveDate(request.effectiveDate());
        version.setExpiryDate(request.expiryDate());
        version.setVersionStatus(resolveRuntimeStatus(version));
        version.setUpdatedBy(currentOperatorName());
        version.setUpdatedAt(LocalDateTime.now());
        DocumentVersion saved = documentVersionRepository.save(version);
        writeChangedAudit("DOCUMENT_VERSION", saved.getId(), "编辑", before, versionSnapshot(document, saved));
        return ApiResponse.success(toVersionResponse(saved));
    }

    @DeleteMapping("/{documentId}/versions/{versionId}")
    @Transactional
    public ApiResponse<Void> deleteVersion(@PathVariable Long documentId, @PathVariable Long versionId) {
        SopDocument document = requireDocument(documentId);
        DocumentVersion version = requireVersion(documentId, versionId);
        if (operationDocumentBindingRepository.countByDocumentVersionId(versionId) > 0) {
            throw new BusinessException(ErrorCode.GENERAL_001, "该文档版本已被产品工序引用，不能删除");
        }
        documentVersionRepository.delete(version);
        writeAudit("DOCUMENT_VERSION", versionId, "DELETE", "删除", versionSnapshot(document, version), Map.of());
        return ApiResponse.success(null);
    }

    @DeleteMapping("/{documentId}")
    @Transactional
    public ApiResponse<Void> delete(@PathVariable Long documentId) {
        SopDocument document = requireDocument(documentId);
        List<DocumentVersion> versions = documentVersionRepository.findByDocumentIdOrderByCreatedAtDesc(documentId);
        if (versions.stream().anyMatch(version -> operationDocumentBindingRepository.countByDocumentVersionId(version.getId()) > 0)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "该文档已有版本被产品工序引用，不能删除");
        }
        documentVersionRepository.deleteAll(versions);
        documentRepository.delete(document);
        writeAudit("PROCESS_DOCUMENT", documentId, "DELETE", "删除", documentSnapshot(document), Map.of());
        return ApiResponse.success(null);
    }

    private DocumentVersion createVersionEntity(Long documentId, String version, Long fileId, String fileReference, String description,
                                                String remark, LocalDateTime effectiveDate, LocalDateTime expiryDate, LocalDateTime now) {
        String label = requireText(version, "版本号不能为空");
        if (documentVersionRepository.existsByDocumentIdAndVersionIgnoreCase(documentId, label)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "版本号已存在，请更换后重试");
        }
        validateWindow(effectiveDate, expiryDate);
        validateFile(fileId);
        DocumentVersion entity = DocumentVersion.builder().id(idGenerator.nextId()).tenantId(TENANT_ID).documentId(documentId)
                .version(label).fileId(fileId).fileReference(trimToNull(fileReference)).description(trimToNull(description))
                .remark(trimToNull(remark)).effectiveDate(effectiveDate).expiryDate(expiryDate).createdBy(currentOperatorName())
                .createdAt(now).updatedBy(currentOperatorName()).updatedAt(now).build();
        entity.setVersionStatus(resolveRuntimeStatus(entity));
        return entity;
    }

    private SopDocument requireDocument(Long id) {
        return documentRepository.findById(id).orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "文档不存在"));
    }

    private DocumentVersion requireVersion(Long documentId, Long versionId) {
        return documentVersionRepository.findByDocumentIdAndId(documentId, versionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "文档版本不存在"));
    }

    private DocumentResponse toResponse(SopDocument document, List<DocumentVersion> versions, Map<Long, DocumentCategory> categoriesById) {
        DocumentCategory category = document.getCategoryId() == null ? null : categoriesById.get(document.getCategoryId());
        return new DocumentResponse(id(document.getId()), document.getCode(), document.getTitle(), idOrNull(document.getCategoryId()), category == null ? null : category.getName(),
                document.getDescription(), document.getRemark(), document.getCreatedBy(), document.getCreatedAt(), document.getUpdatedBy(), document.getUpdatedAt(),
                versions.stream().map(this::toVersionResponse).toList());
    }

    private DocumentVersionResponse toVersionResponse(DocumentVersion version) {
        FileObject file = version.getFileId() == null ? null : fileObjectRepository.findById(version.getFileId()).orElse(null);
        return new DocumentVersionResponse(id(version.getId()), id(version.getDocumentId()), version.getVersion(), version.getFileId() == null ? null : id(version.getFileId()),
                file == null ? null : file.getOriginalName(), file == null ? null : file.getMimeType(),
                version.getFileReference(), version.getDescription(), version.getRemark(), version.getEffectiveDate(), version.getExpiryDate(),
                resolveRuntimeStatus(version), version.getCreatedBy(), version.getCreatedAt(), version.getUpdatedBy(), version.getUpdatedAt());
    }

    private Map<String, Object> documentSnapshot(SopDocument document) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("编码", document.getCode());
        snapshot.put("名称", document.getTitle());
        snapshot.put("分类", documentCategoryName(document));
        snapshot.put("描述", document.getDescription());
        snapshot.put("备注", document.getRemark());
        return snapshot;
    }

    private Map<String, Object> versionSnapshot(SopDocument document, DocumentVersion version) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("文档", document.getCode() + " / " + document.getTitle());
        snapshot.put("分类", documentCategoryName(document));
        snapshot.put("版本", version.getVersion());
        snapshot.put("文件", fileSnapshot(version.getFileId()));
        snapshot.put("文件引用", version.getFileReference());
        snapshot.put("版本说明", version.getDescription());
        snapshot.put("备注", version.getRemark());
        snapshot.put("生效时间", version.getEffectiveDate());
        snapshot.put("失效时间", version.getExpiryDate());
        snapshot.put("状态", resolveRuntimeStatus(version));
        return snapshot;
    }

    private Map<String, Object> fileSnapshot(Long fileId) {
        if (fileId == null) return Map.of();
        FileObject file = fileObjectRepository.findById(fileId).orElse(null);
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("文件ID", id(fileId));
        snapshot.put("原始文件名", file == null ? null : file.getOriginalName());
        snapshot.put("文件类型", file == null ? null : file.getMimeType());
        snapshot.put("文件大小", file == null ? null : file.getFileSize());
        snapshot.put("来源", file == null ? null : file.getTargetType());
        snapshot.put("预览地址", "/api/v1/files/" + fileId + "/preview");
        return snapshot;
    }

    private void writeChangedAudit(String entityType, Long entityId, String actionLabel, Map<String, Object> before, Map<String, Object> after) {
        Map<String, Object> changedBefore = new LinkedHashMap<>();
        Map<String, Object> changedAfter = new LinkedHashMap<>();
        before.forEach((key, value) -> { if (!Objects.equals(value, after.get(key))) { changedBefore.put(key, value); changedAfter.put(key, after.get(key)); } });
        if (!changedBefore.isEmpty()) writeAudit(entityType, entityId, "UPDATE", actionLabel, changedBefore, changedAfter);
    }

    private void writeAudit(String entityType, Long entityId, String action, String actionLabel, Map<String, Object> before, Map<String, Object> after) {
        auditEventRepository.save(AuditEvent.builder().id(idGenerator.nextId()).tenantId(TENANT_ID).entityType(entityType).entityId(id(entityId)).action(action)
                .contentBefore(toAuditJson(before)).contentAfter(toAuditJson(after)).operatorId(AuditContext.getOperatorId()).operatorName(AuditContext.getOperatorName())
                .operatorAccount(AuditContext.getOperatorAccount()).source(AuditContext.getSource()).moduleName("数据").menuName("工艺建模 · 文档管理")
                .functionName(actionLabel).dataSummary("文档管理 #" + entityId).ipAddress(AuditContext.getIpAddress()).createdAt(LocalDateTime.now()).build());
    }

    private String toAuditJson(Map<String, Object> content) {
        try { return AUDIT_OBJECT_MAPPER.writeValueAsString(content); }
        catch (JsonProcessingException exception) { throw new BusinessException(ErrorCode.GENERAL_001, "审计内容序列化失败"); }
    }

    private void validateWindow(LocalDateTime effectiveDate, LocalDateTime expiryDate) {
        if (effectiveDate != null && expiryDate != null && expiryDate.isBefore(effectiveDate)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "失效时间不能早于生效时间");
        }
    }

    private void validateFile(Long fileId) {
        if (fileId != null && !fileObjectRepository.existsById(fileId)) {
            throw new BusinessException(ErrorCode.FILE_001, "上传文件不存在");
        }
    }

    private String resolveRuntimeStatus(DocumentVersion version) {
        return RdoVersionStatusResolver.resolve(version.getEffectiveDate(), version.getExpiryDate());
    }

    private List<DocumentCategoryResponse> toDocumentCategoryResponses() {
        List<SopDocument> documents = documentRepository.findAll();
        Map<Long, Long> categoryCounts = documents.stream()
                .map(SopDocument::getCategoryId)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(Function.identity(), LinkedHashMap::new, Collectors.counting()));
        long uncategorizedCount = documents.stream().filter(document -> document.getCategoryId() == null).count();
        List<DocumentCategoryResponse> responses = new ArrayList<>();
        responses.add(new DocumentCategoryResponse(DOCUMENT_CATEGORY_ALL, "全部", (long) documents.size(), 0, true));
        responses.add(new DocumentCategoryResponse(DOCUMENT_CATEGORY_UNCATEGORIZED, "未分类", uncategorizedCount, 1, true));
        documentCategoryRepository.findByTenantIdOrderBySortOrderAscNameAsc(TENANT_ID).stream()
                .sorted(Comparator.comparing(DocumentCategory::getSortOrder, Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(DocumentCategory::getName, Comparator.nullsLast(String::compareToIgnoreCase)))
                .map(category -> toDocumentCategoryResponse(category, categoryCounts.getOrDefault(category.getId(), 0L)))
                .forEach(responses::add);
        return responses;
    }

    private DocumentCategoryResponse toDocumentCategoryResponse(DocumentCategory category, Long count) {
        return new DocumentCategoryResponse(id(category.getId()), category.getName(), count == null ? 0L : count,
                category.getSortOrder() == null ? 0 : category.getSortOrder(), category.isSystemCategory());
    }

    private DocumentCategory resolveDocumentCategory(String categoryId) {
        if (!hasText(categoryId)) return null;
        try {
            return documentCategoryRepository.findById(Long.parseLong(categoryId.trim()))
                    .filter(category -> TENANT_ID.equals(category.getTenantId()))
                    .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "文档分类不存在"));
        } catch (NumberFormatException exception) {
            throw new BusinessException(ErrorCode.GENERAL_001, "文档分类不存在");
        }
    }

    private DocumentCategory requireDocumentCategory(Long categoryId) {
        return documentCategoryRepository.findById(categoryId)
                .filter(category -> TENANT_ID.equals(category.getTenantId()))
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "文档分类不存在"));
    }

    private void ensureCustomDocumentCategory(DocumentCategory category) {
        if (category.isSystemCategory()) throw new BusinessException(ErrorCode.GENERAL_001, "系统内置文档分类不允许编辑或删除");
    }

    private String requireCategoryName(DocumentCategoryRequest request) {
        String name = requireText(request == null ? null : request.name(), "文档分类名称不能为空");
        if (name.length() > 128) throw new BusinessException(ErrorCode.GENERAL_001, "文档分类名称不能超过 128 个字符");
        if (RESERVED_CATEGORY_NAMES.stream().anyMatch(reserved -> reserved.equalsIgnoreCase(name))) {
            throw new BusinessException(ErrorCode.GENERAL_001, "该文档分类名称为系统保留名称");
        }
        return name;
    }

    private boolean matchesCategory(SopDocument document, String categoryId) {
        if (categoryId == null || DOCUMENT_CATEGORY_ALL.equals(categoryId)) return true;
        if (DOCUMENT_CATEGORY_UNCATEGORIZED.equals(categoryId)) return document.getCategoryId() == null;
        return Objects.equals(id(document.getCategoryId()), categoryId);
    }

    private String normalizeCategoryFilter(String value) {
        if (!hasText(value) || DOCUMENT_CATEGORY_ALL.equalsIgnoreCase(value)) return DOCUMENT_CATEGORY_ALL;
        if (DOCUMENT_CATEGORY_UNCATEGORIZED.equalsIgnoreCase(value)) return DOCUMENT_CATEGORY_UNCATEGORIZED;
        try {
            Long categoryId = Long.parseLong(value.trim());
            requireDocumentCategory(categoryId);
            return String.valueOf(categoryId);
        } catch (NumberFormatException exception) {
            throw new BusinessException(ErrorCode.GENERAL_001, "文档分类不存在");
        }
    }

    private Map<Long, DocumentCategory> documentCategoriesById() {
        return documentCategoryRepository.findByTenantIdOrderBySortOrderAscNameAsc(TENANT_ID).stream()
                .collect(Collectors.toMap(DocumentCategory::getId, Function.identity(), (left, right) -> left, LinkedHashMap::new));
    }

    private String documentCategoryName(SopDocument document) {
        if (document.getCategoryId() == null) return "未分类";
        return documentCategoryRepository.findById(document.getCategoryId()).map(DocumentCategory::getName).orElse("未分类");
    }

    private long countDocumentsByCategory(Long categoryId) {
        return documentRepository.findAll().stream().filter(document -> Objects.equals(document.getCategoryId(), categoryId)).count();
    }

    private int nextDocumentCategorySortOrder() {
        return documentCategoryRepository.findByTenantIdOrderBySortOrderAscNameAsc(TENANT_ID).stream()
                .map(DocumentCategory::getSortOrder).filter(Objects::nonNull).max(Integer::compareTo).orElse(20) + 10;
    }

    private String legacyDocumentType(DocumentCategory category) {
        if (category == null) return "OTHER";
        if ("SOP".equalsIgnoreCase(category.getName())) return "SOP";
        if ("SIP".equalsIgnoreCase(category.getName())) return "SIP";
        return "OTHER";
    }

    private Map<String, Object> documentCategorySnapshot(DocumentCategory category, Long count) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("名称", category.getName());
        snapshot.put("系统内置", category.isSystemCategory());
        snapshot.put("排序", category.getSortOrder());
        snapshot.put("文档数量", count == null ? 0L : count);
        return snapshot;
    }
    private boolean matchesKeyword(SopDocument document, String keyword) { return !hasText(keyword) || contains(document.getCode(), keyword) || contains(document.getTitle(), keyword); }
    private boolean contains(String value, String keyword) { return value != null && value.toLowerCase().contains(keyword.trim().toLowerCase()); }
    private boolean hasText(String value) { return StringUtils.hasText(value); }
    private String requireText(String value, String message) { if (!hasText(value)) throw new BusinessException(ErrorCode.GENERAL_001, message); return value.trim(); }
    private String trimToNull(String value) { return hasText(value) ? value.trim() : null; }
    private String currentOperatorName() { return hasText(AuditContext.getOperatorName()) ? AuditContext.getOperatorName() : "系统管理员"; }
    private String id(Long value) { return value == null ? "" : String.valueOf(value); }
    private String idOrNull(Long value) { return value == null ? null : String.valueOf(value); }

    public record DocumentWriteRequest(String code, String title, String categoryId, String description, String remark, String version,
                                       Long fileId, String fileReference, String versionDescription, String versionRemark,
                                       LocalDateTime effectiveDate, LocalDateTime expiryDate) {}
    public record DocumentMasterWriteRequest(String code, String title, String description, String remark) {}
    public record DocumentVersionWriteRequest(String version, Long fileId, String fileReference, String description, String remark,
                                              LocalDateTime effectiveDate, LocalDateTime expiryDate) {}
    public record DocumentResponse(String id, String code, String title, String categoryId, String categoryName, String description, String remark,
                                   String createdBy, LocalDateTime createdAt, String updatedBy, LocalDateTime updatedAt, List<DocumentVersionResponse> versions) {}
    public record DocumentVersionResponse(String id, String documentId, String version, String fileId, String fileName, String fileMimeType, String fileReference, String description,
                                          String remark, LocalDateTime effectiveDate, LocalDateTime expiryDate, String status, String createdBy,
                                          LocalDateTime createdAt, String updatedBy, LocalDateTime updatedAt) {}
    public record DocumentCategoryRequest(String name) {}
    public record DocumentCategoryOrderRequest(List<String> ids) {}
    public record DocumentCategoryResponse(String id, String name, Long count, Integer sortOrder, boolean system) {}
}
