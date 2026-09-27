package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.compliance.entity.FileObject;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;

import static com.zencas.edhr.production.service.ExecutionSnapshotBuilder.invalid;

/** Resolves only file identities referenced by a frozen record, never live form values. */
@Service
@RequiredArgsConstructor
public class DhrFormFiles {
    private final FileObjectRepository files;

    public record Original(String id, String name, String mimeType, byte[] bytes) {}
    public record Resolved(ObjectNode renderingRecord, List<Original> attachments) {}

    public Resolved resolve(JsonNode record, String objectId, LocalDateTime cutoff) throws IOException {
        ObjectNode rendering = record.deepCopy();
        Map<String, Original> originals = new LinkedHashMap<>();
        resolveValues(rendering.path("fieldValues"), objectId, cutoff, originals);
        return new Resolved(rendering, List.copyOf(originals.values()));
    }

    private void resolveValues(JsonNode node, String objectId, LocalDateTime cutoff, Map<String, Original> originals) throws IOException {
        if (node.isArray()) {
            for (JsonNode child : node) resolveValues(child, objectId, cutoff, originals);
        } else if (node.isObject()) {
            if (node.hasNonNull("fileId")) {
                String id = node.path("fileId").asText();
                if (!originals.containsKey(id)) originals.put(id, read(id, "PRODUCTION_EXECUTION", objectId, cutoff));
            }
            if (node.hasNonNull("signatureImageFileId")) {
                Original image = read(node.path("signatureImageFileId").asText(), "SIGNATURE_EVIDENCE", null, cutoff);
                if (!Set.of("image/png", "image/jpeg").contains(image.mimeType())) throw invalid("签名图片格式不支持导出");
                ((ObjectNode) node).put("signatureImageObjectUrl", "data:" + image.mimeType() + ";base64," + Base64.getEncoder().encodeToString(image.bytes()));
            }
            for (JsonNode child : node) resolveValues(child, objectId, cutoff, originals);
        }
    }

    private Original read(String id, String expectedType, String objectId, LocalDateTime cutoff) throws IOException {
        long fileId;
        try { fileId = Long.parseLong(id); } catch (NumberFormatException ex) { throw invalid("冻结表单附件标识无效"); }
        FileObject file = files.findById(fileId).orElseThrow(() -> invalid("冻结表单附件原件缺失：" + id));
        if (!"default".equals(file.getTenantId()) || !expectedType.equals(file.getTargetType())
                || (objectId != null && !objectId.equals(file.getTargetId())) || file.getCreatedAt() == null || file.getCreatedAt().isAfter(cutoff))
            throw invalid("表单文件不属于冻结证据范围：" + id);
        Path path = Path.of(file.getStoredPath());
        if (!Files.isRegularFile(path)) throw invalid("冻结表单附件原件缺失：" + id);
        byte[] bytes = Files.readAllBytes(path);
        try {
            String digest = HexFormat.of().formatHex(MessageDigest.getInstance("MD5").digest(bytes));
            if (file.getFileSize() == null || bytes.length != file.getFileSize() || !digest.equals(file.getMd5Hash()))
                throw invalid("表单附件内容与原件登记不一致：" + id);
        } catch (java.security.NoSuchAlgorithmException ex) { throw new IllegalStateException(ex); }
        return new Original(id, file.getOriginalName(), file.getMimeType(), bytes);
    }
}
