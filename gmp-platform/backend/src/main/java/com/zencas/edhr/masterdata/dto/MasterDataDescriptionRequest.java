package com.zencas.edhr.masterdata.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request contract for master records that have a description but no remark field.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MasterDataDescriptionRequest {
    private String code;
    private String name;
    private String description;
    private String status;
    private String version;
    private String fileReference;
}
