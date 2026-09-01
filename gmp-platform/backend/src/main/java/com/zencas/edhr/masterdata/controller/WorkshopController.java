package com.zencas.edhr.masterdata.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.identity.entity.Workshop;
import com.zencas.edhr.identity.repository.ProductionLineRepository;
import com.zencas.edhr.identity.repository.WorkshopRepository;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/master-data/workshops")
@PreAuthorize("hasAuthority('master-data.workshops')")
@RequiredArgsConstructor
public class WorkshopController {

    private static final Long TENANT_ID = 1L;
    private static final Set<String> ALLOWED_STATUSES = Set.of("ACTIVE", "INACTIVE");
    private static final ObjectMapper AUDIT_OBJECT_MAPPER = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    private final WorkshopRepository workshopRepository;
    private final ProductionLineRepository productionLineRepository;
    private final AuditEventRepository auditEventRepository;
    private final SnowflakeIdGenerator idGenerator;

    @GetMapping
    public ApiResponse<PageResult<WorkshopResponse>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 200);
        Specification<Workshop> specification = buildSpecification(keyword, status);
        Page<Workshop> result = workshopRepository.findAll(
                specification,
                PageRequest.of(safePage - 1, safeSize,
                        Sort.by(Sort.Order.desc("updatedAt"), Sort.Order.desc("createdAt"))));
        List<WorkshopResponse> content = result.getContent().stream().map(this::toResponse).toList();
        return ApiResponse.success(PageResult.of(content, safePage, safeSize, result.getTotalElements()));
    }

    @GetMapping("/{id}")
    public ApiResponse<WorkshopResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(toResponse(requireWorkshop(id)));
    }

    @PostMapping
    @Transactional
    public ApiResponse<WorkshopResponse> create(@RequestBody WorkshopRequest request) {
        NormalizedWorkshopRequest normalized = normalizeAndValidate(request, true);
        if (workshopRepository.existsByTenantIdAndCodeIgnoreCase(TENANT_ID, normalized.code())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "车间编码已存在");
        }
        LocalDateTime now = LocalDateTime.now();
        Workshop saved = workshopRepository.save(Workshop.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .code(normalized.code())
                .name(normalized.name())
                .description(normalized.description())
                .status(normalized.status())
                .createdAt(now)
                .updatedAt(now)
                .build());
        writeAudit(saved.getId(), "CREATE", "新增", Map.of(), snapshot(saved));
        return ApiResponse.success(toResponse(saved));
    }

    @PutMapping("/{id}")
    @Transactional
    public ApiResponse<WorkshopResponse> update(@PathVariable Long id, @RequestBody WorkshopRequest request) {
        Workshop workshop = requireWorkshop(id);
        NormalizedWorkshopRequest normalized = normalizeAndValidate(request, false);
        boolean referenced = isReferenced(id);
        if (referenced && !Objects.equals(workshop.getCode(), normalized.code())) {
            throw new BusinessException(ErrorCode.GENERAL_003, "车间已被引用，不能修改车间编码");
        }
        if (!workshop.getCode().equalsIgnoreCase(normalized.code())
                && workshopRepository.existsByTenantIdAndCodeIgnoreCaseAndIdNot(TENANT_ID, normalized.code(), id)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "车间编码已存在");
        }

        Map<String, Object> before = snapshot(workshop);
        workshop.setCode(normalized.code());
        workshop.setName(normalized.name());
        workshop.setDescription(normalized.description());
        workshop.setStatus(normalized.status());
        workshop.setUpdatedAt(LocalDateTime.now());
        Workshop saved = workshopRepository.save(workshop);
        Map<String, Object> after = snapshot(saved);
        if (!before.equals(after)) writeAudit(saved.getId(), "UPDATE", "编辑", before, after);
        return ApiResponse.success(toResponse(saved));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ApiResponse<Void> delete(@PathVariable Long id) {
        Workshop workshop = requireWorkshop(id);
        if (isReferenced(id)) {
            throw new BusinessException(ErrorCode.GENERAL_003, "车间已被引用，不能删除，请停用该车间");
        }
        Map<String, Object> before = snapshot(workshop);
        workshopRepository.delete(workshop);
        writeAudit(id, "DELETE", "删除", before, Map.of());
        return ApiResponse.success(null);
    }

    private Specification<Workshop> buildSpecification(String keyword, String status) {
        String normalizedKeyword = StringUtils.hasText(keyword) ? keyword.trim().toLowerCase(Locale.ROOT) : null;
        String normalizedStatus = StringUtils.hasText(status) ? normalizeStatus(status, false) : null;
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(builder.equal(root.get("tenantId"), TENANT_ID));
            if (normalizedKeyword != null) {
                String pattern = "%" + normalizedKeyword + "%";
                predicates.add(builder.or(
                        builder.like(builder.lower(root.get("code")), pattern),
                        builder.like(builder.lower(root.get("name")), pattern)));
            }
            if (normalizedStatus != null) predicates.add(builder.equal(root.get("status"), normalizedStatus));
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Workshop requireWorkshop(Long id) {
        return workshopRepository.findByIdAndTenantId(id, TENANT_ID)
                .orElseThrow(() -> new BusinessException(ErrorCode.IDN_009));
    }

    private boolean isReferenced(Long workshopId) {
        return productionLineRepository.existsByWorkshopId(workshopId);
    }

    private NormalizedWorkshopRequest normalizeAndValidate(WorkshopRequest request, boolean creating) {
        if (request == null) throw new BusinessException(ErrorCode.GENERAL_001, "车间信息不能为空");
        String code = requireText(request.code(), "车间编码", 64);
        String name = requireText(request.name(), "车间名称", 128);
        String description = normalizeOptionalText(request.description(), "描述", 512);
        String status = normalizeStatus(request.status(), creating);
        return new NormalizedWorkshopRequest(code, name, description, status);
    }

    private String requireText(String value, String fieldName, int maxLength) {
        if (!StringUtils.hasText(value)) throw new BusinessException(ErrorCode.GENERAL_001, fieldName + "不能为空");
        String normalized = value.trim();
        if (normalized.length() > maxLength) {
            throw new BusinessException(ErrorCode.GENERAL_001, fieldName + "不能超过" + maxLength + "个字符");
        }
        return normalized;
    }

    private String normalizeOptionalText(String value, String fieldName, int maxLength) {
        if (!StringUtils.hasText(value)) return null;
        String normalized = value.trim();
        if (normalized.length() > maxLength) {
            throw new BusinessException(ErrorCode.GENERAL_001, fieldName + "不能超过" + maxLength + "个字符");
        }
        return normalized;
    }

    private String normalizeStatus(String value, boolean creating) {
        String normalized = StringUtils.hasText(value) ? value.trim().toUpperCase(Locale.ROOT) : creating ? "ACTIVE" : null;
        if (normalized == null || !ALLOWED_STATUSES.contains(normalized)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "车间状态只能是启用或停用");
        }
        return normalized;
    }

    private WorkshopResponse toResponse(Workshop workshop) {
        boolean referenced = isReferenced(workshop.getId());
        return new WorkshopResponse(
                String.valueOf(workshop.getId()),
                workshop.getCode(),
                workshop.getName(),
                workshop.getDescription(),
                workshop.getStatus(),
                referenced,
                !referenced,
                !referenced,
                workshop.getCreatedAt(),
                workshop.getUpdatedAt());
    }

    private Map<String, Object> snapshot(Workshop workshop) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("code", workshop.getCode());
        snapshot.put("name", workshop.getName());
        snapshot.put("description", workshop.getDescription());
        snapshot.put("status", workshop.getStatus());
        return snapshot;
    }

    private void writeAudit(Long entityId, String action, String functionName, Map<String, Object> before, Map<String, Object> after) {
        auditEventRepository.save(AuditEvent.builder()
                .id(idGenerator.nextId())
                .tenantId("default")
                .entityType("WORKSHOP")
                .entityId(String.valueOf(entityId))
                .action(action)
                .contentBefore(toAuditJson(before))
                .contentAfter(toAuditJson(after))
                .operatorId(AuditContext.getOperatorId())
                .operatorName(AuditContext.getOperatorName())
                .operatorAccount(AuditContext.getOperatorAccount())
                .source(AuditContext.getSource())
                .moduleName("数据")
                .menuName("工厂建模 · 车间管理")
                .functionName(functionName)
                .dataSummary("车间管理 #" + entityId)
                .ipAddress(AuditContext.getIpAddress())
                .createdAt(LocalDateTime.now())
                .build());
    }

    private String toAuditJson(Map<String, Object> content) {
        try {
            return AUDIT_OBJECT_MAPPER.writeValueAsString(content);
        } catch (JsonProcessingException exception) {
            throw new BusinessException(ErrorCode.GENERAL_002, "审计内容序列化失败");
        }
    }

    public record WorkshopRequest(String code, String name, String description, String status) {}

    private record NormalizedWorkshopRequest(String code, String name, String description, String status) {}

    public record WorkshopResponse(
            String id,
            String code,
            String name,
            String description,
            String status,
            boolean referenced,
            boolean codeEditable,
            boolean deletable,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {}
}
