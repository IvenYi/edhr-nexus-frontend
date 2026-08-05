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
import com.zencas.edhr.common.util.RdoVersionStatusResolver;
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
import com.zencas.edhr.template.support.DhrTemplateVersionStatusResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
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
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Owns DHR evidence composition only. Form-template design remains in its own module.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/master-data/template-modeling/batch-record-templates")
@PreAuthorize("hasAuthority('master-data.batch-record-templates')")
public class DhrTemplateWorkspaceController {
    private static final String TENANT_ID = "default";
    private static final String ACTIVE = RdoVersionStatusResolver.ACTIVE;
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
                null,
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

    @PutMapping("/{templateId}/versions/{versionId}/composition")
    @Transactional
    public ApiResponse<DhrTemplateCompositionResponse> saveDhrTemplateComposition(
            @PathVariable Long templateId,
            @PathVariable Long versionId,
            @RequestBody DhrCompositionRequest request) {
        findTemplate(templateId);
        DhrTemplateVersion version = findVersion(templateId, versionId);
        List<DhrCompositionDirectoryRequest> requestedDirectories = request == null ? List.of() : orEmpty(request.directories());
        List<DhrCompositionItemRequest> requestedItems = request == null ? List.of() : orEmpty(request.items());
        List<DhrDirectory> previousDirectories = directories(versionId);
        List<DhrTemplateItem> previousItems = itemsForDirectories(previousDirectories);
        Map<String, DhrCompositionDirectoryRequest> directoryByClientId = validateCompositionDirectories(requestedDirectories);
        Map<Long, FormTemplateReference> formReferences = validateCompositionItems(
                requestedItems,
                directoryByClientId,
                previousItems);
        Map<String, Object> before = compositionSnapshot(previousDirectories, previousItems);

        if (!previousItems.isEmpty()) dhrTemplateItemRepository.deleteAll(previousItems);
        if (!previousDirectories.isEmpty()) dhrDirectoryRepository.deleteAll(previousDirectories);

        Map<String, DhrDirectory> savedDirectoriesByClientId = saveCompositionDirectories(versionId, requestedDirectories, directoryByClientId);
        List<DhrTemplateItem> savedItems = saveCompositionItems(requestedItems, savedDirectoriesByClientId, formReferences);
        List<DhrDirectory> savedDirectories = savedDirectoriesByClientId.values().stream()
                .sorted(Comparator.comparing(DhrDirectory::getSortOrder, Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(DhrDirectory::getId))
                .toList();
        touchTemplate(templateId);
        Map<String, Object> after = compositionSnapshot(savedDirectories, savedItems);
        if (writeChangedAudit("DHR_TEMPLATE_VERSION", versionId, "保存批记录设计", before, after)) {
            writeVersionActivityAudit(version, "UPDATE", "保存批记录设计", "目录与表单引用", before, after);
        }
        return ApiResponse.success(new DhrTemplateCompositionResponse(
                toVersionResponse(version, savedDirectories, savedItems),
                savedDirectories.stream().map(this::toDirectoryResponse).toList(),
                toEvidenceResponses(savedItems)));
    }

    @GetMapping("/{templateId}/form-options")
    public ApiResponse<List<DhrFormTemplateOption>> listFormOptions(@PathVariable Long templateId) {
        findTemplate(templateId);
        List<DhrFormTemplateOption> options = orEmpty(formTemplateRepository.findAll()).stream()
                .map(this::toFormOption)
                .sorted(Comparator.comparing(DhrFormTemplateOption::name, String.CASE_INSENSITIVE_ORDER))
                .toList();
        return ApiResponse.success(options);
    }

    @PostMapping("/{templateId}/versions")
    @Transactional
    public ApiResponse<DhrVersionResponse> createDhrTemplateVersion(@PathVariable Long templateId, @RequestBody(required = false) DhrVersionRequest request) {
        DhrTemplate template = findTemplate(templateId);
        validateEffectiveDateRange(request);
        List<DhrTemplateVersion> existingVersions = versions(templateId);
        Long sourceVersionId = request == null ? null : request.sourceVersionId();
        DhrTemplateVersion source = sourceVersionId == null ? null : resolveVersionSource(templateId, existingVersions, sourceVersionId);
        int versionNumber = existingVersions.stream()
                .map(DhrTemplateVersion::getVersionNumber)
                .filter(Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(0) + 1;
        String versionLabel = resolveVersionLabel(request == null ? null : request.version(), versionNumber);
        ensureVersionLabelAvailable(templateId, versionLabel, null);
        String code = normalizeVersionCode(request == null ? null : request.code());
        ensureVersionCodeAvailable(code, null);
        DhrTemplateVersion version = dhrTemplateVersionRepository.save(DhrTemplateVersion.builder()
                .id(idGenerator.nextId())
                .dhrTemplateId(templateId)
                .versionNumber(versionNumber)
                .versionLabel(versionLabel)
                .code(code)
                .offlineVersion(normalizeOfflineVersion(request == null ? null : request.offlineVersion()))
                .description(trimToNull(request == null ? null : request.description()))
                .effectiveFrom(parseDateTime(request == null ? null : request.effectiveFrom()))
                .effectiveTo(parseDateTime(request == null ? null : request.effectiveTo()))
                .createdAt(LocalDateTime.now())
                .build());
        if (source != null) cloneComposition(source.getId(), version.getId());
        touchTemplate(templateId);
        writeAudit("DHR_TEMPLATE_VERSION", version.getId(), "CREATE", "新建批记录模板版本", Map.of(), versionSnapshot(version));
        return ApiResponse.success(toVersionResponse(version));
    }

    @PutMapping("/{templateId}/versions/{versionId}")
    @Transactional
    public ApiResponse<DhrVersionResponse> updateDhrTemplateVersion(@PathVariable Long templateId, @PathVariable Long versionId, @RequestBody DhrVersionRequest request) {
        findTemplate(templateId);
        DhrTemplateVersion version = findVersion(templateId, versionId);
        validateEffectiveDateRange(request);
        String versionLabel = requireVersionLabel(request == null ? null : request.version());
        ensureVersionLabelAvailable(templateId, versionLabel, versionId);
        String code = normalizeVersionCode(request == null ? null : request.code());
        ensureVersionCodeAvailable(code, versionId);
        Map<String, Object> before = versionSnapshot(version);
        version.setVersionLabel(versionLabel);
        version.setCode(code);
        version.setOfflineVersion(normalizeOfflineVersion(request == null ? null : request.offlineVersion()));
        version.setDescription(trimToNull(request == null ? null : request.description()));
        version.setEffectiveFrom(parseDateTime(request == null ? null : request.effectiveFrom()));
        version.setEffectiveTo(parseDateTime(request == null ? null : request.effectiveTo()));
        DhrTemplateVersion saved = dhrTemplateVersionRepository.save(version);
        touchTemplate(templateId);
        writeChangedAudit("DHR_TEMPLATE_VERSION", saved.getId(), "编辑批记录模板版本", before, versionSnapshot(saved));
        return ApiResponse.success(toVersionResponse(saved));
    }

    @DeleteMapping("/{templateId}/versions/{versionId}")
    @Transactional
    public ApiResponse<Void> deleteDhrTemplateVersion(@PathVariable Long templateId, @PathVariable Long versionId) {
        findTemplate(templateId);
        List<DhrTemplateVersion> existingVersions = versions(templateId);
        if (existingVersions.size() <= 1) {
            throw new BusinessException(ErrorCode.GENERAL_001, "批记录模板至少保留一个版本");
        }
        DhrTemplateVersion version = findVersion(templateId, versionId);
        List<DhrDirectory> directories = directories(versionId);
        List<DhrTemplateItem> items = itemsForDirectories(directories);
        if (!items.isEmpty()) dhrTemplateItemRepository.deleteAll(items);
        if (!directories.isEmpty()) dhrDirectoryRepository.deleteAll(directories);
        dhrTemplateVersionRepository.delete(version);
        touchTemplate(templateId);
        writeAudit("DHR_TEMPLATE_VERSION", versionId, "DELETE", "删除批记录模板版本", versionSnapshot(version), Map.of());
        return ApiResponse.success(null);
    }

    @PostMapping("/{templateId}/versions/{versionId}/directories")
    @Transactional
    public ApiResponse<DhrDirectoryResponse> createDhrDirectory(@PathVariable Long templateId, @PathVariable Long versionId, @RequestBody DhrDirectoryRequest request) {
        findTemplate(templateId);
        DhrTemplateVersion version = findVersion(templateId, versionId);
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
        Map<String, Object> after = directorySnapshot(directory);
        writeAudit("DHR_DIRECTORY", directory.getId(), "CREATE", "新增批记录目录", Map.of(), after);
        writeVersionActivityAudit(version, "CREATE", "新增批记录目录", "目录", Map.of(), after);
        return ApiResponse.success(toDirectoryResponse(directory));
    }

    @PutMapping("/{templateId}/versions/{versionId}/directories/{directoryId}")
    @Transactional
    public ApiResponse<DhrDirectoryResponse> updateDhrDirectory(@PathVariable Long templateId, @PathVariable Long versionId, @PathVariable Long directoryId, @RequestBody DhrDirectoryRequest request) {
        findTemplate(templateId);
        DhrTemplateVersion version = findVersion(templateId, versionId);
        DhrDirectory directory = findDirectory(versionId, directoryId);
        Map<String, Object> before = directorySnapshot(directory);
        directory.setName(requireName(request == null ? null : request.name(), "目录名称不能为空"));
        directory.setParentId(validateParent(versionId, request == null ? null : request.parentId(), directoryId));
        DhrDirectory saved = dhrDirectoryRepository.save(directory);
        touchTemplate(templateId);
        Map<String, Object> after = directorySnapshot(saved);
        if (writeChangedAudit("DHR_DIRECTORY", saved.getId(), "编辑批记录目录", before, after)) {
            writeVersionActivityAudit(version, "UPDATE", "编辑批记录目录", "目录", before, after);
        }
        return ApiResponse.success(toDirectoryResponse(saved));
    }

    @DeleteMapping("/{templateId}/versions/{versionId}/directories/{directoryId}")
    @Transactional
    public ApiResponse<Void> deleteDhrDirectory(@PathVariable Long templateId, @PathVariable Long versionId, @PathVariable Long directoryId) {
        findTemplate(templateId);
        DhrTemplateVersion version = findVersion(templateId, versionId);
        DhrDirectory directory = findDirectory(versionId, directoryId);
        boolean hasChild = directories(versionId).stream().anyMatch(candidate -> Objects.equals(candidate.getParentId(), directoryId));
        if (hasChild) throw new BusinessException(ErrorCode.GENERAL_001, "请先删除子目录");
        if (!orEmpty(dhrTemplateItemRepository.findByDirectoryIdOrderBySortOrderAscIdAsc(directoryId)).isEmpty()) {
            throw new BusinessException(ErrorCode.GENERAL_001, "请先移除目录下的表单证据");
        }
        dhrDirectoryRepository.delete(directory);
        touchTemplate(templateId);
        Map<String, Object> before = directorySnapshot(directory);
        writeAudit("DHR_DIRECTORY", directoryId, "DELETE", "删除批记录目录", before, Map.of());
        writeVersionActivityAudit(version, "DELETE", "删除批记录目录", "目录", before, Map.of());
        return ApiResponse.success(null);
    }

    @PostMapping("/{templateId}/versions/{versionId}/directories/{directoryId}/items")
    @Transactional
    public ApiResponse<DhrEvidenceItemResponse> createDhrEvidenceItem(@PathVariable Long templateId, @PathVariable Long versionId, @PathVariable Long directoryId, @RequestBody DhrEvidenceItemRequest request) {
        findTemplate(templateId);
        DhrTemplateVersion version = findVersion(templateId, versionId);
        findDirectory(versionId, directoryId);
        FormTemplateReference formReference = resolveActiveFormTemplateReference(request == null ? null : request.formTemplateVersionId());
        FormTemplateVersion formVersion = formReference.version();
        Long formTemplateId = formReference.template().getId();
        if (dhrTemplateItemRepository.existsByDirectoryIdAndFormTemplateId(directoryId, formTemplateId)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "该目录已引用此表单模板");
        }
        DhrTemplateItem item = dhrTemplateItemRepository.save(DhrTemplateItem.builder()
                .id(idGenerator.nextId())
                .directoryId(directoryId)
                .formTemplateId(formTemplateId)
                .formTemplateVersionId(formVersion.getId())
                .displayName(trimToNull(request.displayName()))
                .sortOrder(nextItemSortOrder(directoryId))
                .isRequired(request.isRequired() == null || request.isRequired())
                .createdAt(LocalDateTime.now())
                .build());
        touchTemplate(templateId);
        Map<String, Object> after = evidenceSnapshot(item);
        writeAudit("DHR_TEMPLATE_ITEM", item.getId(), "CREATE", "新增批记录表单证据", Map.of(), after);
        writeVersionActivityAudit(version, "CREATE", "引用表单", "表单引用", Map.of(), after);
        return ApiResponse.success(toEvidenceResponse(item));
    }

    @PutMapping("/{templateId}/versions/{versionId}/items/{itemId}")
    @Transactional
    public ApiResponse<DhrEvidenceItemResponse> updateDhrEvidenceItem(@PathVariable Long templateId, @PathVariable Long versionId, @PathVariable Long itemId, @RequestBody DhrEvidenceItemUpdateRequest request) {
        findTemplate(templateId);
        DhrTemplateVersion version = findVersion(templateId, versionId);
        DhrTemplateItem item = findItem(versionId, itemId);
        Map<String, Object> before = evidenceSnapshot(item);
        if (request != null && request.isRequired() != null) item.setIsRequired(request.isRequired());
        if (request != null && request.displayName() != null) item.setDisplayName(trimToNull(request.displayName()));
        DhrTemplateItem saved = dhrTemplateItemRepository.save(item);
        touchTemplate(templateId);
        Map<String, Object> after = evidenceSnapshot(saved);
        if (writeChangedAudit("DHR_TEMPLATE_ITEM", saved.getId(), "编辑批记录表单证据", before, after)) {
            writeVersionActivityAudit(version, "UPDATE", "编辑引用表单", "表单引用", before, after);
        }
        return ApiResponse.success(toEvidenceResponse(saved));
    }

    @DeleteMapping("/{templateId}/versions/{versionId}/items/{itemId}")
    @Transactional
    public ApiResponse<Void> deleteDhrEvidenceItem(@PathVariable Long templateId, @PathVariable Long versionId, @PathVariable Long itemId) {
        findTemplate(templateId);
        DhrTemplateVersion version = findVersion(templateId, versionId);
        DhrTemplateItem item = findItem(versionId, itemId);
        dhrTemplateItemRepository.delete(item);
        touchTemplate(templateId);
        Map<String, Object> before = evidenceSnapshot(item);
        writeAudit("DHR_TEMPLATE_ITEM", itemId, "DELETE", "删除批记录表单证据", before, Map.of());
        writeVersionActivityAudit(version, "DELETE", "移除引用表单", "表单引用", before, Map.of());
        return ApiResponse.success(null);
    }

    @PostMapping("/{templateId}/versions/{versionId}/publish")
    @Transactional
    public ApiResponse<DhrVersionResponse> publishDhrTemplateVersion(@PathVariable Long templateId, @PathVariable Long versionId) {
        DhrTemplate template = findTemplate(templateId);
        DhrTemplateVersion version = findVersion(templateId, versionId);
        validateVersionCanBePublished(version);
        List<DhrDirectory> directories = directories(versionId);
        List<DhrTemplateItem> items = itemsForDirectories(directories);
        if (directories.isEmpty()) throw new BusinessException(ErrorCode.GENERAL_001, "请至少配置一个 DHR 目录");
        if (items.isEmpty()) throw new BusinessException(ErrorCode.GENERAL_001, "请至少配置一个表单证据");
        Map<String, Object> before = versionSnapshot(version);
        version.setDirectorySnapshot(toSnapshotJson(version, directories, items));
        DhrTemplateVersion saved = dhrTemplateVersionRepository.save(version);
        template.setUpdatedBy(currentOperatorName());
        template.setUpdatedAt(LocalDateTime.now());
        dhrTemplateRepository.save(template);
        writeChangedAudit("DHR_TEMPLATE_VERSION", saved.getId(), "发布批记录模板版本", before, versionSnapshot(saved));
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
        return existingVersions.stream()
                .filter(version -> Objects.equals(version.getId(), requestedSourceId))
                .findFirst()
                .orElseGet(() -> findVersion(templateId, requestedSourceId));
    }

    private Map<String, DhrCompositionDirectoryRequest> validateCompositionDirectories(
            List<DhrCompositionDirectoryRequest> requestedDirectories) {
        Map<String, DhrCompositionDirectoryRequest> directoriesByClientId = new LinkedHashMap<>();
        for (DhrCompositionDirectoryRequest directory : requestedDirectories) {
            if (directory == null) throw new BusinessException(ErrorCode.GENERAL_001, "目录数据不能为空");
            String clientId = requireName(directory.clientId(), "目录标识不能为空");
            String name = requireName(directory.name(), "目录名称不能为空");
            if (name.length() > 128) throw new BusinessException(ErrorCode.GENERAL_001, "目录名称不能超过 128 个字符");
            if (directoriesByClientId.putIfAbsent(clientId, directory) != null) {
                throw new BusinessException(ErrorCode.GENERAL_001, "目录标识重复");
            }
        }
        for (DhrCompositionDirectoryRequest directory : requestedDirectories) {
            String clientId = directory.clientId().trim();
            String parentClientId = trimToNull(directory.parentClientId());
            if (parentClientId != null && !directoriesByClientId.containsKey(parentClientId)) {
                throw new BusinessException(ErrorCode.GENERAL_001, "目录父级不存在");
            }
            Set<String> visited = new java.util.HashSet<>();
            String cursor = clientId;
            while (cursor != null) {
                if (!visited.add(cursor)) throw new BusinessException(ErrorCode.GENERAL_001, "目录层级存在循环引用");
                DhrCompositionDirectoryRequest current = directoriesByClientId.get(cursor);
                cursor = current == null ? null : trimToNull(current.parentClientId());
            }
        }
        return directoriesByClientId;
    }

    private Map<Long, FormTemplateReference> validateCompositionItems(
            List<DhrCompositionItemRequest> requestedItems,
            Map<String, DhrCompositionDirectoryRequest> directoryByClientId,
            List<DhrTemplateItem> previousItems) {
        Map<Long, FormTemplateReference> formReferences = new HashMap<>();
        Set<String> referencedForms = new java.util.HashSet<>();
        Set<String> existingReferenceKeys = previousItems.stream()
                .filter(item -> item.getDirectoryId() != null && item.getFormTemplateVersionId() != null)
                .map(item -> item.getDirectoryId() + ":" + item.getFormTemplateVersionId())
                .collect(Collectors.toSet());
        for (DhrCompositionItemRequest item : requestedItems) {
            if (item == null) throw new BusinessException(ErrorCode.GENERAL_001, "表单引用数据不能为空");
            String directoryClientId = requireName(item.directoryClientId(), "表单引用缺少所属目录");
            if (!directoryByClientId.containsKey(directoryClientId)) {
                throw new BusinessException(ErrorCode.GENERAL_001, "表单引用缺少所属目录");
            }
            boolean isExistingReference = existingReferenceKeys.contains(directoryClientId + ":" + item.formTemplateVersionId());
            FormTemplateReference reference = resolveFormTemplateReference(item.formTemplateVersionId(), isExistingReference);
            String duplicateKey = directoryClientId + ":" + reference.template().getId();
            if (!referencedForms.add(duplicateKey)) {
                throw new BusinessException(ErrorCode.GENERAL_001, "同一目录不能重复引用同一表单");
            }
            formReferences.put(reference.version().getId(), reference);
        }
        return formReferences;
    }

    private Map<String, DhrDirectory> saveCompositionDirectories(
            Long versionId,
            List<DhrCompositionDirectoryRequest> requestedDirectories,
            Map<String, DhrCompositionDirectoryRequest> directoriesByClientId) {
        Map<String, DhrDirectory> savedDirectories = new LinkedHashMap<>();
        List<DhrCompositionDirectoryRequest> pendingDirectories = new ArrayList<>(requestedDirectories);
        while (!pendingDirectories.isEmpty()) {
            int nextIndex = -1;
            for (int index = 0; index < pendingDirectories.size(); index++) {
                String parentClientId = trimToNull(pendingDirectories.get(index).parentClientId());
                if (parentClientId == null || savedDirectories.containsKey(parentClientId)) {
                    nextIndex = index;
                    break;
                }
            }
            if (nextIndex < 0) throw new BusinessException(ErrorCode.GENERAL_001, "目录层级存在循环引用");
            DhrCompositionDirectoryRequest requestedDirectory = pendingDirectories.remove(nextIndex);
            String clientId = requestedDirectory.clientId().trim();
            String parentClientId = trimToNull(requestedDirectory.parentClientId());
            DhrDirectory savedDirectory = dhrDirectoryRepository.save(DhrDirectory.builder()
                    .id(idGenerator.nextId())
                    .versionId(versionId)
                    .name(requestedDirectory.name().trim())
                    .parentId(parentClientId == null ? null : savedDirectories.get(parentClientId).getId())
                    .sortOrder(requestedDirectory.sortOrder() == null ? (savedDirectories.size() + 1) * 10 : requestedDirectory.sortOrder())
                    .createdAt(LocalDateTime.now())
                    .build());
            savedDirectories.put(clientId, savedDirectory);
        }
        return savedDirectories;
    }

    private List<DhrTemplateItem> saveCompositionItems(
            List<DhrCompositionItemRequest> requestedItems,
            Map<String, DhrDirectory> savedDirectoriesByClientId,
            Map<Long, FormTemplateReference> formReferences) {
        List<DhrTemplateItem> savedItems = new ArrayList<>();
        for (int index = 0; index < requestedItems.size(); index++) {
            DhrCompositionItemRequest requestedItem = requestedItems.get(index);
            DhrDirectory directory = savedDirectoriesByClientId.get(requestedItem.directoryClientId().trim());
            FormTemplateReference reference = formReferences.get(requestedItem.formTemplateVersionId());
            if (directory == null || reference == null) throw new BusinessException(ErrorCode.GENERAL_001, "表单引用保存失败");
            savedItems.add(dhrTemplateItemRepository.save(DhrTemplateItem.builder()
                    .id(idGenerator.nextId())
                    .directoryId(directory.getId())
                    .formTemplateId(reference.template().getId())
                    .formTemplateVersionId(reference.version().getId())
                    .displayName(trimToNull(requestedItem.displayName()))
                    .sortOrder(requestedItem.sortOrder() == null ? (index + 1) * 10 : requestedItem.sortOrder())
                    .isRequired(requestedItem.isRequired() == null || requestedItem.isRequired())
                    .createdAt(LocalDateTime.now())
                    .build()));
        }
        return savedItems;
    }

    private FormTemplateReference resolveActiveFormTemplateReference(Long formTemplateVersionId) {
        return resolveFormTemplateReference(formTemplateVersionId, false);
    }

    private FormTemplateReference resolveFormTemplateReference(Long formTemplateVersionId, boolean allowExistingInactiveReference) {
        if (formTemplateVersionId == null) throw new BusinessException(ErrorCode.GENERAL_001, "请选择表单模板版本");
        FormTemplateVersion formVersion = formTemplateVersionRepository.findById(formTemplateVersionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "表单模板版本不存在"));
        Long formTemplateId = formVersion.getTemplateId();
        FormTemplate formTemplate = formTemplateId == null ? null : formTemplateRepository.findById(formTemplateId).orElse(null);
        if (formTemplate == null) throw new BusinessException(ErrorCode.GENERAL_001, "表单模板不存在");
        if (!allowExistingInactiveReference
                && !RdoVersionStatusResolver.isReferenceable(formVersion.getEffectiveFrom(), formVersion.getEffectiveTo())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "仅能引用生效中的表单模板版本");
        }
        return new FormTemplateReference(formTemplate, formVersion);
    }

    private String resolveVersionLabel(String value, int fallbackVersionNumber) {
        String versionLabel = trimToNull(value);
        return versionLabel == null ? "V" + fallbackVersionNumber + ".0" : requireVersionLabel(versionLabel);
    }

    private String requireVersionLabel(String value) {
        String versionLabel = requireName(value, "版本号不能为空");
        if (versionLabel.length() > 64) throw new BusinessException(ErrorCode.GENERAL_001, "版本号不能超过 64 个字符");
        return versionLabel;
    }

    private String normalizeVersionCode(String value) {
        String code = trimToNull(value);
        if (code != null && code.length() > 64) throw new BusinessException(ErrorCode.GENERAL_001, "模板编码不能超过 64 个字符");
        return code;
    }

    private String normalizeOfflineVersion(String value) {
        String offlineVersion = trimToNull(value);
        if (offlineVersion != null && offlineVersion.length() > 20) throw new BusinessException(ErrorCode.GENERAL_001, "线下版本不能超过 20 个字符");
        return offlineVersion;
    }

    private void ensureVersionLabelAvailable(Long templateId, String versionLabel, Long excludedVersionId) {
        boolean exists = dhrTemplateVersionRepository.findByDhrTemplateIdAndVersionLabelIgnoreCase(templateId, versionLabel).stream()
                .anyMatch(version -> !Objects.equals(version.getId(), excludedVersionId));
        if (exists) throw new BusinessException(ErrorCode.GENERAL_001, "版本号已存在");
    }

    private void ensureVersionCodeAvailable(String code, Long excludedVersionId) {
        if (!StringUtils.hasText(code)) return;
        boolean exists = dhrTemplateVersionRepository.findByCodeIgnoreCase(code).stream()
                .anyMatch(version -> !Objects.equals(version.getId(), excludedVersionId));
        if (exists) throw new BusinessException(ErrorCode.GENERAL_001, "模板编码已存在");
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
                .displayName(source.getDisplayName())
                .sortOrder(source.getSortOrder())
                .isRequired(source.getIsRequired())
                .createdAt(LocalDateTime.now())
                .build()));
    }

    private void validateEffectiveDateRange(DhrVersionRequest request) {
        if (request == null) return;
        LocalDateTime effectiveFrom = parseDateTime(request.effectiveFrom());
        LocalDateTime effectiveTo = parseDateTime(request.effectiveTo());
        if (effectiveFrom != null && effectiveTo != null && effectiveTo.isBefore(effectiveFrom)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "失效时间不能早于生效时间");
        }
    }

    private void validateVersionCanBePublished(DhrTemplateVersion version) {
        LocalDateTime now = LocalDateTime.now();
        if (version.getEffectiveTo() != null && !now.isBefore(version.getEffectiveTo())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "版本已失效，无法发布");
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

    private DhrFormTemplateOption toFormOption(FormTemplate template) {
        List<FormTemplateVersion> versions = orEmpty(formTemplateVersionRepository.findByTemplateIdOrderByCreatedAtDesc(template.getId()));
        List<String> versionStatuses = versions.stream()
                .map(version -> RdoVersionStatusResolver.resolve(version.getEffectiveFrom(), version.getEffectiveTo()))
                .toList();
        return new DhrFormTemplateOption(
                String.valueOf(template.getId()),
                template.getCode(),
                template.getName(),
                template.getCategoryName(),
                RdoVersionStatusResolver.resolveAggregate(versionStatuses),
                template.getUpdatedBy(),
                formatDateTime(template.getUpdatedAt()),
                versions.stream().map(version -> {
                    String versionStatus = RdoVersionStatusResolver.resolve(version.getEffectiveFrom(), version.getEffectiveTo());
                    boolean referenceable = ACTIVE.equals(versionStatus);
                    return new DhrFormTemplateVersionOption(
                            String.valueOf(version.getId()),
                            version.getVersion(),
                            versionStatus,
                            referenceable);
                }).toList());
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
                item.getDisplayName(),
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
                version.getCode(),
                version.getOfflineVersion(),
                version.getDescription(),
                formatDateTime(version.getEffectiveFrom()),
                formatDateTime(version.getEffectiveTo()),
                DhrTemplateVersionStatusResolver.resolveVersionStatus(version),
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
        String label = trimToNull(version.getVersionLabel());
        return label == null ? "V" + (version.getVersionNumber() == null ? 1 : version.getVersionNumber()) + ".0" : label;
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

    private Map<String, Object> compositionSnapshot(List<DhrDirectory> directories, List<DhrTemplateItem> items) {
        Map<Long, List<DhrTemplateItem>> itemsByDirectory = items.stream()
                .collect(Collectors.groupingBy(DhrTemplateItem::getDirectoryId, LinkedHashMap::new, Collectors.toList()));
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("directories", directories.stream().map(directory -> {
            Map<String, Object> directorySnapshot = new LinkedHashMap<>();
            directorySnapshot.put("directoryId", directory.getId());
            directorySnapshot.put("parentId", directory.getParentId());
            directorySnapshot.put("directoryName", directory.getName());
            directorySnapshot.put("sortOrder", directory.getSortOrder());
            directorySnapshot.put("items", itemsByDirectory.getOrDefault(directory.getId(), List.of()).stream().map(item -> {
                Map<String, Object> itemSnapshot = new LinkedHashMap<>();
                itemSnapshot.put("formTemplateId", item.getFormTemplateId());
                itemSnapshot.put("formTemplateVersionId", item.getFormTemplateVersionId());
                itemSnapshot.put("displayName", item.getDisplayName());
                itemSnapshot.put("required", item.getIsRequired());
                itemSnapshot.put("sortOrder", item.getSortOrder());
                return itemSnapshot;
            }).toList());
            return directorySnapshot;
        }).toList());
        return snapshot;
    }

    private Map<String, Object> versionSnapshot(DhrTemplateVersion version) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("version", versionLabel(version));
        snapshot.put("code", version.getCode());
        snapshot.put("offlineVersion", version.getOfflineVersion());
        snapshot.put("description", version.getDescription());
        snapshot.put("effectiveFrom", formatDateTime(version.getEffectiveFrom()));
        snapshot.put("effectiveTo", formatDateTime(version.getEffectiveTo()));
        snapshot.put("status", RdoVersionStatusResolver.resolve(version.getEffectiveFrom(), version.getEffectiveTo()));
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
        FormTemplate formTemplate = item.getFormTemplateId() == null
                ? null
                : formTemplateRepository.findById(item.getFormTemplateId()).orElse(null);
        FormTemplateVersion formVersion = item.getFormTemplateVersionId() == null
                ? null
                : formTemplateVersionRepository.findById(item.getFormTemplateVersionId()).orElse(null);
        return evidenceSnapshot(
                item,
                formTemplate == null ? Map.of() : Map.of(formTemplate.getId(), formTemplate),
                formVersion == null ? Map.of() : Map.of(formVersion.getId(), formVersion));
    }

    private Map<String, Object> evidenceSnapshot(DhrTemplateItem item, Map<Long, FormTemplate> formTemplates, Map<Long, FormTemplateVersion> formVersions) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("directoryId", item.getDirectoryId());
        if (item.getDirectoryId() != null) {
            dhrDirectoryRepository.findById(item.getDirectoryId())
                    .ifPresent(directory -> snapshot.put("directoryName", directory.getName()));
        }
        snapshot.put("formTemplateId", item.getFormTemplateId());
        snapshot.put("formTemplateVersionId", item.getFormTemplateVersionId());
        FormTemplate formTemplate = formTemplates.get(item.getFormTemplateId());
        FormTemplateVersion formVersion = formVersions.get(item.getFormTemplateVersionId());
        if (formTemplate != null) {
            snapshot.put("formCode", formTemplate.getCode());
            snapshot.put("formName", formTemplate.getName());
        }
        if (formVersion != null) snapshot.put("formVersion", formVersion.getVersion());
        snapshot.put("displayName", item.getDisplayName());
        snapshot.put("required", item.getIsRequired());
        snapshot.put("sortOrder", item.getSortOrder());
        return snapshot;
    }

    private boolean writeChangedAudit(String entityType, Long entityId, String functionName, Map<String, Object> before, Map<String, Object> after) {
        Map<String, Object> changedBefore = new LinkedHashMap<>();
        Map<String, Object> changedAfter = new LinkedHashMap<>();
        before.forEach((field, beforeValue) -> {
            Object afterValue = after.get(field);
            if (!Objects.equals(beforeValue, afterValue)) {
                changedBefore.put(field, beforeValue);
                changedAfter.put(field, afterValue);
            }
        });
        if (changedBefore.isEmpty()) return false;
        writeAudit(entityType, entityId, "UPDATE", functionName, changedBefore, changedAfter);
        return true;
    }

    private void writeVersionActivityAudit(
            DhrTemplateVersion version,
            String action,
            String functionName,
            String modelingType,
            Map<String, Object> before,
            Map<String, Object> after) {
        writeAudit(
                "DHR_TEMPLATE_VERSION",
                version.getId(),
                action,
                functionName,
                versionActivitySnapshot(version, modelingType, before),
                versionActivitySnapshot(version, modelingType, after));
    }

    private Map<String, Object> versionActivitySnapshot(DhrTemplateVersion version, String modelingType, Map<String, Object> details) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("version", versionLabel(version));
        snapshot.put("code", version.getCode());
        snapshot.put("offlineVersion", version.getOfflineVersion());
        if (!details.isEmpty()) {
            Map<String, Object> modelingChange = new LinkedHashMap<>();
            modelingChange.put("type", modelingType);
            modelingChange.put("details", details);
            snapshot.put("modelingChange", modelingChange);
        }
        return snapshot;
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
                    return LocalDateTime.parse(trimmed, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
                } catch (DateTimeParseException e) {
                    throw new BusinessException(ErrorCode.GENERAL_001, "时间格式应为 yyyy-MM-dd HH:mm:ss");
                }
            }
        }
    }

    private String currentOperatorName() {
        if (StringUtils.hasText(AuditContext.getOperatorName())) return AuditContext.getOperatorName();
        if (StringUtils.hasText(AuditContext.getOperatorAccount())) return AuditContext.getOperatorAccount();
        return "系统管理员";
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
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

    public record DhrVersionRequest(Long sourceVersionId, String version, String code, String offlineVersion, String description, String effectiveFrom, String effectiveTo) {
        public DhrVersionRequest(Long sourceVersionId) {
            this(sourceVersionId, null, null, null, null, null, null);
        }

        public DhrVersionRequest(Long sourceVersionId, String description) {
            this(sourceVersionId, null, null, null, description, null, null);
        }

        public DhrVersionRequest(Long sourceVersionId, String description, String effectiveFrom, String effectiveTo) {
            this(sourceVersionId, null, null, null, description, effectiveFrom, effectiveTo);
        }
    }

    public record DhrDirectoryRequest(String name, Long parentId) {
    }

    public record DhrEvidenceItemRequest(Long formTemplateVersionId, Boolean isRequired, String displayName) {
        public DhrEvidenceItemRequest(Long formTemplateVersionId, Boolean isRequired) {
            this(formTemplateVersionId, isRequired, null);
        }
    }

    public record DhrEvidenceItemUpdateRequest(Boolean isRequired, String displayName) {
        public DhrEvidenceItemUpdateRequest(Boolean isRequired) {
            this(isRequired, null);
        }
    }

    public record DhrCompositionRequest(
            List<DhrCompositionDirectoryRequest> directories,
            List<DhrCompositionItemRequest> items) {
    }

    public record DhrCompositionDirectoryRequest(String clientId, String parentClientId, String name, Integer sortOrder) {
    }

    public record DhrCompositionItemRequest(
            String directoryClientId,
            Long formTemplateVersionId,
            String displayName,
            Boolean isRequired,
            Integer sortOrder) {
    }

    public record DhrTemplateWorkspaceResponse(String templateId, String templateCode, String templateName, List<DhrVersionResponse> versions) {
    }

    public record DhrTemplateCompositionResponse(DhrVersionResponse version, List<DhrDirectoryResponse> directories, List<DhrEvidenceItemResponse> items) {
    }

    public record DhrVersionResponse(String id, String version, String code, String offlineVersion, String description, String effectiveFrom, String effectiveTo, String status, String createdAt, int directoryCount, int evidenceCount) {
    }

    public record DhrDirectoryResponse(String id, String parentId, String name, int sortOrder) {
    }

    public record DhrEvidenceItemResponse(String id, String directoryId, String formTemplateId, String formTemplateVersionId, String formCode, String formName, String formVersion, String displayName, boolean isRequired, int sortOrder) {
    }

    public record DhrFormTemplateOption(
            String templateId,
            String code,
            String name,
            String categoryName,
            String status,
            String updatedBy,
            String updatedAt,
            List<DhrFormTemplateVersionOption> versions) {
    }

    public record DhrFormTemplateVersionOption(
            String versionId,
            String version,
            String status,
            boolean referenceable) {
    }

    private record FormTemplateReference(FormTemplate template, FormTemplateVersion version) {
    }
}
