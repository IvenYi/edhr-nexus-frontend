from pathlib import Path
import importlib.util,json,hashlib
root=Path('/workspace/edhr-nexus-frontend')
spec=importlib.util.spec_from_file_location('fixture',root/'scripts/test-branch-review-ledger.py'); m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
t=m.LedgerHistoryTests();t.setUp()
try:
 sql='gmp-platform/backend/src/main/resources/db/changelog/example.sql'
 t.write(sql,'CREATE TABLE example(id int);\n');source=t.commit()
 review=dict(t.review);review['sourceCommit']=source;review['implementationEvidence']=sql+':1'
 t.write(m.SEMANTIC,json.dumps(review)+'\n');evidence_commit=t.commit()
 t.write(sql,'DROP TABLE example;\n');current=t.commit()
 ledger=m.ledger;g=ledger.Git()
 row=ledger.reconcile_semantics(g,current,[t.receipt(m.SEMANTIC,evidence_commit)],ledger.knowledge_records(g,current))[0]
 result={'scenario':'only named SQL implementation dependency changed','expectedCarryStatus':'needs-delta-review','actualCarryStatus':row['carryStatus'],'namedSql':sql,'sqlIncluded':sql in [d['path'] for d in row['dependencies']],'sqlOldBlob':g.tree(source)[sql]['blob'],'sqlCurrentBlob':g.tree(current)[sql]['blob'],'otherDependencies':row['dependencies']}
 assert result['actualCarryStatus']=='needs-delta-review' and result['sqlIncluded']
 Path('/tmp/edhr-ledger-qa-final-sql-dependency-repro.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
finally:t.doCleanups()
