package com.zencas.edhr.identity.dto;

import java.util.List;
import java.util.Set;

/**
 * Resolution keeps source membership for caller-specific policy evaluation,
 * while ensuring each effective user is returned at most once.
 */
public record SubjectResolution(
        List<ResolvedSubjectUser> users,
        Set<SubjectReference> unresolvedSubjects
) {
}
