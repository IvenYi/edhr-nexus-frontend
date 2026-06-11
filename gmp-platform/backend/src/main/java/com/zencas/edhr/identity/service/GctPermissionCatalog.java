package com.zencas.edhr.identity.service;

import com.zencas.edhr.gct.dto.GctActionMetaDto;
import com.zencas.edhr.gct.dto.GctPageSpecDto;
import com.zencas.edhr.gct.service.GctPageRegistry;
import com.zencas.edhr.identity.entity.Permission;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class GctPermissionCatalog {

    private static final long PAGE_PERMISSION_ID_BASE = -7_000L;
    private static final long ACTION_PERMISSION_ID_BASE = -8_000_000L;
    private static final int PAGE_SORT_ORDER_BASE = 10_000;
    private static final int ACTION_SORT_ORDER_BASE = 20_000;

    private final List<Permission> permissions;
    private final Map<Long, String> codeById;

    public GctPermissionCatalog(GctPageRegistry registry) {
        List<Permission> generatedPermissions = buildPermissions(registry.listPages());
        this.permissions = List.copyOf(generatedPermissions);
        this.codeById = buildCodeIndex(generatedPermissions);
    }

    public List<Permission> listPermissions() {
        return permissions;
    }

    public List<String> findCodesByIds(Collection<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }

        Set<String> codes = new LinkedHashSet<>();
        for (Long id : ids) {
            String code = codeById.get(id);
            if (code != null) {
                codes.add(code);
            }
        }
        return List.copyOf(codes);
    }

    private List<Permission> buildPermissions(List<GctPageSpecDto> pages) {
        Map<String, Permission> generatedByCode = new LinkedHashMap<>();
        for (int pageIndex = 0; pageIndex < pages.size(); pageIndex++) {
            GctPageSpecDto page = pages.get(pageIndex);
            String pageCode = inferPermissionCode(page.getPath());
            if (pageCode == null) {
                continue;
            }

            generatedByCode.putIfAbsent(pageCode, Permission.builder()
                    .id(PAGE_PERMISSION_ID_BASE - pageIndex - 1L)
                    .code(pageCode)
                    .name(buildPageName(page))
                    .type("PAGE")
                    .sortOrder(PAGE_SORT_ORDER_BASE + pageIndex + 1)
                    .build());

            List<GctActionMetaDto> actions = page.getActions() == null ? List.of() : page.getActions();
            for (int actionIndex = 0; actionIndex < actions.size(); actionIndex++) {
                GctActionMetaDto action = actions.get(actionIndex);
                if (!Boolean.TRUE.equals(action.getPermissionRequired())) {
                    continue;
                }
                String actionCode = normalize(action.getCode());
                if (actionCode == null) {
                    continue;
                }

                String permissionCode = pageCode + "." + actionCode;
                generatedByCode.putIfAbsent(permissionCode, Permission.builder()
                        .id(ACTION_PERMISSION_ID_BASE - ((long) (pageIndex + 1) * 1000L) - actionIndex - 1L)
                        .code(permissionCode)
                        .name(buildActionName(page, action))
                        .type("BUTTON")
                        .parentCode(pageCode)
                        .sortOrder(ACTION_SORT_ORDER_BASE + (pageIndex * 100) + actionIndex + 1)
                        .build());
            }
        }
        return new ArrayList<>(generatedByCode.values());
    }

    private Map<Long, String> buildCodeIndex(List<Permission> permissions) {
        Map<Long, String> index = new LinkedHashMap<>();
        for (Permission permission : permissions) {
            if (permission.getId() != null && permission.getCode() != null) {
                index.put(permission.getId(), permission.getCode());
            }
        }
        return Map.copyOf(index);
    }

    private String inferPermissionCode(String path) {
        String normalizedPath = normalize(path);
        if (normalizedPath == null) {
            return null;
        }
        return normalizedPath.replaceFirst("^/", "").replace("/", ".");
    }

    private String buildPageName(GctPageSpecDto page) {
        String title = firstText(page.getTitle(), page.getLabel(), page.getModule(), page.getCode());
        return "GCT / " + title;
    }

    private String buildActionName(GctPageSpecDto page, GctActionMetaDto action) {
        String pageLabel = firstText(page.getLabel(), page.getTitle(), page.getCode());
        String actionLabel = firstText(action.getLabel(), action.getCode());
        return pageLabel + " / " + actionLabel;
    }

    private String firstText(String... values) {
        for (String value : values) {
            String normalized = normalize(value);
            if (normalized != null) {
                return normalized;
            }
        }
        return "-";
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
