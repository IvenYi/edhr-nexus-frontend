package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.audit.AuditContext;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Personal inbox only. Receiving a notice never grants access to its DHR or workflow. */
@Service
@RequiredArgsConstructor
public class DhrImpactNotificationService {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;

    @Transactional(readOnly = true)
    public ObjectNode list(int page) {
        String actor = actor();
        page = Math.max(0, page);
        ObjectNode result = mapper.createObjectNode();
        String from = " FROM dhr_impact_notification n JOIN dhr_evidence_impact i ON i.id=n.impact_id"
                + " JOIN dhr_summary_version v ON v.id=i.summary_version_id AND v.tenant_id=i.tenant_id"
                + " JOIN dhr_instance d ON d.id=v.dhr_instance_id AND d.tenant_id=i.tenant_id"
                + " JOIN form_instance_record f ON f.id=i.record_id AND f.tenant_id=i.tenant_id"
                + " WHERE i.tenant_id='default' AND n.recipient_id=?";
        result.put("unreadCount", jdbc.queryForObject("SELECT count(*)" + from + " AND n.read_at IS NULL", Long.class, actor));
        result.put("total", jdbc.queryForObject("SELECT count(*)" + from, Long.class, actor));
        result.set("content", mapper.valueToTree(jdbc.query("""
            SELECT i.id,d.dhr_no,v.version_no,f.instance_no,i.action,i.occurred_at,n.read_at
            """ + from + " ORDER BY i.id DESC LIMIT 20 OFFSET ?", (rs, index) -> mapper.createObjectNode()
                .put("id", rs.getString("id")).put("dhrNo", rs.getString("dhr_no"))
                .put("versionNo", rs.getInt("version_no")).put("instanceNo", rs.getString("instance_no"))
                .put("action", rs.getString("action")).put("occurredAt", rs.getString("occurred_at"))
                .put("read", rs.getTimestamp("read_at") != null), actor, (long) page * 20)));
        return result;
    }

    @Transactional
    public void read(long id) {
        jdbc.update("""
            UPDATE dhr_impact_notification SET read_at=COALESCE(read_at,CURRENT_TIMESTAMP)
            WHERE impact_id=? AND recipient_id=? AND EXISTS
              (SELECT 1 FROM dhr_evidence_impact i WHERE i.id=impact_id AND i.tenant_id='default')
            """, id, actor());
    }

    private String actor() {
        String id = AuditContext.getOperatorId();
        if (id == null || id.isBlank()) throw new AccessDeniedException("未登录");
        return id;
    }
}
