package com.zencas.edhr.production.controller;

import com.zencas.edhr.production.service.DhrArchiveService;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.context.request.async.CallableProcessingInterceptor;
import org.springframework.web.context.request.async.WebAsyncUtils;

import java.io.IOException;
import java.io.Closeable;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.concurrent.Callable;

@RestController
@RequestMapping("/api/v1/dhr-instances/{dhrId}/summary/versions/{versionId}/export")
@RequiredArgsConstructor
@Slf4j
public class DhrArchiveController {
    private final DhrArchiveService service;

    @GetMapping
    @PreAuthorize("hasAuthority('dhr.instances.view') and hasAuthority('dhr.summaries.export')")
    public ResponseEntity<StreamingResponseBody> export(@PathVariable Long dhrId, @PathVariable Long versionId,
            @RequestParam(defaultValue = "FULL") String scope,
            @RequestParam(defaultValue = "") String recordIds,
            @RequestParam(defaultValue = "") String attachmentIds, NativeWebRequest request) throws IOException {
        var zip = service.export(dhrId, versionId, scope, ids(recordIds), ids(attachmentIds));
        var responseMonitor = DhrArchiveResponseFilter.responseMonitor(request);
        try {
            WebAsyncUtils.getAsyncManager(request).registerCallableInterceptor(DhrArchiveController.class, new CallableProcessingInterceptor() {
                @Override public <T> void afterCompletion(NativeWebRequest completedRequest, Callable<T> task) {
                    discardUnclaimedArchive(zip, responseMonitor, null);
                }
            });
            StreamingResponseBody body = output -> {
                synchronized (responseMonitor) {
                    if (!responseMonitor.claimBody()) throw new IOException("DHR 导出请求已结束");
                    try (Closeable cleanup = () -> Files.deleteIfExists(zip)) {
                        Files.copy(zip, output);
                    }
                }
            };
            return ResponseEntity.ok().contentType(MediaType.parseMediaType("application/zip"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"DHR-" + dhrId + "-V" + versionId + ("FULL".equals(scope) ? "-complete" : "-selected") + ".zip\"")
                    .contentLength(Files.size(zip)).body(body);
        } catch (IOException | RuntimeException failure) {
            discardUnclaimedArchive(zip, responseMonitor, failure);
            throw failure;
        }
    }

    private static void discardUnclaimedArchive(Path zip, DhrArchiveResponseFilter.ResponseHandoff handoff, Exception primaryFailure) {
        if (!handoff.claimCleanup()) return;
        try { Files.deleteIfExists(zip); }
        catch (IOException | RuntimeException cleanupFailure) {
            if (primaryFailure != null) primaryFailure.addSuppressed(cleanupFailure);
            log.error("Failed to remove unclaimed DHR export archive: path={}", zip, cleanupFailure);
        }
    }

    private static Set<String> ids(String input) {
        if (input == null || input.isBlank()) return Set.of();
        Set<String> result = new LinkedHashSet<>();
        Arrays.stream(input.split(",")).map(String::trim).forEach(id -> {
            if (!id.matches("[0-9]{1,19}")) throw new BusinessException(ErrorCode.GENERAL_001, "导出证据标识无效");
            result.add(id);
        });
        return result;
    }
}
