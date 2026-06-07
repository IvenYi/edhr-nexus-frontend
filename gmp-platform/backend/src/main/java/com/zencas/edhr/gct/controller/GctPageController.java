package com.zencas.edhr.gct.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.gct.dto.GctPageSpecDto;
import com.zencas.edhr.gct.dto.GctPermissionButtonDto;
import com.zencas.edhr.gct.dto.GctSpecBundleDto;
import com.zencas.edhr.gct.service.GctPageRegistry;
import com.zencas.edhr.gct.service.GctPermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/gct/pages")
@RequiredArgsConstructor
public class GctPageController {

    private final GctPageRegistry registry;
    private final GctPermissionService permissionService;

    @GetMapping
    public ApiResponse<GctSpecBundleDto> listPages() {
        return ApiResponse.success(registry.getBundle());
    }

    @GetMapping("/{pageCode}")
    public ApiResponse<GctPageSpecDto> getPage(@PathVariable String pageCode) {
        return ApiResponse.success(registry.getPageOrThrow(pageCode));
    }

    @GetMapping("/{pageCode}/permissions")
    public ApiResponse<List<GctPermissionButtonDto>> permissions(@PathVariable String pageCode) {
        return ApiResponse.success(permissionService.listButtons(pageCode));
    }
}
