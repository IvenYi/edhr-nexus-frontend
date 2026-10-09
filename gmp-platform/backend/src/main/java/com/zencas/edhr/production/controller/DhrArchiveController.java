package com.zencas.edhr.production.controller;

import com.zencas.edhr.production.service.DhrArchiveService;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.IOException;
import java.nio.file.Files;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/dhr-instances/{dhrId}/summary/versions/{versionId}/export")
@RequiredArgsConstructor
public class DhrArchiveController {
    private final DhrArchiveService service;

    @GetMapping
    @PreAuthorize("hasAuthority('dhr.instances.view') and hasAuthority('dhr.summaries.export')")
    public ResponseEntity<StreamingResponseBody> export(@PathVariable Long dhrId, @PathVariable Long versionId,
            @RequestParam(defaultValue = "FULL") String scope,
            @RequestParam(defaultValue = "") String recordIds,
            @RequestParam(defaultValue = "") String attachmentIds) throws IOException {
        var zip = service.export(dhrId, versionId, scope, ids(recordIds), ids(attachmentIds));
        StreamingResponseBody body = output -> {
            try { Files.copy(zip, output); }
            finally { Files.deleteIfExists(zip); }
        };
        return ResponseEntity.ok().contentType(MediaType.parseMediaType("application/zip"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"DHR-" + dhrId + "-V" + versionId + ("FULL".equals(scope) ? "-complete" : "-selected") + ".zip\"")
                .contentLength(Files.size(zip)).body(body);
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
