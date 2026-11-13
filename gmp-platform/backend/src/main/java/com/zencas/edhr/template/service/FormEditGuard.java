package com.zencas.edhr.template.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/** Native form concurrency contract; independent of any AI runtime or plugin. */
@Service
@RequiredArgsConstructor
public class FormEditGuard {
    private final JdbcTemplate jdbc;

    public void template(long id, Long expectedRevision) {
        long revision = lockTemplate(id);
        expected(expectedRevision, revision);
        if (Boolean.TRUE.equals(jdbc.queryForObject("""
                SELECT EXISTS(SELECT 1 FROM form_edit_lease l JOIN form_template_version v ON v.id=l.version_id
                WHERE v.template_id=? AND l.lease_until > clock_timestamp())
                """, Boolean.class, id))) throw conflict("AI 正在编辑此模板，请先停止任务或等待占用释放");
    }

    public long lockTemplate(long id) {
        var rows = jdbc.queryForList("SELECT lock_version FROM form_template WHERE id=? AND tenant_id='default' FOR UPDATE", Long.class, id);
        if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "表单模板不存在");
        return rows.getFirst();
    }

    public long version(long templateId, long versionId, Long expectedRevision, UUID owner) {
        lockTemplate(templateId);
        long revision = lockVersion(templateId, versionId);
        expected(expectedRevision, revision);
        var holders = jdbc.queryForList("SELECT owner_token FROM form_edit_lease WHERE version_id=? AND lease_until > clock_timestamp()", UUID.class, versionId);
        if (owner == null ? !holders.isEmpty() : holders.isEmpty() || !Objects.equals(holders.getFirst(), owner))
            throw conflict("编辑占用已变化，请停止 AI 或重新读取当前表单");
        return revision;
    }

    public long acquire(long templateId, long versionId, UUID owner, Instant until) {
        lockTemplate(templateId);
        long revision = lockVersion(templateId, versionId);
        var holders = jdbc.queryForList("SELECT owner_token FROM form_edit_lease WHERE version_id=? AND lease_until > clock_timestamp()", UUID.class, versionId);
        if (!holders.isEmpty() && !Objects.equals(holders.getFirst(), owner)) throw conflict("此表单已被其他任务占用");
        jdbc.update("""
                INSERT INTO form_edit_lease(version_id,owner_token,lease_until) VALUES (?,?,?)
                ON CONFLICT(version_id) DO UPDATE SET owner_token=excluded.owner_token,lease_until=excluded.lease_until
                """, versionId, owner, java.sql.Timestamp.from(until));
        return revision;
    }

    private long lockVersion(long templateId, long versionId) {
        var rows = jdbc.queryForList("SELECT COALESCE(lock_version,0) FROM form_template_version WHERE id=? AND template_id=? AND tenant_id='default' FOR UPDATE", Long.class, versionId, templateId);
        if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "表单版本不存在");
        return rows.getFirst();
    }

    public void touchTemplate(long id) {
        jdbc.update("UPDATE form_template SET lock_version=lock_version+1 WHERE id=?", id);
    }

    private void expected(Long expected, long actual) {
        if (expected == null) throw conflict("缺少表单修订号，请刷新后重试");
        if (expected != actual) throw conflict("表单已被修改，请刷新后重试");
    }

    private ResponseStatusException conflict(String message) { return new ResponseStatusException(HttpStatus.CONFLICT, message); }
}
