package com.zencas.edhr.compliance.service;

import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.compliance.entity.FileObject;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class IdCardOcrService {

    private static final Pattern PRC_ID_NUMBER_PATTERN = Pattern.compile("\\d{17}[\\dXx]");
    private static final List<String> FRONT_KEYWORDS = List.of("姓名", "性别", "民族", "出生", "住址", "公民身份号码", "身份号码");
    private static final List<String> BACK_KEYWORDS = List.of("中华人民共和国", "居民身份证", "签发机关", "有效期限", "有效期", "公安局");

    private final PaddleOcrClient paddleOcrClient;

    public void validateIdCardFront(FileObject fileObject) {
        validate(fileObject, IdCardSide.FRONT);
    }

    public void validateIdCardBack(FileObject fileObject) {
        validate(fileObject, IdCardSide.BACK);
    }

    void validate(FileObject fileObject, IdCardSide expectedSide) {
        Path imagePath = resolveImagePath(fileObject, expectedSide);
        List<String> lines = paddleOcrClient.recognize(imagePath);
        IdCardSide recognizedSide = recognizeSide(lines);
        if (recognizedSide != expectedSide) {
            throw new BusinessException(ErrorCode.GENERAL_001, expectedSide == IdCardSide.FRONT
                    ? "身份证正面识别失败，请上传清晰的身份证正面图片"
                    : "身份证反面识别失败，请上传清晰的身份证反面图片");
        }
    }

    IdCardSide recognizeSide(List<String> lines) {
        String text = normalize(lines);
        int frontScore = score(text, FRONT_KEYWORDS);
        int backScore = score(text, BACK_KEYWORDS);
        boolean hasIdNumber = PRC_ID_NUMBER_PATTERN.matcher(text).find();
        if (hasIdNumber) frontScore += 3;
        if (text.contains("签发机关") && (text.contains("有效期限") || text.contains("有效期"))) backScore += 3;
        if (frontScore >= 4 && frontScore > backScore) return IdCardSide.FRONT;
        if (backScore >= 4 && backScore > frontScore) return IdCardSide.BACK;
        throw new BusinessException(ErrorCode.GENERAL_001, "身份证 OCR 识别失败，请上传清晰的身份证正反面图片");
    }

    private Path resolveImagePath(FileObject fileObject, IdCardSide expectedSide) {
        if (fileObject == null || !StringUtils.hasText(fileObject.getStoredPath())) {
            throw new BusinessException(ErrorCode.GENERAL_001, expectedSide == IdCardSide.FRONT ? "请上传身份证正面" : "请上传身份证反面");
        }
        if (!StringUtils.hasText(fileObject.getMimeType()) || !fileObject.getMimeType().startsWith("image/")) {
            throw new BusinessException(ErrorCode.GENERAL_001, "请上传身份证图片文件");
        }
        Path imagePath = Path.of(fileObject.getStoredPath());
        if (!Files.exists(imagePath)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "身份证图片文件不存在，请重新上传");
        }
        return imagePath;
    }

    private String normalize(List<String> lines) {
        if (lines == null || lines.isEmpty()) return "";
        return String.join("", lines)
                .replaceAll("\\s+", "")
                .replace(" ", "")
                .toUpperCase(Locale.ROOT);
    }

    private int score(String text, List<String> keywords) {
        int score = 0;
        for (String keyword : keywords) {
            if (text.contains(keyword)) score++;
        }
        return score;
    }
}
