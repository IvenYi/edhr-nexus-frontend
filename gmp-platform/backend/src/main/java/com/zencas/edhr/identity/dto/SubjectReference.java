package com.zencas.edhr.identity.dto;

/**
 * A stable reference to a configured identity subject. Callers keep display
 * names in their own configuration; resolution relies only on this type, ID,
 * and department scope.
 */
public record SubjectReference(
        SubjectType type,
        Long id,
        DepartmentScope departmentScope
) {
    public enum SubjectType {
        USER,
        DEPARTMENT,
        ROLE
    }

    public enum DepartmentScope {
        SELF_AND_CHILDREN,
        SELF_ONLY
    }

    public DepartmentScope effectiveDepartmentScope() {
        return type == SubjectType.DEPARTMENT && departmentScope == DepartmentScope.SELF_ONLY
                ? DepartmentScope.SELF_ONLY
                : DepartmentScope.SELF_AND_CHILDREN;
    }
}
