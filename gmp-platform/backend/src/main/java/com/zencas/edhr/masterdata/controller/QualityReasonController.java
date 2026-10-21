package com.zencas.edhr.masterdata.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.masterdata.service.QualityReasonUsageService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/master-data/quality-reasons/{type}")
@PreAuthorize("(#type == 'DEFECT' and hasAuthority('master-data.defect-reasons')) or (#type == 'SCRAP' and hasAuthority('master-data.scrap-reasons'))")
@RequiredArgsConstructor
public class QualityReasonController {
    private final JdbcTemplate jdbc;
    private final SnowflakeIdGenerator ids;
    private final AuditEventRepository audits;
    private final ObjectMapper mapper;
    private final QualityReasonUsageService usage;

    @GetMapping
    public ApiResponse<PageResult<Map<String, Object>>> list(@PathVariable String type,
            @RequestParam(required = false) String keyword, @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int size) {
        requireType(type);
        int safePage = Math.max(1, page), safeSize = Math.max(1, Math.min(200, size));
        String where = " WHERE tenant_id = 'default' AND reason_type = ?";
        List<Object> args = new ArrayList<>(List.of(type));
        if (StringUtils.hasText(keyword)) {
            where += " AND (LOWER(code) LIKE ? ESCAPE '!' OR LOWER(name) LIKE ? ESCAPE '!')";
            String pattern = "%" + keyword.trim().toLowerCase(java.util.Locale.ROOT).replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%";
            args.add(pattern); args.add(pattern);
        }
        if (StringUtils.hasText(status)) { requireStatus(status); where += " AND status = ?"; args.add(status); }
        Long count = jdbc.queryForObject("SELECT COUNT(*) FROM quality_reason" + where, Long.class, args.toArray());
        args.add(safeSize); args.add((safePage - 1L) * safeSize);
        List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM quality_reason" + where + " ORDER BY sort_order, code, id LIMIT ? OFFSET ?", args.toArray()).stream().map(this::response).toList();
        return ApiResponse.success(PageResult.of(rows, safePage, safeSize, count == null ? 0 : count));
    }

    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> get(@PathVariable String type, @PathVariable Long id) {
        return ApiResponse.success(response(require(type, id)));
    }

    @PostMapping
    @Transactional
    public ApiResponse<Map<String, Object>> create(@PathVariable String type, @RequestBody ReasonRequest request) {
        requireType(type);
        ReasonRequest value = normalize(request);
        Long id = ids.nextId();
        try {
            jdbc.update("INSERT INTO quality_reason(id, tenant_id, reason_type, code, name, description, status, sort_order, created_by, updated_by) VALUES (?, 'default', ?, ?, ?, ?, ?, ?, ?, ?)", id, type, value.code(), value.name(), value.description(), value.status(), value.sortOrder(), AuditContext.getOperatorId(), AuditContext.getOperatorId());
        } catch (DuplicateKeyException exception) { throw invalid("原因编码已存在"); }
        Map<String, Object> saved = require(type, id);
        audit(type, id, "CREATE", "新增", Map.of(), snapshot(saved));
        return ApiResponse.success(response(saved));
    }

    @PutMapping("/{id}")
    @Transactional
    public ApiResponse<Map<String, Object>> update(@PathVariable String type, @PathVariable Long id, @RequestBody ReasonRequest request) {
        Map<String, Object> before = require(type, id, true);
        ReasonRequest value = normalize(request);
        if (!value.code().equals(before.get("code")) && usage.isUsed(type, id)) throw invalid("原因已被使用，不能修改编码；可编辑名称、描述或停用");
        try {
            jdbc.update("UPDATE quality_reason SET code = ?, name = ?, description = ?, status = ?, sort_order = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND tenant_id = 'default' AND reason_type = ?", value.code(), value.name(), value.description(), value.status(), value.sortOrder(), AuditContext.getOperatorId(), id, type);
        } catch (DuplicateKeyException exception) { throw invalid("原因编码已存在"); }
        Map<String, Object> saved = require(type, id);
        if (!snapshot(before).equals(snapshot(saved))) audit(type, id, "UPDATE", "编辑", snapshot(before), snapshot(saved));
        return ApiResponse.success(response(saved));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ApiResponse<Void> delete(@PathVariable String type, @PathVariable Long id) {
        Map<String, Object> before = require(type, id, true);
        if (usage.isUsed(type, id)) throw invalid("原因已被表单配置或填报使用，不能删除，请停用该原因");
        jdbc.update("DELETE FROM quality_reason WHERE id = ? AND tenant_id = 'default' AND reason_type = ?", id, type);
        audit(type, id, "DELETE", "删除", snapshot(before), Map.of());
        return ApiResponse.success(null);
    }

    private Map<String, Object> require(String type, Long id) {
        return require(type, id, false);
    }

    private Map<String, Object> require(String type, Long id, boolean lock) {
        requireType(type);
        List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM quality_reason WHERE id = ? AND tenant_id = 'default' AND reason_type = ?" + (lock ? " FOR UPDATE" : ""), id, type);
        if (rows.isEmpty()) throw invalid("原因不存在");
        return rows.getFirst();
    }

    private ReasonRequest normalize(ReasonRequest value) {
        if (value == null) throw invalid("原因信息不能为空");
        String code = text(value.code(), "原因编码", 64, true), name = text(value.name(), "原因名称", 128, true);
        String description = text(value.description(), "描述", 512, false);
        String status = value.status() == null ? "ACTIVE" : value.status();
        requireStatus(status);
        return new ReasonRequest(code, name, description, status, value.sortOrder() == null ? 0 : value.sortOrder());
    }

    private String text(String value, String label, int max, boolean required) {
        if (!StringUtils.hasText(value)) { if (required) throw invalid(label + "不能为空"); return null; }
        String result = value.trim();
        if (result.length() > max) throw invalid(label + "不能超过" + max + "个字符");
        return result;
    }

    private void requireType(String type) { if (!Set.of("DEFECT", "SCRAP").contains(type)) throw invalid("原因目录类型无效"); }
    private void requireStatus(String status) { if (!Set.of("ACTIVE", "INACTIVE").contains(status)) throw invalid("状态只能是启用或停用"); }
    private BusinessException invalid(String message) { return new BusinessException(ErrorCode.GENERAL_001, message); }

    private Map<String, Object> response(Map<String, Object> row) {
        Map<String, Object> result = snapshot(row);
        result.put("id", String.valueOf(row.get("id")));
        result.put("type", row.get("reason_type"));
        result.put("createdBy", row.get("created_by")); result.put("updatedBy", row.get("updated_by"));
        result.put("createdAt", time(row.get("created_at"))); result.put("updatedAt", time(row.get("updated_at")));
        return result;
    }

    private String time(Object value) { return value instanceof java.sql.Timestamp timestamp ? timestamp.toLocalDateTime().toString() : value == null ? null : value.toString(); }
    private Map<String, Object> snapshot(Map<String, Object> row) {
        Map<String, Object> result = new LinkedHashMap<>();
        for (String key : List.of("code", "name", "description", "status")) result.put(key, row.get(key));
        result.put("sortOrder", row.get("sort_order"));
        return result;
    }

    private void audit(String type, Long id, String action, String function, Map<String, Object> before, Map<String, Object> after) {
        try {
            audits.save(AuditEvent.builder().id(ids.nextId()).tenantId("default").entityType("DEFECT".equals(type) ? "DEFECT_REASON" : "SCRAP_REASON").entityId(String.valueOf(id)).action(action)
                    .contentBefore(mapper.writeValueAsString(before)).contentAfter(mapper.writeValueAsString(after))
                    .operatorId(AuditContext.getOperatorId()).operatorName(AuditContext.getOperatorName()).operatorAccount(AuditContext.getOperatorAccount()).source(AuditContext.getSource())
                    .moduleName("数据").menuName("原因建模 · " + ("DEFECT".equals(type) ? "不良原因" : "报废原因")).functionName(function).dataSummary(("DEFECT".equals(type) ? "不良原因" : "报废原因") + " #" + id)
                    .ipAddress(AuditContext.getIpAddress()).createdAt(LocalDateTime.now()).build());
        } catch (JsonProcessingException exception) { throw new BusinessException(ErrorCode.GENERAL_002, "审计内容序列化失败"); }
    }

    public record ReasonRequest(String code, String name, String description, String status, Integer sortOrder) {}
}
