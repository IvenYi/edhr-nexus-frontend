package com.zencas.edhr.production.controller;

import com.zencas.edhr.production.service.DhrArchiveService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class DhrArchiveControllerStreamingTest {
    @TempDir Path directory;

    @Test void successfulStreamReturnsExactArchiveAndDeletesOwnedTemporaryFile() throws Exception {
        Path zip = archive(); byte[] expected = Files.readAllBytes(zip);
        var service = mock(DhrArchiveService.class);
        when(service.export(1L, 10L, "FULL", Set.of(), Set.of())).thenReturn(zip);
        var response = new DhrArchiveController(service).export(1L, 10L, "FULL", "", "");
        assertThat(response.getHeaders().getContentType().toString()).isEqualTo("application/zip");
        assertThat(response.getHeaders().getContentDisposition().getFilename()).isEqualTo("DHR-1-V10-complete.zip");
        assertThat(response.getHeaders().getContentLength()).isEqualTo(expected.length);
        var output = new ByteArrayOutputStream(); response.getBody().writeTo(output);
        assertThat(output.toByteArray()).isEqualTo(expected);
        assertThat(zip).doesNotExist();
    }

    @Test void interruptedOutputStillDeletesOwnedArchiveAndPropagatesTheFailure() throws Exception {
        Path zip = archive(); var service = mock(DhrArchiveService.class);
        when(service.export(1L, 10L, "SELECTED", Set.of("100"), Set.of())).thenReturn(zip);
        var response = new DhrArchiveController(service).export(1L, 10L, "SELECTED", "100", "");
        assertThat(response.getHeaders().getContentDisposition().getFilename()).isEqualTo("DHR-1-V10-selected.zip");
        var output = new OutputStream() {
            int written;
            @Override public void write(int value) throws IOException {
                if (written++ == 8) throw new IOException("fixture disconnected output");
            }
        };
        assertThatThrownBy(() -> response.getBody().writeTo(output)).isInstanceOf(IOException.class).hasMessageContaining("disconnected");
        assertThat(zip).doesNotExist();
    }

    @Test void invalidSelectedIdentityIsRejectedBeforeGeneratingAnArchive() {
        var service = mock(DhrArchiveService.class);
        assertThatThrownBy(() -> new DhrArchiveController(service).export(1L, 10L, "SELECTED", "../100", ""))
                .hasMessageContaining("导出证据标识无效");
        verifyNoInteractions(service);
    }

    private Path archive() throws IOException {
        Path result = directory.resolve("owned.zip");
        try (var output = new ZipOutputStream(Files.newOutputStream(result))) {
            output.putNextEntry(new ZipEntry("payload.txt")); output.write("frozen archive fixture".getBytes(java.nio.charset.StandardCharsets.UTF_8)); output.closeEntry();
        }
        return result;
    }
}
