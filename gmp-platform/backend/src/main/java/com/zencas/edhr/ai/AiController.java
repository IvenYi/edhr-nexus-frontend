package com.zencas.edhr.ai;

import com.zencas.edhr.common.dto.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {
    private final AiTaskService tasks;
    private final AiAccess access;

    @GetMapping("/capabilities")
    public ApiResponse<Map<String, Object>> capabilities() { return ApiResponse.success(tasks.capabilities(access.actor())); }

    @PutMapping("/capabilities/form-builder")
    public ApiResponse<Map<String, Object>> enable(@Valid @RequestBody CapabilityRequest request) {
        return ApiResponse.success(tasks.setEnabled(access.actor(), request.enabled()));
    }

    @PostMapping("/tasks")
    public ApiResponse<Map<String, Object>> create(@Valid @RequestBody CreateRequest request) {
        return ApiResponse.success(tasks.create(access.actor(), request.clientRequestId(), request.instruction()));
    }

    @GetMapping("/tasks/{id}")
    public ApiResponse<Map<String, Object>> get(@PathVariable UUID id) { return ApiResponse.success(tasks.get(access.actor(), id)); }

    @GetMapping("/tasks/{id}/events")
    public ApiResponse<List<Map<String, Object>>> events(@PathVariable UUID id, @RequestParam(defaultValue = "0") long after) {
        return ApiResponse.success(tasks.events(access.actor(), id, after));
    }

    @PostMapping("/tasks/{id}/actions")
    public ApiResponse<Map<String, Object>> action(@PathVariable UUID id, @Valid @RequestBody ActionRequest request) {
        return ApiResponse.success(tasks.action(access.actor(), id, request.clientRequestId(), request.expectedRunId(), request.action()));
    }

    public record CapabilityRequest(@NotNull Boolean enabled) { }
    public record CreateRequest(@NotBlank @Size(max = 128) String clientRequestId,
                                @NotBlank @Size(max = 16000) String instruction) { }
    public record ActionRequest(@NotBlank @Size(max = 128) String clientRequestId,
                                @NotNull UUID expectedRunId, @NotBlank @Size(max = 32) String action) { }
}
