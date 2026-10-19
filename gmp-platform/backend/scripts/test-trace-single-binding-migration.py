"""Exercise the migration on a transaction-local shadow table; persistent data is untouched."""
import json
import subprocess
from pathlib import Path

migration = (Path(__file__).resolve().parents[1] / 'src/main/resources/db/changelog/0116-trace-field-single-binding.sql').read_text()


def trace(identity, sources, table=None, enabled=True):
    return dict(id=identity, modelId='formTrace', enabled=enabled, sources=sources, **({'tableId': table} if table else {}))


models = [
    {'projection': {'bindings': [trace('a', {'batch': 'lot', 'order': 'order'}), trace('b', {'supplier': 'lot'}),
                                {'id': 'statistics', 'modelId': 'production', 'sources': {'productionDate': 'lot'}}]}},
    {'payload': {'projection': {'bindings': [trace('main', {'batch': 'same'}), trace('x1', {'batch': 'same'}, 'x'),
                                           trace('x2', {'supplier': 'same'}, 'x'), trace('y', {'batch': 'same'}, 'y'),
                                           trace('other', {'batch': 'other'}, 'x')]}}},
    {'projection': {'bindings': [trace('valid', {'batch': 'lot'}), trace('reuse', {'batch': 'other'})]}},
    {'projection': {'bindings': [trace('a', {'batch': 'lot'}), trace('duplicate', {'batch': 'lot'}, enabled=False)]}},
]
originals = [json.dumps(model, ensure_ascii=False) for model in models]
rows = ','.join(f"({index + 1},'{text.replace(chr(39), chr(39) * 2)}',7,'before','immutable-evidence')" for index, text in enumerate(originals))
query = "SELECT json_agg(row_to_json(t) ORDER BY id) FROM form_template_version t;"
sql = f"""BEGIN;
SET LOCAL search_path=pg_temp;
CREATE TEMP TABLE form_template_version(id BIGINT,model_design_json TEXT,lock_version BIGINT,updated_by TEXT,evidence TEXT,updated_at TIMESTAMP);
INSERT INTO form_template_version(id,model_design_json,lock_version,updated_by,evidence) VALUES {rows};
{migration}
{query}
{migration}
{query}
ROLLBACK;
"""
result = subprocess.run(['psql', '-XqAt', '-v', 'ON_ERROR_STOP=1'], input=sql, text=True, capture_output=True, check=True)
first, second = [json.loads(line) for line in result.stdout.splitlines() if line.startswith('[')]
assert first == second, 'cleanup must be idempotent, including lock versions and timestamps'
clean = [json.loads(row['model_design_json']) for row in first]
assert clean[0]['projection']['bindings'] == [trace('a', {'order': 'order'}), models[0]['projection']['bindings'][2]]
assert [binding['id'] for binding in clean[1]['payload']['projection']['bindings']] == ['main', 'y', 'other']
assert first[2]['model_design_json'] == originals[2] and first[2]['lock_version'] == 7, 'valid reused items must remain byte-for-byte unchanged'
assert clean[3]['projection']['bindings'] == [], 'all conflicting assignments are removed, including duplicate meanings and disabled assignments'
assert all(row['evidence'] == 'immutable-evidence' for row in first)
assert [row['lock_version'] for row in first] == [8, 8, 7, 8]
print('passed: main/subtable cleanup, wrapped/plain JSON, complete conflict removal, same-item reuse, statistics/evidence preservation, optimistic version, idempotency')
