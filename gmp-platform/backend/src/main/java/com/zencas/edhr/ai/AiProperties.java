package com.zencas.edhr.ai;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/** Deployment settings, never supplied by a model or task request. Disabled by default. */
@Data
@Validated
@ConfigurationProperties(prefix = "edhr.ai")
public class AiProperties {
    private boolean enabled = false;
    private boolean internalValidation = false;
    @NotBlank private String installationId = "default";
    private String workerKey = "";
    @Min(1) private int leaseSeconds = 30;
    @Min(1) private int runSeconds = 600;
    @Min(1) private int maxRequests = 12;
    @Min(1) private int maxOutputTokens = 4096;
    @Min(1) private long budgetMicros = 1_000_000;
    @Min(1) private long requestReserveMicros = 100_000;
    @NotBlank private String pluginVersion = "form-worker-2c";
    @NotBlank private String toolProtocol = "ai-task-v3";
    @NotBlank private String knowledgePackage = "form-knowledge-2c-internal";
    @NotBlank private String modelConfig = "fixture-no-model";
}
