package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.jdbc.core.JdbcTemplate;

import static com.zencas.edhr.production.service.ExecutionSnapshotBuilder.invalid;

/** Display metadata only. Frozen evidence readers must continue to use their explicit version. */
final class DhrArchiveLayoutReader {
    private DhrArchiveLayoutReader() {}

    static ObjectNode read(JdbcTemplate jdbc, ObjectMapper mapper, Long dhrId, String status) {
        ObjectNode layout = mapper.createObjectNode();
        layout.putArray("overlayDirectories");
        layout.putArray("placements");
        if ("DRAFT".equals(status)) {
            jdbc.query("SELECT overlay_directory_json,evidence_placement_json FROM dhr_summary_draft WHERE tenant_id='default' AND dhr_instance_id=?",
                    (org.springframework.jdbc.core.RowCallbackHandler) rs -> {
                        try {
                            layout.set("overlayDirectories", mapper.readTree(rs.getString(1)));
                            layout.set("placements", mapper.readTree(rs.getString(2)));
                        } catch (java.io.IOException e) { throw invalid("DHR 目录编排读取失败"); }
                    }, dhrId);
        } else if ("PENDING_REVIEW".equals(status) || "FORMALIZED".equals(status)) {
            var versions = jdbc.queryForList("SELECT id,overlay_directory_snapshot FROM dhr_summary_version WHERE tenant_id='default' AND dhr_instance_id=? ORDER BY version_no DESC LIMIT 1", dhrId);
            if (!versions.isEmpty()) {
                var version = versions.getFirst();
                try { layout.set("overlayDirectories", mapper.readTree(version.get("overlay_directory_snapshot").toString())); }
                catch (java.io.IOException e) { throw invalid("DHR 目录编排读取失败"); }
                var placements = layout.withArray("placements");
                jdbc.query("SELECT source_record_id,target_node_key,before_node_key,display_order,display_name FROM dhr_summary_evidence WHERE tenant_id='default' AND summary_version_id=? ORDER BY id",
                        (org.springframework.jdbc.core.RowCallbackHandler) rs -> {
                            var placement = placements.addObject().put("recordId", rs.getString(1)).put("targetNodeKey", rs.getString(2));
                            if (rs.getString(3) != null) placement.put("beforeNodeKey", rs.getString(3));
                            if (rs.getObject(4) != null) placement.put("displayOrder", rs.getInt(4));
                            if (rs.getString(5) != null) placement.put("displayName", rs.getString(5));
                        }, version.get("id"));
            }
        }
        var refs = layout.putArray("recordRefs");
        if (!layout.withArray("placements").isEmpty()) jdbc.query("SELECT id,operation_id,form_id,copy_id FROM form_instance_record WHERE tenant_id='default' AND object_id=(SELECT production_object_id FROM dhr_instance WHERE tenant_id='default' AND id=?) AND source_type='PRODUCTION_EXECUTION'",
                (org.springframework.jdbc.core.RowCallbackHandler) rs -> refs.addObject().put("id", rs.getString(1)).put("operationId", rs.getString(2)).put("formId", rs.getString(3)).put("copyId", rs.getString(4)), dhrId);
        return layout;
    }
}
