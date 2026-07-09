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
import com.zencas.edhr.masterdata.dto.MaterialGroupRecord;
import com.zencas.edhr.masterdata.dto.ProcessModelingRequest;
import com.zencas.edhr.masterdata.dto.RouteGraphRequest;
import com.zencas.edhr.masterdata.dto.RouteGraphResponse;
import com.zencas.edhr.masterdata.entity.Material;
import com.zencas.edhr.masterdata.entity.MaterialType;
import com.zencas.edhr.masterdata.entity.Operation;
import com.zencas.edhr.masterdata.entity.OperationCategory;
import com.zencas.edhr.masterdata.entity.Product;
import com.zencas.edhr.masterdata.entity.ProductFamily;
import com.zencas.edhr.masterdata.entity.Route;
import com.zencas.edhr.masterdata.entity.RouteNode;
import com.zencas.edhr.masterdata.entity.RouteRelation;
import com.zencas.edhr.masterdata.entity.RouteVersion;
import com.zencas.edhr.masterdata.entity.SopDocument;
import com.zencas.edhr.masterdata.repository.MaterialRepository;
import com.zencas.edhr.masterdata.repository.MaterialTypeRepository;
import com.zencas.edhr.masterdata.repository.OperationCategoryRepository;
import com.zencas.edhr.masterdata.repository.OperationRepository;
import com.zencas.edhr.masterdata.repository.ProductFamilyRepository;
import com.zencas.edhr.masterdata.repository.ProductRepository;
import com.zencas.edhr.masterdata.repository.RouteNodeRepository;
import com.zencas.edhr.masterdata.repository.RouteRelationRepository;
import com.zencas.edhr.masterdata.repository.RouteRepository;
import com.zencas.edhr.masterdata.repository.RouteVersionRepository;
import com.zencas.edhr.masterdata.repository.SopDocumentRepository;
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
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/v1/master-data/process-modeling")
@RequiredArgsConstructor
public class ProcessModelingController {

    private static final String TENANT_ID = "default";
    private static final ObjectMapper AUDIT_OBJECT_MAPPER = new ObjectMapper();
    private static final Set<String> PRODUCT_MATERIAL_TYPE_NAMES = Set.of("半成品", "产成品");
    private static final Set<String> OPERATION_TYPES = Set.of("普通工序", "关键工序", "特殊过程", "检验工序", "外协工序");
    private static final Set<String> ROUTE_RELATION_TYPES = Set.of("SEQUENTIAL", "PARALLEL", "OPTIONAL", "REWORK", "JUMP", "ALTERNATIVE");
    private static final String DEFAULT_OPERATION_TYPE = "普通工序";
    private static final String OPERATION_CATEGORY_ALL = "ALL";
    private static final String OPERATION_CATEGORY_UNCATEGORIZED = "UNCATEGORIZED";
    private static final String DEFAULT_MATERIAL_VERSION = "V1.0";
    private static final String DEFAULT_MATERIAL_PURPOSE = "生产物料";
    private static final Pattern VERSION_NUMBER_PATTERN = Pattern.compile("\\d+");

    private final MaterialTypeRepository materialTypeRepository;
    private final MaterialRepository materialRepository;
    private final ProductRepository productRepository;
    private final ProductFamilyRepository productFamilyRepository;
    private final OperationCategoryRepository operationCategoryRepository;
    private final OperationRepository operationRepository;
    private final RouteRepository routeRepository;
    private final RouteVersionRepository routeVersionRepository;
    private final RouteNodeRepository routeNodeRepository;
    private final RouteRelationRepository routeRelationRepository;
    private final SopDocumentRepository sopDocumentRepository;
    private final AuditEventRepository auditEventRepository;
    private final SnowflakeIdGenerator idGenerator;

    @GetMapping("/materials")
    public ApiResponse<PageResult<MaterialGroupRecord>> listMaterials(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String materialName,
            @RequestParam(required = false) String materialCode,
            @RequestParam(required = false) String materialTypeName,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        List<Material> materials = materialRepository.findAll().stream()
                .filter(material -> matchesMaterialKeyword(material, keyword, materialName, materialCode, materialTypeName))
                .sorted(materialComparator(safeSort(sort), order))
                .toList();
        enrichMaterialTypeNames(materials);
        List<MaterialGroupRecord> groups = toMaterialGroups(materials).stream()
                .filter(group -> matchesStatus(group.getStatus(), status))
                .toList();
        return ApiResponse.success(toPagedResult(groups, page, size));
    }

    @PostMapping("/materials")
    @Transactional
    public ApiResponse<Material> createMaterial(@RequestBody ProcessModelingRequest request) {
        validateMaterialDateRange(request);
        String code = resolveCode(request, "MAT");
        String name = requireName(request);
        String version = resolveMaterialVersion(request);
        validateMaterialCodeForCreate(code, name, version);
        LocalDateTime now = LocalDateTime.now();
        Material entity = Material.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .code(code)
                .name(name)
                .specification(trimToNull(request.getSpecification()))
                .version(version)
                .materialPurpose(resolveMaterialPurpose(request))
                .effectiveDate(request == null ? null : request.getEffectiveDate())
                .expiryDate(request == null ? null : request.getExpiryDate())
                .materialTypeId(resolveMaterialTypeId(request))
                .unit(trimToNull(request.getUnit()))
                .description(trimToNull(request.getDescription()))
                .status(resolveMaterialRuntimeStatus(request == null ? null : request.getEffectiveDate(), request == null ? null : request.getExpiryDate()))
                .createdBy(currentOperatorName())
                .createdAt(now)
                .updatedBy(currentOperatorName())
                .updatedAt(now)
                .build();
        Material saved = materialRepository.save(entity);
        enrichMaterialTypeName(saved, materialTypeNameMap());
        writeAudit("MATERIAL", saved.getId(), "CREATE", "物料管理", "新增物料", Map.of(), materialSnapshot(saved));
        return ApiResponse.success(saved);
    }

    @PutMapping("/materials/{id}")
    @Transactional
    public ApiResponse<Material> updateMaterial(@PathVariable Long id, @RequestBody ProcessModelingRequest request) {
        validateMaterialDateRange(request);
        Material existing = materialRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "物料不存在"));
        boolean versionUpdate = request != null && request.getVersion() != null;
        if (!versionUpdate) {
            return updateMaterialBaseInformation(existing, request);
        }
        Map<String, Object> before = materialSnapshot(existing);
        if (request != null && (StringUtils.hasText(request.getCode()) || versionUpdate)) {
            validateMaterialCodeForUpdate(existing,
                    StringUtils.hasText(request.getCode()) ? request.getCode().trim() : existing.getCode(),
                    versionUpdate ? resolveMaterialVersion(request) : existing.getVersion());
        }
        if (request != null && StringUtils.hasText(request.getName())) existing.setName(request.getName().trim());
        if (request != null && StringUtils.hasText(request.getCode())) existing.setCode(request.getCode().trim());
        if (request != null && request.getSpecification() != null) existing.setSpecification(trimToNull(request.getSpecification()));
        if (versionUpdate) existing.setVersion(resolveMaterialVersion(request));
        if (request != null && request.getMaterialPurpose() != null) existing.setMaterialPurpose(resolveMaterialPurpose(request));
        if (versionUpdate) existing.setEffectiveDate(request.getEffectiveDate());
        if (versionUpdate) existing.setExpiryDate(request.getExpiryDate());
        if (request != null && (request.getMaterialTypeId() != null || StringUtils.hasText(request.getMaterialTypeName()))) existing.setMaterialTypeId(resolveMaterialTypeId(request));
        if (request != null && request.getUnit() != null) existing.setUnit(trimToNull(request.getUnit()));
        if (versionUpdate || (request != null && request.getDescription() != null)) existing.setDescription(trimToNull(request == null ? null : request.getDescription()));
        existing.setStatus(resolveMaterialRuntimeStatus(existing.getEffectiveDate(), existing.getExpiryDate()));
        existing.setUpdatedBy(currentOperatorName());
        existing.setUpdatedAt(LocalDateTime.now());
        Material saved = materialRepository.save(existing);
        enrichMaterialTypeName(saved, materialTypeNameMap());
        writeChangedAudit("MATERIAL", saved.getId(), "物料管理", "编辑物料", before, materialSnapshot(saved));
        return ApiResponse.success(saved);
    }

    private ApiResponse<Material> updateMaterialBaseInformation(Material existing, ProcessModelingRequest request) {
        if (request != null && StringUtils.hasText(request.getCode())) {
            validateMaterialBaseCodeForUpdate(existing, request.getCode().trim());
        }
        List<Material> versions = findMaterialGroupVersions(existing);
        Map<Long, Map<String, Object>> beforeSnapshots = versions.stream()
                .filter(material -> material.getId() != null)
                .collect(Collectors.toMap(
                        Material::getId,
                        this::materialSnapshot,
                        (left, right) -> left,
                        LinkedHashMap::new));
        versions.forEach(material -> applyMaterialBaseFields(material, request));
        List<Material> savedVersions = versions.stream()
                .map(materialRepository::save)
                .toList();
        Map<Long, String> typeNames = materialTypeNameMap();
        savedVersions.forEach(material -> {
            enrichMaterialTypeName(material, typeNames);
            Map<String, Object> before = beforeSnapshots.get(material.getId());
            if (before != null) {
                writeChangedAudit("MATERIAL", material.getId(), "物料管理", "编辑物料", before, materialSnapshot(material));
            }
        });
        Material savedCurrent = savedVersions.stream()
                .filter(material -> Objects.equals(material.getId(), existing.getId()))
                .findFirst()
                .orElse(existing);
        return ApiResponse.success(savedCurrent);
    }

    @DeleteMapping("/materials/{id}")
    @Transactional
    public ApiResponse<Void> deleteMaterial(@PathVariable Long id) {
        Material existing = materialRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "物料不存在"));
        materialRepository.deleteById(id);
        writeAudit("MATERIAL", id, "DELETE", "物料管理", "删除物料", materialSnapshot(existing), Map.of());
        return ApiResponse.success(null);
    }

    @GetMapping("/products")
    public ApiResponse<PageResult<Material>> listProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        Set<Long> productMaterialTypeIds = resolveProductMaterialTypeIds();
        List<Material> derivedProducts = materialRepository.findAll().stream()
                .filter(material -> productMaterialTypeIds.contains(material.getMaterialTypeId()))
                .filter(material -> matchesKeyword(material, keyword))
                .filter(material -> matchesStatus(material.getStatus(), status))
                .sorted(materialComparator(safeSort(sort), order))
                .toList();
        enrichMaterialTypeNames(derivedProducts);
        return ApiResponse.success(toPagedResult(derivedProducts, page, size));
    }

    @PostMapping("/products")
    @Transactional
    public ApiResponse<Product> createProduct(@RequestBody ProcessModelingRequest request) {
        throw derivedProductMutationException();
    }

    @PutMapping("/products/{id}")
    @Transactional
    public ApiResponse<Product> updateProduct(@PathVariable Long id, @RequestBody ProcessModelingRequest request) {
        throw derivedProductMutationException();
    }

    @DeleteMapping("/products/{id}")
    @Transactional
    public ApiResponse<Void> deleteProduct(@PathVariable Long id) {
        throw derivedProductMutationException();
    }

    @GetMapping("/product-families")
    public ApiResponse<PageResult<ProductFamily>> listProductFamilies(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        return ApiResponse.success(toResult(productFamilyRepository.findAll(
                keywordStatusSpec(keyword, status), pageable(page, size, sort, order)), page, size));
    }

    @PostMapping("/product-families")
    @Transactional
    public ApiResponse<ProductFamily> createProductFamily(@RequestBody ProcessModelingRequest request) {
        LocalDateTime now = LocalDateTime.now();
        ProductFamily entity = ProductFamily.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .code(generateCode("PF"))
                .name(requireName(request))
                .description(trimToNull(request.getDescription()))
                .status(resolveStatus(request, "ACTIVE"))
                .remark(trimToNull(request.getRemark()))
                .createdBy(currentOperatorName())
                .createdAt(now)
                .updatedBy(currentOperatorName())
                .updatedAt(now)
                .build();
        ProductFamily saved = productFamilyRepository.save(entity);
        writeAudit("PRODUCT_FAMILY", saved.getId(), "CREATE", "产品簇", "新增产品簇", Map.of(), productFamilySnapshot(saved));
        return ApiResponse.success(saved);
    }

    @PutMapping("/product-families/{id}")
    @Transactional
    public ApiResponse<ProductFamily> updateProductFamily(@PathVariable Long id, @RequestBody ProcessModelingRequest request) {
        ProductFamily existing = productFamilyRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MD_001));
        Map<String, Object> before = productFamilySnapshot(existing);
        existing.setName(requireName(request));
        existing.setDescription(trimToNull(request.getDescription()));
        existing.setStatus(resolveStatus(request, existing.getStatus()));
        existing.setRemark(trimToNull(request.getRemark()));
        existing.setUpdatedBy(currentOperatorName());
        existing.setUpdatedAt(LocalDateTime.now());
        ProductFamily saved = productFamilyRepository.save(existing);
        writeChangedAudit("PRODUCT_FAMILY", saved.getId(), "产品簇", "编辑产品簇", before, productFamilySnapshot(saved));
        return ApiResponse.success(saved);
    }

    @DeleteMapping("/product-families/{id}")
    @Transactional
    public ApiResponse<Void> deleteProductFamily(@PathVariable Long id) {
        ProductFamily existing = productFamilyRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MD_001));
        productFamilyRepository.deleteById(id);
        writeAudit("PRODUCT_FAMILY", id, "DELETE", "产品簇", "删除产品簇", productFamilySnapshot(existing), Map.of());
        return ApiResponse.success(null);
    }

    @GetMapping("/operations")
    public ApiResponse<PageResult<Operation>> listOperations(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String operationName,
            @RequestParam(required = false) String operationCode,
            @RequestParam(required = false) String operationCategory,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        return ApiResponse.success(toResult(operationRepository.findAll(
                operationSpec(keyword, operationName, operationCode, operationCategory, status), pageable(page, size, sort, order)), page, size));
    }

    @GetMapping("/operations/categories")
    public ApiResponse<List<OperationCategoryResponse>> listOperationCategories() {
        return ApiResponse.success(toOperationCategoryResponses());
    }

    @PostMapping("/operations/categories")
    @Transactional
    public ApiResponse<OperationCategoryResponse> createOperationCategory(@RequestBody OperationCategoryRequest request) {
        String name = requireOperationCategoryName(request);
        if (operationCategoryRepository.existsByTenantIdAndNameIgnoreCase(TENANT_ID, name)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "工序分类已存在");
        }
        OperationCategory saved = operationCategoryRepository.save(OperationCategory.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .name(name)
                .sortOrder(nextOperationCategorySortOrder())
                .createdBy(currentOperatorName())
                .createdAt(LocalDateTime.now())
                .updatedBy(currentOperatorName())
                .updatedAt(LocalDateTime.now())
                .build());
        writeAudit("OPERATION_CATEGORY", saved.getId(), "CREATE", "工序管理", "新增工序分类", Map.of(), operationCategorySnapshot(saved, 0L));
        return ApiResponse.success(toOperationCategoryResponse(saved, 0L));
    }

    @PutMapping("/operations/categories/{id}")
    @Transactional
    public ApiResponse<OperationCategoryResponse> updateOperationCategory(@PathVariable Long id, @RequestBody OperationCategoryRequest request) {
        OperationCategory existing = operationCategoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "工序分类不存在"));
        String name = requireOperationCategoryName(request);
        operationCategoryRepository.findByTenantIdAndNameIgnoreCase(TENANT_ID, name)
                .filter(category -> !Objects.equals(category.getId(), existing.getId()))
                .ifPresent(category -> {
                    throw new BusinessException(ErrorCode.GENERAL_001, "工序分类已存在");
                });
        String oldName = existing.getName();
        Map<String, Object> before = operationCategorySnapshot(existing, countOperationsByCategory(oldName));
        existing.setName(name);
        existing.setUpdatedBy(currentOperatorName());
        existing.setUpdatedAt(LocalDateTime.now());
        OperationCategory saved = operationCategoryRepository.save(existing);
        if (!sameText(oldName, name)) {
            List<Operation> operations = operationRepository.findAll().stream()
                    .filter(operation -> sameText(operation.getOperationCategory(), oldName))
                    .peek(operation -> {
                        operation.setOperationCategory(name);
                        operation.setUpdatedBy(currentOperatorName());
                        operation.setUpdatedAt(LocalDateTime.now());
                    })
                    .toList();
            operationRepository.saveAll(operations);
        }
        writeChangedAudit("OPERATION_CATEGORY", saved.getId(), "工序管理", "编辑工序分类", before, operationCategorySnapshot(saved, countOperationsByCategory(name)));
        return ApiResponse.success(toOperationCategoryResponse(saved, countOperationsByCategory(name)));
    }

    @DeleteMapping("/operations/categories/{id}")
    @Transactional
    public ApiResponse<Void> deleteOperationCategory(@PathVariable Long id) {
        OperationCategory existing = operationCategoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "工序分类不存在"));
        Map<String, Object> before = operationCategorySnapshot(existing, countOperationsByCategory(existing.getName()));
        List<Operation> operations = operationRepository.findAll().stream()
                .filter(operation -> sameText(operation.getOperationCategory(), existing.getName()))
                .peek(operation -> {
                    Map<String, Object> operationBefore = operationSnapshot(operation);
                    operation.setOperationCategory(null);
                    operation.setUpdatedBy(currentOperatorName());
                    operation.setUpdatedAt(LocalDateTime.now());
                    writeChangedAudit("OPERATION", operation.getId(), "工序管理", "删除工序分类后自动转为未分类", operationBefore, operationSnapshot(operation));
                })
                .toList();
        operationRepository.saveAll(operations);
        operationCategoryRepository.delete(existing);
        writeAudit("OPERATION_CATEGORY", existing.getId(), "DELETE", "工序管理", "删除工序分类", before, Map.of());
        return ApiResponse.success(null);
    }

    @PutMapping("/operations/categories/order")
    @Transactional
    public ApiResponse<List<OperationCategoryResponse>> reorderOperationCategories(@RequestBody OperationCategoryOrderRequest request) {
        List<String> orderedIds = request == null || request.ids() == null ? List.of() : request.ids();
        if (orderedIds.isEmpty()) return ApiResponse.success(toOperationCategoryResponses());
        Map<String, OperationCategory> categoryById = operationCategoryRepository.findByTenantIdOrderBySortOrderAscNameAsc(TENANT_ID)
                .stream()
                .collect(Collectors.toMap(category -> String.valueOf(category.getId()), category -> category, (left, right) -> left, LinkedHashMap::new));
        int index = 1;
        for (String id : orderedIds) {
            OperationCategory category = categoryById.get(String.valueOf(id));
            if (category == null) continue;
            category.setSortOrder(index * 10);
            category.setUpdatedBy(currentOperatorName());
            category.setUpdatedAt(LocalDateTime.now());
            index++;
        }
        operationCategoryRepository.saveAll(new java.util.ArrayList<>(categoryById.values()));
        return ApiResponse.success(toOperationCategoryResponses());
    }

    @PostMapping("/operations")
    @Transactional
    public ApiResponse<Operation> createOperation(@RequestBody ProcessModelingRequest request) {
        LocalDateTime now = LocalDateTime.now();
        String code = requireOperationCode(request);
        validateOperationCodeForCreate(code);
        String operationCategory = resolveOperationCategory(request);
        Operation entity = Operation.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .code(code)
                .name(requireName(request))
                .description(trimToNull(request.getDescription()))
                .operationCategory(operationCategory)
                .generalDescription(trimToNull(request.getGeneralDescription()))
                .defaultOperationType(resolveOperationType(request))
                .defaultDurationMinutes(request.getDefaultDurationMinutes())
                .sortOrder(request.getSortOrder() == null ? 0 : request.getSortOrder())
                .status(resolveStatus(request, "ACTIVE"))
                .remark(trimToNull(request.getRemark()))
                .createdBy(currentOperatorName())
                .createdAt(now)
                .updatedBy(currentOperatorName())
                .updatedAt(now)
                .build();
        Operation saved = operationRepository.save(entity);
        writeAudit("OPERATION", saved.getId(), "CREATE", "工序管理", "新增工序", Map.of(), operationSnapshot(saved));
        return ApiResponse.success(saved);
    }

    @PutMapping("/operations/{id}")
    @Transactional
    public ApiResponse<Operation> updateOperation(@PathVariable Long id, @RequestBody ProcessModelingRequest request) {
        Operation existing = operationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MD_007));
        String code = requireOperationCode(request);
        validateOperationCodeForUpdate(existing, code);
        String operationCategory = resolveOperationCategory(request);
        Map<String, Object> before = operationSnapshot(existing);
        existing.setCode(code);
        existing.setName(requireName(request));
        existing.setDescription(trimToNull(request.getDescription()));
        existing.setOperationCategory(operationCategory);
        existing.setGeneralDescription(trimToNull(request.getGeneralDescription()));
        existing.setDefaultOperationType(resolveOperationType(request));
        existing.setDefaultDurationMinutes(request.getDefaultDurationMinutes());
        existing.setSortOrder(request.getSortOrder() == null ? existing.getSortOrder() : request.getSortOrder());
        existing.setStatus(resolveStatus(request, existing.getStatus()));
        existing.setRemark(trimToNull(request.getRemark()));
        existing.setUpdatedBy(currentOperatorName());
        existing.setUpdatedAt(LocalDateTime.now());
        Operation saved = operationRepository.save(existing);
        writeChangedAudit("OPERATION", saved.getId(), "工序管理", "编辑工序", before, operationSnapshot(saved));
        return ApiResponse.success(saved);
    }

    @DeleteMapping("/operations/{id}")
    @Transactional
    public ApiResponse<Void> deleteOperation(@PathVariable Long id) {
        Operation existing = operationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MD_007));
        operationRepository.deleteById(id);
        writeAudit("OPERATION", id, "DELETE", "工序管理", "删除工序", operationSnapshot(existing), Map.of());
        return ApiResponse.success(null);
    }

    @GetMapping("/routes")
    public ApiResponse<PageResult<Route>> listRoutes(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        Page<Route> result = routeRepository.findAll(
                keywordStatusSpec(keyword, status), pageable(page, size, sort, order));
        result.getContent().forEach(this::enrichRouteVersions);
        return ApiResponse.success(toResult(result, page, size));
    }

    @PostMapping("/routes")
    @Transactional
    public ApiResponse<Route> createRoute(@RequestBody ProcessModelingRequest request) {
        LocalDateTime now = LocalDateTime.now();
        Route entity = Route.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .code(generateCode("RT"))
                .name(requireName(request))
                .description(trimToNull(request.getDescription()))
                .productFamilyId(request.getProductFamilyId() == null ? null : String.valueOf(request.getProductFamilyId()))
                .commonAsset(request == null || request.getCommonAsset() == null ? true : request.getCommonAsset())
                .status(resolveStatus(request, "DRAFT"))
                .remark(trimToNull(request.getRemark()))
                .createdBy(currentOperatorName())
                .createdAt(now)
                .updatedBy(currentOperatorName())
                .updatedAt(now)
                .build();
        Route saved = routeRepository.save(entity);
        RouteVersion version = createInitialRouteVersion(saved, request, now);
        saved.setVersions(List.of(version));
        saved.setVersionCount(1);
        saved.setLatestVersionId(version.getId());
        saved.setLatestVersion(version.getVersion());
        saved.setLatestVersionStatus(version.getVersionStatus());
        writeAudit("ROUTE", saved.getId(), "CREATE", "工艺路线", "新增工艺路线", Map.of(), routeSnapshot(saved));
        return ApiResponse.success(saved);
    }

    @PutMapping("/routes/{id}")
    @Transactional
    public ApiResponse<Route> updateRoute(@PathVariable Long id, @RequestBody ProcessModelingRequest request) {
        Route existing = routeRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MD_008));
        Map<String, Object> before = routeSnapshot(existing);
        existing.setName(requireName(request));
        existing.setDescription(trimToNull(request.getDescription()));
        existing.setProductFamilyId(request.getProductFamilyId() == null ? existing.getProductFamilyId() : String.valueOf(request.getProductFamilyId()));
        existing.setCommonAsset(request == null || request.getCommonAsset() == null ? existing.getCommonAsset() : request.getCommonAsset());
        existing.setStatus(resolveStatus(request, existing.getStatus()));
        existing.setRemark(trimToNull(request.getRemark()));
        existing.setUpdatedBy(currentOperatorName());
        existing.setUpdatedAt(LocalDateTime.now());
        Route saved = routeRepository.save(existing);
        writeChangedAudit("ROUTE", saved.getId(), "工艺路线", "编辑工艺路线", before, routeSnapshot(saved));
        return ApiResponse.success(saved);
    }

    @DeleteMapping("/routes/{id}")
    @Transactional
    public ApiResponse<Void> deleteRoute(@PathVariable Long id) {
        Route existing = routeRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MD_008));
        routeRepository.deleteById(id);
        writeAudit("ROUTE", id, "DELETE", "工艺路线", "删除工艺路线", routeSnapshot(existing), Map.of());
        return ApiResponse.success(null);
    }

    @PostMapping("/routes/{routeId}/versions")
    @Transactional
    public ApiResponse<RouteVersion> createRouteVersion(@PathVariable Long routeId, @RequestBody ProcessModelingRequest request) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MD_008));
        RouteVersion version = createInitialRouteVersion(route, request, LocalDateTime.now());
        writeAudit("ROUTE_VERSION", version.getId(), "CREATE", "工艺路线", "新增工艺路线版本", Map.of(), routeVersionSnapshot(version));
        return ApiResponse.success(version);
    }

    @PutMapping("/routes/{routeId}/versions/{versionId}")
    @Transactional
    public ApiResponse<RouteVersion> updateRouteVersion(
            @PathVariable Long routeId,
            @PathVariable Long versionId,
            @RequestBody ProcessModelingRequest request) {
        validateRouteDateRange(request);
        if (request == null || !StringUtils.hasText(request.getVersion())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "版本不能为空");
        }
        RouteVersion existing = requireRouteVersion(routeId, versionId);
        Map<String, Object> before = routeVersionSnapshot(existing);
        existing.setVersion(request.getVersion().trim());
        if (StringUtils.hasText(request.getStatus())) existing.setVersionStatus(request.getStatus().trim());
        existing.setDescription(trimToNull(request == null ? null : request.getVersionDescription()));
        existing.setEffectiveDate(request == null ? null : request.getEffectiveDate());
        existing.setExpiryDate(request == null ? null : request.getExpiryDate());
        existing.setUpdatedBy(currentOperatorName());
        existing.setUpdatedAt(LocalDateTime.now());
        RouteVersion saved = routeVersionRepository.save(existing);
        writeChangedAudit("ROUTE_VERSION", saved.getId(), "工艺路线", "编辑工艺路线版本", before, routeVersionSnapshot(saved));
        return ApiResponse.success(saved);
    }

    @DeleteMapping("/routes/{routeId}/versions/{versionId}")
    @Transactional
    public ApiResponse<Void> deleteRouteVersion(@PathVariable Long routeId, @PathVariable Long versionId) {
        RouteVersion existing = requireRouteVersion(routeId, versionId);
        if (routeVersionRepository.countByRouteId(routeId) <= 1) {
            throw new BusinessException(ErrorCode.GENERAL_001, "工艺路线模板仅剩一个版本，请删除父表工艺路线模板");
        }
        Map<String, Object> before = routeVersionSnapshot(existing);
        routeRelationRepository.deleteByRouteVersionId(versionId);
        routeRelationRepository.flush();
        routeNodeRepository.deleteByRouteVersionId(versionId);
        routeNodeRepository.flush();
        routeVersionRepository.delete(existing);
        writeAudit("ROUTE_VERSION", versionId, "DELETE", "工艺路线", "删除工艺路线版本", before, Map.of());
        return ApiResponse.success(null);
    }

    @GetMapping("/routes/{routeId}/versions/{versionId}/graph")
    public ApiResponse<RouteGraphResponse> getRouteGraph(@PathVariable Long routeId, @PathVariable Long versionId) {
        requireRouteVersion(routeId, versionId);
        return ApiResponse.success(RouteGraphResponse.builder()
                .routeId(routeId)
                .routeVersionId(versionId)
                .nodes(routeNodeRepository.findByRouteVersionIdOrderBySortOrderAsc(versionId))
                .relations(routeRelationRepository.findByRouteVersionIdOrderByPriorityAsc(versionId))
                .build());
    }

    @PutMapping("/routes/{routeId}/versions/{versionId}/graph")
    @Transactional
    public ApiResponse<RouteGraphResponse> saveRouteGraph(
            @PathVariable Long routeId,
            @PathVariable Long versionId,
            @RequestBody RouteGraphRequest request) {
        requireRouteVersion(routeId, versionId);
        routeRelationRepository.deleteByRouteVersionId(versionId);
        routeRelationRepository.flush();
        routeNodeRepository.deleteByRouteVersionId(versionId);
        routeNodeRepository.flush();
        List<RouteNode> nodes = (request == null || request.getNodes() == null ? List.<RouteGraphRequest.NodePayload>of() : request.getNodes())
                .stream()
                .map(node -> toRouteNode(versionId, node))
                .toList();
        List<RouteRelation> relations = (request == null || request.getRelations() == null ? List.<RouteGraphRequest.RelationPayload>of() : request.getRelations())
                .stream()
                .map(relation -> toRouteRelation(versionId, relation))
                .toList();
        List<RouteNode> savedNodes = routeNodeRepository.saveAll(nodes);
        List<RouteRelation> savedRelations = routeRelationRepository.saveAll(relations);
        writeAudit("ROUTE_GRAPH", versionId, "UPDATE", "工艺路线", "配置工艺路线图", Map.of(), Map.of(
                "nodeCount", savedNodes.size(),
                "relationCount", savedRelations.size()));
        return ApiResponse.success(RouteGraphResponse.builder()
                .routeId(routeId)
                .routeVersionId(versionId)
                .nodes(savedNodes)
                .relations(savedRelations)
                .build());
    }

    @GetMapping("/documents")
    public ApiResponse<PageResult<SopDocument>> listDocuments(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        return ApiResponse.success(toResult(sopDocumentRepository.findAll(
                documentSpec(keyword, status), pageable(page, size, sort, order)), page, size));
    }

    @PostMapping("/documents")
    @Transactional
    public ApiResponse<SopDocument> createDocument(@RequestBody ProcessModelingRequest request) {
        LocalDateTime now = LocalDateTime.now();
        SopDocument entity = SopDocument.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .code(generateCode("DOC"))
                .title(requireName(request))
                .version(trimToNull(request.getVersion()))
                .fileReference(trimToNull(request.getFileReference()))
                .description(trimToNull(request.getDescription()))
                .status(resolveStatus(request, "DRAFT"))
                .remark(trimToNull(request.getRemark()))
                .createdBy(currentOperatorName())
                .createdAt(now)
                .updatedBy(currentOperatorName())
                .updatedAt(now)
                .build();
        SopDocument saved = sopDocumentRepository.save(entity);
        writeAudit("PROCESS_DOCUMENT", saved.getId(), "CREATE", "文档管理", "新增文档", Map.of(), documentSnapshot(saved));
        return ApiResponse.success(saved);
    }

    @PutMapping("/documents/{id}")
    @Transactional
    public ApiResponse<SopDocument> updateDocument(@PathVariable Long id, @RequestBody ProcessModelingRequest request) {
        SopDocument existing = sopDocumentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MD_009));
        Map<String, Object> before = documentSnapshot(existing);
        existing.setTitle(requireName(request));
        existing.setVersion(trimToNull(request.getVersion()));
        existing.setFileReference(trimToNull(request.getFileReference()));
        existing.setDescription(trimToNull(request.getDescription()));
        existing.setStatus(resolveStatus(request, existing.getStatus()));
        existing.setRemark(trimToNull(request.getRemark()));
        existing.setUpdatedBy(currentOperatorName());
        existing.setUpdatedAt(LocalDateTime.now());
        SopDocument saved = sopDocumentRepository.save(existing);
        writeChangedAudit("PROCESS_DOCUMENT", saved.getId(), "文档管理", "编辑文档", before, documentSnapshot(saved));
        return ApiResponse.success(saved);
    }

    @DeleteMapping("/documents/{id}")
    @Transactional
    public ApiResponse<Void> deleteDocument(@PathVariable Long id) {
        SopDocument existing = sopDocumentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MD_009));
        sopDocumentRepository.deleteById(id);
        writeAudit("PROCESS_DOCUMENT", id, "DELETE", "文档管理", "删除文档", documentSnapshot(existing), Map.of());
        return ApiResponse.success(null);
    }

    private <T> PageResult<T> toResult(Page<T> result, int page, int size) {
        return PageResult.of(result.getContent(), page, size, result.getTotalElements());
    }

    private <T> PageResult<T> toPagedResult(List<T> rows, int page, int size) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.max(size, 1);
        int fromIndex = Math.min((safePage - 1) * safeSize, rows.size());
        int toIndex = Math.min(fromIndex + safeSize, rows.size());
        return PageResult.of(rows.subList(fromIndex, toIndex), safePage, safeSize, rows.size());
    }

    private List<MaterialGroupRecord> toMaterialGroups(List<Material> materials) {
        return materials.stream()
                .collect(Collectors.groupingBy(
                        material -> material.getCode() + "::" + material.getName(),
                        LinkedHashMap::new,
                        Collectors.toList()))
                .values()
                .stream()
                .map(this::toMaterialGroup)
                .toList();
    }

    private MaterialGroupRecord toMaterialGroup(List<Material> versions) {
        List<Material> sortedVersions = versions.stream()
                .sorted(this::compareMaterialVersionDesc)
                .peek(material -> material.setStatus(resolveMaterialRuntimeStatus(material)))
                .toList();
        Material latest = sortedVersions.getFirst();
        return MaterialGroupRecord.builder()
                .id("material-group:" + latest.getCode())
                .code(latest.getCode())
                .name(latest.getName())
                .specification(latest.getSpecification())
                .version(latest.getVersion())
                .versionCount(sortedVersions.size())
                .effectiveVersionCount((int) sortedVersions.stream().filter(this::isEffectiveMaterialVersion).count())
                .materialPurpose(latest.getMaterialPurpose())
                .effectiveDate(latest.getEffectiveDate() == null ? null : latest.getEffectiveDate().toString())
                .expiryDate(latest.getExpiryDate() == null ? null : latest.getExpiryDate().toString())
                .materialTypeId(latest.getMaterialTypeId())
                .materialTypeName(latest.getMaterialTypeName())
                .unit(latest.getUnit())
                .description(latest.getDescription())
                .status(resolveMaterialGroupRuntimeStatus(sortedVersions))
                .createdBy(latest.getCreatedBy())
                .createdAt(latest.getCreatedAt() == null ? null : latest.getCreatedAt().toString())
                .updatedBy(latest.getUpdatedBy())
                .updatedAt(latest.getUpdatedAt() == null ? null : latest.getUpdatedAt().toString())
                .versions(sortedVersions)
                .build();
    }

    private Set<Long> resolveProductMaterialTypeIds() {
        return materialTypeRepository.findAll().stream()
                .filter(type -> type != null && PRODUCT_MATERIAL_TYPE_NAMES.contains(type.getName()))
                .map(MaterialType::getId)
                .collect(Collectors.toSet());
    }

    private Map<Long, String> materialTypeNameMap() {
        Map<Long, String> names = new LinkedHashMap<>();
        materialTypeRepository.findAll().forEach(type -> {
            if (type != null && type.getId() != null) {
                names.put(type.getId(), type.getName());
            }
        });
        return names;
    }

    private void enrichMaterialTypeNames(List<Material> materials) {
        Map<Long, String> names = materialTypeNameMap();
        materials.forEach(material -> enrichMaterialTypeName(material, names));
    }

    private void enrichMaterialTypeName(Material material, Map<Long, String> names) {
        if (material != null) {
            material.setMaterialTypeName(names.get(material.getMaterialTypeId()));
        }
    }

    private Long resolveMaterialTypeId(ProcessModelingRequest request) {
        if (request == null) return null;
        if (request.getMaterialTypeId() != null) return request.getMaterialTypeId();
        if (!StringUtils.hasText(request.getMaterialTypeName())) return null;
        return materialTypeRepository.findAll().stream()
                .filter(type -> type != null && request.getMaterialTypeName().trim().equals(type.getName()))
                .map(MaterialType::getId)
                .findFirst()
                .orElse(null);
    }

    private void enrichRouteVersions(Route route) {
        if (route == null || route.getId() == null) return;
        List<RouteVersion> versions = routeVersionRepository.findByRouteIdOrderByCreatedAtDesc(route.getId());
        if (versions == null) versions = List.of();
        versions.forEach(version -> version.setVersionStatus(resolveRouteVersionRuntimeStatus(version)));
        route.setVersions(versions);
        route.setVersionCount(versions.size());
        route.setStatus(resolveRouteGroupRuntimeStatus(versions));
        if (!versions.isEmpty()) {
            RouteVersion latest = versions.getFirst();
            route.setLatestVersionId(latest.getId());
            route.setLatestVersion(latest.getVersion());
            route.setLatestVersionStatus(latest.getVersionStatus());
        }
    }

    private RouteVersion createInitialRouteVersion(Route route, ProcessModelingRequest request, LocalDateTime now) {
        RouteVersion version = RouteVersion.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .routeId(route.getId())
                .version(resolveRouteVersion(request))
                .versionStatus(resolveRouteVersionStatus(request))
                .description(trimToNull(request == null ? null : request.getVersionDescription()))
                .effectiveDate(request == null ? null : request.getEffectiveDate())
                .expiryDate(request == null ? null : request.getExpiryDate())
                .createdBy(currentOperatorName())
                .createdAt(now)
                .updatedBy(currentOperatorName())
                .updatedAt(now)
                .build();
        return routeVersionRepository.save(version);
    }

    private RouteVersion requireRouteVersion(Long routeId, Long versionId) {
        routeRepository.findById(routeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MD_008));
        return routeVersionRepository.findByRouteIdAndId(routeId, versionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "工艺路线版本不存在"));
    }

    private RouteNode toRouteNode(Long versionId, RouteGraphRequest.NodePayload payload) {
        if (payload == null || !StringUtils.hasText(payload.getNodeKey())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "工艺路线节点不能为空");
        }
        return RouteNode.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .routeVersionId(versionId)
                .nodeKey(payload.getNodeKey().trim())
                .operationId(payload.getOperationId())
                .operationCode(trimToNull(payload.getOperationCode()))
                .operationName(trimToNull(payload.getOperationName()))
                .nodeType(StringUtils.hasText(payload.getNodeType()) ? payload.getNodeType().trim() : "OPERATION")
                .positionX(payload.getPositionX() == null ? 0 : payload.getPositionX())
                .positionY(payload.getPositionY() == null ? 0 : payload.getPositionY())
                .sortOrder(payload.getSortOrder() == null ? 0 : payload.getSortOrder())
                .configJson(trimToNull(payload.getConfigJson()))
                .build();
    }

    private RouteRelation toRouteRelation(Long versionId, RouteGraphRequest.RelationPayload payload) {
        if (payload == null || !StringUtils.hasText(payload.getSourceNodeKey()) || !StringUtils.hasText(payload.getTargetNodeKey())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "工艺路线关系节点不能为空");
        }
        String relationType = StringUtils.hasText(payload.getRelationType()) ? payload.getRelationType().trim().toUpperCase() : "SEQUENTIAL";
        if (!ROUTE_RELATION_TYPES.contains(relationType)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "工艺路线关系类型不正确");
        }
        return RouteRelation.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .routeVersionId(versionId)
                .sourceNodeKey(payload.getSourceNodeKey().trim())
                .targetNodeKey(payload.getTargetNodeKey().trim())
                .sourceHandle(trimToNull(payload.getSourceHandle()))
                .targetHandle(trimToNull(payload.getTargetHandle()))
                .relationType(relationType)
                .label(trimToNull(payload.getLabel()))
                .ruleExpression(trimToNull(payload.getRuleExpression()))
                .priority(payload.getPriority() == null ? 0 : payload.getPriority())
                .build();
    }

    private String resolveRouteVersion(ProcessModelingRequest request) {
        if (request != null && StringUtils.hasText(request.getVersion())) return request.getVersion().trim();
        return DEFAULT_MATERIAL_VERSION;
    }

    private String resolveRouteVersionStatus(ProcessModelingRequest request) {
        if (request != null && StringUtils.hasText(request.getStatus())) return request.getStatus().trim();
        return "DRAFT";
    }

    private String resolveRouteVersionRuntimeStatus(RouteVersion version) {
        if (version == null) return "ACTIVE";
        return resolveRouteVersionRuntimeStatus(version.getEffectiveDate(), version.getExpiryDate());
    }

    private String resolveRouteVersionRuntimeStatus(LocalDateTime effectiveDate, LocalDateTime expiryDate) {
        LocalDateTime now = LocalDateTime.now();
        if (effectiveDate != null && effectiveDate.isAfter(now)) return "PENDING";
        if (expiryDate != null && !expiryDate.isAfter(now)) return "EXPIRED";
        return "ACTIVE";
    }

    private String resolveRouteGroupRuntimeStatus(List<RouteVersion> versions) {
        List<String> statuses = versions.stream()
                .map(this::resolveRouteVersionRuntimeStatus)
                .toList();
        if (statuses.contains("ACTIVE")) return "ACTIVE";
        if (statuses.stream().allMatch("EXPIRED"::equals)) return "DISABLED";
        if (statuses.contains("PENDING")) return "PENDING";
        return "DISABLED";
    }

    private BusinessException derivedProductMutationException() {
        return new BusinessException(ErrorCode.GENERAL_001, "产品管理由物料管理自动派生，请在物料管理中维护半成品或产成品物料");
    }

    private boolean matchesKeyword(Material material, String keyword) {
        if (!StringUtils.hasText(keyword)) return true;
        String normalized = keyword.trim().toLowerCase();
        return containsIgnoreCase(material.getName(), normalized)
                || containsIgnoreCase(material.getCode(), normalized)
                || containsIgnoreCase(material.getSpecification(), normalized)
                || containsIgnoreCase(material.getVersion(), normalized)
                || containsIgnoreCase(material.getUnit(), normalized);
    }

    private boolean matchesMaterialKeyword(Material material, String keyword, String materialName, String materialCode, String materialTypeName) {
        if (StringUtils.hasText(materialName) && !containsIgnoreCase(material.getName(), materialName.trim().toLowerCase())) return false;
        if (StringUtils.hasText(materialCode) && !containsIgnoreCase(material.getCode(), materialCode.trim().toLowerCase())) return false;
        if (StringUtils.hasText(materialTypeName) && !matchesMaterialTypeName(material, materialTypeName)) return false;
        if (!StringUtils.hasText(keyword)) return true;
        String normalized = keyword.trim().toLowerCase();
        return containsIgnoreCase(material.getName(), normalized)
                || containsIgnoreCase(material.getCode(), normalized)
                || containsIgnoreCase(material.getSpecification(), normalized)
                || containsIgnoreCase(material.getVersion(), normalized)
                || containsIgnoreCase(material.getUnit(), normalized)
                || matchesMaterialTypeName(material, normalized);
    }

    private boolean matchesMaterialTypeName(Material material, String materialTypeName) {
        if (material == null || !StringUtils.hasText(materialTypeName)) return false;
        String resolvedTypeName = material.getMaterialTypeName();
        if (!StringUtils.hasText(resolvedTypeName) && material.getMaterialTypeId() != null) {
            resolvedTypeName = materialTypeNameMap().get(material.getMaterialTypeId());
        }
        return StringUtils.hasText(resolvedTypeName) && resolvedTypeName.toLowerCase().contains(materialTypeName.trim().toLowerCase());
    }

    private boolean containsIgnoreCase(String value, String normalizedKeyword) {
        return value != null && value.toLowerCase().contains(normalizedKeyword);
    }

    private boolean matchesStatus(String value, String status) {
        return !StringUtils.hasText(status) || "ALL".equalsIgnoreCase(status) || status.trim().equals(value);
    }

    private Comparator<Material> materialComparator(String sort, String order) {
        Comparator<Material> comparator = switch (sort) {
            case "name" -> Comparator.comparing(Material::getName, Comparator.nullsLast(String::compareToIgnoreCase));
            case "code" -> Comparator.comparing(Material::getCode, Comparator.nullsLast(String::compareToIgnoreCase));
            case "status" -> Comparator.comparing(this::resolveMaterialRuntimeStatus, Comparator.nullsLast(String::compareToIgnoreCase));
            case "updatedAt" -> Comparator.comparing(Material::getUpdatedAt, Comparator.nullsLast(LocalDateTime::compareTo));
            default -> Comparator.comparing(Material::getCreatedAt, Comparator.nullsLast(LocalDateTime::compareTo));
        };
        return "asc".equalsIgnoreCase(order) ? comparator : comparator.reversed();
    }

    private int compareMaterialVersionDesc(Material left, Material right) {
        return compareVersion(right == null ? null : right.getVersion(), left == null ? null : left.getVersion());
    }

    private int compareVersion(String left, String right) {
        String leftValue = StringUtils.hasText(left) ? left.trim() : "";
        String rightValue = StringUtils.hasText(right) ? right.trim() : "";
        Matcher leftMatcher = VERSION_NUMBER_PATTERN.matcher(leftValue);
        Matcher rightMatcher = VERSION_NUMBER_PATTERN.matcher(rightValue);
        while (leftMatcher.find() && rightMatcher.find()) {
            int numberCompare = Long.compare(Long.parseLong(leftMatcher.group()), Long.parseLong(rightMatcher.group()));
            if (numberCompare != 0) return numberCompare;
        }
        if (leftMatcher.find()) return 1;
        if (rightMatcher.find()) return -1;
        return leftValue.compareToIgnoreCase(rightValue);
    }

    private boolean isEffectiveMaterialVersion(Material material) {
        return "ACTIVE".equals(resolveMaterialRuntimeStatus(material));
    }

    private String resolveMaterialRuntimeStatus(Material material) {
        if (material == null) return "ACTIVE";
        return resolveMaterialRuntimeStatus(material.getEffectiveDate(), material.getExpiryDate());
    }

    private String resolveMaterialRuntimeStatus(LocalDateTime effectiveDate, LocalDateTime expiryDate) {
        LocalDateTime now = LocalDateTime.now();
        if (effectiveDate != null && effectiveDate.isAfter(now)) return "PENDING";
        if (expiryDate != null && !expiryDate.isAfter(now)) return "EXPIRED";
        return "ACTIVE";
    }

    private String resolveMaterialGroupRuntimeStatus(List<Material> versions) {
        List<String> statuses = versions.stream()
                .map(this::resolveMaterialRuntimeStatus)
                .toList();
        if (statuses.contains("ACTIVE")) return "ACTIVE";
        if (statuses.stream().allMatch("EXPIRED"::equals)) return "DISABLED";
        if (statuses.contains("PENDING")) return "PENDING";
        return "DISABLED";
    }

    private PageRequest pageable(int page, int size, String sort, String order) {
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(Math.max(page - 1, 0), Math.max(size, 1), Sort.by(direction, safeSort(sort)));
    }

    private String safeSort(String sort) {
        if (!StringUtils.hasText(sort)) return "createdAt";
        return switch (sort) {
            case "name", "code", "status", "createdAt", "updatedAt", "sortOrder" -> sort;
            default -> "createdAt";
        };
    }

    private <T> Specification<T> keywordStatusSpec(String keyword, String status) {
        return (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            if (StringUtils.hasText(keyword)) {
                String like = "%" + keyword.trim() + "%";
                predicates.add(cb.or(cb.like(root.get("name"), like), cb.like(root.get("code"), like)));
            }
            if (StringUtils.hasText(status) && !"ALL".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(root.get("status"), status.trim()));
            }
            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private Specification<SopDocument> documentSpec(String keyword, String status) {
        return (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            if (StringUtils.hasText(keyword)) {
                String like = "%" + keyword.trim() + "%";
                predicates.add(cb.or(cb.like(root.get("title"), like), cb.like(root.get("code"), like)));
            }
            if (StringUtils.hasText(status) && !"ALL".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(root.get("status"), status.trim()));
            }
            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private Specification<Operation> operationSpec(String keyword, String operationName, String operationCode, String operationCategory, String status) {
        return (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            if (StringUtils.hasText(keyword)) {
                String like = "%" + keyword.trim() + "%";
                predicates.add(cb.or(cb.like(root.get("name"), like), cb.like(root.get("code"), like)));
            }
            if (StringUtils.hasText(operationName)) {
                predicates.add(cb.like(root.get("name"), "%" + operationName.trim() + "%"));
            }
            if (StringUtils.hasText(operationCode)) {
                predicates.add(cb.like(root.get("code"), "%" + operationCode.trim() + "%"));
            }
            if (StringUtils.hasText(operationCategory) && !OPERATION_CATEGORY_ALL.equalsIgnoreCase(operationCategory)) {
                if (OPERATION_CATEGORY_UNCATEGORIZED.equalsIgnoreCase(operationCategory)) {
                    predicates.add(cb.or(
                            cb.isNull(root.get("operationCategory")),
                            cb.equal(cb.trim(root.get("operationCategory")), "")));
                } else {
                    predicates.add(cb.equal(root.get("operationCategory"), operationCategory.trim()));
                }
            }
            if (StringUtils.hasText(status) && !"ALL".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(root.get("status"), status.trim()));
            }
            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private String requireName(ProcessModelingRequest request) {
        if (request == null || !StringUtils.hasText(request.getName())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "名称不能为空");
        }
        return request.getName().trim();
    }

    private String requireOperationCode(ProcessModelingRequest request) {
        if (request == null || !StringUtils.hasText(request.getCode())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "工序编码不能为空");
        }
        return request.getCode().trim();
    }

    private void validateOperationCodeForCreate(String code) {
        if (!findOperationsByCode(code).isEmpty()) {
            throw duplicatedOperationCodeException();
        }
    }

    private void validateOperationCodeForUpdate(Operation existing, String code) {
        boolean conflicts = findOperationsByCode(code).stream()
                .anyMatch(operation -> !Objects.equals(operation.getId(), existing.getId()));
        if (conflicts) {
            throw duplicatedOperationCodeException();
        }
    }

    private List<Operation> findOperationsByCode(String code) {
        if (!StringUtils.hasText(code)) return List.of();
        List<Operation> operations = operationRepository.findByTenantIdAndCodeIgnoreCase(TENANT_ID, code.trim());
        return operations == null ? List.of() : operations;
    }

    private BusinessException duplicatedOperationCodeException() {
        return new BusinessException(ErrorCode.GENERAL_001, "工序编码已存在，请更换后重试");
    }

    private String requireOperationCategoryName(OperationCategoryRequest request) {
        if (request == null || !StringUtils.hasText(request.name())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "工序分类名称不能为空");
        }
        return request.name().trim();
    }

    private void validateMaterialDateRange(ProcessModelingRequest request) {
        if (request == null || request.getEffectiveDate() == null || request.getExpiryDate() == null) return;
        if (request.getExpiryDate().isBefore(request.getEffectiveDate())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "失效时间不能早于生效时间");
        }
    }

    private void validateRouteDateRange(ProcessModelingRequest request) {
        if (request == null || request.getEffectiveDate() == null || request.getExpiryDate() == null) return;
        if (request.getExpiryDate().isBefore(request.getEffectiveDate())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "失效时间不能早于生效时间");
        }
    }

    private void validateMaterialCodeForCreate(String code, String name, String version) {
        List<Material> sameCodeMaterials = findMaterialsByCode(code);
        if (sameCodeMaterials.isEmpty()) return;
        boolean sameMaterialName = sameCodeMaterials.stream()
                .allMatch(material -> sameText(material.getName(), name));
        boolean sameVersion = sameCodeMaterials.stream()
                .anyMatch(material -> sameText(material.getVersion(), version));
        if (!sameMaterialName || sameVersion) {
            throw duplicatedMaterialCodeException();
        }
    }

    private void validateMaterialCodeForUpdate(Material existing, String code, String version) {
        boolean codeChanged = !sameText(existing.getCode(), code);
        boolean conflicts = findMaterialsByCode(code).stream()
                .filter(material -> !Objects.equals(material.getId(), existing.getId()))
                .anyMatch(material -> codeChanged || sameText(material.getVersion(), version));
        if (conflicts) {
            throw duplicatedMaterialCodeException();
        }
    }

    private void validateMaterialBaseCodeForUpdate(Material existing, String code) {
        boolean conflicts = findMaterialsByCode(code).stream()
                .filter(material -> !sameText(material.getCode(), existing.getCode()))
                .findAny()
                .isPresent();
        if (conflicts) {
            throw duplicatedMaterialCodeException();
        }
    }

    private List<Material> findMaterialGroupVersions(Material existing) {
        if (existing == null || !StringUtils.hasText(existing.getCode())) return List.of(existing);
        List<Material> versions = findMaterialsByCode(existing.getCode());
        if (versions.isEmpty()) return List.of(existing);
        return versions;
    }

    private void applyMaterialBaseFields(Material material, ProcessModelingRequest request) {
        if (material == null || request == null) return;
        if (StringUtils.hasText(request.getName())) material.setName(request.getName().trim());
        if (StringUtils.hasText(request.getCode())) material.setCode(request.getCode().trim());
        if (request.getSpecification() != null) material.setSpecification(trimToNull(request.getSpecification()));
        if (request.getMaterialPurpose() != null) material.setMaterialPurpose(resolveMaterialPurpose(request));
        if (request.getMaterialTypeId() != null || StringUtils.hasText(request.getMaterialTypeName())) material.setMaterialTypeId(resolveMaterialTypeId(request));
        if (request.getUnit() != null) material.setUnit(trimToNull(request.getUnit()));
        material.setStatus(resolveMaterialRuntimeStatus(material.getEffectiveDate(), material.getExpiryDate()));
        material.setUpdatedBy(currentOperatorName());
        material.setUpdatedAt(LocalDateTime.now());
    }

    private List<Material> findMaterialsByCode(String code) {
        if (!StringUtils.hasText(code)) return List.of();
        List<Material> materials = materialRepository.findByTenantIdAndCodeIgnoreCase(TENANT_ID, code.trim());
        return materials == null ? List.of() : materials;
    }

    private boolean sameText(String left, String right) {
        String leftValue = StringUtils.hasText(left) ? left.trim() : "";
        String rightValue = StringUtils.hasText(right) ? right.trim() : "";
        return leftValue.equalsIgnoreCase(rightValue);
    }

    private BusinessException duplicatedMaterialCodeException() {
        return new BusinessException(ErrorCode.GENERAL_001, "物料料号已存在");
    }

    private String resolveStatus(ProcessModelingRequest request, String fallback) {
        if (request != null && StringUtils.hasText(request.getStatus())) return request.getStatus().trim();
        return StringUtils.hasText(fallback) ? fallback : "ACTIVE";
    }

    private String resolveCode(ProcessModelingRequest request, String prefix) {
        if (request != null && StringUtils.hasText(request.getCode())) return request.getCode().trim();
        return generateCode(prefix);
    }

    private String resolveMaterialVersion(ProcessModelingRequest request) {
        if (request != null && StringUtils.hasText(request.getVersion())) return request.getVersion().trim();
        return DEFAULT_MATERIAL_VERSION;
    }

    private String resolveMaterialPurpose(ProcessModelingRequest request) {
        if (request != null && StringUtils.hasText(request.getMaterialPurpose())) return request.getMaterialPurpose().trim();
        return DEFAULT_MATERIAL_PURPOSE;
    }

    private String resolveOperationType(ProcessModelingRequest request) {
        if (request == null || !StringUtils.hasText(request.getDefaultOperationType())) return DEFAULT_OPERATION_TYPE;
        String value = request.getDefaultOperationType().trim();
        if (!OPERATION_TYPES.contains(value)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "默认工序类型不正确");
        }
        return value;
    }

    private String resolveOperationCategory(ProcessModelingRequest request) {
        String category = request == null ? null : trimToNull(request.getOperationCategory());
        if (category == null) return null;
        operationCategoryRepository.findByTenantIdAndNameIgnoreCase(TENANT_ID, category)
                .orElseGet(() -> operationCategoryRepository.save(OperationCategory.builder()
                        .id(idGenerator.nextId())
                        .tenantId(TENANT_ID)
                        .name(category)
                        .sortOrder(nextOperationCategorySortOrder())
                        .createdBy(currentOperatorName())
                        .createdAt(LocalDateTime.now())
                        .updatedBy(currentOperatorName())
                        .updatedAt(LocalDateTime.now())
                        .build()));
        return category;
    }

    private List<OperationCategoryResponse> toOperationCategoryResponses() {
        List<Operation> operations = operationRepository.findAll();
        Map<String, Long> categoryCounts = operations.stream()
                .map(Operation::getOperationCategory)
                .filter(StringUtils::hasText)
                .map(String::trim)
                .collect(Collectors.groupingBy(
                        category -> category,
                        LinkedHashMap::new,
                        Collectors.counting()));
        long uncategorizedCount = operations.stream()
                .filter(operation -> !StringUtils.hasText(operation.getOperationCategory()))
                .count();
        List<OperationCategoryResponse> responses = new java.util.ArrayList<>();
        responses.add(new OperationCategoryResponse(OPERATION_CATEGORY_ALL, "全部", (long) operations.size(), 0));
        responses.add(new OperationCategoryResponse(OPERATION_CATEGORY_UNCATEGORIZED, "未分类", uncategorizedCount, 1));
        operationCategoryRepository.findByTenantIdOrderBySortOrderAscNameAsc(TENANT_ID).stream()
                .sorted(Comparator.comparing(OperationCategory::getSortOrder, Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(OperationCategory::getName, Comparator.nullsLast(String::compareToIgnoreCase)))
                .map(category -> toOperationCategoryResponse(category, categoryCounts.getOrDefault(category.getName(), 0L)))
                .forEach(responses::add);
        return responses;
    }

    private OperationCategoryResponse toOperationCategoryResponse(OperationCategory category, Long count) {
        return new OperationCategoryResponse(String.valueOf(category.getId()), category.getName(), count == null ? 0L : count, category.getSortOrder() == null ? 0 : category.getSortOrder());
    }

    private long countOperationsByCategory(String category) {
        if (!StringUtils.hasText(category)) return 0L;
        return operationRepository.findAll().stream()
                .filter(operation -> sameText(operation.getOperationCategory(), category))
                .count();
    }

    private int nextOperationCategorySortOrder() {
        return operationCategoryRepository.findByTenantIdOrderBySortOrderAscNameAsc(TENANT_ID).stream()
                .map(OperationCategory::getSortOrder)
                .filter(Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(0) + 10;
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String generateCode(String prefix) {
        long id = Math.abs(idGenerator.nextId());
        return prefix + "-" + String.format("%05d", id % 100000);
    }

    private String currentOperatorName() {
        if (StringUtils.hasText(AuditContext.getOperatorName())) return AuditContext.getOperatorName();
        if (StringUtils.hasText(AuditContext.getOperatorAccount())) return AuditContext.getOperatorAccount();
        return "系统管理员";
    }

    private void writeChangedAudit(
            String entityType,
            Long entityId,
            String menuName,
            String functionName,
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
        writeAudit(entityType, entityId, "UPDATE", menuName, functionName, changedBefore, changedAfter);
    }

    private boolean isUpdateAuditSystemField(String field) {
        return "displayName".equals(field) || "updatedBy".equals(field) || "updatedAt".equals(field);
    }

    private void writeAudit(
            String entityType,
            Long entityId,
            String action,
            String menuName,
            String functionName,
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
                .moduleName("数据")
                .menuName("工艺建模 · " + menuName)
                .functionName(functionName)
                .dataSummary(menuName + " #" + entityId)
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

    private Map<String, Object> materialSnapshot(Material entity) {
        Map<String, Object> snapshot = commonSnapshot(entity.getId(), entity.getCode(), entity.getName(), resolveMaterialRuntimeStatus(entity),
                entity.getCreatedBy(), entity.getCreatedAt(), entity.getUpdatedBy(), entity.getUpdatedAt());
        snapshot.put("specification", entity.getSpecification());
        snapshot.put("version", entity.getVersion());
        snapshot.put("materialPurpose", entity.getMaterialPurpose());
        snapshot.put("effectiveDate", entity.getEffectiveDate() == null ? null : entity.getEffectiveDate().toString());
        snapshot.put("expiryDate", entity.getExpiryDate() == null ? null : entity.getExpiryDate().toString());
        snapshot.put("materialTypeName", entity.getMaterialTypeName());
        snapshot.put("unit", entity.getUnit());
        snapshot.put("description", entity.getDescription());
        return snapshot;
    }

    private Map<String, Object> productSnapshot(Product entity) {
        Map<String, Object> snapshot = commonSnapshot(entity.getId(), entity.getCode(), entity.getName(), entity.getStatus(),
                entity.getCreatedBy(), entity.getCreatedAt(), entity.getUpdatedBy(), entity.getUpdatedAt());
        snapshot.put("productFamilyId", entity.getFamilyId());
        snapshot.put("specification", entity.getSpecification());
        snapshot.put("unit", entity.getUnit());
        snapshot.put("description", entity.getDescription());
        return snapshot;
    }

    private Map<String, Object> productFamilySnapshot(ProductFamily entity) {
        Map<String, Object> snapshot = commonSnapshot(entity.getId(), entity.getCode(), entity.getName(), entity.getStatus(),
                entity.getCreatedBy(), entity.getCreatedAt(), entity.getUpdatedBy(), entity.getUpdatedAt());
        snapshot.put("description", entity.getDescription());
        snapshot.put("remark", entity.getRemark());
        return snapshot;
    }

    private Map<String, Object> operationSnapshot(Operation entity) {
        Map<String, Object> snapshot = commonSnapshot(entity.getId(), entity.getCode(), entity.getName(), entity.getStatus(),
                entity.getCreatedBy(), entity.getCreatedAt(), entity.getUpdatedBy(), entity.getUpdatedAt());
        snapshot.put("description", entity.getDescription());
        snapshot.put("operationCategory", entity.getOperationCategory());
        snapshot.put("generalDescription", entity.getGeneralDescription());
        snapshot.put("defaultOperationType", entity.getDefaultOperationType());
        snapshot.put("defaultDurationMinutes", entity.getDefaultDurationMinutes());
        snapshot.put("sortOrder", entity.getSortOrder());
        snapshot.put("remark", entity.getRemark());
        return snapshot;
    }

    private Map<String, Object> operationCategorySnapshot(OperationCategory entity, Long count) {
        Map<String, Object> snapshot = commonSnapshot(entity.getId(), null, entity.getName(), "ACTIVE",
                entity.getCreatedBy(), entity.getCreatedAt(), entity.getUpdatedBy(), entity.getUpdatedAt());
        snapshot.put("operationCount", count == null ? 0L : count);
        return snapshot;
    }

    private Map<String, Object> routeSnapshot(Route entity) {
        Map<String, Object> snapshot = commonSnapshot(entity.getId(), entity.getCode(), entity.getName(), entity.getStatus(),
                entity.getCreatedBy(), entity.getCreatedAt(), entity.getUpdatedBy(), entity.getUpdatedAt());
        snapshot.put("description", entity.getDescription());
        snapshot.put("productFamilyId", entity.getProductFamilyId());
        snapshot.put("commonAsset", entity.getCommonAsset());
        snapshot.put("versionCount", entity.getVersionCount());
        snapshot.put("latestVersion", entity.getLatestVersion());
        snapshot.put("latestVersionStatus", entity.getLatestVersionStatus());
        snapshot.put("remark", entity.getRemark());
        return snapshot;
    }

    private Map<String, Object> routeVersionSnapshot(RouteVersion entity) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("id", entity.getId() == null ? null : String.valueOf(entity.getId()));
        snapshot.put("routeId", entity.getRouteId() == null ? null : String.valueOf(entity.getRouteId()));
        snapshot.put("version", entity.getVersion());
        snapshot.put("versionStatus", entity.getVersionStatus());
        snapshot.put("description", entity.getDescription());
        snapshot.put("effectiveDate", entity.getEffectiveDate() == null ? null : entity.getEffectiveDate().toString());
        snapshot.put("expiryDate", entity.getExpiryDate() == null ? null : entity.getExpiryDate().toString());
        snapshot.put("createdBy", entity.getCreatedBy());
        snapshot.put("createdAt", entity.getCreatedAt() == null ? null : entity.getCreatedAt().toString());
        snapshot.put("updatedBy", entity.getUpdatedBy());
        snapshot.put("updatedAt", entity.getUpdatedAt() == null ? null : entity.getUpdatedAt().toString());
        return snapshot;
    }

    private Map<String, Object> documentSnapshot(SopDocument entity) {
        Map<String, Object> snapshot = commonSnapshot(entity.getId(), entity.getCode(), entity.getTitle(), entity.getStatus(),
                entity.getCreatedBy(), entity.getCreatedAt(), entity.getUpdatedBy(), entity.getUpdatedAt());
        snapshot.put("version", entity.getVersion());
        snapshot.put("fileReference", entity.getFileReference());
        snapshot.put("description", entity.getDescription());
        snapshot.put("remark", entity.getRemark());
        return snapshot;
    }

    private Map<String, Object> commonSnapshot(
            Long id,
            String code,
            String name,
            String status,
            String createdBy,
            LocalDateTime createdAt,
            String updatedBy,
            LocalDateTime updatedAt) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("id", id);
        snapshot.put("code", code);
        snapshot.put("name", name);
        snapshot.put("displayName", name);
        snapshot.put("status", status);
        snapshot.put("createdBy", createdBy);
        snapshot.put("createdAt", createdAt == null ? null : createdAt.toString());
        snapshot.put("updatedBy", updatedBy);
        snapshot.put("updatedAt", updatedAt == null ? null : updatedAt.toString());
        return snapshot;
    }

    public record OperationCategoryRequest(String name) {
    }

    public record OperationCategoryOrderRequest(List<String> ids) {
    }

    public record OperationCategoryResponse(String id, String name, Long count, Integer sortOrder) {
    }
}
