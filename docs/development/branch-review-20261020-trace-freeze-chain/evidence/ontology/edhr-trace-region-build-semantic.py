#!/usr/bin/env python3
"""Pin the ontology instance's explicitly read scopes to an actual candidate."""
import hashlib
import importlib.util
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path('/workspace/edhr-nexus-frontend')
BASE = '061d7f1ff71d11084667d08293fd7d5fe0d7680d'
spec = importlib.util.spec_from_file_location('scoped_ledger', ROOT / 'scripts/build-branch-review-ledger.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
git = module.Git()
candidate = git.commit(sys.argv[1])
assert candidate != BASE, 'A new committed candidate containing the repair and knowledge is required'

BACK = 'gmp-platform/backend/src/main/java/com/zencas/edhr/'
FRONT = 'gmp-platform/frontend/src/pages/master-data/template-designer-react/'
POLICY = 'docs/knowledge/decisions/DEC-0077-form-traceability-projection-ownership.yaml'
DOC = 'docs/knowledge/evidence/trace-region-consumption-2026-10-20.md'
CONFIG = BACK + 'template/service/FormProjectionInterpreter.java'
SNAPSHOT = BACK + 'production/service/ExecutionSnapshotBuilder.java'
INDEX = BACK + 'production/service/FormTraceIndexService.java'
RECORD = BACK + 'production/service/FormInstanceRecordService.java'
FORMAL = BACK + 'production/service/FormProjectionService.java'
DHR = BACK + 'production/service/DhrTraceReportService.java'
DHR_SOURCE = BACK + 'production/service/DhrInstanceService.java'
LOOKUP = BACK + 'template/service/FormLookupCatalogService.java'
UI = FRONT + 'utils/projectionConfiguration.ts'
PREVIEW = FRONT + 'utils/projectionPreview.ts'
DIALOG = FRONT + 'components/ProjectionDialog.tsx'
TEST = 'gmp-platform/backend/src/test/java/com/zencas/edhr/production/service/'

# Each conclusion belongs only to the named scope, not every clause or runtime scenario.
scopes = [
 ('DEC-0077-20', '追溯项目录复用、字段来源和内容查询不创建真实归属；仅核对本轮主表区域消费者，不复核全部目录生命周期。', [LOOKUP, INDEX, UI]),
 ('DEC-0077-33', '合法主表别名在保存事务refresh中提取；未保存输入不查询、正式统计仍仅最终完成；不回填旧漏索引。', [RECORD, INDEX, FORMAL]),
 ('DEC-0077-38', '最近保存内容与正式冻结来源分离；核对DHR经核验终止快照提取和主表定位，不概括四类页面全部已验收。', [INDEX, DHR, DHR_SOURCE, FORMAL]),
 ('DEC-0077-42', '区域身份、新设计/新使用严格校验和旧冻结沿自身来源解释；不重核外部研究或声称配置删除已经执行。', [CONFIG, SNAPSHOT, INDEX, UI, PREVIEW, DIALOG]),
 ('rule.form-projection.trace-field-single-binding', '配置基数按Java空白主表身份计数，旧冻结解释不套新基数；遗漏消费方与该身份一致，不新增规则。', [CONFIG, INDEX, UI, PREVIEW, DIALOG]),
 ('fact.form-projection.trace-field-binding-count', 'validateConfiguration按表区域和真实字段累计sources，不按画布放置次数或业务统计来源计数；availability/成熟度不提升。', [CONFIG]),
 ('fact.form-projection.source-configuration', 'ExecutionSnapshotBuilder.form从模板model/payload复制projection，新使用时严格校验，已有表单/正式投影不回读最新模板。', [SNAPSHOT, CONFIG, FORMAL]),
 ('fact.form-projection.formal-source-snapshot', 'completed深复制form/model/values/context/operationId写source_json，process只解释该冻结来源；不审核所有后台调度场景。', [FORMAL]),
 ('scenario.form-projection-trace-item-reuse-and-old-evidence', '同项跨字段和不同实际区域保持；旧冻结多绑提取不调用严格设计校验，不写回原值/映射。', [CONFIG, INDEX, UI, PREVIEW]),
 ('concept.form-saved-content-trace', '最近成功保存的内容索引与正式业务记录、真实执行/DHR归属分离；本轮仅补主表区域消费遗漏。', [RECORD, INDEX, DHR, FORMAL]),
 ('relation.form-field-associated-trace-item', 'one-to-zero-or-one适用于当前模板真实字段，不按同名/放置次数合并，不据此改写已有冻结内容；不验证清理执行事实。', [CONFIG, UI, INDEX]),
 ('anchor.form-projection.saved-content-trace', '亲核saved→refresh/extract与DHR匹配真实入口及新增区域回归断言；原来源元数据保留，本轮增量由新证据记录。', [RECORD, INDEX, DHR, DHR_SOURCE]),
]
records = module.knowledge_records(git, candidate)
rows = []
source_receipts = {}

def receipt(path):
    raw = git.read(candidate, path)
    assert (ROOT / path).read_bytes() == raw, f'Uncommitted evidence changed: {path}'
    row = {'path': path, 'commit': candidate, 'blob': git.tree(candidate)[path]['blob'],
           'sha256': hashlib.sha256(raw).hexdigest()}
    source_receipts[path] = row
    return row

for key, scope, dependencies in scopes:
    meta = records[key]
    definition = receipt(meta['sourcePath'])
    sources = [receipt(p) for p in dependencies]
    documentation = receipt(DOC)
    rows.append({
        'id': key, 'recordType': meta['recordType'], 'sourcePath': meta['sourcePath'],
        'sourceLocator': meta['sourceLocator'], 'sourceCommit': candidate,
        'recordSha256': meta['recordSha256'], 'sourceBlob': definition['blob'],
        'sourceSha256': definition['sha256'], 'originalMaturity': meta['assetStatus'],
        'visibility': meta['visibility'], 'auditScopeClassification': 'current-effective-scoped-review',
        'reviewStatus': 'reviewed', 'conclusion': 'consistent', 'reviewedScope': scope,
        'contractBaseline': {'sourceCommit': candidate, 'targetBranch': 'edhr-dev',
            'targetCommit': BASE, 'contractReadCommit': BASE, 'uncommittedContractPaths': []},
        'knowledgeBaselineVersion': '0.3.25', 'schemaVersion': '1.2.0',
        'decisionEvidence': [POLICY + ':DEC-0077-20', POLICY + ':DEC-0077-33', POLICY + ':DEC-0077-38', POLICY + ':DEC-0077-42'],
        'implementationEvidence': sources, 'evidence': documentation,
        'wholeRecordSemanticPassClaimed': False, 'wholeFileReviewComplete': False,
        'businessRuntimeExecutedByOntologyInstance': False,
        'validationExecutedByOntologyInstance': 'formal knowledge model: 89 passed / 0 failures / 0 errors / 0 skipped',
        'runtimeValidationBoundary': '主侧及正式质量实际受测输出另取，不把源码/知识检查称PG、浏览器或全制造业务验收。',
        'limitations': ['不关闭两旧DHR high、四旧知识gap或A12延期', '不执行旧索引回填或配置清理迁移', '不计为全库或整个资产的语义通过'],
    })

out = Path('/tmp/edhr-trace-region-semantic-review.jsonl')
out.write_text(''.join(json.dumps(r, ensure_ascii=False, sort_keys=True) + '\n' for r in rows))
manifest = {'candidateCommit': candidate, 'baseCommit': BASE, 'semanticScopeRecords': len(rows),
            'wholeAssetPassClaims': 0, 'sources': [source_receipts[k] for k in sorted(source_receipts)]}
Path('/tmp/edhr-trace-region-semantic-source-receipts.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'records': len(rows), 'candidate': candidate, 'sha256': hashlib.sha256(out.read_bytes()).hexdigest()}))
