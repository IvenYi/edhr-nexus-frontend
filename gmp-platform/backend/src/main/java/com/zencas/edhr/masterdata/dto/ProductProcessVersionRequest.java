package com.zencas.edhr.masterdata.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductProcessVersionRequest {
    private String version;
    private Long sourceVersionId;
    private String productionMode;
    private String productionForm;
    private Long routeVersionId;
    private Long dhrTemplateVersionId;
    private String description;
    private LocalDateTime effectiveFrom;
    private LocalDateTime effectiveTo;
    private List<OperationBindingRequest> operationBindings;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OperationBindingRequest {
        private String routeNodeKey;
        private Integer sortOrder;
        private List<FormBindingRequest> forms;
        private List<DocumentBindingRequest> documents;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FormBindingRequest {
        private Long formTemplateVersionId;
        private Boolean required;
        private Integer sortOrder;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentBindingRequest {
        private Long documentVersionId;
        private Integer sortOrder;
    }
}
