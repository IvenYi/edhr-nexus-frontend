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
import com.zencas.edhr.masterdata.entity.Equipment;
import com.zencas.edhr.masterdata.entity.EquipmentCategory;
import com.zencas.edhr.masterdata.entity.EquipmentType;
import com.zencas.edhr.masterdata.repository.EquipmentRepository;
import com.zencas.edhr.masterdata.repository.EquipmentCategoryRepository;
import com.zencas.edhr.masterdata.repository.EquipmentTypeRepository;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/master-data/equipment")
@PreAuthorize("hasAuthority('master-data.equipment')")
@RequiredArgsConstructor
public class EquipmentController {
    private static final String TENANT = "default";
    private final EquipmentRepository equipmentRepository;
    private final EquipmentTypeRepository typeRepository;
    private final EquipmentCategoryRepository categoryRepository;
    private final AuditEventRepository auditRepository;
    private final SnowflakeIdGenerator idGenerator;
    private final ObjectMapper objectMapper;

    @GetMapping("/categories")
    public ApiResponse<List<CategoryResponse>> categories() {
        return ApiResponse.success(categoryRepository.findByTenantIdOrderBySortOrderAscCreatedAtAscIdAsc(TENANT)
                .stream().map(this::categoryResponse).toList());
    }

    @PostMapping("/categories")
    @Transactional
    public ApiResponse<CategoryResponse> createCategory(@RequestBody CategoryRequest request) {
        String name = text(request.name(), "设备分类名称", 128, true);
        checkCategoryName(name, 0L);
        var category = categoryRepository.save(EquipmentCategory.builder().id(idGenerator.nextId())
                .tenantId(TENANT).name(name).system(false).sortOrder(100)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build());
        audit("EQUIPMENT_CATEGORY", category.getId(), "CREATE", Map.of(), categorySnapshot(category));
        return ApiResponse.success(categoryResponse(category));
    }

    @PutMapping("/categories/{id}")
    @Transactional
    public ApiResponse<CategoryResponse> updateCategory(@PathVariable Long id, @RequestBody CategoryRequest request) {
        var category = requireCategory(id);
        if (category.isSystem()) throw invalid("内置设备分类不能修改");
        String name = text(request.name(), "设备分类名称", 128, true);
        checkCategoryName(name, id);
        var before = categorySnapshot(category);
        category.setName(name);
        category.setUpdatedAt(LocalDateTime.now());
        categoryRepository.save(category);
        audit("EQUIPMENT_CATEGORY", id, "UPDATE", before, categorySnapshot(category));
        return ApiResponse.success(categoryResponse(category));
    }

    @DeleteMapping("/categories/{id}")
    @com.zencas.edhr.masterdata.deletion.ProtectDeletion(table = "equipment_category", idArgument = 0)
    @Transactional
    public ApiResponse<Void> deleteCategory(@PathVariable Long id) {
        var category = requireCategory(id);
        if (category.isSystem()) throw invalid("内置设备分类不能删除");
        if (typeRepository.existsByCategoryId(id)) throw invalid("该分类下存在设备类型，不能删除");
        categoryRepository.delete(category);
        audit("EQUIPMENT_CATEGORY", id, "DELETE", categorySnapshot(category), Map.of());
        return ApiResponse.success(null);
    }

    @GetMapping("/types")
    public ApiResponse<PageResult<TypeResponse>> types(@RequestParam(required = false) String keyword,
            @RequestParam(required = false) String categoryId,
            @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int size) {
        Long category = categoryId == null || categoryId.isBlank() || "uncategorized".equals(categoryId)
                ? null : parseId(categoryId, "设备分类");
        Specification<EquipmentType> specification = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("tenantId"), TENANT));
            if (category != null) predicates.add(cb.equal(root.get("categoryId"), category));
            if ("uncategorized".equals(categoryId)) predicates.add(cb.isNull(root.get("categoryId")));
            if (keyword != null && !keyword.isBlank()) {
                String pattern = searchPattern(keyword);
                predicates.add(cb.or(cb.like(cb.lower(root.get("code")), pattern, '\\'), cb.like(cb.lower(root.get("name")), pattern, '\\')));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        var pageable = pageable(page, size, "createdAt", "desc", Set.of("createdAt"));
        var result = typeRepository.findAll(specification, pageable);
        return ApiResponse.success(PageResult.of(result.getContent().stream().map(this::typeResponse).toList(),
                pageable.getPageNumber() + 1, pageable.getPageSize(), result.getTotalElements()));
    }

    @GetMapping("/types/{id}")
    public ApiResponse<TypeResponse> type(@PathVariable Long id) {
        return ApiResponse.success(typeResponse(typeRepository.findByIdAndTenantId(id, TENANT).orElseThrow(() -> invalid("设备类型不存在"))));
    }

    @PostMapping("/types")
    @Transactional
    public ApiResponse<TypeResponse> createType(@RequestBody TypeRequest request) {
        var type = EquipmentType.builder().id(idGenerator.nextId()).tenantId(TENANT).createdBy(currentOperatorName()).createdAt(LocalDateTime.now()).build();
        fillType(type, request);
        typeRepository.save(type);
        audit("EQUIPMENT_TYPE", type.getId(), "CREATE", Map.of(), typeSnapshot(type));
        return ApiResponse.success(typeResponse(type));
    }

    @PutMapping("/types/{id}")
    @Transactional
    public ApiResponse<TypeResponse> updateType(@PathVariable Long id, @RequestBody TypeRequest request) {
        var type = requireType(id);
        var before = typeSnapshot(type);
        fillType(type, request);
        typeRepository.save(type);
        audit("EQUIPMENT_TYPE", id, "UPDATE", before, typeSnapshot(type));
        return ApiResponse.success(typeResponse(type));
    }

    @DeleteMapping("/types/{id}")
    @com.zencas.edhr.masterdata.deletion.ProtectDeletion(table = "equipment_type", idArgument = 0)
    @Transactional
    public ApiResponse<Void> deleteType(@PathVariable Long id) {
        var type = requireType(id);
        if (equipmentRepository.existsByEquipmentTypeId(id)) throw invalid("该类型下存在设备，不能删除");
        typeRepository.delete(type);
        audit("EQUIPMENT_TYPE", id, "DELETE", typeSnapshot(type), Map.of());
        return ApiResponse.success(null);
    }

    @GetMapping
    public ApiResponse<PageResult<EquipmentResponse>> list(@RequestParam(required = false) String keyword,
            @RequestParam(required = false) String equipmentTypeId,
            @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort, @RequestParam(defaultValue = "desc") String order) {
        Long typeId = equipmentTypeId == null || equipmentTypeId.isBlank() ? null : parseId(equipmentTypeId, "设备类型");
        Specification<Equipment> specification = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (typeId != null) predicates.add(cb.equal(root.get("equipmentTypeId"), typeId));
            if (keyword != null && !keyword.isBlank()) {
                String pattern = searchPattern(keyword);
                predicates.add(cb.or(cb.like(cb.lower(root.get("code")), pattern, '\\'),
                        cb.like(cb.lower(root.get("name")), pattern, '\\'), cb.like(cb.lower(root.get("serialNumber")), pattern, '\\')));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        var pageable = pageable(page, size, sort, order, Set.of("createdAt", "updatedAt", "code", "name", "id"));
        var result = equipmentRepository.findAll(specification, pageable);
        return ApiResponse.success(PageResult.of(result.getContent().stream().map(this::equipmentResponse).toList(),
                pageable.getPageNumber() + 1, pageable.getPageSize(), result.getTotalElements()));
    }

    @GetMapping("/{id}")
    public ApiResponse<EquipmentResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(equipmentResponse(equipmentRepository.findById(id).orElseThrow(() -> invalid("设备不存在"))));
    }

    @PostMapping
    @Transactional
    public ApiResponse<EquipmentResponse> create(@RequestBody EquipmentRequest request) {
        var equipment = Equipment.builder().id(idGenerator.nextId()).createdBy(currentOperatorName()).createdAt(LocalDateTime.now()).build();
        fillEquipment(equipment, request);
        equipmentRepository.save(equipment);
        audit("EQUIPMENT", equipment.getId(), "CREATE", Map.of(), equipmentSnapshot(equipment));
        return ApiResponse.success(equipmentResponse(equipment));
    }

    @PutMapping("/{id}")
    @Transactional
    public ApiResponse<EquipmentResponse> update(@PathVariable Long id, @RequestBody EquipmentRequest request) {
        var equipment = equipmentRepository.lockById(id).orElseThrow(() -> invalid("设备不存在"));
        var before = equipmentSnapshot(equipment);
        fillEquipment(equipment, request);
        equipmentRepository.save(equipment);
        audit("EQUIPMENT", id, "UPDATE", before, equipmentSnapshot(equipment));
        return ApiResponse.success(equipmentResponse(equipment));
    }

    @DeleteMapping("/{id}")
    @com.zencas.edhr.masterdata.deletion.ProtectDeletion(table = "equipment", idArgument = 0)
    @Transactional
    public ApiResponse<Void> delete(@PathVariable Long id) {
        var equipment = equipmentRepository.lockById(id).orElseThrow(() -> invalid("设备不存在"));
        equipmentRepository.delete(equipment);
        audit("EQUIPMENT", id, "DELETE", equipmentSnapshot(equipment), Map.of());
        return ApiResponse.success(null);
    }

    private void fillType(EquipmentType type, TypeRequest request) {
        String code = text(request.code(), "设备类型编码", 64, true);
        String name = text(request.name(), "设备类型名称", 128, true);
        var category = requireCategory(parseId(request.categoryId(), "设备分类"));
        if (typeRepository.existsByTenantIdAndCodeAndIdNot(TENANT, code, type.getId())) throw invalid("设备类型编码已存在");
        type.setCode(code);
        type.setName(name);
        type.setCategoryId(category.getId());
        type.setUpdatedBy(currentOperatorName());
        type.setUpdatedAt(LocalDateTime.now());
    }

    private void fillEquipment(Equipment equipment, EquipmentRequest request) {
        String code = text(request.code(), "设备编码", 64, true);
        String name = text(request.name(), "设备名称", 128, true);
        String brand = text(request.brand(), "设备品牌", 128, false);
        String model = text(request.model(), "型号", 128, false);
        String serialNumber = text(request.serialNumber(), "序列号", 128, false);
        LocalDate purchaseDate = purchaseDate(request.purchaseDate());
        String status = request.status() == null ? equipment.getStatus() : request.status().trim();
        if (status == null || !Set.of("ACTIVE", "INACTIVE").contains(status)) throw invalid("设备状态只能是启用或停用");
        var type = requireType(parseId(request.equipmentTypeId(), "设备类型"));
        if (equipmentRepository.existsByCodeAndIdNot(code, equipment.getId())) throw invalid("设备编码已存在");
        equipment.setCode(code);
        equipment.setName(name);
        equipment.setBrand(brand);
        equipment.setModel(model);
        equipment.setSerialNumber(serialNumber);
        equipment.setPurchaseDate(purchaseDate);
        equipment.setEquipmentTypeId(type.getId());
        equipment.setStatus(status);
        equipment.setUpdatedBy(currentOperatorName());
        equipment.setUpdatedAt(LocalDateTime.now());
    }

    private EquipmentCategory requireCategory(Long id) {
        return categoryRepository.lockById(id).orElseThrow(() -> invalid("设备分类不存在"));
    }
    private EquipmentType requireType(Long id) {
        return typeRepository.lockById(id).orElseThrow(() -> invalid("设备类型不存在"));
    }
    private void checkCategoryName(String name, Long id) {
        if (categoryRepository.existsByTenantIdAndNameAndIdNot(TENANT, name, id)) throw invalid("设备分类名称已存在");
    }
    private CategoryResponse categoryResponse(EquipmentCategory category) {
        return new CategoryResponse(category.getId().toString(), category.getName(), category.isSystem(),
                typeRepository.countByCategoryIdAndTenantId(category.getId(), TENANT));
    }
    private TypeResponse typeResponse(EquipmentType type) {
        return new TypeResponse(type.getId().toString(), type.getCode(), type.getName(), stringId(type.getCategoryId()),
                categoryName(type.getCategoryId()), type.getCreatedBy(), type.getCreatedAt(), type.getUpdatedBy(), type.getUpdatedAt());
    }
    private EquipmentResponse equipmentResponse(Equipment equipment) {
        var type = equipment.getEquipmentTypeId() == null ? null : typeRepository.findByIdAndTenantId(equipment.getEquipmentTypeId(), TENANT).orElse(null);
        return new EquipmentResponse(equipment.getId().toString(), equipment.getCode(), equipment.getName(), equipment.getBrand(), equipment.getModel(),
                equipment.getSerialNumber(), equipment.getPurchaseDate(), stringId(equipment.getEquipmentTypeId()), type == null ? null : type.getName(),
                type == null ? null : categoryName(type.getCategoryId()), equipment.getStatus(), stringId(equipment.getSiteId()),
                equipment.getCreatedBy(), equipment.getCreatedAt(), equipment.getUpdatedBy(), equipment.getUpdatedAt());
    }
    private String categoryName(Long id) {
        return id == null ? null : categoryRepository.findById(id).map(EquipmentCategory::getName).orElse(null);
    }
    private Map<String, Object> categorySnapshot(EquipmentCategory category) {
        return Map.of("name", category.getName(), "system", category.isSystem());
    }
    private Map<String, Object> typeSnapshot(EquipmentType type) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("code", type.getCode());
        snapshot.put("name", type.getName());
        snapshot.put("categoryId", stringId(type.getCategoryId()));
        return snapshot;
    }
    private Map<String, Object> equipmentSnapshot(Equipment equipment) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("code", equipment.getCode());
        snapshot.put("name", equipment.getName());
        snapshot.put("equipmentTypeId", stringId(equipment.getEquipmentTypeId()));
        snapshot.put("brand", equipment.getBrand());
        snapshot.put("model", equipment.getModel());
        snapshot.put("serialNumber", equipment.getSerialNumber());
        snapshot.put("purchaseDate", equipment.getPurchaseDate());
        snapshot.put("siteId", stringId(equipment.getSiteId()));
        snapshot.put("status", equipment.getStatus());
        return snapshot;
    }
    private void audit(String entityType, Long id, String action, Map<String, Object> before, Map<String, Object> after) {
        if ("UPDATE".equals(action) && before.equals(after)) return;
        try {
            auditRepository.save(AuditEvent.builder().id(idGenerator.nextId()).tenantId(TENANT)
                    .entityType(entityType).entityId(id.toString()).action(action)
                    .contentBefore(objectMapper.writeValueAsString(before)).contentAfter(objectMapper.writeValueAsString(after))
                    .operatorId(AuditContext.getOperatorId()).operatorName(AuditContext.getOperatorName())
                    .operatorAccount(AuditContext.getOperatorAccount()).source(AuditContext.getSource())
                    .moduleName("数据").menuName("设备建模 · " + ("EQUIPMENT".equals(entityType) ? "设备列表" : "设备类型"))
                    .functionName(switch (action) { case "CREATE" -> "新增"; case "UPDATE" -> "编辑"; default -> "删除"; })
                    .dataSummary(("EQUIPMENT".equals(entityType) ? "设备" : "EQUIPMENT_TYPE".equals(entityType) ? "设备类型" : "设备分类") + " #" + id)
                    .ipAddress(AuditContext.getIpAddress()).createdAt(LocalDateTime.now()).build());
        } catch (JsonProcessingException exception) {
            throw new BusinessException(ErrorCode.GENERAL_002, "审计内容序列化失败");
        }
    }
    private String text(String value, String label, int limit, boolean required) {
        String normalized = value == null ? "" : value.trim();
        if (required && normalized.isEmpty()) throw invalid(label + "不能为空");
        if (normalized.length() > limit) throw invalid(label + "不能超过" + limit + "个字符");
        return normalized.isEmpty() ? null : normalized;
    }
    private Long parseId(String value, String label) {
        try { return Long.valueOf(value); }
        catch (NumberFormatException exception) { throw invalid("请选择有效的" + label); }
    }
    private LocalDate purchaseDate(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            LocalDate date = LocalDate.parse(value.trim());
            if (date.isAfter(LocalDate.now())) throw invalid("采购时间不能晚于今天");
            return date;
        }
        catch (DateTimeParseException exception) { throw invalid("采购时间必须是有效日期（YYYY-MM-DD）"); }
    }
    private String stringId(Long id) { return id == null ? null : id.toString(); }
    private String currentOperatorName() {
        String name = AuditContext.getOperatorName();
        if (name != null && !name.isBlank()) return name;
        String account = AuditContext.getOperatorAccount();
        return account == null || account.isBlank() ? null : account;
    }
    private BusinessException invalid(String message) { return new BusinessException(ErrorCode.GENERAL_001, message); }
    private String searchPattern(String keyword) {
        return "%" + keyword.trim().toLowerCase(Locale.ROOT).replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
    }
    private PageRequest pageable(int page, int size, String sort, String order, Set<String> allowedSorts) {
        if (!allowedSorts.contains(sort) || !("asc".equalsIgnoreCase(order) || "desc".equalsIgnoreCase(order))) throw invalid("排序参数无效");
        return PageRequest.of(Math.max(page, 1) - 1, Math.min(Math.max(size, 1), 200),
                Sort.by("asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC, sort).and(Sort.by("id")));
    }

    public record CategoryRequest(String name) {}
    public record CategoryResponse(String id, String name, boolean system, long count) {}
    public record TypeRequest(String code, String name, String categoryId) {}
    public record TypeResponse(String id, String code, String name, String categoryId, String categoryName,
                               String createdBy, LocalDateTime createdAt, String updatedBy, LocalDateTime updatedAt) {}
    public record EquipmentRequest(String code, String name, String equipmentTypeId, String model, String serialNumber, String status, String brand, String purchaseDate) {}
    public record EquipmentResponse(String id, String code, String name, String brand, String model, String serialNumber, LocalDate purchaseDate, String equipmentTypeId,
                                    String equipmentTypeName, String categoryName, String status, String siteId,
                                    String createdBy, LocalDateTime createdAt, String updatedBy, LocalDateTime updatedAt) {}
}
