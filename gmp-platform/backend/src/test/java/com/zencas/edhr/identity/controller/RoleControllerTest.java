package com.zencas.edhr.identity.controller;

import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.identity.entity.Permission;
import com.zencas.edhr.identity.entity.RolePermission;
import com.zencas.edhr.identity.repository.PermissionRepository;
import com.zencas.edhr.identity.repository.RolePermissionRepository;
import com.zencas.edhr.identity.repository.RoleRepository;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoleControllerTest {

    @Mock private RoleRepository roleRepository;
    @Mock private RolePermissionRepository rolePermissionRepository;
    @Mock private PermissionRepository permissionRepository;
    @Mock private SnowflakeIdGenerator idGenerator;

    @InjectMocks private RoleController controller;

    @Test
    void listAssignablePermissionsReturnsPagedPermissionDataForRoleAssignment() {
        PageRequest pageable = PageRequest.of(0, 50, Sort.by(Sort.Direction.ASC, "sortOrder"));
        Permission permission = Permission.builder()
                .id(60L)
                .code("system")
                .name("系统管理")
                .type("PAGE")
                .sortOrder(1)
                .build();
        when(permissionRepository.findAll(pageable)).thenReturn(new PageImpl<>(List.of(permission), pageable, 1));

        var response = controller.listAssignablePermissions(1, 50, "sortOrder", "asc");

        assertThat(response.getData().getContent()).containsExactly(permission);
        assertThat(response.getData().getTotalElements()).isEqualTo(1);
    }

    @Test
    void updatePermissionsReplacesRolePermissionBindings() {
        when(roleRepository.existsById(10L)).thenReturn(true);
        when(idGenerator.nextId()).thenReturn(100L, 101L);

        var response = controller.updatePermissions(
                10L,
                new RoleController.RolePermissionRequest(List.of(60L, 61L)));

        verify(rolePermissionRepository).deleteByRoleId(10L);
        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<RolePermission>> captor = ArgumentCaptor.forClass(List.class);
        verify(rolePermissionRepository).saveAll(captor.capture());
        assertThat(captor.getValue())
                .extracting(RolePermission::getRoleId, RolePermission::getPermissionId)
                .containsExactlyInAnyOrder(
                        org.assertj.core.groups.Tuple.tuple(10L, 60L),
                        org.assertj.core.groups.Tuple.tuple(10L, 61L));
        assertThat(response.getData()).containsExactly(60L, 61L);
    }
}
