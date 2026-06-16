package com.zencas.edhr.system.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.system.entity.BusinessDictionary;
import com.zencas.edhr.system.entity.BusinessDictionaryItem;
import com.zencas.edhr.system.repository.BusinessDictionaryItemRepository;
import com.zencas.edhr.system.repository.BusinessDictionaryRepository;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/system")
@RequiredArgsConstructor
public class BusinessDictionaryController {

    private static final String TENANT_ID = "default";
    private static final String DICTIONARY_ENTITY_TYPE = "BUSINESS_DICTIONARY";
    private static final String DICTIONARY_ITEM_ENTITY_TYPE = "BUSINESS_DICTIONARY_ITEM";
    private static final ObjectMapper AUDIT_OBJECT_MAPPER = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    private static final Set<String> VALID_STATUSES = Set.of("ACTIVE", "DISABLED");

    private final BusinessDictionaryRepository dictionaryRepository;
    private final BusinessDictionaryItemRepository itemRepository;
    private final AuditEventRepository auditEventRepository;
    private final SnowflakeIdGenerator idGenerator;

    @GetMapping("/business-dictionaries")
    public ApiResponse<PageResult<DictionaryResponse>> listDictionaries(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "sortOrder") String sort,
            @RequestParam(defaultValue = "asc") String order) {
        Page<BusinessDictionary> result = dictionaryRepository.findAll(
                dictionarySpec(keyword, status),
                pageable(page, size, sort, order));
        List<Long> dictionaryIds = result.getContent().stream().map(BusinessDictionary::getId).filter(Objects::nonNull).toList();
        Map<Long, Long> itemCounts = dictionaryIds.isEmpty()
                ? Map.of()
                : itemRepository.findByDictionaryIdIn(dictionaryIds).stream()
                        .collect(Collectors.groupingBy(BusinessDictionaryItem::getDictionaryId, Collectors.counting()));
        List<DictionaryResponse> content = result.getContent().stream()
                .map(dictionary -> DictionaryResponse.from(dictionary, itemCounts.getOrDefault(dictionary.getId(), 0L)))
                .toList();
        return ApiResponse.success(PageResult.of(content, page, size, result.getTotalElements()));
    }

    @PostMapping("/business-dictionaries")
    @Transactional
    public ApiResponse<DictionaryResponse> createDictionary(@RequestBody DictionaryRequest request) {
        String code = requireCode(request == null ? null : request.code());
        if (dictionaryRepository.existsByTenantIdAndCode(TENANT_ID, code)) {
            throw new BusinessException(ErrorCode.GENERAL_003, "业务字典编码已存在");
        }
        LocalDateTime now = LocalDateTime.now();
        BusinessDictionary dictionary = BusinessDictionary.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .code(code)
                .name(requireText(request == null ? null : request.name(), "字典名称不能为空"))
                .description(trimToNull(request == null ? null : request.description()))
                .status(resolveStatus(request == null ? null : request.status(), "ACTIVE"))
                .sortOrder(request == null || request.sortOrder() == null ? 0 : request.sortOrder())
                .builtin(false)
                .createdBy(currentOperatorName())
                .createdAt(now)
                .updatedBy(currentOperatorName())
                .updatedAt(now)
                .build();
        BusinessDictionary saved = dictionaryRepository.save(dictionary);
        writeAudit(DICTIONARY_ENTITY_TYPE, saved.getId(), "CREATE", "新增业务字典", dictionarySummary(saved), Map.of(), dictionarySnapshot(saved));
        return ApiResponse.success(DictionaryResponse.from(saved, 0));
    }

    @PutMapping("/business-dictionaries/{id}")
    @Transactional
    public ApiResponse<DictionaryResponse> updateDictionary(@PathVariable Long id, @RequestBody DictionaryRequest request) {
        BusinessDictionary existing = dictionaryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "业务字典不存在"));
        Map<String, Object> before = dictionarySnapshot(existing);
        String nextCode = requireCode(request == null ? null : request.code());
        if (!existing.getCode().equals(nextCode) && dictionaryRepository.existsByTenantIdAndCode(TENANT_ID, nextCode)) {
            throw new BusinessException(ErrorCode.GENERAL_003, "业务字典编码已存在");
        }
        existing.setCode(nextCode);
        existing.setName(requireText(request == null ? null : request.name(), "字典名称不能为空"));
        existing.setDescription(trimToNull(request == null ? null : request.description()));
        existing.setStatus(resolveStatus(request == null ? null : request.status(), existing.getStatus()));
        if (request != null && request.sortOrder() != null) existing.setSortOrder(request.sortOrder());
        existing.setUpdatedBy(currentOperatorName());
        BusinessDictionary saved = dictionaryRepository.save(existing);
        writeChangedAudit(DICTIONARY_ENTITY_TYPE, saved.getId(), "编辑业务字典", dictionarySummary(saved), before, dictionarySnapshot(saved));
        long itemCount = itemRepository.findByDictionaryIdOrderBySortOrderAscCreatedAtAsc(saved.getId()).size();
        return ApiResponse.success(DictionaryResponse.from(saved, itemCount));
    }

    @DeleteMapping("/business-dictionaries/{id}")
    @Transactional
    public ApiResponse<Void> deleteDictionary(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean cascade) {
        BusinessDictionary existing = dictionaryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "业务字典不存在"));
        if (Boolean.TRUE.equals(existing.getBuiltin())) {
            throw new BusinessException(ErrorCode.GENERAL_003, "系统内置业务字典不能删除");
        }
        if (!cascade && itemRepository.existsByDictionaryId(id)) {
            throw new BusinessException(ErrorCode.GENERAL_003, "字典下存在字典项，不能删除");
        }
        List<BusinessDictionaryItem> items = cascade
                ? itemRepository.findByDictionaryIdOrderBySortOrderAscCreatedAtAsc(id)
                : List.of();
        if (items.stream().anyMatch(item -> Boolean.TRUE.equals(item.getBuiltin()))) {
            throw new BusinessException(ErrorCode.GENERAL_003, "系统内置字典项不能删除");
        }
        if (!items.isEmpty()) itemRepository.deleteAll(items);
        dictionaryRepository.deleteById(id);
        Map<String, Object> before = items.isEmpty()
                ? dictionarySnapshot(existing)
                : Map.of("dictionary", dictionarySnapshot(existing), "items", items.stream().map(item -> itemSnapshot(existing, item)).toList());
        writeAudit(DICTIONARY_ENTITY_TYPE, id, "DELETE", "删除业务字典", dictionarySummary(existing), before, Map.of());
        return ApiResponse.success(null);
    }

    @GetMapping("/business-dictionaries/{dictionaryId}/items")
    public ApiResponse<PageResult<DictionaryItemResponse>> listItems(
            @PathVariable Long dictionaryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "sortOrder") String sort,
            @RequestParam(defaultValue = "asc") String order) {
        BusinessDictionary dictionary = findDictionary(dictionaryId);
        Page<BusinessDictionaryItem> result = itemRepository.findAll(
                itemSpec(dictionaryId, keyword, status),
                pageable(page, size, sort, order));
        List<DictionaryItemResponse> content = result.getContent().stream()
                .map(item -> DictionaryItemResponse.from(dictionary, item))
                .toList();
        return ApiResponse.success(PageResult.of(content, page, size, result.getTotalElements()));
    }

    @PostMapping("/business-dictionaries/{dictionaryId}/items")
    @Transactional
    public ApiResponse<DictionaryItemResponse> createItem(
            @PathVariable Long dictionaryId,
            @RequestBody DictionaryItemRequest request) {
        BusinessDictionary dictionary = findDictionary(dictionaryId);
        String value = requireValue(request == null ? null : request.value());
        if (itemRepository.existsByDictionaryIdAndValue(dictionaryId, value)) {
            throw new BusinessException(ErrorCode.GENERAL_003, "字典项值已存在");
        }
        LocalDateTime now = LocalDateTime.now();
        BusinessDictionaryItem item = BusinessDictionaryItem.builder()
                .id(idGenerator.nextId())
                .dictionaryId(dictionaryId)
                .value(value)
                .label(requireText(request == null ? null : request.label(), "字典项名称不能为空"))
                .sortOrder(request == null || request.sortOrder() == null ? 0 : request.sortOrder())
                .status(resolveStatus(request == null ? null : request.status(), "ACTIVE"))
                .remark(trimToNull(request == null ? null : request.remark()))
                .builtin(false)
                .createdBy(currentOperatorName())
                .createdAt(now)
                .updatedBy(currentOperatorName())
                .updatedAt(now)
                .build();
        BusinessDictionaryItem saved = itemRepository.save(item);
        writeAudit(DICTIONARY_ITEM_ENTITY_TYPE, saved.getId(), "CREATE", "新增字典项", itemSummary(dictionary, saved), Map.of(), itemSnapshot(dictionary, saved));
        return ApiResponse.success(DictionaryItemResponse.from(dictionary, saved));
    }

    @PutMapping("/business-dictionary-items/{id}")
    @Transactional
    public ApiResponse<DictionaryItemResponse> updateItem(@PathVariable Long id, @RequestBody DictionaryItemRequest request) {
        BusinessDictionaryItem existing = itemRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "字典项不存在"));
        BusinessDictionary dictionary = findDictionary(existing.getDictionaryId());
        Map<String, Object> before = itemSnapshot(dictionary, existing);
        String nextValue = requireValue(request == null ? null : request.value());
        if (!existing.getValue().equals(nextValue) && itemRepository.existsByDictionaryIdAndValue(existing.getDictionaryId(), nextValue)) {
            throw new BusinessException(ErrorCode.GENERAL_003, "字典项值已存在");
        }
        existing.setValue(nextValue);
        existing.setLabel(requireText(request == null ? null : request.label(), "字典项名称不能为空"));
        if (request != null && request.sortOrder() != null) existing.setSortOrder(request.sortOrder());
        existing.setStatus(resolveStatus(request == null ? null : request.status(), existing.getStatus()));
        existing.setRemark(trimToNull(request == null ? null : request.remark()));
        existing.setUpdatedBy(currentOperatorName());
        BusinessDictionaryItem saved = itemRepository.save(existing);
        writeChangedAudit(DICTIONARY_ITEM_ENTITY_TYPE, saved.getId(), "编辑字典项", itemSummary(dictionary, saved), before, itemSnapshot(dictionary, saved));
        return ApiResponse.success(DictionaryItemResponse.from(dictionary, saved));
    }

    @DeleteMapping("/business-dictionary-items/{id}")
    @Transactional
    public ApiResponse<Void> deleteItem(@PathVariable Long id) {
        BusinessDictionaryItem existing = itemRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "字典项不存在"));
        if (Boolean.TRUE.equals(existing.getBuiltin())) {
            throw new BusinessException(ErrorCode.GENERAL_003, "系统内置字典项不能删除");
        }
        BusinessDictionary dictionary = findDictionary(existing.getDictionaryId());
        itemRepository.deleteById(id);
        writeAudit(DICTIONARY_ITEM_ENTITY_TYPE, id, "DELETE", "删除字典项", itemSummary(dictionary, existing), itemSnapshot(dictionary, existing), Map.of());
        return ApiResponse.success(null);
    }

    @PutMapping("/business-dictionary-items/order")
    @Transactional
    public ApiResponse<List<DictionaryItemResponse>> reorderItems(@RequestBody DictionaryItemOrderRequest request) {
        Long dictionaryId = request == null ? null : request.dictionaryId();
        if (dictionaryId == null) throw new BusinessException(ErrorCode.GENERAL_001, "字典不能为空");
        BusinessDictionary dictionary = findDictionary(dictionaryId);
        List<Long> ids = requireIds(request.ids());
        List<BusinessDictionaryItem> items = itemRepository.findByDictionaryIdOrderBySortOrderAscCreatedAtAsc(dictionaryId);
        LinkedHashSet<Long> currentIds = items.stream()
                .map(BusinessDictionaryItem::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        LinkedHashSet<Long> requestedIds = new LinkedHashSet<>(ids);
        if (requestedIds.size() != ids.size() || !currentIds.equals(requestedIds)) {
            throw new BusinessException(ErrorCode.GENERAL_003, "请提交当前字典下全部字典项后再调整排序");
        }
        Map<String, Object> before = Map.of("items", items.stream().map(item -> itemSnapshot(dictionary, item)).toList());
        List<BusinessDictionaryItem> ordered = orderByIds(items, ids);
        for (int i = 0; i < ordered.size(); i++) {
            ordered.get(i).setSortOrder(i + 1);
            ordered.get(i).setUpdatedBy(currentOperatorName());
        }
        itemRepository.saveAll(ordered);
        writeAudit(DICTIONARY_ENTITY_TYPE, dictionary.getId(), "REORDER", "调整字典项排序", dictionarySummary(dictionary),
                before, Map.of("items", ordered.stream().map(item -> itemSnapshot(dictionary, item)).toList()));
        return ApiResponse.success(ordered.stream().map(item -> DictionaryItemResponse.from(dictionary, item)).toList());
    }

    @GetMapping("/business-dictionaries/{code}/options")
    public ApiResponse<List<DictionaryOptionResponse>> listOptions(@PathVariable String code) {
        BusinessDictionary dictionary = dictionaryRepository.findByTenantIdAndCode(TENANT_ID, requireCode(code))
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "业务字典不存在"));
        if (!"ACTIVE".equals(dictionary.getStatus())) return ApiResponse.success(List.of());
        List<DictionaryOptionResponse> options = itemRepository.findByDictionaryIdOrderBySortOrderAscCreatedAtAsc(dictionary.getId()).stream()
                .filter(item -> "ACTIVE".equals(item.getStatus()))
                .map(item -> DictionaryOptionResponse.from(dictionary, item))
                .toList();
        return ApiResponse.success(options);
    }

    private BusinessDictionary findDictionary(Long id) {
        return dictionaryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "业务字典不存在"));
    }

    private Specification<BusinessDictionary> dictionarySpec(String keyword, String status) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("tenantId"), TENANT_ID));
            if (StringUtils.hasText(keyword)) {
                String like = "%" + keyword.trim() + "%";
                predicates.add(cb.or(cb.like(root.get("name"), like), cb.like(root.get("code"), like)));
            }
            if (StringUtils.hasText(status) && !"ALL".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(root.get("status"), status.trim()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Specification<BusinessDictionaryItem> itemSpec(Long dictionaryId, String keyword, String status) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("dictionaryId"), dictionaryId));
            if (StringUtils.hasText(keyword)) {
                String like = "%" + keyword.trim() + "%";
                predicates.add(cb.or(cb.like(root.get("label"), like), cb.like(root.get("value"), like)));
            }
            if (StringUtils.hasText(status) && !"ALL".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(root.get("status"), status.trim()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private PageRequest pageable(int page, int size, String sort, String order) {
        Sort.Direction direction = "desc".equalsIgnoreCase(order) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return PageRequest.of(Math.max(page - 1, 0), Math.max(size, 1), Sort.by(direction, safeSort(sort)));
    }

    private String safeSort(String sort) {
        if (!StringUtils.hasText(sort)) return "sortOrder";
        return switch (sort) {
            case "name", "code", "label", "value", "status", "sortOrder", "createdAt", "updatedAt" -> sort;
            default -> "sortOrder";
        };
    }

    private List<Long> requireIds(List<Long> ids) {
        if (ids == null || ids.stream().filter(Objects::nonNull).toList().isEmpty()) {
            throw new BusinessException(ErrorCode.GENERAL_001, "请选择数据");
        }
        return ids.stream().filter(Objects::nonNull).distinct().toList();
    }

    private List<BusinessDictionaryItem> orderByIds(List<BusinessDictionaryItem> items, List<Long> ids) {
        Map<Long, BusinessDictionaryItem> byId = new LinkedHashMap<>();
        items.forEach(item -> byId.put(item.getId(), item));
        return ids.stream().map(byId::get).filter(Objects::nonNull).toList();
    }

    private String requireText(String value, String message) {
        if (!StringUtils.hasText(value)) throw new BusinessException(ErrorCode.GENERAL_001, message);
        return value.trim();
    }

    private String requireCode(String value) {
        String code = requireText(value, "字典编码不能为空").trim().toUpperCase(Locale.ROOT);
        if (!code.matches("[A-Z][A-Z0-9_\\-]{1,63}")) {
            throw new BusinessException(ErrorCode.GENERAL_001, "字典编码只能包含大写字母、数字、下划线或中划线，且必须以字母开头");
        }
        return code;
    }

    private String requireValue(String value) {
        return requireText(value, "字典项值不能为空");
    }

    private String resolveStatus(String value, String fallback) {
        String status = StringUtils.hasText(value) ? value.trim().toUpperCase(Locale.ROOT) : fallback;
        if (!VALID_STATUSES.contains(status)) throw new BusinessException(ErrorCode.GENERAL_001, "状态只能为启用或禁用");
        return status;
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String currentOperatorName() {
        if (StringUtils.hasText(AuditContext.getOperatorName())) return AuditContext.getOperatorName();
        if (StringUtils.hasText(AuditContext.getOperatorAccount())) return AuditContext.getOperatorAccount();
        return "系统管理员";
    }

    private Map<String, Object> dictionarySnapshot(BusinessDictionary dictionary) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("id", dictionary.getId());
        snapshot.put("code", dictionary.getCode());
        snapshot.put("name", dictionary.getName());
        snapshot.put("displayName", dictionary.getName());
        snapshot.put("description", dictionary.getDescription());
        snapshot.put("status", dictionary.getStatus());
        snapshot.put("statusLabel", statusLabel(dictionary.getStatus()));
        snapshot.put("sortOrder", dictionary.getSortOrder());
        snapshot.put("builtin", Boolean.TRUE.equals(dictionary.getBuiltin()));
        snapshot.put("createdBy", dictionary.getCreatedBy());
        snapshot.put("createdAt", dictionary.getCreatedAt());
        snapshot.put("updatedBy", dictionary.getUpdatedBy());
        snapshot.put("updatedAt", dictionary.getUpdatedAt());
        return snapshot;
    }

    private Map<String, Object> itemSnapshot(BusinessDictionary dictionary, BusinessDictionaryItem item) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("id", item.getId());
        snapshot.put("dictionaryId", item.getDictionaryId());
        snapshot.put("dictionaryCode", dictionary.getCode());
        snapshot.put("dictionaryName", dictionary.getName());
        snapshot.put("value", item.getValue());
        snapshot.put("label", item.getLabel());
        snapshot.put("displayName", item.getLabel());
        snapshot.put("sortOrder", item.getSortOrder());
        snapshot.put("status", item.getStatus());
        snapshot.put("statusLabel", statusLabel(item.getStatus()));
        snapshot.put("remark", item.getRemark());
        snapshot.put("builtin", Boolean.TRUE.equals(item.getBuiltin()));
        snapshot.put("createdBy", item.getCreatedBy());
        snapshot.put("createdAt", item.getCreatedAt());
        snapshot.put("updatedBy", item.getUpdatedBy());
        snapshot.put("updatedAt", item.getUpdatedAt());
        return snapshot;
    }

    private String statusLabel(String status) {
        if ("ACTIVE".equals(status)) return "启用";
        if ("DISABLED".equals(status)) return "禁用";
        return status;
    }

    private String dictionarySummary(BusinessDictionary dictionary) {
        return "业务字典：" + dictionary.getName();
    }

    private String itemSummary(BusinessDictionary dictionary, BusinessDictionaryItem item) {
        return "字典项：" + dictionary.getName() + "/" + item.getLabel();
    }

    private void writeChangedAudit(
            String entityType,
            Long entityId,
            String functionName,
            String dataSummary,
            Map<String, Object> before,
            Map<String, Object> after) {
        Map<String, Object> changedBefore = new LinkedHashMap<>();
        Map<String, Object> changedAfter = new LinkedHashMap<>();
        before.forEach((field, beforeValue) -> {
            if (isUpdateAuditSystemField(field)) return;
            Object afterValue = after.get(field);
            if (!Objects.equals(beforeValue, afterValue)) {
                changedBefore.put(field, beforeValue);
                changedAfter.put(field, afterValue);
            }
        });
        if (changedBefore.isEmpty()) return;
        writeAudit(entityType, entityId, "UPDATE", functionName, dataSummary, changedBefore, changedAfter);
    }

    private boolean isUpdateAuditSystemField(String field) {
        return "displayName".equals(field) || "updatedBy".equals(field) || "updatedAt".equals(field);
    }

    private void writeAudit(
            String entityType,
            Long entityId,
            String action,
            String functionName,
            String dataSummary,
            Map<String, Object> before,
            Map<String, Object> after) {
        auditEventRepository.save(AuditEvent.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .entityType(entityType)
                .entityId(entityId == null ? "" : String.valueOf(entityId))
                .action(action)
                .contentBefore(toAuditJson(before))
                .contentAfter(toAuditJson(after))
                .operatorId(AuditContext.getOperatorId())
                .operatorName(AuditContext.getOperatorName())
                .operatorAccount(AuditContext.getOperatorAccount())
                .source(AuditContext.getSource())
                .moduleName("系统")
                .menuName("业务字典")
                .functionName(functionName)
                .dataSummary(dataSummary)
                .ipAddress(AuditContext.getIpAddress())
                .createdAt(LocalDateTime.now())
                .build());
    }

    private String toAuditJson(Map<String, Object> content) {
        try {
            return AUDIT_OBJECT_MAPPER.writeValueAsString(content);
        } catch (JsonProcessingException e) {
            throw new BusinessException(ErrorCode.GENERAL_001, "审计内容序列化失败");
        }
    }

    public record DictionaryRequest(
            String code,
            String name,
            String description,
            String status,
            Integer sortOrder) {
    }

    public record DictionaryItemRequest(
            String value,
            String label,
            Integer sortOrder,
            String status,
            String remark) {
    }

    public record DictionaryItemOrderRequest(Long dictionaryId, List<Long> ids) {
    }

    public record DictionaryResponse(
            String id,
            String tenantId,
            String code,
            String name,
            String description,
            String status,
            Integer sortOrder,
            boolean builtin,
            long itemCount,
            String createdBy,
            LocalDateTime createdAt,
            String updatedBy,
            LocalDateTime updatedAt) {
        private static DictionaryResponse from(BusinessDictionary dictionary, long itemCount) {
            return new DictionaryResponse(
                    String.valueOf(dictionary.getId()),
                    dictionary.getTenantId(),
                    dictionary.getCode(),
                    dictionary.getName(),
                    dictionary.getDescription(),
                    dictionary.getStatus(),
                    dictionary.getSortOrder(),
                    Boolean.TRUE.equals(dictionary.getBuiltin()),
                    itemCount,
                    dictionary.getCreatedBy(),
                    dictionary.getCreatedAt(),
                    dictionary.getUpdatedBy(),
                    dictionary.getUpdatedAt());
        }
    }

    public record DictionaryItemResponse(
            String id,
            String dictionaryId,
            String dictionaryCode,
            String dictionaryName,
            String value,
            String label,
            Integer sortOrder,
            String status,
            String remark,
            boolean builtin,
            String createdBy,
            LocalDateTime createdAt,
            String updatedBy,
            LocalDateTime updatedAt) {
        private static DictionaryItemResponse from(BusinessDictionary dictionary, BusinessDictionaryItem item) {
            return new DictionaryItemResponse(
                    String.valueOf(item.getId()),
                    String.valueOf(dictionary.getId()),
                    dictionary.getCode(),
                    dictionary.getName(),
                    item.getValue(),
                    item.getLabel(),
                    item.getSortOrder(),
                    item.getStatus(),
                    item.getRemark(),
                    Boolean.TRUE.equals(item.getBuiltin()),
                    item.getCreatedBy(),
                    item.getCreatedAt(),
                    item.getUpdatedBy(),
                    item.getUpdatedAt());
        }
    }

    public record DictionaryOptionResponse(
            String dictionaryCode,
            String value,
            String label,
            Integer sortOrder,
            String remark) {
        private static DictionaryOptionResponse from(BusinessDictionary dictionary, BusinessDictionaryItem item) {
            return new DictionaryOptionResponse(
                    dictionary.getCode(),
                    item.getValue(),
                    item.getLabel(),
                    item.getSortOrder(),
                    item.getRemark());
        }
    }
}
