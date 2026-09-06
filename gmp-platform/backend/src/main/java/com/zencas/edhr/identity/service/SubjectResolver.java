package com.zencas.edhr.identity.service;

import com.zencas.edhr.identity.dto.ResolvedSubjectUser;
import com.zencas.edhr.identity.dto.SubjectReference;
import com.zencas.edhr.identity.dto.SubjectResolution;
import com.zencas.edhr.identity.entity.Department;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.entity.UserDepartment;
import com.zencas.edhr.identity.entity.UserRole;
import com.zencas.edhr.identity.repository.DepartmentRepository;
import com.zencas.edhr.identity.repository.RoleRepository;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.repository.UserDepartmentRepository;
import com.zencas.edhr.identity.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayDeque;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Resolves configured users, departments and roles to current active users.
 * It is deliberately policy-free: callers decide how to use source membership
 * for approvals, field permissions, notifications, or other workflows.
 */
@Service
@RequiredArgsConstructor
public class SubjectResolver {

    private final UserAccountRepository userAccountRepository;
    private final DepartmentRepository departmentRepository;
    private final RoleRepository roleRepository;
    private final UserDepartmentRepository userDepartmentRepository;
    private final UserRoleRepository userRoleRepository;

    @Transactional(readOnly = true)
    public SubjectResolution resolve(Collection<SubjectReference> configuredSubjects) {
        return resolve(null, configuredSubjects);
    }

    /**
     * Resolves subjects within a tenant. Passing a tenant ID is recommended
     * for all request-scoped callers; the no-tenant overload exists for
     * internal callers whose repositories already enforce tenant isolation.
     */
    @Transactional(readOnly = true)
    public SubjectResolution resolve(Long tenantId, Collection<SubjectReference> configuredSubjects) {
        LinkedHashSet<SubjectReference> subjects = normalize(configuredSubjects);
        if (subjects.isEmpty()) return new SubjectResolution(List.of(), Set.of());

        Map<Long, LinkedHashSet<SubjectReference>> sourcesByUser = new LinkedHashMap<>();
        LinkedHashSet<SubjectReference> unresolved = new LinkedHashSet<>();
        resolveDirectUsers(tenantId, subjects, sourcesByUser, unresolved);
        resolveDepartmentUsers(tenantId, subjects, sourcesByUser, unresolved);
        resolveRoleUsers(tenantId, subjects, sourcesByUser, unresolved);

        Set<Long> activeUserIds = userAccountRepository.findAllById(sourcesByUser.keySet()).stream()
                .filter(user -> "ACTIVE".equals(user.getStatus()) && tenantMatches(user.getTenantId(), tenantId))
                .map(UserAccount::getId)
                .collect(Collectors.toSet());
        subjects.stream()
                .filter(subject -> subject.type() == SubjectReference.SubjectType.USER)
                .filter(subject -> !activeUserIds.contains(subject.id()))
                .forEach(unresolved::add);

        List<ResolvedSubjectUser> users = sourcesByUser.entrySet().stream()
                .filter(entry -> activeUserIds.contains(entry.getKey()))
                .map(entry -> new ResolvedSubjectUser(entry.getKey(), Set.copyOf(entry.getValue())))
                .toList();
        return new SubjectResolution(users, Set.copyOf(unresolved));
    }

    private LinkedHashSet<SubjectReference> normalize(Collection<SubjectReference> configuredSubjects) {
        if (configuredSubjects == null) return new LinkedHashSet<>();
        return configuredSubjects.stream()
                .filter(Objects::nonNull)
                .filter(subject -> subject.type() != null && subject.id() != null)
                .map(this::normalizeScope)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private SubjectReference normalizeScope(SubjectReference subject) {
        return new SubjectReference(subject.type(), subject.id(),
                subject.type() == SubjectReference.SubjectType.DEPARTMENT
                        ? subject.effectiveDepartmentScope()
                        : null);
    }

    private void resolveDirectUsers(
            Long tenantId,
            Set<SubjectReference> subjects,
            Map<Long, LinkedHashSet<SubjectReference>> sourcesByUser,
            Set<SubjectReference> unresolved
    ) {
        Set<Long> userIds = idsFor(subjects, SubjectReference.SubjectType.USER);
        if (userIds.isEmpty()) return;
        Set<Long> existingIds = userAccountRepository.findAllById(userIds).stream()
                .filter(user -> tenantMatches(user.getTenantId(), tenantId))
                .map(UserAccount::getId)
                .collect(Collectors.toSet());
        subjects.stream()
                .filter(subject -> subject.type() == SubjectReference.SubjectType.USER)
                .forEach(subject -> {
                    if (existingIds.contains(subject.id())) addSource(sourcesByUser, subject.id(), subject);
                    else unresolved.add(subject);
                });
    }

    private void resolveDepartmentUsers(
            Long tenantId,
            Set<SubjectReference> subjects,
            Map<Long, LinkedHashSet<SubjectReference>> sourcesByUser,
            Set<SubjectReference> unresolved
    ) {
        List<SubjectReference> departmentSubjects = subjects.stream()
                .filter(subject -> subject.type() == SubjectReference.SubjectType.DEPARTMENT)
                .toList();
        if (departmentSubjects.isEmpty()) return;

        Map<Long, Department> departments = departmentRepository.findAll().stream()
                .filter(department -> tenantMatches(department.getTenantId(), tenantId))
                .collect(Collectors.toMap(Department::getId, department -> department));
        Map<Long, List<Long>> childrenByParent = departments.values().stream()
                .filter(department -> department.getParentId() != null)
                .collect(Collectors.groupingBy(Department::getParentId,
                        Collectors.mapping(Department::getId, Collectors.toList())));

        Map<SubjectReference, Set<Long>> departmentIdsBySubject = new LinkedHashMap<>();
        for (SubjectReference subject : departmentSubjects) {
            if (!departments.containsKey(subject.id())) {
                unresolved.add(subject);
                continue;
            }
            departmentIdsBySubject.put(subject, subject.effectiveDepartmentScope() == SubjectReference.DepartmentScope.SELF_ONLY
                    ? Set.of(subject.id())
                    : collectDepartmentTree(subject.id(), childrenByParent));
        }
        Set<Long> departmentIds = departmentIdsBySubject.values().stream()
                .flatMap(Set::stream)
                .collect(Collectors.toSet());
        if (departmentIds.isEmpty()) return;

        Map<Long, Set<Long>> usersByDepartment = userDepartmentRepository.findByDepartmentIdIn(departmentIds).stream()
                .collect(Collectors.groupingBy(UserDepartment::getDepartmentId,
                        Collectors.mapping(UserDepartment::getUserId, Collectors.toSet())));
        departmentIdsBySubject.forEach((subject, ids) -> ids.stream()
                .flatMap(id -> usersByDepartment.getOrDefault(id, Set.of()).stream())
                .forEach(userId -> addSource(sourcesByUser, userId, subject)));
    }

    private void resolveRoleUsers(
            Long tenantId,
            Set<SubjectReference> subjects,
            Map<Long, LinkedHashSet<SubjectReference>> sourcesByUser,
            Set<SubjectReference> unresolved
    ) {
        Set<Long> roleIds = idsFor(subjects, SubjectReference.SubjectType.ROLE);
        if (roleIds.isEmpty()) return;
        Set<Long> existingIds = roleRepository.findAllById(roleIds).stream()
                .filter(role -> tenantMatches(role.getTenantId(), tenantId))
                .map(role -> role.getId())
                .collect(Collectors.toSet());
        subjects.stream()
                .filter(subject -> subject.type() == SubjectReference.SubjectType.ROLE)
                .filter(subject -> !existingIds.contains(subject.id()))
                .forEach(unresolved::add);

        Map<Long, Set<Long>> usersByRole = userRoleRepository.findByRoleIdIn(existingIds).stream()
                .collect(Collectors.groupingBy(UserRole::getRoleId,
                        Collectors.mapping(UserRole::getUserId, Collectors.toSet())));
        subjects.stream()
                .filter(subject -> subject.type() == SubjectReference.SubjectType.ROLE)
                .filter(subject -> existingIds.contains(subject.id()))
                .forEach(subject -> usersByRole.getOrDefault(subject.id(), Set.of())
                        .forEach(userId -> addSource(sourcesByUser, userId, subject)));
    }

    private Set<Long> collectDepartmentTree(Long rootId, Map<Long, List<Long>> childrenByParent) {
        Set<Long> ids = new LinkedHashSet<>();
        ArrayDeque<Long> pending = new ArrayDeque<>();
        pending.add(rootId);
        while (!pending.isEmpty()) {
            Long current = pending.removeFirst();
            if (!ids.add(current)) continue;
            pending.addAll(childrenByParent.getOrDefault(current, List.of()));
        }
        return ids;
    }

    private Set<Long> idsFor(Set<SubjectReference> subjects, SubjectReference.SubjectType type) {
        return subjects.stream()
                .filter(subject -> subject.type() == type)
                .map(SubjectReference::id)
                .collect(Collectors.toSet());
    }

    private void addSource(
            Map<Long, LinkedHashSet<SubjectReference>> sourcesByUser,
            Long userId,
            SubjectReference source
    ) {
        sourcesByUser.computeIfAbsent(userId, ignored -> new LinkedHashSet<>()).add(source);
    }

    private boolean tenantMatches(Long entityTenantId, Long requestedTenantId) {
        return requestedTenantId == null || Objects.equals(entityTenantId, requestedTenantId);
    }
}
