package com.zencas.edhr.system.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import com.zencas.edhr.system.entity.IconAsset;
import com.zencas.edhr.system.entity.IconGroup;
import com.zencas.edhr.system.repository.IconAssetRepository;
import com.zencas.edhr.system.repository.IconGroupRepository;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1/system")
@RequiredArgsConstructor
public class IconManagementController {

    private static final String TENANT_ID = "default";
    private static final String BUILTIN_SOURCE = "BUILTIN";
    private static final String BUILTIN_GROUP_NAME = "系统内置图标";
    private static final String BUILTIN_DELETE_MESSAGE = "系统内置图标不能删除";
    private static final String BUILTIN_GROUP_NAME_CONFLICT_MESSAGE = "系统内置图标分组已存在，不能创建同名分组";
    private static final String BUILTIN_GROUP_MOVE_MESSAGE = "系统内置图标分组不能放入自定义图标";
    private static final long ICON_MAX_FILE_SIZE = 2L * 1024 * 1024;
    private static final List<String> ICON_MIME_TYPES = List.of(
            "image/svg+xml", "image/png", "image/jpeg", "image/gif", "image/webp");
    private static final ObjectMapper AUDIT_OBJECT_MAPPER = new ObjectMapper();

    private final IconGroupRepository iconGroupRepository;
    private final IconAssetRepository iconAssetRepository;
    private final FileObjectRepository fileObjectRepository;
    private final AuditEventRepository auditEventRepository;
    private final SnowflakeIdGenerator idGenerator;

    @Value("${edhr.file.storage-path:#{systemProperties['user.home'] + '/.edhr/files'}}")
    private String storagePath;

    @GetMapping("/icon-groups")
    public ApiResponse<List<IconGroupResponse>> listGroups() {
        List<IconGroup> groups = iconGroupRepository.findByTenantIdOrderBySortOrderAscCreatedAtAsc(TENANT_ID);
        List<Long> groupIds = groups.stream().map(IconGroup::getId).filter(Objects::nonNull).toList();
        Map<Long, Long> iconCounts = iconAssetRepository.countByGroupIdIn(groupIds).stream()
                .collect(java.util.stream.Collectors.toMap(
                        IconAssetRepository.GroupIconCount::groupId,
                        IconAssetRepository.GroupIconCount::iconCount));
        return ApiResponse.success(groups.stream()
                .map(group -> IconGroupResponse.from(group, iconCounts.getOrDefault(group.getId(), 0L)))
                .toList());
    }

    @PostMapping("/icon-groups")
    @Transactional
    public ApiResponse<IconGroupResponse> createGroup(@RequestBody GroupRequest request) {
        String name = requireText(request == null ? null : request.name(), "分组名称不能为空");
        ensureCustomGroupName(name);
        IconGroup group = IconGroup.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .name(name)
                .sortOrder(request == null || request.sortOrder() == null ? 0 : request.sortOrder())
                .createdBy(AuditContext.getOperatorId())
                .build();
        IconGroup saved = iconGroupRepository.save(group);
        writeAudit("ICON_GROUP", saved.getId(), "CREATE", Map.of(), groupSnapshot(saved));
        return ApiResponse.success(IconGroupResponse.from(saved, 0));
    }

    @PutMapping("/icon-groups/{id}")
    @Transactional
    public ApiResponse<IconGroupResponse> updateGroup(@PathVariable Long id, @RequestBody GroupRequest request) {
        IconGroup existing = iconGroupRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "图标分组不存在"));
        if (isBuiltinGroup(existing)) {
            throw new BusinessException(ErrorCode.GENERAL_003, "系统内置图标分组不能重命名");
        }
        String name = requireText(request == null ? null : request.name(), "分组名称不能为空");
        ensureCustomGroupName(name);
        Map<String, Object> before = groupSnapshot(existing);
        existing.setName(name);
        if (request != null && request.sortOrder() != null) existing.setSortOrder(request.sortOrder());
        existing.setUpdatedBy(AuditContext.getOperatorId());
        IconGroup saved = iconGroupRepository.save(existing);
        writeAudit("ICON_GROUP", id, "UPDATE", before, groupSnapshot(saved));
        long iconCount = iconAssetRepository.countByGroupIdIn(List.of(saved.getId()))
                .stream()
                .findFirst()
                .map(IconAssetRepository.GroupIconCount::iconCount)
                .orElse(0L);
        return ApiResponse.success(IconGroupResponse.from(saved, iconCount));
    }

    @DeleteMapping("/icon-groups/{id}")
    @Transactional
    public ApiResponse<Void> deleteGroup(@PathVariable Long id) {
        IconGroup existing = iconGroupRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "图标分组不存在"));
        if (isBuiltinGroup(existing)) {
            throw new BusinessException(ErrorCode.GENERAL_003, "系统内置图标分组不能删除");
        }
        if (iconAssetRepository.existsByGroupId(id)) {
            throw new BusinessException(ErrorCode.GENERAL_003, "分组下存在图标，不能删除");
        }
        iconGroupRepository.deleteById(id);
        writeAudit("ICON_GROUP", id, "DELETE", groupSnapshot(existing), Map.of());
        return ApiResponse.success(null);
    }

    @PutMapping("/icon-groups/order")
    @Transactional
    public ApiResponse<List<IconGroupResponse>> reorderGroups(@RequestBody OrderRequest request) {
        List<Long> ids = requireIds(request == null ? null : request.ids());
        List<IconGroup> groups = iconGroupRepository.findAllById(ids);
        Map<String, Object> before = Map.of("groups", groups.stream().map(this::groupSnapshot).toList());
        List<IconGroup> ordered = orderByIds(groups, ids);
        for (int i = 0; i < ordered.size(); i++) {
            ordered.get(i).setSortOrder(i + 1);
            ordered.get(i).setUpdatedBy(AuditContext.getOperatorId());
        }
        iconGroupRepository.saveAll(ordered);
        writeAudit("ICON_GROUP", null, "REORDER", before,
                Map.of("groups", ordered.stream().map(this::groupSnapshot).toList()));
        Map<Long, Long> iconCounts = iconAssetRepository.countByGroupIdIn(ids).stream()
                .collect(java.util.stream.Collectors.toMap(
                        IconAssetRepository.GroupIconCount::groupId,
                        IconAssetRepository.GroupIconCount::iconCount));
        return ApiResponse.success(ordered.stream()
                .map(group -> IconGroupResponse.from(group, iconCounts.getOrDefault(group.getId(), 0L)))
                .toList());
    }

    @GetMapping("/icons")
    public ApiResponse<PageResult<IconAssetResponse>> listIcons(
            @RequestParam(value = "groupId", required = false) Long groupId,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "60") int size) {
        PageRequest pageable = PageRequest.of(
                Math.max(page - 1, 0),
                Math.max(size, 1),
                Sort.by(Sort.Direction.ASC, "sortOrder").and(Sort.by(Sort.Direction.DESC, "createdAt")));
        Specification<IconAsset> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("tenantId"), TENANT_ID));
            if (groupId != null) predicates.add(cb.equal(root.get("groupId"), groupId));
            if (StringUtils.hasText(keyword)) {
                String like = "%" + keyword.trim() + "%";
                predicates.add(cb.or(cb.like(root.get("name"), like), cb.like(root.get("tags"), like)));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        Page<IconAsset> result = iconAssetRepository.findAll(spec, pageable);
        List<IconAssetResponse> content = result.getContent().stream().map(IconAssetResponse::from).toList();
        return ApiResponse.success(PageResult.of(content, page, size, result.getTotalElements()));
    }

    @PostMapping("/icons/upload")
    @Transactional
    public ApiResponse<IconAssetResponse> uploadIcon(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "groupId", required = false) Long groupId,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "tags", required = false) String tags) throws IOException {
        ensureCustomIconTargetGroup(groupId);
        FileObject fileObject = storeFile(file, "ICON_ASSET", ICON_MIME_TYPES, ICON_MAX_FILE_SIZE);
        IconAsset icon = createIconMetadata(fileObject, groupId, name, tags, "UPLOAD");
        writeAudit("ICON_ASSET", icon.getId(), "CREATE", Map.of(), iconSnapshot(icon));
        return ApiResponse.success(IconAssetResponse.from(icon));
    }

    @PostMapping("/icons/import")
    @Transactional
    public ApiResponse<List<IconAssetResponse>> importIcons(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "groupId", required = false) Long groupId) throws IOException {
        if (files == null || files.isEmpty()) {
            throw new BusinessException(ErrorCode.GENERAL_001, "导入图标不能为空");
        }
        ensureCustomIconTargetGroup(groupId);
        List<IconAsset> saved = new ArrayList<>();
        for (MultipartFile file : files) {
            FileObject fileObject = storeFile(file, "ICON_ASSET", ICON_MIME_TYPES, ICON_MAX_FILE_SIZE);
            saved.add(createIconMetadata(fileObject, groupId, null, null, "IMPORT"));
        }
        writeAudit("ICON_ASSET", null, "IMPORT", Map.of(),
                Map.of("icons", saved.stream().map(this::iconSnapshot).toList()));
        return ApiResponse.success(saved.stream().map(IconAssetResponse::from).toList());
    }

    @PutMapping("/icons/{id}")
    @Transactional
    public ApiResponse<IconAssetResponse> updateIcon(@PathVariable Long id, @RequestBody JsonNode request) {
        IconAsset existing = iconAssetRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "图标不存在"));
        Map<String, Object> before = iconSnapshot(existing);
        if (hasField(request, "groupId")) {
            Long nextGroupId = nullableLong(request.get("groupId"));
            ensureIconCanMove(existing, nextGroupId);
            existing.setGroupId(nextGroupId);
        }
        if (hasField(request, "name") && StringUtils.hasText(request.get("name").asText())) {
            existing.setName(request.get("name").asText().trim());
        }
        if (hasField(request, "tags")) existing.setTags(nullableText(request.get("tags")));
        if (hasField(request, "sortOrder") && !request.get("sortOrder").isNull()) {
            existing.setSortOrder(request.get("sortOrder").asInt());
        }
        existing.setUpdatedBy(AuditContext.getOperatorId());
        IconAsset saved = iconAssetRepository.save(existing);
        String action = !Objects.equals(before.get("groupId"), saved.getGroupId()) ? "MOVE" : "UPDATE";
        writeAudit("ICON_ASSET", id, action, before, iconSnapshot(saved));
        return ApiResponse.success(IconAssetResponse.from(saved));
    }

    @DeleteMapping("/icons/{id}")
    @Transactional
    public ApiResponse<Void> deleteIcon(@PathVariable Long id) {
        IconAsset existing = iconAssetRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "图标不存在"));
        ensureNotBuiltin(existing);
        iconAssetRepository.deleteById(id);
        cleanupFiles(List.of(existing.getFileId()));
        writeAudit("ICON_ASSET", id, "DELETE", iconSnapshot(existing), Map.of());
        return ApiResponse.success(null);
    }

    @PostMapping("/icons/batch-delete")
    @Transactional
    public ApiResponse<Void> batchDeleteIcons(@RequestBody BatchDeleteRequest request) {
        List<Long> ids = requireIds(request == null ? null : request.ids());
        List<IconAsset> icons = iconAssetRepository.findAllById(ids);
        if (icons.stream().anyMatch(this::isBuiltinIcon)) {
            throw new BusinessException(ErrorCode.GENERAL_003, BUILTIN_DELETE_MESSAGE);
        }
        List<Long> fileIds = icons.stream().map(IconAsset::getFileId).filter(Objects::nonNull).distinct().toList();
        iconAssetRepository.deleteAll(icons);
        cleanupFiles(fileIds);
        writeAudit("ICON_ASSET", null, "BATCH_DELETE",
                Map.of("deletedIcons", icons.stream().map(this::iconSnapshot).toList()), Map.of());
        return ApiResponse.success(null);
    }

    @PutMapping("/icons/order")
    @Transactional
    public ApiResponse<List<IconAssetResponse>> reorderIcons(@RequestBody IconOrderRequest request) {
        List<Long> ids = requireIds(request == null ? null : request.ids());
        List<IconAsset> icons = iconAssetRepository.findAllById(ids);
        if (icons.stream().anyMatch(this::isBuiltinIcon)) {
            throw new BusinessException(ErrorCode.GENERAL_003, "系统内置图标不能移动");
        }
        if (isBuiltinGroupId(request.groupId())) {
            throw new BusinessException(ErrorCode.GENERAL_003, "系统内置图标分组不能放入自定义图标");
        }
        Map<String, Object> before = Map.of("icons", icons.stream().map(this::iconSnapshot).toList());
        List<IconAsset> ordered = orderByIds(icons, ids);
        for (int i = 0; i < ordered.size(); i++) {
            ordered.get(i).setGroupId(request.groupId());
            ordered.get(i).setSortOrder(i + 1);
            ordered.get(i).setUpdatedBy(AuditContext.getOperatorId());
        }
        iconAssetRepository.saveAll(ordered);
        writeAudit("ICON_ASSET", null, "REORDER", before,
                Map.of("icons", ordered.stream().map(this::iconSnapshot).toList()));
        return ApiResponse.success(ordered.stream().map(IconAssetResponse::from).toList());
    }

    private IconAsset createIconMetadata(FileObject fileObject, Long groupId, String name, String tags, String source) {
        String iconName = StringUtils.hasText(name) ? name.trim() : stripExtension(fileObject.getOriginalName());
        IconAsset icon = IconAsset.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .groupId(groupId)
                .fileId(fileObject.getId())
                .name(requireText(iconName, "图标名称不能为空"))
                .tags(tags)
                .source(source)
                .sortOrder(0)
                .createdBy(AuditContext.getOperatorId())
                .build();
        return iconAssetRepository.save(icon);
    }

    private FileObject storeFile(MultipartFile file, String targetType, List<String> allowedTypes, long maxSize) throws IOException {
        if (file == null || file.isEmpty()) throw new BusinessException(ErrorCode.GENERAL_001, "上传文件不能为空");
        if (file.getSize() > maxSize) throw new BusinessException(ErrorCode.FILE_002, "文件大小超出限制");
        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new BusinessException(ErrorCode.FILE_003, "不支持的文件类型: " + contentType);
        }
        Long fileId = idGenerator.nextId();
        Path storageDir = resolveStoragePath();
        Files.createDirectories(storageDir);
        Path targetPath = storageDir.resolve(fileId + "_" + sanitizeFileName(file.getOriginalFilename()));
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        FileObject fileObject = FileObject.builder()
                .id(fileId)
                .tenantId(TENANT_ID)
                .originalName(file.getOriginalFilename())
                .storedPath(targetPath.toString())
                .mimeType(contentType)
                .fileSize(file.getSize())
                .md5Hash(computeMd5(file.getInputStream()))
                .targetType(targetType)
                .uploadedBy(AuditContext.getOperatorId())
                .createdAt(LocalDateTime.now())
                .build();
        fileObjectRepository.save(fileObject);
        return fileObject;
    }

    private void cleanupFiles(List<Long> fileIds) {
        if (fileIds == null || fileIds.isEmpty()) return;
        List<FileObject> files = fileObjectRepository.findAllById(fileIds);
        files.forEach(file -> {
            try {
                if (StringUtils.hasText(file.getStoredPath())) Files.deleteIfExists(Path.of(file.getStoredPath()));
            } catch (IOException ignored) {
            }
        });
        fileObjectRepository.deleteAllById(fileIds);
    }

    private <T> List<T> orderByIds(List<T> items, List<Long> ids) {
        Map<Long, T> byId = new LinkedHashMap<>();
        for (T item : items) {
            Long id = item instanceof IconGroup group ? group.getId() : ((IconAsset) item).getId();
            byId.put(id, item);
        }
        return ids.stream().map(byId::get).filter(Objects::nonNull).toList();
    }

    private List<Long> requireIds(List<Long> ids) {
        if (ids == null || ids.stream().filter(Objects::nonNull).toList().isEmpty()) {
            throw new BusinessException(ErrorCode.GENERAL_001, "请选择数据");
        }
        return ids.stream().filter(Objects::nonNull).distinct().toList();
    }

    private String requireText(String value, String message) {
        if (!StringUtils.hasText(value)) throw new BusinessException(ErrorCode.GENERAL_001, message);
        return value.trim();
    }

    private boolean hasField(JsonNode request, String fieldName) {
        return request != null && request.has(fieldName);
    }

    private Long nullableLong(JsonNode node) {
        return node == null || node.isNull() ? null : node.asLong();
    }

    private String nullableText(JsonNode node) {
        return node == null || node.isNull() ? null : node.asText();
    }

    private Map<String, Object> groupSnapshot(IconGroup group) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("id", group.getId());
        snapshot.put("name", group.getName());
        snapshot.put("sortOrder", group.getSortOrder());
        return snapshot;
    }

    private Map<String, Object> iconSnapshot(IconAsset icon) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("id", icon.getId());
        snapshot.put("groupId", icon.getGroupId());
        snapshot.put("fileId", icon.getFileId());
        snapshot.put("builtinKey", icon.getBuiltinKey());
        snapshot.put("name", icon.getName());
        snapshot.put("tags", icon.getTags());
        snapshot.put("source", icon.getSource());
        snapshot.put("sortOrder", icon.getSortOrder());
        return snapshot;
    }

    private void ensureNotBuiltin(IconAsset icon) {
        if (isBuiltinIcon(icon)) {
            throw new BusinessException(ErrorCode.GENERAL_003, BUILTIN_DELETE_MESSAGE);
        }
    }

    private void ensureIconCanMove(IconAsset icon, Long nextGroupId) {
        if (Objects.equals(icon.getGroupId(), nextGroupId)) return;
        if (isBuiltinIcon(icon)) {
            throw new BusinessException(ErrorCode.GENERAL_003, "系统内置图标不能移动");
        }
        if (isBuiltinGroupId(nextGroupId)) {
            throw new BusinessException(ErrorCode.GENERAL_003, BUILTIN_GROUP_MOVE_MESSAGE);
        }
    }

    private void ensureCustomIconTargetGroup(Long groupId) {
        if (isBuiltinGroupId(groupId)) {
            throw new BusinessException(ErrorCode.GENERAL_003, BUILTIN_GROUP_MOVE_MESSAGE);
        }
    }

    private void ensureCustomGroupName(String name) {
        if (BUILTIN_GROUP_NAME.equals(name)) {
            throw new BusinessException(ErrorCode.GENERAL_003, BUILTIN_GROUP_NAME_CONFLICT_MESSAGE);
        }
    }

    private boolean isBuiltinGroupId(Long groupId) {
        if (groupId == null) return false;
        return iconGroupRepository.findById(groupId).map(this::isBuiltinGroup).orElse(false);
    }

    private boolean isBuiltinGroup(IconGroup group) {
        return group != null && Boolean.TRUE.equals(group.getBuiltin());
    }

    private boolean isBuiltinIcon(IconAsset icon) {
        return icon != null && BUILTIN_SOURCE.equals(icon.getSource());
    }

    private void writeAudit(String entityType, Long entityId, String action, Map<String, Object> before, Map<String, Object> after) {
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
                .source(AuditContext.getSource())
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

    private Path resolveStoragePath() {
        String path = StringUtils.hasText(storagePath)
                ? storagePath
                : System.getProperty("java.io.tmpdir") + "/edhr-files";
        return Path.of(path);
    }

    private String sanitizeFileName(String name) {
        if (name == null) return "unnamed";
        return name.replaceAll("[^a-zA-Z0-9._\\-\\u4e00-\\u9fff]", "_");
    }

    private String stripExtension(String name) {
        if (!StringUtils.hasText(name)) return "unnamed";
        int dot = name.lastIndexOf('.');
        return dot > 0 ? name.substring(0, dot) : name;
    }

    private String computeMd5(InputStream inputStream) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) md.update(buffer, 0, bytesRead);
            return HexFormat.of().formatHex(md.digest());
        } catch (NoSuchAlgorithmException | IOException e) {
            return "";
        }
    }

    public record GroupRequest(String name, Integer sortOrder) {
    }

    public record IconGroupResponse(
            String id,
            String tenantId,
            String name,
            Integer sortOrder,
            boolean builtin,
            long iconCount,
            String createdBy,
            LocalDateTime createdAt,
            String updatedBy,
            LocalDateTime updatedAt) {
        private static IconGroupResponse from(IconGroup group, long iconCount) {
            return new IconGroupResponse(
                    String.valueOf(group.getId()),
                    group.getTenantId(),
                    group.getName(),
                    group.getSortOrder(),
                    isGroupBuiltin(group),
                    iconCount,
                    group.getCreatedBy(),
                    group.getCreatedAt(),
                    group.getUpdatedBy(),
                    group.getUpdatedAt());
        }

        private static boolean isGroupBuiltin(IconGroup group) {
            return Boolean.TRUE.equals(group.getBuiltin()) || BUILTIN_GROUP_NAME.equals(group.getName());
        }
    }

    public record IconAssetResponse(
            String id,
            String tenantId,
            String groupId,
            String fileId,
            String builtinKey,
            String name,
            String tags,
            String source,
            Integer sortOrder,
            String createdBy,
            LocalDateTime createdAt,
            String updatedBy,
            LocalDateTime updatedAt) {
        private static IconAssetResponse from(IconAsset icon) {
            return new IconAssetResponse(
                    String.valueOf(icon.getId()),
                    icon.getTenantId(),
                    icon.getGroupId() == null ? null : String.valueOf(icon.getGroupId()),
                    icon.getFileId() == null ? null : String.valueOf(icon.getFileId()),
                    icon.getBuiltinKey(),
                    icon.getName(),
                    icon.getTags(),
                    icon.getSource(),
                    icon.getSortOrder(),
                    icon.getCreatedBy(),
                    icon.getCreatedAt(),
                    icon.getUpdatedBy(),
                    icon.getUpdatedAt());
        }
    }

    public record OrderRequest(List<Long> ids) {
    }

    public record IconOrderRequest(Long groupId, List<Long> ids) {
    }

    public record BatchDeleteRequest(List<Long> ids) {
    }

}
