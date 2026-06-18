package com.zencas.edhr.compliance.service;

import com.zencas.edhr.compliance.entity.FileObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class IdCardOcrServiceTest {

    private PaddleOcrClient paddleOcrClient;
    private IdCardOcrService service;
    private Path tempImagePath;

    @BeforeEach
    void setUp() throws Exception {
        paddleOcrClient = mock(PaddleOcrClient.class);
        service = new IdCardOcrService(paddleOcrClient);
        tempImagePath = Files.createTempFile("id-card", ".png");
        Files.write(tempImagePath, new byte[] {1, 2, 3});
    }

    @Test
    void recognizesChineseIdCardFrontFromPaddleOcrText() {
        assertThat(service.recognizeSide(List.of(
                "姓名 张三",
                "性别 男 民族 汉",
                "出生 1990年01月02日",
                "住址 江苏省南京市鼓楼区",
                "公民身份号码 32010219900102001X"
        ))).isEqualTo(IdCardSide.FRONT);
    }

    @Test
    void recognizesChineseIdCardBackFromPaddleOcrText() {
        assertThat(service.recognizeSide(List.of(
                "中华人民共和国",
                "居民身份证",
                "签发机关 南京市公安局",
                "有效期限 2020.01.02-2040.01.02"
        ))).isEqualTo(IdCardSide.BACK);
    }

    @Test
    void rejectsWrongSideWhenFrontSlotReceivesBackImage() {
        FileObject fileObject = createImageFile("id-card-back.png");
        when(paddleOcrClient.recognize(tempImagePath)).thenReturn(List.of(
                "中华人民共和国",
                "居民身份证",
                "签发机关 南京市公安局",
                "有效期限 2020.01.02-2040.01.02"
        ));

        assertThatThrownBy(() -> service.validateIdCardFront(fileObject))
                .hasMessageContaining("身份证正面识别失败，请上传清晰的身份证正面图片");
    }

    @Test
    void rejectsUnrelatedImageText() {
        FileObject fileObject = createImageFile("cat.png");
        when(paddleOcrClient.recognize(tempImagePath)).thenReturn(List.of("会议纪要", "欢迎使用系统"));

        assertThatThrownBy(() -> service.validateIdCardBack(fileObject))
                .hasMessageContaining("身份证 OCR 识别失败，请上传清晰的身份证正反面图片");
    }

    private FileObject createImageFile(String originalName) {
        return FileObject.builder()
                .id(1L)
                .originalName(originalName)
                .storedPath(tempImagePath.toString())
                .mimeType("image/png")
                .fileSize(3L)
                .targetType("SIGNATURE_EVIDENCE")
                .build();
    }
}
