package com.zencas.edhr.ai;

import com.zencas.edhr.common.dto.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/ai/internal/workbench")
@PreAuthorize("hasAuthority('AI_WORKER')")
@RequiredArgsConstructor
public class AiWorkbenchController {
    private final AiWorkbenchService service;
    @PostMapping("/query") public ApiResponse<Map<String,Object>> query(@Valid @RequestBody Query r) {
        return ApiResponse.success(service.query(r.taskId,r.runId,r.leaseEpoch,r.callId,r.tool,r.query,r.id,r.offset));
    }
    @PostMapping("/inspect") public ApiResponse<Map<String,Object>> inspect(@Valid @RequestBody Inspect r) {
        return ApiResponse.success(service.inspect(r.taskId,r.runId,r.leaseEpoch,r.callId,r.tool,r.expectedRevision));
    }
    @PostMapping("/preview-feedback") public ApiResponse<Map<String,Object>> feedback(@Valid @RequestBody Feedback r) {
        return ApiResponse.success(service.previewFeedback(r.taskId,r.runId,r.leaseEpoch,r.callId,r.revision,r.artifactHash,r.pages,r.issueCount));
    }
    public record Query(@NotNull UUID taskId,@NotNull UUID runId,@Min(1) long leaseEpoch,@NotBlank @Size(max=128) String callId,
                        @NotNull @Pattern(regexp="get_applicable_knowledge|query_business_relations") String tool,
                        @NotNull @Size(max=500) String query,@NotNull @Size(max=200) String id,@Min(0) @Max(10000) int offset) {}
    public record Inspect(@NotNull UUID taskId,@NotNull UUID runId,@Min(1) long leaseEpoch,@NotBlank @Size(max=128) String callId,
                          @NotNull @Pattern(regexp="check_form|preview_form") String tool,@Min(0) long expectedRevision) {}
    public record Feedback(@NotNull UUID taskId,@NotNull UUID runId,@Min(1) long leaseEpoch,@NotBlank @Size(max=128) String callId,
                           @Min(0) long revision,@NotNull @Pattern(regexp="[a-f0-9]{64}") String artifactHash,
                           @Min(1) @Max(10) int pages,@Min(0) @Max(1000) int issueCount) {}
}
