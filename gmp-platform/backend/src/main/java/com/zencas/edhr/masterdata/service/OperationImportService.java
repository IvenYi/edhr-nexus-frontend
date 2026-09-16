package com.zencas.edhr.masterdata.service;

import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.masterdata.dto.OperationImportResult;
import com.zencas.edhr.masterdata.entity.Operation;
import com.zencas.edhr.masterdata.entity.OperationCategory;
import com.zencas.edhr.masterdata.repository.OperationCategoryRepository;
import com.zencas.edhr.masterdata.repository.OperationRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddressList;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OperationImportService {
    private static final String TENANT_ID = "default";
    private static final int MAX_IMPORT_ROWS = 1000;
    private static final List<String> HEADERS = List.of("工序名称", "工序编码", "工序分类", "默认工序类型", "标准工时", "状态", "工序通用描述");
    private static final List<String> TYPES = List.of("普通工序", "关键工序", "特殊过程", "检验工序", "外协工序");
    private final OperationRepository operationRepository;
    private final OperationCategoryRepository categoryRepository;
    private final SnowflakeIdGenerator idGenerator;

    public byte[] createTemplate() throws IOException {
        try (var workbook = new XSSFWorkbook(); var output = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet("工序导入模板");
            var headerStyle = workbook.createCellStyle();
            var font = workbook.createFont();
            font.setBold(true);
            font.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor((short) 31);
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            var header = sheet.createRow(0);
            header.setHeightInPoints(26);
            int[] widths = {24, 22, 22, 20, 18, 14, 48};
            for (int column = 0; column < HEADERS.size(); column++) {
                var cell = header.createCell(column);
                cell.setCellValue(HEADERS.get(column) + (column < 2 ? " *" : ""));
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(column, widths[column] * 256);
            }
            List<String> categories = categoryRepository.findByTenantIdOrderBySortOrderAscNameAsc(TENANT_ID).stream()
                    .map(OperationCategory::getName).filter(StringUtils::hasText).toList();
            String[] example = {"示例工序", "OP-001", categories.isEmpty() ? "" : categories.get(0), "普通工序", "30", "启用", "请删除示例行后导入"};
            var row = sheet.createRow(1);
            for (int i = 0; i < example.length; i++) row.createCell(i).setCellValue(example[i]);
            if (!categories.isEmpty()) addDropdown(sheet, 2, categories, true);
            addDropdown(sheet, 3, TYPES, false);
            addDropdown(sheet, 5, List.of("启用", "禁用"), false);
            sheet.createFreezePane(0, 1);
            sheet.setAutoFilter(new org.apache.poi.ss.util.CellRangeAddress(0, 1, 0, HEADERS.size() - 1));
            var instructions = workbook.createSheet("填写说明");
            String[][] notes = {
                    {"填写项目", "填写要求"},
                    {"必填标记", "带 * 的列为必填：工序名称、工序编码。名称最多 128 字，编码最多 64 字。"},
                    {"填写范围", "从第 2 行填写，单次最多 1000 条；删除示例行，保留表头及列顺序。"},
                    {"工序分类", "选填，最多 128 字；可选内置分类，也可填写新分类，导入成功时自动建立；留空归为未分类。"},
                    {"默认工序类型", "选填，从下拉列表选择；留空默认普通工序。"},
                    {"标准工时", "选填，单位分钟，填写 0 至 2147483647 的整数。"},
                    {"状态", "选填，选择启用或禁用，兼容 ACTIVE / DISABLED；留空默认启用。"},
                    {"工序通用描述", "选填，填写工序的通用作业说明。"},
                    {"导入结果", "编码重复（忽略大小写）跳过，不覆盖已有工序；无效行返回行号和原因，合法新工序保存并记录审计。"},
                    {"异常处理", "数据库或审计异常时整批回滚，包括本批新增分类；系统分类更新后请重新下载模板。"}
            };
            var noteStyle = workbook.createCellStyle();
            noteStyle.setWrapText(true);
            noteStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            for (int i = 0; i < notes.length; i++) {
                var note = instructions.createRow(i);
                note.setHeightInPoints(i == 0 ? 26 : 42);
                for (int j = 0; j < 2; j++) {
                    var cell = note.createCell(j);
                    cell.setCellValue(notes[i][j]);
                    cell.setCellStyle(i == 0 ? headerStyle : noteStyle);
                }
            }
            instructions.setColumnWidth(0, 24 * 256);
            instructions.setColumnWidth(1, 90 * 256);
            instructions.createFreezePane(0, 1);
            workbook.write(output);
            return output.toByteArray();
        }
    }

    private void addDropdown(XSSFSheet sheet, int column, List<String> options, boolean allowNew) {
        var workbook = sheet.getWorkbook();
        var optionSheet = workbook.createSheet("选项" + column);
        for (int i = 0; i < options.size(); i++) optionSheet.createRow(i).createCell(0).setCellValue(options.get(i));
        var range = workbook.createName();
        range.setNameName("Options" + column);
        range.setRefersToFormula("'" + optionSheet.getSheetName() + "'!$A$1:$A$" + options.size());
        workbook.setSheetHidden(workbook.getSheetIndex(optionSheet), true);
        var helper = sheet.getDataValidationHelper();
        var validation = helper.createValidation(helper.createFormulaListConstraint(range.getNameName()),
                new CellRangeAddressList(1, MAX_IMPORT_ROWS, column, column));
        validation.setSuppressDropDownArrow(true);
        validation.setEmptyCellAllowed(true);
        validation.setErrorStyle(DataValidation.ErrorStyle.STOP);
        validation.createErrorBox("请选择有效选项", "请从下拉列表中选择" + HEADERS.get(column));
        validation.setShowErrorBox(!allowNew);
        validation.createPromptBox(HEADERS.get(column), allowNew ? "选填，可选择已有分类或填写新分类。" : "选填，请从下拉列表选择。");
        validation.setShowPromptBox(true);
        sheet.addValidationData(validation);
    }

    public OperationImportResult importWorkbook(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) throw invalid("导入文件不能为空");
        if (file.getOriginalFilename() == null || !file.getOriginalFilename().toLowerCase(Locale.ROOT).endsWith(".xlsx")) {
            throw invalid("仅支持导入 .xlsx 文件");
        }
        List<OperationImportResult.RowResult> skipped = new ArrayList<>();
        List<OperationImportResult.RowResult> failed = new ArrayList<>();
        List<Operation> imported = new ArrayList<>();
        Set<String> seenCodes = new HashSet<>();
        String operator = StringUtils.hasText(AuditContext.getOperatorName()) ? AuditContext.getOperatorName()
                : StringUtils.hasText(AuditContext.getOperatorAccount()) ? AuditContext.getOperatorAccount() : "系统管理员";
        try (var workbook = openWorkbook(file)) {
            if (workbook.getNumberOfSheets() == 0) throw invalid("导入文件缺少数据工作表");
            var sheet = workbook.getSheetAt(0);
            for (int i = 0; i < HEADERS.size(); i++) {
                String header = text(sheet.getRow(0), i);
                if (!header.equals(HEADERS.get(i)) && !header.equals(HEADERS.get(i) + " *")) throw invalid("模板表头不正确，请重新下载工序导入模板");
            }
            if (sheet.getLastRowNum() > MAX_IMPORT_ROWS) throw invalid("单次最多导入1000条工序数据");
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                var row = sheet.getRow(i);
                List<String> values = new ArrayList<>();
                for (int j = 0; j < HEADERS.size(); j++) values.add(text(row, j));
                if (values.stream().allMatch(String::isEmpty)) continue;
                String name = values.get(0), code = values.get(1), category = values.get(2);
                String type = values.get(3).isEmpty() ? "普通工序" : values.get(3);
                String duration = values.get(4), status = values.get(5);
                String reason = validationError(name, code, category, type, duration, status);
                if (reason != null) {
                    failed.add(new OperationImportResult.RowResult(i + 1, code, name, reason));
                    continue;
                }
                if (!seenCodes.add(code.toLowerCase(Locale.ROOT)) || !operationRepository.findByTenantIdAndCodeIgnoreCase(TENANT_ID, code).isEmpty()) {
                    skipped.add(new OperationImportResult.RowResult(i + 1, code, name, "工序编码已存在或在文件中重复"));
                    continue;
                }
                if (!category.isEmpty()) category = resolveCategory(category, operator);
                var operation = Operation.builder().id(idGenerator.nextId()).tenantId(TENANT_ID).name(name).code(code)
                        .operationCategory(category.isEmpty() ? null : category).defaultOperationType(type)
                        .defaultDurationMinutes(duration.isEmpty() ? null : Integer.valueOf(duration))
                        .status(status.equals("禁用") || status.equals("DISABLED") ? "DISABLED" : "ACTIVE")
                        .generalDescription(values.get(6).isEmpty() ? null : values.get(6))
                        .createdBy(operator).updatedBy(operator).build();
                imported.add(operationRepository.save(operation));
            }
        }
        return new OperationImportResult(imported.size(), skipped, failed, imported);
    }

    private String validationError(String name, String code, String category, String type, String duration, String status) {
        if (name.isEmpty()) return "工序名称不能为空";
        if (code.isEmpty()) return "工序编码不能为空";
        if (name.length() > 128) return "工序名称不能超过128个字符";
        if (code.length() > 64) return "工序编码不能超过64个字符";
        if (category.length() > 128) return "工序分类不能超过128个字符";
        if (!TYPES.contains(type)) return "默认工序类型不正确";
        if (!duration.isEmpty()) {
            try {
                if (!duration.matches("[0-9]+") || Integer.parseInt(duration) < 0) return "标准工时须为0至2147483647的整数分钟";
            } catch (NumberFormatException exception) {
                return "标准工时须为0至2147483647的整数分钟";
            }
        }
        if (!List.of("", "启用", "禁用", "ACTIVE", "DISABLED").contains(status)) return "状态须为启用或禁用";
        return null;
    }

    private String resolveCategory(String name, String operator) {
        return categoryRepository.findByTenantIdAndNameIgnoreCase(TENANT_ID, name).orElseGet(() -> {
            int nextOrder = categoryRepository.findByTenantIdOrderBySortOrderAscNameAsc(TENANT_ID).stream()
                    .map(OperationCategory::getSortOrder).filter(Objects::nonNull).max(Integer::compareTo).orElse(-1) + 1;
            return categoryRepository.save(OperationCategory.builder().id(idGenerator.nextId()).tenantId(TENANT_ID)
                    .name(name).sortOrder(nextOrder).createdBy(operator).updatedBy(operator).build());
        }).getName();
    }

    private XSSFWorkbook openWorkbook(MultipartFile file) {
        try (var input = file.getInputStream()) {
            return new XSSFWorkbook(input);
        } catch (Exception exception) {
            throw invalid("无法读取 .xlsx 文件，请重新下载模板并填写");
        }
    }

    private String text(Row row, int column) {
        if (row == null) return "";
        var cell = row.getCell(column, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (column == 4 && cell != null && cell.getCellType() == CellType.NUMERIC) {
            return java.math.BigDecimal.valueOf(cell.getNumericCellValue()).stripTrailingZeros().toPlainString();
        }
        return cell == null ? "" : new DataFormatter(Locale.ROOT).formatCellValue(cell).trim();
    }

    private BusinessException invalid(String message) { return new BusinessException(ErrorCode.GENERAL_001, message); }
}
