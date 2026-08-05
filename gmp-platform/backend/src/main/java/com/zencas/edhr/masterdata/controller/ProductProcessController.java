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
import com.zencas.edhr.common.util.RdoVersionStatusResolver;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.masterdata.dto.ProductProcessVersionRequest;
import com.zencas.edhr.masterdata.entity.Material;
import com.zencas.edhr.masterdata.entity.MaterialType;
import com.zencas.edhr.masterdata.entity.ProductProcess;
import com.zencas.edhr.masterdata.entity.ProductProcessOperationBinding;
import com.zencas.edhr.masterdata.entity.ProductProcessOperationFormBinding;
import com.zencas.edhr.masterdata.entity.DocumentCategory;
import com.zencas.edhr.masterdata.entity.DocumentVersion;
import com.zencas.edhr.masterdata.entity.ProductProcessOperationDocumentBinding;
import com.zencas.edhr.masterdata.entity.ProductProcessVersion;
import com.zencas.edhr.masterdata.entity.Route;
import com.zencas.edhr.masterdata.entity.RouteNode;
import com.zencas.edhr.masterdata.entity.RouteVersion;
import com.zencas.edhr.masterdata.entity.SopDocument;
import com.zencas.edhr.masterdata.repository.MaterialRepository;
import com.zencas.edhr.masterdata.repository.MaterialTypeRepository;
import com.zencas.edhr.masterdata.repository.ProductProcessOperationBindingRepository;
import com.zencas.edhr.masterdata.repository.ProductProcessOperationFormBindingRepository;
import com.zencas.edhr.masterdata.repository.DocumentCategoryRepository;
import com.zencas.edhr.masterdata.repository.DocumentVersionRepository;
import com.zencas.edhr.masterdata.repository.ProductProcessOperationDocumentBindingRepository;
import com.zencas.edhr.masterdata.repository.ProductProcessRepository;
import com.zencas.edhr.masterdata.repository.ProductProcessVersionRepository;
import com.zencas.edhr.masterdata.repository.RouteNodeRepository;
import com.zencas.edhr.masterdata.repository.RouteRepository;
import com.zencas.edhr.masterdata.repository.RouteVersionRepository;
import com.zencas.edhr.masterdata.repository.SopDocumentRepository;
import com.zencas.edhr.template.entity.DhrTemplate;
import com.zencas.edhr.template.entity.DhrTemplateVersion;
import com.zencas.edhr.template.entity.FormTemplate;
import com.zencas.edhr.template.entity.FormTemplateVersion;
import com.zencas.edhr.template.repository.DhrTemplateRepository;
import com.zencas.edhr.template.repository.DhrTemplateVersionRepository;
import com.zencas.edhr.template.repository.FormTemplateRepository;
import com.zencas.edhr.template.repository.FormTemplateVersionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
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
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/master-data/product-modeling")
@RequiredArgsConstructor
public class ProductProcessController {

    private static final String TENANT_ID = "default";
    private static final String PRODUCT_TYPE_FINISHED = "产成品";
    private static final String PRODUCT_TYPE_SEMI_FINISHED = "半成品";
    private static final Set<String> PRODUCTION_MODES = Set.of("量产", "返工", "翻新");
    private static final Set<String> PRODUCTION_MODALITIES = Set.of("SN", "批次", "批次转SN");
    private static final DateTimeFormatterHolder DATE_TIME = new DateTimeFormatterHolder();
    private static final ObjectMapper AUDIT_OBJECT_MAPPER = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    private final MaterialRepository materialRepository;
    private final MaterialTypeRepository materialTypeRepository;
    private final ProductProcessRepository productProcessRepository;
    private final ProductProcessVersionRepository productProcessVersionRepository;
    private final ProductProcessOperationBindingRepository operationBindingRepository;
    private final ProductProcessOperationFormBindingRepository operationFormBindingRepository;
    private final ProductProcessOperationDocumentBindingRepository operationDocumentBindingRepository;
    private final RouteRepository routeRepository;
    private final RouteVersionRepository routeVersionRepository;
    private final RouteNodeRepository routeNodeRepository;
    private final SopDocumentRepository documentRepository;
    private final DocumentCategoryRepository documentCategoryRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final DhrTemplateRepository dhrTemplateRepository;
    private final DhrTemplateVersionRepository dhrTemplateVersionRepository;
    private final FormTemplateRepository formTemplateRepository;
    private final FormTemplateVersionRepository formTemplateVersionRepository;
    private final AuditEventRepository auditEventRepository;
    private final SnowflakeIdGenerator idGenerator;

    @GetMapping("/products")
    public ApiResponse<PageResult<ProductSourceResponse>> listProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Map<Long, String> materialTypeNames = materialTypeRepository.findAll().stream()
                .collect(Collectors.toMap(MaterialType::getId, MaterialType::getName, (left, right) -> left));
        Map<Long, ProductProcess> processes = productProcessRepository.findAll().stream()
                .collect(Collectors.toMap(ProductProcess::getProductVersionId, Function.identity(), (left, right) -> left));
        Map<Long, Integer> versionCounts = new LinkedHashMap<>();
        Map<Long, Integer> activeCounts = new LinkedHashMap<>();
        productProcessVersionRepository.findAll().forEach(version -> {
            ProductProcess process = processes.values().stream()
                    .filter(item -> Objects.equals(item.getId(), version.getProductProcessId()))
                    .findFirst().orElse(null);
            if (process == null) return;
            versionCounts.merge(process.getProductVersionId(), 1, Integer::sum);
            if ("ACTIVE".equals(resolveRuntimeStatus(version))) {
                activeCounts.merge(process.getProductVersionId(), 1, Integer::sum);
            }
        });
        List<ProductSourceResponse> products = materialRepository.findAll().stream()
                .filter(material -> isProductMaterial(material, materialTypeNames))
                .filter(material -> matchesKeyword(material, keyword))
                .filter(material -> !StringUtils.hasText(status) || "ALL".equalsIgnoreCase(status)
                        || resolveMaterialRuntimeStatus(material).equalsIgnoreCase(status))
                .sorted(Comparator.comparing(Material::getCreatedAt, Comparator.nullsLast(LocalDateTime::compareTo)).reversed())
                .map(material -> toProductSourceResponse(material, materialTypeNames,
                        versionCounts.getOrDefault(material.getId(), 0), activeCounts.getOrDefault(material.getId(), 0)))
                .toList();
        int normalizedPage = Math.max(page, 1);
        int normalizedSize = Math.max(size, 1);
        int from = Math.min((normalizedPage - 1) * normalizedSize, products.size());
        int to = Math.min(from + normalizedSize, products.size());
        return ApiResponse.success(PageResult.of(products.subList(from, to), normalizedPage, normalizedSize, products.size()));
    }

    @GetMapping("/products/{productVersionId}")
    public ApiResponse<ProductModelWorkspaceResponse> getProductModel(@PathVariable Long productVersionId) {
        Material product = requireProductMaterial(productVersionId);
        ProductProcess process = productProcessRepository.findByTenantIdAndProductVersionId(TENANT_ID, productVersionId).orElse(null);
        List<ProductProcessVersion> versions = process == null ? List.of() : productProcessVersionRepository.findByProductProcessIdOrderByCreatedAtDesc(process.getId());
        return ApiResponse.success(new ProductModelWorkspaceResponse(
                toProductSourceResponse(product, materialTypeNames(), versions.size(), (int) versions.stream().filter(version -> "ACTIVE".equals(resolveRuntimeStatus(version))).count()),
                process == null ? null : toProcessResponse(process, versions)));
    }

    @GetMapping("/products/{productVersionId}/options")
    public ApiResponse<ProductModelOptionsResponse> getProductModelOptions(@PathVariable Long productVersionId) {
        requireProductMaterial(productVersionId);
        List<RouteOption> routes = routeRepository.findAll().stream()
                .flatMap(route -> routeVersionRepository.findByRouteIdOrderByCreatedAtDesc(route.getId()).stream()
                        .map(version -> new RouteOption(id(version.getId()), id(route.getId()), route.getName(), route.getCode(), version.getVersion(), resolveRouteStatus(version))))
                .toList();
        List<TemplateOption> dhrTemplates = dhrTemplateRepository.findAll().stream()
                .flatMap(template -> dhrTemplateVersionRepository.findByDhrTemplateIdOrderByVersionNumberDesc(template.getId()).stream()
                        .map(version -> new TemplateOption(id(version.getId()), id(template.getId()), template.getCode(), template.getName(), version.getVersionLabel(), resolveRdoStatus(version.getEffectiveFrom(), version.getEffectiveTo()))))
                .toList();
        List<TemplateOption> formTemplates = formTemplateRepository.findAll().stream()
                .flatMap(template -> formTemplateVersionRepository.findByTemplateIdOrderByCreatedAtDesc(template.getId()).stream()
                        .map(version -> new TemplateOption(id(version.getId()), id(template.getId()), template.getCode(), template.getName(), version.getVersion(), resolveRdoStatus(version.getEffectiveFrom(), version.getEffectiveTo()))))
                .toList();
        Map<Long, SopDocument> documentsById = documentRepository.findAll().stream()
                .collect(Collectors.toMap(SopDocument::getId, Function.identity()));
        Map<Long, DocumentCategory> documentCategoriesById = documentCategoriesById();
        List<DocumentOption> documents = documentVersionRepository.findAll().stream()
                .map(version -> toDocumentOption(documentsById.get(version.getDocumentId()), version, documentCategoriesById))
                .filter(Objects::nonNull)
                .toList();
        return ApiResponse.success(new ProductModelOptionsResponse(routes, dhrTemplates, formTemplates, documents));
    }

    @PostMapping("/products/{productVersionId}/versions")
    @Transactional
    public ApiResponse<ProductProcessVersionResponse> createVersion(
            @PathVariable Long productVersionId,
            @RequestBody ProductProcessVersionRequest request) {
        Material product = requireProductMaterial(productVersionId);
        ProductProcess process = productProcessRepository.findByTenantIdAndProductVersionId(TENANT_ID, productVersionId)
                .orElseGet(() -> productProcessRepository.save(ProductProcess.builder()
                        .id(idGenerator.nextId())
                        .tenantId(TENANT_ID)
                        .productVersionId(productVersionId)
                        .createdBy(currentOperatorName())
                        .createdAt(LocalDateTime.now())
                        .updatedBy(currentOperatorName())
                        .updatedAt(LocalDateTime.now())
                        .build()));
        if (request != null && request.getSourceVersionId() != null && request.getOperationBindings() != null) {
            throw new BusinessException(ErrorCode.GENERAL_001, "复制版本时不能同时提交工序配置");
        }
        ProductProcessVersion version = buildVersion(process, request, nextVersionLabel(process.getId()));
        ProductProcessVersion saved = productProcessVersionRepository.save(version);
        if (request != null && request.getOperationBindings() != null) {
            saveOperationBindings(saved, request.getOperationBindings(), false);
        }
        if (request != null && request.getSourceVersionId() != null) {
            ProductProcessVersion source = requireVersion(process.getId(), request.getSourceVersionId());
            saveOperationBindings(saved, toOperationRequests(source.getId()), false);
        }
        writeAudit("PRODUCT_PROCESS_VERSION", saved.getId(), "CREATE", "产品管理", "新增制程配置版本", Map.of(), versionSnapshot(saved));
        return ApiResponse.success(toVersionResponse(saved));
    }

    @GetMapping("/products/{productVersionId}/versions/{versionId}")
    public ApiResponse<ProductProcessVersionResponse> getVersion(
            @PathVariable Long productVersionId,
            @PathVariable Long versionId) {
        requireProductMaterial(productVersionId);
        ProductProcess process = requireProcess(productVersionId);
        return ApiResponse.success(toVersionResponse(requireVersion(process.getId(), versionId)));
    }

    @PutMapping("/products/{productVersionId}/versions/{versionId}")
    @Transactional
    public ApiResponse<ProductProcessVersionResponse> updateVersion(
            @PathVariable Long productVersionId,
            @PathVariable Long versionId,
            @RequestBody ProductProcessVersionRequest request) {
        requireProductMaterial(productVersionId);
        ProductProcess process = requireProcess(productVersionId);
        ProductProcessVersion existing = requireVersion(process.getId(), versionId);
        Map<String, Object> before = versionSnapshot(existing);
        applyVersionFields(existing, request);
        validateVersion(process.getId(), existing, existing.getId());
        ProductProcessVersion saved = productProcessVersionRepository.save(existing);
        if (request != null && request.getOperationBindings() != null) {
            saveOperationBindings(saved, request.getOperationBindings(), true);
        }
        writeChangedAudit("PRODUCT_PROCESS_VERSION", saved.getId(), "产品管理", "编辑制程配置版本",
                withoutOperationBindings(before), withoutOperationBindings(versionSnapshot(saved)));
        return ApiResponse.success(toVersionResponse(saved));
    }

    @DeleteMapping("/products/{productVersionId}/versions/{versionId}")
    @Transactional
    public ApiResponse<Void> deleteVersion(
            @PathVariable Long productVersionId,
            @PathVariable Long versionId) {
        requireProductMaterial(productVersionId);
        ProductProcess process = requireProcess(productVersionId);
        ProductProcessVersion existing = requireVersion(process.getId(), versionId);
        Map<String, Object> before = versionSnapshot(existing);
        deleteOperationBindings(existing.getId());
        productProcessVersionRepository.delete(existing);
        if (productProcessVersionRepository.findByProductProcessIdOrderByCreatedAtDesc(process.getId()).isEmpty()) {
            productProcessRepository.delete(process);
        }
        writeAudit("PRODUCT_PROCESS_VERSION", versionId, "DELETE", "产品管理", "删除制程配置版本", before, Map.of());
        return ApiResponse.success(null);
    }

    private ProductProcessVersion buildVersion(ProductProcess process, ProductProcessVersionRequest request, String fallbackVersion) {
        if (request == null) throw new BusinessException(ErrorCode.GENERAL_001, "制程配置版本信息不能为空");
        ProductProcessVersion version = ProductProcessVersion.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .productProcessId(process.getId())
                .versionLabel(hasText(request.getVersion()) ? request.getVersion().trim() : fallbackVersion)
                .productionMode(requireProductionMode(request.getProductionMode()))
                .productionForm(requireProductionModality(request.getProductionForm()))
                .routeVersionId(requireId(request.getRouteVersionId(), "工艺路线版本不能为空"))
                .dhrTemplateVersionId(requireId(request.getDhrTemplateVersionId(), "批记录模板版本不能为空"))
                .description(trimToNull(request.getDescription()))
                .effectiveFrom(request.getEffectiveFrom())
                .effectiveTo(request.getEffectiveTo())
                .createdBy(currentOperatorName())
                .createdAt(LocalDateTime.now())
                .updatedBy(currentOperatorName())
                .updatedAt(LocalDateTime.now())
                .build();
        validateReferences(version);
        validateVersion(process.getId(), version, null);
        return version;
    }

    private void applyVersionFields(ProductProcessVersion existing, ProductProcessVersionRequest request) {
        if (request == null) throw new BusinessException(ErrorCode.GENERAL_001, "制程配置版本信息不能为空");
        String version = requireText(request.getVersion(), "版本不能为空");
        existing.setVersionLabel(version);
        existing.setProductionMode(requireProductionMode(request.getProductionMode()));
        existing.setProductionForm(requireProductionModality(request.getProductionForm()));
        existing.setRouteVersionId(requireId(request.getRouteVersionId(), "工艺路线版本不能为空"));
        existing.setDhrTemplateVersionId(requireId(request.getDhrTemplateVersionId(), "批记录模板版本不能为空"));
        existing.setDescription(trimToNull(request.getDescription()));
        existing.setEffectiveFrom(request.getEffectiveFrom());
        existing.setEffectiveTo(request.getEffectiveTo());
        existing.setUpdatedBy(currentOperatorName());
        existing.setUpdatedAt(LocalDateTime.now());
        validateReferences(existing);
    }

    private void validateReferences(ProductProcessVersion version) {
        RouteVersion routeVersion = routeVersionRepository.findById(version.getRouteVersionId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MD_008, "工艺路线版本不存在"));
        if (!RdoVersionStatusResolver.isReferenceable(routeVersion.getEffectiveDate(), routeVersion.getExpiryDate())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "仅能引用生效中的工艺路线版本");
        }
        DhrTemplateVersion dhrVersion = dhrTemplateVersionRepository.findById(version.getDhrTemplateVersionId())
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "批记录模板版本不存在"));
        if (!RdoVersionStatusResolver.isReferenceable(dhrVersion.getEffectiveFrom(), dhrVersion.getEffectiveTo())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "仅能引用生效中的批记录模板版本");
        }
    }

    private void validateVersion(Long processId, ProductProcessVersion candidate, Long excludeId) {
        if (!hasText(candidate.getVersionLabel())) throw new BusinessException(ErrorCode.GENERAL_001, "版本不能为空");
        if (candidate.getEffectiveFrom() != null && candidate.getEffectiveTo() != null
                && candidate.getEffectiveTo().isBefore(candidate.getEffectiveFrom())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "失效时间不能早于生效时间");
        }
        boolean duplicateVersion = productProcessVersionRepository.findByProductProcessIdAndVersionLabelIgnoreCase(processId, candidate.getVersionLabel().trim()).stream()
                .anyMatch(item -> !Objects.equals(item.getId(), excludeId));
        if (duplicateVersion) throw new BusinessException(ErrorCode.GENERAL_001, "版本号已存在，请更换后重试");
    }

    private void saveOperationBindings(ProductProcessVersion version, List<ProductProcessVersionRequest.OperationBindingRequest> requests, boolean recordAudit) {
        List<RouteNode> routeNodes = routeNodeRepository.findByRouteVersionIdOrderBySortOrderAsc(version.getRouteVersionId()).stream()
                .filter(node -> !hasText(node.getNodeType()) || "OPERATION".equalsIgnoreCase(node.getNodeType()))
                .toList();
        Map<String, RouteNode> nodes = routeNodes.stream().collect(Collectors.toMap(RouteNode::getNodeKey, Function.identity(), (left, right) -> left));
        List<ProductProcessVersionRequest.OperationBindingRequest> safeRequests = requests == null ? List.of() : requests;
        if (safeRequests.stream().map(ProductProcessVersionRequest.OperationBindingRequest::getRouteNodeKey).filter(this::hasText).distinct().count() != safeRequests.size()) {
            throw new BusinessException(ErrorCode.GENERAL_001, "工序配置不能重复或缺少路线节点");
        }
        for (ProductProcessVersionRequest.OperationBindingRequest request : safeRequests) {
            if (request == null || !hasText(request.getRouteNodeKey()) || !nodes.containsKey(request.getRouteNodeKey().trim())) {
                throw new BusinessException(ErrorCode.GENERAL_001, "工序配置必须来自当前工艺路线");
            }
            validateOperationReferences(request);
        }
        List<Map<String, Object>> before = recordAudit ? operationBindingsSnapshot(version) : List.of();
        deleteOperationBindings(version.getId());
        List<ProductProcessOperationBinding> bindings = new ArrayList<>();
        for (ProductProcessVersionRequest.OperationBindingRequest request : safeRequests) {
            RouteNode node = nodes.get(request.getRouteNodeKey().trim());
            bindings.add(ProductProcessOperationBinding.builder()
                    .id(idGenerator.nextId())
                    .productProcessVersionId(version.getId())
                    .routeNodeKey(node.getNodeKey())
                    .operationId(node.getOperationId())
                    .operationCode(node.getOperationCode())
                    .operationName(hasText(node.getOperationName()) ? node.getOperationName() : node.getNodeKey())
                    .sortOrder(request.getSortOrder() == null ? node.getSortOrder() : request.getSortOrder())
                    .createdAt(LocalDateTime.now())
                    .build());
        }
        List<ProductProcessOperationBinding> saved = operationBindingRepository.saveAll(bindings);
        for (int index = 0; index < saved.size(); index++) {
            ProductProcessOperationBinding binding = saved.get(index);
            ProductProcessVersionRequest.OperationBindingRequest request = safeRequests.get(index);
            operationFormBindingRepository.saveAll((request.getForms() == null ? List.<ProductProcessVersionRequest.FormBindingRequest>of() : request.getForms()).stream()
                    .map(form -> ProductProcessOperationFormBinding.builder()
                            .id(idGenerator.nextId())
                            .productProcessOperationBindingId(binding.getId())
                            .formTemplateVersionId(form.getFormTemplateVersionId())
                            .required(form.getRequired() == null || form.getRequired())
                            .sortOrder(form.getSortOrder() == null ? 0 : form.getSortOrder())
                            .createdAt(LocalDateTime.now())
                            .build()).toList());
            operationDocumentBindingRepository.saveAll((request.getDocuments() == null ? List.<ProductProcessVersionRequest.DocumentBindingRequest>of() : request.getDocuments()).stream()
                    .map(document -> ProductProcessOperationDocumentBinding.builder()
                            .id(idGenerator.nextId())
                            .productProcessOperationBindingId(binding.getId())
                            .documentVersionId(document.getDocumentVersionId())
                            .sortOrder(document.getSortOrder() == null ? 0 : document.getSortOrder())
                            .createdAt(LocalDateTime.now())
                            .build()).toList());
        }
        if (recordAudit) {
            List<Map<String, Object>> after = operationBindingsSnapshot(version);
            if (!Objects.equals(before, after)) {
                writeAudit("PRODUCT_PROCESS_OPERATION", version.getId(), "UPDATE", "产品管理", "编辑工序配置",
                        Map.of("operationBindings", before), Map.of("operationBindings", after));
            }
        }
    }

    private void validateOperationReferences(ProductProcessVersionRequest.OperationBindingRequest request) {
        List<ProductProcessVersionRequest.FormBindingRequest> forms = request.getForms() == null ? List.of() : request.getForms();
        for (ProductProcessVersionRequest.FormBindingRequest form : forms) {
            if (form == null || form.getFormTemplateVersionId() == null) {
                throw new BusinessException(ErrorCode.GENERAL_001, "工序引用的表单模板版本不存在");
            }
            FormTemplateVersion version = formTemplateVersionRepository.findById(form.getFormTemplateVersionId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "工序引用的表单模板版本不存在"));
            if (!RdoVersionStatusResolver.isReferenceable(version.getEffectiveFrom(), version.getEffectiveTo())) {
                throw new BusinessException(ErrorCode.GENERAL_001, "工序仅能引用生效中的表单模板版本");
            }
        }
        List<ProductProcessVersionRequest.DocumentBindingRequest> documents = request.getDocuments() == null ? List.of() : request.getDocuments();
        if (documents.stream().anyMatch(document -> document == null || document.getDocumentVersionId() == null || !documentVersionRepository.existsById(document.getDocumentVersionId()))) {
            throw new BusinessException(ErrorCode.MD_009, "工序引用的文档版本不存在");
        }
    }

    private List<ProductProcessVersionRequest.OperationBindingRequest> toOperationRequests(Long versionId) {
        OperationBindingData data = loadOperationBindingData(versionId);
        return data.bindings().stream()
                .map(operation -> new ProductProcessVersionRequest.OperationBindingRequest(
                        operation.getRouteNodeKey(), operation.getSortOrder(),
                        data.forms().getOrDefault(operation.getId(), List.of()).stream().map(form -> new ProductProcessVersionRequest.FormBindingRequest(form.getFormTemplateVersionId(), form.getRequired(), form.getSortOrder())).toList(),
                        data.documents().getOrDefault(operation.getId(), List.of()).stream().map(document -> new ProductProcessVersionRequest.DocumentBindingRequest(document.getDocumentVersionId(), document.getSortOrder())).toList()))
                .toList();
    }

    private OperationBindingData loadOperationBindingData(Long versionId) {
        List<ProductProcessOperationBinding> bindings = operationBindingRepository.findByProductProcessVersionIdOrderBySortOrderAsc(versionId);
        if (bindings.isEmpty()) return new OperationBindingData(List.of(), Map.of(), Map.of());
        List<Long> bindingIds = bindings.stream().map(ProductProcessOperationBinding::getId).toList();
        Map<Long, List<ProductProcessOperationFormBinding>> forms = operationFormBindingRepository
                .findByProductProcessOperationBindingIdInOrderBySortOrderAsc(bindingIds).stream()
                .collect(Collectors.groupingBy(ProductProcessOperationFormBinding::getProductProcessOperationBindingId));
        Map<Long, List<ProductProcessOperationDocumentBinding>> documents = operationDocumentBindingRepository
                .findByProductProcessOperationBindingIdInOrderBySortOrderAsc(bindingIds).stream()
                .collect(Collectors.groupingBy(ProductProcessOperationDocumentBinding::getProductProcessOperationBindingId));
        return new OperationBindingData(bindings, forms, documents);
    }

    private void deleteOperationBindings(Long versionId) {
        List<Long> bindingIds = operationBindingRepository.findByProductProcessVersionIdOrderBySortOrderAsc(versionId).stream().map(ProductProcessOperationBinding::getId).toList();
        if (!bindingIds.isEmpty()) {
            operationFormBindingRepository.deleteByProductProcessOperationBindingIdIn(bindingIds);
            operationDocumentBindingRepository.deleteByProductProcessOperationBindingIdIn(bindingIds);
        }
        operationBindingRepository.deleteByProductProcessVersionId(versionId);
    }

    private ProductProcess requireProcess(Long productVersionId) {
        return productProcessRepository.findByTenantIdAndProductVersionId(TENANT_ID, productVersionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "该产品尚未建立制程配置版本"));
    }

    private ProductProcessVersion requireVersion(Long processId, Long versionId) {
        return productProcessVersionRepository.findByProductProcessIdAndId(processId, versionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "制程配置版本不存在"));
    }

    private Material requireProductMaterial(Long id) {
        Material material = materialRepository.findById(id).orElseThrow(() -> new BusinessException(ErrorCode.MD_003, "产品版本不存在"));
        if (!isProductMaterial(material, materialTypeNames())) {
            throw new BusinessException(ErrorCode.MD_003, "产品建模只能引用半成品或产成品物料");
        }
        return material;
    }

    private boolean isProductMaterial(Material material, Map<Long, String> materialTypeNames) {
        String typeName = materialTypeNames.get(material.getMaterialTypeId());
        return PRODUCT_TYPE_FINISHED.equals(typeName) || PRODUCT_TYPE_SEMI_FINISHED.equals(typeName);
    }

    private Map<Long, String> materialTypeNames() {
        return materialTypeRepository.findAll().stream().collect(Collectors.toMap(MaterialType::getId, MaterialType::getName, (left, right) -> left));
    }

    private ProductSourceResponse toProductSourceResponse(Material material, Map<Long, String> materialTypeNames, int versionCount, int activeVersionCount) {
        return new ProductSourceResponse(id(material.getId()), material.getName(), material.getCode(), material.getVersion(),
                material.getSpecification(), materialTypeNames.get(material.getMaterialTypeId()), material.getUnit(),
                resolveMaterialRuntimeStatus(material), material.getCreatedBy(), material.getCreatedAt(), material.getUpdatedBy(), material.getUpdatedAt(), versionCount, activeVersionCount);
    }

    private ProductProcessResponse toProcessResponse(ProductProcess process, List<ProductProcessVersion> versions) {
        return new ProductProcessResponse(id(process.getId()), versions.stream().map(this::toVersionResponse).toList());
    }

    private ProductProcessVersionResponse toVersionResponse(ProductProcessVersion version) {
        RouteVersion routeVersion = routeVersionRepository.findById(version.getRouteVersionId()).orElse(null);
        Route route = routeVersion == null ? null : routeRepository.findById(routeVersion.getRouteId()).orElse(null);
        DhrTemplateVersion dhrVersion = dhrTemplateVersionRepository.findById(version.getDhrTemplateVersionId()).orElse(null);
        DhrTemplate dhrTemplate = dhrVersion == null ? null : dhrTemplateRepository.findById(dhrVersion.getDhrTemplateId()).orElse(null);
        OperationBindingData bindingData = loadOperationBindingData(version.getId());
        Map<Long, DocumentCategory> documentCategoriesById = documentCategoriesById();
        List<ProductProcessOperationResponse> operations = bindingData.bindings().stream()
                .map(operation -> new ProductProcessOperationResponse(id(operation.getId()), operation.getRouteNodeKey(), idOrNull(operation.getOperationId()), operation.getOperationCode(), operation.getOperationName(), operation.getSortOrder(),
                        bindingData.forms().getOrDefault(operation.getId(), List.of()).stream().map(this::toFormBindingResponse).toList(),
                        bindingData.documents().getOrDefault(operation.getId(), List.of()).stream().map(binding -> toDocumentBindingResponse(binding, documentCategoriesById)).toList()))
                .toList();
        return new ProductProcessVersionResponse(id(version.getId()), version.getVersionLabel(), version.getProductionMode(), version.getProductionForm(),
                idOrNull(version.getRouteVersionId()), route == null ? null : route.getName(), route == null ? null : route.getCode(), routeVersion == null ? null : routeVersion.getVersion(),
                idOrNull(version.getDhrTemplateVersionId()), dhrTemplate == null ? null : dhrTemplate.getName(), dhrTemplate == null ? null : dhrTemplate.getCode(), dhrVersion == null ? null : dhrVersion.getVersionLabel(),
                version.getDescription(), version.getEffectiveFrom(), version.getEffectiveTo(), resolveRuntimeStatus(version),
                version.getCreatedBy(), version.getCreatedAt(), version.getUpdatedBy(), version.getUpdatedAt(), operations);
    }

    private FormBindingResponse toFormBindingResponse(ProductProcessOperationFormBinding form) {
        FormTemplateVersion version = formTemplateVersionRepository.findById(form.getFormTemplateVersionId()).orElse(null);
        FormTemplate template = version == null ? null : formTemplateRepository.findById(version.getTemplateId()).orElse(null);
        return new FormBindingResponse(id(form.getId()), id(form.getFormTemplateVersionId()), template == null ? null : template.getName(), template == null ? null : template.getCode(), version == null ? null : version.getVersion(), form.getRequired(), form.getSortOrder());
    }

    private DocumentBindingResponse toDocumentBindingResponse(ProductProcessOperationDocumentBinding binding, Map<Long, DocumentCategory> documentCategoriesById) {
        DocumentVersion version = documentVersionRepository.findById(binding.getDocumentVersionId()).orElse(null);
        SopDocument document = version == null ? null : documentRepository.findById(version.getDocumentId()).orElse(null);
        return new DocumentBindingResponse(id(binding.getId()), id(binding.getDocumentVersionId()), document == null ? null : document.getTitle(), document == null ? null : document.getCode(),
                document == null ? null : documentCategoryName(document, documentCategoriesById), version == null ? null : version.getVersion(), binding.getSortOrder());
    }

    private DocumentOption toDocumentOption(SopDocument document, DocumentVersion version, Map<Long, DocumentCategory> documentCategoriesById) {
        if (document == null || version == null) return null;
        return new DocumentOption(id(version.getId()), id(document.getId()), document.getCode(), document.getTitle(),
                documentCategoryName(document, documentCategoriesById), version.getVersion(), resolveDocumentStatus(version));
    }

    private Map<Long, DocumentCategory> documentCategoriesById() {
        return documentCategoryRepository.findByTenantIdOrderBySortOrderAscNameAsc(TENANT_ID).stream()
                .collect(Collectors.toMap(DocumentCategory::getId, Function.identity(), (left, right) -> left));
    }

    private String documentCategoryName(SopDocument document, Map<Long, DocumentCategory> documentCategoriesById) {
        if (document.getCategoryId() == null) return "未分类";
        DocumentCategory category = documentCategoriesById.get(document.getCategoryId());
        return category == null ? "未分类" : category.getName();
    }

    private Map<String, Object> versionSnapshot(ProductProcessVersion version) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("id", id(version.getId()));
        snapshot.put("productProcessId", id(version.getProductProcessId()));
        snapshot.put("version", version.getVersionLabel());
        snapshot.put("productionMode", version.getProductionMode());
        snapshot.put("productionForm", version.getProductionForm());
        ProductProcessVersionResponse response = toVersionResponse(version);
        snapshot.put("routeVersion", joinReference(response.routeCode(), response.routeName(), response.routeVersion()));
        snapshot.put("dhrTemplateVersion", joinReference(response.dhrTemplateCode(), response.dhrTemplateName(), response.dhrTemplateVersion()));
        snapshot.put("description", version.getDescription());
        snapshot.put("effectiveFrom", formatDateTime(version.getEffectiveFrom()));
        snapshot.put("effectiveTo", formatDateTime(version.getEffectiveTo()));
        snapshot.put("status", resolveRuntimeStatus(version));
        snapshot.put("operationBindings", operationBindingsSnapshot(response.operations()));
        return snapshot;
    }

    private Map<String, Object> withoutOperationBindings(Map<String, Object> snapshot) {
        Map<String, Object> result = new LinkedHashMap<>(snapshot);
        result.remove("operationBindings");
        return result;
    }

    private List<Map<String, Object>> operationBindingsSnapshot(ProductProcessVersion version) {
        return operationBindingsSnapshot(toVersionResponse(version).operations());
    }

    private List<Map<String, Object>> operationBindingsSnapshot(List<ProductProcessOperationResponse> operations) {
        return operations.stream().map(this::operationSnapshot).toList();
    }

    private Map<String, Object> operationSnapshot(ProductProcessOperationResponse operation) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("operation", joinReference(operation.operationCode(), operation.operationName()));
        snapshot.put("forms", operation.forms().stream()
                .map(form -> joinReference(form.templateCode(), form.templateName(), form.version()) + (Boolean.TRUE.equals(form.required()) ? "（必填）" : ""))
                .toList());
        snapshot.put("documents", operation.documents().stream()
                .map(document -> joinReference(document.documentCategoryName(), document.code(), document.title(), document.version()))
                .toList());
        return snapshot;
    }

    private String joinReference(String... parts) {
        return java.util.Arrays.stream(parts).filter(this::hasText).collect(Collectors.joining(" / "));
    }

    private void writeChangedAudit(String entityType, Long entityId, String menuName, String functionName, Map<String, Object> before, Map<String, Object> after) {
        Map<String, Object> changedBefore = new LinkedHashMap<>();
        Map<String, Object> changedAfter = new LinkedHashMap<>();
        before.forEach((key, value) -> {
            if (!Objects.equals(value, after.get(key))) {
                changedBefore.put(key, value);
                changedAfter.put(key, after.get(key));
            }
        });
        if (!changedBefore.isEmpty()) writeAudit(entityType, entityId, "UPDATE", menuName, functionName, changedBefore, changedAfter);
    }

    private void writeAudit(String entityType, Long entityId, String action, String menuName, String functionName, Map<String, Object> before, Map<String, Object> after) {
        auditEventRepository.save(AuditEvent.builder()
                .id(idGenerator.nextId()).tenantId(TENANT_ID).entityType(entityType).entityId(id(entityId)).action(action)
                .contentBefore(toAuditJson(before)).contentAfter(toAuditJson(after))
                .operatorId(AuditContext.getOperatorId()).operatorName(AuditContext.getOperatorName()).operatorAccount(AuditContext.getOperatorAccount())
                .source(AuditContext.getSource()).moduleName("数据").menuName("工艺建模 · " + menuName).functionName(functionName)
                .dataSummary(menuName + " #" + entityId).ipAddress(AuditContext.getIpAddress()).createdAt(LocalDateTime.now()).build());
    }

    private String toAuditJson(Map<String, Object> content) {
        try { return AUDIT_OBJECT_MAPPER.writeValueAsString(content); }
        catch (JsonProcessingException exception) { throw new BusinessException(ErrorCode.GENERAL_001, "审计内容序列化失败"); }
    }

    private String resolveRuntimeStatus(ProductProcessVersion version) {
        return RdoVersionStatusResolver.resolve(version.getEffectiveFrom(), version.getEffectiveTo());
    }

    private String resolveTemplateStatus(LocalDateTime effectiveFrom, LocalDateTime effectiveTo) {
        return RdoVersionStatusResolver.resolve(effectiveFrom, effectiveTo);
    }

    private String resolveRouteStatus(RouteVersion version) { return resolveRdoStatus(version.getEffectiveDate(), version.getExpiryDate()); }

    private String resolveRdoStatus(LocalDateTime effectiveFrom, LocalDateTime effectiveTo) {
        return RdoVersionStatusResolver.resolve(effectiveFrom, effectiveTo);
    }

    private String resolveDocumentStatus(DocumentVersion version) { return resolveTemplateStatus(version.getEffectiveDate(), version.getExpiryDate()); }

    private String resolveMaterialRuntimeStatus(Material material) { return resolveTemplateStatus(material.getEffectiveDate(), material.getExpiryDate()); }

    private String nextVersionLabel(Long processId) {
        int next = productProcessVersionRepository.findByProductProcessIdOrderByCreatedAtDesc(processId).size() + 1;
        String label;
        do { label = "V" + next++ + ".0"; }
        while (!productProcessVersionRepository.findByProductProcessIdAndVersionLabelIgnoreCase(processId, label).isEmpty());
        return label;
    }

    private boolean matchesKeyword(Material material, String keyword) {
        if (!hasText(keyword)) return true;
        String normalized = keyword.trim().toLowerCase();
        return contains(material.getName(), normalized) || contains(material.getCode(), normalized) || contains(material.getVersion(), normalized) || contains(material.getSpecification(), normalized);
    }

    private boolean contains(String value, String keyword) { return value != null && value.toLowerCase().contains(keyword); }
    private boolean hasText(String value) { return StringUtils.hasText(value); }
    private String requireText(String value, String message) { if (!hasText(value)) throw new BusinessException(ErrorCode.GENERAL_001, message); return value.trim(); }
    private String requireProductionMode(String value) {
        String mode = requireText(value, "生产模式不能为空");
        if (!PRODUCTION_MODES.contains(mode)) throw new BusinessException(ErrorCode.GENERAL_001, "生产模式仅支持量产、返工或翻新");
        return mode;
    }
    private String requireProductionModality(String value) {
        String modality = requireText(value, "生产方式不能为空");
        if (!PRODUCTION_MODALITIES.contains(modality)) throw new BusinessException(ErrorCode.GENERAL_001, "生产方式仅支持SN、批次或批次转SN");
        return modality;
    }
    private Long requireId(Long value, String message) { if (value == null) throw new BusinessException(ErrorCode.GENERAL_001, message); return value; }
    private String trimToNull(String value) { return hasText(value) ? value.trim() : null; }
    private String id(Long value) { return value == null ? "" : String.valueOf(value); }
    private String idOrNull(Long value) { return value == null ? null : String.valueOf(value); }
    private String currentOperatorName() { return hasText(AuditContext.getOperatorName()) ? AuditContext.getOperatorName() : "系统管理员"; }
    private String formatDateTime(LocalDateTime value) { return value == null ? null : value.format(DATE_TIME.formatter); }

    public record ProductModelWorkspaceResponse(ProductSourceResponse product, ProductProcessResponse model) {}
    public record ProductSourceResponse(String id, String name, String code, String version, String specification, String materialTypeName, String unit, String status, String createdBy, LocalDateTime createdAt, String updatedBy, LocalDateTime updatedAt, int modelVersionCount, int activeModelVersionCount) {}
    public record ProductProcessResponse(String id, List<ProductProcessVersionResponse> versions) {}
    public record ProductProcessVersionResponse(String id, String version, String productionMode, String productionForm, String routeVersionId, String routeName, String routeCode, String routeVersion, String dhrTemplateVersionId, String dhrTemplateName, String dhrTemplateCode, String dhrTemplateVersion, String description, LocalDateTime effectiveFrom, LocalDateTime effectiveTo, String status, String createdBy, LocalDateTime createdAt, String updatedBy, LocalDateTime updatedAt, List<ProductProcessOperationResponse> operations) {}
    public record ProductProcessOperationResponse(String id, String routeNodeKey, String operationId, String operationCode, String operationName, Integer sortOrder, List<FormBindingResponse> forms, List<DocumentBindingResponse> documents) {}
    public record FormBindingResponse(String id, String formTemplateVersionId, String templateName, String templateCode, String version, Boolean required, Integer sortOrder) {}
    public record DocumentBindingResponse(String id, String documentVersionId, String title, String code, String documentCategoryName, String version, Integer sortOrder) {}
    public record ProductModelOptionsResponse(List<RouteOption> routes, List<TemplateOption> dhrTemplates, List<TemplateOption> formTemplates, List<DocumentOption> documents) {}
    public record RouteOption(String id, String routeId, String routeName, String routeCode, String version, String status) {}
    public record TemplateOption(String id, String templateId, String code, String name, String version, String status) {}
    public record DocumentOption(String id, String documentId, String code, String title, String documentCategoryName, String version, String status) {}

    private record OperationBindingData(
            List<ProductProcessOperationBinding> bindings,
            Map<Long, List<ProductProcessOperationFormBinding>> forms,
            Map<Long, List<ProductProcessOperationDocumentBinding>> documents) {}

    private static final class DateTimeFormatterHolder {
        private final java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    }
}
