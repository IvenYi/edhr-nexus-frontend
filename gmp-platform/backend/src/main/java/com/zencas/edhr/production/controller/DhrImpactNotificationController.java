package com.zencas.edhr.production.controller;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.production.service.DhrImpactNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dhr-impact-notifications")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class DhrImpactNotificationController {
    private final DhrImpactNotificationService service;

    @GetMapping
    public ApiResponse<ObjectNode> list(@RequestParam(defaultValue="0") int page) {
        return ApiResponse.success(service.list(page));
    }

    @PostMapping("/{id}/read")
    public ApiResponse<Void> read(@PathVariable long id) {
        service.read(id);
        return ApiResponse.success(null);
    }
}
