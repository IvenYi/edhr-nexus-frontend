package com.zencas.edhr.masterdata.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.zencas.edhr.masterdata.entity.Material;

import java.util.List;

public record MaterialImportResult(
        int successCount,
        List<RowResult> skippedRows,
        List<RowResult> failedRows,
        @JsonIgnore List<Material> importedMaterials) {

    public MaterialImportResult {
        skippedRows = List.copyOf(skippedRows);
        failedRows = List.copyOf(failedRows);
        importedMaterials = List.copyOf(importedMaterials);
    }

    @JsonProperty("skippedCount")
    public int skippedCount() {
        return skippedRows.size();
    }

    @JsonProperty("failedCount")
    public int failedCount() {
        return failedRows.size();
    }

    public record RowResult(int rowNumber, String code, String version, String reason) {
    }
}
