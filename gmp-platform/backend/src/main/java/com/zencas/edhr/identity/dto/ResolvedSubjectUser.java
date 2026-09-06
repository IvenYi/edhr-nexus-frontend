package com.zencas.edhr.identity.dto;

import java.util.Set;

/** A currently active user and every configured subject that selected them. */
public record ResolvedSubjectUser(Long userId, Set<SubjectReference> sources) {
}
