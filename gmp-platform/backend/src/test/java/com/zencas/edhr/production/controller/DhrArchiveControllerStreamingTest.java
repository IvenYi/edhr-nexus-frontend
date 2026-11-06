package com.zencas.edhr.production.controller;

import com.zencas.edhr.production.service.DhrArchiveService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
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

    @Test @EnabledIfSystemProperty(named="edhr.audit.archiveCleanupFaults",matches="true")
    void outputIOExceptionRetainsItsIdentityWhenCleanupAlsoFails()throws Exception{
        Path zip=archive();var response=response(zip);
        var primary=new IOException("fixture disconnected output with cleanup fault");
        OutputStream output=new OutputStream(){
            @Override public void write(int value)throws IOException{obstruct(zip);throw primary;}
        };
        assertThatThrownBy(()->response.getBody().writeTo(output)).isSameAs(primary);
        assertThat(primary.getSuppressed()).singleElement().isInstanceOf(java.nio.file.DirectoryNotEmptyException.class);
        assertThat(zip.resolve("fixture-blocker")).isRegularFile();
    }

    @Test @EnabledIfSystemProperty(named="edhr.audit.archiveCleanupFaults",matches="true")
    void outputRuntimeFailureRetainsItsIdentityWhenCleanupAlsoFails()throws Exception{
        Path zip=archive();var response=response(zip);
        var primary=new IllegalStateException("fixture runtime output failure");
        OutputStream output=new OutputStream(){
            @Override public void write(int value)throws IOException{obstruct(zip);throw primary;}
        };
        assertThatThrownBy(()->response.getBody().writeTo(output)).isSameAs(primary);
        assertThat(primary.getSuppressed()).singleElement().isInstanceOf(java.nio.file.DirectoryNotEmptyException.class);
    }

    @Test @EnabledIfSystemProperty(named="edhr.audit.archiveCleanupFaults",matches="true")
    void cleanupFailureAfterSuccessfulCopyStillFailsAndRetainsExactOutput()throws Exception{
        Path zip=archive();byte[] expected=Files.readAllBytes(zip);var response=response(zip);
        var copied=new ByteArrayOutputStream();OutputStream output=new OutputStream(){
            boolean replaced;
            @Override public void write(int value)throws IOException{if(!replaced){obstruct(zip);replaced=true;}copied.write(value);}
        };
        assertThatThrownBy(()->response.getBody().writeTo(output)).isInstanceOf(java.nio.file.DirectoryNotEmptyException.class);
        assertThat(copied.toByteArray()).isEqualTo(expected);
    }

    private org.springframework.http.ResponseEntity<org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody> response(Path zip)throws IOException{
        var service=mock(DhrArchiveService.class);when(service.export(1L,10L,"FULL",Set.of(),Set.of())).thenReturn(zip);
        return new DhrArchiveController(service).export(1L,10L,"FULL","","");
    }

    private void obstruct(Path zip)throws IOException{
        Files.delete(zip);Files.createDirectory(zip);Files.writeString(zip.resolve("fixture-blocker"),"owned test fixture");
    }

    private Path archive() throws IOException {
        Path result = directory.resolve("owned.zip");
        try (var output = new ZipOutputStream(Files.newOutputStream(result))) {
            output.putNextEntry(new ZipEntry("payload.txt")); output.write("frozen archive fixture".getBytes(java.nio.charset.StandardCharsets.UTF_8)); output.closeEntry();
        }
        return result;
    }
}
