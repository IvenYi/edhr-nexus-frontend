package com.zencas.edhr.compliance.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class PaddleOcrClient {

    private final ObjectMapper objectMapper;

    @Value("${edhr.ocr.paddle.enabled:true}")
    private boolean enabled;

    @Value("${edhr.ocr.paddle.python-command:python3}")
    private String pythonCommand;

    @Value("${edhr.ocr.paddle.script-path:scripts/paddle_id_card_ocr.py}")
    private String scriptPath;

    @Value("${edhr.ocr.paddle.timeout-seconds:30}")
    private long timeoutSeconds;

    public List<String> recognize(Path imagePath) {
        if (!enabled) {
            throw new BusinessException(ErrorCode.GENERAL_001, "身份证 OCR 识别未启用，请联系管理员");
        }
        if (imagePath == null || !StringUtils.hasText(imagePath.toString())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "身份证 OCR 识别失败，请重新上传身份证图片");
        }
        ProcessBuilder builder = new ProcessBuilder(pythonCommand, resolveScriptPath(), imagePath.toString());
        builder.redirectErrorStream(true);
        try {
            Process process = builder.start();
            boolean finished = process.waitFor(Duration.ofSeconds(timeoutSeconds).toMillis(), TimeUnit.MILLISECONDS);
            if (!finished) {
                process.destroyForcibly();
                throw new BusinessException(ErrorCode.GENERAL_001, "身份证 OCR 识别超时，请上传更清晰的身份证图片");
            }
            String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();
            if (process.exitValue() != 0) {
                throw new BusinessException(ErrorCode.GENERAL_001, "身份证 OCR 识别失败，请确认 PaddleOCR 本地环境可用");
            }
            return parseLines(output);
        } catch (IOException ex) {
            throw new BusinessException(ErrorCode.GENERAL_001, "身份证 OCR 识别失败，请确认 PaddleOCR 本地环境可用");
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new BusinessException(ErrorCode.GENERAL_001, "身份证 OCR 识别被中断，请重试");
        }
    }

    private String resolveScriptPath() {
        Path path = Path.of(scriptPath);
        if (path.isAbsolute()) return path.toString();
        return Path.of(System.getProperty("user.dir")).resolve(path).normalize().toString();
    }

    private List<String> parseLines(String output) {
        try {
            JsonNode root = objectMapper.readTree(output);
            if (!root.path("ok").asBoolean(false)) {
                throw new BusinessException(ErrorCode.GENERAL_001, "身份证 OCR 识别失败，请上传清晰的身份证图片");
            }
            List<String> lines = new ArrayList<>();
            root.path("lines").forEach(node -> {
                String text = node.asText("");
                if (StringUtils.hasText(text)) lines.add(text.trim());
            });
            return lines;
        } catch (BusinessException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BusinessException(ErrorCode.GENERAL_001, "身份证 OCR 识别结果解析失败，请重试");
        }
    }
}
