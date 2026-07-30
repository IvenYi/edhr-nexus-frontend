package com.zencas.edhr.template.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.template.dto.TemplateModelingRequest;
import com.zencas.edhr.template.dto.TemplateImportGridResponse;
import com.zencas.edhr.template.entity.DhrTemplate;
import com.zencas.edhr.template.entity.DhrTemplateVersion;
import com.zencas.edhr.template.entity.DhrDirectory;
import com.zencas.edhr.template.entity.DhrTemplateItem;
import com.zencas.edhr.template.entity.FormTemplate;
import com.zencas.edhr.template.entity.FormTemplateVersion;
import com.zencas.edhr.template.entity.TemplateCategory;
import com.zencas.edhr.template.repository.DhrTemplateRepository;
import com.zencas.edhr.template.repository.DhrTemplateVersionRepository;
import com.zencas.edhr.template.repository.DhrDirectoryRepository;
import com.zencas.edhr.template.repository.DhrTemplateItemRepository;
import com.zencas.edhr.template.repository.FormTemplateRepository;
import com.zencas.edhr.template.repository.FormTemplateVersionRepository;
import com.zencas.edhr.template.repository.TemplateCategoryRepository;
import com.zencas.edhr.template.service.TemplateLegacyWordImportService;
import com.zencas.edhr.template.support.DhrTemplateVersionStatusResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter DATE_TIME_MINUTE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final ObjectMapper AUDIT_OBJECT_MAPPER = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    private final FormTemplateRepository formTemplateRepository;
    private final FormTemplateVersionRepository formTemplateVersionRepository;
    private final DhrTemplateRepository dhrTemplateRepository;
    private final DhrTemplateVersionRepository dhrTemplateVersionRepository;
    private final DhrDirectoryRepository dhrDirectoryRepository;
    private final DhrTemplateItemRepository dhrTemplateItemRepository;
    private final TemplateCategoryRepository templateCategoryRepository;
    private final AuditEventRepository auditEventRepository;
    private final SnowflakeIdGenerator idGenerator;
    private final TemplateLegacyWordImportService templateLegacyWordImportService;

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

    @PostMapping(value = "/form-templates/import/legacy-word", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<TemplateImportGridResponse> importLegacyWordTemplate(
            @RequestParam("file") MultipartFile file) throws IOException {
        return ApiResponse.success(templateLegacyWordImportService.importDoc(file));
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
        ensureFormTemplateVersionAvailable(template.getId(), requireVersion(request));
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

    @PutMapping("/form-templates/{id}/versions/{versionId}/design")
    @Transactional
    public ApiResponse<TemplateVersionResponse> saveFormTemplateVersionDesign(
            @PathVariable Long id,
            @PathVariable Long versionId,
            @RequestBody TemplateModelingRequest request) {
        formTemplateRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "表单模板不存在"));
        FormTemplateVersion version = findVersion(id, versionId);
        Map<String, Object> before = versionSnapshot(version);
        if (request != null) {
            if (request.getModelDesignJson() != null) {
                version.setModelDesignJson(trimToNull(request.getModelDesignJson()));
            }
            if (request.getCanvasDesignJson() != null) {
                version.setCanvasDesignJson(trimToNull(request.getCanvasDesignJson()));
            }
            if (request.getWorkflowDesignJson() != null) {
                version.setWorkflowDesignJson(trimToNull(request.getWorkflowDesignJson()));
            }
        }
        version.setUpdatedBy(currentOperatorName());
        version.setUpdatedAt(LocalDateTime.now());
        FormTemplateVersion saved = formTemplateVersionRepository.save(version);
        writeChangedAudit("FORM_TEMPLATE_VERSION", saved.getId(), "表单模板", "保存设计", before, versionSnapshot(saved));
        return ApiResponse.success(toVersionResponse(saved));
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

    @GetMapping("/batch-record-templates")
    public ApiResponse<PageResult<DhrTemplateResponse>> listBatchRecordTemplates(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String categoryName,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        Page<DhrTemplate> result = dhrTemplateRepository.findAll(
                dhrTemplateSpec(keyword, name, code, categoryName, status),
                pageable(page, size, sort, order));
        List<DhrTemplateResponse> content = result.getContent().stream()
                .map(template -> toDhrTemplateResponse(template, loadDhrTemplateVersions(template.getId())))
                .toList();
        return ApiResponse.success(PageResult.of(content, page, size, result.getTotalElements()));
    }

    public ApiResponse<PageResult<DhrTemplateResponse>> listBatchRecordTemplates(
            String keyword,
            String categoryName,
            String status,
            int page,
            int size,
            String sort,
            String order) {
        return listBatchRecordTemplates(keyword, null, null, categoryName, status, page, size, sort, order);
    }

    @PostMapping("/batch-record-templates")
    @Transactional
    public ApiResponse<DhrTemplateResponse> createBatchRecordTemplate(@RequestBody TemplateModelingRequest request) {
        validateEffectiveDateRange(request);
        LocalDateTime now = LocalDateTime.now();
        String versionLabel = resolveDhrVersionLabel(request == null ? null : request.getVersion(), 1);
        String versionCode = normalizeDhrVersionCode(request == null ? null : request.getCode());
        ensureDhrVersionCodeAvailable(versionCode, null);
        DhrTemplate entity = DhrTemplate.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .name(requireName(request))
                .categoryName(resolveTemplateCategory(DHR_TYPE, request))
                .description(trimToNull(request.getDescription()))
                .status("DRAFT")
                .createdBy(currentOperatorName())
                .createdAt(now)
                .updatedBy(currentOperatorName())
                .updatedAt(now)
                .build();
        DhrTemplate saved = dhrTemplateRepository.save(entity);
        DhrTemplateVersion version = dhrTemplateVersionRepository.save(DhrTemplateVersion.builder()
                .id(idGenerator.nextId())
                .dhrTemplateId(saved.getId())
                .versionNumber(1)
                .versionLabel(versionLabel)
                .code(versionCode)
                .offlineVersion(trimToNull(request == null ? null : request.getOfflineVersion()))
                .description(trimToNull(request.getVersionDescription()))
                .effectiveFrom(parseDateTime(request.getEffectiveFrom()))
                .effectiveTo(parseDateTime(request.getEffectiveTo()))
                .status("DRAFT")
                .isCurrent(false)
                .createdAt(now)
                .build());
        writeAudit("DHR_TEMPLATE", saved.getId(), "CREATE", "批记录模板", "新增批记录模板", Map.of(), dhrTemplateSnapshot(saved));
        writeAudit("DHR_TEMPLATE_VERSION", version.getId(), "CREATE", "批记录模板", "新建初始批记录模板版本", Map.of(), dhrTemplateVersionSnapshot(version));
        return ApiResponse.success(toDhrTemplateResponse(saved, List.of(version)));
    }

    @PutMapping("/batch-record-templates/{id}")
    @Transactional
    public ApiResponse<DhrTemplate> updateBatchRecordTemplate(@PathVariable Long id, @RequestBody TemplateModelingRequest request) {
        DhrTemplate existing = dhrTemplateRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "批记录模板不存在"));
        Map<String, Object> before = dhrTemplateSnapshot(existing);
        existing.setName(requireName(request));
        existing.setCategoryName(resolveTemplateCategory(DHR_TYPE, request));
        existing.setDescription(trimToNull(request.getDescription()));
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
        List<DhrTemplateVersion> versions = dhrTemplateVersionRepository.findByDhrTemplateIdOrderByVersionNumberDesc(id);
        if (versions.stream().anyMatch(version -> "ACTIVE".equals(version.getStatus()) || Boolean.TRUE.equals(version.getIsCurrent()))) {
            throw new BusinessException(ErrorCode.GENERAL_001, "已启用版本不可删除，请通过新建版本受控更新");
        }
        List<DhrDirectory> directories = versions.stream()
                .flatMap(version -> dhrDirectoryRepository.findByVersionIdOrderBySortOrderAscIdAsc(version.getId()).stream())
                .toList();
        List<DhrTemplateItem> items = directories.isEmpty()
                ? List.of()
                : dhrTemplateItemRepository.findByDirectoryIdInOrderBySortOrderAscIdAsc(directories.stream().map(DhrDirectory::getId).toList());
        if (!items.isEmpty()) dhrTemplateItemRepository.deleteAll(items);
        if (!directories.isEmpty()) dhrDirectoryRepository.deleteAll(directories);
        if (!versions.isEmpty()) dhrTemplateVersionRepository.deleteAll(versions);
        dhrTemplateRepository.delete(existing);
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
            if (StringUtils.hasText(status) && !"ALL".equals(status)) {
                jakarta.persistence.criteria.Subquery<Long> versionSubquery = query.subquery(Long.class);
                jakarta.persistence.criteria.Root<DhrTemplateVersion> versionRoot = versionSubquery.from(DhrTemplateVersion.class);
                versionSubquery.select(versionRoot.get("dhrTemplateId"));
                versionSubquery.where(
                        cb.equal(versionRoot.get("dhrTemplateId"), root.get("id")),
                        cb.equal(versionRoot.get("status"), status.trim()));
                predicates.add(root.get("id").in(versionSubquery));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private Specification<DhrTemplate> dhrTemplateSpec(String keyword, String name, String code, String categoryName, String status) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("tenantId"), TENANT_ID));
            if (StringUtils.hasText(keyword)) {
                String like = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), like),
                        dhrVersionCodeMatches(root, query, cb, like)));
            }
            if (StringUtils.hasText(name)) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + name.trim().toLowerCase() + "%"));
            }
            if (StringUtils.hasText(code)) {
                predicates.add(dhrVersionCodeMatches(root, query, cb, "%" + code.trim().toLowerCase() + "%"));
            }
            addCategoryPredicate(categoryName, root.get("categoryName"), predicates, cb);
            addDhrVersionStatusPredicate(status, root, query, predicates, cb);
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private jakarta.persistence.criteria.Predicate dhrVersionCodeMatches(
            jakarta.persistence.criteria.Root<DhrTemplate> root,
            jakarta.persistence.criteria.CriteriaQuery<?> query,
            jakarta.persistence.criteria.CriteriaBuilder cb,
            String like) {
        jakarta.persistence.criteria.Subquery<Long> versionSubquery = query.subquery(Long.class);
        jakarta.persistence.criteria.Root<DhrTemplateVersion> versionRoot = versionSubquery.from(DhrTemplateVersion.class);
        versionSubquery.select(versionRoot.get("dhrTemplateId"));
        versionSubquery.where(cb.like(cb.lower(versionRoot.get("code")), like));
        return root.get("id").in(versionSubquery);
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

    private void addDhrVersionStatusPredicate(
            String status,
            jakarta.persistence.criteria.Root<DhrTemplate> root,
            jakarta.persistence.criteria.CriteriaQuery<?> query,
            List<jakarta.persistence.criteria.Predicate> predicates,
            jakarta.persistence.criteria.CriteriaBuilder cb) {
        if (!StringUtils.hasText(status) || "ALL".equals(status)) return;
        String requestedStatus = status.trim();
        LocalDateTime now = LocalDateTime.now();
        jakarta.persistence.criteria.Subquery<Long> versionSubquery = query.subquery(Long.class);
        jakarta.persistence.criteria.Root<DhrTemplateVersion> versionRoot = versionSubquery.from(DhrTemplateVersion.class);
        List<jakarta.persistence.criteria.Predicate> versionPredicates = new ArrayList<>();
        versionPredicates.add(cb.equal(versionRoot.get("dhrTemplateId"), root.get("id")));

        if (DhrTemplateVersionStatusResolver.PENDING.equals(requestedStatus)) {
            versionPredicates.add(cb.equal(versionRoot.get("status"), DhrTemplateVersionStatusResolver.ACTIVE));
            versionPredicates.add(cb.greaterThan(versionRoot.get("effectiveFrom"), now));
        } else if (DhrTemplateVersionStatusResolver.EXPIRED.equals(requestedStatus)) {
            versionPredicates.add(cb.equal(versionRoot.get("status"), DhrTemplateVersionStatusResolver.ACTIVE));
            versionPredicates.add(cb.lessThanOrEqualTo(versionRoot.get("effectiveTo"), now));
        } else if (DhrTemplateVersionStatusResolver.ACTIVE.equals(requestedStatus)) {
            versionPredicates.add(cb.equal(versionRoot.get("status"), DhrTemplateVersionStatusResolver.ACTIVE));
            versionPredicates.add(cb.or(cb.isNull(versionRoot.get("effectiveFrom")), cb.lessThanOrEqualTo(versionRoot.get("effectiveFrom"), now)));
            versionPredicates.add(cb.or(cb.isNull(versionRoot.get("effectiveTo")), cb.greaterThan(versionRoot.get("effectiveTo"), now)));
        } else {
            versionPredicates.add(cb.equal(versionRoot.get("status"), requestedStatus));
        }
        versionSubquery.select(versionRoot.get("dhrTemplateId"));
        versionSubquery.where(cb.and(versionPredicates.toArray(new jakarta.persistence.criteria.Predicate[0])));
        predicates.add(root.get("id").in(versionSubquery));
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

    private void ensureDhrVersionCodeAvailable(String code, Long currentVersionId) {
        if (!StringUtils.hasText(code)) return;
        boolean exists = dhrTemplateVersionRepository.findByCodeIgnoreCase(code).stream()
                .anyMatch(version -> !Objects.equals(version.getId(), currentVersionId));
        if (exists) throw new BusinessException(ErrorCode.GENERAL_001, "模板编码已存在");
    }

    private String normalizeDhrVersionCode(String value) {
        String code = trimToNull(value);
        if (code != null && code.length() > 64) {
            throw new BusinessException(ErrorCode.GENERAL_001, "模板编码不能超过 64 个字符");
        }
        return code;
    }

    private String resolveDhrVersionLabel(String value, int fallbackVersionNumber) {
        String versionLabel = trimToNull(value);
        if (versionLabel == null) return "V" + fallbackVersionNumber + ".0";
        if (versionLabel.length() > 64) {
            throw new BusinessException(ErrorCode.GENERAL_001, "版本号不能超过 64 个字符");
        }
        return versionLabel;
    }

    private void ensureFormTemplateVersionAvailable(Long templateId, String version) {
        boolean exists = formTemplateVersionRepository.findByTemplateIdOrderByCreatedAtDesc(templateId).stream()
                .map(FormTemplateVersion::getVersion)
                .filter(StringUtils::hasText)
                .anyMatch(existingVersion -> existingVersion.trim().equalsIgnoreCase(version));
        if (exists) throw new BusinessException(ErrorCode.GENERAL_001, "模板版本已存在");
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

    private List<DhrTemplateVersion> loadDhrTemplateVersions(Long templateId) {
        if (templateId == null) return List.of();
        return dhrTemplateVersionRepository.findByDhrTemplateIdOrderByVersionNumberDesc(templateId);
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
        return "{\"layers\":[]}";
    }

    private String defaultWorkflowDesignJson() {
        return "{\"nodes\":[],\"edges\":[]}";
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

    private Map<String, Object> dhrTemplateVersionSnapshot(DhrTemplateVersion version) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("version", dhrVersionLabel(version));
        snapshot.put("code", version.getCode());
        snapshot.put("offlineVersion", version.getOfflineVersion());
        snapshot.put("description", version.getDescription());
        snapshot.put("effectiveFrom", formatDateTime(version.getEffectiveFrom()));
        snapshot.put("effectiveTo", formatDateTime(version.getEffectiveTo()));
        snapshot.put("status", version.getStatus());
        snapshot.put("isCurrent", version.getIsCurrent());
        snapshot.put("directoryCount", 0);
        snapshot.put("evidenceCount", 0);
        snapshot.put("createdAt", formatDateTime(version.getCreatedAt()));
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

    private DhrTemplateResponse toDhrTemplateResponse(DhrTemplate entity, List<DhrTemplateVersion> versions) {
        List<DhrTemplateVersionResponse> versionResponses = (versions == null ? List.<DhrTemplateVersion>of() : versions).stream()
                .map(this::toDhrTemplateVersionResponse)
                .toList();
        DhrTemplateVersionResponse currentVersion = versionResponses.stream()
                .filter(DhrTemplateVersionResponse::isCurrent)
                .findFirst()
                .orElse(versionResponses.stream().findFirst().orElse(null));
        return new DhrTemplateResponse(
                String.valueOf(entity.getId()),
                entity.getTenantId(),
                null,
                entity.getName(),
                DHR_TYPE,
                entity.getCategoryName(),
                entity.getDescription(),
                currentVersion == null ? null : currentVersion.id(),
                currentVersion,
                versionResponses,
                DhrTemplateVersionStatusResolver.resolveTemplateStatus(
                        versionResponses.stream().map(DhrTemplateVersionResponse::status).toList()),
                entity.getCreatedBy(),
                formatDateTime(entity.getCreatedAt()),
                entity.getUpdatedBy(),
                formatDateTime(entity.getUpdatedAt())
        );
    }

    private DhrTemplateVersionResponse toDhrTemplateVersionResponse(DhrTemplateVersion version) {
        List<DhrDirectory> directories = dhrDirectoryRepository.findByVersionIdOrderBySortOrderAscIdAsc(version.getId());
        int evidenceCount = directories.isEmpty()
                ? 0
                : dhrTemplateItemRepository.findByDirectoryIdInOrderBySortOrderAscIdAsc(
                        directories.stream().map(DhrDirectory::getId).toList()).size();
        return new DhrTemplateVersionResponse(
                String.valueOf(version.getId()),
                version.getDhrTemplateId() == null ? null : String.valueOf(version.getDhrTemplateId()),
                dhrVersionLabel(version),
                version.getCode(),
                version.getOfflineVersion(),
                version.getDescription(),
                formatDateTime(version.getEffectiveFrom()),
                formatDateTime(version.getEffectiveTo()),
                DhrTemplateVersionStatusResolver.resolveVersionStatus(version),
                Boolean.TRUE.equals(version.getIsCurrent()),
                formatDateTime(version.getCreatedAt()),
                directories.size(),
                evidenceCount
        );
    }

    private String dhrVersionLabel(DhrTemplateVersion version) {
        String label = trimToNull(version.getVersionLabel());
        return label == null ? "V" + (version.getVersionNumber() == null ? 1 : version.getVersionNumber()) + ".0" : label;
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

    public record DhrTemplateResponse(
            String id,
            String tenantId,
            String code,
            String name,
            String type,
            String categoryName,
            String description,
            String currentVersionId,
            DhrTemplateVersionResponse currentVersion,
            List<DhrTemplateVersionResponse> versions,
            String status,
            String createdBy,
            String createdAt,
            String updatedBy,
            String updatedAt) {
    }

    public record DhrTemplateVersionResponse(
            String id,
            String templateId,
            String version,
            String code,
            String offlineVersion,
            String description,
            String effectiveFrom,
            String effectiveTo,
            String status,
            boolean isCurrent,
            String createdAt,
            int directoryCount,
            int evidenceCount) {
    }
}
