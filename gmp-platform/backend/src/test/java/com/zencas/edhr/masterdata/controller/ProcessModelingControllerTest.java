package com.zencas.edhr.masterdata.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.masterdata.dto.ProcessModelingRequest;
import com.zencas.edhr.masterdata.dto.RouteGraphRequest;
import com.zencas.edhr.masterdata.entity.Route;
import com.zencas.edhr.masterdata.entity.RouteNode;
import com.zencas.edhr.masterdata.entity.RouteRelation;
import com.zencas.edhr.masterdata.entity.RouteVersion;
import com.zencas.edhr.masterdata.entity.Material;
import com.zencas.edhr.masterdata.entity.MaterialType;
import com.zencas.edhr.masterdata.entity.Operation;
import com.zencas.edhr.masterdata.entity.OperationCategory;
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
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.inOrder;

@ExtendWith(MockitoExtension.class)
class ProcessModelingControllerTest {

    @Mock private MaterialTypeRepository materialTypeRepository;
    @Mock private MaterialRepository materialRepository;
    @Mock private ProductRepository productRepository;
    @Mock private ProductFamilyRepository productFamilyRepository;
    @Mock private OperationCategoryRepository operationCategoryRepository;
    @Mock private OperationRepository operationRepository;
    @Mock private RouteRepository routeRepository;
    @Mock private RouteVersionRepository routeVersionRepository;
    @Mock private RouteNodeRepository routeNodeRepository;
    @Mock private RouteRelationRepository routeRelationRepository;
    @Mock private SopDocumentRepository sopDocumentRepository;
    @Mock private AuditEventRepository auditEventRepository;
    @Mock private SnowflakeIdGenerator idGenerator;
    @InjectMocks private ProcessModelingController controller;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @AfterEach
    void clearAuditContext() {
        AuditContext.clear();
    }

    @Test
    void doesNotExposeMaterialTypeCrudEndpoints() {
        List<String> mappings = Arrays.stream(ProcessModelingController.class.getDeclaredMethods())
                .flatMap(this::mappingValues)
                .toList();

        assertThat(mappings).doesNotContain("/material-types", "/material-types/{id}");
    }

    @Test
    void operationCategoryResponsesUseStringIdsToAvoidBrowserPrecisionLoss() {
        OperationCategory category = OperationCategory.builder()
                .id(344346908514107392L)
                .tenantId("default")
                .name("关键工序")
                .build();
        when(operationRepository.findAll()).thenReturn(List.of());
        when(operationCategoryRepository.findByTenantIdOrderBySortOrderAscNameAsc("default")).thenReturn(List.of(category));

        var response = controller.listOperationCategories();

        assertThat(response.getData())
                .extracting(ProcessModelingController.OperationCategoryResponse::id)
                .contains("344346908514107392");
    }

    @Test
    void operationJsonSerializesIdAsStringToAvoidBrowserPrecisionLoss() throws Exception {
        Operation operation = Operation.builder()
                .id(344346908514107392L)
                .tenantId("default")
                .code("OP-001")
                .name("清洗")
                .build();

        var json = objectMapper.readTree(objectMapper.writeValueAsString(operation));

        assertThat(json.get("id").isTextual()).isTrue();
        assertThat(json.get("id").asText()).isEqualTo("344346908514107392");
    }

    @Test
    void operationCategoryResponsesIncludeAllAndUncategorizedCounts() {
        Operation categorized = Operation.builder().id(1L).tenantId("default").code("OP-001").name("清洗").operationCategory("关键工序").build();
        Operation uncategorized = Operation.builder().id(2L).tenantId("default").code("OP-002").name("清洗").build();
        Operation blankCategory = Operation.builder().id(3L).tenantId("default").code("OP-003").name("清洗").operationCategory(" ").build();
        OperationCategory category = OperationCategory.builder()
                .id(344346908514107392L)
                .tenantId("default")
                .name("关键工序")
                .build();
        when(operationRepository.findAll()).thenReturn(List.of(categorized, uncategorized, blankCategory));
        when(operationCategoryRepository.findByTenantIdOrderBySortOrderAscNameAsc("default")).thenReturn(List.of(category));

        var response = controller.listOperationCategories();

        assertThat(response.getData())
                .extracting(ProcessModelingController.OperationCategoryResponse::id)
                .containsExactly("ALL", "UNCATEGORIZED", "344346908514107392");
        assertThat(response.getData())
                .extracting(ProcessModelingController.OperationCategoryResponse::name)
                .containsExactly("全部", "未分类", "关键工序");
        assertThat(response.getData())
                .extracting(ProcessModelingController.OperationCategoryResponse::count)
                .containsExactly(3L, 2L, 1L);
    }

    @Test
    void operationCategoryResponsesFollowPersistedSortOrder() {
        OperationCategory first = OperationCategory.builder()
                .id(11L)
                .tenantId("default")
                .name("包装")
                .sortOrder(20)
                .build();
        OperationCategory second = OperationCategory.builder()
                .id(22L)
                .tenantId("default")
                .name("清洗")
                .sortOrder(10)
                .build();
        when(operationRepository.findAll()).thenReturn(List.of());
        when(operationCategoryRepository.findByTenantIdOrderBySortOrderAscNameAsc("default")).thenReturn(List.of(second, first));

        var response = controller.listOperationCategories();

        assertThat(response.getData())
                .extracting(ProcessModelingController.OperationCategoryResponse::id)
                .containsExactly("ALL", "UNCATEGORIZED", "22", "11");
        assertThat(response.getData())
                .extracting(ProcessModelingController.OperationCategoryResponse::sortOrder)
                .containsExactly(0, 1, 10, 20);
    }

    @Test
    void reorderOperationCategoriesPersistsSortOrder() {
        OperationCategory first = OperationCategory.builder()
                .id(11L)
                .tenantId("default")
                .name("包装")
                .sortOrder(10)
                .build();
        OperationCategory second = OperationCategory.builder()
                .id(22L)
                .tenantId("default")
                .name("清洗")
                .sortOrder(20)
                .build();
        when(operationCategoryRepository.findByTenantIdOrderBySortOrderAscNameAsc("default")).thenReturn(List.of(first, second));
        when(operationRepository.findAll()).thenReturn(List.of());
        when(operationCategoryRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.reorderOperationCategories(
                new ProcessModelingController.OperationCategoryOrderRequest(List.of("22", "11")));

        assertThat(first.getSortOrder()).isEqualTo(20);
        assertThat(second.getSortOrder()).isEqualTo(10);
        assertThat(response.getData())
                .extracting(ProcessModelingController.OperationCategoryResponse::id)
                .containsExactly("ALL", "UNCATEGORIZED", "22", "11");
    }

    @Test
    void createOperationWritesCreateAuditForDrawerAuditTab() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        when(operationRepository.findByTenantIdAndCodeIgnoreCase("default", "OP-001")).thenReturn(List.of());
        when(operationRepository.save(any(Operation.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(344346908514107392L, 10002L);

        var response = controller.createOperation(ProcessModelingRequest.builder()
                .name("清洗")
                .code("OP-001")
                .defaultOperationType("普通工序")
                .build());

        assertThat(response.getData().getId()).isEqualTo(344346908514107392L);
        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        AuditEvent event = auditCaptor.getValue();
        assertThat(event.getEntityType()).isEqualTo("OPERATION");
        assertThat(event.getEntityId()).isEqualTo("344346908514107392");
        assertThat(event.getAction()).isEqualTo("CREATE");
        assertThat(event.getMenuName()).isEqualTo("工艺建模 · 工序管理");
        assertThat(objectMapper.readTree(event.getContentAfter()).get("code").asText()).isEqualTo("OP-001");
    }

    @Test
    void deletingOperationCategoryWritesUpdateAuditForAffectedOperations() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        OperationCategory category = OperationCategory.builder()
                .id(344346908514107392L)
                .tenantId("default")
                .name("包装类")
                .createdBy("系统管理员")
                .createdAt(LocalDateTime.of(2026, 6, 1, 9, 0))
                .updatedBy("系统管理员")
                .updatedAt(LocalDateTime.of(2026, 6, 1, 9, 0))
                .build();
        Operation operation = Operation.builder()
                .id(344346908514107393L)
                .tenantId("default")
                .code("OP-PACK")
                .name("包装")
                .operationCategory("包装类")
                .defaultOperationType("普通工序")
                .status("ACTIVE")
                .createdBy("系统管理员")
                .createdAt(LocalDateTime.of(2026, 6, 1, 9, 0))
                .updatedBy("系统管理员")
                .updatedAt(LocalDateTime.of(2026, 6, 1, 9, 0))
                .build();
        when(operationCategoryRepository.findById(344346908514107392L)).thenReturn(Optional.of(category));
        when(operationRepository.findAll()).thenReturn(List.of(operation));
        when(operationRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(2001L, 2002L);

        controller.deleteOperationCategory(344346908514107392L);

        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository, org.mockito.Mockito.times(2)).save(auditCaptor.capture());
        List<AuditEvent> events = auditCaptor.getAllValues();
        AuditEvent operationAudit = events.stream()
                .filter(event -> "OPERATION".equals(event.getEntityType()))
                .findFirst()
                .orElseThrow();
        assertThat(operationAudit.getAction()).isEqualTo("UPDATE");
        assertThat(operationAudit.getEntityId()).isEqualTo("344346908514107393");
        assertThat(operationAudit.getFunctionName()).isEqualTo("删除工序分类后自动转为未分类");
        assertThat(objectMapper.readTree(operationAudit.getContentBefore()).get("operationCategory").asText()).isEqualTo("包装类");
        assertThat(objectMapper.readTree(operationAudit.getContentAfter()).get("operationCategory").isNull()).isTrue();
    }

    @Test
    void updatesMaterialWithOnlyChangedFieldsInAudit() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        Material existing = Material.builder()
                .id(11L)
                .tenantId("default")
                .code("MAT-00011")
                .name("旧物料")
                .specification("A1")
                .materialTypeId(3L)
                .unit("pcs")
                .status("ACTIVE")
                .createdBy("张三")
                .createdAt(LocalDateTime.of(2026, 6, 1, 9, 0))
                .updatedBy("张三")
                .updatedAt(LocalDateTime.of(2026, 6, 1, 9, 0))
                .build();
        when(materialRepository.findById(11L)).thenReturn(Optional.of(existing));
        when(materialRepository.save(existing)).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(10002L);

        var response = controller.updateMaterial(11L, ProcessModelingRequest.builder()
                .name("新物料")
                .specification("A1")
                .materialTypeId(3L)
                .unit("pcs")
                .status("ACTIVE")
                .build());

        assertThat(response.getData().getName()).isEqualTo("新物料");
        assertThat(response.getData().getUpdatedBy()).isEqualTo("系统管理员");

        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        AuditEvent event = auditCaptor.getValue();
        assertThat(event.getEntityType()).isEqualTo("MATERIAL");
        assertThat(event.getAction()).isEqualTo("UPDATE");
        assertThat(event.getMenuName()).isEqualTo("工艺建模 · 物料管理");
        assertThat(objectMapper.readTree(event.getContentBefore()).fieldNames()).toIterable().containsExactly("name");
        assertThat(objectMapper.readTree(event.getContentAfter()).fieldNames()).toIterable().containsExactly("name");
        assertThat(objectMapper.readTree(event.getContentBefore()).get("name").asText()).isEqualTo("旧物料");
        assertThat(objectMapper.readTree(event.getContentAfter()).get("name").asText()).isEqualTo("新物料");
    }

    @Test
    void updatesMaterialBaseFieldsWithoutResettingVersionDates() {
        Material existing = Material.builder()
                .id(13L)
                .tenantId("default")
                .code("RM-BASE-001")
                .name("旧物料")
                .specification("A1")
                .materialTypeId(3L)
                .unit("pcs")
                .version("V2.0")
                .materialPurpose("生产物料")
                .effectiveDate(LocalDateTime.of(2026, 6, 18, 10, 0))
                .expiryDate(LocalDateTime.of(2026, 6, 30, 18, 0))
                .description("旧版本说明")
                .status("ACTIVE")
                .createdBy("张三")
                .createdAt(LocalDateTime.of(2026, 6, 1, 9, 0))
                .updatedBy("张三")
                .updatedAt(LocalDateTime.of(2026, 6, 1, 9, 0))
                .build();
        when(materialRepository.findById(13L)).thenReturn(Optional.of(existing));
        when(materialRepository.save(existing)).thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.updateMaterial(13L, ProcessModelingRequest.builder()
                .name("新物料")
                .code("RM-BASE-001")
                .specification("A2")
                .unit("kg")
                .materialPurpose("试验物料")
                .build());

        assertThat(response.getData().getName()).isEqualTo("新物料");
        assertThat(response.getData().getSpecification()).isEqualTo("A2");
        assertThat(response.getData().getUnit()).isEqualTo("kg");
        assertThat(response.getData().getMaterialPurpose()).isEqualTo("试验物料");
        assertThat(response.getData().getVersion()).isEqualTo("V2.0");
        assertThat(response.getData().getEffectiveDate()).isEqualTo(LocalDateTime.of(2026, 6, 18, 10, 0));
        assertThat(response.getData().getExpiryDate()).isEqualTo(LocalDateTime.of(2026, 6, 30, 18, 0));
        assertThat(response.getData().getDescription()).isEqualTo("旧版本说明");
    }

    @Test
    void updatesMaterialBaseFieldsAcrossAllVersionsInSameMaterialGroup() {
        AuditContext.setOperator("99", "系统管理员", "admin");
        Material v1 = Material.builder()
                .id(131L)
                .tenantId("default")
                .code("RM-GROUP-001")
                .name("旧物料")
                .specification("A1")
                .materialTypeId(3L)
                .unit("pcs")
                .version("V1.0")
                .materialPurpose("生产物料")
                .effectiveDate(LocalDateTime.of(2026, 6, 1, 0, 0))
                .expiryDate(LocalDateTime.of(2026, 6, 10, 0, 0))
                .description("V1说明")
                .createdBy("张三")
                .createdAt(LocalDateTime.of(2026, 6, 1, 9, 0))
                .updatedBy("张三")
                .updatedAt(LocalDateTime.of(2026, 6, 1, 9, 0))
                .build();
        Material v2 = Material.builder()
                .id(132L)
                .tenantId("default")
                .code("RM-GROUP-001")
                .name("旧物料")
                .specification("A1")
                .materialTypeId(3L)
                .unit("pcs")
                .version("V2.0")
                .materialPurpose("生产物料")
                .effectiveDate(LocalDateTime.of(2026, 6, 11, 0, 0))
                .description("V2说明")
                .createdBy("张三")
                .createdAt(LocalDateTime.of(2026, 6, 2, 9, 0))
                .updatedBy("张三")
                .updatedAt(LocalDateTime.of(2026, 6, 2, 9, 0))
                .build();
        when(materialRepository.findById(132L)).thenReturn(Optional.of(v2));
        when(materialRepository.findByTenantIdAndCodeIgnoreCase("default", "RM-GROUP-002"))
                .thenReturn(List.of());
        when(materialRepository.findByTenantIdAndCodeIgnoreCase("default", "RM-GROUP-001"))
                .thenReturn(List.of(v1, v2));
        when(materialRepository.save(any(Material.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.updateMaterial(132L, ProcessModelingRequest.builder()
                .name("新物料")
                .code("RM-GROUP-002")
                .specification("A2")
                .materialTypeId(5L)
                .unit("kg")
                .materialPurpose("试验物料")
                .build());

        assertThat(response.getData().getId()).isEqualTo(132L);
        assertThat(List.of(v1, v2)).allSatisfy(material -> {
            assertThat(material.getName()).isEqualTo("新物料");
            assertThat(material.getCode()).isEqualTo("RM-GROUP-002");
            assertThat(material.getSpecification()).isEqualTo("A2");
            assertThat(material.getMaterialTypeId()).isEqualTo(5L);
            assertThat(material.getUnit()).isEqualTo("kg");
            assertThat(material.getMaterialPurpose()).isEqualTo("试验物料");
        });
        assertThat(v1.getVersion()).isEqualTo("V1.0");
        assertThat(v1.getEffectiveDate()).isEqualTo(LocalDateTime.of(2026, 6, 1, 0, 0));
        assertThat(v1.getExpiryDate()).isEqualTo(LocalDateTime.of(2026, 6, 10, 0, 0));
        assertThat(v1.getDescription()).isEqualTo("V1说明");
        assertThat(v2.getVersion()).isEqualTo("V2.0");
        assertThat(v2.getEffectiveDate()).isEqualTo(LocalDateTime.of(2026, 6, 11, 0, 0));
        assertThat(v2.getDescription()).isEqualTo("V2说明");
    }

    @Test
    void listsMaterialsWithSplitNameCodeAndTypeFilters() {
        MaterialType raw = MaterialType.builder()
                .id(61L)
                .code("MT-RAW")
                .name("原材料")
                .status("ACTIVE")
                .build();
        MaterialType semiFinished = MaterialType.builder()
                .id(62L)
                .code("MT-SEMI")
                .name("半成品")
                .status("ACTIVE")
                .build();
        Material matched = Material.builder()
                .id(31L)
                .code("RM-RESIN-001")
                .name("医用级树脂")
                .specification("25kg/袋")
                .version("V1.0")
                .materialTypeId(61L)
                .unit("kg")
                .status("ACTIVE")
                .createdAt(LocalDateTime.of(2026, 6, 10, 12, 30))
                .build();
        Material differentCode = Material.builder()
                .id(32L)
                .code("RM-RESIN-002")
                .name("医用级树脂")
                .version("V1.0")
                .materialTypeId(61L)
                .status("ACTIVE")
                .createdAt(LocalDateTime.of(2026, 6, 9, 12, 30))
                .build();
        Material differentType = Material.builder()
                .id(33L)
                .code("RM-RESIN-001")
                .name("医用级树脂")
                .version("V1.0")
                .materialTypeId(62L)
                .status("ACTIVE")
                .createdAt(LocalDateTime.of(2026, 6, 8, 12, 30))
                .build();
        when(materialTypeRepository.findAll()).thenReturn(List.of(raw, semiFinished));
        when(materialRepository.findAll()).thenReturn(List.of(matched, differentCode, differentType));

        var response = controller.listMaterials(null, "医用", "001", "原材料", "ACTIVE", 1, 20, "createdAt", "desc");

        assertThat(response.getData().getContent()).hasSize(1);
        assertThat(response.getData().getContent().getFirst().getCode()).isEqualTo("RM-RESIN-001");
        assertThat(response.getData().getContent().getFirst().getMaterialTypeName()).isEqualTo("原材料");
    }

    @Test
    void listsDerivedProductsWithKeywordStatusAndSystemMetadata() {
        MaterialType semiFinished = MaterialType.builder()
                .id(61L)
                .code("MT-00061")
                .name("半成品")
                .status("ACTIVE")
                .createdBy("系统管理员")
                .createdAt(LocalDateTime.of(2026, 6, 10, 11, 0))
                .updatedBy("系统管理员")
                .updatedAt(LocalDateTime.of(2026, 6, 10, 11, 0))
                .build();
        MaterialType raw = MaterialType.builder()
                .id(62L)
                .code("MT-00062")
                .name("原材料")
                .status("ACTIVE")
                .createdBy("系统管理员")
                .createdAt(LocalDateTime.of(2026, 6, 10, 11, 0))
                .updatedBy("系统管理员")
                .updatedAt(LocalDateTime.of(2026, 6, 10, 11, 0))
                .build();
        Material derivedProduct = Material.builder()
                .id(31L)
                .code("MAT-00031")
                .name("测试半成品")
                .specification("V1")
                .materialTypeId(61L)
                .unit("pcs")
                .status("ACTIVE")
                .createdBy("系统管理员")
                .createdAt(LocalDateTime.of(2026, 6, 10, 12, 30))
                .updatedBy("系统管理员")
                .updatedAt(LocalDateTime.of(2026, 6, 10, 12, 30))
                .build();
        Material filteredOut = Material.builder()
                .id(32L)
                .code("MAT-00032")
                .name("原材料B")
                .materialTypeId(62L)
                .unit("kg")
                .status("ACTIVE")
                .createdBy("系统管理员")
                .createdAt(LocalDateTime.of(2026, 6, 10, 12, 30))
                .updatedBy("系统管理员")
                .updatedAt(LocalDateTime.of(2026, 6, 10, 12, 30))
                .build();
        when(materialTypeRepository.findAll()).thenReturn(List.of(semiFinished, raw));
        when(materialRepository.findAll()).thenReturn(List.of(derivedProduct, filteredOut));

        var response = controller.listProducts("测试", "ACTIVE", 1, 20, "createdAt", "desc");

        assertThat(response.getData().getContent()).hasSize(1);
        assertThat(response.getData().getContent().getFirst().getCode()).isEqualTo("MAT-00031");
        assertThat(response.getData().getContent().getFirst().getCreatedBy()).isEqualTo("系统管理员");
        assertThat(response.getData().getContent().getFirst().getUpdatedAt()).isEqualTo(LocalDateTime.of(2026, 6, 10, 12, 30));
    }

    @Test
    void listsDerivedProductsFromMaterialsWithSemiFinishedOrFinishedType() {
        MaterialType semiFinished = MaterialType.builder()
                .id(41L)
                .code("MT-00041")
                .name("半成品")
                .status("ACTIVE")
                .createdBy("系统管理员")
                .createdAt(LocalDateTime.of(2026, 6, 1, 8, 0))
                .updatedBy("系统管理员")
                .updatedAt(LocalDateTime.of(2026, 6, 1, 8, 0))
                .build();
        MaterialType raw = MaterialType.builder()
                .id(42L)
                .code("MT-00042")
                .name("原材料")
                .status("ACTIVE")
                .createdBy("系统管理员")
                .createdAt(LocalDateTime.of(2026, 6, 1, 8, 0))
                .updatedBy("系统管理员")
                .updatedAt(LocalDateTime.of(2026, 6, 1, 8, 0))
                .build();
        Material semiFinishedMaterial = Material.builder()
                .id(51L)
                .code("MAT-00051")
                .name("半成品A")
                .materialTypeId(41L)
                .specification("S1")
                .unit("pcs")
                .status("ACTIVE")
                .createdBy("系统管理员")
                .createdAt(LocalDateTime.of(2026, 6, 10, 10, 0))
                .updatedBy("系统管理员")
                .updatedAt(LocalDateTime.of(2026, 6, 10, 10, 0))
                .build();
        Material rawMaterial = Material.builder()
                .id(52L)
                .code("MAT-00052")
                .name("原材料B")
                .materialTypeId(42L)
                .specification("R1")
                .unit("kg")
                .status("ACTIVE")
                .createdBy("系统管理员")
                .createdAt(LocalDateTime.of(2026, 6, 10, 10, 0))
                .updatedBy("系统管理员")
                .updatedAt(LocalDateTime.of(2026, 6, 10, 10, 0))
                .build();
        when(materialTypeRepository.findAll()).thenReturn(List.of(semiFinished, raw));
        when(materialRepository.findAll()).thenReturn(List.of(semiFinishedMaterial, rawMaterial));

        var response = controller.listProducts(null, "ACTIVE", 1, 20, "createdAt", "desc");

        assertThat(response.getData().getContent()).hasSize(1);
        assertThat(response.getData().getContent().getFirst().getCode()).isEqualTo("MAT-00051");
        assertThat(response.getData().getContent().getFirst().getName()).isEqualTo("半成品A");
    }

    @Test
    void createsMaterialWithMaterialTypeNameForDerivedProductView() {
        AuditContext.setOperator("99", "系统管理员", "admin");
        MaterialType semiFinished = MaterialType.builder()
                .id(71L)
                .code("MT-00071")
                .name("半成品")
                .status("ACTIVE")
                .createdBy("系统管理员")
                .createdAt(LocalDateTime.of(2026, 6, 1, 8, 0))
                .updatedBy("系统管理员")
                .updatedAt(LocalDateTime.of(2026, 6, 1, 8, 0))
                .build();
        when(materialTypeRepository.findAll()).thenReturn(List.of(semiFinished));
        when(idGenerator.nextId()).thenReturn(70001L, 70002L, 70003L);
        when(materialRepository.save(any(Material.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.createMaterial(ProcessModelingRequest.builder()
                .name("名称传类型半成品")
                .materialTypeName("半成品")
                .status("ACTIVE")
                .build());

        assertThat(response.getData().getMaterialTypeId()).isEqualTo(71L);
        assertThat(response.getData().getMaterialTypeName()).isEqualTo("半成品");
    }

    @Test
    void createsMaterialVersionWithBusinessCodeAndVersion() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        MaterialType rawMaterial = MaterialType.builder()
                .id(91L)
                .code("MT-00091")
                .name("原材料")
                .status("ACTIVE")
                .build();
        when(materialTypeRepository.findAll()).thenReturn(List.of(rawMaterial));
        when(idGenerator.nextId()).thenReturn(91001L, 91002L);
        when(materialRepository.save(any(Material.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.createMaterial(ProcessModelingRequest.builder()
                .name("医用级树脂")
                .code("RM-RESIN-001")
                .specification("25kg/袋")
                .materialTypeName("原材料")
                .unit("kg")
                .version("V1.0")
                .status("ACTIVE")
                .build());

        assertThat(response.getData().getCode()).isEqualTo("RM-RESIN-001");
        assertThat(response.getData().getVersion()).isEqualTo("V1.0");
        assertThat(response.getData().getMaterialTypeName()).isEqualTo("原材料");

        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        AuditEvent event = auditCaptor.getValue();
        assertThat(objectMapper.readTree(event.getContentAfter()).get("code").asText()).isEqualTo("RM-RESIN-001");
        assertThat(objectMapper.readTree(event.getContentAfter()).get("version").asText()).isEqualTo("V1.0");
    }

    @Test
    void rejectsCreatingMaterialWithDuplicateCodeAndVersion() {
        Material existing = Material.builder()
                .id(92L)
                .tenantId("default")
                .code("RM-RESIN-001")
                .name("医用级树脂")
                .version("V1.0")
                .build();
        when(materialRepository.findByTenantIdAndCodeIgnoreCase("default", "RM-RESIN-001"))
                .thenReturn(List.of(existing));

        assertThatThrownBy(() -> controller.createMaterial(ProcessModelingRequest.builder()
                .name("医用级树脂")
                .code("RM-RESIN-001")
                .version("V1.0")
                .build()))
                .hasMessageContaining("物料料号已存在");
    }

    @Test
    void rejectsCreatingDifferentMaterialWithExistingCode() {
        Material existing = Material.builder()
                .id(96L)
                .tenantId("default")
                .code("RM-RESIN-001")
                .name("医用级树脂")
                .version("V1.0")
                .build();
        when(materialRepository.findByTenantIdAndCodeIgnoreCase("default", "RM-RESIN-001"))
                .thenReturn(List.of(existing));

        assertThatThrownBy(() -> controller.createMaterial(ProcessModelingRequest.builder()
                .name("另一种物料")
                .code("RM-RESIN-001")
                .version("V2.0")
                .build()))
                .hasMessageContaining("物料料号已存在");
    }

    @Test
    void allowsCreatingMaterialVersionWithExistingCodeAndNewVersion() {
        Material existing = Material.builder()
                .id(93L)
                .tenantId("default")
                .code("RM-RESIN-001")
                .name("医用级树脂")
                .version("V1.0")
                .build();
        when(materialRepository.findByTenantIdAndCodeIgnoreCase("default", "RM-RESIN-001"))
                .thenReturn(List.of(existing));
        when(idGenerator.nextId()).thenReturn(93001L, 93002L);
        when(materialRepository.save(any(Material.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.createMaterial(ProcessModelingRequest.builder()
                .name("医用级树脂")
                .code("RM-RESIN-001")
                .version("V2.0")
                .build());

        assertThat(response.getData().getCode()).isEqualTo("RM-RESIN-001");
        assertThat(response.getData().getVersion()).isEqualTo("V2.0");
    }

    @Test
    void rejectsUpdatingMaterialCodeToExistingCode() {
        Material existing = Material.builder()
                .id(94L)
                .tenantId("default")
                .code("RM-OLD-001")
                .name("旧物料")
                .version("V1.0")
                .build();
        Material other = Material.builder()
                .id(95L)
                .tenantId("default")
                .code("RM-RESIN-001")
                .name("医用级树脂")
                .version("V1.0")
                .build();
        when(materialRepository.findById(94L)).thenReturn(Optional.of(existing));
        when(materialRepository.findByTenantIdAndCodeIgnoreCase("default", "RM-RESIN-001"))
                .thenReturn(List.of(other));

        assertThatThrownBy(() -> controller.updateMaterial(94L, ProcessModelingRequest.builder()
                .name("旧物料")
                .code("RM-RESIN-001")
                .build()))
                .hasMessageContaining("物料料号已存在");
    }

    @Test
    void serializesMaterialVersionIdAsStringToAvoidFrontendPrecisionLoss() throws Exception {
        Material material = Material.builder()
                .id(343069305207431168L)
                .tenantId("default")
                .code("RM-PRECISION-001")
                .name("高位ID物料")
                .version("V1.0")
                .build();

        String json = objectMapper.writeValueAsString(material);

        assertThat(objectMapper.readTree(json).get("id").isTextual()).isTrue();
        assertThat(objectMapper.readTree(json).get("id").asText()).isEqualTo("343069305207431168");
    }

    @Test
    void updatesMaterialVersionWithoutChangingCodeUniquenessSemantics() throws Exception {
        AuditContext.setOperator("99", "系统管理员", "admin");
        Material existing = Material.builder()
                .id(12L)
                .tenantId("default")
                .code("RM-RESIN-001")
                .name("医用级树脂")
                .specification("25kg/袋")
                .materialTypeId(91L)
                .unit("kg")
                .version("V1.0")
                .status("ACTIVE")
                .createdBy("系统管理员")
                .createdAt(LocalDateTime.of(2026, 6, 1, 9, 0))
                .updatedBy("系统管理员")
                .updatedAt(LocalDateTime.of(2026, 6, 1, 9, 0))
                .build();
        when(materialRepository.findById(12L)).thenReturn(Optional.of(existing));
        when(materialRepository.save(existing)).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(12001L);

        var response = controller.updateMaterial(12L, ProcessModelingRequest.builder()
                .name("医用级树脂")
                .code("RM-RESIN-001")
                .specification("25kg/袋")
                .materialTypeId(91L)
                .unit("kg")
                .version("V2.0")
                .status("ACTIVE")
                .build());

        assertThat(response.getData().getCode()).isEqualTo("RM-RESIN-001");
        assertThat(response.getData().getVersion()).isEqualTo("V2.0");
        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        AuditEvent event = auditCaptor.getValue();
        assertThat(objectMapper.readTree(event.getContentAfter()).get("version").asText()).isEqualTo("V2.0");
    }

    @Test
    void listsMaterialsGroupedByCodeAndNameWithNumericVersionOrder() {
        Material v1 = Material.builder()
                .id(101L)
                .tenantId("default")
                .code("RM-RESIN-001")
                .name("医用级树脂")
                .version("V1.0")
                .materialPurpose("生产物料")
                .effectiveDate(LocalDateTime.of(2026, 6, 1, 0, 0))
                .expiryDate(LocalDateTime.of(2026, 6, 2, 0, 0))
                .status("ACTIVE")
                .createdAt(LocalDateTime.of(2026, 6, 1, 9, 0))
                .build();
        Material v2 = Material.builder()
                .id(102L)
                .tenantId("default")
                .code("RM-RESIN-001")
                .name("医用级树脂")
                .version("V2.0")
                .materialPurpose("试验物料")
                .effectiveDate(LocalDateTime.now().minusDays(1))
                .status("ACTIVE")
                .createdAt(LocalDateTime.of(2026, 6, 2, 9, 0))
                .build();
        Material v10 = Material.builder()
                .id(103L)
                .tenantId("default")
                .code("RM-RESIN-001")
                .name("医用级树脂")
                .version("V10.0")
                .materialPurpose("生产物料")
                .effectiveDate(LocalDateTime.now().plusDays(1))
                .status("DRAFT")
                .createdAt(LocalDateTime.of(2026, 6, 3, 9, 0))
                .build();
        when(materialRepository.findAll()).thenReturn(List.of(v1, v2, v10));

        var response = controller.listMaterials(null, null, null, null, null, 1, 20, "createdAt", "desc");

        assertThat(response.getData().getContent()).hasSize(1);
        var group = response.getData().getContent().getFirst();
        assertThat(group.getCode()).isEqualTo("RM-RESIN-001");
        assertThat(group.getName()).isEqualTo("医用级树脂");
        assertThat(group.getVersion()).isEqualTo("V10.0");
        assertThat(group.getVersionCount()).isEqualTo(3);
        assertThat(group.getEffectiveVersionCount()).isEqualTo(1);
        assertThat(group.getStatus()).isEqualTo("ACTIVE");
        assertThat(group.getMaterialPurpose()).isEqualTo("生产物料");
        assertThat(group.getEffectiveDate()).startsWith(String.valueOf(LocalDateTime.now().plusDays(1).getYear()));
        assertThat(group.getVersions()).extracting(Material::getVersion)
                .containsExactly("V10.0", "V2.0", "V1.0");
    }

    @Test
    void derivesMaterialStatusFromEffectiveAndExpiryDates() {
        Material active = Material.builder()
                .id(201L)
                .tenantId("default")
                .code("MAT-ACTIVE")
                .name("当前生效物料")
                .version("V1.0")
                .effectiveDate(LocalDateTime.now().minusDays(1))
                .expiryDate(LocalDateTime.now().plusDays(1))
                .status("DRAFT")
                .createdAt(LocalDateTime.of(2026, 6, 1, 9, 0))
                .build();
        Material future = Material.builder()
                .id(202L)
                .tenantId("default")
                .code("MAT-PENDING")
                .name("未来生效物料")
                .version("V1.0")
                .effectiveDate(LocalDateTime.now().plusDays(1))
                .status("ACTIVE")
                .createdAt(LocalDateTime.of(2026, 6, 2, 9, 0))
                .build();
        Material expired = Material.builder()
                .id(203L)
                .tenantId("default")
                .code("MAT-EXPIRED")
                .name("已经失效物料")
                .version("V1.0")
                .expiryDate(LocalDateTime.now().minusDays(1))
                .status("ACTIVE")
                .createdAt(LocalDateTime.of(2026, 6, 3, 9, 0))
                .build();
        when(materialRepository.findAll()).thenReturn(List.of(active, future, expired));

        var response = controller.listMaterials(null, null, null, null, "ACTIVE", 1, 20, "createdAt", "desc");

        assertThat(response.getData().getContent()).hasSize(1);
        var group = response.getData().getContent().getFirst();
        assertThat(group.getCode()).isEqualTo("MAT-ACTIVE");
        assertThat(group.getStatus()).isEqualTo("ACTIVE");
        assertThat(group.getVersions().getFirst().getStatus()).isEqualTo("ACTIVE");

        var all = controller.listMaterials(null, null, null, null, null, 1, 20, "createdAt", "desc");
        assertThat(all.getData().getContent()).extracting("status")
                .containsExactly("EXPIRED", "EXPIRED", "ACTIVE");
    }

    @Test
    void rejectsMaterialExpiryEarlierThanEffectiveDate() {
        ProcessModelingRequest request = ProcessModelingRequest.builder()
                .name("错误日期物料")
                .version("V1.0")
                .effectiveDate(LocalDateTime.of(2026, 6, 18, 10, 0))
                .expiryDate(LocalDateTime.of(2026, 6, 18, 9, 0))
                .build();

        assertThatThrownBy(() -> controller.createMaterial(request))
                .hasMessageContaining("失效时间不能早于生效时间");
    }

    @Test
    void rejectsDirectProductMutationsBecauseProductsAreDerivedFromMaterials() {
        assertThatThrownBy(() -> controller.createProduct(ProcessModelingRequest.builder()
                .name("独立产品")
                .status("ACTIVE")
                .build()))
                .hasMessageContaining("产品管理由物料管理自动派生");
        assertThatThrownBy(() -> controller.updateProduct(81L, ProcessModelingRequest.builder()
                .name("编辑产品")
                .status("ACTIVE")
                .build()))
                .hasMessageContaining("产品管理由物料管理自动派生");
        assertThatThrownBy(() -> controller.deleteProduct(81L))
                .hasMessageContaining("产品管理由物料管理自动派生");
        verifyNoInteractions(productRepository);
    }

    @Test
    void createsRouteTemplateWithInitialVersion() {
        AuditContext.setOperator("99", "系统管理员", "admin");
        when(idGenerator.nextId()).thenReturn(81001L, 81002L, 81003L);
        when(routeRepository.save(any(Route.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(routeVersionRepository.save(any(RouteVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.createRoute(ProcessModelingRequest.builder()
                .name("通用无菌灌装路线")
                .description("模板级描述")
                .version("V1.0")
                .code("RT-V1-001")
                .versionDescription("首版路线说明")
                .status("DRAFT")
                .build());

        assertThat(response.getData().getName()).isEqualTo("通用无菌灌装路线");
        assertThat(response.getData().getCode()).isNull();
        assertThat(response.getData().getDescription()).isEqualTo("模板级描述");
        assertThat(response.getData().getCommonAsset()).isTrue();

        ArgumentCaptor<RouteVersion> versionCaptor = ArgumentCaptor.forClass(RouteVersion.class);
        verify(routeVersionRepository).save(versionCaptor.capture());
        RouteVersion version = versionCaptor.getValue();
        assertThat(version.getRouteId()).isEqualTo(81001L);
        assertThat(version.getCode()).isEqualTo("RT-V1-001");
        assertThat(version.getVersion()).isEqualTo("V1.0");
        assertThat(version.getDescription()).isEqualTo("首版路线说明");
        assertThat(version.getVersionStatus()).isEqualTo("ACTIVE");
        assertThat(version.getCreatedBy()).isEqualTo("系统管理员");
    }

    @Test
    void routeResponsesUseStringIdsToAvoidBrowserPrecisionLoss() throws Exception {
        Route route = Route.builder()
                .id(344346908514107392L)
                .tenantId("default")
                .code("RT-001")
                .name("通用路线")
                .versions(List.of(RouteVersion.builder()
                        .id(344346908514107393L)
                        .routeId(344346908514107392L)
                        .version("V1.0")
                        .build()))
                .build();

        String json = objectMapper.writeValueAsString(route);

        assertThat(json).contains("\"id\":\"344346908514107392\"");
        assertThat(json).contains("\"routeId\":\"344346908514107392\"");
        assertThat(objectMapper.readTree(json).get("versions").get(0).get("id").asText()).isEqualTo("344346908514107393");
    }

    @Test
    void listsRoutesWithVersionSummary() {
        Route route = Route.builder()
                .id(82001L)
                .tenantId("default")
                .code("RT-82001")
                .name("通用无菌灌装路线")
                .status("ACTIVE")
                .commonAsset(true)
                .createdAt(LocalDateTime.of(2026, 6, 22, 9, 0))
                .build();
        RouteVersion v1 = RouteVersion.builder()
                .id(82011L)
                .routeId(82001L)
                .version("V1.0")
                .versionStatus("PUBLISHED")
                .createdAt(LocalDateTime.of(2026, 6, 22, 9, 0))
                .build();
        RouteVersion v2 = RouteVersion.builder()
                .id(82012L)
                .routeId(82001L)
                .version("V2.0")
                .versionStatus("DRAFT")
                .createdAt(LocalDateTime.of(2026, 6, 22, 10, 0))
                .build();
        when(routeRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(new org.springframework.data.domain.PageImpl<>(List.of(route)));
        when(routeVersionRepository.findByRouteIdOrderByCreatedAtDesc(82001L)).thenReturn(List.of(v2, v1));

        var response = controller.listRoutes(null, null, 1, 20, "createdAt", "desc");

        Route row = response.getData().getContent().getFirst();
        assertThat(row.getVersionCount()).isEqualTo(2);
        assertThat(row.getVersions()).extracting(RouteVersion::getVersion).containsExactly("V2.0", "V1.0");
    }

    @Test
    void derivesRouteVersionStatusFromEffectiveAndExpiryDates() {
        Route route = Route.builder()
                .id(82101L)
                .tenantId("default")
                .code("RT-82101")
                .name("通用无菌灌装路线")
                .status("ACTIVE")
                .commonAsset(true)
                .createdAt(LocalDateTime.of(2026, 6, 22, 9, 0))
                .build();
        RouteVersion expired = RouteVersion.builder()
                .id(82111L)
                .routeId(82101L)
                .version("V1.0")
                .versionStatus("ACTIVE")
                .effectiveDate(LocalDateTime.now().minusDays(2))
                .expiryDate(LocalDateTime.now().minusDays(1))
                .createdAt(LocalDateTime.of(2026, 6, 22, 9, 0))
                .build();
        RouteVersion pending = RouteVersion.builder()
                .id(82112L)
                .routeId(82101L)
                .version("V2.0")
                .versionStatus("ACTIVE")
                .effectiveDate(LocalDateTime.now().plusDays(1))
                .createdAt(LocalDateTime.of(2026, 6, 22, 10, 0))
                .build();
        when(routeRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(new org.springframework.data.domain.PageImpl<>(List.of(route)));
        when(routeVersionRepository.findByRouteIdOrderByCreatedAtDesc(82101L)).thenReturn(List.of(pending, expired));

        var response = controller.listRoutes(null, null, 1, 20, "createdAt", "desc");

        Route row = response.getData().getContent().getFirst();
        assertThat(row.getStatus()).isEqualTo("EXPIRED");
        assertThat(row.getVersions()).extracting(RouteVersion::getVersionStatus)
                .containsExactly("EXPIRED", "EXPIRED");
    }

    @Test
    void updatesRouteWithoutResettingHiddenProductFamilyOrCommonAsset() {
        Route existing = Route.builder()
                .id(82501L)
                .tenantId("default")
                .code("RT-82501")
                .name("通用无菌灌装路线")
                .description("原描述")
                .productFamilyId("PF-001")
                .commonAsset(false)
                .status("ACTIVE")
                .build();
        when(routeRepository.findById(82501L)).thenReturn(Optional.of(existing));
        when(routeRepository.save(existing)).thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.updateRoute(82501L, ProcessModelingRequest.builder()
                .name("通用无菌灌装路线")
                .description("原描述")
                .status("ACTIVE")
                .build());

        assertThat(response.getData().getProductFamilyId()).isEqualTo("PF-001");
        assertThat(response.getData().getCommonAsset()).isFalse();
    }

    @Test
    void updatesRouteVersionInformationOnly() {
        Route route = Route.builder()
                .id(82601L)
                .tenantId("default")
                .code("RT-82601")
                .name("通用无菌灌装路线")
                .status("ACTIVE")
                .build();
        RouteVersion version = RouteVersion.builder()
                .id(82611L)
                .routeId(82601L)
                .version("V1.0")
                .code("RT-V1-001")
                .versionStatus("DRAFT")
                .description("原版本说明")
                .effectiveDate(LocalDateTime.of(2026, 6, 20, 0, 0))
                .build();
        when(routeRepository.findById(82601L)).thenReturn(Optional.of(route));
        when(routeVersionRepository.findByRouteIdAndId(82601L, 82611L)).thenReturn(Optional.of(version));
        when(routeVersionRepository.save(version)).thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.updateRouteVersion(82601L, 82611L, ProcessModelingRequest.builder()
                .version("V1.1")
                .code("RT-V1-002")
                .versionDescription("新版说明")
                .effectiveDate(LocalDateTime.of(2026, 6, 23, 0, 0))
                .expiryDate(LocalDateTime.of(2026, 7, 23, 0, 0))
                .build());

        assertThat(response.getData().getVersion()).isEqualTo("V1.1");
        assertThat(response.getData().getCode()).isEqualTo("RT-V1-002");
        assertThat(response.getData().getDescription()).isEqualTo("新版说明");
        assertThat(response.getData().getEffectiveDate()).isEqualTo(LocalDateTime.of(2026, 6, 23, 0, 0));
        assertThat(response.getData().getExpiryDate()).isEqualTo(LocalDateTime.of(2026, 7, 23, 0, 0));
        verify(routeRepository).findById(82601L);
        verify(routeVersionRepository).save(version);
    }

    @Test
    void deletesRouteVersionWhenRouteHasMultipleVersions() {
        Route route = Route.builder()
                .id(82701L)
                .tenantId("default")
                .code("RT-82701")
                .name("通用无菌灌装路线")
                .status("ACTIVE")
                .build();
        RouteVersion version = RouteVersion.builder()
                .id(82711L)
                .routeId(82701L)
                .version("V1.0")
                .build();
        when(routeRepository.findById(82701L)).thenReturn(Optional.of(route));
        when(routeVersionRepository.findByRouteIdAndId(82701L, 82711L)).thenReturn(Optional.of(version));
        when(routeVersionRepository.countByRouteId(82701L)).thenReturn(2L);

        controller.deleteRouteVersion(82701L, 82711L);

        var deleteOrder = inOrder(routeRelationRepository, routeNodeRepository, routeVersionRepository);
        deleteOrder.verify(routeRelationRepository).deleteByRouteVersionId(82711L);
        deleteOrder.verify(routeRelationRepository).flush();
        deleteOrder.verify(routeNodeRepository).deleteByRouteVersionId(82711L);
        deleteOrder.verify(routeNodeRepository).flush();
        deleteOrder.verify(routeVersionRepository).delete(version);
        verify(routeVersionRepository).countByRouteId(82701L);
    }

    @Test
    void refusesToDeleteLastRouteVersion() {
        Route route = Route.builder()
                .id(82801L)
                .tenantId("default")
                .code("RT-82801")
                .name("通用无菌灌装路线")
                .status("ACTIVE")
                .build();
        RouteVersion version = RouteVersion.builder()
                .id(82811L)
                .routeId(82801L)
                .version("V1.0")
                .build();
        when(routeRepository.findById(82801L)).thenReturn(Optional.of(route));
        when(routeVersionRepository.findByRouteIdAndId(82801L, 82811L)).thenReturn(Optional.of(version));
        when(routeVersionRepository.countByRouteId(82801L)).thenReturn(1L);

        assertThatThrownBy(() -> controller.deleteRouteVersion(82801L, 82811L))
                .hasMessageContaining("工艺路线模板仅剩一个版本，请删除父表工艺路线模板");

        verifyNoInteractions(routeRelationRepository, routeNodeRepository);
    }

    @Test
    void savesRouteGraphNodesAndRelationsSeparately() {
        Route route = Route.builder()
                .id(83001L)
                .tenantId("default")
                .code("RT-83001")
                .name("通用无菌灌装路线")
                .status("DRAFT")
                .build();
        RouteVersion version = RouteVersion.builder()
                .id(83011L)
                .routeId(83001L)
                .version("V1.0")
                .versionStatus("DRAFT")
                .build();
        when(routeRepository.findById(83001L)).thenReturn(Optional.of(route));
        when(routeVersionRepository.findByRouteIdAndId(83001L, 83011L)).thenReturn(Optional.of(version));
        when(idGenerator.nextId()).thenReturn(83021L, 83022L, 83031L);
        when(routeNodeRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(routeRelationRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var request = RouteGraphRequest.builder()
                .nodes(List.of(
                        RouteGraphRequest.NodePayload.builder()
                                .nodeKey("sterilize")
                                .operationId(101L)
                                .operationCode("OP-STER")
                                .operationName("灭菌")
                                .nodeType("OPERATION")
                                .positionX(80)
                                .positionY(120)
                                .sortOrder(1)
                                .build(),
                        RouteGraphRequest.NodePayload.builder()
                                .nodeKey("fill")
                                .operationId(102L)
                                .operationCode("OP-FILL")
                                .operationName("灌装")
                                .nodeType("OPERATION")
                                .positionX(320)
                                .positionY(120)
                                .sortOrder(2)
                                .build()))
                .relations(List.of(
                        RouteGraphRequest.RelationPayload.builder()
                                .sourceNodeKey("sterilize")
                                .targetNodeKey("fill")
                                .sourceHandle("route-handle-right")
                                .targetHandle("route-handle-left")
                                .relationType("SEQUENTIAL")
                                .label("串行")
                                .priority(1)
                                .build(),
                        RouteGraphRequest.RelationPayload.builder()
                                .sourceNodeKey("fill")
                                .targetNodeKey("sterilize")
                                .sourceHandle("route-handle-bottom")
                                .targetHandle("route-handle-right")
                                .relationType("REWORK")
                                .label("返工回流")
                                .ruleExpression("qc_failed == true")
                                .priority(2)
                                .build()))
                .build();

        var response = controller.saveRouteGraph(83001L, 83011L, request);

        assertThat(response.getData().getNodes()).hasSize(2);
        assertThat(response.getData().getRelations()).hasSize(2);
        ArgumentCaptor<List<RouteNode>> nodeCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<List<RouteRelation>> relationCaptor = ArgumentCaptor.forClass(List.class);
        verify(routeNodeRepository).deleteByRouteVersionId(83011L);
        verify(routeRelationRepository).deleteByRouteVersionId(83011L);
        verify(routeNodeRepository).saveAll(nodeCaptor.capture());
        verify(routeRelationRepository).saveAll(relationCaptor.capture());
        var graphWriteOrder = inOrder(routeRelationRepository, routeNodeRepository);
        graphWriteOrder.verify(routeRelationRepository).deleteByRouteVersionId(83011L);
        graphWriteOrder.verify(routeRelationRepository).flush();
        graphWriteOrder.verify(routeNodeRepository).deleteByRouteVersionId(83011L);
        graphWriteOrder.verify(routeNodeRepository).flush();
        graphWriteOrder.verify(routeNodeRepository).saveAll(any());
        graphWriteOrder.verify(routeRelationRepository).saveAll(any());
        assertThat(nodeCaptor.getValue()).extracting(RouteNode::getNodeKey).containsExactly("sterilize", "fill");
        assertThat(relationCaptor.getValue()).extracting(RouteRelation::getRelationType).containsExactly("SEQUENTIAL", "REWORK");
        assertThat(relationCaptor.getValue()).extracting(RouteRelation::getSourceHandle).containsExactly("route-handle-right", "route-handle-bottom");
        assertThat(relationCaptor.getValue()).extracting(RouteRelation::getTargetHandle).containsExactly("route-handle-left", "route-handle-right");
    }

    private Stream<String> mappingValues(Method method) {
        Stream<String> getMappings = method.isAnnotationPresent(GetMapping.class)
                ? Arrays.stream(method.getAnnotation(GetMapping.class).value())
                : Stream.empty();
        Stream<String> postMappings = method.isAnnotationPresent(PostMapping.class)
                ? Arrays.stream(method.getAnnotation(PostMapping.class).value())
                : Stream.empty();
        Stream<String> putMappings = method.isAnnotationPresent(PutMapping.class)
                ? Arrays.stream(method.getAnnotation(PutMapping.class).value())
                : Stream.empty();
        Stream<String> deleteMappings = method.isAnnotationPresent(DeleteMapping.class)
                ? Arrays.stream(method.getAnnotation(DeleteMapping.class).value())
                : Stream.empty();
        return Stream.of(getMappings, postMappings, putMappings, deleteMappings).flatMap(stream -> stream);
    }
}
