package com.zencas.edhr.gct.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.gct.dto.GctDemoFlowDto;
import com.zencas.edhr.gct.service.GctDemoFlowService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/gct/demo-flow")
@RequiredArgsConstructor
public class GctDemoFlowController {

    private final GctDemoFlowService demoFlowService;

    @GetMapping
    public ApiResponse<GctDemoFlowDto> get() {
        return ApiResponse.success(demoFlowService.getDemoFlow());
    }

    @PostMapping("/reset")
    public ApiResponse<GctDemoFlowDto> reset() {
        return ApiResponse.success(demoFlowService.reset());
    }

    @PostMapping("/run")
    public ApiResponse<GctDemoFlowDto> run() {
        return ApiResponse.success(demoFlowService.run());
    }
}
