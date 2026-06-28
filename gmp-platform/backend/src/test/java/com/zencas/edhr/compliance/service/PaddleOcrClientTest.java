package com.zencas.edhr.compliance.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class PaddleOcrClientTest {

    private PaddleOcrClient client;
    private Path scriptFile;
    private Path imageFile;

    @BeforeEach
    void setUp() throws Exception {
        client = new PaddleOcrClient(new com.fasterxml.jackson.databind.ObjectMapper());
        scriptFile = Files.createTempFile("paddle-ocr", ".sh");
        imageFile = Files.createTempFile("ocr-image", ".png");
        Files.write(imageFile, new byte[] {1, 2, 3});
        Files.writeString(scriptFile, """
                #!/bin/sh
                echo '{"ok": true, "lines": ["姓名 张三", "公民身份号码 32010219900102001X"]}'
                """, StandardCharsets.UTF_8);
        scriptFile.toFile().setExecutable(true);
        ReflectionTestUtils.setField(client, "enabled", true);
        ReflectionTestUtils.setField(client, "pythonCommand", "/bin/sh");
        ReflectionTestUtils.setField(client, "scriptPath", scriptFile.toString());
        ReflectionTestUtils.setField(client, "timeoutSeconds", 5L);
    }

    @Test
    void recognizeParsesJsonLinesFromLocalScript() {
        List<String> lines = client.recognize(imageFile);

        assertThat(lines).containsExactly("姓名 张三", "公民身份号码 32010219900102001X");
    }

    @Test
    void recognizeTextBoxesParsesPositionedItemsFromLocalScript() throws Exception {
        Files.writeString(scriptFile, """
                #!/bin/sh
                echo '{"ok": true, "lines": ["设备编号"], "items": [{"text": "设备编号", "x": 72, "y": 96, "width": 120, "height": 24, "confidence": 0.91}]}'
                """, StandardCharsets.UTF_8);

        List<PaddleOcrClient.OcrTextBox> textBoxes = client.recognizeTextBoxes(imageFile);

        assertThat(textBoxes)
                .containsExactly(new PaddleOcrClient.OcrTextBox("设备编号", 72, 96, 120, 24, 0.91));
    }
}
