package com.zencas.edhr.gct.store;

import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.gct.dto.GctActionMetaDto;
import com.zencas.edhr.gct.dto.GctActionRequest;
import com.zencas.edhr.gct.dto.GctActionResultDto;
import com.zencas.edhr.gct.dto.GctAuditEntryDto;
import com.zencas.edhr.gct.dto.GctFieldMetaDto;
import com.zencas.edhr.gct.dto.GctPageSpecDto;
import com.zencas.edhr.gct.dto.GctRecordDto;
import com.zencas.edhr.gct.dto.GctRecordMutationRequest;
import com.zencas.edhr.gct.dto.GctRecordQueryRequest;
import com.zencas.edhr.gct.dto.GctStatusHistoryDto;
import com.zencas.edhr.gct.service.GctActorResolver;
import com.zencas.edhr.gct.service.GctPageRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Stream;

@Component
public class InMemoryGctRecordStore {

    private static final int INITIAL_RECORDS_PER_PAGE = 20;
    private static final String DELETED_STATUS = "已删除";
    private static final String TENANT_ID = "demo-tenant";
    private static final Instant BASE_TIME = Instant.parse("2026-01-01T00:00:00Z");
    private final GctPageRegistry registry;
    private final GctActorResolver actorResolver;
    private final Map<String, List<GctRecordDto>> records = new ConcurrentHashMap<>();
    private final Map<String, List<GctAuditEntryDto>> auditEntries = new ConcurrentHashMap<>();
    private final Map<String, List<GctStatusHistoryDto>> statusHistoryEntries = new ConcurrentHashMap<>();
    private final AtomicLong recordSequence = new AtomicLong(1);
    private final AtomicLong eventSequence = new AtomicLong(1);

    public InMemoryGctRecordStore(GctPageRegistry registry) {
        this(registry, new GctActorResolver());
    }

    @Autowired
    public InMemoryGctRecordStore(GctPageRegistry registry, GctActorResolver actorResolver) {
        this.registry = registry;
        this.actorResolver = actorResolver;
        reset();
    }

    public synchronized void reset() {
        records.clear();
        auditEntries.clear();
        statusHistoryEntries.clear();
        recordSequence.set(1);
        eventSequence.set(1);

        int pageIndex = 0;
        for (GctPageSpecDto page : registry.listPages()) {
            records.put(page.getCode(), initializePageRecords(page, pageIndex));
            pageIndex++;
        }
    }

    public synchronized PageResult<GctRecordDto> query(String pageCode, GctRecordQueryRequest request) {
        registry.getPageOrThrow(pageCode);
        GctRecordQueryRequest query = request == null ? new GctRecordQueryRequest() : request;
        int page = normalizePage(query.getPage());
        int size = normalizeSize(query.getSize());
        String sort = isBlank(query.getSort()) ? "createdAt" : query.getSort();
        String order = isBlank(query.getOrder()) ? "desc" : query.getOrder();

        List<GctRecordDto> filtered = pageRecords(pageCode).stream()
                .filter(record -> matchesStatus(record, query.getStatus()))
                .filter(record -> matchesSearch(record, query.getQ()))
                .filter(record -> matchesFilters(record, query.getFilters()))
                .sorted(sortComparator(sort, order))
                .map(this::copyRecord)
                .toList();

        int start = Math.min((page - 1) * size, filtered.size());
        int end = Math.min(start + size, filtered.size());
        return PageResult.of(new ArrayList<>(filtered.subList(start, end)), page, size, filtered.size());
    }

    public synchronized GctRecordDto find(String pageCode, String recordId) {
        registry.getPageOrThrow(pageCode);
        return copyRecord(findMutable(pageCode, recordId));
    }

    public synchronized GctRecordDto create(String pageCode, GctRecordMutationRequest request) {
        GctPageSpecDto page = registry.getPageOrThrow(pageCode);
        GctRecordMutationRequest mutation = request == null ? new GctRecordMutationRequest() : request;
        String now = Instant.now().toString();
        String actor = resolveActor(mutation.getActor());
        String id = pageCode + "-NEW-" + String.format("%03d", recordSequence.getAndIncrement());
        GctRecordDto record = GctRecordDto.builder()
                .id(id)
                .pageCode(pageCode)
                .pageTitle(page.getTitle())
                .module(page.getModule())
                .type(page.getType())
                .tenantId(TENANT_ID)
                .status(isBlank(mutation.getStatus()) ? defaultStatus(page) : mutation.getStatus())
                .values(copyMap(mutation.getValues()))
                .createdBy(actor)
                .createdAt(now)
                .updatedBy(actor)
                .updatedAt(now)
                .remark(mutation.getRemark())
                .deleted(DELETED_STATUS.equals(mutation.getStatus()))
                .build();
        pageRecords(pageCode).add(record);
        appendAudit(page, record, "create", "新建", actor, "新建记录", null, record.getStatus(),
                Map.of("values", copyMap(record.getValues())));
        return copyRecord(record);
    }

    public synchronized GctRecordDto update(String pageCode, String recordId, GctRecordMutationRequest request) {
        GctPageSpecDto page = registry.getPageOrThrow(pageCode);
        GctRecordMutationRequest mutation = request == null ? new GctRecordMutationRequest() : request;
        GctRecordDto record = findMutable(pageCode, recordId);
        String beforeStatus = record.getStatus();
        String actor = resolveActor(mutation.getActor());
        if (mutation.getValues() != null && !mutation.getValues().isEmpty()) {
            Map<String, Object> values = copyMap(record.getValues());
            values.putAll(copyMap(mutation.getValues()));
            record.setValues(values);
        }
        if (!isBlank(mutation.getStatus())) {
            record.setStatus(mutation.getStatus());
            record.setDeleted(DELETED_STATUS.equals(mutation.getStatus()));
        }
        record.setRemark(mutation.getRemark());
        record.setUpdatedBy(actor);
        record.setUpdatedAt(Instant.now().toString());
        appendAudit(page, record, "update", "编辑", actor, "编辑记录", beforeStatus, record.getStatus(),
                Map.of("values", copyMap(mutation.getValues())));
        if (!Objects.equals(beforeStatus, record.getStatus())) {
            appendStatusHistory(page, record, "update", beforeStatus, record.getStatus(), actor, mutation.getRemark());
        }
        return copyRecord(record);
    }

    public synchronized GctRecordDto delete(String pageCode, String recordId) {
        return executeAction(pageCode, recordId, "delete",
                GctActionRequest.builder().remark("逻辑删除").build()).getRecord();
    }

    public synchronized GctActionResultDto executeAction(
            String pageCode,
            String recordId,
            String actionCode,
            GctActionRequest request) {
        GctPageSpecDto page = registry.getPageOrThrow(pageCode);
        validateActionAllowed(page, actionCode);
        GctRecordDto record = findMutable(pageCode, recordId);
        GctActionRequest actionRequest = request == null ? new GctActionRequest() : request;
        String actor = resolveActor(actionRequest.getActor());
        String beforeStatus = record.getStatus();
        String actionLabel = actionLabel(page, actionCode);
        GctRecordDto createdRecord = null;
        GctStatusHistoryDto historyEntry = null;
        boolean changed = false;

        if (isCopyAction(actionCode)) {
            createdRecord = createDerivedRecord(page, record, actionCode, actionRequest, actor);
            changed = true;
        } else {
            String targetStatus = targetStatus(page, actionCode);
            if (!isBlank(targetStatus) && !Objects.equals(beforeStatus, targetStatus)) {
                record.setStatus(targetStatus);
                record.setDeleted(DELETED_STATUS.equals(targetStatus));
                record.setUpdatedBy(actor);
                record.setUpdatedAt(Instant.now().toString());
                historyEntry = appendStatusHistory(page, record, actionCode, beforeStatus, targetStatus, actor,
                        actionRequest.getRemark());
                changed = true;
            }
        }

        GctAuditEntryDto auditEntry = null;
        if (shouldAudit(page, actionCode, actionRequest)) {
            auditEntry = appendAudit(page, record, actionCode, actionLabel, actor,
                    actionLabel + "：" + record.getId(), beforeStatus, record.getStatus(), auditInput(actionRequest));
        }

        return GctActionResultDto.builder()
                .actionCode(actionCode)
                .message(actionLabel + "完成")
                .record(copyRecord(record))
                .createdRecord(createdRecord == null ? null : copyRecord(createdRecord))
                .auditEntry(auditEntry)
                .statusHistoryEntry(historyEntry)
                .changed(changed)
                .build();
    }

    public synchronized List<GctAuditEntryDto> listAudit(String pageCode, String recordId) {
        registry.getPageOrThrow(pageCode);
        findMutable(pageCode, recordId);
        return auditEntries.getOrDefault(recordKey(pageCode, recordId), List.of()).stream()
                .map(this::copyAudit)
                .toList();
    }

    public synchronized List<GctStatusHistoryDto> listStatusHistory(String pageCode, String recordId) {
        registry.getPageOrThrow(pageCode);
        findMutable(pageCode, recordId);
        return statusHistoryEntries.getOrDefault(recordKey(pageCode, recordId), List.of()).stream()
                .map(this::copyStatusHistory)
                .toList();
    }

    private List<GctRecordDto> initializePageRecords(GctPageSpecDto page, int pageIndex) {
        List<GctRecordDto> pageRecords = new ArrayList<>();
        List<String> statuses = initialStatuses(page);
        for (int i = 1; i <= INITIAL_RECORDS_PER_PAGE; i++) {
            String id = page.getCode() + "-" + String.format("%03d", i);
            String createdAt = BASE_TIME.plusSeconds((long) pageIndex * 10_000 + i * 60L).toString();
            pageRecords.add(GctRecordDto.builder()
                    .id(id)
                    .pageCode(page.getCode())
                    .pageTitle(page.getTitle())
                    .module(page.getModule())
                    .type(page.getType())
                    .tenantId(TENANT_ID)
                    .status(statuses.get((i - 1) % statuses.size()))
                    .values(defaultValues(page, i))
                    .createdBy("demo-user")
                    .createdAt(createdAt)
                    .updatedBy("demo-user")
                    .updatedAt(createdAt)
                    .remark(page.getLabel() + " 演示记录-" + String.format("%02d", i))
                    .deleted(false)
                    .build());
        }
        return pageRecords;
    }

    private Map<String, Object> defaultValues(GctPageSpecDto page, int rowNumber) {
        Map<String, Object> values = new LinkedHashMap<>();
        Set<String> seen = new LinkedHashSet<>();
        Stream.of(page.getListFields(), page.getFormFields(), page.getFields())
                .filter(Objects::nonNull)
                .flatMap(List::stream)
                .filter(field -> !isBlank(field.getName()))
                .filter(field -> seen.add(field.getName()))
                .forEach(field -> values.put(field.getName(), fieldValue(page, field, rowNumber)));
        values.put("id", page.getCode() + "-" + String.format("%03d", rowNumber));
        values.put("tenantId", TENANT_ID);
        return values;
    }

    private String fieldValue(GctPageSpecDto page, GctFieldMetaDto field, int rowNumber) {
        String suffix = "演示记录-" + String.format("%02d", rowNumber);
        if ("编号".equals(field.getLabel()) || "id".equalsIgnoreCase(field.getName())) {
            return suffix;
        }
        return page.getLabel() + "-" + field.getLabel() + "-" + suffix;
    }

    private List<String> initialStatuses(GctPageSpecDto page) {
        LinkedHashSet<String> statuses = new LinkedHashSet<>();
        if (page.getBusinessStatuses() != null) {
            statuses.addAll(page.getBusinessStatuses());
        }
        if (page.getBaseStatuses() != null) {
            statuses.addAll(page.getBaseStatuses());
        }
        statuses.remove(DELETED_STATUS);
        if (statuses.isEmpty()) {
            statuses.add("草稿");
        }
        return new ArrayList<>(statuses);
    }

    private String defaultStatus(GctPageSpecDto page) {
        if (page.getBaseStatuses() != null && page.getBaseStatuses().contains("草稿")) {
            return "草稿";
        }
        return initialStatuses(page).getFirst();
    }

    private List<GctRecordDto> pageRecords(String pageCode) {
        List<GctRecordDto> pageRecords = records.get(pageCode);
        if (pageRecords == null) {
            throw new BusinessException(ErrorCode.GENERAL_001, "GCT page records not initialized: " + pageCode);
        }
        return pageRecords;
    }

    private GctRecordDto findMutable(String pageCode, String recordId) {
        return pageRecords(pageCode).stream()
                .filter(record -> Objects.equals(record.getId(), recordId))
                .findFirst()
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.GENERAL_001, "GCT record not found: " + pageCode + "/" + recordId));
    }

    private boolean matchesStatus(GctRecordDto record, String status) {
        if (isBlank(status)) {
            return !DELETED_STATUS.equals(record.getStatus()) && !Boolean.TRUE.equals(record.getDeleted());
        }
        return Objects.equals(record.getStatus(), status);
    }

    private boolean matchesSearch(GctRecordDto record, String q) {
        if (isBlank(q)) {
            return true;
        }
        String needle = q.toLowerCase(Locale.ROOT);
        if (contains(record.getId(), needle) || contains(record.getStatus(), needle) || contains(record.getRemark(), needle)) {
            return true;
        }
        return record.getValues() != null && record.getValues().values().stream()
                .map(value -> Objects.toString(value, ""))
                .anyMatch(value -> value.toLowerCase(Locale.ROOT).contains(needle));
    }

    private boolean matchesFilters(GctRecordDto record, Map<String, Object> filters) {
        if (filters == null || filters.isEmpty()) {
            return true;
        }
        return filters.entrySet().stream()
                .filter(entry -> !isBlank(Objects.toString(entry.getValue(), "")))
                .allMatch(entry -> Objects.toString(record.getValues().get(entry.getKey()), "")
                        .contains(Objects.toString(entry.getValue(), "")));
    }

    private Comparator<GctRecordDto> sortComparator(String sort, String order) {
        Comparator<GctRecordDto> comparator = Comparator.comparing(
                record -> Objects.toString(sortValue(record, sort), ""),
                String.CASE_INSENSITIVE_ORDER);
        if ("desc".equalsIgnoreCase(order)) {
            comparator = comparator.reversed();
        }
        return comparator;
    }

    private Object sortValue(GctRecordDto record, String sort) {
        return switch (sort) {
            case "id" -> record.getId();
            case "pageCode" -> record.getPageCode();
            case "module" -> record.getModule();
            case "type" -> record.getType();
            case "status" -> record.getStatus();
            case "createdBy" -> record.getCreatedBy();
            case "createdAt" -> record.getCreatedAt();
            case "updatedBy" -> record.getUpdatedBy();
            case "updatedAt" -> record.getUpdatedAt();
            default -> record.getValues() == null ? null : record.getValues().get(sort);
        };
    }

    private GctRecordDto createDerivedRecord(
            GctPageSpecDto page,
            GctRecordDto source,
            String actionCode,
            GctActionRequest request,
            String actor) {
        String now = Instant.now().toString();
        Map<String, Object> values = copyMap(source.getValues());
        values.putAll(copyMap(request.getValues()));
        values.put("sourceRecordId", source.getId());
        values.put("sourceAction", actionCode);
        String prefix = actionCode.startsWith("version") ? "VERSION" : "COPY";
        GctRecordDto derived = GctRecordDto.builder()
                .id(page.getCode() + "-" + prefix + "-" + String.format("%03d", recordSequence.getAndIncrement()))
                .pageCode(page.getCode())
                .pageTitle(page.getTitle())
                .module(page.getModule())
                .type(page.getType())
                .tenantId(TENANT_ID)
                .status(defaultStatus(page))
                .values(values)
                .createdBy(actor)
                .createdAt(now)
                .updatedBy(actor)
                .updatedAt(now)
                .remark(isBlank(request.getRemark()) ? actionLabel(page, actionCode) + "自" + source.getId() : request.getRemark())
                .deleted(false)
                .build();
        pageRecords(page.getCode()).add(derived);
        return derived;
    }

    private GctStatusHistoryDto appendStatusHistory(
            GctPageSpecDto page,
            GctRecordDto record,
            String actionCode,
            String fromStatus,
            String toStatus,
            String actor,
            String remark) {
        GctStatusHistoryDto entry = GctStatusHistoryDto.builder()
                .id("gct-status-" + eventSequence.getAndIncrement())
                .pageCode(page.getCode())
                .recordId(record.getId())
                .actionCode(actionCode)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .actor(actor)
                .remark(remark)
                .changedAt(Instant.now().toString())
                .build();
        statusHistoryEntries.computeIfAbsent(recordKey(page.getCode(), record.getId()), ignored -> new ArrayList<>()).add(entry);
        return copyStatusHistory(entry);
    }

    private GctAuditEntryDto appendAudit(
            GctPageSpecDto page,
            GctRecordDto record,
            String actionCode,
            String actionLabel,
            String actor,
            String message,
            String beforeStatus,
            String afterStatus,
            Map<String, Object> input) {
        GctAuditEntryDto entry = GctAuditEntryDto.builder()
                .id("gct-audit-" + eventSequence.getAndIncrement())
                .pageCode(page.getCode())
                .recordId(record.getId())
                .actionCode(actionCode)
                .actionLabel(actionLabel)
                .actor(actor)
                .message(message)
                .beforeStatus(beforeStatus)
                .afterStatus(afterStatus)
                .input(copyMap(input))
                .createdAt(Instant.now().toString())
                .build();
        auditEntries.computeIfAbsent(recordKey(page.getCode(), record.getId()), ignored -> new ArrayList<>()).add(entry);
        return copyAudit(entry);
    }

    private boolean shouldAudit(GctPageSpecDto page, String actionCode, GctActionRequest request) {
        if (request.getAuditRequired() != null) {
            return request.getAuditRequired();
        }
        Optional<GctActionMetaDto> action = findAction(page, actionCode);
        return action.map(GctActionMetaDto::getAuditRequired).orElse(Boolean.TRUE);
    }

    private String actionLabel(GctPageSpecDto page, String actionCode) {
        return findAction(page, actionCode)
                .map(GctActionMetaDto::getLabel)
                .filter(label -> !isBlank(label))
                .orElse(actionCode);
    }

    private Optional<GctActionMetaDto> findAction(GctPageSpecDto page, String actionCode) {
        if (page.getActions() == null) {
            return Optional.empty();
        }
        return page.getActions().stream()
                .filter(action -> Objects.equals(action.getCode(), actionCode))
                .findFirst();
    }

    private void validateActionAllowed(GctPageSpecDto page, String actionCode) {
        if (isBlank(actionCode) || findAction(page, actionCode).isEmpty()) {
            throw new BusinessException(ErrorCode.GENERAL_003,
                    "Unsupported GCT action: " + page.getCode() + "/" + actionCode);
        }
    }

    private boolean isCopyAction(String actionCode) {
        return Set.of("copy", "version_create", "version_copy").contains(actionCode);
    }

    private String targetStatus(GctPageSpecDto page, String actionCode) {
        return switch (actionCode) {
            case "delete", "delete_file", "remove_and_transfer" -> DELETED_STATUS;
            case "disable", "unpublish" -> statusOrFallback(page, "禁用", "已作废");
            case "enable", "publish" -> statusOrFallback(page, "启用", "已完成");
            case "process", "fill", "inspect", "forward", "transfer", "split" -> statusOrFallback(page, "处理中", "启用");
            case "finish", "approve", "release", "summarize", "create_dataset", "create_report", "reset_password" ->
                    statusOrFallback(page, "已完成", "启用");
            case "reject" -> statusOrFallback(page, "已驳回", "禁用");
            case "withdraw" -> statusOrFallback(page, "已撤回", "草稿");
            case "save", "create", "add", "add_field", "create_category" -> statusOrFallback(page, "草稿", "待处理");
            default -> null;
        };
    }

    private String statusOrFallback(GctPageSpecDto page, String preferred, String fallback) {
        Set<String> statuses = new LinkedHashSet<>();
        if (page.getBusinessStatuses() != null) {
            statuses.addAll(page.getBusinessStatuses());
        }
        if (page.getBaseStatuses() != null) {
            statuses.addAll(page.getBaseStatuses());
        }
        if (statuses.contains(preferred)) {
            return preferred;
        }
        if (statuses.contains(fallback)) {
            return fallback;
        }
        return preferred;
    }

    private Map<String, Object> auditInput(GctActionRequest request) {
        Map<String, Object> input = copyMap(request.getInput());
        if (request.getValues() != null && !request.getValues().isEmpty()) {
            input.put("values", copyMap(request.getValues()));
        }
        if (!isBlank(request.getRemark())) {
            input.put("remark", request.getRemark());
        }
        return input;
    }

    private GctRecordDto copyRecord(GctRecordDto record) {
        return record.toBuilder()
                .values(copyMap(record.getValues()))
                .build();
    }

    private GctAuditEntryDto copyAudit(GctAuditEntryDto entry) {
        return GctAuditEntryDto.builder()
                .id(entry.getId())
                .pageCode(entry.getPageCode())
                .recordId(entry.getRecordId())
                .actionCode(entry.getActionCode())
                .actionLabel(entry.getActionLabel())
                .actor(entry.getActor())
                .message(entry.getMessage())
                .beforeStatus(entry.getBeforeStatus())
                .afterStatus(entry.getAfterStatus())
                .input(copyMap(entry.getInput()))
                .createdAt(entry.getCreatedAt())
                .build();
    }

    private GctStatusHistoryDto copyStatusHistory(GctStatusHistoryDto entry) {
        return GctStatusHistoryDto.builder()
                .id(entry.getId())
                .pageCode(entry.getPageCode())
                .recordId(entry.getRecordId())
                .actionCode(entry.getActionCode())
                .fromStatus(entry.getFromStatus())
                .toStatus(entry.getToStatus())
                .actor(entry.getActor())
                .remark(entry.getRemark())
                .changedAt(entry.getChangedAt())
                .build();
    }

    private Map<String, Object> copyMap(Map<String, Object> source) {
        Map<String, Object> target = new LinkedHashMap<>();
        if (source == null) {
            return target;
        }
        source.forEach((key, value) -> target.put(key, deepCopyValue(value)));
        return target;
    }

    private Object deepCopyValue(Object value) {
        if (value instanceof Map<?, ?> map) {
            Map<String, Object> target = new LinkedHashMap<>();
            map.forEach((key, nestedValue) -> target.put(Objects.toString(key, ""), deepCopyValue(nestedValue)));
            return target;
        }
        if (value instanceof List<?> list) {
            List<Object> target = new ArrayList<>();
            list.forEach(item -> target.add(deepCopyValue(item)));
            return target;
        }
        return value;
    }

    private String recordKey(String pageCode, String recordId) {
        return pageCode + "::" + recordId;
    }

    private int normalizePage(Integer page) {
        return page == null || page < 1 ? 1 : page;
    }

    private int normalizeSize(Integer size) {
        return size == null || size < 1 ? 20 : size;
    }

    private String resolveActor(String requestedActor) {
        return actorResolver.resolve(requestedActor);
    }

    private boolean contains(String value, String lowerNeedle) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(lowerNeedle);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
