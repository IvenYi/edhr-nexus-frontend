package com.zencas.edhr.masterdata.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.masterdata.entity.Material;
import com.zencas.edhr.masterdata.entity.MaterialType;
import com.zencas.edhr.masterdata.entity.ProductFamily;
import com.zencas.edhr.masterdata.entity.ProductFamilyMember;
import com.zencas.edhr.masterdata.dto.ProductFamilyMemberResponse;
import com.zencas.edhr.masterdata.repository.MaterialRepository;
import com.zencas.edhr.masterdata.repository.MaterialTypeRepository;
import com.zencas.edhr.masterdata.repository.ProductFamilyMemberRepository;
import com.zencas.edhr.masterdata.repository.ProductFamilyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductFamilyMembershipService {

    private static final String TENANT_ID = "default";
    private static final String PRODUCT_TYPE_FINISHED = "产成品";
    private static final String PRODUCT_TYPE_SEMI_FINISHED = "半成品";
    private static final ObjectMapper AUDIT_OBJECT_MAPPER = new ObjectMapper();

    private final ProductFamilyRepository productFamilyRepository;
    private final ProductFamilyMemberRepository productFamilyMemberRepository;
    private final MaterialRepository materialRepository;
    private final MaterialTypeRepository materialTypeRepository;
    private final AuditEventRepository auditEventRepository;
    private final SnowflakeIdGenerator idGenerator;

    @Transactional
    public List<ProductFamilyMember> addMembers(Long productFamilyId, List<Long> productIds) {
        ProductFamily family = requireFamily(productFamilyId);
        List<Material> products = resolveEligibleProducts(productIds);
        List<ProductFamilyMember> added = new ArrayList<>();

        for (Material product : products) {
            ProductFamilyMember existing = productFamilyMemberRepository
                    .findByTenantIdAndProductId(TENANT_ID, product.getId())
                    .orElse(null);
            if (existing == null) continue;
            if (existing.getProductFamilyId().equals(family.getId())) continue;
            ProductFamily existingFamily = requireFamily(existing.getProductFamilyId());
            throw new BusinessException(ErrorCode.GENERAL_001,
                    "产品“" + product.getName() + "”已属于产品簇“" + existingFamily.getName() + "”，请使用转移操作");
        }

        for (Material product : products) {
            if (productFamilyMemberRepository.findByTenantIdAndProductId(TENANT_ID, product.getId()).isPresent()) continue;
            ProductFamilyMember member = ProductFamilyMember.builder()
                    .id(idGenerator.nextId())
                    .tenantId(TENANT_ID)
                    .productFamilyId(family.getId())
                    .productId(product.getId())
                    .createdBy(currentOperatorName())
                    .updatedBy(currentOperatorName())
                    .build();
            ProductFamilyMember saved = productFamilyMemberRepository.save(member);
            writeMembershipAudits(product, null, family, "新增产品簇成员");
            added.add(saved);
        }
        return added;
    }

    @Transactional
    public ProductFamilyMember transferMember(Long targetProductFamilyId, Long productId) {
        ProductFamily targetFamily = requireFamily(targetProductFamilyId);
        Material product = requireEligibleProduct(productId);
        ProductFamilyMember existing = productFamilyMemberRepository.findByTenantIdAndProductId(TENANT_ID, productId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "产品当前未归属任何产品簇"));
        if (existing.getProductFamilyId().equals(targetFamily.getId())) return existing;

        ProductFamily sourceFamily = requireFamily(existing.getProductFamilyId());
        productFamilyMemberRepository.delete(existing);
        ProductFamilyMember transferred = productFamilyMemberRepository.save(ProductFamilyMember.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .productFamilyId(targetFamily.getId())
                .productId(product.getId())
                .createdBy(currentOperatorName())
                .updatedBy(currentOperatorName())
                .build());
        writeMembershipAudits(product, sourceFamily, targetFamily, "编辑产品簇成员");
        return transferred;
    }

    @Transactional
    public void removeMember(Long productFamilyId, Long productId) {
        ProductFamily family = requireFamily(productFamilyId);
        ProductFamilyMember member = productFamilyMemberRepository.findByTenantIdAndProductId(TENANT_ID, productId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "产品不属于当前产品簇"));
        if (!member.getProductFamilyId().equals(family.getId())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "产品不属于当前产品簇");
        }
        Material product = materialRepository.findById(productId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MD_002));
        productFamilyMemberRepository.delete(member);
        writeMembershipAudits(product, family, null, "编辑产品簇成员");
    }

    @Transactional(readOnly = true)
    public List<ProductFamilyMember> listMembers(Long productFamilyId) {
        requireFamily(productFamilyId);
        return productFamilyMemberRepository.findByTenantIdAndProductFamilyIdOrderByCreatedAtDesc(TENANT_ID, productFamilyId);
    }

    @Transactional(readOnly = true)
    public List<ProductFamilyMemberResponse> listMemberOptions(Long productFamilyId) {
        requireFamily(productFamilyId);
        Map<Long, String> materialTypeNames = materialTypeRepository.findAll().stream()
                .collect(java.util.stream.Collectors.toMap(MaterialType::getId, MaterialType::getName, (left, right) -> left, LinkedHashMap::new));
        List<Material> products = materialRepository.findAll().stream()
                .filter(product -> isEligibleMaterialType(materialTypeNames.get(product.getMaterialTypeId())))
                .toList();
        List<Long> productIds = products.stream().map(Material::getId).toList();
        if (productIds.isEmpty()) return List.of();
        Map<Long, ProductFamilyMember> membershipsByProductId = productFamilyMemberRepository
                .findByTenantIdAndProductIdIn(TENANT_ID, productIds).stream()
                .collect(java.util.stream.Collectors.toMap(ProductFamilyMember::getProductId, member -> member));
        List<Long> familyIds = membershipsByProductId.values().stream()
                .map(ProductFamilyMember::getProductFamilyId)
                .distinct()
                .toList();
        Map<Long, ProductFamily> familiesById = new HashMap<>();
        productFamilyRepository.findAllById(familyIds).forEach(family -> familiesById.put(family.getId(), family));

        return products.stream().map(product -> {
            ProductFamilyMember membership = membershipsByProductId.get(product.getId());
            ProductFamily family = membership == null ? null : familiesById.get(membership.getProductFamilyId());
            return new ProductFamilyMemberResponse(
                    membership == null ? null : String.valueOf(membership.getId()),
                    String.valueOf(product.getId()),
                    product.getCode(),
                    product.getName(),
                    materialTypeNames.get(product.getMaterialTypeId()),
                    membership == null ? null : String.valueOf(membership.getProductFamilyId()),
                    family == null ? null : family.getName(),
                    membership != null && productFamilyId.equals(membership.getProductFamilyId()));
        }).toList();
    }

    public long countMembers(Long productFamilyId) {
        return productFamilyMemberRepository.countByTenantIdAndProductFamilyId(TENANT_ID, productFamilyId);
    }

    private ProductFamily requireFamily(Long productFamilyId) {
        return productFamilyRepository.findById(productFamilyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MD_001));
    }

    private List<Material> resolveEligibleProducts(List<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            throw new BusinessException(ErrorCode.GENERAL_001, "请至少选择一个产品");
        }
        LinkedHashSet<Long> distinctIds = new LinkedHashSet<>(productIds);
        if (distinctIds.contains(null)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "产品标识不能为空");
        }
        return distinctIds.stream().map(this::requireEligibleProduct).toList();
    }

    private Material requireEligibleProduct(Long productId) {
        Material product = materialRepository.findById(productId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MD_002));
        MaterialType materialType = product.getMaterialTypeId() == null ? null : materialTypeRepository.findById(product.getMaterialTypeId()).orElse(null);
        String typeName = materialType == null ? null : materialType.getName();
        if (!isEligibleMaterialType(typeName)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "产品簇成员只能添加半成品或产成品物料");
        }
        return product;
    }

    private boolean isEligibleMaterialType(String typeName) {
        return PRODUCT_TYPE_FINISHED.equals(typeName) || PRODUCT_TYPE_SEMI_FINISHED.equals(typeName);
    }

    private void writeMembershipAudits(Material product, ProductFamily beforeFamily, ProductFamily afterFamily, String functionName) {
        writeAudit("PRODUCT", product.getId(), "产品管理", functionName,
                productMembershipSnapshot(product, beforeFamily), productMembershipSnapshot(product, afterFamily));
        if (beforeFamily != null) {
            writeAudit("PRODUCT_FAMILY", beforeFamily.getId(), "产品簇", functionName,
                    familyMembershipSnapshot(product), Map.of());
        }
        if (afterFamily != null) {
            writeAudit("PRODUCT_FAMILY", afterFamily.getId(), "产品簇", functionName,
                    Map.of(), familyMembershipSnapshot(product));
        }
    }

    private Map<String, Object> productMembershipSnapshot(Material product, ProductFamily family) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("productCode", product.getCode());
        snapshot.put("productName", product.getName());
        snapshot.put("productFamilyId", family == null ? null : family.getId());
        snapshot.put("productFamilyName", family == null ? null : family.getName());
        return snapshot;
    }

    private Map<String, Object> familyMembershipSnapshot(Material product) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("memberProductId", product.getId());
        snapshot.put("memberProductCode", product.getCode());
        snapshot.put("memberProductName", product.getName());
        return snapshot;
    }

    private void writeAudit(
            String entityType,
            Long entityId,
            String menuName,
            String functionName,
            Map<String, Object> before,
            Map<String, Object> after) {
        auditEventRepository.save(AuditEvent.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .entityType(entityType)
                .entityId(String.valueOf(entityId))
                .action("UPDATE")
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
        } catch (JsonProcessingException exception) {
            throw new BusinessException(ErrorCode.GENERAL_001, "审计内容序列化失败");
        }
    }

    private String currentOperatorName() {
        if (StringUtils.hasText(AuditContext.getOperatorName())) return AuditContext.getOperatorName();
        if (StringUtils.hasText(AuditContext.getOperatorAccount())) return AuditContext.getOperatorAccount();
        return "系统管理员";
    }
}
