package com.zencas.edhr.masterdata.service;

import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.masterdata.dto.MaterialImportResult;
import com.zencas.edhr.masterdata.entity.Material;
import com.zencas.edhr.masterdata.entity.MaterialType;
import com.zencas.edhr.masterdata.repository.MaterialRepository;
import com.zencas.edhr.masterdata.repository.MaterialTypeRepository;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MaterialImportServiceTest {

    @Mock private MaterialRepository materialRepository;
    @Mock private MaterialTypeRepository materialTypeRepository;

    @Test
    void templateContainsRequiredMaterialImportHeaders() throws Exception {
        when(materialTypeRepository.findAll()).thenReturn(List.of(type("自定义类型", 1L), type("原材料", 2L)));
        MaterialImportService service = service();

        try (XSSFWorkbook workbook = new XSSFWorkbook(new ByteArrayInputStream(service.createTemplate()))) {
            assertThat(IntStream.range(0, 11)
                    .mapToObj(index -> workbook.getSheetAt(0).getRow(0).getCell(index).getStringCellValue())
                    .toList())
                    .containsExactly("物料名称", "物料料号", "品牌名称", "规格型号", "物料类型", "单位", "物料用途", "物料版本", "生效日期", "失效日期", "版本说明");
        }
    }

    @Test
    void templateProvidesDropdownsForMaterialTypeAndPurpose() throws Exception {
        when(materialTypeRepository.findAll()).thenReturn(List.of(type("自定义类型", 1L), type("原材料", 2L)));
        MaterialImportService service = service();

        try (XSSFWorkbook workbook = new XSSFWorkbook(new ByteArrayInputStream(service.createTemplate()))) {
            var validations = workbook.getSheetAt(0).getDataValidations();

            assertThat(validations).hasSize(2);
            assertThat(workbook.getSheet("选项4").getRow(0).getCell(0).getStringCellValue()).isEqualTo("自定义类型");
            assertThat(workbook.getSheet("选项4").getRow(1).getCell(0).getStringCellValue()).isEqualTo("原材料");
            assertThat(workbook.getSheet("选项6").getRow(0).getCell(0).getStringCellValue()).isEqualTo("试验物料");
            assertThat(validations.get(0).getRegions().getCellRangeAddresses()[0].getFirstRow()).isEqualTo(1);
            assertThat(validations.get(0).getRegions().getCellRangeAddresses()[0].getLastRow()).isEqualTo(1000);
            assertThat(validations.get(0).getRegions().getCellRangeAddresses()[0].getFirstColumn()).isEqualTo(4);
            assertThat(validations.get(1).getRegions().getCellRangeAddresses()[0].getFirstColumn()).isEqualTo(6);
        }
    }

    @Test
    void importSkipsExistingVersionAndSavesOtherValidRows() throws Exception {
        when(materialRepository.findByTenantIdAndCodeIgnoreCase("default", "MAT-01"))
                .thenReturn(List.of(existing("MAT-01", "V1.0")));
        when(materialTypeRepository.findAll()).thenReturn(List.of(type("原材料", 1L)));
        MaterialImportResult result = service().importWorkbook(workbookFile(
                row("螺钉", "MAT-01", "品牌A", "M3", "原材料", "PCS", "生产物料", "V1.0", "", "", ""),
                row("螺钉", "MAT-01", "品牌A", "M3", "原材料", "PCS", "生产物料", "V2.0", "", "", "")));

        assertThat(result.successCount()).isEqualTo(1);
        assertThat(result.skippedRows()).singleElement()
                .extracting(MaterialImportResult.RowResult::reason)
                .isEqualTo("物料料号和版本已存在");
        verify(materialRepository).save(argThat(material -> "V2.0".equals(material.getVersion())
                && "品牌A".equals(material.getBrandName())));
    }

    @Test
    void importReportsInvalidRowsWithoutBlockingOtherRows() throws Exception {
        when(materialRepository.findByTenantIdAndCodeIgnoreCase("default", "MAT-02")).thenReturn(List.of());
        when(materialTypeRepository.findAll()).thenReturn(List.of(type("原材料", 1L)));
        MaterialImportResult result = service().importWorkbook(workbookFile(
                row("", "MAT-01", "", "", "原材料", "PCS", "生产物料", "V1.0", "", "", ""),
                row("螺母", "MAT-02", "", "M4", "原材料", "PCS", "生产物料", "V1.0", "", "", "")));

        assertThat(result.successCount()).isEqualTo(1);
        assertThat(result.failedRows()).singleElement()
                .extracting(MaterialImportResult.RowResult::reason)
                .isEqualTo("物料名称不能为空");
        verify(materialRepository).save(argThat(material -> "MAT-02".equals(material.getCode())));
    }

    @Test
    void importRejectsInvalidTypeDatesAndConflictingParentData() throws Exception {
        when(materialRepository.findByTenantIdAndCodeIgnoreCase("default", "MAT-03")).thenReturn(List.of());
        when(materialTypeRepository.findAll()).thenReturn(List.of(type("原材料", 1L)));
        MaterialImportResult result = service().importWorkbook(workbookFile(
                row("零件", "MAT-03", "品牌A", "", "不存在类型", "PCS", "生产物料", "V1.0", "", "", ""),
                row("零件", "MAT-03", "品牌A", "", "原材料", "PCS", "生产物料", "V2.0", "2026-09-02 00:00:00", "2026-09-01 00:00:00", ""),
                row("零件", "MAT-03", "品牌A", "", "原材料", "PCS", "生产物料", "V3.0", "", "", ""),
                row("零件", "MAT-03", "品牌B", "", "原材料", "PCS", "生产物料", "V4.0", "", "", "")));

        assertThat(result.failedRows()).extracting(MaterialImportResult.RowResult::reason)
                .containsExactly("物料类型不存在", "生效日期不能晚于失效日期", "同一物料料号的父数据不一致");
        assertThat(result.successCount()).isEqualTo(1);
        verify(materialRepository).save(argThat(material -> "V3.0".equals(material.getVersion())));
    }

    @Test
    void importSkipsDuplicateCodeAndVersionInsideWorkbook() throws Exception {
        when(materialRepository.findByTenantIdAndCodeIgnoreCase("default", "MAT-04")).thenReturn(List.of());
        when(materialTypeRepository.findAll()).thenReturn(List.of(type("原材料", 1L)));
        MaterialImportResult result = service().importWorkbook(workbookFile(
                row("垫圈", "MAT-04", "", "", "原材料", "PCS", "生产物料", "V1.0", "", "", ""),
                row("垫圈", "MAT-04", "", "", "原材料", "PCS", "生产物料", "V1.0", "", "", "")));

        assertThat(result.successCount()).isEqualTo(1);
        assertThat(result.skippedRows()).singleElement()
                .extracting(MaterialImportResult.RowResult::reason)
                .isEqualTo("物料料号和版本在文件中重复");
    }

    @Test
    void requiresTypeAllowsEmptyBrandAndLoadsDictionaryOnce() throws Exception {
        when(materialTypeRepository.findAll()).thenReturn(List.of(type("原材料", 1L)));
        var result = service().importWorkbook(workbookFile(
                row("零件", "EMPTY-TYPE", "", "", "", "PCS", "", "V1", "", "", ""),
                row("零件", "VALID", "", "", "原材料", "PCS", "", "V1", "", "", "")));
        assertThat(result.failedRows()).extracting(MaterialImportResult.RowResult::reason).containsExactly("物料类型不能为空");
        assertThat(result.importedMaterials()).singleElement().satisfies(material -> {
            assertThat(material.getBrandName()).isNull();
            assertThat(material.getMaterialTypeId()).isEqualTo(1L);
        });
        verify(materialTypeRepository, times(1)).findAll();
    }

    @Test
    void rejectsExistingMaterialBaseConflictWithoutChangingExistingData() throws Exception {
        when(materialTypeRepository.findAll()).thenReturn(List.of(type("原材料", 1L)));
        when(materialRepository.findByTenantIdAndCodeIgnoreCase("default", "MAT-01"))
                .thenReturn(List.of(existing("MAT-01", "V1.0")));
        var result = service().importWorkbook(workbookFile(
                row("螺钉", "MAT-01", "错误品牌", "M3", "原材料", "PCS", "生产物料", "V1.0", "", "", ""),
                row("螺钉", "MAT-01", "错误品牌", "M3", "原材料", "PCS", "生产物料", "V2.0", "", "", "")));
        assertThat(result.skippedCount()).isEqualTo(1);
        assertThat(result.failedRows()).singleElement().extracting(MaterialImportResult.RowResult::reason)
                .isEqualTo("与已有物料的基础信息不一致，请先统一基础信息");
        verify(materialRepository, never()).save(any());
    }

    @Test
    void rejectsOversizeFieldsAndImpossibleDatesWithoutLosingValidRows() throws Exception {
        when(materialTypeRepository.findAll()).thenReturn(List.of(type("原材料", 1L)));
        var result = service().importWorkbook(workbookFile(
                row("零件", "TOO-LONG", "牌".repeat(256), "", "原材料", "PCS", "", "V1", "", "", ""),
                row("零件", "BAD-DATE", "", "", "原材料", "PCS", "", "V1", "2026-02-30 00:00:00", "", ""),
                row("零件", "LONG-SPEC", "", "长".repeat(129), "原材料", "PCS", "", "V1", "", "", ""),
                row("零件", "LONG-UNIT", "", "", "原材料", "长".repeat(33), "", "V1", "", "", ""),
                row("零件", "GOOD", "", "", "原材料", "PCS", "", "V1", "", "", "")));
        assertThat(result.successCount()).isEqualTo(1);
        assertThat(result.failedCount()).isEqualTo(4);
    }

    @Test
    void rejectsInvalidFilesAndRowLimitBeforeSaving() throws Exception {
        var service = service();
        assertThatThrownBy(() -> service.importWorkbook(new MockMultipartFile("file", "x.xls", "", new byte[]{1})))
                .hasMessageContaining(".xlsx");
        String[][] rows = IntStream.range(0, 1001).mapToObj(i -> row("零件", "MAT-" + i, "", "", "原材料", "", "", "V1", "", "", "")).toArray(String[][]::new);
        assertThatThrownBy(() -> service.importWorkbook(workbookFile(rows))).hasMessageContaining("1000");
        verify(materialRepository, never()).save(any());
    }

    private MaterialImportService service() {
        lenient().when(materialRepository.save(any(Material.class))).thenAnswer(invocation -> invocation.getArgument(0));
        return new MaterialImportService(materialRepository, materialTypeRepository, new SnowflakeIdGenerator(1));
    }

    private MockMultipartFile workbookFile(String[]... rows) throws Exception {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet("物料导入模板");
            String[] headers = {"物料名称", "物料料号", "品牌名称", "规格型号", "物料类型", "单位", "物料用途", "物料版本", "生效日期", "失效日期", "版本说明"};
            var header = sheet.createRow(0);
            for (int column = 0; column < headers.length; column++) header.createCell(column).setCellValue(headers[column]);
            for (int rowIndex = 0; rowIndex < rows.length; rowIndex++) {
                var row = sheet.createRow(rowIndex + 1);
                for (int column = 0; column < headers.length; column++) row.createCell(column).setCellValue(rows[rowIndex][column]);
            }
            workbook.write(output);
            return new MockMultipartFile("file", "materials.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", output.toByteArray());
        }
    }

    private String[] row(String name, String code, String brandName, String specification, String type, String unit, String purpose, String version, String effectiveDate, String expiryDate, String description) {
        return new String[] {name, code, brandName, specification, type, unit, purpose, version, effectiveDate, expiryDate, description};
    }

    private Material existing(String code, String version) {
        return Material.builder().id(1L).tenantId("default").code(code).name("螺钉").brandName("品牌A").specification("M3").materialTypeId(1L).unit("PCS").version(version).createdAt(LocalDateTime.now()).build();
    }

    private MaterialType type(String name, Long id) {
        return MaterialType.builder().id(id).tenantId("default").code("TYPE-" + id).name(name).build();
    }
}
