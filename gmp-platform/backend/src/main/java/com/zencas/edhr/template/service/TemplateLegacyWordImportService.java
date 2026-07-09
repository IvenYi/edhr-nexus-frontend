package com.zencas.edhr.template.service;

import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.template.dto.TemplateImportGridResponse;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.usermodel.CharacterRun;
import org.apache.poi.hwpf.usermodel.Paragraph;
import org.apache.poi.hwpf.usermodel.Range;
import org.apache.poi.hwpf.usermodel.Section;
import org.apache.poi.hwpf.usermodel.Table;
import org.apache.poi.hwpf.usermodel.TableCell;
import org.apache.poi.hwpf.usermodel.TableIterator;
import org.apache.poi.hwpf.usermodel.TableRow;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class TemplateLegacyWordImportService {

    private static final int DEFAULT_ROW_HEIGHT = 36;
    private static final int DEFAULT_COLUMN_WIDTH = 98;
    private static final int MAX_IMPORT_ROWS = 300;
    private static final int MAX_IMPORT_COLS = 75;
    private static final int TWIP_PER_PX = 15;
    private static final Pattern CONTROL_CHARS = Pattern.compile("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F]");

    public TemplateImportGridResponse importDoc(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.GENERAL_001, "导入的 Word 文件不能为空");
        }
        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        if (!"doc".equalsIgnoreCase(extension)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "当前接口仅支持导入 .doc 文件");
        }

        try (HWPFDocument document = new HWPFDocument(file.getInputStream())) {
            Range range = document.getRange();
            List<ParsedBlock> blocks = parseBlocks(range);
            if (blocks.isEmpty()) {
                throw new BusinessException(ErrorCode.GENERAL_001, "未能从 .doc 文件中解析出可导入内容");
            }
            ParsedGrid grid = blocksToGrid(blocks);
            String orientation = resolveOrientation(range);
            return new TemplateImportGridResponse(
                    orientation,
                    "paper",
                    "free",
                    new TemplateImportGridResponse.Grid(
                            grid.rowHeights(),
                            grid.columnWidths(),
                            grid.cells(),
                            grid.mergedCells()
                    )
            );
        } catch (BusinessException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new BusinessException(ErrorCode.GENERAL_001, "Word 模板解析失败: " + exception.getMessage());
        }
    }

    private List<ParsedBlock> parseBlocks(Range range) {
        List<ParsedBlock> blocks = new ArrayList<>();
        List<Table> tables = new ArrayList<>();
        TableIterator iterator = new TableIterator(range);
        while (iterator.hasNext()) {
            tables.add(iterator.next());
        }
        tables.sort(Comparator.comparingInt(Table::getStartOffset));

        int paragraphIndex = 0;
        int tableIndex = 0;
        while (paragraphIndex < range.numParagraphs()) {
            Paragraph paragraph = range.getParagraph(paragraphIndex);
            Table activeTable = tableIndex < tables.size() ? tables.get(tableIndex) : null;
            if (activeTable != null
                    && paragraph.getStartOffset() >= activeTable.getStartOffset()
                    && paragraph.getStartOffset() < activeTable.getEndOffset()) {
                if (paragraph.getStartOffset() == activeTable.getStartOffset()) {
                    blocks.add(new ParsedTableBlock(parseTable(activeTable)));
                }
                int tableEndOffset = activeTable.getEndOffset();
                while (paragraphIndex < range.numParagraphs()
                        && range.getParagraph(paragraphIndex).getStartOffset() < tableEndOffset) {
                    paragraphIndex += 1;
                }
                tableIndex += 1;
                continue;
            }

            String text = cleanText(paragraph.text(), false);
            if (!text.isBlank()) {
                blocks.add(new ParsedParagraphBlock(text, extractParagraphStyle(paragraph)));
            }
            paragraphIndex += 1;
        }
        return blocks;
    }

    private ParsedTable parseTable(Table table) {
        List<ParsedRow> rows = new ArrayList<>();
        List<Integer> columnWidths = new ArrayList<>();
        List<TemplateImportGridResponse.Range> mergedCells = new ArrayList<>();
        Map<Integer, TemplateImportGridResponse.Range> verticalMergeMap = new HashMap<>();

        int rowLimit = Math.min(table.numRows(), MAX_IMPORT_ROWS);
        for (int rowIndex = 0; rowIndex < rowLimit; rowIndex += 1) {
            TableRow row = table.getRow(rowIndex);
            List<ParsedCell> rowCells = new ArrayList<>();
            int logicalColumnIndex = 0;
            int physicalCellIndex = 0;
            int rowHeight = DEFAULT_ROW_HEIGHT;

            while (physicalCellIndex < row.numCells() && logicalColumnIndex < MAX_IMPORT_COLS) {
                TableCell cell = row.getCell(physicalCellIndex);
                if (cell.isMerged() && !cell.isFirstMerged()) {
                    logicalColumnIndex += 1;
                    physicalCellIndex += 1;
                    continue;
                }

                int colspan = 1;
                int lookaheadIndex = physicalCellIndex + 1;
                while (lookaheadIndex < row.numCells()) {
                    TableCell nextCell = row.getCell(lookaheadIndex);
                    if (nextCell.isMerged() && !nextCell.isFirstMerged()) {
                        colspan += 1;
                        lookaheadIndex += 1;
                        continue;
                    }
                    break;
                }

                colspan = Math.min(colspan, MAX_IMPORT_COLS - logicalColumnIndex);
                ensureParsedCellCapacity(rowCells, logicalColumnIndex + colspan);

                String text = cleanText(cell.text(), true);
                Map<String, Object> style = defaultTextStyle(true);
                style.putAll(extractCharacterStyle(firstCharacterRun(cell)));
                TemplateImportGridResponse.Border border = extractBorder(cell);

                int cellWidth = Math.max(36, Math.round((float) cell.getWidth() / TWIP_PER_PX));
                int widthPerColumn = Math.max(36, Math.round((float) cellWidth / Math.max(1, colspan)));
                for (int offset = 0; offset < colspan; offset += 1) {
                    int targetColumn = logicalColumnIndex + offset;
                    ensureSize(columnWidths, targetColumn + 1);
                    columnWidths.set(targetColumn, Math.max(columnWidths.get(targetColumn), widthPerColumn));
                }

                rowCells.set(logicalColumnIndex, new ParsedCell(text, style, border));
                for (int offset = 1; offset < colspan; offset += 1) {
                    rowCells.set(logicalColumnIndex + offset, ParsedCell.placeholder(style, border));
                }

                if (colspan > 1) {
                    mergedCells.add(new TemplateImportGridResponse.Range(
                            rowIndex + 1,
                            logicalColumnIndex + 1,
                            rowIndex + 1,
                            logicalColumnIndex + colspan
                    ));
                }

                if (cell.isFirstVerticallyMerged()) {
                    TemplateImportGridResponse.Range verticalRange = new TemplateImportGridResponse.Range(
                            rowIndex + 1,
                            logicalColumnIndex + 1,
                            rowIndex + 1,
                            logicalColumnIndex + colspan
                    );
                    verticalMergeMap.put(logicalColumnIndex, verticalRange);
                    mergedCells.add(verticalRange);
                } else if (cell.isVerticallyMerged()) {
                    TemplateImportGridResponse.Range range = verticalMergeMap.get(logicalColumnIndex);
                    if (range != null) {
                        verticalMergeMap.put(logicalColumnIndex, new TemplateImportGridResponse.Range(
                                range.t(),
                                range.l(),
                                rowIndex + 1,
                                Math.max(range.r(), logicalColumnIndex + colspan)
                        ));
                        mergedCells.set(mergedCells.indexOf(range), verticalMergeMap.get(logicalColumnIndex));
                    }
                } else {
                    verticalMergeMap.remove(logicalColumnIndex);
                }

                rowHeight = Math.max(
                        rowHeight,
                        estimateTextHeight(text, Math.max(widthPerColumn * colspan, DEFAULT_COLUMN_WIDTH), resolveFontSize(style))
                );

                logicalColumnIndex += colspan;
                physicalCellIndex = lookaheadIndex;
            }

            rows.add(new ParsedRow(rowHeight, rowCells));
        }

        return new ParsedTable(rows, trimTrailingZeros(columnWidths), normalizeMergedCells(mergedCells));
    }

    private ParsedGrid blocksToGrid(List<ParsedBlock> blocks) {
        List<Integer> rowHeights = new ArrayList<>();
        List<Integer> columnWidths = new ArrayList<>();
        List<TemplateImportGridResponse.Range> mergedCells = new ArrayList<>();
        Map<String, TemplateImportGridResponse.Cell> cells = new LinkedHashMap<>();

        int rowOffset = 0;
        for (ParsedBlock block : blocks) {
            if (rowOffset >= MAX_IMPORT_ROWS) {
                break;
            }
            if (block instanceof ParsedParagraphBlock paragraphBlock) {
                int width = Math.max(DEFAULT_COLUMN_WIDTH * 3, columnWidths.isEmpty() ? 0 : columnWidths.getFirst());
                int height = estimateTextHeight(paragraphBlock.text(), width, resolveFontSize(paragraphBlock.style()));
                ensureSize(columnWidths, 1);
                columnWidths.set(0, Math.max(columnWidths.get(0), width));
                rowHeights.add(height);
                cells.put(cellKey(rowOffset + 1, 1), new TemplateImportGridResponse.Cell(
                        paragraphBlock.text(),
                        paragraphBlock.style(),
                        null
                ));
                rowOffset += 1;
                continue;
            }

            ParsedTableBlock tableBlock = (ParsedTableBlock) block;
            ParsedTable table = tableBlock.table();
            for (int columnIndex = 0; columnIndex < table.columnWidths().size() && columnIndex < MAX_IMPORT_COLS; columnIndex += 1) {
                ensureSize(columnWidths, columnIndex + 1);
                columnWidths.set(columnIndex, Math.max(columnWidths.get(columnIndex), table.columnWidths().get(columnIndex)));
            }

            for (int localRowIndex = 0; localRowIndex < table.rows().size() && rowOffset < MAX_IMPORT_ROWS; localRowIndex += 1) {
                ParsedRow row = table.rows().get(localRowIndex);
                rowHeights.add(row.height());
                for (int columnIndex = 0; columnIndex < row.cells().size() && columnIndex < MAX_IMPORT_COLS; columnIndex += 1) {
                    ParsedCell cell = row.cells().get(columnIndex);
                    if (cell == null || cell.placeholder()) {
                        continue;
                    }
                    if ((cell.value() == null || cell.value().isBlank()) && cell.border() == null) {
                        continue;
                    }
                    cells.put(cellKey(rowOffset + 1, columnIndex + 1), new TemplateImportGridResponse.Cell(
                            cell.value(),
                            cell.style(),
                            cell.border()
                    ));
                }
                rowOffset += 1;
            }

            for (TemplateImportGridResponse.Range range : table.mergedCells()) {
                if (range.t() + rowOffset - table.rows().size() > MAX_IMPORT_ROWS || range.l() > MAX_IMPORT_COLS) {
                    continue;
                }
                mergedCells.add(new TemplateImportGridResponse.Range(
                        range.t() + rowOffset - table.rows().size(),
                        range.l(),
                        Math.min(range.b() + rowOffset - table.rows().size(), MAX_IMPORT_ROWS),
                        Math.min(range.r(), MAX_IMPORT_COLS)
                ));
            }
        }

        if (rowHeights.isEmpty()) {
            rowHeights.add(DEFAULT_ROW_HEIGHT);
        }
        if (columnWidths.isEmpty()) {
            columnWidths.add(DEFAULT_COLUMN_WIDTH);
        }

        return new ParsedGrid(
                trimLength(rowHeights, MAX_IMPORT_ROWS, DEFAULT_ROW_HEIGHT),
                trimLength(columnWidths, MAX_IMPORT_COLS, DEFAULT_COLUMN_WIDTH),
                cells,
                normalizeMergedCells(mergedCells)
        );
    }

    private String resolveOrientation(Range range) {
        if (range.numSections() == 0) {
            return "portrait";
        }
        Section section = range.getSection(0);
        return section.getPageWidth() > section.getPageHeight() ? "landscape" : "portrait";
    }

    private Map<String, Object> defaultTextStyle(boolean wrap) {
        LinkedHashMap<String, Object> style = new LinkedHashMap<>();
        style.put("textAlign", "left");
        style.put("verticalAlign", "middle");
        style.put("fontSize", 14);
        style.put("whiteSpace", wrap ? "normal" : "nowrap");
        if (wrap) {
            style.put("lineHeight", 1.5);
        }
        return style;
    }

    private Map<String, Object> extractParagraphStyle(Paragraph paragraph) {
        Map<String, Object> style = defaultTextStyle(true);
        style.putAll(extractCharacterStyle(firstCharacterRun(paragraph)));
        return style;
    }

    private Map<String, Object> extractCharacterStyle(CharacterRun characterRun) {
        LinkedHashMap<String, Object> style = new LinkedHashMap<>();
        if (characterRun == null) {
            return style;
        }
        if (characterRun.isBold()) {
            style.put("fontWeight", "bold");
        }
        if (characterRun.isItalic()) {
            style.put("fontStyle", "italic");
        }
        if (characterRun.getUnderlineCode() > 0) {
            style.put("textDecoration", "underline");
        }
        int fontSize = characterRun.getFontSize() > 0 ? Math.max(12, characterRun.getFontSize() / 2) : 14;
        style.put("fontSize", fontSize);
        return style;
    }

    private CharacterRun firstCharacterRun(Paragraph paragraph) {
        if (paragraph == null || paragraph.numCharacterRuns() == 0) {
            return null;
        }
        for (int index = 0; index < paragraph.numCharacterRuns(); index += 1) {
            CharacterRun run = paragraph.getCharacterRun(index);
            String text = cleanText(run.text(), false);
            if (!text.isBlank()) {
                return run;
            }
        }
        return paragraph.getCharacterRun(0);
    }

    private CharacterRun firstCharacterRun(TableCell cell) {
        if (cell == null || cell.numParagraphs() == 0) {
            return null;
        }
        for (int index = 0; index < cell.numParagraphs(); index += 1) {
            CharacterRun run = firstCharacterRun(cell.getParagraph(index));
            if (run != null) {
                return run;
            }
        }
        return null;
    }

    private TemplateImportGridResponse.Border extractBorder(TableCell cell) {
        boolean top = cell.getBrcTop() != null;
        boolean right = cell.getBrcRight() != null;
        boolean bottom = cell.getBrcBottom() != null;
        boolean left = cell.getBrcLeft() != null;
        return top || right || bottom || left
                ? new TemplateImportGridResponse.Border(top, right, bottom, left)
                : null;
    }

    private String cleanText(String text, boolean preserveLineBreaks) {
        if (text == null) {
            return "";
        }
        String normalized = text
                .replace('\u0007', preserveLineBreaks ? '\n' : ' ')
                .replace('\r', '\n')
                .replace('\u000b', '\n')
                .replace('\u000c', '\n')
                .replace('\u00a0', ' ');
        normalized = CONTROL_CHARS.matcher(normalized).replaceAll(" ");
        normalized = normalized.replaceAll("[ \\t]+", " ");
        normalized = normalized.replaceAll("\\n{3,}", "\n\n");
        return preserveLineBreaks ? normalized.trim() : normalized.replace('\n', ' ').trim();
    }

    private int resolveFontSize(Map<String, Object> style) {
        Object value = style.get("fontSize");
        return value instanceof Number number ? number.intValue() : 14;
    }

    private int estimateTextHeight(String text, int width, int fontSize) {
        int safeWidth = Math.max(36, width);
        int charsPerLine = Math.max(1, (int) Math.floor(safeWidth / Math.max(7d, fontSize * 0.56d)));
        int lineCount = 0;
        for (String line : text.split("\\R", -1)) {
            int visualWidth = line.codePoints().map(codePoint -> codePoint > 0xff ? 2 : 1).sum();
            lineCount += Math.max(1, (int) Math.ceil(Math.max(1, visualWidth) / (double) charsPerLine));
        }
        return Math.max(DEFAULT_ROW_HEIGHT, (int) Math.ceil(lineCount * fontSize * 1.5d + 8));
    }

    private String cellKey(int row, int col) {
        return row + ":" + col;
    }

    private List<TemplateImportGridResponse.Range> normalizeMergedCells(List<TemplateImportGridResponse.Range> ranges) {
        LinkedHashMap<String, TemplateImportGridResponse.Range> merged = new LinkedHashMap<>();
        for (TemplateImportGridResponse.Range range : ranges) {
            if (range == null || (range.t() == range.b() && range.l() == range.r())) {
                continue;
            }
            String key = range.t() + ":" + range.l();
            TemplateImportGridResponse.Range existing = merged.get(key);
            if (existing == null) {
                merged.put(key, range);
                continue;
            }
            merged.put(key, new TemplateImportGridResponse.Range(
                    existing.t(),
                    existing.l(),
                    Math.max(existing.b(), range.b()),
                    Math.max(existing.r(), range.r())
            ));
        }
        return new ArrayList<>(merged.values());
    }

    private List<Integer> trimTrailingZeros(List<Integer> values) {
        int size = values.size();
        while (size > 0 && values.get(size - 1) == 0) {
            size -= 1;
        }
        if (size == 0) {
            return List.of(DEFAULT_COLUMN_WIDTH);
        }
        List<Integer> trimmed = new ArrayList<>(size);
        for (int index = 0; index < size; index += 1) {
            trimmed.add(Math.max(36, values.get(index)));
        }
        return trimmed;
    }

    private List<Integer> trimLength(List<Integer> values, int maxSize, int fallback) {
        int size = Math.min(Math.max(values.size(), 1), maxSize);
        List<Integer> normalized = new ArrayList<>(size);
        for (int index = 0; index < size; index += 1) {
            normalized.add(index < values.size() ? values.get(index) : fallback);
        }
        return normalized;
    }

    private void ensureSize(List<Integer> values, int size) {
        while (values.size() < size) {
            values.add(0);
        }
    }

    private void ensureParsedCellCapacity(List<ParsedCell> values, int size) {
        while (values.size() < size) {
            values.add(null);
        }
    }

    private sealed interface ParsedBlock permits ParsedParagraphBlock, ParsedTableBlock {
    }

    private record ParsedParagraphBlock(String text, Map<String, Object> style) implements ParsedBlock {
    }

    private record ParsedTableBlock(ParsedTable table) implements ParsedBlock {
    }

    private record ParsedTable(
            List<ParsedRow> rows,
            List<Integer> columnWidths,
            List<TemplateImportGridResponse.Range> mergedCells
    ) {
    }

    private record ParsedRow(int height, List<ParsedCell> cells) {
    }

    private record ParsedCell(
            String value,
            Map<String, Object> style,
            TemplateImportGridResponse.Border border,
            boolean placeholder
    ) {
        private ParsedCell(String value, Map<String, Object> style, TemplateImportGridResponse.Border border) {
            this(value, style, border, false);
        }

        static ParsedCell placeholder(Map<String, Object> style, TemplateImportGridResponse.Border border) {
            return new ParsedCell("", style, border, true);
        }
    }

    private record ParsedGrid(
            List<Integer> rowHeights,
            List<Integer> columnWidths,
            Map<String, TemplateImportGridResponse.Cell> cells,
            List<TemplateImportGridResponse.Range> mergedCells
    ) {
    }
}
