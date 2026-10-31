"""One-off UAT-1030 transfer; export SQL first, rehearse, then apply to edhr_dev.

No source records are deleted. Existing target rows are never updated/deleted.
The generated SQL contains synthetic account hashes and belongs in private backups.
"""
import collections
import hashlib
import json
from pathlib import Path
import subprocess
import sys

SOURCE = "edhr_acceptance_20261030"
BACKUP = Path("/Users/ivenwang/.codex/backups/edhr/integration-20261031")
B = 883010000000
USERS = f"{B+1},{B+2},{B+3},{B+4}"
RECORDS = f"SELECT id FROM form_instance_record WHERE id BETWEEN {B+2000} AND {B+2007}"
DHRS = f"SELECT id FROM dhr_instance WHERE id BETWEEN {B+4004} AND {B+4007}"
VERSIONS = f"SELECT id FROM dhr_summary_version WHERE dhr_instance_id IN ({DHRS})"
INSTANCES = (f"SELECT workflow_instance_id::bigint FROM record_control_request WHERE record_id IN ({RECORDS}) "
             f"UNION SELECT workflow_instance_id FROM dhr_summary_review WHERE summary_version_id IN ({VERSIONS})")


def sql(db, statement):
    return subprocess.check_output(["psql", "-X", "-qAt", "-v", "ON_ERROR_STOP=1", "-d", db, "-c", statement], text=True).strip()


def rows(db, table, where="TRUE"):
    # Keep PostgreSQL's original JSON text, including numeric precision and snapshots.
    return json.loads(sql(db, f'SELECT coalesce(json_agg(to_jsonb(t)::text),\'[]\'::json) FROM "{table}" t WHERE {where}'))


def hashes(db):
    tables = json.loads(sql(db, "SELECT json_agg(tablename ORDER BY tablename) FROM pg_tables WHERE schemaname='public'"))
    return {t: sorted(hashlib.sha256(r.encode()).hexdigest() for r in rows(db, t)) for t in tables}


def export():
    # Explicit scope and FK insertion order. Derived deletion_form_reference is
    # rebuilt by the existing production_execution trigger, never copied by ID.
    scope = {
        "user_account": f"id IN ({USERS})",
        "role": f"id IN ({B+30},{B+31})",
        "user_role": f"user_id IN ({USERS})",
        "role_permission": f"role_id IN ({B+30},{B+31})",
        "signature": f"signer_id IN ('{B+1}','{B+2}','{B+3}','{B+4}')",
        "material": f"id={B+101}",
        "route": f"id={B+102}",
        "route_version": f"id={B+103}",
        "dhr_template": f"id={B+104}",
        "dhr_template_version": f"id={B+105}",
        "form_template": f"id={B+110}",
        "form_template_version": f"id={B+111}",
        "workflow_definition": f"id BETWEEN {B+200} AND {B+500}",
        "workflow_definition_version": f"id BETWEEN {B+201} AND {B+501}",
        "workflow_node": f"id BETWEEN {B+202} AND {B+505}",
        "workflow_edge": f"id BETWEEN {B+210} AND {B+511}",
        "product_process": f"id={B+106}",
        "product_process_version": f"id={B+107}",
        "work_order": f"id={B+108}",
        "production_object": f"id BETWEEN {B+1000} AND {B+1007}",
        "production_execution": f"object_id BETWEEN {B+1000} AND {B+1007}",
        "form_instance_record": f"id IN ({RECORDS})",
        "form_instance_revision": f"record_id IN ({RECORDS})",
        "record_control_request": f"record_id IN ({RECORDS})",
        "workflow_instance": f"id IN ({INSTANCES})",
        "workflow_task": f"instance_id IN ({INSTANCES})",
        "workflow_action_log": f"instance_id IN ({INSTANCES})",
        "dhr_instance": f"id IN ({DHRS})",
        "dhr_summary_version": f"id IN ({VERSIONS})",
        "dhr_summary_evidence": f"summary_version_id IN ({VERSIONS})",
        "dhr_summary_review": f"summary_version_id IN ({VERSIONS})",
        "audit_event": f"operator_id IN ('{B+1}','{B+2}','{B+3}','{B+4}')",
        "login_log": "username IN ('uat_applicant','uat_reviewer','uat_target','uat_manager')",
    }
    payload = {t: rows(SOURCE, t, where) for t, where in scope.items()}
    expected = {"user_account": 4, "role": 2, "form_instance_record": 8,
                "record_control_request": 7, "dhr_instance": 4, "workflow_instance": 10}
    assert all(len(payload[t]) == n for t, n in expected.items()), "UAT sample count changed; inspect before transfer"
    assert all(json.loads(r)["status"] == "IN_REVIEW" for r in payload["record_control_request"])
    statements = ["BEGIN;", "SET LOCAL lock_timeout='10s';", "SET LOCAL standard_conforming_strings=on;",
                  "DO $$ BEGIN IF current_database() NOT IN ('edhr_integration_rehearsal_20261031','edhr_dev') THEN RAISE EXCEPTION 'Wrong migration target'; END IF; END $$;"]
    manifest = {}
    for table, data in payload.items():
        columns = json.loads(sql(SOURCE, f"SELECT json_agg(column_name ORDER BY ordinal_position) FROM information_schema.columns WHERE table_schema='public' AND table_name='{table}' AND is_generated='NEVER'"))
        names = ",".join(f'"{c}"' for c in columns)
        select = ",".join("NULL::bigint" if table == "form_instance_record" and c == "current_revision_id" else f'"{c}"' for c in columns)
        text = "[" + ",".join(data) + "]"
        assert "$uat1030$" not in text
        statements.append(f'INSERT INTO "{table}" ({names}) SELECT {select} FROM json_populate_recordset(NULL::"{table}",$uat1030${text}$uat1030$::json);')
        manifest[table] = {"count": len(data), "hashes": sorted(hashlib.sha256(r.encode()).hexdigest() for r in data)}
    # Resolve the record/revision cycle only on the eight rows just inserted.
    for raw in payload["form_instance_record"]:
        record = json.loads(raw)
        statements.append(f"UPDATE form_instance_record SET current_revision_id={record['current_revision_id']} WHERE id={record['id']};")
    statements.append("SET CONSTRAINTS ALL IMMEDIATE;")
    # Advance only inserted tables' owned serials; never move a sequence backward.
    for table in payload:
        seq = sql(SOURCE, f"SELECT pg_get_serial_sequence('{table}','id')") if "id" in json.loads(payload[table][0]) else ""
        if seq:
            statements.append(f"SELECT setval('{seq}', GREATEST((SELECT last_value FROM {seq}), (SELECT max(id) FROM \"{table}\")), true);")
    statements.append("COMMIT;")
    BACKUP.mkdir(parents=True, exist_ok=True)
    path = BACKUP / "uat-1030-append.sql"
    path.write_text("\n".join(statements) + "\n")
    path.chmod(0o600)
    (BACKUP / "uat-source-manifest.json").write_text(json.dumps(manifest, indent=2))
    print(json.dumps({"sql": str(path), "counts": {t: x["count"] for t, x in manifest.items()}}, indent=2))


def verify(db, before_path, report_path):
    before = json.loads(Path(before_path).read_text())
    after = hashes(db)
    missing = {t: list((collections.Counter(v) - collections.Counter(after[t])).elements())
               for t, v in before.items() if collections.Counter(v) - collections.Counter(after[t])}
    samples = json.loads((BACKUP / "uat-source-manifest.json").read_text())
    missing_samples = {t: list((collections.Counter(v["hashes"]) - collections.Counter(after[t])).elements())
                       for t, v in samples.items() if collections.Counter(v["hashes"]) - collections.Counter(after[t])}
    report = {"database": db, "originalTables": len(before), "changedOrMissingOriginalRows": missing,
              "missingOrChangedImportedRows": missing_samples, "importedCounts": {t: v["count"] for t, v in samples.items()},
              "passed": not missing and not missing_samples}
    Path(report_path).write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))
    assert report["passed"], "Original data or imported snapshot mismatch"


if __name__ == "__main__":
    if sys.argv[1] == "export":
        export()
    elif sys.argv[1] == "snapshot":
        Path(sys.argv[3]).write_text(json.dumps(hashes(sys.argv[2]), indent=2))
    elif sys.argv[1] == "verify":
        verify(*sys.argv[2:])
    else:
        raise SystemExit("export | snapshot DATABASE FILE | verify DATABASE BEFORE_FILE REPORT_FILE")
