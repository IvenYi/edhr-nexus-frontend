package com.zencas.edhr.identity.controller;

import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.identity.entity.RolePermission;
import com.zencas.edhr.identity.repository.RolePermissionRepository;
import com.zencas.edhr.identity.repository.RoleRepository;
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
    @Mock private SnowflakeIdGenerator idGenerator;

    @InjectMocks private RoleController controller;

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
