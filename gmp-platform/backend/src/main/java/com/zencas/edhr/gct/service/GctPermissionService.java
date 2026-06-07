package com.zencas.edhr.gct.service;

import com.zencas.edhr.gct.dto.GctActionMetaDto;
import com.zencas.edhr.gct.dto.GctPageSpecDto;
import com.zencas.edhr.gct.dto.GctPermissionButtonDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GctPermissionService {

    private final GctPageRegistry registry;

    public List<GctPermissionButtonDto> listButtons(String pageCode) {
        GctPageSpecDto page = registry.getPageOrThrow(pageCode);
        if (page.getActions() == null) {
            return List.of();
        }
        return page.getActions().stream()
                .map(this::toButton)
                .toList();
    }

    private GctPermissionButtonDto toButton(GctActionMetaDto action) {
        return GctPermissionButtonDto.builder()
                .code(action.getCode())
                .label(action.getLabel())
                .enabled(Boolean.TRUE)
                .auditRequired(action.getAuditRequired())
                .permissionRequired(action.getPermissionRequired())
                .build();
    }
}
