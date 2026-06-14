package com.zencas.edhr.compliance.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.compliance.dto.AuditLogItem;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/audit/logs")
@RequiredArgsConstructor
public class AuditController {

    private final AuditEventRepository auditEventRepository;
    private final UserAccountRepository userAccountRepository;

    @GetMapping
    public ApiResponse<PageResult<AuditLogItem>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String entityId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String operatorName,
            @RequestParam(required = false) String operatorAccount,
            @RequestParam(required = false) String moduleName,
            @RequestParam(required = false) String menuName,
            @RequestParam(required = false) String dataKeyword) {
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        int safePage = Math.max(page, 1);
        int safeSize = Math.max(size, 1);
        PageRequest queryAll = PageRequest.of(0, Integer.MAX_VALUE, Sort.by(direction, sort));
        List<AuditLogItem> filteredItems = auditEventRepository.search(
                blankToEmpty(entityType),
                blankToEmpty(entityId),
                blankToEmpty(action),
                blankToEmpty(operatorName),
                blankToEmpty(operatorAccount),
                "",
                "",
                "",
                queryAll)
                .getContent()
                .stream()
                .map(this::toAuditLogItem)
                .filter(item -> matchesAuditText(item.getModuleName(), moduleName))
                .filter(item -> matchesAuditText(item.getMenuName(), menuName))
                .filter(item -> matchesAuditText(item.getDataSummary(), dataKeyword))
                .toList();
        int fromIndex = Math.min((safePage - 1) * safeSize, filteredItems.size());
        int toIndex = Math.min(fromIndex + safeSize, filteredItems.size());
        return ApiResponse.success(PageResult.of(
                filteredItems.subList(fromIndex, toIndex), page, size, filteredItems.size()));
    }

    private String blankToEmpty(String value) {
        return StringUtils.hasText(value) ? value : "";
    }

    private boolean matchesAuditText(String value, String keyword) {
        if (!StringUtils.hasText(keyword)) return true;
        if (!StringUtils.hasText(value)) return false;
        return value.toLowerCase(Locale.ROOT).contains(keyword.trim().toLowerCase(Locale.ROOT));
    }

    private AuditLogItem toAuditLogItem(AuditEvent event) {
        String triggerMethod = StringUtils.hasText(event.getSource()) ? event.getSource() : "UI";
        String actionLabel = resolveActionLabel(event.getAction());
        String entityType = event.getEntityType();
        String entityId = event.getEntityId();
        return AuditLogItem.builder()
                .id(event.getId())
                .entityType(entityType)
                .entityId(entityId)
                .action(event.getAction())
                .actionLabel(actionLabel)
                .operatorId(event.getOperatorId())
                .operatorDisplayName(resolveOperatorDisplayName(event))
                .operatorAccount(resolveOperatorAccount(event))
                .operationTime(event.getCreatedAt() == null ? "" : event.getCreatedAt().toString())
                .triggerMethod(triggerMethod)
                .triggerMethodLabel(resolveTriggerMethodLabel(triggerMethod))
                .moduleName(resolveModuleName(event))
                .menuName(resolveMenuName(event))
                .functionName(resolveFunctionName(event, actionLabel))
                .dataSummary(resolveDataSummary(event, entityType, entityId))
                .contentBefore(event.getContentBefore())
                .contentAfter(event.getContentAfter())
                .reason(event.getReason())
                .ipAddress(event.getIpAddress())
                .createdAt(event.getCreatedAt())
                .build();
    }

    private String resolveOperatorDisplayName(AuditEvent event) {
        String account = resolveOperatorAccount(event);
        if (StringUtils.hasText(account)) {
            Optional<UserAccount> user = userAccountRepository.findByUsername(account);
            if (user.isPresent() && StringUtils.hasText(user.get().getDisplayName())) {
                return user.get().getDisplayName();
            }
        }
        if (StringUtils.hasText(event.getOperatorName()) && !event.getOperatorName().equals(account)) {
            return event.getOperatorName();
        }
        return StringUtils.hasText(account) ? account : "-";
    }

    private String resolveOperatorAccount(AuditEvent event) {
        if (StringUtils.hasText(event.getOperatorAccount())) return event.getOperatorAccount();
        if (StringUtils.hasText(event.getOperatorName())) return event.getOperatorName();
        return StringUtils.hasText(event.getOperatorId()) ? event.getOperatorId() : "-";
    }

    private String resolveActionLabel(String action) {
        if (!StringUtils.hasText(action)) return "-";
        return ACTION_LABELS.getOrDefault(action.trim().toUpperCase(Locale.ROOT), action);
    }

    private String resolveTriggerMethodLabel(String source) {
        if (!StringUtils.hasText(source)) return "页面操作";
        return switch (source.trim().toUpperCase(Locale.ROOT)) {
            case "UI", "WEB" -> "页面操作";
            case "API" -> "接口调用";
            case "SYSTEM" -> "系统任务";
            case "IMPORT" -> "导入触发";
            default -> source;
        };
    }

    private String resolveModuleName(AuditEvent event) {
        if (StringUtils.hasText(event.getModuleName())) return resolveLeftSidebarModuleName(event.getModuleName());
        return switch (normalizeEntityType(event.getEntityType())) {
            case "USER_ACCOUNT", "ROLE", "DEPARTMENT", "ICON_ASSET", "ICON_GROUP", "SYSTEM_SETTING", "AUDIT_LOG", "AUDIT_EVENT", "LOGIN_LOG" -> "系统";
            default -> "-";
        };
    }

    private String resolveMenuName(AuditEvent event) {
        if (StringUtils.hasText(event.getMenuName()) && event.getMenuName().contains("·")) {
            return event.getMenuName().trim();
        }
        String moduleName = StringUtils.hasText(event.getMenuName())
                ? normalizeModuleLabel(event.getMenuName())
                : resolveMenuParent(event);
        String menuLeaf = StringUtils.hasText(event.getMenuName())
                ? event.getMenuName().trim()
                : resolveMenuLeaf(event);
        if (menuLeaf.contains("·")) return menuLeaf;
        if (!StringUtils.hasText(menuLeaf)) return "-";
        if (!StringUtils.hasText(moduleName) || "-".equals(moduleName)) return menuLeaf;
        return moduleName + " · " + menuLeaf;
    }

    private String resolveFunctionName(AuditEvent event, String actionLabel) {
        if (StringUtils.hasText(event.getFunctionName())) return stripMenuPrefix(event.getFunctionName());
        return actionLabel;
    }

    private String resolveDataSummary(AuditEvent event, String entityType, String entityId) {
        if (StringUtils.hasText(event.getDataSummary())) return event.getDataSummary();
        String menuName = resolveMenuName(event);
        if (StringUtils.hasText(event.getReason())) return event.getReason();
        if (StringUtils.hasText(entityType) && StringUtils.hasText(entityId)) {
            return menuName + " #" + entityId;
        }
        return "-";
    }

    private String normalizeEntityType(String entityType) {
        return StringUtils.hasText(entityType) ? entityType.trim().toUpperCase(Locale.ROOT) : "";
    }

    private String normalizeModuleLabel(String moduleName) {
        if (!StringUtils.hasText(moduleName)) return "-";
        return switch (moduleName.trim()) {
            case "系统", "系统管理", "菜单管理", "图标管理", "系统设置" -> "系统管理";
            case "组织", "组织管理", "组织架构", "岗位角色", "用户管理" -> "组织管理";
            case "安全", "安全管理", "审计日志", "登录日志", "签名记录" -> "安全管理";
            default -> moduleName.trim();
        };
    }

    private String resolveLeftSidebarModuleName(String moduleName) {
        if (!StringUtils.hasText(moduleName)) return "-";
        return switch (moduleName.trim()) {
            case "系统", "系统管理", "组织", "组织管理", "安全", "安全管理", "菜单管理", "图标管理", "系统设置", "组织架构", "岗位角色", "用户管理", "审计日志", "登录日志", "签名记录" -> "系统";
            default -> moduleName.trim();
        };
    }

    private String resolveMenuParent(AuditEvent event) {
        return switch (normalizeEntityType(event.getEntityType())) {
            case "USER_ACCOUNT", "ROLE", "DEPARTMENT" -> "组织管理";
            case "ICON_ASSET", "ICON_GROUP", "SYSTEM_SETTING" -> "系统管理";
            case "AUDIT_LOG", "AUDIT_EVENT", "LOGIN_LOG" -> "安全管理";
            default -> "-";
        };
    }

    private String resolveMenuLeaf(AuditEvent event) {
        return switch (normalizeEntityType(event.getEntityType())) {
            case "USER_ACCOUNT" -> "用户管理";
            case "ROLE" -> "岗位角色";
            case "DEPARTMENT" -> "组织架构";
            case "ICON_ASSET", "ICON_GROUP" -> "图标管理";
            case "SYSTEM_SETTING" -> "系统设置";
            case "AUDIT_LOG", "AUDIT_EVENT" -> "审计日志";
            case "LOGIN_LOG" -> "登录日志";
            default -> StringUtils.hasText(event.getEntityType()) ? event.getEntityType().trim() : "";
        };
    }

    private String stripMenuPrefix(String value) {
        String trimmed = StringUtils.hasText(value) ? value.trim() : "";
        if (!trimmed.contains("·")) return trimmed;
        String[] parts = trimmed.split("\\s*·\\s*");
        return parts.length == 0 ? trimmed : parts[parts.length - 1].trim();
    }

    private static final Map<String, String> ACTION_LABELS = Map.ofEntries(
            Map.entry("CREATE", "新增"),
            Map.entry("UPDATE", "编辑"),
            Map.entry("DELETE", "删除"),
            Map.entry("ENABLE", "启用"),
            Map.entry("DISABLE", "禁用"),
            Map.entry("RESET_PASSWORD", "重置密码"),
            Map.entry("PERMISSION_UPDATE", "权限设置"),
            Map.entry("UPLOAD", "上传"),
            Map.entry("IMPORT", "导入"),
            Map.entry("EXPORT", "导出"),
            Map.entry("REORDER", "排序调整"),
            Map.entry("BATCH_DELETE", "批量删除"),
            Map.entry("UPLOAD_LOGO", "上传系统 Logo"),
            Map.entry("UPLOAD_FAVICON", "上传网站图标"),
            Map.entry("DELETE_LOGO", "删除系统 Logo"),
            Map.entry("DELETE_FAVICON", "删除网站图标"),
            Map.entry("MOVE", "移动"),
            Map.entry("LOGIN", "登录"),
            Map.entry("LOGOUT", "退出")
    );

    @GetMapping("/{id}")
    public ApiResponse<AuditEvent> getById(@PathVariable Long id) {
        return auditEventRepository.findById(id)
                .map(ApiResponse::success)
                .orElseThrow(() -> new com.zencas.edhr.common.exception.BusinessException(
                        com.zencas.edhr.common.exception.ErrorCode.GENERAL_001, "记录不存在"));
    }
}
