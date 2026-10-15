#!/usr/bin/env python3
"""Inventory a fixed Git tree. Enumeration never implies semantic review."""
import argparse
import collections
import csv
import hashlib
import json
import re
import subprocess
from pathlib import Path


def git(*args):
    return subprocess.check_output(['git', *args])


def ownership(path):
    name = Path(path).name.lower()
    if path.startswith('docs/knowledge/'):
        return 'knowledge', 'W0-W7'
    if path.startswith(('docs/', 'README', 'AGENTS', 'codeplz')):
        return 'documentation-governance', 'W0-W7'
    if 'dhr' in name or name in {'executionsnapshotbuilder.java', 'forminstancerecordservice.java'}:
        return 'dhr-record-lifecycle', 'W1'
    if any(s in name for s in ('workflow', 'worktemplate', 'formfillsettings', 'auth', 'permission', 'signature', 'security', 'subject', 'audit')) or '/identity/' in path:
        return 'workflow-identity-control', 'W3'
    if any(s in name for s in ('form', 'projection', 'trace', 'canvas', 'designer', 'template')):
        return 'form-design-reference-projection', 'W2'
    if '/masterdata/' in path or any(s in name for s in ('production', 'process', 'workorder', 'equipment', 'material', 'factory', 'workshop', 'product')):
        return 'masterdata-production', 'W4'
    return 'cross-domain-engineering', 'W5'


def asset_type(path, binary):
    if binary:
        return 'binary-asset'
    if path.endswith(('package-lock.json', 'yarn.lock', 'pnpm-lock.yaml')):
        return 'dependency-lock'
    if '/db/changelog/' in path:
        return 'database-migration'
    if '/src/test/' in path or '/scripts/test-' in path or path.startswith('tools/knowledge-model/src/test/'):
        return 'test'
    if path.startswith('docs/knowledge/'):
        return 'knowledge'
    if path.endswith(('.java', '.tsx', '.ts', '.js', '.mjs', '.cjs', '.py', '.sh')):
        return 'source-or-tool'
    if path.endswith('.md'):
        return 'documentation'
    return 'configuration-or-data'


def write_csv(path, columns, rows):
    with path.open('w', newline='') as stream:
        writer = csv.DictWriter(stream, fieldnames=columns)
        writer.writeheader()
        writer.writerows(rows)


parser = argparse.ArgumentParser()
parser.add_argument('--ref', required=True)
parser.add_argument('--out', type=Path, required=True)
args = parser.parse_args()
commit = git('rev-parse', args.ref).decode().strip()
tree = git('rev-parse', commit + '^{tree}').decode().strip()
args.out.mkdir(parents=True, exist_ok=True)
records = []
entries = []
migrations = []
prefix = 'gmp-platform/backend/src/main/'
mapping = re.compile(r'@(RequestMapping|GetMapping|PostMapping|PutMapping|PatchMapping|DeleteMapping)\b')
background = re.compile(r'@(Scheduled|EventListener|TransactionalEventListener|Async|KafkaListener)\b|\bimplements\s+(?:ApplicationRunner|CommandLineRunner|SmartLifecycle)\b|\bnew(?:SingleThread|FixedThread|ScheduledThread)Pool\b|\bnewSingleThreadExecutor\b')
for record in git('ls-tree', '-rz', '-l', commit).split(b'\0'):
    if not record:
        continue
    meta, raw_path = record.split(b'\t', 1)
    mode, kind, blob, size = meta.decode().split()
    path = raw_path.decode()
    if kind == 'blob':
        raw = git('cat-file', 'blob', blob)
        try:
            content = raw.decode('utf-8')
            binary = '\0' in content
        except UnicodeDecodeError:
            content, binary = '', True
    else:
        raw, content, binary = b'', '', True
    domain, package = ownership(path)
    typ = asset_type(path, binary)
    notes = 'Inventory only; no semantic conclusion. Binary assets require metadata/consumer review.' if binary else 'Inventory only; no semantic conclusion.'
    records.append({'baseline_commit': commit, 'path': path, 'asset_type': typ,
                    'domain': domain, 'work_package': package, 'in_scope': 'true',
                    'exclusion_reason': '', 'review_depth': 'inventory-only',
                    'review_status': 'pending', 'reviewer': '', 'source_evidence': blob,
                    'finding_ids': '', 'tested_commit': '', 'notes': notes})
    for number, line in enumerate(content.splitlines(), 1):
        matches = []
        if path.startswith(prefix) and path.endswith('.java'):
            if mapping.search(line):
                matches.append('http-annotation')
            if background.search(line):
                matches.append('background-candidate')
            if re.search(r'\benum\s+\w*(?:State|Status)\b|\bclass\s+\w*(?:State|Status)Machine\b', line):
                matches.append('state-definition-candidate')
        if path.startswith('gmp-platform/frontend/src/') and re.search(r'<Route\b|createBrowserRouter\b|\bpath\s*:', line):
            matches.append('frontend-route-candidate')
        for match in matches:
            entries.append({'baseline_commit': commit, 'kind': match, 'path': path,
                            'line': number, 'source': line.strip(),
                            'status': 'candidate-needs-call-chain-review'})
    if '/db/changelog/' in path:
        migrations.append({'baseline_commit': commit, 'path': path, 'blob': blob,
                           'status': 'inventory-only',
                           'notes': 'Must resolve master/profile include order before migration execution.'})

columns = ['baseline_commit', 'path', 'asset_type', 'domain', 'work_package', 'in_scope',
           'exclusion_reason', 'review_depth', 'review_status', 'reviewer', 'source_evidence',
           'finding_ids', 'tested_commit', 'notes']
assert len({r['path'] for r in records}) == len(records)
expected = {p.decode() for p in git('ls-tree', '-rz', '--name-only', commit).split(b'\0') if p}
assert {r['path'] for r in records} == expected
write_csv(args.out / 'coverage.csv', columns, records)
write_csv(args.out / 'entrypoints.csv', ['baseline_commit', 'kind', 'path', 'line', 'source', 'status'], entries)
write_csv(args.out / 'migrations.csv', ['baseline_commit', 'path', 'blob', 'status', 'notes'], migrations)
summary = {'sourceCommit': commit, 'tree': tree, 'trackedPaths': len(records),
           'scopeCount': len(records), 'excludedPaths': [],
           'assetTypes': dict(collections.Counter(r['asset_type'] for r in records)),
           'workPackages': dict(collections.Counter(r['work_package'] for r in records)),
           'entrypointCandidates': dict(collections.Counter(r['kind'] for r in entries)),
           'migrationFiles': len(migrations), 'semanticReviewComplete': False,
           'entrypointLimitations': 'Static candidate locations include class annotations and dynamic route shapes; URLs, auth and worker activation require source review. No route execution claimed.',
           'coverageSha256': hashlib.sha256((args.out / 'coverage.csv').read_bytes()).hexdigest()}
(args.out / 'inventory-summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(summary, ensure_ascii=False))
