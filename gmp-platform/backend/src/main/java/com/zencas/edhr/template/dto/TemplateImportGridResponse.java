package com.zencas.edhr.template.dto;

import java.util.List;
import java.util.Map;

public record TemplateImportGridResponse(
        String orientation,
        String canvasMode,
        String paperMode,
        Grid grid
) {
    public record Grid(
            List<Integer> rowHeights,
            List<Integer> columnWidths,
            Map<String, Cell> cells,
            List<Range> mergedCells
    ) {
    }

    public record Cell(
            String value,
            Map<String, Object> style,
            Border border
    ) {
    }

    public record Border(
            Boolean top,
            Boolean right,
            Boolean bottom,
            Boolean left
    ) {
    }

    public record Range(
            int t,
            int l,
            int b,
            int r
    ) {
    }
}
