package com.zencas.edhr.system.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.entity.FileObject;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.system.entity.IconAsset;
import com.zencas.edhr.system.entity.IconGroup;
import com.zencas.edhr.system.repository.IconAssetRepository;
import com.zencas.edhr.system.repository.IconGroupRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IconManagementControllerTest {

    @Mock private IconGroupRepository iconGroupRepository;
    @Mock private IconAssetRepository iconAssetRepository;
    @Mock private FileObjectRepository fileObjectRepository;
    @Mock private AuditEventRepository auditEventRepository;
    @Mock private SnowflakeIdGenerator idGenerator;
    @InjectMocks private IconManagementController controller;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @AfterEach
    void clearAuditContext() {
        AuditContext.clear();
    }

    @Test
    void listGroupsReturnsStringIdsAndIconCounts() {
        IconGroup builtin = IconGroup.builder()
                .id(10040L)
                .tenantId("default")
                .name("系统内置图标")
                .sortOrder(0)
                .build();
        IconGroup custom = IconGroup.builder()
                .id(340755752665980928L)
                .tenantId("default")
                .name("质量图标")
                .sortOrder(1)
                .build();
        when(iconGroupRepository.findByTenantIdOrderBySortOrderAscCreatedAtAsc("default")).thenReturn(List.of(builtin, custom));
        when(iconAssetRepository.countByGroupIdIn(List.of(10040L, 340755752665980928L))).thenReturn(List.of(
                new IconAssetRepository.GroupIconCount(10040L, 84L),
                new IconAssetRepository.GroupIconCount(340755752665980928L, 2L)));

        var response = controller.listGroups();

        assertThat(response.getData()).hasSize(2);
        assertThat(response.getData().getFirst().id()).isEqualTo("10040");
        assertThat(response.getData().getFirst().builtin()).isTrue();
        assertThat(response.getData().getFirst().iconCount()).isEqualTo(84);
        assertThat(response.getData().get(1).id()).isEqualTo("340755752665980928");
        assertThat(response.getData().get(1).builtin()).isFalse();
        assertThat(response.getData().get(1).iconCount()).isEqualTo(2);
    }

    @Test
    void createGroupReturnsStringIdSoFrontendCanDeleteSafely() {
        AuditContext.setOperator("1", "admin");
        IconGroup saved = IconGroup.builder()
                .id(340795364554358800L)
                .tenantId("default")
                .name("QA图标")
                .sortOrder(0)
                .createdBy("1")
                .build();
        when(idGenerator.nextId()).thenReturn(340795364554358800L, 901L);
        when(iconGroupRepository.save(any(IconGroup.class))).thenReturn(saved);

        var response = controller.createGroup(new IconManagementController.GroupRequest("QA图标", null));

        assertThat(response.getData().id()).isEqualTo("340795364554358800");
        assertThat(response.getData().iconCount()).isZero();
        assertThat(response.getData().builtin()).isFalse();
        verify(auditEventRepository).save(any(AuditEvent.class));
    }

    @Test
    void refusesToCreateGroupWithBuiltinName() {
        assertThatThrownBy(() -> controller.createGroup(new IconManagementController.GroupRequest("系统内置图标", null)))
                .isInstanceOf(BusinessException.class)
                .hasMessage("系统内置图标分组已存在，不能创建同名分组");

        verify(iconGroupRepository, never()).save(any(IconGroup.class));
        verify(auditEventRepository, never()).save(any(AuditEvent.class));
    }

    @Test
    void refusesToRenameBuiltinGroup() {
        IconGroup builtin = IconGroup.builder()
                .id(10040L)
                .tenantId("default")
                .name("系统内置图标")
                .sortOrder(0)
                .builtin(true)
                .build();
        when(iconGroupRepository.findById(10040L)).thenReturn(Optional.of(builtin));

        assertThatThrownBy(() -> controller.updateGroup(10040L, new IconManagementController.GroupRequest("普通分组", null)))
                .isInstanceOf(BusinessException.class)
                .hasMessage("系统内置图标分组不能重命名");

        verify(iconGroupRepository, never()).save(any(IconGroup.class));
        verify(auditEventRepository, never()).save(any(AuditEvent.class));
    }

    @Test
    void refusesToRenameCustomGroupToBuiltinName() {
        IconGroup group = IconGroup.builder()
                .id(10L)
                .tenantId("default")
                .name("自建分组")
                .sortOrder(1)
                .builtin(false)
                .build();
        when(iconGroupRepository.findById(10L)).thenReturn(Optional.of(group));

        assertThatThrownBy(() -> controller.updateGroup(10L, new IconManagementController.GroupRequest("系统内置图标", null)))
                .isInstanceOf(BusinessException.class)
                .hasMessage("系统内置图标分组已存在，不能创建同名分组");

        verify(iconGroupRepository, never()).save(any(IconGroup.class));
        verify(auditEventRepository, never()).save(any(AuditEvent.class));
    }

    @Test
    void builtinIconsExposeBuiltinKeyInListResponse() {
        IconAsset settings = IconAsset.builder()
                .id(201L)
                .tenantId("default")
                .groupId(100L)
                .name("Settings")
                .tags("系统,菜单,Settings")
                .source("BUILTIN")
                .builtinKey("Settings")
                .sortOrder(1)
                .createdAt(LocalDateTime.of(2026, 6, 12, 8, 0))
                .build();
        when(iconAssetRepository.findAll(
                any(org.springframework.data.jpa.domain.Specification.class),
                any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(new org.springframework.data.domain.PageImpl<>(List.of(settings)));

        var response = controller.listIcons(null, null, 1, 60);

        assertThat(response.getData().getContent()).hasSize(1);
        assertThat(response.getData().getContent().getFirst().source()).isEqualTo("BUILTIN");
        assertThat(response.getData().getContent().getFirst().builtinKey()).isEqualTo("Settings");
        assertThat(response.getData().getContent().getFirst().fileId()).isNull();
        assertThat(response.getData().getContent().getFirst().id()).isEqualTo("201");
        assertThat(response.getData().getContent().getFirst().groupId()).isEqualTo("100");
    }

    @Test
    void refusesToDeleteBuiltinIcon() {
        IconAsset builtin = IconAsset.builder()
                .id(201L)
                .source("BUILTIN")
                .builtinKey("Settings")
                .name("Settings")
                .build();
        when(iconAssetRepository.findById(201L)).thenReturn(Optional.of(builtin));

        assertThatThrownBy(() -> controller.deleteIcon(201L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("系统内置图标不能删除");

        verify(iconAssetRepository, never()).deleteById(201L);
        verify(fileObjectRepository, never()).deleteAllById(any());
        verify(auditEventRepository, never()).save(any(AuditEvent.class));
    }

    @Test
    void refusesToBatchDeleteWhenSelectionContainsBuiltinIcon() {
        IconAsset uploaded = IconAsset.builder()
                .id(101L)
                .fileId(501L)
                .name("上传图标")
                .source("UPLOAD")
                .build();
        IconAsset builtin = IconAsset.builder()
                .id(201L)
                .name("Settings")
                .source("BUILTIN")
                .builtinKey("Settings")
                .build();
        when(iconAssetRepository.findAllById(List.of(101L, 201L))).thenReturn(List.of(uploaded, builtin));

        assertThatThrownBy(() -> controller.batchDeleteIcons(new IconManagementController.BatchDeleteRequest(List.of(101L, 201L))))
                .isInstanceOf(BusinessException.class)
                .hasMessage("系统内置图标不能删除");

        verify(iconAssetRepository, never()).deleteAll(any());
        verify(fileObjectRepository, never()).deleteAllById(any());
        verify(auditEventRepository, never()).save(any(AuditEvent.class));
    }

    @Test
    void updateIconCanClearGroupWhenGroupIdIsExplicitNull() throws Exception {
        IconAsset existing = IconAsset.builder()
                .id(101L)
                .tenantId("default")
                .groupId(10L)
                .fileId(501L)
                .name("上传图标")
                .source("UPLOAD")
                .build();
        when(iconAssetRepository.findById(101L)).thenReturn(Optional.of(existing));
        when(iconAssetRepository.save(existing)).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(901L);

        controller.updateIcon(101L, objectMapper.readTree("{\"groupId\":null}"));

        assertThat(existing.getGroupId()).isNull();
        verify(iconAssetRepository).save(existing);
    }

    @Test
    void refusesToMoveBuiltinIcon() throws Exception {
        IconAsset builtin = IconAsset.builder()
                .id(201L)
                .tenantId("default")
                .groupId(10040L)
                .name("Settings")
                .source("BUILTIN")
                .builtinKey("Settings")
                .build();
        when(iconAssetRepository.findById(201L)).thenReturn(Optional.of(builtin));

        assertThatThrownBy(() -> controller.updateIcon(201L, objectMapper.readTree("{\"groupId\":10}")))
                .isInstanceOf(BusinessException.class)
                .hasMessage("系统内置图标不能移动");

        verify(iconAssetRepository, never()).save(any(IconAsset.class));
        verify(auditEventRepository, never()).save(any(AuditEvent.class));
    }

    @Test
    void refusesToMoveCustomIconIntoBuiltinGroup() throws Exception {
        IconAsset customIcon = IconAsset.builder()
                .id(101L)
                .tenantId("default")
                .groupId(10L)
                .name("上传图标")
                .source("UPLOAD")
                .build();
        IconGroup builtinGroup = IconGroup.builder()
                .id(10040L)
                .tenantId("default")
                .name("系统内置图标")
                .sortOrder(0)
                .builtin(true)
                .build();
        when(iconAssetRepository.findById(101L)).thenReturn(Optional.of(customIcon));
        when(iconGroupRepository.findById(10040L)).thenReturn(Optional.of(builtinGroup));

        assertThatThrownBy(() -> controller.updateIcon(101L, objectMapper.readTree("{\"groupId\":10040}")))
                .isInstanceOf(BusinessException.class)
                .hasMessage("系统内置图标分组不能放入自定义图标");

        verify(iconAssetRepository, never()).save(any(IconAsset.class));
        verify(auditEventRepository, never()).save(any(AuditEvent.class));
    }

    @Test
    void refusesToUploadIconIntoBuiltinGroup() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "custom.svg",
                "image/svg+xml",
                "<svg />".getBytes());
        IconGroup builtinGroup = IconGroup.builder()
                .id(10040L)
                .tenantId("default")
                .name("系统内置图标")
                .sortOrder(0)
                .builtin(true)
                .build();
        when(iconGroupRepository.findById(10040L)).thenReturn(Optional.of(builtinGroup));

        assertThatThrownBy(() -> controller.uploadIcon(file, 10040L, null, null))
                .isInstanceOf(BusinessException.class)
                .hasMessage("系统内置图标分组不能放入自定义图标");

        verify(fileObjectRepository, never()).save(any(FileObject.class));
        verify(iconAssetRepository, never()).save(any(IconAsset.class));
        verify(auditEventRepository, never()).save(any(AuditEvent.class));
    }

    @Test
    void uploadIconDefaultsTagToUserUploadWhenTagIsBlank() throws Exception {
        AuditContext.setOperator("99", "系统管理员");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "custom.svg",
                "image/svg+xml",
                "<svg />".getBytes());
        when(idGenerator.nextId()).thenReturn(501L, 101L, 901L);
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(iconAssetRepository.save(any(IconAsset.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.uploadIcon(file, 10L, null, null);

        assertThat(response.getData().tags()).isEqualTo("用户上传");
        ArgumentCaptor<IconAsset> iconCaptor = ArgumentCaptor.forClass(IconAsset.class);
        verify(iconAssetRepository).save(iconCaptor.capture());
        assertThat(iconCaptor.getValue().getTags()).isEqualTo("用户上传");
    }

    @Test
    void refusesToDeleteGroupWhenIconsExist() {
        IconGroup group = IconGroup.builder()
                .id(10L)
                .tenantId("default")
                .name("质量图标")
                .sortOrder(1)
                .build();
        when(iconGroupRepository.findById(10L)).thenReturn(Optional.of(group));
        when(iconAssetRepository.existsByGroupId(10L)).thenReturn(true);

        assertThatThrownBy(() -> controller.deleteGroup(10L, false))
                .isInstanceOf(BusinessException.class)
                .hasMessage("分组下存在图标，不能删除");

        verify(iconGroupRepository, never()).deleteById(10L);
        verify(auditEventRepository, never()).save(any(AuditEvent.class));
    }

    @Test
    void cascadeDeleteGroupRemovesGroupIconsAndFiles() throws Exception {
        AuditContext.setOperator("99", "系统管理员");
        Path tempFile = Files.createTempFile("icon-group-delete", ".svg");
        IconGroup group = IconGroup.builder()
                .id(10L)
                .tenantId("default")
                .name("质量图标")
                .sortOrder(1)
                .build();
        IconAsset icon = IconAsset.builder()
                .id(101L)
                .tenantId("default")
                .groupId(10L)
                .fileId(501L)
                .name("上传图标")
                .source("UPLOAD")
                .build();
        when(iconGroupRepository.findById(10L)).thenReturn(Optional.of(group));
        when(iconAssetRepository.findByGroupIdOrderBySortOrderAscCreatedAtAsc(10L)).thenReturn(List.of(icon));
        when(fileObjectRepository.findAllById(List.of(501L))).thenReturn(List.of(
                FileObject.builder().id(501L).originalName("icon.svg").storedPath(tempFile.toString()).build()));
        when(idGenerator.nextId()).thenReturn(901L);

        controller.deleteGroup(10L, true);

        verify(iconAssetRepository).deleteAll(List.of(icon));
        verify(iconGroupRepository).deleteById(10L);
        verify(fileObjectRepository).deleteAllById(List.of(501L));
        assertThat(Files.exists(tempFile)).isFalse();

        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        JsonNode before = objectMapper.readTree(auditCaptor.getValue().getContentBefore());
        assertThat(before.get("icons")).hasSize(1);
        assertThat(before.get("group").get("name").asText()).isEqualTo("质量图标");
    }

    @Test
    void refusesToCascadeDeleteBuiltinGroup() {
        IconGroup builtin = IconGroup.builder()
                .id(10040L)
                .tenantId("default")
                .name("系统内置图标")
                .sortOrder(0)
                .builtin(true)
                .build();
        when(iconGroupRepository.findById(10040L)).thenReturn(Optional.of(builtin));

        assertThatThrownBy(() -> controller.deleteGroup(10040L, true))
                .isInstanceOf(BusinessException.class)
                .hasMessage("系统内置图标分组不能删除");

        verify(iconAssetRepository, never()).deleteAll(any());
        verify(iconGroupRepository, never()).deleteById(10040L);
        verify(auditEventRepository, never()).save(any(AuditEvent.class));
    }

    @Test
    void refusesToDeleteBuiltinGroup() {
        IconGroup builtin = IconGroup.builder()
                .id(10040L)
                .tenantId("default")
                .name("系统内置图标")
                .sortOrder(0)
                .builtin(true)
                .build();
        when(iconGroupRepository.findById(10040L)).thenReturn(Optional.of(builtin));

        assertThatThrownBy(() -> controller.deleteGroup(10040L, false))
                .isInstanceOf(BusinessException.class)
                .hasMessage("系统内置图标分组不能删除");

        verify(iconGroupRepository, never()).deleteById(10040L);
        verify(auditEventRepository, never()).save(any(AuditEvent.class));
    }

    @Test
    void batchDeleteRemovesIconMetadataAndAttemptsFileCleanup() throws Exception {
        AuditContext.setOperator("99", "系统管理员");
        Path tempFile = Files.createTempFile("icon-delete", ".png");
        IconAsset first = IconAsset.builder()
                .id(101L)
                .tenantId("default")
                .groupId(10L)
                .fileId(501L)
                .name("合格")
                .tags("qa,ok")
                .source("UPLOAD")
                .sortOrder(1)
                .createdAt(LocalDateTime.of(2026, 6, 12, 9, 0))
                .build();
        IconAsset second = IconAsset.builder()
                .id(102L)
                .tenantId("default")
                .groupId(10L)
                .fileId(502L)
                .name("警告")
                .source("IMPORT")
                .sortOrder(2)
                .build();
        when(iconAssetRepository.findAllById(List.of(101L, 102L))).thenReturn(List.of(first, second));
        when(fileObjectRepository.findAllById(List.of(501L, 502L))).thenReturn(List.of(
                FileObject.builder().id(501L).originalName("ok.png").storedPath(tempFile.toString()).build(),
                FileObject.builder().id(502L).originalName("warn.svg").storedPath(tempFile.resolveSibling("missing.svg").toString()).build()));
        when(idGenerator.nextId()).thenReturn(900L);

        controller.batchDeleteIcons(new IconManagementController.BatchDeleteRequest(List.of(101L, 102L)));

        verify(iconAssetRepository).deleteAll(List.of(first, second));
        verify(fileObjectRepository).deleteAllById(List.of(501L, 502L));
        assertThat(Files.exists(tempFile)).isFalse();

        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        AuditEvent event = auditCaptor.getValue();
        assertThat(event.getEntityType()).isEqualTo("ICON_ASSET");
        assertThat(event.getAction()).isEqualTo("BATCH_DELETE");
        assertThat(event.getOperatorName()).isEqualTo("系统管理员");
        JsonNode before = objectMapper.readTree(event.getContentBefore());
        assertThat(before.get("deletedIcons")).hasSize(2);
        assertThat(before.get("deletedIcons").get(0).get("name").asText()).isEqualTo("合格");
    }

    @Test
    void reordersGroupsAndIcons() throws Exception {
        AuditContext.setOperator("99", "系统管理员");
        IconGroup firstGroup = IconGroup.builder().id(10L).name("A").sortOrder(1).build();
        IconGroup secondGroup = IconGroup.builder().id(11L).name("B").sortOrder(2).build();
        IconAsset firstIcon = IconAsset.builder().id(101L).groupId(10L).sortOrder(1).name("first").build();
        IconAsset secondIcon = IconAsset.builder().id(102L).groupId(10L).sortOrder(2).name("second").build();
        when(iconGroupRepository.findAllById(List.of(11L, 10L))).thenReturn(List.of(secondGroup, firstGroup));
        when(iconAssetRepository.findAllById(List.of(102L, 101L))).thenReturn(List.of(secondIcon, firstIcon));
        when(idGenerator.nextId()).thenReturn(901L, 902L);

        controller.reorderGroups(new IconManagementController.OrderRequest(List.of(11L, 10L)));
        controller.reorderIcons(new IconManagementController.IconOrderRequest(20L, List.of(102L, 101L)));

        assertThat(secondGroup.getSortOrder()).isEqualTo(1);
        assertThat(firstGroup.getSortOrder()).isEqualTo(2);
        assertThat(secondIcon.getGroupId()).isEqualTo(20L);
        assertThat(secondIcon.getSortOrder()).isEqualTo(1);
        assertThat(firstIcon.getGroupId()).isEqualTo(20L);
        assertThat(firstIcon.getSortOrder()).isEqualTo(2);
        verify(iconGroupRepository).saveAll(List.of(secondGroup, firstGroup));
        verify(iconAssetRepository).saveAll(List.of(secondIcon, firstIcon));

        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository, org.mockito.Mockito.times(2)).save(auditCaptor.capture());
        assertThat(auditCaptor.getAllValues())
                .extracting(AuditEvent::getEntityType, AuditEvent::getAction)
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple("ICON_GROUP", "REORDER"),
                        org.assertj.core.groups.Tuple.tuple("ICON_ASSET", "REORDER"));
    }

    @Test
    void refusesToReorderBuiltinIcons() {
        IconAsset builtin = IconAsset.builder()
                .id(201L)
                .tenantId("default")
                .groupId(10040L)
                .name("Settings")
                .source("BUILTIN")
                .builtinKey("Settings")
                .sortOrder(1)
                .build();
        when(iconAssetRepository.findAllById(List.of(201L))).thenReturn(List.of(builtin));

        assertThatThrownBy(() -> controller.reorderIcons(new IconManagementController.IconOrderRequest(10040L, List.of(201L))))
                .isInstanceOf(BusinessException.class)
                .hasMessage("系统内置图标不能移动");

        verify(iconAssetRepository, never()).saveAll(any());
        verify(auditEventRepository, never()).save(any(AuditEvent.class));
    }

    @Test
    void importIconsAcceptsMultipartFilesAndCreatesMetadata() throws Exception {
        AuditContext.setOperator("99", "系统管理员");
        MockMultipartFile first = new MockMultipartFile(
                "files",
                "ok.svg",
                "image/svg+xml",
                "<svg />".getBytes());
        MockMultipartFile second = new MockMultipartFile(
                "files",
                "warn.png",
                "image/png",
                new byte[] {1, 2, 3});
        when(idGenerator.nextId()).thenReturn(501L, 101L, 502L, 102L, 901L);
        when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(iconAssetRepository.save(any(IconAsset.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.importIcons(List.of(first, second), 10L);

        assertThat(response.getData()).hasSize(2);
        assertThat(response.getData()).extracting(IconManagementController.IconAssetResponse::name).containsExactly("ok", "warn");
        assertThat(response.getData()).extracting(IconManagementController.IconAssetResponse::groupId).containsExactly("10", "10");
        verify(fileObjectRepository, org.mockito.Mockito.times(2)).save(any(FileObject.class));
        verify(iconAssetRepository, org.mockito.Mockito.times(2)).save(any(IconAsset.class));
        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        assertThat(auditCaptor.getValue().getAction()).isEqualTo("IMPORT");
    }

    @Test
    void refusesToImportIconsIntoBuiltinGroup() {
        MockMultipartFile file = new MockMultipartFile(
                "files",
                "custom.svg",
                "image/svg+xml",
                "<svg />".getBytes());
        IconGroup builtinGroup = IconGroup.builder()
                .id(10040L)
                .tenantId("default")
                .name("系统内置图标")
                .sortOrder(0)
                .builtin(true)
                .build();
        when(iconGroupRepository.findById(10040L)).thenReturn(Optional.of(builtinGroup));

        assertThatThrownBy(() -> controller.importIcons(List.of(file), 10040L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("系统内置图标分组不能放入自定义图标");

        verify(fileObjectRepository, never()).save(any(FileObject.class));
        verify(iconAssetRepository, never()).save(any(IconAsset.class));
        verify(auditEventRepository, never()).save(any(AuditEvent.class));
    }
}
