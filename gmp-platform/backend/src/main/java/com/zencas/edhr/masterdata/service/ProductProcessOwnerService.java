package com.zencas.edhr.masterdata.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.RdoVersionStatusResolver;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.masterdata.dto.ProcessOwnerType;
import com.zencas.edhr.masterdata.dto.ProductProcessVersionRequest;
import com.zencas.edhr.masterdata.entity.DocumentVersion;
import com.zencas.edhr.masterdata.entity.Material;
import com.zencas.edhr.masterdata.entity.MaterialType;
import com.zencas.edhr.masterdata.entity.ProductFamily;
import com.zencas.edhr.masterdata.entity.ProductProcess;
import com.zencas.edhr.masterdata.entity.ProductProcessOperationBinding;
import com.zencas.edhr.masterdata.entity.ProductProcessOperationDocumentBinding;
import com.zencas.edhr.masterdata.entity.ProductProcessOperationFormBinding;
import com.zencas.edhr.masterdata.entity.ProductProcessVersion;
import com.zencas.edhr.masterdata.entity.RouteNode;
import com.zencas.edhr.masterdata.entity.RouteVersion;
import com.zencas.edhr.masterdata.repository.DocumentVersionRepository;
import com.zencas.edhr.masterdata.repository.MaterialRepository;
import com.zencas.edhr.masterdata.repository.MaterialTypeRepository;
import com.zencas.edhr.masterdata.repository.ProductFamilyRepository;
import com.zencas.edhr.masterdata.repository.ProductProcessOperationBindingRepository;
import com.zencas.edhr.masterdata.repository.ProductProcessOperationDocumentBindingRepository;
import com.zencas.edhr.masterdata.repository.ProductProcessOperationFormBindingRepository;
import com.zencas.edhr.masterdata.repository.ProductProcessRepository;
import com.zencas.edhr.masterdata.repository.ProductProcessVersionRepository;
import com.zencas.edhr.masterdata.repository.RouteNodeRepository;
import com.zencas.edhr.masterdata.repository.RouteVersionRepository;
import com.zencas.edhr.template.entity.DhrDirectory;
import com.zencas.edhr.template.entity.DhrTemplateItem;
import com.zencas.edhr.template.entity.DhrTemplateVersion;
import com.zencas.edhr.template.entity.FormTemplateVersion;
import com.zencas.edhr.template.repository.DhrDirectoryRepository;
import com.zencas.edhr.template.repository.DhrTemplateItemRepository;
import com.zencas.edhr.template.repository.DhrTemplateVersionRepository;
import com.zencas.edhr.template.repository.FormTemplateVersionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductProcessOwnerService {

    private static final String TENANT_ID = "default";
    private static final Set<String> PRODUCTION_MODES = Set.of("量产", "返工", "翻新");
    private static final Set<String> PRODUCTION_FORMS = Set.of("SN", "批次", "批次转SN");
    private static final ObjectMapper AUDIT_OBJECT_MAPPER = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    private final MaterialRepository materialRepository;
    private final MaterialTypeRepository materialTypeRepository;
    private final ProductFamilyRepository productFamilyRepository;
    private final ProductProcessRepository productProcessRepository;
    private final ProductProcessVersionRepository productProcessVersionRepository;
    private final ProductProcessOperationBindingRepository operationBindingRepository;
    private final ProductProcessOperationFormBindingRepository operationFormBindingRepository;
    private final ProductProcessOperationDocumentBindingRepository operationDocumentBindingRepository;
    private final RouteVersionRepository routeVersionRepository;
    private final RouteNodeRepository routeNodeRepository;
    private final DhrTemplateVersionRepository dhrTemplateVersionRepository;
    private final DhrDirectoryRepository dhrDirectoryRepository;
    private final DhrTemplateItemRepository dhrTemplateItemRepository;
    private final FormTemplateVersionRepository formTemplateVersionRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final FileObjectRepository fileObjectRepository;
    private final AuditEventRepository auditEventRepository;
    private final SnowflakeIdGenerator idGenerator;

    public ProcessOwnerWorkspace workspace(ProcessOwnerType ownerType, Long ownerId) {
        ProcessOwner owner = requireOwner(ownerType, ownerId);
        ProductProcess process = findProcess(ownerType, ownerId).orElse(null);
        List<ProductProcessVersion> versions = process == null
                ? List.of()
                : productProcessVersionRepository.findByProductProcessIdOrderByCreatedAtDesc(process.getId());
        return new ProcessOwnerWorkspace(owner, process, versions);
    }

    public ProductProcessVersion getVersion(ProcessOwnerType ownerType, Long ownerId, Long versionId) {
        ProductProcess process = requireProcess(ownerType, ownerId);
        return requireVersion(process.getId(), versionId);
    }

    @Transactional
    public ProductProcessVersion createVersion(ProcessOwnerType ownerType, Long ownerId, ProductProcessVersionRequest request) {
        if (request != null && request.getSourceVersionId() != null && request.getOperationBindings() != null) {
            throw new BusinessException(ErrorCode.GENERAL_001, "复制版本时不能同时提交工序配置");
        }
        ProductProcess process = findOrCreateProcess(ownerType, ownerId);
        String fallbackVersion = request != null && hasText(request.getVersion()) ? null : nextVersionLabel(process.getId());
        ProductProcessVersion version = buildVersion(process, request, fallbackVersion);
        ProductProcessVersion saved = productProcessVersionRepository.save(version);
        if (request != null && request.getSourceVersionId() != null) {
            saveOperationBindings(saved, toOperationRequests(requireVersion(process.getId(), request.getSourceVersionId()).getId()));
        } else if (request != null && request.getOperationBindings() != null) {
            saveOperationBindings(saved, request.getOperationBindings());
        }
        writeAudit(saved.getId(), "CREATE", menuName(ownerType), "新增制程配置版本", Map.of(), versionSnapshot(saved));
        writeOwnerConfigurationAudit(ownerType, ownerId, "新增制程配置版本", Map.of(), versionSnapshot(saved));
        return saved;
    }

    @Transactional
    public ProductProcessVersion updateVersion(
            ProcessOwnerType ownerType,
            Long ownerId,
            Long versionId,
            ProductProcessVersionRequest request) {
        ProductProcess process = requireProcess(ownerType, ownerId);
        ProductProcessVersion existing = requireVersion(process.getId(), versionId);
        Map<String, Object> before = versionSnapshot(existing);
        applyVersionFields(existing, request);
        validateVersion(process.getId(), existing, existing.getId());
        ProductProcessVersion saved = productProcessVersionRepository.save(existing);
        if (request != null && request.getOperationBindings() != null) {
            saveOperationBindings(saved, request.getOperationBindings());
        }
        Map<String, Object> after = versionSnapshot(saved);
        writeChangedAudit(saved.getId(), menuName(ownerType), "编辑制程配置版本", before, after);
        writeChangedOwnerConfigurationAudit(ownerType, ownerId, "编辑制程配置版本", before, after);
        return saved;
    }

    @Transactional
    public void deleteVersion(ProcessOwnerType ownerType, Long ownerId, Long versionId) {
        ProductProcess process = requireProcess(ownerType, ownerId);
        ProductProcessVersion existing = requireVersion(process.getId(), versionId);
        Map<String, Object> before = versionSnapshot(existing);
        deleteOperationBindings(existing.getId());
        productProcessVersionRepository.delete(existing);
        if (productProcessVersionRepository.findByProductProcessIdOrderByCreatedAtDesc(process.getId()).isEmpty()) {
            productProcessRepository.delete(process);
        }
        writeAudit(versionId, "DELETE", menuName(ownerType), "删除制程配置版本", before, Map.of());
        writeOwnerConfigurationAudit(ownerType, ownerId, "删除制程配置版本", before, Map.of());
    }

    public boolean hasProcessVersions(ProcessOwnerType ownerType, Long ownerId) {
        return processVersionCount(ownerType, ownerId) > 0;
    }

    public int processVersionCount(ProcessOwnerType ownerType, Long ownerId) {
        return findProcess(ownerType, ownerId)
                .map(process -> productProcessVersionRepository.findByProductProcessIdOrderByCreatedAtDesc(process.getId()).size())
                .orElse(0);
    }

    public List<ProductProcessOperationBinding> operationBindings(Long versionId) {
        return operationBindingRepository.findByProductProcessVersionIdOrderBySortOrderAsc(versionId);
    }

    private ProductProcess findOrCreateProcess(ProcessOwnerType ownerType, Long ownerId) {
        requireOwner(ownerType, ownerId);
        return findProcess(ownerType, ownerId).orElseGet(() -> productProcessRepository.save(ProductProcess.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .ownerType(ownerType.name())
                .ownerId(ownerId)
                .productVersionId(ownerType == ProcessOwnerType.PRODUCT ? ownerId : null)
                .createdBy(currentOperatorName())
                .createdAt(LocalDateTime.now())
                .updatedBy(currentOperatorName())
                .updatedAt(LocalDateTime.now())
                .build()));
    }

    private java.util.Optional<ProductProcess> findProcess(ProcessOwnerType ownerType, Long ownerId) {
        return productProcessRepository.findByTenantIdAndOwnerTypeAndOwnerId(TENANT_ID, ownerType.name(), ownerId);
    }

    private ProductProcess requireProcess(ProcessOwnerType ownerType, Long ownerId) {
        requireOwner(ownerType, ownerId);
        return findProcess(ownerType, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "该对象尚未建立制程配置版本"));
    }

    private ProductProcessVersion buildVersion(ProductProcess process, ProductProcessVersionRequest request, String fallbackVersion) {
        if (request == null) throw new BusinessException(ErrorCode.GENERAL_001, "制程配置版本信息不能为空");
        ProductProcessVersion version = ProductProcessVersion.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .productProcessId(process.getId())
                .versionLabel(hasText(request.getVersion()) ? request.getVersion().trim() : fallbackVersion)
                .productionMode(requireProductionMode(request.getProductionMode()))
                .productionForm(requireProductionForm(request.getProductionForm()))
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
        existing.setVersionLabel(requireText(request.getVersion(), "版本不能为空"));
        existing.setProductionMode(requireProductionMode(request.getProductionMode()));
        existing.setProductionForm(requireProductionForm(request.getProductionForm()));
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

    private void validateVersion(Long processId, ProductProcessVersion candidate, Long excludedId) {
        if (!hasText(candidate.getVersionLabel())) throw new BusinessException(ErrorCode.GENERAL_001, "版本不能为空");
        if (candidate.getEffectiveFrom() != null && candidate.getEffectiveTo() != null
                && candidate.getEffectiveTo().isBefore(candidate.getEffectiveFrom())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "失效时间不能早于生效时间");
        }
        boolean duplicate = productProcessVersionRepository
                .findByProductProcessIdAndVersionLabelIgnoreCase(processId, candidate.getVersionLabel().trim()).stream()
                .anyMatch(version -> !Objects.equals(version.getId(), excludedId));
        if (duplicate) throw new BusinessException(ErrorCode.GENERAL_001, "版本号已存在，请更换后重试");
    }

    private void saveOperationBindings(ProductProcessVersion version, List<ProductProcessVersionRequest.OperationBindingRequest> requests) {
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
            validateOperationReferences(version, request);
        }
        deleteOperationBindings(version.getId());
        List<ProductProcessOperationBinding> bindings = new ArrayList<>();
        for (ProductProcessVersionRequest.OperationBindingRequest request : safeRequests) {
            RouteNode node = nodes.get(request.getRouteNodeKey().trim());
            bindings.add(ProductProcessOperationBinding.builder()
                    .id(idGenerator.nextId()).productProcessVersionId(version.getId()).routeNodeKey(node.getNodeKey())
                    .operationId(node.getOperationId()).operationCode(node.getOperationCode())
                    .operationName(hasText(node.getOperationName()) ? node.getOperationName() : node.getNodeKey())
                    .sortOrder(request.getSortOrder() == null ? node.getSortOrder() : request.getSortOrder())
                    .createdAt(LocalDateTime.now()).build());
        }
        List<ProductProcessOperationBinding> saved = operationBindingRepository.saveAll(bindings);
        for (int index = 0; index < saved.size(); index++) {
            ProductProcessOperationBinding binding = saved.get(index);
            ProductProcessVersionRequest.OperationBindingRequest request = safeRequests.get(index);
            operationFormBindingRepository.saveAll((request.getForms() == null ? List.<ProductProcessVersionRequest.FormBindingRequest>of() : request.getForms()).stream()
                    .map(form -> ProductProcessOperationFormBinding.builder().id(idGenerator.nextId())
                            .productProcessOperationBindingId(binding.getId()).dhrTemplateItemId(form.getDhrTemplateItemId())
                            .formTemplateVersionId(form.getFormTemplateVersionId()).required(form.getRequired() == null || form.getRequired())
                            .sortOrder(form.getSortOrder() == null ? 0 : form.getSortOrder()).createdAt(LocalDateTime.now()).build())
                    .toList());
            operationDocumentBindingRepository.saveAll((request.getDocuments() == null ? List.<ProductProcessVersionRequest.DocumentBindingRequest>of() : request.getDocuments()).stream()
                    .map(document -> ProductProcessOperationDocumentBinding.builder().id(idGenerator.nextId())
                            .productProcessOperationBindingId(binding.getId()).documentVersionId(document.getDocumentVersionId())
                            .sortOrder(document.getSortOrder() == null ? 0 : document.getSortOrder())
                            .pageStart(document.getPageStart()).pageEnd(document.getPageEnd()).createdAt(LocalDateTime.now()).build())
                    .toList());
        }
    }

    private void validateOperationReferences(ProductProcessVersion processVersion, ProductProcessVersionRequest.OperationBindingRequest request) {
        List<ProductProcessVersionRequest.FormBindingRequest> forms = request.getForms() == null ? List.of() : request.getForms();
        for (ProductProcessVersionRequest.FormBindingRequest form : forms) {
            if (form == null || form.getFormTemplateVersionId() == null) {
                throw new BusinessException(ErrorCode.GENERAL_001, "工序引用的表单模板版本不存在");
            }
            DhrTemplateItem item = form.getDhrTemplateItemId() == null ? null : dhrTemplateItemRepository.findById(form.getDhrTemplateItemId()).orElse(null);
            if (item == null || !isDhrItemInVersion(item, processVersion.getDhrTemplateVersionId())
                    || !Objects.equals(item.getFormTemplateVersionId(), form.getFormTemplateVersionId())) {
                throw new BusinessException(ErrorCode.GENERAL_001, "工序引用的表单必须来自所选批记录模板版本目录");
            }
            FormTemplateVersion formVersion = formTemplateVersionRepository.findById(form.getFormTemplateVersionId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "工序引用的表单模板版本不存在"));
            if (!RdoVersionStatusResolver.isReferenceable(formVersion.getEffectiveFrom(), formVersion.getEffectiveTo())) {
                throw new BusinessException(ErrorCode.GENERAL_001, "工序仅能引用生效中的表单模板版本");
            }
        }
        if (forms.stream().map(ProductProcessVersionRequest.FormBindingRequest::getFormTemplateVersionId).distinct().count() != forms.size()) {
            throw new BusinessException(ErrorCode.GENERAL_001, "同一工序不能重复引用同一个表单模板版本");
        }
        List<ProductProcessVersionRequest.DocumentBindingRequest> documents = request.getDocuments() == null ? List.of() : request.getDocuments();
        if (documents.stream().map(document -> document == null ? null : document.getDocumentVersionId()).filter(Objects::nonNull).distinct().count() != documents.size()) {
            throw new BusinessException(ErrorCode.GENERAL_001, "同一工序不能重复引用同一个文档版本");
        }
        for (ProductProcessVersionRequest.DocumentBindingRequest document : documents) {
            if (document == null || document.getDocumentVersionId() == null) {
                throw new BusinessException(ErrorCode.MD_009, "工序引用的文档版本不存在");
            }
            DocumentVersion documentVersion = documentVersionRepository.findById(document.getDocumentVersionId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.MD_009, "工序引用的文档版本不存在"));
            boolean hasStart = document.getPageStart() != null;
            boolean hasEnd = document.getPageEnd() != null;
            if (!isPdfDocument(documentVersion) && (hasStart || hasEnd)) {
                throw new BusinessException(ErrorCode.GENERAL_001, "仅 PDF 文档支持配置展示页码范围");
            }
            if (isPdfDocument(documentVersion) && (hasStart != hasEnd || (hasStart && (document.getPageStart() < 1 || document.getPageEnd() < document.getPageStart())))) {
                throw new BusinessException(ErrorCode.GENERAL_001, "PDF 文档展示页码范围无效");
            }
        }
    }

    private List<ProductProcessVersionRequest.OperationBindingRequest> toOperationRequests(Long versionId) {
        OperationBindingData data = loadOperationBindingData(versionId);
        return data.bindings().stream().map(operation -> new ProductProcessVersionRequest.OperationBindingRequest(
                operation.getRouteNodeKey(), operation.getSortOrder(),
                data.forms().getOrDefault(operation.getId(), List.of()).stream()
                        .map(form -> new ProductProcessVersionRequest.FormBindingRequest(form.getDhrTemplateItemId(), form.getFormTemplateVersionId(), form.getRequired(), form.getSortOrder())).toList(),
                data.documents().getOrDefault(operation.getId(), List.of()).stream()
                        .map(document -> new ProductProcessVersionRequest.DocumentBindingRequest(document.getDocumentVersionId(), document.getSortOrder(), document.getPageStart(), document.getPageEnd())).toList()))
                .toList();
    }

    private boolean isDhrItemInVersion(DhrTemplateItem item, Long versionId) {
        return dhrDirectoryRepository.findById(item.getDirectoryId())
                .map(directory -> Objects.equals(directory.getVersionId(), versionId)).orElse(false);
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
        List<Long> bindingIds = operationBindingRepository.findByProductProcessVersionIdOrderBySortOrderAsc(versionId).stream()
                .map(ProductProcessOperationBinding::getId).toList();
        if (!bindingIds.isEmpty()) {
            operationFormBindingRepository.deleteByProductProcessOperationBindingIdIn(bindingIds);
            operationDocumentBindingRepository.deleteByProductProcessOperationBindingIdIn(bindingIds);
            operationFormBindingRepository.flush();
            operationDocumentBindingRepository.flush();
        }
        operationBindingRepository.deleteByProductProcessVersionId(versionId);
        operationBindingRepository.flush();
    }

    private ProductProcessVersion requireVersion(Long processId, Long versionId) {
        return productProcessVersionRepository.findByProductProcessIdAndId(processId, versionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "制程配置版本不存在"));
    }

    private ProcessOwner requireOwner(ProcessOwnerType ownerType, Long ownerId) {
        if (ownerType == null || ownerId == null) throw new BusinessException(ErrorCode.GENERAL_001, "制程配置归属不能为空");
        if (ownerType == ProcessOwnerType.PRODUCT) {
            Material material = materialRepository.findById(ownerId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.MD_003, "产品不存在"));
            String materialTypeName = materialTypeRepository.findAll().stream()
                    .filter(type -> Objects.equals(type.getId(), material.getMaterialTypeId()))
                    .map(MaterialType::getName).findFirst().orElse(null);
            if (!"产成品".equals(materialTypeName) && !"半成品".equals(materialTypeName)) {
                throw new BusinessException(ErrorCode.MD_003, "产品建模只能引用半成品或产成品物料");
            }
            return new ProcessOwner(ownerType, ownerId, material.getCode(), material.getName());
        }
        ProductFamily family = productFamilyRepository.findById(ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MD_001, "产品簇不存在"));
        return new ProcessOwner(ownerType, ownerId, family.getCode(), family.getName());
    }

    private boolean isPdfDocument(DocumentVersion version) {
        return version.getFileId() != null && fileObjectRepository.findById(version.getFileId())
                .map(file -> "application/pdf".equalsIgnoreCase(file.getMimeType())
                        || (file.getOriginalName() != null && file.getOriginalName().toLowerCase().endsWith(".pdf")))
                .orElse(false);
    }

    private Map<String, Object> versionSnapshot(ProductProcessVersion version) {
        OperationBindingData data = loadOperationBindingData(version.getId());
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("id", String.valueOf(version.getId()));
        snapshot.put("productProcessId", String.valueOf(version.getProductProcessId()));
        snapshot.put("version", version.getVersionLabel());
        snapshot.put("productionMode", version.getProductionMode());
        snapshot.put("productionForm", version.getProductionForm());
        snapshot.put("routeVersionId", String.valueOf(version.getRouteVersionId()));
        snapshot.put("dhrTemplateVersionId", String.valueOf(version.getDhrTemplateVersionId()));
        snapshot.put("description", version.getDescription());
        snapshot.put("effectiveFrom", version.getEffectiveFrom());
        snapshot.put("effectiveTo", version.getEffectiveTo());
        snapshot.put("status", auditStatusLabel(RdoVersionStatusResolver.resolve(version.getEffectiveFrom(), version.getEffectiveTo())));
        snapshot.put("operationBindings", data.bindings().stream().map(binding -> operationSnapshot(binding, data)).toList());
        return snapshot;
    }

    private Map<String, Object> operationSnapshot(ProductProcessOperationBinding operation, OperationBindingData data) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("operation", joinReference(operation.getOperationCode(), operation.getOperationName()));
        snapshot.put("forms", data.forms().getOrDefault(operation.getId(), List.of()).stream().map(form -> {
            String reference = "表单版本 #" + form.getFormTemplateVersionId();
            return Boolean.TRUE.equals(form.getRequired()) ? reference + "（工序结束前完成）" : reference;
        }).toList());
        snapshot.put("documents", data.documents().getOrDefault(operation.getId(), List.of()).stream()
                .map(document -> "文档版本 #" + document.getDocumentVersionId() + formatPageRange(document.getPageStart(), document.getPageEnd())).toList());
        return snapshot;
    }

    private void writeChangedAudit(Long entityId, String menuName, String functionName, Map<String, Object> before, Map<String, Object> after) {
        Map<String, Object> changedBefore = new LinkedHashMap<>();
        Map<String, Object> changedAfter = new LinkedHashMap<>();
        before.forEach((key, value) -> {
            if (!Objects.equals(value, after.get(key))) {
                changedBefore.put(key, value);
                changedAfter.put(key, after.get(key));
            }
        });
        if (!changedBefore.isEmpty()) writeAudit(entityId, "UPDATE", menuName, functionName, changedBefore, changedAfter);
    }

    private void writeAudit(Long entityId, String action, String menuName, String functionName, Map<String, Object> before, Map<String, Object> after) {
        auditEventRepository.save(AuditEvent.builder()
                .id(idGenerator.nextId()).tenantId(TENANT_ID).entityType("PRODUCT_PROCESS_VERSION").entityId(String.valueOf(entityId)).action(action)
                .contentBefore(toAuditJson(before)).contentAfter(toAuditJson(after))
                .operatorId(AuditContext.getOperatorId()).operatorName(AuditContext.getOperatorName()).operatorAccount(AuditContext.getOperatorAccount())
                .source(AuditContext.getSource()).moduleName("数据").menuName("工艺建模 · " + menuName).functionName(functionName)
                .dataSummary(menuName + " #" + entityId).ipAddress(AuditContext.getIpAddress()).createdAt(LocalDateTime.now()).build());
    }

    private void writeChangedOwnerConfigurationAudit(
            ProcessOwnerType ownerType,
            Long ownerId,
            String functionName,
            Map<String, Object> before,
            Map<String, Object> after) {
        if (ownerType != ProcessOwnerType.PRODUCT_FAMILY) return;
        if (!Objects.equals(before, after)) writeOwnerConfigurationAudit(ownerType, ownerId, functionName, before, after);
    }

    private void writeOwnerConfigurationAudit(
            ProcessOwnerType ownerType,
            Long ownerId,
            String functionName,
            Map<String, Object> before,
            Map<String, Object> after) {
        if (ownerType != ProcessOwnerType.PRODUCT_FAMILY) return;
        auditEventRepository.save(AuditEvent.builder()
                .id(idGenerator.nextId()).tenantId(TENANT_ID).entityType("PRODUCT_FAMILY").entityId(String.valueOf(ownerId)).action("UPDATE")
                .contentBefore(toAuditJson(Map.of("processVersion", before))).contentAfter(toAuditJson(Map.of("processVersion", after)))
                .operatorId(AuditContext.getOperatorId()).operatorName(AuditContext.getOperatorName()).operatorAccount(AuditContext.getOperatorAccount())
                .source(AuditContext.getSource()).moduleName("数据").menuName("工艺建模 · 产品簇").functionName(functionName)
                .dataSummary("产品簇 #" + ownerId).ipAddress(AuditContext.getIpAddress()).createdAt(LocalDateTime.now()).build());
    }

    private String nextVersionLabel(Long processId) {
        int next = productProcessVersionRepository.findByProductProcessIdOrderByCreatedAtDesc(processId).size() + 1;
        String label;
        do {
            label = "V" + next++ + ".0";
        } while (!productProcessVersionRepository.findByProductProcessIdAndVersionLabelIgnoreCase(processId, label).isEmpty());
        return label;
    }

    private String requireProductionMode(String value) {
        String mode = requireText(value, "生产模式不能为空");
        if (!PRODUCTION_MODES.contains(mode)) throw new BusinessException(ErrorCode.GENERAL_001, "生产模式仅支持量产、返工或翻新");
        return mode;
    }

    private String requireProductionForm(String value) {
        String form = requireText(value, "生产形态不能为空");
        if (!PRODUCTION_FORMS.contains(form)) throw new BusinessException(ErrorCode.GENERAL_001, "生产形态仅支持SN、批次或批次转SN");
        return form;
    }

    private Long requireId(Long value, String message) {
        if (value == null) throw new BusinessException(ErrorCode.GENERAL_001, message);
        return value;
    }

    private String requireText(String value, String message) {
        if (!hasText(value)) throw new BusinessException(ErrorCode.GENERAL_001, message);
        return value.trim();
    }

    private String trimToNull(String value) {
        return hasText(value) ? value.trim() : null;
    }

    private String menuName(ProcessOwnerType ownerType) {
        return ownerType == ProcessOwnerType.PRODUCT ? "产品管理" : "产品簇";
    }

    private String currentOperatorName() {
        if (StringUtils.hasText(AuditContext.getOperatorName())) return AuditContext.getOperatorName();
        if (StringUtils.hasText(AuditContext.getOperatorAccount())) return AuditContext.getOperatorAccount();
        return "系统管理员";
    }

    private String auditStatusLabel(String status) {
        return RdoVersionStatusResolver.ACTIVE.equals(status) ? "生效" : "失效";
    }

    private String formatPageRange(Integer pageStart, Integer pageEnd) {
        return pageStart == null && pageEnd == null ? "" : "（展示第" + pageStart + "页至第" + pageEnd + "页）";
    }

    private String joinReference(String... parts) {
        return java.util.Arrays.stream(parts).filter(this::hasText).collect(Collectors.joining(" / "));
    }

    private String toAuditJson(Map<String, Object> content) {
        try {
            return AUDIT_OBJECT_MAPPER.writeValueAsString(content);
        } catch (JsonProcessingException exception) {
            throw new BusinessException(ErrorCode.GENERAL_001, "审计内容序列化失败");
        }
    }

    private boolean hasText(String value) {
        return StringUtils.hasText(value);
    }

    private record OperationBindingData(
            List<ProductProcessOperationBinding> bindings,
            Map<Long, List<ProductProcessOperationFormBinding>> forms,
            Map<Long, List<ProductProcessOperationDocumentBinding>> documents) {
    }

    public record ProcessOwner(ProcessOwnerType type, Long id, String code, String name) {
    }

    public record ProcessOwnerWorkspace(ProcessOwner owner, ProductProcess process, List<ProductProcessVersion> versions) {
    }
}
