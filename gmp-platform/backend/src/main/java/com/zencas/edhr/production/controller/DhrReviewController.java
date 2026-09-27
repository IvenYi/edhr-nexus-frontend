package com.zencas.edhr.production.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.production.service.DhrReviewService;
import com.zencas.edhr.production.service.DhrAttachmentService;
import com.zencas.edhr.production.service.DhrSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ContentDisposition;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dhr-reviews")
@PreAuthorize("hasAuthority('records.dhr-review')")
@RequiredArgsConstructor
public class DhrReviewController {
    private final DhrReviewService service;
    private final DhrAttachmentService attachments;
    private final DhrSummaryService summaries;
    @GetMapping
    public ApiResponse<PageResult<ObjectNode>> list(@RequestParam(defaultValue="PENDING") String view,
            @RequestParam(defaultValue="") String keyword, @RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="20") int size) {
        return ApiResponse.success(service.list(view, keyword, page, size));
    }
    @GetMapping("/{id}")
    public ApiResponse<ObjectNode> detail(@PathVariable Long id) { return ApiResponse.success(service.detail(id)); }
    @GetMapping("/{id}/audit")
    public ApiResponse<ObjectNode> audit(@PathVariable Long id, @RequestParam(defaultValue="0") int page) {
        // Resolve the task first: menu access alone does not grant access to another user's task/version.
        ObjectNode review = service.detail(id);
        return ApiResponse.success(summaries.versionAudit(Long.valueOf(review.path("dhr").path("id").asText()),
                Long.valueOf(review.path("version").path("id").asText()), page));
    }
    @GetMapping("/{id}/attachments/{attachmentId}/download")
    public ResponseEntity<FileSystemResource> attachment(@PathVariable Long id, @PathVariable Long attachmentId) {
        ObjectNode review = service.detail(id);
        Long dhrId = Long.valueOf(review.path("dhr").path("id").asText());
        Long versionId = Long.valueOf(review.path("version").path("id").asText());
        var file = attachments.downloadableFile(dhrId, attachmentId, versionId);
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(attachments.originalName(dhrId, attachmentId), java.nio.charset.StandardCharsets.UTF_8).build().toString())
                .header("X-Content-Type-Options", "nosniff")
                .body(new FileSystemResource(file));
    }
    @PostMapping("/{id}/actions")
    @PreAuthorize("hasAuthority('records.dhr-review') and hasAuthority('dhr.reviews.act')")
    public ApiResponse<ObjectNode> act(@PathVariable Long id, @RequestBody JsonNode command) { return ApiResponse.success(service.act(id, command)); }
}
