package com.zencas.edhr.gct.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.LinkedHashMap;
import java.util.Map;

@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class GctRecordDto {

    private String id;
    private String pageCode;
    private String pageTitle;
    private String module;
    private String type;
    private String tenantId;
    private String status;
    @Builder.Default
    private Map<String, Object> values = new LinkedHashMap<>();
    private String createdBy;
    private String createdAt;
    private String updatedBy;
    private String updatedAt;
    private String remark;
    private Boolean deleted;
}
