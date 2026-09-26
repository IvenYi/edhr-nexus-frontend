package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static com.zencas.edhr.production.service.ExecutionSnapshotBuilder.invalid;

/** Immutable file bytes and auditable DHR association; removing a link never removes historical bytes. */
@Service
@RequiredArgsConstructor
public class DhrAttachmentService {
    private static final long MAX_BYTES = 25L * 1024 * 1024;
    private static final Set<String> SOURCE_KINDS = Set.of("EXTERNAL_REPORT", "CERTIFICATE", "PAPER_SCAN", "OTHER");
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    private final SnowflakeIdGenerator ids;
    private final AuditEventRepository audits;

    @Value("${edhr.file.storage-path:#{systemProperties['user.home'] + '/.edhr/files'}}")
    private String storagePath;

    @Transactional(readOnly = true)
    public ArrayNode active(Long dhrId) {
        ensureDhr(dhrId, false);
        return snapshot(dhrId);
    }

    @Transactional(readOnly = true)
    public ArrayNode snapshot(Long dhrId) {
        ArrayNode result = mapper.createArrayNode();
        jdbc.query("SELECT * FROM dhr_attachment WHERE tenant_id='default' AND dhr_instance_id=? AND active=TRUE ORDER BY linked_at,id",
                (org.springframework.jdbc.core.RowCallbackHandler) rs -> result.addObject()
                        .put("id", rs.getString("id")).put("name", rs.getString("original_name"))
                        .put("mimeType", rs.getString("mime_type")).put("size", rs.getLong("file_size"))
                        .put("sha256", rs.getString("sha256")).put("sourceKind", rs.getString("source_kind"))
                        .put("purpose", rs.getString("purpose"))
                        .put("originalRecordedAt", rs.getTimestamp("original_recorded_at") == null ? null : rs.getTimestamp("original_recorded_at").toLocalDateTime().toString())
                        .put("custodyLocation", rs.getString("custody_location"))
                        .put("verificationStatus", rs.getString("verification_status"))
                        .put("verifiedBy", rs.getString("verified_by"))
                        .put("verifiedAt", rs.getTimestamp("verified_at") == null ? null : rs.getTimestamp("verified_at").toLocalDateTime().toString())
                        .put("linkedBy", rs.getString("linked_by"))
                        .put("linkedAt", rs.getTimestamp("linked_at").toLocalDateTime().toString()), dhrId);
        return result;
    }

    @Transactional
    public ObjectNode upload(Long dhrId, MultipartFile file, String sourceKind, String purpose,
                             LocalDateTime originalRecordedAt, String custodyLocation) throws IOException {
        ensureDhr(dhrId, true);
        if (!SOURCE_KINDS.contains(sourceKind)) throw invalid("附件来源类型无效");
        if (purpose == null || purpose.isBlank() || purpose.length() > 500) throw invalid("请填写附件来源与用途");
        if ("PAPER_SCAN".equals(sourceKind) && (originalRecordedAt == null || custodyLocation == null || custodyLocation.isBlank()))
            throw invalid("纸质原件扫描件须填写原记录形成时间和原件保管位置");
        if (originalRecordedAt != null && originalRecordedAt.isAfter(LocalDateTime.now())) throw invalid("原记录形成时间不能晚于当前时间");
        if (custodyLocation != null && custodyLocation.length() > 500) throw invalid("原件保管位置过长");
        if (file == null || file.isEmpty() || file.getSize() > MAX_BYTES) throw invalid("附件不能为空且不能超过 25MB");
        String name = file.getOriginalFilename();
        if (name == null || name.isBlank() || name.length() > 255 || name.contains("/") || name.contains("\\")
                || name.chars().anyMatch(c -> c < 32)) throw invalid("附件原文件名无效");
        byte[] bytes = file.getBytes();
        if (bytes.length == 0 || bytes.length > MAX_BYTES) throw invalid("附件不能为空且不能超过 25MB");
        String mime = detectedType(bytes);
        if (mime == null) throw invalid("仅支持内容可识别的 PDF、PNG、JPEG 附件");
        inspectReadable(bytes, mime);
        long id = ids.nextId();
        String extension = switch (mime) { case "application/pdf" -> "pdf"; case "image/png" -> "png"; default -> "jpg"; };
        Path directory = Path.of(storagePath).resolve("dhr");
        Files.createDirectories(directory);
        Path stored = directory.resolve(id + "." + extension);
        Files.write(stored, bytes, java.nio.file.StandardOpenOption.CREATE_NEW);
        if (TransactionSynchronizationManager.isSynchronizationActive())
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCompletion(int status) {
                    if (status != STATUS_COMMITTED) try { Files.deleteIfExists(stored); } catch (IOException ignored) { }
                }
            });
        String digest = sha256(bytes);
        LocalDateTime now = LocalDateTime.now();
        jdbc.update("""
            INSERT INTO dhr_attachment(id,tenant_id,dhr_instance_id,original_name,stored_path,mime_type,file_size,sha256,
              source_kind,purpose,original_recorded_at,custody_location,active,verification_status,linked_by,linked_at)
            VALUES(?,'default',?,?,?,?,?,?,?,?,?,?,TRUE,'PENDING',?,?)
            """, id, dhrId, name, stored.toString(), mime, bytes.length, digest, sourceKind, purpose.strip(),
                originalRecordedAt, custodyLocation == null ? null : custodyLocation.strip(), actor(), now);
        ObjectNode after = mapper.createObjectNode().put("dhrId", dhrId.toString()).put("attachmentId", Long.toString(id))
                .put("sha256", digest).put("sourceKind", sourceKind).put("purpose", purpose.strip());
        audit(id, "LINK", null, after);
        return after;
    }

    @Transactional
    public void verify(Long dhrId, Long attachmentId) {
        ensureDhr(dhrId, true);
        Map<String, Object> row = lockedAttachment(dhrId, attachmentId);
        if (!Boolean.TRUE.equals(row.get("active"))) throw invalid("附件已解除关联");
        Path file = Path.of(String.valueOf(row.get("stored_path")));
        try {
            if (!Files.isRegularFile(file)) throw invalid("附件文件丢失或摘要不一致");
            byte[] bytes = Files.readAllBytes(file);
            if (!sha256(bytes).equals(row.get("sha256"))) throw invalid("附件文件丢失或摘要不一致");
            inspectReadable(bytes, String.valueOf(row.get("mime_type")));
        } catch (IOException ex) { throw invalid("附件无法读取"); }
        jdbc.update("UPDATE dhr_attachment SET verification_status='VERIFIED',verified_by=?,verified_at=? WHERE id=?",
                actor(), LocalDateTime.now(), attachmentId);
        audit(attachmentId, "VERIFY", null, mapper.createObjectNode().put("dhrId", dhrId.toString()).put("attachmentId", attachmentId.toString()));
    }

    @Transactional
    public void unlink(Long dhrId, Long attachmentId, String reason) {
        ensureDhr(dhrId, true);
        if (reason == null || reason.isBlank() || reason.length() > 500) throw invalid("请填写解除关联原因");
        Map<String, Object> row = lockedAttachment(dhrId, attachmentId);
        if (!Boolean.TRUE.equals(row.get("active"))) throw invalid("附件已解除关联");
        jdbc.update("UPDATE dhr_attachment SET active=FALSE,unlinked_by=?,unlinked_at=?,unlink_reason=? WHERE id=?",
                actor(), LocalDateTime.now(), reason.strip(), attachmentId);
        audit(attachmentId, "UNLINK", mapper.createObjectNode().put("active", true),
                mapper.createObjectNode().put("dhrId", dhrId.toString()).put("attachmentId", attachmentId.toString())
                        .put("active", false).put("reason", reason.strip()));
    }

    @Transactional(readOnly = true)
    public Path file(Long dhrId, Long attachmentId) {
        ensureDhr(dhrId, false);
        var rows = jdbc.queryForList("SELECT stored_path,sha256 FROM dhr_attachment WHERE tenant_id='default' AND dhr_instance_id=? AND id=?", dhrId, attachmentId);
        if (rows.isEmpty()) throw invalid("附件不存在");
        Path file = Path.of(String.valueOf(rows.getFirst().get("stored_path")));
        try {
            if (!Files.isRegularFile(file) || !sha256(Files.readAllBytes(file)).equals(rows.getFirst().get("sha256"))) throw invalid("附件丢失或摘要不一致");
        } catch (IOException ex) { throw invalid("附件无法读取"); }
        return file;
    }

    @Transactional(readOnly = true)
    public Path downloadableFile(Long dhrId, Long attachmentId, Long versionId) {
        ensureDhr(dhrId, false);
        var rows = jdbc.queryForList("SELECT active,sha256 FROM dhr_attachment WHERE tenant_id='default' AND dhr_instance_id=? AND id=?", dhrId, attachmentId);
        if (rows.isEmpty()) throw invalid("附件不存在");
        if (versionId != null) {
            var versions = jdbc.queryForList("SELECT attachment_snapshot FROM dhr_summary_version WHERE tenant_id='default' AND dhr_instance_id=? AND id=?", dhrId, versionId);
            if (versions.isEmpty()) throw invalid("冻结版本不存在");
            boolean included = false;
            try {
                for (var attachment : mapper.readTree(String.valueOf(versions.getFirst().get("attachment_snapshot")))) {
                    if (attachmentId.toString().equals(attachment.path("id").asText())
                            && rows.getFirst().get("sha256").equals(attachment.path("sha256").asText())) included = true;
                }
            } catch (IOException ex) { throw invalid("冻结附件快照无法读取"); }
            if (!included) throw invalid("附件不属于指定的冻结版本");
        }
        else if (!Boolean.TRUE.equals(rows.getFirst().get("active"))) throw invalid("附件已解除关联，请从包含该附件的冻结版本查看");
        return file(dhrId, attachmentId);
    }

    private void ensureDhr(Long dhrId, boolean editable) {
        String sql = "SELECT status,summary_status FROM dhr_instance WHERE tenant_id='default' AND id=?" + (editable ? " FOR UPDATE" : "");
        var rows = jdbc.queryForList(sql, dhrId);
        if (rows.isEmpty()) throw invalid("DHR 不存在");
        if (editable && (!"COMPLETED".equals(rows.getFirst().get("status"))
                || Set.of("PENDING_REVIEW", "FORMALIZED").contains(String.valueOf(rows.getFirst().get("summary_status")))))
            throw invalid("当前 DHR 不能修改附件；请先退回或重新整理，历史版本保持不变");
    }

    private Map<String, Object> lockedAttachment(Long dhrId, Long id) {
        var rows = jdbc.queryForList("SELECT * FROM dhr_attachment WHERE tenant_id='default' AND dhr_instance_id=? AND id=? FOR UPDATE", dhrId, id);
        if (rows.isEmpty()) throw invalid("附件不存在");
        return rows.getFirst();
    }

    private static String detectedType(byte[] bytes) {
        if (bytes.length >= 5 && bytes[0] == '%' && bytes[1] == 'P' && bytes[2] == 'D' && bytes[3] == 'F' && bytes[4] == '-')
            return "application/pdf";
        if (bytes.length >= 8 && (bytes[0] & 255) == 137 && bytes[1] == 'P' && bytes[2] == 'N' && bytes[3] == 'G'
                && bytes[4] == 13 && bytes[5] == 10 && bytes[6] == 26 && bytes[7] == 10) return "image/png";
        if (bytes.length >= 4 && (bytes[0] & 255) == 255 && (bytes[1] & 255) == 216 && (bytes[2] & 255) == 255)
            return "image/jpeg";
        return null;
    }

    private static void inspectReadable(byte[] bytes, String mime) {
        try {
            if ("application/pdf".equals(mime)) {
                try (var document = org.apache.pdfbox.Loader.loadPDF(bytes)) {
                    if (document.isEncrypted() || document.getNumberOfPages() < 1) throw invalid("PDF 无法作为可读证据");
                }
            } else {
                try (var input = javax.imageio.ImageIO.createImageInputStream(new java.io.ByteArrayInputStream(bytes))) {
                    var readers = javax.imageio.ImageIO.getImageReaders(input);
                    if (!readers.hasNext()) throw invalid("图片无法读取");
                    var reader = readers.next();
                    try {
                        reader.setInput(input, true, true);
                        long width = reader.getWidth(0), height = reader.getHeight(0);
                        if (width < 1 || height < 1 || width * height > 100_000_000L) throw invalid("图片尺寸无效或超限");
                    } finally { reader.dispose(); }
                }
            }
        } catch (Exception ex) {
            if (ex instanceof com.zencas.edhr.common.exception.BusinessException business) throw business;
            throw invalid("附件内容无法完整读取");
        }
    }

    private static String sha256(byte[] value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value)); }
        catch (Exception ex) { throw new IllegalStateException("无法计算附件摘要", ex); }
    }

    private static String actor() {
        String name = AuditContext.getOperatorName();
        return name == null || name.isBlank() ? AuditContext.getOperatorId() : name;
    }

    private void audit(long id, String action, ObjectNode before, ObjectNode after) {
        audits.save(AuditEvent.builder().id(ids.nextId()).entityType("DHR_ATTACHMENT").entityId(Long.toString(id))
                .action(action).contentBefore(before == null ? null : before.toString()).contentAfter(after.toString())
                .operatorId(AuditContext.getOperatorId()).operatorName(AuditContext.getOperatorName())
                .operatorAccount(AuditContext.getOperatorAccount()).source(AuditContext.getSource())
                .moduleName("记录").menuName("DHR管理 · DHR汇总").functionName("DHR 附件" + action)
                .dataSummary(after.path("dhrId").asText()).ipAddress(AuditContext.getIpAddress())
                .createdAt(LocalDateTime.now()).build());
    }
}
