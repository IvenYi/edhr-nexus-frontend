package com.zencas.edhr.identity.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.identity.entity.Role;
import com.zencas.edhr.identity.entity.RolePermission;
import com.zencas.edhr.identity.repository.RolePermissionRepository;
import com.zencas.edhr.identity.repository.RoleRepository;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1/identity/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final SnowflakeIdGenerator idGenerator;

    @GetMapping
    public ApiResponse<PageResult<Role>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page - 1, size, Sort.by(direction, sort));
        Page<Role> result = roleRepository.findAll(pageable);
        return ApiResponse.success(PageResult.of(
                result.getContent(), page, size, result.getTotalElements()));
    }

    @GetMapping("/{id}")
    public ApiResponse<Role> getById(@PathVariable Long id) {
        return roleRepository.findById(id)
                .map(ApiResponse::success)
                .orElseThrow(() -> new com.zencas.edhr.common.exception.BusinessException(
                        com.zencas.edhr.common.exception.ErrorCode.GENERAL_001, "记录不存在"));
    }

    @PostMapping
    public ApiResponse<Role> create(@RequestBody Role entity) {
        if (entity.getId() == null) entity.setId(idGenerator.nextId());
        if (entity.getTenantId() == null || entity.getTenantId() == 0L) entity.setTenantId(1L);

        return ApiResponse.success(roleRepository.save(entity));
    }

    @PutMapping("/{id}")
    public ApiResponse<Role> update(@PathVariable Long id, @RequestBody Role entity) {
        entity.setId(id);
        if (entity.getTenantId() == null || entity.getTenantId() == 0L) entity.setTenantId(1L);

        return ApiResponse.success(roleRepository.save(entity));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ApiResponse<Void> delete(@PathVariable Long id) {
        rolePermissionRepository.deleteByRoleId(id);
        roleRepository.deleteById(id);
        return ApiResponse.success(null);
    }

    @GetMapping("/{id}/permissions")
    public ApiResponse<List<Long>> getPermissions(@PathVariable Long id) {
        if (!roleRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.IDN_003);
        }
        List<Long> permissionIds = rolePermissionRepository.findByRoleId(id).stream()
                .map(RolePermission::getPermissionId)
                .toList();
        return ApiResponse.success(permissionIds);
    }

    @PutMapping("/{id}/permissions")
    @Transactional
    public ApiResponse<List<Long>> updatePermissions(
            @PathVariable Long id,
            @RequestBody RolePermissionRequest request) {
        if (!roleRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.IDN_003);
        }
        List<Long> permissionIds = request == null || request.getPermissionIds() == null
                ? List.of()
                : request.getPermissionIds().stream()
                        .filter(Objects::nonNull)
                        .distinct()
                        .toList();

        rolePermissionRepository.deleteByRoleId(id);
        List<RolePermission> bindings = permissionIds.stream()
                .map(permissionId -> RolePermission.builder()
                        .id(idGenerator.nextId())
                        .roleId(id)
                        .permissionId(permissionId)
                        .build())
                .toList();
        rolePermissionRepository.saveAll(bindings);
        return ApiResponse.success(permissionIds);
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RolePermissionRequest {
        private List<Long> permissionIds;
    }
}
