package com.zencas.edhr.template.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.template.entity.DhrDirectory;
import com.zencas.edhr.template.entity.DhrTemplate;
import com.zencas.edhr.template.entity.DhrTemplateItem;
import com.zencas.edhr.template.entity.DhrTemplateVersion;
import com.zencas.edhr.template.entity.FormTemplate;
import com.zencas.edhr.template.entity.FormTemplateVersion;
import com.zencas.edhr.template.repository.DhrDirectoryRepository;
import com.zencas.edhr.template.repository.DhrTemplateItemRepository;
import com.zencas.edhr.template.repository.DhrTemplateRepository;
import com.zencas.edhr.template.repository.DhrTemplateVersionRepository;
import com.zencas.edhr.template.repository.FormTemplateRepository;
import com.zencas.edhr.template.repository.FormTemplateVersionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Owns DHR evidence composition only. Form-template design remains in its own module.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/master-data/template-modeling/batch-record-templates")
public class DhrTemplateWorkspaceController {
    private static final String TENANT_ID = "default";
    private static final String DRAFT = "DRAFT";
    private static final String ACTIVE = "ACTIVE";
    private static final String DISABLED = "DISABLED";
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final ObjectMapper AUDIT_OBJECT_MAPPER = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    private final DhrTemplateRepository dhrTemplateRepository;
    private final DhrTemplateVersionRepository dhrTemplateVersionRepository;
    private final DhrDirectoryRepository dhrDirectoryRepository;
    private final DhrTemplateItemRepository dhrTemplateItemRepository;
    private final FormTemplateRepository formTemplateRepository;
    private final FormTemplateVersionRepository formTemplateVersionRepository;
    private final AuditEventRepository auditEventRepository;
    private final SnowflakeIdGenerator idGenerator;

    @GetMapping("/{templateId}/workspace")
    public ApiResponse<DhrTemplateWorkspaceResponse> getWorkspace(@PathVariable Long templateId) {
        DhrTemplate template = findTemplate(templateId);
        return ApiResponse.success(new DhrTemplateWorkspaceResponse(
                String.valueOf(template.getId()),
                template.getCode(),
                template.getName(),
                versions(templateId).stream().map(this::toVersionResponse).toList()));
    }

    @GetMapping("/{templateId}/versions/{versionId}/composition")
    public ApiResponse<DhrTemplateCompositionResponse> getComposition(@PathVariable Long templateId, @PathVariable Long versionId) {
        findTemplate(templateId);
        DhrTemplateVersion version = findVersion(templateId, versionId);
        List<DhrDirectory> directories = directories(versionId);
        List<DhrTemplateItem> items = itemsForDirectories(directories);
        return ApiResponse.success(new DhrTemplateCompositionResponse(
                toVersionResponse(version, directories, items),
                directories.stream().map(this::toDirectoryResponse).toList(),
                toEvidenceResponses(items)));
    }

    @GetMapping("/{templateId}/form-options")
    public ApiResponse<List<DhrFormTemplateOption>> listFormOptions(@PathVariable Long templateId) {
        findTemplate(templateId);
        List<DhrFormTemplateOption> options = orEmpty(formTemplateRepository.findAll()).stream()
                .filter(template -> ACTIVE.equals(template.getStatus()))
                .map(this::toFormOption)
                .flatMap(Optional::stream)
                .sorted(Comparator.comparing(DhrFormTemplateOption::name, String.CASE_INSENSITIVE_ORDER))
                .toList();
        return ApiResponse.success(options);
    }

    @PostMapping("/{templateId}/versions")
    @Transactional
    public ApiResponse<DhrVersionResponse> createDhrTemplateVersion(@PathVariable Long templateId, @RequestBody(required = false) DhrVersionRequest request) {
        DhrTemplate template = findTemplate(templateId);
        List<DhrTemplateVersion> existingVersions = versions(templateId);
        DhrTemplateVersion source = resolveVersionSource(templateId, existingVersions, request == null ? null : request.sourceVersionId());
        int versionNumber = existingVersions.stream()
                .map(DhrTemplateVersion::getVersionNumber)
                .filter(Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(0) + 1;
        DhrTemplateVersion version = dhrTemplateVersionRepository.save(DhrTemplateVersion.builder()
                .id(idGenerator.nextId())
                .dhrTemplateId(templateId)
                .versionNumber(versionNumber)
                .status(DRAFT)
                .isCurrent(false)
                .createdAt(LocalDateTime.now())
                .build());
        if (source != null) cloneComposition(source.getId(), version.getId());
        touchTemplate(templateId);
        writeAudit("DHR_TEMPLATE_VERSION", version.getId(), "CREATE", "新建批记录模板版本", Map.of(), versionSnapshot(version));
        return ApiResponse.success(toVersionResponse(version));
    }

    @PostMapping("/{templateId}/versions/{versionId}/directories")
    @Transactional
    public ApiResponse<DhrDirectoryResponse> createDhrDirectory(@PathVariable Long templateId, @PathVariable Long versionId, @RequestBody DhrDirectoryRequest request) {
        findTemplate(templateId);
        DhrTemplateVersion version = findVersion(templateId, versionId);
        ensureEditable(version);
        String name = requireName(request == null ? null : request.name(), "目录名称不能为空");
        Long parentId = validateParent(versionId, request == null ? null : request.parentId(), null);
        DhrDirectory directory = dhrDirectoryRepository.save(DhrDirectory.builder()
                .id(idGenerator.nextId())
                .versionId(versionId)
                .name(name)
                .parentId(parentId)
                .sortOrder(nextDirectorySortOrder(versionId, parentId))
                .createdAt(LocalDateTime.now())
                .build());
        touchTemplate(templateId);
        writeAudit("DHR_DIRECTORY", directory.getId(), "CREATE", "新增批记录目录", Map.of(), directorySnapshot(directory));
        return ApiResponse.success(toDirectoryResponse(directory));
    }

    @PutMapping("/{templateId}/versions/{versionId}/directories/{directoryId}")
    @Transactional
    public ApiResponse<DhrDirectoryResponse> updateDhrDirectory(@PathVariable Long templateId, @PathVariable Long versionId, @PathVariable Long directoryId, @RequestBody DhrDirectoryRequest request) {
        findTemplate(templateId);
        DhrTemplateVersion version = findVersion(templateId, versionId);
        ensureEditable(version);
        DhrDirectory directory = findDirectory(versionId, directoryId);
        Map<String, Object> before = directorySnapshot(directory);
        directory.setName(requireName(request == null ? null : request.name(), "目录名称不能为空"));
        directory.setParentId(validateParent(versionId, request == null ? null : request.parentId(), directoryId));
        DhrDirectory saved = dhrDirectoryRepository.save(directory);
        touchTemplate(templateId);
        writeChangedAudit("DHR_DIRECTORY", saved.getId(), "编辑批记录目录", before, directorySnapshot(saved));
        return ApiResponse.success(toDirectoryResponse(saved));
    }

    @DeleteMapping("/{templateId}/versions/{versionId}/directories/{directoryId}")
    @Transactional
    public ApiResponse<Void> deleteDhrDirectory(@PathVariable Long templateId, @PathVariable Long versionId, @PathVariable Long directoryId) {
        findTemplate(templateId);
        DhrTemplateVersion version = findVersion(templateId, versionId);
        ensureEditable(version);
        DhrDirectory directory = findDirectory(versionId, directoryId);
        boolean hasChild = directories(versionId).stream().anyMatch(candidate -> Objects.equals(candidate.getParentId(), directoryId));
        if (hasChild) throw new BusinessException(ErrorCode.GENERAL_001, "请先删除子目录");
        if (!orEmpty(dhrTemplateItemRepository.findByDirectoryIdOrderBySortOrderAscIdAsc(directoryId)).isEmpty()) {
            throw new BusinessException(ErrorCode.GENERAL_001, "请先移除目录下的表单证据");
        }
        dhrDirectoryRepository.delete(directory);
        touchTemplate(templateId);
        writeAudit("DHR_DIRECTORY", directoryId, "DELETE", "删除批记录目录", directorySnapshot(directory), Map.of());
        return ApiResponse.success(null);
    }

    @PostMapping("/{templateId}/versions/{versionId}/directories/{directoryId}/items")
    @Transactional
    public ApiResponse<DhrEvidenceItemResponse> createDhrEvidenceItem(@PathVariable Long templateId, @PathVariable Long versionId, @PathVariable Long directoryId, @RequestBody DhrEvidenceItemRequest request) {
        findTemplate(templateId);
        DhrTemplateVersion version = findVersion(templateId, versionId);
        ensureEditable(version);
        findDirectory(versionId, directoryId);
        if (request == null || request.formTemplateVersionId() == null) {
            throw new BusinessException(ErrorCode.GENERAL_001, "请选择表单模板版本");
        }
        FormTemplateVersion formVersion = formTemplateVersionRepository.findById(request.formTemplateVersionId())
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "表单模板版本不存在"));
        Long formTemplateId = formVersion.getTemplateId();
        FormTemplate formTemplate = formTemplateId == null ? null : formTemplateRepository.findById(formTemplateId).orElse(null);
        if (formTemplate == null) {
            throw new BusinessException(ErrorCode.GENERAL_001, "表单模板不存在");
        }
        if (!ACTIVE.equals(formTemplate.getStatus()) || !ACTIVE.equals(formVersion.getStatus())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "仅能引用已启用的表单模板版本");
        }
        if (dhrTemplateItemRepository.existsByDirectoryIdAndFormTemplateId(directoryId, formTemplateId)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "该目录已引用此表单模板");
        }
        DhrTemplateItem item = dhrTemplateItemRepository.save(DhrTemplateItem.builder()
                .id(idGenerator.nextId())
                .directoryId(directoryId)
                .formTemplateId(formTemplateId)
                .formTemplateVersionId(formVersion.getId())
                .sortOrder(nextItemSortOrder(directoryId))
                .isRequired(request.isRequired() == null || request.isRequired())
                .createdAt(LocalDateTime.now())
                .build());
        touchTemplate(templateId);
        writeAudit("DHR_TEMPLATE_ITEM", item.getId(), "CREATE", "新增批记录表单证据", Map.of(), evidenceSnapshot(item));
        return ApiResponse.success(toEvidenceResponse(item));
    }

    @PutMapping("/{templateId}/versions/{versionId}/items/{itemId}")
    @Transactional
    public ApiResponse<DhrEvidenceItemResponse> updateDhrEvidenceItem(@PathVariable Long templateId, @PathVariable Long versionId, @PathVariable Long itemId, @RequestBody DhrEvidenceItemUpdateRequest request) {
        findTemplate(templateId);
        DhrTemplateVersion version = findVersion(templateId, versionId);
        ensureEditable(version);
        DhrTemplateItem item = findItem(versionId, itemId);
        Map<String, Object> before = evidenceSnapshot(item);
        if (request != null && request.isRequired() != null) item.setIsRequired(request.isRequired());
        DhrTemplateItem saved = dhrTemplateItemRepository.save(item);
        touchTemplate(templateId);
        writeChangedAudit("DHR_TEMPLATE_ITEM", saved.getId(), "编辑批记录表单证据", before, evidenceSnapshot(saved));
        return ApiResponse.success(toEvidenceResponse(saved));
    }

    @DeleteMapping("/{templateId}/versions/{versionId}/items/{itemId}")
    @Transactional
    public ApiResponse<Void> deleteDhrEvidenceItem(@PathVariable Long templateId, @PathVariable Long versionId, @PathVariable Long itemId) {
        findTemplate(templateId);
        DhrTemplateVersion version = findVersion(templateId, versionId);
        ensureEditable(version);
        DhrTemplateItem item = findItem(versionId, itemId);
        dhrTemplateItemRepository.delete(item);
        touchTemplate(templateId);
        writeAudit("DHR_TEMPLATE_ITEM", itemId, "DELETE", "删除批记录表单证据", evidenceSnapshot(item), Map.of());
        return ApiResponse.success(null);
    }

    @PostMapping("/{templateId}/versions/{versionId}/publish")
    @Transactional
    public ApiResponse<DhrVersionResponse> publishDhrTemplateVersion(@PathVariable Long templateId, @PathVariable Long versionId) {
        DhrTemplate template = findTemplate(templateId);
        DhrTemplateVersion version = findVersion(templateId, versionId);
        ensureEditable(version);
        List<DhrDirectory> directories = directories(versionId);
        List<DhrTemplateItem> items = itemsForDirectories(directories);
        if (directories.isEmpty()) throw new BusinessException(ErrorCode.GENERAL_001, "请至少配置一个 DHR 目录");
        if (items.isEmpty()) throw new BusinessException(ErrorCode.GENERAL_001, "请至少配置一个表单证据");
        Map<String, Object> before = versionSnapshot(version);
        List<DhrTemplateVersion> previousCurrentVersions = versions(templateId).stream()
                .filter(candidate -> !Objects.equals(candidate.getId(), versionId))
                .filter(candidate -> Boolean.TRUE.equals(candidate.getIsCurrent()))
                .toList();
        previousCurrentVersions.forEach(previous -> {
            previous.setIsCurrent(false);
            previous.setStatus(DISABLED);
        });
        if (!previousCurrentVersions.isEmpty()) dhrTemplateVersionRepository.saveAll(previousCurrentVersions);
        version.setDirectorySnapshot(toSnapshotJson(version, directories, items));
        version.setStatus(ACTIVE);
        version.setIsCurrent(true);
        DhrTemplateVersion saved = dhrTemplateVersionRepository.save(version);
        template.setStatus(ACTIVE);
        template.setUpdatedBy(currentOperatorName());
        template.setUpdatedAt(LocalDateTime.now());
        dhrTemplateRepository.save(template);
        writeChangedAudit("DHR_TEMPLATE_VERSION", saved.getId(), "启用批记录模板版本", before, versionSnapshot(saved));
        return ApiResponse.success(toVersionResponse(saved, directories, items));
    }

    private DhrTemplate findTemplate(Long templateId) {
        return dhrTemplateRepository.findById(templateId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "批记录模板不存在"));
    }

    private DhrTemplateVersion findVersion(Long templateId, Long versionId) {
        return dhrTemplateVersionRepository.findByIdAndDhrTemplateId(versionId, templateId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "批记录模板版本不存在"));
    }

    private DhrTemplateVersion resolveVersionSource(Long templateId, List<DhrTemplateVersion> existingVersions, Long requestedSourceId) {
        if (requestedSourceId != null) {
            return existingVersions.stream()
                    .filter(version -> Objects.equals(version.getId(), requestedSourceId))
                    .findFirst()
                    .orElseGet(() -> findVersion(templateId, requestedSourceId));
        }
        return existingVersions.stream().filter(version -> Boolean.TRUE.equals(version.getIsCurrent())).findFirst()
                .or(() -> existingVersions.stream().findFirst())
                .orElse(null);
    }

    private List<DhrTemplateVersion> versions(Long templateId) {
        return orEmpty(dhrTemplateVersionRepository.findByDhrTemplateIdOrderByVersionNumberDesc(templateId));
    }

    private List<DhrDirectory> directories(Long versionId) {
        return orEmpty(dhrDirectoryRepository.findByVersionIdOrderBySortOrderAscIdAsc(versionId));
    }

    private List<DhrTemplateItem> itemsForDirectories(Collection<DhrDirectory> directories) {
        List<Long> directoryIds = directories.stream().map(DhrDirectory::getId).filter(Objects::nonNull).toList();
        return directoryIds.isEmpty() ? List.of() : orEmpty(dhrTemplateItemRepository.findByDirectoryIdInOrderBySortOrderAscIdAsc(directoryIds));
    }

    private void cloneComposition(Long sourceVersionId, Long targetVersionId) {
        List<DhrDirectory> sourceDirectories = directories(sourceVersionId);
        if (sourceDirectories.isEmpty()) return;
        Map<Long, Long> clonedDirectoryIds = new HashMap<>();
        List<DhrDirectory> pending = new ArrayList<>(sourceDirectories);
        while (!pending.isEmpty()) {
            int pendingCount = pending.size();
            pending.removeIf(source -> {
                if (source.getParentId() != null && !clonedDirectoryIds.containsKey(source.getParentId())) return false;
                DhrDirectory cloned = dhrDirectoryRepository.save(DhrDirectory.builder()
                        .id(idGenerator.nextId())
                        .versionId(targetVersionId)
                        .name(source.getName())
                        .parentId(source.getParentId() == null ? null : clonedDirectoryIds.get(source.getParentId()))
                        .sortOrder(source.getSortOrder())
                        .createdAt(LocalDateTime.now())
                        .build());
                clonedDirectoryIds.put(source.getId(), cloned.getId());
                return true;
            });
            if (pending.size() == pendingCount) {
                throw new BusinessException(ErrorCode.GENERAL_001, "DHR 目录层级异常，无法复制版本");
            }
        }
        itemsForDirectories(sourceDirectories).forEach(source -> dhrTemplateItemRepository.save(DhrTemplateItem.builder()
                .id(idGenerator.nextId())
                .directoryId(clonedDirectoryIds.get(source.getDirectoryId()))
                .formTemplateId(source.getFormTemplateId())
                .formTemplateVersionId(source.getFormTemplateVersionId())
                .sortOrder(source.getSortOrder())
                .isRequired(source.getIsRequired())
                .createdAt(LocalDateTime.now())
                .build()));
    }

    private void ensureEditable(DhrTemplateVersion version) {
        if (!DRAFT.equals(version.getStatus())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "已启用版本不可编辑，请先新建版本");
        }
    }

    private Long validateParent(Long versionId, Long parentId, Long currentDirectoryId) {
        if (parentId == null) return null;
        if (Objects.equals(parentId, currentDirectoryId)) throw new BusinessException(ErrorCode.GENERAL_001, "目录不能设置为自身的子目录");
        DhrDirectory parent = findDirectory(versionId, parentId);
        Long cursor = parent.getParentId();
        while (cursor != null) {
            if (Objects.equals(cursor, currentDirectoryId)) throw new BusinessException(ErrorCode.GENERAL_001, "目录不能移动到自己的子目录下");
            cursor = findDirectory(versionId, cursor).getParentId();
        }
        return parent.getId();
    }

    private DhrDirectory findDirectory(Long versionId, Long directoryId) {
        DhrDirectory directory = dhrDirectoryRepository.findById(directoryId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "DHR 目录不存在"));
        if (!Objects.equals(directory.getVersionId(), versionId)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "DHR 目录不属于当前模板版本");
        }
        return directory;
    }

    private DhrTemplateItem findItem(Long versionId, Long itemId) {
        DhrTemplateItem item = dhrTemplateItemRepository.findById(itemId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "DHR 表单证据不存在"));
        findDirectory(versionId, item.getDirectoryId());
        return item;
    }

    private int nextDirectorySortOrder(Long versionId, Long parentId) {
        return directories(versionId).stream()
                .filter(directory -> Objects.equals(directory.getParentId(), parentId))
                .map(DhrDirectory::getSortOrder)
                .filter(Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(0) + 10;
    }

    private int nextItemSortOrder(Long directoryId) {
        return orEmpty(dhrTemplateItemRepository.findByDirectoryIdOrderBySortOrderAscIdAsc(directoryId)).stream()
                .map(DhrTemplateItem::getSortOrder)
                .filter(Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(0) + 10;
    }

    private Optional<DhrFormTemplateOption> toFormOption(FormTemplate template) {
        FormTemplateVersion version = null;
        if (template.getCurrentVersionId() != null) {
            version = formTemplateVersionRepository.findByIdAndTemplateId(template.getCurrentVersionId(), template.getId()).orElse(null);
        }
        if (version == null) {
            version = orEmpty(formTemplateVersionRepository.findByTemplateIdOrderByCreatedAtDesc(template.getId())).stream().findFirst().orElse(null);
        }
        if (version == null || !ACTIVE.equals(version.getStatus())) return Optional.empty();
        return Optional.of(new DhrFormTemplateOption(
                String.valueOf(template.getId()),
                String.valueOf(version.getId()),
                template.getCode(),
                template.getName(),
                version.getVersion()));
    }

    private List<DhrEvidenceItemResponse> toEvidenceResponses(List<DhrTemplateItem> items) {
        Map<Long, FormTemplate> templates = orEmpty(formTemplateRepository.findAllById(items.stream().map(DhrTemplateItem::getFormTemplateId).filter(Objects::nonNull).collect(Collectors.toSet())))
                .stream().collect(Collectors.toMap(FormTemplate::getId, value -> value));
        Map<Long, FormTemplateVersion> versions = orEmpty(formTemplateVersionRepository.findAllById(items.stream().map(DhrTemplateItem::getFormTemplateVersionId).filter(Objects::nonNull).collect(Collectors.toSet())))
                .stream().collect(Collectors.toMap(FormTemplateVersion::getId, value -> value));
        return items.stream().map(item -> toEvidenceResponse(item, templates, versions)).toList();
    }

    private DhrEvidenceItemResponse toEvidenceResponse(DhrTemplateItem item) {
        return toEvidenceResponses(List.of(item)).getFirst();
    }

    private DhrEvidenceItemResponse toEvidenceResponse(DhrTemplateItem item, Map<Long, FormTemplate> templates, Map<Long, FormTemplateVersion> versions) {
        FormTemplate template = templates.get(item.getFormTemplateId());
        FormTemplateVersion version = versions.get(item.getFormTemplateVersionId());
        return new DhrEvidenceItemResponse(
                String.valueOf(item.getId()),
                String.valueOf(item.getDirectoryId()),
                item.getFormTemplateId() == null ? null : String.valueOf(item.getFormTemplateId()),
                item.getFormTemplateVersionId() == null ? null : String.valueOf(item.getFormTemplateVersionId()),
                template == null ? "已删除表单" : template.getCode(),
                template == null ? "已删除表单" : template.getName(),
                version == null ? "-" : version.getVersion(),
                Boolean.TRUE.equals(item.getIsRequired()),
                item.getSortOrder() == null ? 0 : item.getSortOrder());
    }

    private DhrVersionResponse toVersionResponse(DhrTemplateVersion version) {
        List<DhrDirectory> directories = directories(version.getId());
        return toVersionResponse(version, directories, itemsForDirectories(directories));
    }

    private DhrVersionResponse toVersionResponse(DhrTemplateVersion version, List<DhrDirectory> directories, List<DhrTemplateItem> items) {
        return new DhrVersionResponse(
                String.valueOf(version.getId()),
                versionLabel(version),
                version.getStatus(),
                Boolean.TRUE.equals(version.getIsCurrent()),
                formatDateTime(version.getCreatedAt()),
                directories.size(),
                items.size());
    }

    private DhrDirectoryResponse toDirectoryResponse(DhrDirectory directory) {
        return new DhrDirectoryResponse(
                String.valueOf(directory.getId()),
                directory.getParentId() == null ? null : String.valueOf(directory.getParentId()),
                directory.getName(),
                directory.getSortOrder() == null ? 0 : directory.getSortOrder());
    }

    private String versionLabel(DhrTemplateVersion version) {
        return "V" + (version.getVersionNumber() == null ? 1 : version.getVersionNumber()) + ".0";
    }

    private void touchTemplate(Long templateId) {
        dhrTemplateRepository.findById(templateId).ifPresent(template -> {
            template.setUpdatedBy(currentOperatorName());
            template.setUpdatedAt(LocalDateTime.now());
            dhrTemplateRepository.save(template);
        });
    }

    private String toSnapshotJson(DhrTemplateVersion version, List<DhrDirectory> directories, List<DhrTemplateItem> items) {
        Map<Long, List<DhrTemplateItem>> itemsByDirectory = items.stream().collect(Collectors.groupingBy(DhrTemplateItem::getDirectoryId, LinkedHashMap::new, Collectors.toList()));
        Map<Long, FormTemplate> formTemplates = orEmpty(formTemplateRepository.findAllById(items.stream()
                        .map(DhrTemplateItem::getFormTemplateId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet())))
                .stream().collect(Collectors.toMap(FormTemplate::getId, value -> value));
        Map<Long, FormTemplateVersion> formVersions = orEmpty(formTemplateVersionRepository.findAllById(items.stream()
                        .map(DhrTemplateItem::getFormTemplateVersionId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet())))
                .stream().collect(Collectors.toMap(FormTemplateVersion::getId, value -> value));
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("version", versionLabel(version));
        snapshot.put("publishedAt", LocalDateTime.now());
        snapshot.put("directories", directories.stream().map(directory -> {
            Map<String, Object> directorySnapshot = new LinkedHashMap<>();
            directorySnapshot.put("id", directory.getId());
            directorySnapshot.put("parentId", directory.getParentId());
            directorySnapshot.put("name", directory.getName());
            directorySnapshot.put("sortOrder", directory.getSortOrder());
            directorySnapshot.put("items", itemsByDirectory.getOrDefault(directory.getId(), List.of()).stream()
                    .map(item -> evidenceSnapshot(item, formTemplates, formVersions)).toList());
            return directorySnapshot;
        }).toList());
        return toJson(snapshot);
    }

    private Map<String, Object> versionSnapshot(DhrTemplateVersion version) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("version", versionLabel(version));
        snapshot.put("status", version.getStatus());
        snapshot.put("isCurrent", version.getIsCurrent());
        snapshot.put("directorySnapshot", version.getDirectorySnapshot());
        return snapshot;
    }

    private Map<String, Object> directorySnapshot(DhrDirectory directory) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("directoryName", directory.getName());
        snapshot.put("parentId", directory.getParentId());
        snapshot.put("sortOrder", directory.getSortOrder());
        return snapshot;
    }

    private Map<String, Object> evidenceSnapshot(DhrTemplateItem item) {
        return evidenceSnapshot(item, Map.of(), Map.of());
    }

    private Map<String, Object> evidenceSnapshot(DhrTemplateItem item, Map<Long, FormTemplate> formTemplates, Map<Long, FormTemplateVersion> formVersions) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("directoryId", item.getDirectoryId());
        snapshot.put("formTemplateId", item.getFormTemplateId());
        snapshot.put("formTemplateVersionId", item.getFormTemplateVersionId());
        FormTemplate formTemplate = formTemplates.get(item.getFormTemplateId());
        FormTemplateVersion formVersion = formVersions.get(item.getFormTemplateVersionId());
        if (formTemplate != null) {
            snapshot.put("formCode", formTemplate.getCode());
            snapshot.put("formName", formTemplate.getName());
        }
        if (formVersion != null) snapshot.put("formVersion", formVersion.getVersion());
        snapshot.put("required", item.getIsRequired());
        snapshot.put("sortOrder", item.getSortOrder());
        return snapshot;
    }

    private void writeChangedAudit(String entityType, Long entityId, String functionName, Map<String, Object> before, Map<String, Object> after) {
        Map<String, Object> changedBefore = new LinkedHashMap<>();
        Map<String, Object> changedAfter = new LinkedHashMap<>();
        before.forEach((field, beforeValue) -> {
            Object afterValue = after.get(field);
            if (!Objects.equals(beforeValue, afterValue)) {
                changedBefore.put(field, beforeValue);
                changedAfter.put(field, afterValue);
            }
        });
        if (!changedBefore.isEmpty()) writeAudit(entityType, entityId, "UPDATE", functionName, changedBefore, changedAfter);
    }

    private void writeAudit(String entityType, Long entityId, String action, String functionName, Map<String, Object> before, Map<String, Object> after) {
        auditEventRepository.save(AuditEvent.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .entityType(entityType)
                .entityId(String.valueOf(entityId))
                .action(action)
                .contentBefore(toJson(before))
                .contentAfter(toJson(after))
                .operatorId(AuditContext.getOperatorId())
                .operatorName(AuditContext.getOperatorName())
                .operatorAccount(AuditContext.getOperatorAccount())
                .source(AuditContext.getSource())
                .moduleName("数据")
                .menuName("模板建模 · 批记录模板")
                .functionName(functionName)
                .dataSummary("批记录模板 #" + entityId)
                .ipAddress(AuditContext.getIpAddress())
                .createdAt(LocalDateTime.now())
                .build());
    }

    private String requireName(String value, String message) {
        if (!StringUtils.hasText(value)) throw new BusinessException(ErrorCode.GENERAL_001, message);
        return value.trim();
    }

    private String formatDateTime(LocalDateTime value) {
        return value == null ? null : value.format(DATE_TIME_FORMATTER);
    }

    private String currentOperatorName() {
        if (StringUtils.hasText(AuditContext.getOperatorName())) return AuditContext.getOperatorName();
        if (StringUtils.hasText(AuditContext.getOperatorAccount())) return AuditContext.getOperatorAccount();
        return "系统管理员";
    }

    private String toJson(Object value) {
        try {
            return AUDIT_OBJECT_MAPPER.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new BusinessException(ErrorCode.GENERAL_001, "审计内容序列化失败");
        }
    }

    private static <T> List<T> orEmpty(List<T> values) {
        return values == null ? List.of() : values;
    }

    public record DhrVersionRequest(Long sourceVersionId) {
    }

    public record DhrDirectoryRequest(String name, Long parentId) {
    }

    public record DhrEvidenceItemRequest(Long formTemplateVersionId, Boolean isRequired) {
    }

    public record DhrEvidenceItemUpdateRequest(Boolean isRequired) {
    }

    public record DhrTemplateWorkspaceResponse(String templateId, String templateCode, String templateName, List<DhrVersionResponse> versions) {
    }

    public record DhrTemplateCompositionResponse(DhrVersionResponse version, List<DhrDirectoryResponse> directories, List<DhrEvidenceItemResponse> items) {
    }

    public record DhrVersionResponse(String id, String version, String status, boolean isCurrent, String createdAt, int directoryCount, int evidenceCount) {
    }

    public record DhrDirectoryResponse(String id, String parentId, String name, int sortOrder) {
    }

    public record DhrEvidenceItemResponse(String id, String directoryId, String formTemplateId, String formTemplateVersionId, String formCode, String formName, String formVersion, boolean isRequired, int sortOrder) {
    }

    public record DhrFormTemplateOption(String templateId, String versionId, String code, String name, String version) {
    }
}
