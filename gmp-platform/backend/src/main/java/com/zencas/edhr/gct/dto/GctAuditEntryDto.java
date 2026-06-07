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
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class GctAuditEntryDto {

    private String id;
    private String pageCode;
    private String recordId;
    private String actionCode;
    private String actionLabel;
    private String actor;
    private String message;
    private String beforeStatus;
    private String afterStatus;
    @Builder.Default
    private Map<String, Object> input = new LinkedHashMap<>();
    private String createdAt;
}
