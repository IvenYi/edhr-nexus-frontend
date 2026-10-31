"""Read-only independent evidence collection for the 2026-10-31 integration."""
from collections import Counter
import hashlib
import json
import os
from pathlib import Path
import subprocess

ROOT = Path('/Users/ivenwang/Documents/edhr-nexus')
BACKUP = Path('/Users/ivenwang/.codex/backups/edhr/integration-20261031')
OUT = ROOT / 'docs/development/edhr-dev-integration-20261031/evidence/independent'
ENV = {**os.environ, 'PGOPTIONS': '-c default_transaction_read_only=on', 'PGUSER': 'ivenwang', 'PGPASSWORD': ''}

def query(database, sql):
    return subprocess.check_output(['psql', '-XqAt', '-v', 'ON_ERROR_STOP=1', '-d', database, '-c', sql], text=True, env=ENV).strip()

def rows(database, table, predicate='TRUE'):
    return json.loads(query(database, f'SELECT coalesce(json_agg(to_jsonb(t)::text),\'[]\'::json) FROM "{table}" t WHERE {predicate}'))

def digest(raw):
    return hashlib.sha256(raw.encode()).hexdigest()

before = json.loads((BACKUP / 'dev-cutover-before-hashes.json').read_text())
imported = json.loads((BACKUP / 'uat-source-manifest.json').read_text())
current = {table: rows('edhr_dev', table) for table in before}
hashes = {table: Counter(map(digest, data)) for table, data in current.items()}
missing_original = {table: sum((Counter(expected) - hashes[table]).values()) for table, expected in before.items() if Counter(expected) - hashes[table]}
missing_imported = {table: sum((Counter(expected['hashes']) - hashes[table]).values()) for table, expected in imported.items() if Counter(expected['hashes']) - hashes[table]}
source_accounts = {row['id']: row for row in map(json.loads, rows('edhr_acceptance_20261030', 'user_account', 'id BETWEEN 883010000001 AND 883010000004'))}
target_accounts = {row['id']: row for row in map(json.loads, rows('edhr_dev', 'user_account', 'id BETWEEN 883010000001 AND 883010000004'))}
account_changes = {str(key): sorted(name for name in source_accounts[key] if source_accounts[key][name] != target_accounts[key][name]) for key in source_accounts}
expected_login_only = all(set(changes) <= {'last_login_at'} for changes in account_changes.values())
signature_checks = []
for raw in rows('edhr_dev', 'signature', "signer_id IN ('883010000001','883010000002','883010000003','883010000004')"):
    row = json.loads(raw)
    signature_checks.append({'id': str(row['id']), 'hashPresent': row['snapshot_hash'] is not None, 'valid': row['snapshot_hash'] is None or digest(row['snapshot_data']) == row['snapshot_hash']})
original_files = json.loads((BACKUP / 'main-untracked.json').read_text())
file_errors = [str(path) for path, expected in original_files.items() if not (ROOT / path).is_file() or hashlib.sha256((ROOT / path).read_bytes()).hexdigest() != expected]
sample_status = json.loads(query('edhr_dev', "SELECT json_build_object('recordCount',(SELECT count(*) FROM form_instance_record WHERE id BETWEEN 883010002000 AND 883010002007),'recordStatuses',(SELECT json_agg(status) FROM form_instance_record WHERE id BETWEEN 883010002000 AND 883010002007),'requestCount',(SELECT count(*) FROM record_control_request WHERE record_id BETWEEN 883010002000 AND 883010002007),'requestStatuses',(SELECT json_agg(status) FROM record_control_request WHERE record_id BETWEEN 883010002000 AND 883010002007),'dhrCount',(SELECT count(*) FROM dhr_instance WHERE id BETWEEN 883010004004 AND 883010004007),'revisionRefs',(SELECT count(*) FROM form_instance_record r JOIN form_instance_revision v ON v.id=r.current_revision_id AND v.record_id=r.id WHERE r.id BETWEEN 883010002000 AND 883010002007),'unvalidatedConstraints',(SELECT count(*) FROM pg_constraint WHERE connamespace='public'::regnamespace AND NOT convalidated),'disabledUserTriggers',(SELECT count(*) FROM pg_trigger WHERE NOT tgisinternal AND tgenabled='D'))"))
report = {'candidate': subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(), 'readOnly': True, 'originalTables':len(before), 'originalRows':sum(map(len,before.values())), 'missingOrChangedOriginalRows':missing_original, 'missingOrChangedImportedExactRows':missing_imported, 'uatAccountChangedFields':account_changes, 'uatAccountChangesAreLoginOnly':expected_login_only, 'signatureRawPayloadChecks':signature_checks, 'sampleStatus':sample_status, 'originalUntrackedFiles':len(original_files), 'changedOrMissingOriginalFiles':file_errors}
report['passed'] = not missing_original and set(missing_imported) <= {'user_account'} and expected_login_only and all(x['valid'] for x in signature_checks) and not file_errors and sample_status['recordCount'] == 8 and sample_status['requestCount'] == 7 and sample_status['dhrCount'] == 4 and sample_status['revisionRefs'] == 8 and set(sample_status['requestStatuses']) == {'IN_REVIEW'} and not sample_status['unvalidatedConstraints'] and not sample_status['disabledUserTriggers']
(OUT / 'preservation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False,indent=2))
assert report['passed'], 'Independent preservation check failed; inspect evidence without modifying the database'
