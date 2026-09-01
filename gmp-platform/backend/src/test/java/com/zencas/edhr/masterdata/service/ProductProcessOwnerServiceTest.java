package com.zencas.edhr.masterdata.service;

import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.entity.FileObject;
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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.ArgumentCaptor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductProcessOwnerServiceTest {

    @Mock private MaterialRepository materialRepository;
    @Mock private MaterialTypeRepository materialTypeRepository;
    @Mock private ProductFamilyRepository productFamilyRepository;
    @Mock private ProductProcessRepository productProcessRepository;
    @Mock private ProductProcessVersionRepository productProcessVersionRepository;
    @Mock private ProductProcessOperationBindingRepository operationBindingRepository;
    @Mock private ProductProcessOperationFormBindingRepository operationFormBindingRepository;
    @Mock private ProductProcessOperationDocumentBindingRepository operationDocumentBindingRepository;
    @Mock private RouteVersionRepository routeVersionRepository;
    @Mock private RouteNodeRepository routeNodeRepository;
    @Mock private DhrTemplateVersionRepository dhrTemplateVersionRepository;
    @Mock private DhrDirectoryRepository dhrDirectoryRepository;
    @Mock private DhrTemplateItemRepository dhrTemplateItemRepository;
    @Mock private FormTemplateVersionRepository formTemplateVersionRepository;
    @Mock private DocumentVersionRepository documentVersionRepository;
    @Mock private FileObjectRepository fileObjectRepository;
    @Mock private AuditEventRepository auditEventRepository;
    @Mock private SnowflakeIdGenerator idGenerator;
    @InjectMocks private ProductProcessOwnerService service;

    @Test
    void createsSeparateOwnerRootsAndRejectsDuplicateLabelsWithinTheSameOwner() {
        ProductProcess familyProcess = process(1001L, "PRODUCT_FAMILY", 201L);
        ProductProcess productProcess = process(1003L, "PRODUCT", 101L);
        ProductProcessVersion duplicate = ProductProcessVersion.builder().id(1002L).productProcessId(1001L).versionLabel("V1.0").build();

        when(productFamilyRepository.findById(201L)).thenReturn(Optional.of(ProductFamily.builder().id(201L).name("注射器产品簇").code("PF-001").build()));
        when(materialRepository.findById(101L)).thenReturn(Optional.of(Material.builder().id(101L).materialTypeId(1L).name("注射器成品").code("P-001").build()));
        when(materialTypeRepository.findAll()).thenReturn(List.of(MaterialType.builder().id(1L).name("产成品").build()));
        when(productProcessRepository.findByTenantIdAndOwnerTypeAndOwnerId("default", "PRODUCT_FAMILY", 201L))
                .thenReturn(Optional.empty(), Optional.of(familyProcess));
        when(productProcessRepository.findByTenantIdAndOwnerTypeAndOwnerId("default", "PRODUCT", 101L))
                .thenReturn(Optional.empty());
        when(productProcessRepository.save(any(ProductProcess.class))).thenAnswer(invocation -> {
            ProductProcess process = invocation.getArgument(0);
            if ("PRODUCT_FAMILY".equals(process.getOwnerType())) process.setId(1001L);
            else process.setId(1003L);
            return process;
        });
        when(productProcessVersionRepository.findByProductProcessIdAndVersionLabelIgnoreCase(org.mockito.ArgumentMatchers.eq(1001L), anyString()))
                .thenReturn(List.of(), List.of(duplicate));
        when(productProcessVersionRepository.findByProductProcessIdAndVersionLabelIgnoreCase(org.mockito.ArgumentMatchers.eq(1003L), anyString()))
                .thenReturn(List.of());
        when(productProcessVersionRepository.save(any(ProductProcessVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(routeVersionRepository.findById(301L)).thenReturn(Optional.of(RouteVersion.builder().id(301L).build()));
        when(dhrTemplateVersionRepository.findById(401L)).thenReturn(Optional.of(DhrTemplateVersion.builder().id(401L).build()));
        when(idGenerator.nextId()).thenReturn(9001L, 9002L, 9003L, 9004L, 9005L, 9006L);

        ProductProcessVersion familyVersion = service.createVersion(ProcessOwnerType.PRODUCT_FAMILY, 201L, request("V1.0"));

        assertThat(familyVersion.getProductProcessId()).isEqualTo(1001L);
        assertThatThrownBy(() -> service.createVersion(ProcessOwnerType.PRODUCT_FAMILY, 201L, request("v1.0")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("版本号已存在");

        ProductProcessVersion productVersion = service.createVersion(ProcessOwnerType.PRODUCT, 101L, request("V1.0"));

        assertThat(productVersion.getProductProcessId()).isEqualTo(1003L);
        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository, times(3)).save(auditCaptor.capture());
        assertThat(auditCaptor.getAllValues())
                .extracting(event -> event.getEntityType() + ":" + event.getEntityId() + ":" + event.getAction())
                .contains("PRODUCT_FAMILY:201:UPDATE");
        AuditEvent familyAudit = auditCaptor.getAllValues().stream()
                .filter(event -> "PRODUCT_FAMILY".equals(event.getEntityType()))
                .findFirst()
                .orElseThrow();
        assertThat(familyAudit.getFunctionName()).isEqualTo("新增制程配置版本");
        assertThat(familyAudit.getContentAfter())
                .contains("processVersion", "V1.0", "productionMode", "routeVersionId", "dhrTemplateVersionId");
    }

    @Test
    void sharedOwnerServiceRejectsBatchToSnProductionForm() {
        ProductProcess process = process(1001L, "PRODUCT_FAMILY", 201L);
        when(productFamilyRepository.findById(201L))
                .thenReturn(Optional.of(ProductFamily.builder().id(201L).name("注射器产品簇").code("PF-001").build()));
        when(productProcessRepository.findByTenantIdAndOwnerTypeAndOwnerId("default", "PRODUCT_FAMILY", 201L))
                .thenReturn(Optional.of(process));
        ProductProcessVersionRequest request = request("V1.0");
        request.setProductionForm("批次转SN");

        assertThatThrownBy(() -> service.createVersion(ProcessOwnerType.PRODUCT_FAMILY, 201L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("生产方式仅支持SN或批次");
    }

    @Test
    void recordsProductFamilyUpdateAndDeleteAuditsWithOperationConfigurationSnapshots() {
        ProductProcess process = process(1001L, "PRODUCT_FAMILY", 201L);
        LocalDateTime now = LocalDateTime.now().withNano(0);
        ProductProcessVersion existing = ProductProcessVersion.builder()
                .id(1002L).productProcessId(1001L).versionLabel("V1.0")
                .productionMode("量产").productionForm("批次")
                .routeVersionId(301L).dhrTemplateVersionId(401L)
                .effectiveFrom(now.minusDays(1)).effectiveTo(now.plusDays(1))
                .build();
        ProductProcessOperationBinding savedBinding = ProductProcessOperationBinding.builder()
                .id(9001L).productProcessVersionId(1002L).routeNodeKey("OP-ASSEMBLY")
                .operationId(501L).operationCode("OP-ASSY").operationName("装配").sortOrder(10)
                .build();
        ProductProcessOperationFormBinding formBinding = ProductProcessOperationFormBinding.builder()
                .id(9002L).productProcessOperationBindingId(9001L).dhrTemplateItemId(601L)
                .formTemplateVersionId(701L).required(true).build();
        ProductProcessOperationDocumentBinding documentBinding = ProductProcessOperationDocumentBinding.builder()
                .id(9003L).productProcessOperationBindingId(9001L).documentVersionId(801L)
                .pageStart(2).pageEnd(4).build();

        when(productFamilyRepository.findById(201L))
                .thenReturn(Optional.of(ProductFamily.builder().id(201L).name("注射器产品簇").code("PF-001").build()));
        when(productProcessRepository.findByTenantIdAndOwnerTypeAndOwnerId("default", "PRODUCT_FAMILY", 201L))
                .thenReturn(Optional.of(process));
        when(productProcessVersionRepository.findByProductProcessIdAndId(1001L, 1002L))
                .thenReturn(Optional.of(existing));
        when(productProcessVersionRepository.findByProductProcessIdAndVersionLabelIgnoreCase(1001L, "V2.0"))
                .thenReturn(List.of());
        when(productProcessVersionRepository.save(existing)).thenReturn(existing);
        when(productProcessVersionRepository.findByProductProcessIdOrderByCreatedAtDesc(1001L)).thenReturn(List.of());
        when(routeVersionRepository.findById(301L)).thenReturn(Optional.of(RouteVersion.builder().id(301L).build()));
        when(dhrTemplateVersionRepository.findById(401L)).thenReturn(Optional.of(DhrTemplateVersion.builder().id(401L).build()));
        when(routeNodeRepository.findByRouteVersionIdOrderBySortOrderAsc(301L)).thenReturn(List.of(RouteNode.builder()
                .nodeKey("OP-ASSEMBLY").nodeType("OPERATION").operationId(501L)
                .operationCode("OP-ASSY").operationName("装配").sortOrder(10).build()));
        when(dhrTemplateItemRepository.findById(601L)).thenReturn(Optional.of(DhrTemplateItem.builder()
                .id(601L).directoryId(602L).formTemplateVersionId(701L).build()));
        when(dhrDirectoryRepository.findById(602L)).thenReturn(Optional.of(DhrDirectory.builder().id(602L).versionId(401L).build()));
        when(formTemplateVersionRepository.findById(701L)).thenReturn(Optional.of(FormTemplateVersion.builder().id(701L).build()));
        when(documentVersionRepository.findById(801L)).thenReturn(Optional.of(DocumentVersion.builder().id(801L).fileId(901L).build()));
        when(fileObjectRepository.findById(901L)).thenReturn(Optional.of(FileObject.builder()
                .id(901L).originalName("装配作业指导书.pdf").mimeType("application/pdf").build()));
        when(operationBindingRepository.findByProductProcessVersionIdOrderBySortOrderAsc(1002L))
                .thenReturn(List.of(), List.of(), List.of(savedBinding), List.of(savedBinding), List.of(savedBinding));
        when(operationBindingRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(operationFormBindingRepository.findByProductProcessOperationBindingIdInOrderBySortOrderAsc(List.of(9001L)))
                .thenReturn(List.of(formBinding));
        when(operationDocumentBindingRepository.findByProductProcessOperationBindingIdInOrderBySortOrderAsc(List.of(9001L)))
                .thenReturn(List.of(documentBinding));
        when(idGenerator.nextId()).thenReturn(9001L, 9002L, 9003L);

        ProductProcessVersionRequest updateRequest = ProductProcessVersionRequest.builder()
                .version("V2.0").productionMode("返工").productionForm("SN")
                .routeVersionId(301L).dhrTemplateVersionId(401L).description("更新后的制程配置")
                .effectiveFrom(now).effectiveTo(now.plusDays(30))
                .operationBindings(List.of(ProductProcessVersionRequest.OperationBindingRequest.builder()
                        .routeNodeKey("OP-ASSEMBLY").sortOrder(10)
                        .forms(List.of(ProductProcessVersionRequest.FormBindingRequest.builder()
                                .dhrTemplateItemId(601L).formTemplateVersionId(701L).required(true).build()))
                        .documents(List.of(ProductProcessVersionRequest.DocumentBindingRequest.builder()
                                .documentVersionId(801L).pageStart(2).pageEnd(4).build()))
                        .build()))
                .build();

        service.updateVersion(ProcessOwnerType.PRODUCT_FAMILY, 201L, 1002L, updateRequest);
        service.deleteVersion(ProcessOwnerType.PRODUCT_FAMILY, 201L, 1002L);

        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository, times(4)).save(auditCaptor.capture());
        List<AuditEvent> ownerAudits = auditCaptor.getAllValues().stream()
                .filter(event -> "PRODUCT_FAMILY".equals(event.getEntityType()))
                .toList();
        assertThat(ownerAudits).hasSize(2);

        AuditEvent updateAudit = ownerAudits.stream()
                .filter(event -> "编辑制程配置版本".equals(event.getFunctionName()))
                .findFirst().orElseThrow();
        assertThat(updateAudit.getContentBefore()).contains("V1.0", "productionMode", "effectiveFrom");
        assertThat(updateAudit.getContentAfter()).contains(
                "V2.0", "返工", "operationBindings", "装配", "表单版本 #701", "文档版本 #801", "展示第2页至第4页", "status");

        AuditEvent deleteAudit = ownerAudits.stream()
                .filter(event -> "删除制程配置版本".equals(event.getFunctionName()))
                .findFirst().orElseThrow();
        assertThat(deleteAudit.getContentBefore()).contains(
                "V2.0", "operationBindings", "装配", "表单版本 #701", "文档版本 #801", "展示第2页至第4页");
        assertThat(deleteAudit.getContentAfter()).contains("processVersion");
    }

    private ProductProcessVersionRequest request(String version) {
        return ProductProcessVersionRequest.builder().version(version).productionMode("量产").productionForm("批次")
                .routeVersionId(301L).dhrTemplateVersionId(401L).build();
    }

    private ProductProcess process(Long id, String ownerType, Long ownerId) {
        return ProductProcess.builder().id(id).tenantId("default").ownerType(ownerType).ownerId(ownerId)
                .productVersionId("PRODUCT".equals(ownerType) ? ownerId : null).build();
    }
}
