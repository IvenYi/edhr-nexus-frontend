package com.zencas.edhr.masterdata.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessModelingRequest {
    private String code;
    private String name;
    private String description;
    private String status;
    private String remark;
    private String specification;
    private String unit;
    private String materialTypeName;
    private Long materialTypeId;
    private Long productFamilyId;
    private String version;
    private String fileReference;
    private Integer defaultDurationMinutes;
    private Integer sortOrder;
}
