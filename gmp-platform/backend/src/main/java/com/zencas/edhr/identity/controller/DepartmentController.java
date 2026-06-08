package com.zencas.edhr.identity.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.identity.entity.Department;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.entity.UserDepartment;
import com.zencas.edhr.identity.entity.UserRole;
import com.zencas.edhr.identity.repository.DepartmentRepository;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.repository.UserDepartmentRepository;
import com.zencas.edhr.identity.repository.UserRoleRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/identity/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentRepository departmentRepository;
    private final UserDepartmentRepository userDepartmentRepository;
    private final UserAccountRepository userAccountRepository;
    private final UserRoleRepository userRoleRepository;
    private final SnowflakeIdGenerator idGenerator;

    @GetMapping
    public ApiResponse<PageResult<Department>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page - 1, size, Sort.by(direction, sort));
        Page<Department> result = departmentRepository.findAll(pageable);
        return ApiResponse.success(PageResult.of(
                result.getContent(), page, size, result.getTotalElements()));
    }

    @GetMapping("/tree")
    public ApiResponse<List<DepartmentNode>> tree() {
        List<Department> departments = departmentRepository.findAll(
                Sort.by(Sort.Direction.ASC, "sortOrder").and(Sort.by(Sort.Direction.ASC, "name")));
        List<UserDepartment> memberships = userDepartmentRepository.findAll();
        List<Long> userIds = memberships.stream()
                .map(UserDepartment::getUserId)
                .distinct()
                .toList();
        Map<Long, List<UserDepartment>> departmentsByUser = memberships.stream()
                .collect(Collectors.groupingBy(UserDepartment::getUserId));
        Map<Long, List<UserRole>> rolesByUser = userIds.isEmpty()
                ? Map.of()
                : userRoleRepository.findByUserIdIn(userIds).stream()
                .collect(Collectors.groupingBy(UserRole::getUserId));
        Map<Long, UserSummary> usersById = userAccountRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(
                        UserAccount::getId,
                        user -> toUserSummary(
                                user,
                                departmentsByUser.getOrDefault(user.getId(), List.of()),
                                rolesByUser.getOrDefault(user.getId(), List.of()))));

        Map<Long, List<UserSummary>> usersByDepartment = new HashMap<>();
        for (UserDepartment membership : memberships) {
            UserSummary user = usersById.get(membership.getUserId());
            if (user != null) {
                usersByDepartment
                        .computeIfAbsent(membership.getDepartmentId(), ignored -> new ArrayList<>())
                        .add(user);
            }
        }

        Map<Long, DepartmentNode> nodesById = new LinkedHashMap<>();
        for (Department department : departments) {
            nodesById.put(department.getId(), toDepartmentNode(
                    department,
                    usersByDepartment.getOrDefault(department.getId(), List.of()),
                    new ArrayList<>()));
        }

        List<DepartmentNode> roots = new ArrayList<>();
        for (Department department : departments) {
            DepartmentNode node = nodesById.get(department.getId());
            Long parentId = department.getParentId();
            if (parentId != null && nodesById.containsKey(parentId)) {
                nodesById.get(parentId).getChildren().add(node);
            } else {
                roots.add(node);
            }
        }
        return ApiResponse.success(roots);
    }

    @GetMapping("/{id}")
    public ApiResponse<DepartmentNode> getById(@PathVariable Long id) {
        return departmentRepository.findById(id)
                .map(department -> ApiResponse.success(toDepartmentNode(
                        department,
                        List.of(),
                        List.of())))
                .orElseThrow(() -> new com.zencas.edhr.common.exception.BusinessException(
                        com.zencas.edhr.common.exception.ErrorCode.GENERAL_001, "记录不存在"));
    }

    @PostMapping
    public ApiResponse<DepartmentNode> create(@RequestBody Department entity) {
        if (entity.getId() == null) entity.setId(idGenerator.nextId());
        applyDefaults(entity);

        return ApiResponse.success(toDepartmentNode(
                departmentRepository.save(entity),
                List.of(),
                List.of()));
    }

    @PutMapping("/{id}")
    public ApiResponse<DepartmentNode> update(@PathVariable Long id, @RequestBody DepartmentRequest request) {
        Department existing = departmentRepository.findById(id)
                .orElseThrow(() -> new com.zencas.edhr.common.exception.BusinessException(
                        com.zencas.edhr.common.exception.ErrorCode.GENERAL_001, "记录不存在"));
        if (request.getCode() != null && !request.getCode().isBlank()) existing.setCode(request.getCode());
        existing.setName(request.getName());
        existing.setParentId(request.getParentId());
        if (request.getTenantId() != null) existing.setTenantId(request.getTenantId());
        if (request.getSortOrder() != null) existing.setSortOrder(request.getSortOrder());
        existing.setUpdatedAt(LocalDateTime.now());

        return ApiResponse.success(toDepartmentNode(
                departmentRepository.save(existing),
                List.of(),
                List.of()));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        departmentRepository.deleteById(id);
        return ApiResponse.success(null);
    }

    private void applyDefaults(Department entity) {
        if (entity.getTenantId() == null) entity.setTenantId(1L);
        if (entity.getSortOrder() == null) entity.setSortOrder(0);
        if (entity.getCode() == null || entity.getCode().isBlank()) {
            entity.setCode(generateDepartmentCode(entity.getId()));
        }
    }

    private String generateDepartmentCode(Long id) {
        return "ORG-" + id;
    }

    private DepartmentNode toDepartmentNode(
            Department department,
            List<UserSummary> users,
            List<DepartmentNode> children) {
        return DepartmentNode.builder()
                .id(String.valueOf(department.getId()))
                .tenantId(String.valueOf(department.getTenantId()))
                .parentId(department.getParentId() == null ? null : String.valueOf(department.getParentId()))
                .code(department.getCode())
                .name(department.getName())
                .sortOrder(department.getSortOrder())
                .users(users)
                .children(children)
                .build();
    }

    private UserSummary toUserSummary(
            UserAccount user,
            List<UserDepartment> departments,
            List<UserRole> roles) {
        List<String> departmentIds = departments.stream()
                .map(UserDepartment::getDepartmentId)
                .map(String::valueOf)
                .toList();
        String primaryDepartmentId = departments.stream()
                .filter(item -> Boolean.TRUE.equals(item.getIsPrimary()))
                .findFirst()
                .map(UserDepartment::getDepartmentId)
                .map(String::valueOf)
                .orElse(departmentIds.isEmpty() ? null : departmentIds.getFirst());

        return UserSummary.builder()
                .id(String.valueOf(user.getId()))
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .status(user.getStatus())
                .roleIds(roles.stream()
                        .map(UserRole::getRoleId)
                        .map(String::valueOf)
                        .toList())
                .departmentIds(departmentIds)
                .primaryDepartmentId(primaryDepartmentId)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    @Data
    @NoArgsConstructor
    public static class DepartmentRequest {
        private Long tenantId;
        private Long parentId;
        private String code;
        private String name;
        private Integer sortOrder;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentNode {
        private String id;
        private String tenantId;
        private String parentId;
        private String code;
        private String name;
        private Integer sortOrder;
        private List<UserSummary> users;
        private List<DepartmentNode> children;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummary {
        private String id;
        private String username;
        private String displayName;
        private String email;
        private String phone;
        private String status;
        private List<String> roleIds;
        private List<String> departmentIds;
        private String primaryDepartmentId;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
