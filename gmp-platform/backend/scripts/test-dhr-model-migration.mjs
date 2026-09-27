// PostgreSQL regression against a disposable restoration of the pre-migration backup.
// Usage: node scripts/test-dhr-model-migration.mjs /absolute/path/before.dump
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const backup = process.argv[2];
assert(backup?.startsWith('/'), 'An explicit absolute pg_dump backup is required');
const database = `edhr_dhr_migration_${process.pid}_${Date.now()}`;
function run(command, args, input, success = true) {
  const r = spawnSync(command, args, { input, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (success === true) assert.equal(r.status, 0, r.stderr || r.stdout);
  else {
    assert.notEqual(r.status, 0, 'Expected migration to reject unsafe data');
    assert(r.stderr.includes(success), `Wrong failure: ${r.stderr}`);
  }
  return r.stdout;
}
const sql = (text, success = true) => run('psql', ['-X', '-w', '-v', 'ON_ERROR_STOP=1', '-At', '-d', database], text, success);
const migration = readFileSync(new URL('../src/main/resources/db/changelog/0104-dhr-current-evidence-only.sql', import.meta.url), 'utf8');
const assertion = `CREATE FUNCTION pg_temp.verify(ok boolean, message text) RETURNS void LANGUAGE plpgsql AS $$ BEGIN IF ok IS DISTINCT FROM TRUE THEN RAISE EXCEPTION '%',message; END IF; END $$;`;
const protectedTables = ['form_instance_record', 'production_object', 'production_execution', 'signature', 'dhr_attachment', 'audit_event'];
const fingerprints = () => protectedTables.map(table => sql(`SELECT md5(COALESCE(jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)::text)::text,'[]')) FROM ${table} t;`).trim());
run('createdb', ['-w', database]);
try {
  run('pg_restore', ['-w', '--exit-on-error', '--no-owner', '-d', database, backup]);
  const original = fingerprints();
  const old = JSON.parse(sql(`SELECT json_build_object('id',id::text,'dhr',dhr_instance_id::text) FROM dhr_summary_version WHERE evidence_model_version=1 ORDER BY id LIMIT 1;`));
  assert(/^\d+$/.test(old.id) && /^\d+$/.test(old.dhr));
  const preserved = protectedTables.map(table => `CREATE TEMP TABLE before_${table} AS SELECT * FROM ${table};`).join('\n');
  const invariants = protectedTables.map(table => `SELECT pg_temp.verify(NOT EXISTS(SELECT * FROM before_${table} EXCEPT SELECT * FROM ${table}), '${table} original rows changed');`).join('\n');
  const checks = `
    SELECT pg_temp.verify(NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='dhr_summary_version' AND column_name='evidence_model_version'), 'old discriminator remains');
    SELECT pg_temp.verify(NOT EXISTS(SELECT 1 FROM dhr_summary_version WHERE id=${old.id}), 'old freeze remains');
    SELECT pg_temp.verify(NOT EXISTS(SELECT 1 FROM dhr_summary_evidence WHERE summary_version_id=${old.id}), 'old evidence remains');
    SELECT pg_temp.verify((SELECT summary_status='DRAFT' AND status='COMPLETED' FROM dhr_instance WHERE id=${old.dhr}), 'lifecycle changed');
    SELECT pg_temp.verify((SELECT source_scope_hash IS NULL AND created_by='migration:0104' FROM dhr_summary_draft WHERE dhr_instance_id=${old.dhr}), 'draft must require fresh scope save');
    SELECT pg_temp.verify((SELECT count(*)=1 FROM audit_event WHERE entity_type='DHR_INSTANCE' AND entity_id='${old.dhr}' AND action='MIGRATE'), 'migration audit absent');
    SELECT pg_temp.verify((SELECT overlay_directory_json::jsonb=overlay_directory_snapshot::jsonb FROM dhr_summary_draft d JOIN obsolete_dhr_summary v ON d.id=v.id WHERE d.dhr_instance_id=${old.dhr}), 'overlay changed');
    SELECT pg_temp.verify((SELECT evidence_placement_json::jsonb @> '[{"recordId":"7","targetNodeKey":"base-dir-376207085283319808","beforeNodeKey":"base-item-376207085287514113","displayOrder":0}]'::jsonb FROM dhr_summary_draft WHERE dhr_instance_id=${old.dhr}), 'known work placement/order not recovered');
  `;
  sql(`BEGIN; ${assertion} ${preserved} ${migration} ${invariants} ${checks} ROLLBACK;`);
  assert.deepEqual(fingerprints(), original);
  console.log('PASS real backup restore, layout recovery, source/signature/audit preservation, transactional rollback');

  // A current draft must not be overwritten by obsolete layout recovery.
  sql(`BEGIN; ${assertion}
    INSERT INTO dhr_summary_draft(id,tenant_id,dhr_instance_id,overlay_directory_json,evidence_placement_json,source_scope_hash,revision,created_at,updated_at)
    VALUES(-104,'default',${old.dhr},'[]','[]','current-scope',7,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
    ${migration}
    SELECT pg_temp.verify((SELECT revision=7 AND source_scope_hash='current-scope' FROM dhr_summary_draft WHERE id=-104),'existing draft overwritten'); ROLLBACK;`);
  // Current versions (including their original hashes) remain immutable.
  sql(`BEGIN; ${assertion}
    INSERT INTO dhr_summary_version SELECT (jsonb_populate_record(NULL::dhr_summary_version,to_jsonb(v)||'{"id":-104,"version_no":2,"evidence_model_version":2,"check_result_snapshot":"{}","snapshot_hash":"current-hash"}'::jsonb)).* FROM dhr_summary_version v WHERE id=${old.id};
    ${migration}
    SELECT pg_temp.verify((SELECT snapshot_hash='current-hash' FROM dhr_summary_version WHERE id=-104),'current freeze changed');
    SELECT pg_temp.verify((SELECT summary_status='FORMALIZED' FROM dhr_instance WHERE id=${old.dhr}),'current lifecycle changed');
    SELECT pg_temp.verify(NOT EXISTS(SELECT 1 FROM dhr_summary_draft WHERE dhr_instance_id=${old.dhr}),'obsolete draft supersedes current'); ROLLBACK;`);
  console.log('PASS current draft and current frozen version precedence');
  sql(`BEGIN; UPDATE dhr_summary_version SET review_mode='REQUIRED',
    review_workflow_definition_id=(SELECT definition_id FROM workflow_definition_version ORDER BY id LIMIT 1),
    review_workflow_version_id=(SELECT id FROM workflow_definition_version ORDER BY id LIMIT 1)
    WHERE id=${old.id}; ${migration} COMMIT;`, 'Legacy DHR has a review workflow');
  sql(`BEGIN; UPDATE dhr_instance SET status='IN_PROGRESS' WHERE id=${old.dhr}; ${migration} COMMIT;`, 'Legacy DHR is not completed');
  // A late constraint failure must undo the earlier draft conversion and deletion.
  sql(`BEGIN;
    INSERT INTO dhr_summary_version SELECT (jsonb_populate_record(NULL::dhr_summary_version,to_jsonb(v)||'{"id":-104,"version_no":2,"evidence_model_version":2,"check_result_snapshot":null,"snapshot_hash":"invalid-current"}'::jsonb)).* FROM dhr_summary_version v WHERE id=${old.id};
    ${migration} COMMIT;`, 'contains null values');
  assert.deepEqual(fingerprints(), original);
  assert.equal(sql(`SELECT count(*) FROM dhr_summary_version WHERE id=${old.id};`).trim(), '1');
  assert.equal(sql('SELECT count(*) FROM dhr_summary_draft;').trim(), '0');
  console.log('PASS unsafe workflow/lifecycle guard and late-failure atomic rollback');
  // Fresh installations have no obsolete summaries, but reach the same final schema.
  sql(`BEGIN; ${assertion}
    DELETE FROM dhr_summary_evidence; DELETE FROM dhr_summary_version;
    ${migration}
    SELECT pg_temp.verify(NOT EXISTS(SELECT 1 FROM dhr_summary_draft),'empty DB gained a draft');
    SELECT pg_temp.verify((SELECT is_nullable='NO' FROM information_schema.columns WHERE table_name='dhr_summary_version' AND column_name='check_result_snapshot'),'check snapshot remains nullable'); ROLLBACK;`);
  console.log('PASS empty-summary schema migration');
} finally {
  // Exact name created by this process only; never operate on the source database.
  run('dropdb', ['-w', database]);
}
