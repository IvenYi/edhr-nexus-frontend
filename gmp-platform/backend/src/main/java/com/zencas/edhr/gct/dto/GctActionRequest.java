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
public class GctActionRequest {

    @Builder.Default
    private Map<String, Object> input = new LinkedHashMap<>();
    @Builder.Default
    private Map<String, Object> values = new LinkedHashMap<>();
    private String actor;
    private String remark;
    private Boolean auditRequired;
}
