package com.zencas.edhr.masterdata.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class MaterialImportResultTest {
    @Test
    void serializesZeroCountsWhenNoRowsWereSkippedOrFailed() {
        var result = new MaterialImportResult(41, List.of(), List.of(), List.of());
        var json = new ObjectMapper().valueToTree(result);

        assertThat(json.path("successCount").intValue()).isEqualTo(41);
        assertThat(json.has("skippedCount")).isTrue();
        assertThat(json.path("skippedCount").intValue()).isZero();
        assertThat(json.has("failedCount")).isTrue();
        assertThat(json.path("failedCount").intValue()).isZero();
        assertThat(json.has("importedMaterials")).isFalse();
    }

    @Test
    void serializesCountsMatchingSkippedAndFailedRows() {
        var row = new MaterialImportResult.RowResult(2, "MAT-001", "V1.0", "重复物料");
        var result = new MaterialImportResult(3, List.of(row), List.of(row, row), List.of());
        var json = new ObjectMapper().valueToTree(result);

        assertThat(json.path("skippedCount").intValue()).isEqualTo(1);
        assertThat(json.path("failedCount").intValue()).isEqualTo(2);
    }
}
