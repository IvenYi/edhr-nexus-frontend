package com.zencas.edhr.masterdata.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessModelingRequest {
    private String code;
    private String name;
    private String description;
    private String generalDescription;
    private Boolean commonAsset;
    private String status;
    private String remark;
    private String specification;
    private String unit;
    private String materialTypeName;
    private Long materialTypeId;
    private Long productFamilyId;
    private String version;
    private String versionDescription;
    private String materialPurpose;
    private LocalDateTime effectiveDate;
    private LocalDateTime expiryDate;
    private String fileReference;
    private String operationCategory;
    private String defaultOperationType;
    private Integer defaultDurationMinutes;
    private Integer sortOrder;
}
