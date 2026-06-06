package com.zencas.edhr.compliance.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.FileObject;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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
import java.util.List;

/**
 * File management controller for upload/download/preview/delete/list operations.
 * Complies with GMP compliance requirement C-09 for file/attachment storage.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileController {

    private final FileObjectRepository fileObjectRepository;
    private final SnowflakeIdGenerator idGenerator;

    @Value("${edhr.file.storage-path:#{systemProperties['user.home'] + '/.edhr/files'}}")
    private String storagePath;

    /** Allowed MIME types for upload (whitelist). */
    private static final List<String> ALLOWED_MIME_TYPES = List.of(
            "application/pdf",
            "image/png", "image/jpeg", "image/gif",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/plain", "text/csv",
            "application/zip"
    );

    private static final long MAX_FILE_SIZE = 50L * 1024 * 1024; // 50 MB

    // ======================== Upload ========================

    /**
     * Upload a file and register it in the database.
     */
    @PostMapping("/upload")
    public ApiResponse<FileObject> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "targetType", required = false) String targetType,
            @RequestParam(value = "targetId", required = false) String targetId) throws IOException {

        if (file.isEmpty()) {
            throw new BusinessException(ErrorCode.GENERAL_001, "上传文件不能为空");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException(ErrorCode.FILE_002,
                    "文件大小超出限制: " + (file.getSize() / 1024 / 1024) + "MB (最大 50MB)");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType)) {
            throw new BusinessException(ErrorCode.FILE_003,
                    "不支持的文件类型: " + contentType);
        }

        // Compute MD5
        String md5Hash = computeMd5(file.getInputStream());

        // Ensure storage directory exists
        Path storageDir = Path.of(storagePath);
        Files.createDirectories(storageDir);

        // Generate stored name: {id}_{originalName}
        long fileId = idGenerator.nextId();
        String storedName = fileId + "_" + sanitizeFileName(file.getOriginalFilename());
        Path targetPath = storageDir.resolve(storedName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        FileObject fileObject = FileObject.builder()
                .id(fileId)
                .originalName(file.getOriginalFilename())
                .storedPath(targetPath.toString())
                .mimeType(contentType)
                .fileSize(file.getSize())
                .md5Hash(md5Hash)
                .targetType(targetType)
                .targetId(targetId)
                .uploadedBy(getCurrentOperatorId())
                .createdAt(LocalDateTime.now())
                .build();
        fileObjectRepository.save(fileObject);

        log.info("File uploaded: id={}, originalName={}, size={}", fileId,
                file.getOriginalFilename(), file.getSize());
        return ApiResponse.success(fileObject);
    }

    // ======================== Download ========================

    /**
     * Download a file as attachment (Content-Disposition: attachment).
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        FileObject fileObject = fileObjectRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.FILE_001));

        Path filePath = Path.of(fileObject.getStoredPath());
        if (!Files.exists(filePath)) {
            throw new BusinessException(ErrorCode.FILE_001, "文件物理存储丢失: " + id);
        }

        Resource resource = new FileSystemResource(filePath);
        String encodedName = encodeFileName(fileObject.getOriginalName());

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + encodedName + "\"; filename*=UTF-8''" + encodedName)
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(fileObject.getFileSize()))
                .body(resource);
    }

    // ======================== Preview ========================

    /**
     * Preview a file inline (Content-Disposition: inline).
     */
    @GetMapping("/{id}/preview")
    public ResponseEntity<Resource> preview(@PathVariable Long id) {
        FileObject fileObject = fileObjectRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.FILE_001));

        Path filePath = Path.of(fileObject.getStoredPath());
        if (!Files.exists(filePath)) {
            throw new BusinessException(ErrorCode.FILE_001, "文件物理存储丢失: " + id);
        }

        Resource resource = new FileSystemResource(filePath);
        MediaType mediaType = resolveMediaType(fileObject.getMimeType());

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + encodeFileName(fileObject.getOriginalName()) + "\"")
                .body(resource);
    }

    // ======================== Delete ========================

    /**
     * Delete a file (both DB record and physical storage).
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        FileObject fileObject = fileObjectRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.FILE_001));

        // Delete physical file
        try {
            Path filePath = Path.of(fileObject.getStoredPath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Failed to delete physical file: {}", fileObject.getStoredPath(), e);
        }

        fileObjectRepository.deleteById(id);
        log.info("File deleted: id={}, originalName={}", id, fileObject.getOriginalName());
        return ApiResponse.success(null);
    }

    // ======================== List ========================

    /**
     * List files with optional filtering by targetType and/or targetId.
     */
    @GetMapping
    public ApiResponse<PageResult<FileObject>> list(
            @RequestParam(value = "targetType", required = false) String targetType,
            @RequestParam(value = "targetId", required = false) String targetId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {

        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page - 1, size, Sort.by(direction, sort));

        Specification<FileObject> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (targetType != null && !targetType.isBlank()) {
                predicates.add(cb.equal(root.get("targetType"), targetType));
            }
            if (targetId != null && !targetId.isBlank()) {
                predicates.add(cb.equal(root.get("targetId"), targetId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<FileObject> result = fileObjectRepository.findAll(spec, pageable);
        return ApiResponse.success(PageResult.of(
                result.getContent(), page, size, result.getTotalElements()));
    }

    // ======================== Helpers ========================

    private String computeMd5(InputStream inputStream) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                md.update(buffer, 0, bytesRead);
            }
            return HexFormat.of().formatHex(md.digest());
        } catch (NoSuchAlgorithmException | IOException e) {
            log.error("MD5 computation failed", e);
            return "";
        }
    }

    private String sanitizeFileName(String name) {
        if (name == null) return "unnamed";
        return name.replaceAll("[^a-zA-Z0-9._\\-\\u4e00-\\u9fff]", "_");
    }

    private String encodeFileName(String name) {
        if (name == null) return "file";
        try {
            return java.net.URLEncoder.encode(name, "UTF-8")
                    .replace("+", "%20");
        } catch (Exception e) {
            return "file";
        }
    }

    private MediaType resolveMediaType(String mimeType) {
        if (mimeType == null) return MediaType.APPLICATION_OCTET_STREAM;
        try {
            return MediaType.parseMediaType(mimeType);
        } catch (Exception e) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
    }

    /**
     * Resolve the current operator ID.
     * For Phase 0, returns a default system user. Will be replaced by
     * SecurityContext-based resolution once Auth integration is complete.
     */
    private String getCurrentOperatorId() {
        // TODO: integrate with SecurityContextHolder after Auth module is wired
        return "system";
    }
}
