package com.zencas.edhr.production.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.production.service.DhrReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dhr-reviews")
@PreAuthorize("hasAuthority('records.dhr-review')")
@RequiredArgsConstructor
public class DhrReviewController {
    private final DhrReviewService service;
    @GetMapping
    public ApiResponse<PageResult<ObjectNode>> list(@RequestParam(defaultValue="PENDING") String view,
            @RequestParam(defaultValue="") String keyword, @RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="20") int size) {
        return ApiResponse.success(service.list(view, keyword, page, size));
    }
    @GetMapping("/{id}")
    public ApiResponse<ObjectNode> detail(@PathVariable Long id) { return ApiResponse.success(service.detail(id)); }
    @PostMapping("/{id}/actions")
    @PreAuthorize("hasAuthority('records.dhr-review') and hasAuthority('dhr.reviews.act')")
    public ApiResponse<ObjectNode> act(@PathVariable Long id, @RequestBody JsonNode command) { return ApiResponse.success(service.act(id, command)); }
}
