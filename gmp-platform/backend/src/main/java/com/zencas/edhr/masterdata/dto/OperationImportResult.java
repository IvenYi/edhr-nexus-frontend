package com.zencas.edhr.masterdata.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.zencas.edhr.masterdata.entity.Operation;
import java.util.List;

public record OperationImportResult(int successCount, List<RowResult> skippedRows,
                                    List<RowResult> failedRows, @JsonIgnore List<Operation> importedOperations) {
    public OperationImportResult {
        skippedRows = List.copyOf(skippedRows);
        failedRows = List.copyOf(failedRows);
        importedOperations = List.copyOf(importedOperations);
    }

    @JsonProperty("skippedCount")
    public int skippedCount() { return skippedRows.size(); }

    @JsonProperty("failedCount")
    public int failedCount() { return failedRows.size(); }

    public record RowResult(int rowNumber, String code, String name, String reason) {}
}
