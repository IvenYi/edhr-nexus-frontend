package com.zencas.edhr.masterdata.controller;

import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.masterdata.dto.ProductProcessVersionRequest;
import com.zencas.edhr.masterdata.entity.DocumentCategory;
import com.zencas.edhr.masterdata.entity.DocumentVersion;
import com.zencas.edhr.masterdata.entity.Material;
import com.zencas.edhr.masterdata.entity.MaterialType;
import com.zencas.edhr.masterdata.entity.ProductProcess;
import com.zencas.edhr.masterdata.entity.ProductProcessOperationBinding;
import com.zencas.edhr.masterdata.entity.ProductProcessVersion;
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
import com.zencas.edhr.template.repository.DhrTemplateRepository;
import com.zencas.edhr.template.repository.DhrTemplateVersionRepository;
import com.zencas.edhr.template.repository.FormTemplateRepository;
import com.zencas.edhr.template.repository.FormTemplateVersionRepository;
import com.zencas.edhr.template.entity.DhrTemplateVersion;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductProcessControllerTest {

    @Mock private MaterialRepository materialRepository;
    @Mock private MaterialTypeRepository materialTypeRepository;
    @Mock private ProductProcessRepository productProcessRepository;
    @Mock private ProductProcessVersionRepository productProcessVersionRepository;
    @Mock private ProductProcessOperationBindingRepository operationBindingRepository;
    @Mock private ProductProcessOperationFormBindingRepository operationFormBindingRepository;
    @Mock private ProductProcessOperationDocumentBindingRepository operationDocumentBindingRepository;
    @Mock private RouteRepository routeRepository;
    @Mock private RouteVersionRepository routeVersionRepository;
    @Mock private RouteNodeRepository routeNodeRepository;
    @Mock private SopDocumentRepository sopDocumentRepository;
    @Mock private DocumentCategoryRepository documentCategoryRepository;
    @Mock private DocumentVersionRepository documentVersionRepository;
    @Mock private DhrTemplateRepository dhrTemplateRepository;
    @Mock private DhrTemplateVersionRepository dhrTemplateVersionRepository;
    @Mock private FormTemplateRepository formTemplateRepository;
    @Mock private FormTemplateVersionRepository formTemplateVersionRepository;
    @Mock private AuditEventRepository auditEventRepository;
    @Mock private SnowflakeIdGenerator idGenerator;
    @InjectMocks private ProductProcessController controller;

    @Test
    void productModelingRejectsAProductThatIsNotDerivedFromFinishedOrSemiFinishedMaterial() {
        Material rawMaterial = Material.builder().id(101L).materialTypeId(9L).name("原材料").code("RAW-001").build();
        when(materialRepository.findById(101L)).thenReturn(Optional.of(rawMaterial));
        when(materialTypeRepository.findAll()).thenReturn(List.of(MaterialType.builder().id(9L).name("原材料").build()));

        assertThatThrownBy(() -> controller.getProductModel(101L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("半成品或产成品");
    }

    @Test
    void productModelingAllowsOverlappingWindowsForTheSameModeAndForm() {
        ProductProcess process = ProductProcess.builder().id(701L).tenantId("default").productVersionId(101L).build();
        ProductProcessVersion current = ProductProcessVersion.builder()
                .id(702L).productProcessId(701L).versionLabel("V1.0")
                .productionMode("量产").productionForm("批次")
                .routeVersionId(301L).dhrTemplateVersionId(401L)
                .effectiveFrom(LocalDateTime.of(2026, 8, 1, 0, 0))
                .effectiveTo(LocalDateTime.of(2026, 9, 1, 0, 0)).build();
        stubProduct(process);
        when(productProcessVersionRepository.findByProductProcessIdAndVersionLabelIgnoreCase(anyLong(), anyString())).thenReturn(List.of());
        when(productProcessVersionRepository.findByProductProcessIdOrderByCreatedAtDesc(701L)).thenReturn(List.of(current));
        when(productProcessVersionRepository.save(any(ProductProcessVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(900L, 901L);

        var response = controller.createVersion(101L, versionRequest("V2.0", LocalDateTime.of(2026, 8, 15, 0, 0), LocalDateTime.of(2026, 10, 1, 0, 0)));

        assertThat(response.getData().version()).isEqualTo("V2.0");
        assertThat(response.getData().effectiveFrom()).isEqualTo(LocalDateTime.of(2026, 8, 15, 0, 0));
    }

    @Test
    void productModelingRejectsUnsupportedProductionMode() {
        ProductProcess process = ProductProcess.builder().id(701L).tenantId("default").productVersionId(101L).build();
        Material product = Material.builder().id(101L).materialTypeId(10L).name("产品 A").code("P-001").version("V1.0").build();
        when(materialRepository.findById(101L)).thenReturn(Optional.of(product));
        when(materialTypeRepository.findAll()).thenReturn(List.of(MaterialType.builder().id(10L).name("产成品").build()));
        when(productProcessRepository.findByTenantIdAndProductVersionId("default", 101L)).thenReturn(Optional.of(process));
        when(productProcessVersionRepository.findByProductProcessIdAndVersionLabelIgnoreCase(anyLong(), anyString())).thenReturn(List.of());
        when(productProcessVersionRepository.findByProductProcessIdOrderByCreatedAtDesc(701L)).thenReturn(List.of());

        ProductProcessVersionRequest request = versionRequest("V2.0", null, null);
        request.setProductionMode("试制");

        assertThatThrownBy(() -> controller.createVersion(101L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("生产模式仅支持量产、返工或翻新");
    }

    @Test
    void productModelingAllowsAFutureVersionWhoseWindowStartsWhenThePriorVersionEnds() {
        ProductProcess process = ProductProcess.builder().id(701L).tenantId("default").productVersionId(101L).build();
        ProductProcessVersion current = ProductProcessVersion.builder()
                .id(702L).productProcessId(701L).versionLabel("V1.0")
                .productionMode("量产").productionForm("批次")
                .routeVersionId(301L).dhrTemplateVersionId(401L)
                .effectiveFrom(LocalDateTime.of(2026, 8, 1, 0, 0))
                .effectiveTo(LocalDateTime.of(2026, 9, 1, 0, 0)).build();
        stubProduct(process);
        when(productProcessVersionRepository.findByProductProcessIdAndVersionLabelIgnoreCase(701L, "V2.0")).thenReturn(List.of());
        when(productProcessVersionRepository.findByProductProcessIdOrderByCreatedAtDesc(701L)).thenReturn(List.of(current));
        when(productProcessVersionRepository.save(any(ProductProcessVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(operationBindingRepository.findByProductProcessVersionIdOrderBySortOrderAsc(any())).thenReturn(List.of());
        when(idGenerator.nextId()).thenReturn(900L, 901L);

        var response = controller.createVersion(101L, versionRequest("V2.0", LocalDateTime.of(2026, 9, 1, 0, 0), null));

        assertThat(response.getData().version()).isEqualTo("V2.0");
        assertThat(response.getData().productionMode()).isEqualTo("量产");
    }

    @Test
    void productModelingWorkspaceReturnsFutureEffectiveVersionsAsExpired() {
        ProductProcess process = ProductProcess.builder().id(701L).tenantId("default").productVersionId(101L).build();
        ProductProcessVersion future = ProductProcessVersion.builder()
                .id(702L).productProcessId(701L).versionLabel("V2.0")
                .productionMode("量产").productionForm("批次")
                .routeVersionId(301L).dhrTemplateVersionId(401L)
                .effectiveFrom(LocalDateTime.now().plusDays(1)).build();
        stubProduct(process);
        when(productProcessVersionRepository.findByProductProcessIdOrderByCreatedAtDesc(701L)).thenReturn(List.of(future));

        var response = controller.getProductModel(101L);

        assertThat(response.getData().product().activeModelVersionCount()).isZero();
        assertThat(response.getData().model().versions()).singleElement()
                .satisfies(version -> assertThat(version.status()).isEqualTo("EXPIRED"));
    }

    @Test
    void productModelingCreationAuditIncludesSavedOperationBindings() {
        ProductProcess process = ProductProcess.builder().id(701L).tenantId("default").productVersionId(101L).build();
        ProductProcessVersionRequest request = versionRequest("V1.0", null, null);
        request.setOperationBindings(List.of(ProductProcessVersionRequest.OperationBindingRequest.builder()
                .routeNodeKey("operation-1").sortOrder(1).forms(List.of()).documents(List.of()).build()));
        ProductProcessOperationBinding savedBinding = ProductProcessOperationBinding.builder()
                .id(901L).productProcessVersionId(900L).routeNodeKey("operation-1")
                .operationId(801L).operationCode("OP-001").operationName("装配").sortOrder(1).build();

        stubProduct(process);
        when(productProcessVersionRepository.findByProductProcessIdAndVersionLabelIgnoreCase(anyLong(), anyString())).thenReturn(List.of());
        when(productProcessVersionRepository.findByProductProcessIdOrderByCreatedAtDesc(701L)).thenReturn(List.of());
        when(productProcessVersionRepository.save(any(ProductProcessVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(routeNodeRepository.findByRouteVersionIdOrderBySortOrderAsc(301L)).thenReturn(List.of(RouteNode.builder()
                .id(800L).routeVersionId(301L).nodeKey("operation-1").operationId(801L)
                .operationCode("OP-001").operationName("装配").sortOrder(1).build()));
        when(operationBindingRepository.findByProductProcessVersionIdOrderBySortOrderAsc(900L)).thenReturn(List.of(), List.of(savedBinding));
        when(operationBindingRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(operationFormBindingRepository.findByProductProcessOperationBindingIdInOrderBySortOrderAsc(any())).thenReturn(List.of());
        when(operationDocumentBindingRepository.findByProductProcessOperationBindingIdInOrderBySortOrderAsc(any())).thenReturn(List.of());
        when(auditEventRepository.save(any(AuditEvent.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(900L, 901L, 902L);

        controller.createVersion(101L, request);

        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        AuditEvent audit = auditCaptor.getValue();
        assertThat(audit.getEntityType()).isEqualTo("PRODUCT_PROCESS_VERSION");
        assertThat(audit.getAction()).isEqualTo("CREATE");
        assertThat(audit.getContentAfter()).contains("operationBindings").contains("OP-001 / 装配");
    }

    @Test
    void productModelingDocumentOptionsExposeTheActualDocumentCategoryName() {
        Material product = Material.builder().id(101L).materialTypeId(10L).name("产品 A").code("P-001").build();
        SopDocument document = SopDocument.builder().id(501L).categoryId(601L).code("DOC-001").title("装配规程").build();
        DocumentVersion version = DocumentVersion.builder().id(701L).documentId(501L).version("V1.0").effectiveDate(LocalDateTime.now().plusDays(1)).build();
        DocumentCategory category = DocumentCategory.builder().id(601L).tenantId("default").name("装配文件").build();
        when(materialRepository.findById(101L)).thenReturn(Optional.of(product));
        when(materialTypeRepository.findAll()).thenReturn(List.of(MaterialType.builder().id(10L).name("产成品").build()));
        when(routeRepository.findAll()).thenReturn(List.of());
        when(dhrTemplateRepository.findAll()).thenReturn(List.of());
        when(formTemplateRepository.findAll()).thenReturn(List.of());
        when(sopDocumentRepository.findAll()).thenReturn(List.of(document));
        when(documentCategoryRepository.findByTenantIdOrderBySortOrderAscNameAsc("default")).thenReturn(List.of(category));
        when(documentVersionRepository.findAll()).thenReturn(List.of(version));

        var response = controller.getProductModelOptions(101L);

        assertThat(response.getData().documents()).singleElement().satisfies(option -> {
            assertThat(option.documentCategoryName()).isEqualTo("装配文件");
            assertThat(option.status()).isEqualTo("EXPIRED");
        });
    }

    private void stubProduct(ProductProcess process) {
        Material product = Material.builder().id(101L).materialTypeId(10L).name("产品 A").code("P-001").version("V1.0").build();
        when(materialRepository.findById(101L)).thenReturn(Optional.of(product));
        when(materialTypeRepository.findAll()).thenReturn(List.of(MaterialType.builder().id(10L).name("产成品").build()));
        when(productProcessRepository.findByTenantIdAndProductVersionId("default", 101L)).thenReturn(Optional.of(process));
        when(routeVersionRepository.findById(301L)).thenReturn(Optional.of(RouteVersion.builder().id(301L).routeId(201L).version("V1.0").build()));
        when(dhrTemplateVersionRepository.findById(401L)).thenReturn(Optional.of(DhrTemplateVersion.builder().id(401L).dhrTemplateId(301L).versionNumber(1).build()));
    }

    private ProductProcessVersionRequest versionRequest(String version, LocalDateTime effectiveFrom, LocalDateTime effectiveTo) {
        return ProductProcessVersionRequest.builder()
                .version(version)
                .productionMode("量产")
                .productionForm("批次")
                .routeVersionId(301L)
                .dhrTemplateVersionId(401L)
                .effectiveFrom(effectiveFrom)
                .effectiveTo(effectiveTo)
                .build();
    }
}
