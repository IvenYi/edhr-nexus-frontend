package com.zencas.edhr.compliance.numbering;

import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.DateTimeUtils;
import com.zencas.edhr.compliance.entity.NumberingRule;
import com.zencas.edhr.compliance.repository.NumberingRuleRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Encoding rule engine.
 * Parses templates like "FORM-{YYYYMMDD}-{SEQ:4}" and generates
 * unique codes with DB row-lock to prevent duplicates.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NumberingService {

    private final NumberingRuleRepository numberingRuleRepository;
    private final EntityManager entityManager;

    private static final Pattern SEQ_PATTERN = Pattern.compile("\\{SEQ:(\\d+)}");
    private static final Pattern DATE_PATTERN = Pattern.compile("\\{YYYYMMDD}");
    private static final Pattern MONTH_PATTERN = Pattern.compile("\\{YYYYMM}");
    private static final Pattern YEAR_PATTERN = Pattern.compile("\\{YYYY}");

    /**
     * Generate the next code for a given business type.
     * Uses pessimistic DB lock to guarantee uniqueness.
     */
    @Transactional
    public String generate(String businessType) {
        NumberingRule rule = numberingRuleRepository
                .findByBusinessTypeAndIsActiveTrue(businessType)
                .orElseThrow(() -> new BusinessException(ErrorCode.NUM_001,
                        "未配置业务类型 " + businessType + " 的编码规则"));

        // Lock the row for update
        NumberingRule locked = entityManager.find(NumberingRule.class, rule.getId(),
                LockModeType.PESSIMISTIC_WRITE);
        if (locked == null) {
            throw new BusinessException(ErrorCode.NUM_003);
        }

        // Check if sequence needs reset
        String resetKey = getResetKey(locked.getResetStrategy());
        if (!resetKey.equals(locked.getLastResetValue())) {
            locked.setCurrentSeq(0);
            locked.setLastResetValue(resetKey);
        }

        // Increment sequence
        int nextSeq = locked.getCurrentSeq() + 1;

        // Check against max value
        int maxSeq = (int) Math.pow(10, locked.getSeqLength()) - 1;
        if (nextSeq > maxSeq) {
            throw new BusinessException(ErrorCode.NUM_002,
                    "序列号已达上限: " + businessType + " (max=" + maxSeq + ")");
        }

        locked.setCurrentSeq(nextSeq);
        numberingRuleRepository.save(locked);

        // Build the code from template
        String code = buildCode(locked.getTemplate(), nextSeq, locked.getSeqLength());
        log.info("Generated code: {} for business type: {}", code, businessType);
        return code;
    }

    /** Preview what the next code would look like without incrementing. */
    public String preview(String businessType) {
        NumberingRule rule = numberingRuleRepository
                .findByBusinessTypeAndIsActiveTrue(businessType)
                .orElseThrow(() -> new BusinessException(ErrorCode.NUM_001));
        int nextSeq = rule.getCurrentSeq() + 1;
        return buildCode(rule.getTemplate(), nextSeq, rule.getSeqLength());
    }

    private String buildCode(String template, int seq, int seqLength) {
        String result = template;
        result = DATE_PATTERN.matcher(result).replaceAll(DateTimeUtils.todayStr());
        result = MONTH_PATTERN.matcher(result).replaceAll(DateTimeUtils.currentMonthStr());
        result = YEAR_PATTERN.matcher(result).replaceAll(DateTimeUtils.currentYearStr());

        Matcher m = SEQ_PATTERN.matcher(result);
        if (m.find()) {
            int digits = Integer.parseInt(m.group(1));
            String seqStr = String.format("%0" + digits + "d", seq);
            result = m.replaceAll(seqStr);
        }

        return result;
    }

    private String getResetKey(String strategy) {
        return switch (strategy) {
            case "DAILY" -> DateTimeUtils.todayStr();
            case "MONTHLY" -> DateTimeUtils.currentMonthStr();
            case "YEARLY" -> DateTimeUtils.currentYearStr();
            default -> "NEVER";
        };
    }
}
