package com.zencas.edhr.masterdata.controller;

import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.entity.FileObject;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.masterdata.dto.ProductProcessVersionRequest;
import com.zencas.edhr.masterdata.dto.ProcessOwnerType;
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
import com.zencas.edhr.masterdata.service.ProductProcessOwnerService;
import com.zencas.edhr.template.repository.DhrTemplateRepository;
import com.zencas.edhr.template.repository.DhrTemplateVersionRepository;
import com.zencas.edhr.template.repository.FormTemplateRepository;
import com.zencas.edhr.template.repository.FormTemplateVersionRepository;
import com.zencas.edhr.template.repository.DhrDirectoryRepository;
import com.zencas.edhr.template.repository.DhrTemplateItemRepository;
import com.zencas.edhr.template.entity.DhrTemplateVersion;
import com.zencas.edhr.template.entity.DhrDirectory;
import com.zencas.edhr.template.entity.DhrTemplateItem;
import com.zencas.edhr.template.entity.FormTemplateVersion;
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
    @Mock private DhrDirectoryRepository dhrDirectoryRepository;
    @Mock private DhrTemplateItemRepository dhrTemplateItemRepository;
    @Mock private FileObjectRepository fileObjectRepository;
    @Mock private AuditEventRepository auditEventRepository;
    @Mock private SnowflakeIdGenerator idGenerator;
    @Mock private ProductProcessOwnerService productProcessOwnerService;
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
    void processOwnerWorkspaceUsesTheSharedServiceForAProductFamily() {
        ProductProcess process = ProductProcess.builder().id(701L).ownerType("PRODUCT_FAMILY").ownerId(201L).build();
        ProductProcessVersion version = ProductProcessVersion.builder().id(702L).productProcessId(701L).versionLabel("V1.0")
                .productionMode("量产").productionForm("批次").routeVersionId(301L).dhrTemplateVersionId(401L).build();
        when(productProcessOwnerService.workspace(ProcessOwnerType.PRODUCT_FAMILY, 201L))
                .thenReturn(new ProductProcessOwnerService.ProcessOwnerWorkspace(
                        new ProductProcessOwnerService.ProcessOwner(ProcessOwnerType.PRODUCT_FAMILY, 201L, "PF-001", "注射器产品簇"),
                        process, List.of(version)));

        var response = controller.getProcessOwnerWorkspace("PRODUCT_FAMILY", 201L);

        assertThat(response.getData().owner().name()).isEqualTo("注射器产品簇");
        assertThat(response.getData().model().versions()).extracting(item -> item.version()).containsExactly("V1.0");
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
    void productModelingRejectsBatchToSnProductionForm() {
        ProductProcess process = ProductProcess.builder().id(701L).tenantId("default").productVersionId(101L).build();
        Material product = Material.builder().id(101L).materialTypeId(10L).name("产品 A").code("P-001").version("V1.0").build();
        when(materialRepository.findById(101L)).thenReturn(Optional.of(product));
        when(materialTypeRepository.findAll()).thenReturn(List.of(MaterialType.builder().id(10L).name("产成品").build()));
        when(productProcessRepository.findByTenantIdAndProductVersionId("default", 101L)).thenReturn(Optional.of(process));
        ProductProcessVersionRequest request = versionRequest("V2.0", null, null);
        request.setProductionForm("批次转SN");

        assertThatThrownBy(() -> controller.createVersion(101L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("生产方式仅支持SN或批次");
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
        assertThat(audit.getContentAfter()).contains("\"status\":\"生效\"");
    }

    @Test
    void productModelingFlushesRemovedOperationBindingsBeforeReplacingThemOnUpdate() {
        ProductProcess process = ProductProcess.builder().id(701L).tenantId("default").productVersionId(101L).build();
        ProductProcessVersion existing = ProductProcessVersion.builder()
                .id(702L).productProcessId(701L).versionLabel("V1.0")
                .productionMode("量产").productionForm("批次")
                .routeVersionId(301L).dhrTemplateVersionId(401L).build();
        ProductProcessOperationBinding existingBinding = ProductProcessOperationBinding.builder()
                .id(801L).productProcessVersionId(702L).routeNodeKey("operation-1")
                .operationId(901L).operationName("装配").sortOrder(1).build();
        ProductProcessVersionRequest request = versionRequest("V1.0", null, null);
        request.setOperationBindings(List.of(ProductProcessVersionRequest.OperationBindingRequest.builder()
                .routeNodeKey("operation-1").sortOrder(1).forms(List.of()).documents(List.of()).build()));

        stubProduct(process);
        when(productProcessVersionRepository.findByProductProcessIdAndId(701L, 702L)).thenReturn(Optional.of(existing));
        when(productProcessVersionRepository.findByProductProcessIdAndVersionLabelIgnoreCase(701L, "V1.0")).thenReturn(List.of(existing));
        when(productProcessVersionRepository.save(any(ProductProcessVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(routeNodeRepository.findByRouteVersionIdOrderBySortOrderAsc(301L)).thenReturn(List.of(RouteNode.builder()
                .id(901L).routeVersionId(301L).nodeKey("operation-1").operationId(901L).operationName("装配").sortOrder(1).build()));
        when(operationBindingRepository.findByProductProcessVersionIdOrderBySortOrderAsc(702L)).thenReturn(List.of(existingBinding));
        when(operationBindingRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(operationFormBindingRepository.findByProductProcessOperationBindingIdInOrderBySortOrderAsc(any())).thenReturn(List.of());
        when(operationDocumentBindingRepository.findByProductProcessOperationBindingIdInOrderBySortOrderAsc(any())).thenReturn(List.of());
        when(idGenerator.nextId()).thenReturn(1001L);

        controller.updateVersion(101L, 702L, request);

        verify(operationBindingRepository).flush();
    }

    @Test
    void productModelingDocumentOptionsExposeTheActualDocumentCategoryName() {
        Material product = Material.builder().id(101L).materialTypeId(10L).name("产品 A").code("P-001").build();
        SopDocument document = SopDocument.builder().id(501L).categoryId(601L).code("DOC-001").title("装配规程").build();
        DocumentVersion version = DocumentVersion.builder().id(701L).documentId(501L).version("V1.0").fileId(801L).effectiveDate(LocalDateTime.now().plusDays(1)).build();
        DocumentCategory category = DocumentCategory.builder().id(601L).tenantId("default").name("装配文件").build();
        when(materialRepository.findById(101L)).thenReturn(Optional.of(product));
        when(materialTypeRepository.findAll()).thenReturn(List.of(MaterialType.builder().id(10L).name("产成品").build()));
        when(routeRepository.findAll()).thenReturn(List.of());
        when(dhrTemplateRepository.findAll()).thenReturn(List.of());
        when(formTemplateRepository.findAll()).thenReturn(List.of());
        when(sopDocumentRepository.findAll()).thenReturn(List.of(document));
        when(documentCategoryRepository.findByTenantIdOrderBySortOrderAscNameAsc("default")).thenReturn(List.of(category));
        when(documentVersionRepository.findAll()).thenReturn(List.of(version));
        when(fileObjectRepository.findById(801L)).thenReturn(Optional.of(FileObject.builder().id(801L).originalName("装配规程.pdf").mimeType("application/pdf").build()));

        var response = controller.getProductModelOptions(101L);

        assertThat(response.getData().documents()).singleElement().satisfies(option -> {
            assertThat(option.documentCategoryName()).isEqualTo("装配文件");
            assertThat(option.status()).isEqualTo("EXPIRED");
            assertThat(option.fileId()).isEqualTo("801");
            assertThat(option.fileName()).isEqualTo("装配规程.pdf");
            assertThat(option.fileMimeType()).isEqualTo("application/pdf");
        });
    }

    @Test
    void productModelingRouteOptionsDoNotExposeParentCodesOrExpiredVersions() {
        Material product = Material.builder().id(101L).materialTypeId(10L).name("产品 A").code("P-001").build();
        com.zencas.edhr.masterdata.entity.Route route = com.zencas.edhr.masterdata.entity.Route.builder()
                .id(201L).name("无菌灌装路线").code("RT-LEGACY-001").build();
        RouteVersion active = RouteVersion.builder()
                .id(301L).routeId(201L).version("V1.0").code("RT-V1-001").effectiveDate(LocalDateTime.now().minusDays(1)).build();
        RouteVersion expired = RouteVersion.builder()
                .id(302L).routeId(201L).version("V0.9").code("RT-V0-001").expiryDate(LocalDateTime.now().minusDays(1)).build();
        when(materialRepository.findById(101L)).thenReturn(Optional.of(product));
        when(materialTypeRepository.findAll()).thenReturn(List.of(MaterialType.builder().id(10L).name("产成品").build()));
        when(routeRepository.findAll()).thenReturn(List.of(route));
        when(routeVersionRepository.findByRouteIdOrderByCreatedAtDesc(201L)).thenReturn(List.of(active, expired));
        when(dhrTemplateRepository.findAll()).thenReturn(List.of());
        when(formTemplateRepository.findAll()).thenReturn(List.of());
        when(sopDocumentRepository.findAll()).thenReturn(List.of());
        when(documentCategoryRepository.findByTenantIdOrderBySortOrderAscNameAsc("default")).thenReturn(List.of());
        when(documentVersionRepository.findAll()).thenReturn(List.of());

        var response = controller.getProductModelOptions(101L);

        assertThat(response.getData().routes()).singleElement().satisfies(option -> {
            assertThat(option.id()).isEqualTo("301");
            assertThat(option.versionCode()).isEqualTo("RT-V1-001");
            assertThat(option.status()).isEqualTo("ACTIVE");
        });
    }

    @Test
    void productModelingDhrOptionsExcludeExpiredVersions() {
        Material product = Material.builder().id(101L).materialTypeId(10L).name("产品 A").code("P-001").build();
        com.zencas.edhr.template.entity.DhrTemplate template = com.zencas.edhr.template.entity.DhrTemplate.builder()
                .id(401L).name("灌装批记录").code("DHR-PARENT-001").build();
        DhrTemplateVersion active = DhrTemplateVersion.builder()
                .id(501L).dhrTemplateId(401L).versionNumber(2).code("DHR-V2-001").effectiveFrom(LocalDateTime.now().minusDays(1)).build();
        DhrTemplateVersion expired = DhrTemplateVersion.builder()
                .id(502L).dhrTemplateId(401L).versionNumber(1).code("DHR-V1-001").effectiveTo(LocalDateTime.now().minusDays(1)).build();
        when(materialRepository.findById(101L)).thenReturn(Optional.of(product));
        when(materialTypeRepository.findAll()).thenReturn(List.of(MaterialType.builder().id(10L).name("产成品").build()));
        when(routeRepository.findAll()).thenReturn(List.of());
        when(dhrTemplateRepository.findAll()).thenReturn(List.of(template));
        when(dhrTemplateVersionRepository.findByDhrTemplateIdOrderByVersionNumberDesc(401L)).thenReturn(List.of(active, expired));
        when(formTemplateRepository.findAll()).thenReturn(List.of());
        when(sopDocumentRepository.findAll()).thenReturn(List.of());
        when(documentCategoryRepository.findByTenantIdOrderBySortOrderAscNameAsc("default")).thenReturn(List.of());
        when(documentVersionRepository.findAll()).thenReturn(List.of());

        var response = controller.getProductModelOptions(101L);

        assertThat(response.getData().dhrTemplates()).singleElement().satisfies(option -> {
            assertThat(option.id()).isEqualTo("501");
            assertThat(option.versionCode()).isEqualTo("DHR-V2-001");
            assertThat(option.status()).isEqualTo("ACTIVE");
        });
    }

    @Test
    void productModelingRejectsAFormOutsideTheSelectedDhrDirectory() {
        ProductProcess process = ProductProcess.builder().id(701L).tenantId("default").productVersionId(101L).build();
        ProductProcessVersionRequest request = versionRequest("V1.0", null, null);
        request.setOperationBindings(List.of(ProductProcessVersionRequest.OperationBindingRequest.builder()
                .routeNodeKey("operation-1").sortOrder(1)
                .forms(List.of(new ProductProcessVersionRequest.FormBindingRequest(601L, 501L, true, 1)))
                .documents(List.of()).build()));
        stubProduct(process);
        when(productProcessVersionRepository.findByProductProcessIdAndVersionLabelIgnoreCase(anyLong(), anyString())).thenReturn(List.of());
        when(productProcessVersionRepository.findByProductProcessIdOrderByCreatedAtDesc(701L)).thenReturn(List.of());
        when(productProcessVersionRepository.save(any(ProductProcessVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(routeNodeRepository.findByRouteVersionIdOrderBySortOrderAsc(301L)).thenReturn(List.of(RouteNode.builder()
                .id(800L).routeVersionId(301L).nodeKey("operation-1").operationId(801L).operationName("装配").build()));
        when(dhrTemplateItemRepository.findById(601L)).thenReturn(Optional.of(DhrTemplateItem.builder()
                .id(601L).directoryId(602L).formTemplateVersionId(501L).build()));
        when(dhrDirectoryRepository.findById(602L)).thenReturn(Optional.of(DhrDirectory.builder().id(602L).versionId(999L).name("其他DHR目录").build()));
        when(idGenerator.nextId()).thenReturn(900L);

        assertThatThrownBy(() -> controller.createVersion(101L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("必须来自所选批记录模板版本目录");
    }

    @Test
    void productModelingRejectsDuplicateDhrDirectoryFormsInOneOperation() {
        ProductProcess process = ProductProcess.builder().id(701L).tenantId("default").productVersionId(101L).build();
        ProductProcessVersionRequest request = versionRequest("V1.0", null, null);
        request.setOperationBindings(List.of(ProductProcessVersionRequest.OperationBindingRequest.builder()
                .routeNodeKey("operation-1").sortOrder(1)
                .forms(List.of(
                        new ProductProcessVersionRequest.FormBindingRequest(601L, 501L, true, 1),
                        new ProductProcessVersionRequest.FormBindingRequest(602L, 501L, true, 2)))
                .documents(List.of()).build()));
        stubProduct(process);
        when(productProcessVersionRepository.findByProductProcessIdAndVersionLabelIgnoreCase(anyLong(), anyString())).thenReturn(List.of());
        when(productProcessVersionRepository.findByProductProcessIdOrderByCreatedAtDesc(701L)).thenReturn(List.of());
        when(productProcessVersionRepository.save(any(ProductProcessVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(routeNodeRepository.findByRouteVersionIdOrderBySortOrderAsc(301L)).thenReturn(List.of(RouteNode.builder()
                .id(800L).routeVersionId(301L).nodeKey("operation-1").operationId(801L).operationName("装配").build()));
        when(dhrTemplateItemRepository.findById(601L)).thenReturn(Optional.of(DhrTemplateItem.builder().id(601L).directoryId(701L).formTemplateVersionId(501L).build()));
        when(dhrTemplateItemRepository.findById(602L)).thenReturn(Optional.of(DhrTemplateItem.builder().id(602L).directoryId(702L).formTemplateVersionId(501L).build()));
        when(dhrDirectoryRepository.findById(701L)).thenReturn(Optional.of(DhrDirectory.builder().id(701L).versionId(401L).build()));
        when(dhrDirectoryRepository.findById(702L)).thenReturn(Optional.of(DhrDirectory.builder().id(702L).versionId(401L).build()));
        when(formTemplateVersionRepository.findById(501L)).thenReturn(Optional.of(FormTemplateVersion.builder().id(501L).templateId(401L).version("V1.0").build()));
        when(idGenerator.nextId()).thenReturn(900L);

        assertThatThrownBy(() -> controller.createVersion(101L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("同一个表单模板版本");
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
