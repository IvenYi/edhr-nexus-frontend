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
