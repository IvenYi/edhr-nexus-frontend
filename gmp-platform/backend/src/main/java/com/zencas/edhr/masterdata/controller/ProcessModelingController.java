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
import com.zencas.edhr.masterdata.entity.Material;
import com.zencas.edhr.masterdata.entity.MaterialType;
import com.zencas.edhr.masterdata.entity.Operation;
import com.zencas.edhr.masterdata.entity.Product;
import com.zencas.edhr.masterdata.entity.ProductFamily;
import com.zencas.edhr.masterdata.entity.Route;
import com.zencas.edhr.masterdata.entity.SopDocument;
import com.zencas.edhr.masterdata.repository.MaterialRepository;
import com.zencas.edhr.masterdata.repository.MaterialTypeRepository;
import com.zencas.edhr.masterdata.repository.OperationRepository;
import com.zencas.edhr.masterdata.repository.ProductFamilyRepository;
import com.zencas.edhr.masterdata.repository.ProductRepository;
import com.zencas.edhr.masterdata.repository.RouteRepository;
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
    private static final String DEFAULT_MATERIAL_VERSION = "V1.0";
    private static final Pattern VERSION_NUMBER_PATTERN = Pattern.compile("\\d+");

    private final MaterialTypeRepository materialTypeRepository;
    private final MaterialRepository materialRepository;
    private final ProductRepository productRepository;
    private final ProductFamilyRepository productFamilyRepository;
    private final OperationRepository operationRepository;
    private final RouteRepository routeRepository;
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
                .filter(material -> matchesStatus(material.getStatus(), status))
                .sorted(materialComparator(safeSort(sort), order))
                .toList();
        enrichMaterialTypeNames(materials);
        List<MaterialGroupRecord> groups = toMaterialGroups(materials);
        return ApiResponse.success(toPagedResult(groups, page, size));
    }

    @PostMapping("/materials")
    @Transactional
    public ApiResponse<Material> createMaterial(@RequestBody ProcessModelingRequest request) {
        LocalDateTime now = LocalDateTime.now();
        Material entity = Material.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .code(resolveCode(request, "MAT"))
                .name(requireName(request))
                .specification(trimToNull(request.getSpecification()))
                .version(resolveMaterialVersion(request))
                .materialTypeId(resolveMaterialTypeId(request))
                .unit(trimToNull(request.getUnit()))
                .description(trimToNull(request.getDescription()))
                .status(resolveStatus(request, "ACTIVE"))
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
        Material existing = materialRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "物料不存在"));
        Map<String, Object> before = materialSnapshot(existing);
        existing.setName(requireName(request));
        existing.setCode(StringUtils.hasText(request == null ? null : request.getCode()) ? request.getCode().trim() : existing.getCode());
        existing.setSpecification(trimToNull(request.getSpecification()));
        existing.setVersion(resolveMaterialVersion(request));
        existing.setMaterialTypeId(resolveMaterialTypeId(request));
        existing.setUnit(trimToNull(request.getUnit()));
        existing.setDescription(trimToNull(request.getDescription()));
        existing.setStatus(resolveStatus(request, existing.getStatus()));
        existing.setUpdatedBy(currentOperatorName());
        existing.setUpdatedAt(LocalDateTime.now());
        Material saved = materialRepository.save(existing);
        enrichMaterialTypeName(saved, materialTypeNameMap());
        writeChangedAudit("MATERIAL", saved.getId(), "物料管理", "编辑物料", before, materialSnapshot(saved));
        return ApiResponse.success(saved);
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
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        return ApiResponse.success(toResult(operationRepository.findAll(
                keywordStatusSpec(keyword, status), pageable(page, size, sort, order)), page, size));
    }

    @PostMapping("/operations")
    @Transactional
    public ApiResponse<Operation> createOperation(@RequestBody ProcessModelingRequest request) {
        LocalDateTime now = LocalDateTime.now();
        Operation entity = Operation.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .code(generateCode("OP"))
                .name(requireName(request))
                .description(trimToNull(request.getDescription()))
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
        Map<String, Object> before = operationSnapshot(existing);
        existing.setName(requireName(request));
        existing.setDescription(trimToNull(request.getDescription()));
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
        return ApiResponse.success(toResult(routeRepository.findAll(
                keywordStatusSpec(keyword, status), pageable(page, size, sort, order)), page, size));
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
                .status(resolveStatus(request, "DRAFT"))
                .remark(trimToNull(request.getRemark()))
                .createdBy(currentOperatorName())
                .createdAt(now)
                .updatedBy(currentOperatorName())
                .updatedAt(now)
                .build();
        Route saved = routeRepository.save(entity);
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
        existing.setProductFamilyId(request.getProductFamilyId() == null ? null : String.valueOf(request.getProductFamilyId()));
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
                .toList();
        Material latest = sortedVersions.getFirst();
        return MaterialGroupRecord.builder()
                .id("material-group:" + latest.getCode())
                .code(latest.getCode())
                .name(latest.getName())
                .specification(latest.getSpecification())
                .version(latest.getVersion())
                .materialTypeId(latest.getMaterialTypeId())
                .materialTypeName(latest.getMaterialTypeName())
                .unit(latest.getUnit())
                .description(latest.getDescription())
                .status(latest.getStatus())
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
            case "status" -> Comparator.comparing(Material::getStatus, Comparator.nullsLast(String::compareToIgnoreCase));
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

    private String requireName(ProcessModelingRequest request) {
        if (request == null || !StringUtils.hasText(request.getName())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "名称不能为空");
        }
        return request.getName().trim();
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
        Map<String, Object> snapshot = commonSnapshot(entity.getId(), entity.getCode(), entity.getName(), entity.getStatus(),
                entity.getCreatedBy(), entity.getCreatedAt(), entity.getUpdatedBy(), entity.getUpdatedAt());
        snapshot.put("specification", entity.getSpecification());
        snapshot.put("version", entity.getVersion());
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
        snapshot.put("defaultDurationMinutes", entity.getDefaultDurationMinutes());
        snapshot.put("sortOrder", entity.getSortOrder());
        snapshot.put("remark", entity.getRemark());
        return snapshot;
    }

    private Map<String, Object> routeSnapshot(Route entity) {
        Map<String, Object> snapshot = commonSnapshot(entity.getId(), entity.getCode(), entity.getName(), entity.getStatus(),
                entity.getCreatedBy(), entity.getCreatedAt(), entity.getUpdatedBy(), entity.getUpdatedAt());
        snapshot.put("description", entity.getDescription());
        snapshot.put("productFamilyId", entity.getProductFamilyId());
        snapshot.put("remark", entity.getRemark());
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
}
