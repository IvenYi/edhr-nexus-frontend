package com.zencas.edhr.template.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateModelingRequest {
    private String code;
    private String name;
    private String categoryName;
    private String description;
    private String versionDescription;
    private String version;
    private String effectiveFrom;
    private String effectiveTo;
    private String sourceFileName;
    private String sourceFileType;
    private String modelDesignJson;
    private String canvasDesignJson;
    private String workflowDesignJson;
    private String status;
}
