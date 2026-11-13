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

    @PostMapping("/api/v1/ai/internal/forms/read")
    @PreAuthorize("hasAuthority('AI_WORKER')")
    public ApiResponse<Map<String, Object>> read(@Valid @RequestBody AiWorkerController.LeaseRequest request) {
        return ApiResponse.success(forms.read(request.taskId(), request.runId(), request.leaseEpoch()));
    }

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
