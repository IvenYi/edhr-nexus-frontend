package com.zencas.edhr.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiAccess {
    public static final String FORM_PERMISSION = "master-data.form-templates";
    private final JdbcTemplate jdbc;

    public long actor() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) throw new AiException(401, "AUTH_REQUIRED");
        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException error) {
            throw new AiException(403, "USER_ID_REQUIRED");
        }
    }

    public boolean permitted(long userId, String permission) {
        return Boolean.TRUE.equals(jdbc.queryForObject("""
                SELECT EXISTS (
                  SELECT 1 FROM user_account u
                  JOIN user_role ur ON ur.user_id = u.id
                  JOIN role_permission rp ON rp.role_id = ur.role_id
                  JOIN permission p ON p.id = rp.permission_id
                  WHERE u.id = ? AND u.tenant_id = 0 AND u.status = 'ACTIVE'
                    AND (u.locked_until IS NULL OR u.locked_until <= CURRENT_TIMESTAMP)
                    AND p.code = ?)
                """, Boolean.class, userId, permission));
    }

    public void require(long userId, String permission) {
        if (!permitted(userId, permission)) throw new AiException(403, "PERMISSION_DENIED");
    }
}
