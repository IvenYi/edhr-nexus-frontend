package com.zencas.edhr.masterdata.controller;

import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.masterdata.entity.DocumentCategory;
import com.zencas.edhr.masterdata.entity.DocumentVersion;
import com.zencas.edhr.masterdata.entity.SopDocument;
import com.zencas.edhr.masterdata.repository.DocumentCategoryRepository;
import com.zencas.edhr.masterdata.repository.DocumentVersionRepository;
import com.zencas.edhr.masterdata.repository.ProductProcessOperationDocumentBindingRepository;
import com.zencas.edhr.masterdata.repository.SopDocumentRepository;
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
class DocumentManagementControllerTest {

    @Mock private SopDocumentRepository documentRepository;
    @Mock private DocumentCategoryRepository documentCategoryRepository;
    @Mock private DocumentVersionRepository documentVersionRepository;
    @Mock private ProductProcessOperationDocumentBindingRepository operationDocumentBindingRepository;
    @Mock private FileObjectRepository fileObjectRepository;
    @Mock private AuditEventRepository auditEventRepository;
    @Mock private SnowflakeIdGenerator idGenerator;
    @InjectMocks private DocumentManagementController controller;

    @Test
    void createsADocumentInTheSelectedCategoryWithAnInitialVersionAndAuditsBoth() {
        DocumentCategory category = DocumentCategory.builder().id(201L).tenantId("default").name("SIP").systemCategory(true).build();
        when(documentVersionRepository.existsByTenantIdAndCodeIgnoreCase("default", "SIP-001")).thenReturn(false);
        when(documentCategoryRepository.findById(201L)).thenReturn(Optional.of(category));
        when(documentVersionRepository.existsByDocumentIdAndVersionIgnoreCase(anyLong(), anyString())).thenReturn(false);
        when(documentRepository.save(any(SopDocument.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(documentVersionRepository.save(any(DocumentVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(auditEventRepository.save(any(AuditEvent.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(101L, 102L, 103L, 104L);

        var response = controller.create(new DocumentManagementController.DocumentWriteRequest(
                "SIP-001", "来料检验指导书", "201", "", "", "V1.0", null, null,
                "初始版本", null, null, null));

        assertThat(response.getData().categoryId()).isEqualTo("201");
        assertThat(response.getData().categoryName()).isEqualTo("SIP");
        assertThat(response.getData().versions()).singleElement().satisfies(version -> {
            assertThat(version.version()).isEqualTo("V1.0");
            assertThat(version.code()).isEqualTo("SIP-001");
            assertThat(version.status()).isEqualTo("ACTIVE");
        });
        ArgumentCaptor<AuditEvent> audits = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository, org.mockito.Mockito.times(2)).save(audits.capture());
        assertThat(audits.getAllValues()).extracting(AuditEvent::getEntityType)
                .containsExactly("PROCESS_DOCUMENT", "DOCUMENT_VERSION");
    }

    @Test
    void treatsAFutureDocumentVersionAsExpiredUntilItsEffectiveTime() {
        when(documentVersionRepository.existsByTenantIdAndCodeIgnoreCase("default", "SOP-002")).thenReturn(false);
        when(documentVersionRepository.existsByDocumentIdAndVersionIgnoreCase(anyLong(), anyString())).thenReturn(false);
        when(documentRepository.save(any(SopDocument.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(documentVersionRepository.save(any(DocumentVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(auditEventRepository.save(any(AuditEvent.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(201L, 202L, 203L, 204L);

        var response = controller.create(new DocumentManagementController.DocumentWriteRequest(
                "SOP-002", "待执行作业指导书", null, null, null, "V1.0", null, null,
                null, null, LocalDateTime.now().plusDays(1), null));

        assertThat(response.getData().versions()).singleElement()
                .extracting(DocumentManagementController.DocumentVersionResponse::status)
                .isEqualTo("EXPIRED");
    }

    @Test
    void exposesVirtualAllAndUncategorizedBucketsAlongsidePersistedCategories() {
        DocumentCategory sop = DocumentCategory.builder().id(201L).tenantId("default").name("SOP").systemCategory(true).sortOrder(10).build();
        DocumentCategory sip = DocumentCategory.builder().id(202L).tenantId("default").name("SIP").systemCategory(true).sortOrder(20).build();
        when(documentRepository.findAll()).thenReturn(List.of(
                SopDocument.builder().id(101L).categoryId(201L).build(),
                SopDocument.builder().id(102L).categoryId(201L).build(),
                SopDocument.builder().id(103L).categoryId(202L).build(),
                SopDocument.builder().id(104L).categoryId(null).build()));
        when(documentCategoryRepository.findByTenantIdOrderBySortOrderAscNameAsc("default")).thenReturn(List.of(sop, sip));

        var categories = controller.listCategories().getData();

        assertThat(categories).extracting(DocumentManagementController.DocumentCategoryResponse::name)
                .containsExactly("全部", "未分类", "SOP", "SIP");
        assertThat(categories).extracting(DocumentManagementController.DocumentCategoryResponse::count)
                .containsExactly(4L, 1L, 2L, 1L);
    }

    @Test
    void rejectsDuplicateDocumentCategoryNamesIgnoringCase() {
        when(documentCategoryRepository.existsByTenantIdAndNameIgnoreCase("default", "作业指导书")).thenReturn(true);

        assertThatThrownBy(() -> controller.createCategory(new DocumentManagementController.DocumentCategoryRequest("作业指导书")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("文档分类已存在");
    }

    @Test
    void rejectsRenamingACategoryToAnotherExistingName() {
        DocumentCategory existing = DocumentCategory.builder().id(301L).tenantId("default").name("装配").build();
        DocumentCategory duplicate = DocumentCategory.builder().id(302L).tenantId("default").name("检验").build();
        when(documentCategoryRepository.findById(301L)).thenReturn(Optional.of(existing));
        when(documentCategoryRepository.findByTenantIdAndNameIgnoreCase("default", "检验")).thenReturn(Optional.of(duplicate));

        assertThatThrownBy(() -> controller.updateCategory(301L, new DocumentManagementController.DocumentCategoryRequest("检验")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("文档分类已存在");
    }

    @Test
    void doesNotAllowSystemCategoriesToBeDeleted() {
        DocumentCategory systemCategory = DocumentCategory.builder().id(201L).tenantId("default").name("SOP").systemCategory(true).build();
        when(documentCategoryRepository.findById(201L)).thenReturn(Optional.of(systemCategory));

        assertThatThrownBy(() -> controller.deleteCategory(201L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("系统内置文档分类不允许编辑或删除");
    }

    @Test
    void deletingACustomCategoryMovesItsDocumentsToUncategorized() {
        DocumentCategory category = DocumentCategory.builder().id(301L).tenantId("default").name("装配").build();
        SopDocument document = SopDocument.builder().id(101L).categoryId(301L).documentType("OTHER").code("DOC-001").title("装配指导书").build();
        when(documentCategoryRepository.findById(301L)).thenReturn(Optional.of(category));
        when(documentRepository.findAll()).thenReturn(List.of(document));
        when(documentRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(auditEventRepository.save(any(AuditEvent.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(401L, 402L);

        controller.deleteCategory(301L);

        assertThat(document.getCategoryId()).isNull();
        assertThat(document.getDocumentType()).isEqualTo("OTHER");
        verify(documentCategoryRepository).delete(category);
    }

    @Test
    void rejectsDuplicateVersionLabelsForTheSameDocument() {
        SopDocument document = SopDocument.builder().id(101L).title("装配作业指导书").documentType("SOP").build();
        when(documentRepository.findById(101L)).thenReturn(Optional.of(document));
        when(documentVersionRepository.existsByDocumentIdAndVersionIgnoreCase(101L, "V1.0")).thenReturn(true);

        assertThatThrownBy(() -> controller.createVersion(101L,
                new DocumentManagementController.DocumentVersionWriteRequest("V1.0", "SOP-001", null, null, null, null, null, null)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("版本号已存在");
    }

    @Test
    void rejectsDuplicateDocumentVersionCodesAcrossDocuments() {
        SopDocument document = SopDocument.builder().id(101L).title("装配作业指导书").documentType("SOP").build();
        when(documentRepository.findById(101L)).thenReturn(Optional.of(document));
        when(documentVersionRepository.existsByDocumentIdAndVersionIgnoreCase(101L, "V2.0")).thenReturn(false);
        when(documentVersionRepository.existsByTenantIdAndCodeIgnoreCase("default", "SOP-001")).thenReturn(true);

        assertThatThrownBy(() -> controller.createVersion(101L,
                new DocumentManagementController.DocumentVersionWriteRequest("V2.0", "SOP-001", null, null, null, null, null, null)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("文档版本编码已存在");
    }

    @Test
    void doesNotDeleteADocumentVersionReferencedByProductProcessConfiguration() {
        SopDocument document = SopDocument.builder().id(101L).title("装配作业指导书").documentType("SOP").build();
        DocumentVersion version = DocumentVersion.builder().id(102L).documentId(101L).version("V1.0").code("SOP-001").build();
        when(documentRepository.findById(101L)).thenReturn(Optional.of(document));
        when(documentVersionRepository.findByDocumentIdAndId(101L, 102L)).thenReturn(Optional.of(version));
        when(operationDocumentBindingRepository.countByDocumentVersionId(102L)).thenReturn(1L);

        assertThatThrownBy(() -> controller.deleteVersion(101L, 102L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("已被产品工序引用");
    }

    @Test
    void rejectsAnInvalidEffectiveWindow() {
        SopDocument document = SopDocument.builder().id(101L).title("装配作业指导书").documentType("SOP").build();
        when(documentRepository.findById(101L)).thenReturn(Optional.of(document));
        when(documentVersionRepository.existsByDocumentIdAndVersionIgnoreCase(101L, "V2.0")).thenReturn(false);

        assertThatThrownBy(() -> controller.createVersion(101L,
                new DocumentManagementController.DocumentVersionWriteRequest("V2.0", "SOP-002", null, null, null, null,
                        LocalDateTime.of(2026, 9, 1, 0, 0), LocalDateTime.of(2026, 8, 1, 0, 0))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("失效时间不能早于生效时间");
    }
}
