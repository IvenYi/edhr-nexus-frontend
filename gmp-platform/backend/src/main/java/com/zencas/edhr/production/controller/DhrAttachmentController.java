package com.zencas.edhr.production.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.production.service.DhrAttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/dhr-instances/{dhrId}/attachments")
@RequiredArgsConstructor
public class DhrAttachmentController {
    private final DhrAttachmentService service;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('records.dhr-management','records.dhr-summary')")
    public ApiResponse<ArrayNode> list(@PathVariable Long dhrId) {
        return ApiResponse.success(service.active(dhrId));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('records.dhr-summary') and hasAuthority('dhr.summaries.edit')")
    public ApiResponse<ObjectNode> upload(@PathVariable Long dhrId, @RequestParam MultipartFile file,
            @RequestParam String sourceKind, @RequestParam String purpose,
            @RequestParam(required = false) LocalDateTime originalRecordedAt,
            @RequestParam(required = false) String custodyLocation) throws IOException {
        return ApiResponse.success(service.upload(dhrId, file, sourceKind, purpose, originalRecordedAt, custodyLocation));
    }

    @PostMapping("/{attachmentId}/verify")
    @PreAuthorize("hasAuthority('records.dhr-summary') and hasAuthority('dhr.summaries.edit')")
    public ApiResponse<Void> verify(@PathVariable Long dhrId, @PathVariable Long attachmentId) {
        service.verify(dhrId, attachmentId);
        return ApiResponse.success(null);
    }

    @PostMapping("/{attachmentId}/unlink")
    @PreAuthorize("hasAuthority('records.dhr-summary') and hasAuthority('dhr.summaries.edit')")
    public ApiResponse<Void> unlink(@PathVariable Long dhrId, @PathVariable Long attachmentId, @RequestBody JsonNode command) {
        service.unlink(dhrId, attachmentId, command.path("reason").asText());
        return ApiResponse.success(null);
    }

    @GetMapping("/{attachmentId}/download")
    @PreAuthorize("hasAnyAuthority('records.dhr-management','records.dhr-summary')")
    public ResponseEntity<FileSystemResource> download(@PathVariable Long dhrId, @PathVariable Long attachmentId,
                                                       @RequestParam(required = false) Long versionId) {
        var file = service.downloadableFile(dhrId, attachmentId, versionId);
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"dhr-attachment-" + attachmentId + "\"")
                .body(new FileSystemResource(file));
    }
}
