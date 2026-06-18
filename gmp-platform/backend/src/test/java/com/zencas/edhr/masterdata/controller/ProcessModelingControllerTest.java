package com.zencas.edhr.masterdata.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.masterdata.dto.ProcessModelingRequest;
import com.zencas.edhr.masterdata.entity.Material;
import com.zencas.edhr.masterdata.entity.MaterialType;
import com.zencas.edhr.masterdata.repository.MaterialRepository;
import com.zencas.edhr.masterdata.repository.MaterialTypeRepository;
import com.zencas.edhr.masterdata.repository.OperationRepository;
import com.zencas.edhr.masterdata.repository.ProductFamilyRepository;
import com.zencas.edhr.masterdata.repository.ProductRepository;
import com.zencas.edhr.masterdata.repository.RouteRepository;
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

@ExtendWith(MockitoExtension.class)
class ProcessModelingControllerTest {

    @Mock private MaterialTypeRepository materialTypeRepository;
    @Mock private MaterialRepository materialRepository;
    @Mock private ProductRepository productRepository;
    @Mock private ProductFamilyRepository productFamilyRepository;
    @Mock private OperationRepository operationRepository;
    @Mock private RouteRepository routeRepository;
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
        assertThat(group.getMaterialPurpose()).isEqualTo("生产物料");
        assertThat(group.getEffectiveDate()).startsWith(String.valueOf(LocalDateTime.now().plusDays(1).getYear()));
        assertThat(group.getVersions()).extracting(Material::getVersion)
                .containsExactly("V10.0", "V2.0", "V1.0");
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
