package com.zencas.edhr.masterdata.service;

import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.RdoVersionStatusResolver;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.masterdata.dto.MaterialImportResult;
import com.zencas.edhr.masterdata.entity.Material;
import com.zencas.edhr.masterdata.entity.MaterialType;
import com.zencas.edhr.masterdata.repository.MaterialRepository;
import com.zencas.edhr.masterdata.repository.MaterialTypeRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.DataValidation;
import org.apache.poi.ss.usermodel.DataValidationConstraint;
import org.apache.poi.ss.usermodel.DataValidationHelper;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.ss.util.CellRangeAddressList;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class MaterialImportService {

    private static final String TENANT_ID = "default";
    private static final int MAX_IMPORT_ROWS = 1000;
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("uuuu-MM-dd HH:mm:ss").withResolverStyle(java.time.format.ResolverStyle.STRICT);
    private static final List<String> HEADERS = List.of(
            "物料名称", "物料料号", "品牌名称", "规格型号", "物料类型", "单位", "物料用途", "物料版本", "生效日期", "失效日期", "版本说明");
    private static final Set<Integer> REQUIRED_COLUMNS = Set.of(0, 1, 4, 7);
    private static final Set<String> MATERIAL_PURPOSES = Set.of("试验物料", "生产物料");
    private static final List<String> MATERIAL_PURPOSE_OPTIONS = List.of("试验物料", "生产物料");

    private final MaterialRepository materialRepository;
    private final MaterialTypeRepository materialTypeRepository;
    private final SnowflakeIdGenerator idGenerator;

    public byte[] createTemplate() throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet("物料导入模板");
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor((short) 31);
            headerStyle.setFillPattern(org.apache.poi.ss.usermodel.FillPatternType.SOLID_FOREGROUND);
            headerFont.setColor((short) 9);

            Row header = sheet.createRow(0);
            header.setHeightInPoints(26);
            int[] widths = {24, 22, 20, 24, 18, 12, 18, 16, 24, 24, 32};
            for (int column = 0; column < HEADERS.size(); column++) {
                Cell cell = header.createCell(column);
                cell.setCellValue(templateHeader(column));
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(column, widths[column] * 256);
            }
            List<String> typeOptions = materialTypes().values().stream().map(MaterialType::getName).toList();
            Row example = sheet.createRow(1);
            String[] values = {"示例物料", "MAT-001", "示例品牌", "规格型号", typeOptions.isEmpty() ? "" : typeOptions.get(0), "PCS", "生产物料", "V1.0", "2026-01-01 00:00:00", "", "请删除示例行后导入"};
            for (int column = 0; column < values.length; column++) example.createCell(column).setCellValue(values[column]);
            if (!typeOptions.isEmpty()) addDropdown(sheet, 4, typeOptions);
            addDropdown(sheet, 6, MATERIAL_PURPOSE_OPTIONS);
            sheet.createFreezePane(0, 1);
            sheet.setAutoFilter(new org.apache.poi.ss.util.CellRangeAddress(0, 1, 0, HEADERS.size() - 1));
            var instructions = workbook.createSheet("填写说明");
            String[][] notes = {
                    {"填写项目", "填写要求"},
                    {"必填标记", "带 * 的列为必填：物料名称、物料料号、物料类型、物料版本。"},
                    {"填写范围", "从第 2 行开始填写，单次最多 1000 条；导入前删除示例行，保留表头及列顺序。"},
                    {"物料类型 *", "在 E 列下拉选择；选项已随模板内置，无需联网。系统类型更新后请重新下载模板。"},
                    {"物料用途", "在 G 列选择“试验物料”或“生产物料”；可留空，导入时默认“生产物料”。"},
                    {"物料名称 / 料号", "物料名称最多 128 字，物料料号最多 64 字；料号与版本共同确定一条物料版本。"},
                    {"品牌 / 规格 / 单位", "均为选填；品牌最多 255 字，规格型号最多 128 字，单位最多 32 字。"},
                    {"物料版本 *", "如 V1.0，最多 64 字。同一料号的不同版本须保持名称、品牌、规格、类型、单位和用途一致。"},
                    {"生效 / 失效日期", "选填，格式 yyyy-MM-dd HH:mm:ss，如 2026-01-01 00:00:00；生效日期不能晚于失效日期。"},
                    {"导入结果", "合法新版本导入，重复料号和版本跳过，无效行返回行号及原因；数据库或审计异常时整体回滚。"}
            };
            CellStyle noteStyle = workbook.createCellStyle();
            noteStyle.setWrapText(true);
            noteStyle.setVerticalAlignment(org.apache.poi.ss.usermodel.VerticalAlignment.CENTER);
            for (int index = 0; index < notes.length; index++) {
                Row row = instructions.createRow(index);
                row.setHeightInPoints(index == 0 ? 26 : 42);
                for (int column = 0; column < 2; column++) {
                    Cell cell = row.createCell(column);
                    cell.setCellValue(notes[index][column]);
                    cell.setCellStyle(index == 0 ? headerStyle : noteStyle);
                }
            }
            instructions.setColumnWidth(0, 24 * 256);
            instructions.setColumnWidth(1, 90 * 256);
            instructions.createFreezePane(0, 1);
            workbook.write(output);
            return output.toByteArray();
        }
    }

    private void addDropdown(org.apache.poi.xssf.usermodel.XSSFSheet sheet, int column, List<String> options) {
        DataValidationHelper validationHelper = sheet.getDataValidationHelper();
        var workbook = sheet.getWorkbook();
        String optionSheetName = "选项" + column;
        var optionSheet = workbook.createSheet(optionSheetName);
        for (int index = 0; index < options.size(); index++) optionSheet.createRow(index).createCell(0).setCellValue(options.get(index));
        var range = workbook.createName();
        range.setNameName("Options" + column);
        range.setRefersToFormula("'" + optionSheetName + "'!$A$1:$A$" + options.size());
        workbook.setSheetHidden(workbook.getSheetIndex(optionSheet), true);
        DataValidationConstraint constraint = validationHelper.createFormulaListConstraint(range.getNameName());
        DataValidation validation = validationHelper.createValidation(constraint, new CellRangeAddressList(1, MAX_IMPORT_ROWS, column, column));
        validation.setSuppressDropDownArrow(true);
        validation.setEmptyCellAllowed(!REQUIRED_COLUMNS.contains(column));
        validation.setErrorStyle(DataValidation.ErrorStyle.STOP);
        validation.createErrorBox("请选择有效选项", "请从下拉列表中选择" + HEADERS.get(column) + "，不要输入列表外的内容。");
        validation.setShowErrorBox(true);
        validation.createPromptBox(HEADERS.get(column), REQUIRED_COLUMNS.contains(column) ? "必填，请从下拉列表选择。" : "选填，请从下拉列表选择；留空默认生产物料。");
        validation.setShowPromptBox(true);
        sheet.addValidationData(validation);
    }

    public MaterialImportResult importWorkbook(MultipartFile file) throws IOException {
        validateFile(file);
        List<MaterialImportResult.RowResult> skippedRows = new ArrayList<>();
        List<MaterialImportResult.RowResult> failedRows = new ArrayList<>();
        List<Material> importedMaterials = new ArrayList<>();
        Map<String, List<Material>> databaseMaterialsByCode = new HashMap<>();
        Map<String, MaterialType> materialTypes = materialTypes();
        Map<String, ParentData> parentDataByCode = new HashMap<>();
        Set<String> seenCodeVersions = new HashSet<>();

        try (XSSFWorkbook workbook = new XSSFWorkbook(file.getInputStream())) {
            var sheet = workbook.getSheetAt(0);
            validateHeaders(sheet.getRow(0));
            if (sheet.getLastRowNum() > MAX_IMPORT_ROWS) {
                throw new BusinessException(ErrorCode.GENERAL_001, "单次最多导入1000条物料数据");
            }
            for (int index = 1; index <= sheet.getLastRowNum(); index++) {
                Row row = sheet.getRow(index);
                if (isBlankRow(row)) continue;
                int rowNumber = index + 1;
                ParsedRow parsed = parseRow(row, rowNumber, failedRows, materialTypes);
                if (parsed == null) continue;
                String codeKey = normalizedKey(parsed.code());
                String codeVersionKey = codeKey + "::" + normalizedKey(parsed.version());
                if (!seenCodeVersions.add(codeVersionKey)) {
                    skippedRows.add(result(rowNumber, parsed, "物料料号和版本在文件中重复"));
                    continue;
                }
                List<Material> existingMaterials = databaseMaterialsByCode.computeIfAbsent(codeKey, ignored -> materialRepository
                        .findByTenantIdAndCodeIgnoreCase(TENANT_ID, parsed.code()));
                if (existingMaterials.stream().anyMatch(material -> normalizedKey(material.getVersion()).equals(normalizedKey(parsed.version())))) {
                    skippedRows.add(result(rowNumber, parsed, "物料料号和版本已存在"));
                    continue;
                }
                if (existingMaterials.stream().anyMatch(material -> !parentData(material).equals(parsed.parentData()))) {
                    failedRows.add(result(rowNumber, parsed, "与已有物料的基础信息不一致，请先统一基础信息"));
                    continue;
                }
                ParentData previousParent = parentDataByCode.get(codeKey);
                if (previousParent != null && !previousParent.equals(parsed.parentData())) {
                    failedRows.add(result(rowNumber, parsed, "同一物料料号的父数据不一致"));
                    continue;
                }
                Material saved = materialRepository.save(toMaterial(parsed));
                parentDataByCode.putIfAbsent(codeKey, parsed.parentData());
                importedMaterials.add(saved);
            }
        } catch (BusinessException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new BusinessException(ErrorCode.GENERAL_001, "物料导入失败: " + exception.getMessage());
        }
        return new MaterialImportResult(importedMaterials.size(), skippedRows, failedRows, importedMaterials);
    }

    private ParsedRow parseRow(Row row, int rowNumber, List<MaterialImportResult.RowResult> failedRows, Map<String, MaterialType> materialTypes) {
        String name = text(row, 0);
        String code = text(row, 1);
        String brandName = text(row, 2);
        String specification = text(row, 3);
        String materialTypeName = text(row, 4);
        String unit = text(row, 5);
        String materialPurpose = text(row, 6);
        String version = text(row, 7);
        String effectiveDateText = text(row, 8);
        String expiryDateText = text(row, 9);
        String description = text(row, 10);
        if (!StringUtils.hasText(name)) return fail(failedRows, rowNumber, code, version, "物料名称不能为空");
        if (!StringUtils.hasText(code)) return fail(failedRows, rowNumber, code, version, "物料料号不能为空");
        if (!StringUtils.hasText(version)) return fail(failedRows, rowNumber, code, version, "物料版本不能为空");

        if (!StringUtils.hasText(materialTypeName)) return fail(failedRows, rowNumber, code, version, "物料类型不能为空");
        MaterialType materialType = materialTypes.get(normalizedKey(materialTypeName));
        if (materialType == null) return fail(failedRows, rowNumber, code, version, "物料类型不存在");
        if (name.length() > 128) return fail(failedRows, rowNumber, code, version, "物料名称不能超过128个字符");
        if (code.length() > 64) return fail(failedRows, rowNumber, code, version, "物料料号不能超过64个字符");
        if (version.length() > 64) return fail(failedRows, rowNumber, code, version, "物料版本不能超过64个字符");
        if (brandName.length() > 255) return fail(failedRows, rowNumber, code, version, "品牌不能超过255个字符");
        if (specification.length() > 128) return fail(failedRows, rowNumber, code, version, "规格型号不能超过128个字符");
        if (unit.length() > 32) return fail(failedRows, rowNumber, code, version, "单位不能超过32个字符");
        String resolvedPurpose = StringUtils.hasText(materialPurpose) ? materialPurpose : "生产物料";
        if (!MATERIAL_PURPOSES.contains(resolvedPurpose)) return fail(failedRows, rowNumber, code, version, "物料用途不正确");
        LocalDateTime effectiveDate = parseDate(effectiveDateText, rowNumber, code, version, "生效日期", failedRows);
        if (StringUtils.hasText(effectiveDateText) && effectiveDate == null) return null;
        LocalDateTime expiryDate = parseDate(expiryDateText, rowNumber, code, version, "失效日期", failedRows);
        if (StringUtils.hasText(expiryDateText) && expiryDate == null) return null;
        if (effectiveDate != null && expiryDate != null && effectiveDate.isAfter(expiryDate)) {
            return fail(failedRows, rowNumber, code, version, "生效日期不能晚于失效日期");
        }
        return new ParsedRow(name, code, brandName, specification, materialType, unit, resolvedPurpose, version, effectiveDate, expiryDate, description);
    }

    private Map<String, MaterialType> materialTypes() {
        return materialTypeRepository.findAll().stream()
                .filter(type -> type != null && StringUtils.hasText(type.getName()))
                .collect(java.util.stream.Collectors.toMap(type -> normalizedKey(type.getName()), type -> type, (left, right) -> left, LinkedHashMap::new));
    }

    private ParentData parentData(Material material) {
        return new ParentData(material.getName(), emptyToNull(material.getBrandName()), emptyToNull(material.getSpecification()),
                material.getMaterialTypeId(), emptyToNull(material.getUnit()), material.getMaterialPurpose());
    }

    private Material toMaterial(ParsedRow row) {
        LocalDateTime now = LocalDateTime.now();
        String operator = currentOperatorName();
        return Material.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .code(row.code())
                .name(row.name())
                .brandName(emptyToNull(row.brandName()))
                .specification(emptyToNull(row.specification()))
                .materialTypeId(row.materialType() == null ? null : row.materialType().getId())
                .unit(emptyToNull(row.unit()))
                .materialPurpose(row.materialPurpose())
                .version(row.version())
                .effectiveDate(row.effectiveDate())
                .expiryDate(row.expiryDate())
                .description(emptyToNull(row.description()))
                .status(RdoVersionStatusResolver.resolve(row.effectiveDate(), row.expiryDate()))
                .createdBy(operator)
                .createdAt(now)
                .updatedBy(operator)
                .updatedAt(now)
                .build();
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new BusinessException(ErrorCode.GENERAL_001, "导入文件不能为空");
        String name = file.getOriginalFilename();
        if (name == null || !name.toLowerCase(Locale.ROOT).endsWith(".xlsx")) {
            throw new BusinessException(ErrorCode.GENERAL_001, "仅支持导入 .xlsx 文件");
        }
    }

    private void validateHeaders(Row header) {
        for (int index = 0; index < HEADERS.size(); index++) {
            String value = text(header, index);
            if (!HEADERS.get(index).equals(value) && !templateHeader(index).equals(value)) {
                throw new BusinessException(ErrorCode.GENERAL_001, "导入模板表头不正确，请下载标准模板后重试");
            }
        }
    }

    private String templateHeader(int column) {
        return HEADERS.get(column) + (REQUIRED_COLUMNS.contains(column) ? " *" : "");
    }

    private LocalDateTime parseDate(String value, int rowNumber, String code, String version, String label, List<MaterialImportResult.RowResult> failedRows) {
        if (!StringUtils.hasText(value)) return null;
        try {
            return LocalDateTime.parse(value, DATE_TIME_FORMATTER);
        } catch (DateTimeParseException exception) {
            failedRows.add(new MaterialImportResult.RowResult(rowNumber, code, version, label + "格式不正确"));
            return null;
        }
    }

    private ParsedRow fail(List<MaterialImportResult.RowResult> failedRows, int rowNumber, String code, String version, String reason) {
        failedRows.add(new MaterialImportResult.RowResult(rowNumber, code, version, reason));
        return null;
    }

    private MaterialImportResult.RowResult result(int rowNumber, ParsedRow row, String reason) {
        return new MaterialImportResult.RowResult(rowNumber, row.code(), row.version(), reason);
    }

    private boolean isBlankRow(Row row) {
        if (row == null) return true;
        for (int index = 0; index < HEADERS.size(); index++) {
            if (StringUtils.hasText(text(row, index))) return false;
        }
        return true;
    }

    private String text(Row row, int column) {
        if (row == null) return "";
        Cell cell = row.getCell(column, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        return cell == null ? "" : new DataFormatter().formatCellValue(cell).trim();
    }

    private String emptyToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String normalizedKey(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private String currentOperatorName() {
        if (StringUtils.hasText(AuditContext.getOperatorName())) return AuditContext.getOperatorName();
        if (StringUtils.hasText(AuditContext.getOperatorAccount())) return AuditContext.getOperatorAccount();
        return "系统管理员";
    }

    private record ParsedRow(String name, String code, String brandName, String specification, MaterialType materialType,
                             String unit, String materialPurpose, String version, LocalDateTime effectiveDate,
                             LocalDateTime expiryDate, String description) {
        ParentData parentData() {
            return new ParentData(name, brandName.isBlank() ? null : brandName, specification.isBlank() ? null : specification, materialType.getId(), unit.isBlank() ? null : unit, materialPurpose);
        }
    }

    private record ParentData(String name, String brandName, String specification, Long materialTypeId, String unit, String materialPurpose) {
    }
}
