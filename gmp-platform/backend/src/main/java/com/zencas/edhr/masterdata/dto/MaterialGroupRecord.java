package com.zencas.edhr.masterdata.dto;

import com.zencas.edhr.masterdata.entity.Material;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaterialGroupRecord {
    private String id;
    private String code;
    private String name;
    private String specification;
    private String version;
    private Integer versionCount;
    private Integer effectiveVersionCount;
    private String materialPurpose;
    private String effectiveDate;
    private String expiryDate;
    private Long materialTypeId;
    private String materialTypeName;
    private String unit;
    private String description;
    private String status;
    private String createdBy;
    private String createdAt;
    private String updatedBy;
    private String updatedAt;
    private List<Material> versions;
}
