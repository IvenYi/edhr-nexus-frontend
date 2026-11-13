package com.zencas.edhr.ai;

import com.zencas.edhr.common.dto.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai/internal")
@PreAuthorize("hasAuthority('AI_WORKER')")
@RequiredArgsConstructor
public class AiWorkerController {
    private final AiTaskService tasks;

    @PostMapping("/claim")
    public ApiResponse<Map<String, Object>> claim() { return ApiResponse.success(tasks.claim()); }

    @PostMapping("/renew")
    public ApiResponse<Map<String, Object>> renew(@Valid @RequestBody LeaseRequest request) {
        return ApiResponse.success(tasks.renew(request.taskId(), request.runId(), request.leaseEpoch()));
    }

    @PostMapping("/reserve")
    public ApiResponse<Map<String, Object>> reserve(@Valid @RequestBody ReserveRequest request) {
        return ApiResponse.success(tasks.reserve(request.taskId(), request.runId(), request.leaseEpoch(), request.requestId()));
    }

    @PostMapping("/settle")
    public ApiResponse<Map<String, Object>> settle(@Valid @RequestBody SettleRequest request) {
        return ApiResponse.success(tasks.settle(request.taskId(), request.runId(), request.leaseEpoch(), request.requestId(), request.actualMicros()));
    }

    @PostMapping("/fail")
    public ApiResponse<Map<String, Object>> fail(@Valid @RequestBody LeaseRequest request) {
        return ApiResponse.success(tasks.fail(request.taskId(), request.runId(), request.leaseEpoch()));
    }

    public record LeaseRequest(@NotNull UUID taskId, @NotNull UUID runId, @Min(1) long leaseEpoch) { }
    public record ReserveRequest(@NotNull UUID taskId, @NotNull UUID runId, @Min(1) long leaseEpoch,
                                 @NotBlank @Size(max = 128) String requestId) { }
    public record SettleRequest(@NotNull UUID taskId, @NotNull UUID runId, @Min(1) long leaseEpoch,
                                @NotBlank @Size(max = 128) String requestId,
                                @NotNull @Min(0) @Max(1_000_000_000_000L) Long actualMicros) { }
}
