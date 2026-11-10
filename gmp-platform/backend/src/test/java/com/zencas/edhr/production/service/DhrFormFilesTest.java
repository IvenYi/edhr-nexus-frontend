package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.compliance.entity.FileObject;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class DhrFormFilesTest {
    @TempDir Path temp;
    @Test void reusesEachSignatureImageAcrossNestedFieldsWithoutChangingFrozenEvidence() throws Exception {
        var mapper = new ObjectMapper(); var repository = mock(FileObjectRepository.class);
        var service = new DhrFormFiles(repository);
        byte[] png = "registered PNG bytes".getBytes(java.nio.charset.StandardCharsets.UTF_8);
        byte[] jpeg = "registered JPEG bytes".getBytes(java.nio.charset.StandardCharsets.UTF_8);
        var first = signatureFile(20L, "image/png", png);
        var second = signatureFile(21L, "image/jpeg", jpeg);
        when(repository.findById(20L)).thenReturn(Optional.of(first));
        when(repository.findById(21L)).thenReturn(Optional.of(second));
        var record = mapper.createObjectNode(); var rows = record.putObject("fieldValues").putArray("rows");
        for (int i = 0; i < 100; i++) rows.addObject().putObject("signature")
                .put("signatureId", "signature-" + i).put("signatureImageFileId", i % 2 == 0 ? "20" : "21");
        var before = record.deepCopy();
        var result = service.resolve(record, "77", LocalDateTime.of(2026, 1, 2, 0, 0));
        assertThat(record).isEqualTo(before);
        assertThat(result.attachments()).isEmpty();
        for (int i = 0; i < 100; i++) {
            var value = result.renderingRecord().path("fieldValues").path("rows").path(i).path("signature");
            assertThat(value.path("signatureId").asText()).isEqualTo("signature-" + i);
            assertThat(value.path("signatureImageObjectUrl").asText()).isEqualTo("data:" + (i % 2 == 0 ? "image/png" : "image/jpeg")
                    + ";base64," + java.util.Base64.getEncoder().encodeToString(i % 2 == 0 ? png : jpeg));
        }
        verify(repository, times(1)).findById(20L);
        verify(repository, times(1)).findById(21L);
    }

    @Test void signatureReuseNeverCrossesCallsFileTypesOrFailedValidation() throws Exception {
        var mapper = new ObjectMapper(); var repository = mock(FileObjectRepository.class);
        var service = new DhrFormFiles(repository);
        byte[] bytes = "registered signature bytes".getBytes(java.nio.charset.StandardCharsets.UTF_8);
        var file = signatureFile(20L, "image/png", bytes);
        when(repository.findById(20L)).thenReturn(Optional.of(file));
        var record = mapper.readTree("{\"fieldValues\":{\"signature\":{\"signatureImageFileId\":\"20\"}}}");
        var cutoff = LocalDateTime.of(2026, 1, 2, 0, 0);
        service.resolve(record, "77", cutoff);
        assertThatThrownBy(() -> service.resolve(record, "77", cutoff.minusDays(2))).hasMessageContaining("不属于冻结证据范围");
        Files.writeString(Path.of(file.getStoredPath()), "modified signature");
        assertThatThrownBy(() -> service.resolve(record, "77", cutoff)).hasMessageContaining("内容与原件登记不一致");
        Files.write(Path.of(file.getStoredPath()), bytes);
        file.setMimeType("application/pdf");
        assertThatThrownBy(() -> service.resolve(record, "77", cutoff)).hasMessageContaining("签名图片格式不支持");
        file.setMimeType("image/png");
        var mixed = record.deepCopy();
        ((com.fasterxml.jackson.databind.node.ObjectNode) mixed.path("fieldValues")).putObject("ordinary").put("fileId", "20");
        assertThatThrownBy(() -> service.resolve(mixed, "77", cutoff)).hasMessageContaining("不属于冻结证据范围");
        Files.delete(Path.of(file.getStoredPath()));
        assertThatThrownBy(() -> service.resolve(record, "77", cutoff)).hasMessageContaining("原件缺失");
        assertThat(record.path("fieldValues").path("signature").has("signatureImageObjectUrl")).isFalse();
    }

    private FileObject signatureFile(long id, String mime, byte[] bytes) throws Exception {
        Path path = temp.resolve(id + ".image"); Files.write(path, bytes);
        return FileObject.builder().id(id).tenantId("default").originalName("签名图片").storedPath(path.toString()).mimeType(mime)
                .fileSize((long) bytes.length).md5Hash(HexFormat.of().formatHex(MessageDigest.getInstance("MD5").digest(bytes)))
                .targetType("SIGNATURE_EVIDENCE").targetId("41").createdAt(LocalDateTime.of(2026, 1, 1, 0, 0)).build();
    }

    @Test void includesNestedOriginalsOnceAndRejectsTamperingCrossObjectOrMissingFiles() throws Exception {
        var mapper = new ObjectMapper(); var repository = mock(FileObjectRepository.class);
        var service = new DhrFormFiles(repository);
        byte[] bytes = "original Office bytes, never converted".getBytes();
        Path path = temp.resolve("original.xls"); Files.write(path, bytes);
        var file = FileObject.builder().id(20L).tenantId("default").originalName("委外原始数据.xls").storedPath(path.toString()).mimeType("application/vnd.ms-excel")
                .fileSize((long) bytes.length).md5Hash(HexFormat.of().formatHex(MessageDigest.getInstance("MD5").digest(bytes)))
                .targetType("PRODUCTION_EXECUTION").targetId("77").createdAt(LocalDateTime.of(2026, 1, 1, 0, 0)).build();
        when(repository.findById(20L)).thenReturn(Optional.of(file));
        var record = mapper.readTree("{\"fieldValues\":{\"a\":[{\"fileId\":\"20\",\"originalName\":\"委外原始数据.xls\"}],\"subtable\":[{\"b\":[{\"fileId\":\"20\"}]}]}}");
        var cutoff = LocalDateTime.of(2026, 1, 2, 0, 0);
        var result = service.resolve(record, "77", cutoff);
        assertThatCode(() -> service.validate(record, "77", cutoff)).doesNotThrowAnyException();
        assertThat(result.attachments()).hasSize(1);
        assertThat(result.attachments().getFirst().bytes()).isEqualTo(bytes);
        assertThat(result.renderingRecord()).isEqualTo(record);
        assertThatThrownBy(() -> service.resolve(record, "88", cutoff)).hasMessageContaining("不属于冻结证据范围");
        assertThatThrownBy(() -> service.resolve(record, "77", cutoff.minusDays(2))).hasMessageContaining("不属于冻结证据范围");
        Files.writeString(path, "modified");
        assertThatThrownBy(() -> service.validate(record, "77", cutoff)).hasMessageContaining("内容与原件登记不一致");
        assertThatThrownBy(() -> service.resolve(record, "77", cutoff)).hasMessageContaining("内容与原件登记不一致");
        Files.delete(path);
        assertThatThrownBy(() -> service.validate(record, "77", cutoff)).hasMessageContaining("原件缺失");
        assertThatThrownBy(() -> service.resolve(record, "77", cutoff)).hasMessageContaining("原件缺失");
    }

    @Test void filenameRemainsChineseSafeUniqueAndPreservesOfficeExtension() {
        assertThat(DhrArchiveService.safeName("../生产\\记录:报告.xls")).doesNotContain("/", "\\", ":").endsWith(".xls");
        String name = DhrArchiveService.safeName("检验".repeat(100) + ".docx");
        assertThat(name.getBytes(java.nio.charset.StandardCharsets.UTF_8).length).isLessThanOrEqualTo(160);
        assertThat(name).endsWith(".docx");
    }
}
