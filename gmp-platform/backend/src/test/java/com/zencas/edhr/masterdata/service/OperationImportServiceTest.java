package com.zencas.edhr.masterdata.service;

import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.masterdata.repository.OperationCategoryRepository;
import com.zencas.edhr.masterdata.repository.OperationRepository;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class OperationImportServiceTest {
    private final OperationRepository operations = mock(OperationRepository.class);
    private final OperationCategoryRepository categories = mock(OperationCategoryRepository.class);
    private final OperationImportService service = new OperationImportService(operations, categories, new SnowflakeIdGenerator(1));

    @BeforeEach
    void savesReturnEntity() { when(operations.save(any())).thenAnswer(invocation -> invocation.getArgument(0)); }

    @Test
    void rejectsEmptyWrongExtensionAndCorruptFiles() {
        assertThatThrownBy(() -> service.importWorkbook(null)).isInstanceOf(BusinessException.class).hasMessageContaining("不能为空");
        assertThatThrownBy(() -> service.importWorkbook(new MockMultipartFile("file", "a.xlsx", "", new byte[0]))).hasMessageContaining("不能为空");
        assertThatThrownBy(() -> service.importWorkbook(new MockMultipartFile("file", "a.xls", "", new byte[]{1}))).hasMessageContaining("仅支持");
        assertThatThrownBy(() -> service.importWorkbook(new MockMultipartFile("file", "a.xlsx", "", new byte[]{1}))).hasMessageContaining("无法读取");
        verify(operations, never()).save(any());
    }

    @Test
    void rejectsWrongHeadersBeforeSaving() throws Exception {
        try (var workbook = template()) {
            workbook.getSheetAt(0).getRow(0).getCell(1).setCellValue("错误表头");
            assertThatThrownBy(() -> service.importWorkbook(file(workbook))).hasMessageContaining("表头不正确");
            verify(operations, never()).save(any());
        }
    }

    @Test
    void rejectsWorkbookWithoutSheets() throws Exception {
        try (var workbook = new XSSFWorkbook()) {
            assertThatThrownBy(() -> service.importWorkbook(file(workbook))).hasMessageContaining("缺少数据工作表");
        }
    }

    @Test
    void acceptsPlainHeadersAndEmptyRowsAndPreservesTextCodes() throws Exception {
        try (var workbook = template()) {
            var sheet = workbook.getSheetAt(0);
            sheet.getRow(0).getCell(0).setCellValue("工序名称");
            sheet.getRow(0).getCell(1).setCellValue("工序编码");
            sheet.removeRow(sheet.getRow(1));
            var row = sheet.createRow(3);
            row.createCell(0).setCellValue(" 工序 ");
            row.createCell(1).setCellValue("00123");
            row.createCell(4).setCellValue(15);
            var result = service.importWorkbook(file(workbook));
            assertThat(result.successCount()).isEqualTo(1);
            assertThat(result.importedOperations().getFirst().getCode()).isEqualTo("00123");
            assertThat(result.importedOperations().getFirst().getDefaultDurationMinutes()).isEqualTo(15);
        }
    }

    @Test
    void rejectsFractionalDurationEvenWhenCellFormattingRoundsIt() throws Exception {
        try (var workbook = template()) {
            var cell = workbook.getSheetAt(0).getRow(1).getCell(4);
            cell.setCellValue(1.5);
            var style = workbook.createCellStyle();
            style.setDataFormat(workbook.createDataFormat().getFormat("0"));
            cell.setCellStyle(style);
            var result = service.importWorkbook(file(workbook));
            assertThat(result.successCount()).isZero();
            assertThat(result.failedCount()).isEqualTo(1);
            verify(operations, never()).save(any());
        }
    }

    @Test
    void invalidRowDoesNotReserveCodeForLaterValidRow() throws Exception {
        try (var workbook = template()) {
            var sheet = workbook.getSheetAt(0);
            sheet.getRow(1).getCell(0).setCellValue("");
            sheet.getRow(1).getCell(1).setCellValue("SAME");
            var row = sheet.createRow(2);
            row.createCell(0).setCellValue("合法");
            row.createCell(1).setCellValue("SAME");
            var result = service.importWorkbook(file(workbook));
            assertThat(result.successCount()).isEqualTo(1);
            assertThat(result.failedCount()).isEqualTo(1);
            assertThat(result.skippedCount()).isZero();
        }
    }

    @Test
    void acceptsOneThousandRowsButRejectsOneThousandAndOneBeforeSaving() throws Exception {
        try (var workbook = template()) {
            var sheet = workbook.getSheetAt(0);
            for (int i = 1; i <= 1000; i++) {
                var row = sheet.createRow(i);
                row.createCell(0).setCellValue("工序" + i);
                row.createCell(1).setCellValue("OP-" + i);
            }
            assertThat(service.importWorkbook(file(workbook)).successCount()).isEqualTo(1000);
            clearInvocations(operations);
            sheet.createRow(1001).createCell(0).setCellValue("超出限制");
            assertThatThrownBy(() -> service.importWorkbook(file(workbook))).hasMessageContaining("最多导入1000");
            verify(operations, never()).save(any());
        }
    }

    private XSSFWorkbook template() throws Exception { return new XSSFWorkbook(new ByteArrayInputStream(service.createTemplate())); }

    private MockMultipartFile file(XSSFWorkbook workbook) throws Exception {
        try (var output = new ByteArrayOutputStream()) {
            workbook.write(output);
            return new MockMultipartFile("file", "工序.XLSX", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", output.toByteArray());
        }
    }
}
