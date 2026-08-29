package com.zencas.edhr.compliance.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.compliance.dto.AuditLogItem;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuditControllerTest {

    @Mock private AuditEventRepository auditEventRepository;
    @Mock private UserAccountRepository userAccountRepository;

    @InjectMocks private AuditController controller;

    @Test
    void auditLogsDoNotExposeMutationEndpoints() {
        for (Method method : AuditController.class.getDeclaredMethods()) {
            assertThat(method.isAnnotationPresent(PostMapping.class))
                    .as(method.getName() + " must not expose POST audit mutation endpoint")
                    .isFalse();
            assertThat(method.isAnnotationPresent(PutMapping.class))
                    .as(method.getName() + " must not expose PUT audit mutation endpoint")
                    .isFalse();
            assertThat(method.isAnnotationPresent(DeleteMapping.class))
                    .as(method.getName() + " must not expose DELETE audit mutation endpoint")
                    .isFalse();
        }
    }

    @Test
    void listPassesAuditFiltersToRepositorySearch() {
        PageRequest pageable = PageRequest.of(0, Integer.MAX_VALUE, Sort.by(Sort.Direction.DESC, "createdAt"));
        AuditEvent event = AuditEvent.builder()
                .id(1L)
                .entityType("USER_ACCOUNT")
                .entityId("339707003864260608")
                .action("UPDATE")
                .contentBefore("{\"organizationName\":\"公司/质量部\"}")
                .contentAfter("{\"organizationName\":\"公司/生产部\"}")
                .operatorId("99")
                .operatorName("admin")
                .operatorAccount("admin")
                .moduleName("系统")
                .menuName("审计日志")
                .functionName("查看审计日志")
                .dataSummary("账号 admin")
                .source("UI")
                .build();
        event.sealSnapshotHash();
        when(auditEventRepository.search(
                "USER_ACCOUNT",
                "339707003864260608",
                "UPDATE",
                "系统管理员",
                "admin",
                "",
                "",
                "",
                pageable))
                .thenReturn(new PageImpl<>(List.of(event), pageable, 1));
        when(userAccountRepository.findByUsername("admin"))
                .thenReturn(Optional.of(UserAccount.builder()
                        .id(99L)
                        .username("admin")
                        .displayName("系统管理员")
                        .passwordHash("hash")
                        .build()));

        ApiResponse<PageResult<AuditLogItem>> response = controller.list(
                1,
                20,
                "createdAt",
                "desc",
                "USER_ACCOUNT",
                "339707003864260608",
                "UPDATE",
                "系统管理员",
                "admin",
                "系统",
                "审计日志",
                "账号 admin");

        verify(auditEventRepository).search(
                "USER_ACCOUNT",
                "339707003864260608",
                "UPDATE",
                "系统管理员",
                "admin",
                "",
                "",
                "",
                pageable);
        AuditLogItem item = response.getData().getContent().getFirst();
        assertThat(item.getOperatorDisplayName()).isEqualTo("系统管理员");
        assertThat(item.getOperatorAccount()).isEqualTo("admin");
        assertThat(item.getActionLabel()).isEqualTo("编辑");
        assertThat(item.getTriggerMethod()).isEqualTo("UI");
        assertThat(item.getTriggerMethodLabel()).isEqualTo("页面操作");
        assertThat(item.getModuleName()).isEqualTo("系统");
        assertThat(item.getMenuName()).isEqualTo("安全管理 · 审计日志");
        assertThat(item.getFunctionName()).isEqualTo("查看审计日志");
        assertThat(item.getDataSummary()).isEqualTo("账号 admin");
        assertThat(item.getContentAfter()).contains("公司/生产部");
        assertThat(item.getSnapshotHash()).isEqualTo(event.getSnapshotHash());
        assertThat(response.getData().getTotalElements()).isEqualTo(1);
    }

    @Test
    void listNormalizesBlankAuditFiltersToEmptyStrings() {
        PageRequest pageable = PageRequest.of(0, Integer.MAX_VALUE, Sort.by(Sort.Direction.DESC, "createdAt"));
        when(auditEventRepository.search("", "", "", "", "", "", "", "", pageable))
                .thenReturn(new PageImpl<>(List.of(), pageable, 0));

        ApiResponse<PageResult<AuditLogItem>> response = controller.list(
                1,
                20,
                "createdAt",
                "desc",
                "",
                null,
                " ",
                null,
                "",
                " ",
                null,
                null);

        verify(auditEventRepository).search("", "", "", "", "", "", "", "", pageable);
        assertThat(response.getData().getContent()).isEmpty();
        assertThat(response.getData().getTotalElements()).isZero();
    }

    @Test
    void projectsProductionAuditActionsToCreateOrUpdate() {
        PageRequest queryAll = PageRequest.of(0, Integer.MAX_VALUE, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<AuditEvent> events = List.of(
                AuditEvent.builder().id(30L).entityType("WORK_ORDER").entityId("10").action("CREATE").source("UI").build(),
                AuditEvent.builder().id(31L).entityType("WORK_ORDER").entityId("10").action("CANCEL").source("UI").build(),
                AuditEvent.builder().id(32L).entityType("PRODUCTION_OBJECT").entityId("20").action("STATUS_CHANGE").source("UI").build());
        when(auditEventRepository.search("WORK_ORDER", "10", "", "", "", "", "", "", queryAll))
                .thenReturn(new PageImpl<>(events.subList(0, 2), queryAll, 2));

        ApiResponse<PageResult<AuditLogItem>> response = controller.list(
                1, 20, "createdAt", "desc", "WORK_ORDER", "10", null, null, null, null, null, null);

        assertThat(response.getData().getContent()).extracting(AuditLogItem::getAction, AuditLogItem::getActionLabel)
                .containsExactly(org.assertj.core.groups.Tuple.tuple("CREATE", "新增"), org.assertj.core.groups.Tuple.tuple("UPDATE", "修改"));
    }

    @Test
    void listFiltersAgainstResolvedDisplayFieldsForLegacyAuditRows() {
        PageRequest queryAll = PageRequest.of(0, Integer.MAX_VALUE, Sort.by(Sort.Direction.DESC, "createdAt"));
        AuditEvent legacyEvent = AuditEvent.builder()
                .id(2L)
                .entityType("USER_ACCOUNT")
                .entityId("42")
                .action("UPDATE")
                .operatorName("admin")
                .source("UI")
                .build();
        when(auditEventRepository.search("", "", "", "", "", "", "", "", queryAll))
                .thenReturn(new PageImpl<>(List.of(legacyEvent), queryAll, 1));
        when(userAccountRepository.findByUsername("admin")).thenReturn(Optional.empty());

        ApiResponse<PageResult<AuditLogItem>> response = controller.list(
                1,
                20,
                "createdAt",
                "desc",
                null,
                null,
                null,
                null,
                null,
                "系统",
                "组织管理 · 用户管理",
                "组织管理 · 用户管理 #42");

        assertThat(response.getData().getTotalElements()).isEqualTo(1);
        AuditLogItem item = response.getData().getContent().getFirst();
        assertThat(item.getModuleName()).isEqualTo("系统");
        assertThat(item.getMenuName()).isEqualTo("组织管理 · 用户管理");
        assertThat(item.getFunctionName()).isEqualTo("编辑");
        assertThat(item.getDataSummary()).isEqualTo("组织管理 · 用户管理 #42");
    }

    @Test
    void listResolvesMenuNameToFirstAndSecondLevelPath() {
        PageRequest queryAll = PageRequest.of(0, Integer.MAX_VALUE, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<AuditEvent> events = List.of(
                AuditEvent.builder().id(20L).entityType("SYSTEM_SETTING").action("UPDATE").operatorName("admin").source("UI").build(),
                AuditEvent.builder().id(21L).entityType("ICON_ASSET").action("UPDATE").operatorName("admin").source("UI").build(),
                AuditEvent.builder().id(22L).entityType("ROLE").action("UPDATE").operatorName("admin").source("UI").build(),
                AuditEvent.builder().id(23L).entityType("USER_ACCOUNT").action("UPDATE").operatorName("admin").source("UI").build(),
                AuditEvent.builder().id(24L).entityType("DEPARTMENT").action("UPDATE").operatorName("admin").source("UI").build(),
                AuditEvent.builder().id(25L).entityType("AUDIT_LOG").action("EXPORT").operatorName("admin").source("UI").build());
        when(auditEventRepository.search("", "", "", "", "", "", "", "", queryAll))
                .thenReturn(new PageImpl<>(events, queryAll, events.size()));
        when(userAccountRepository.findByUsername("admin")).thenReturn(Optional.empty());

        ApiResponse<PageResult<AuditLogItem>> response = controller.list(
                1,
                20,
                "createdAt",
                "desc",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null);

        assertThat(response.getData().getContent())
                .extracting(AuditLogItem::getMenuName)
                .containsExactly(
                        "系统管理 · 系统设置",
                        "系统管理 · 图标管理",
                        "组织管理 · 岗位角色",
                        "组织管理 · 用户管理",
                        "组织管理 · 组织架构",
                        "安全管理 · 审计日志");
    }

    @Test
    void listResolvesFunctionModuleToLeftSidebarModuleName() {
        PageRequest queryAll = PageRequest.of(0, Integer.MAX_VALUE, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<AuditEvent> events = List.of(
                AuditEvent.builder().id(40L).entityType("SYSTEM_SETTING").action("UPDATE").operatorName("admin").source("UI").build(),
                AuditEvent.builder().id(41L).entityType("ICON_ASSET").action("UPDATE").operatorName("admin").source("UI").build(),
                AuditEvent.builder().id(42L).entityType("ROLE").action("UPDATE").operatorName("admin").source("UI").build(),
                AuditEvent.builder().id(43L).entityType("USER_ACCOUNT").action("UPDATE").operatorName("admin").source("UI").build(),
                AuditEvent.builder().id(44L).entityType("DEPARTMENT").action("UPDATE").operatorName("admin").source("UI").build(),
                AuditEvent.builder().id(45L).entityType("AUDIT_LOG").action("EXPORT").operatorName("admin").source("UI").build());
        when(auditEventRepository.search("", "", "", "", "", "", "", "", queryAll))
                .thenReturn(new PageImpl<>(events, queryAll, events.size()));
        when(userAccountRepository.findByUsername("admin")).thenReturn(Optional.empty());

        ApiResponse<PageResult<AuditLogItem>> response = controller.list(
                1,
                20,
                "createdAt",
                "desc",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null);

        assertThat(response.getData().getContent())
                .extracting(AuditLogItem::getModuleName)
                .containsExactly("系统", "系统", "系统", "系统", "系统", "系统");
    }

    @Test
    void listKeepsFunctionNameAsSpecificFunctionWithoutMenuPrefix() {
        PageRequest queryAll = PageRequest.of(0, Integer.MAX_VALUE, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<AuditEvent> events = List.of(
                AuditEvent.builder()
                        .id(30L)
                        .entityType("SYSTEM_SETTING")
                        .action("UPDATE")
                        .operatorName("admin")
                        .source("UI")
                        .build(),
                AuditEvent.builder()
                        .id(31L)
                        .entityType("SYSTEM_SETTING")
                        .action("UPDATE")
                        .operatorName("admin")
                        .source("UI")
                        .functionName("系统设置 · 编辑系统设置")
                        .build());
        when(auditEventRepository.search("", "", "", "", "", "", "", "", queryAll))
                .thenReturn(new PageImpl<>(events, queryAll, events.size()));
        when(userAccountRepository.findByUsername("admin")).thenReturn(Optional.empty());

        ApiResponse<PageResult<AuditLogItem>> response = controller.list(
                1,
                20,
                "createdAt",
                "desc",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null);

        assertThat(response.getData().getContent())
                .extracting(AuditLogItem::getFunctionName)
                .containsExactly("编辑", "编辑系统设置");
    }

    @Test
    void listTranslatesSystemAndIconAuditActions() {
        PageRequest queryAll = PageRequest.of(0, Integer.MAX_VALUE, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<AuditEvent> events = List.of(
                auditEvent(10L, "REORDER"),
                auditEvent(11L, "BATCH_DELETE"),
                auditEvent(12L, "UPLOAD_LOGO"),
                auditEvent(13L, "UPLOAD_FAVICON"),
                auditEvent(14L, "DELETE_LOGO"),
                auditEvent(15L, "DELETE_FAVICON"));
        when(auditEventRepository.search("", "", "", "", "", "", "", "", queryAll))
                .thenReturn(new PageImpl<>(events, queryAll, events.size()));

        ApiResponse<PageResult<AuditLogItem>> response = controller.list(
                1,
                20,
                "createdAt",
                "desc",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null);

        assertThat(response.getData().getContent())
                .extracting(AuditLogItem::getActionLabel)
                .containsExactly("排序调整", "批量删除", "上传系统 Logo", "上传网站图标", "删除系统 Logo", "删除网站图标");
    }

    @Test
    void listMyProfileAuditLogsOnlyReturnsCurrentUserTargetRows() {
        PageRequest queryAll = PageRequest.of(0, Integer.MAX_VALUE, Sort.by(Sort.Direction.DESC, "createdAt"));
        AuditEvent selfChange = AuditEvent.builder()
                .id(61L)
                .entityType("USER_ACCOUNT")
                .entityId("1001")
                .action("UPDATE")
                .operatorId("1001")
                .operatorName("张三")
                .operatorAccount("zhangsan")
                .menuName("个人设置")
                .functionName("编辑个人设置")
                .dataSummary("账号 zhangsan 更新个人设置")
                .source("UI")
                .build();
        AuditEvent adminChange = AuditEvent.builder()
                .id(62L)
                .entityType("USER_ACCOUNT")
                .entityId("1001")
                .action("UPDATE")
                .operatorId("1")
                .operatorName("管理员")
                .operatorAccount("admin")
                .menuName("用户管理")
                .functionName("编辑用户")
                .dataSummary("管理员编辑账号 zhangsan")
                .source("UI")
                .build();
        when(userAccountRepository.findById(1001L)).thenReturn(Optional.of(UserAccount.builder()
                .id(1001L)
                .username("zhangsan")
                .displayName("张三")
                .passwordHash("hash")
                .build()));
        when(auditEventRepository.search(
                "USER_ACCOUNT",
                "1001",
                "",
                "",
                "",
                "",
                "",
                "",
                queryAll))
                .thenReturn(new PageImpl<>(List.of(selfChange, adminChange), queryAll, 2));
        when(userAccountRepository.findByUsername("zhangsan")).thenReturn(Optional.of(UserAccount.builder()
                .id(1001L)
                .username("zhangsan")
                .displayName("张三")
                .passwordHash("hash")
                .build()));
        when(userAccountRepository.findByUsername("admin")).thenReturn(Optional.of(UserAccount.builder()
                .id(1L)
                .username("admin")
                .displayName("管理员")
                .passwordHash("hash")
                .build()));

        ApiResponse<PageResult<AuditLogItem>> response = controller.listMyProfileLogs(
                "1001",
                1,
                20,
                "createdAt",
                "desc");

        verify(auditEventRepository).search(
                "USER_ACCOUNT",
                "1001",
                "",
                "",
                "",
                "",
                "",
                "",
                queryAll);
        assertThat(response.getData().getContent())
                .extracting(AuditLogItem::getId)
                .containsExactly(61L, 62L);
        assertThat(response.getData().getContent())
                .extracting(AuditLogItem::getOperatorAccount)
                .containsExactly("zhangsan", "admin");
    }

    private AuditEvent auditEvent(Long id, String action) {
        return AuditEvent.builder()
                .id(id)
                .entityType("ICON_ASSET")
                .entityId(String.valueOf(id))
                .action(action)
                .operatorName("admin")
                .operatorAccount("admin")
                .source("UI")
                .build();
    }
}
