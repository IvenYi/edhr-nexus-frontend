package com.zencas.edhr.ai;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.template.dto.TemplateModelingRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class AiFormController {
    private final AiFormService forms;

    @PostMapping("/api/v1/ai/internal/forms/patch")
    @PreAuthorize("hasAuthority('AI_WORKER')")
    public ApiResponse<Map<String, Object>> patch(@Valid @RequestBody PatchRequest request) {
        return ApiResponse.success(forms.patch(request.taskId(),request.runId(),request.leaseEpoch(),request.operationId(),request.expectedRevision(),request.patches()));
    }
    public record PatchRequest(@NotNull UUID taskId, @NotNull UUID runId, @Min(1) long leaseEpoch,
                               @NotBlank @Size(max=128) String operationId, @Min(0) long expectedRevision,
                               @NotNull com.fasterxml.jackson.databind.JsonNode patches) {}

    @PostMapping("/api/v1/ai/internal/forms/read")
    @PreAuthorize("hasAuthority('AI_WORKER')")
    public ApiResponse<Map<String, Object>> read(@Valid @RequestBody ReadRequest request) {
        return ApiResponse.success(forms.read(request.taskId(), request.runId(), request.leaseEpoch(), request.callId()));
    }
    public record ReadRequest(@NotNull UUID taskId, @NotNull UUID runId, @Min(1) long leaseEpoch, @Size(min=1,max=128) String callId) { }

    @PostMapping("/api/v1/ai/internal/forms/reconcile")
    @PreAuthorize("hasAuthority('AI_WORKER')")
    public ApiResponse<Map<String, Object>> reconcile(@Valid @RequestBody ReconcileRequest request) {
        return ApiResponse.success(forms.reconcile(request.taskId(),request.runId(),request.leaseEpoch(),request.operationId()));
    }
    public record ReconcileRequest(@NotNull UUID taskId, @NotNull UUID runId, @Min(1) long leaseEpoch, @NotBlank @Size(max=128) String operationId) { }

    @PostMapping("/api/v1/ai/internal/forms/write")
    @PreAuthorize("hasAuthority('AI_WORKER')")
    public ApiResponse<Map<String, Object>> write(@Valid @RequestBody WriteRequest request) {
        return ApiResponse.success(forms.write(request.taskId(), request.runId(), request.leaseEpoch(), request.operationId(), request.action(), request.form()));
    }

    @GetMapping("/api/v1/ai/internal/forms/receipt")
    @PreAuthorize("hasAuthority('AI_WORKER')")
    public ApiResponse<Map<String, Object>> receipt(@RequestParam UUID taskId, @RequestParam String operationId) {
        return ApiResponse.success(forms.receipt(taskId, operationId));
    }

    public record WriteRequest(@NotNull UUID taskId, @NotNull UUID runId, @Min(1) long leaseEpoch,
                               @NotBlank @Size(max=128) String operationId, @Pattern(regexp="create|save-design") @NotNull String action,
                               @Valid @NotNull TemplateModelingRequest form) { }
}
