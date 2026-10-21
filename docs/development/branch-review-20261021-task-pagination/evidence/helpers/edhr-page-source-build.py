#!/usr/bin/env python3
"""Read-only fixed-Git source receipts; no product, browser or Maven execution."""
from datetime import datetime
from zoneinfo import ZoneInfo
import hashlib
import json
from pathlib import Path
import subprocess

REPO = Path('/workspace/edhr-nexus-frontend')
FIXED = '13def47d4def51237d1393eaa7bf2651e98a0cbd'
BASE = 'gmp-platform/backend/src/main/java/com/zencas/edhr/'

def git(*args):
    return subprocess.check_output(['git', *args], cwd=REPO)

def sha(raw):
    return hashlib.sha256(raw).hexdigest()

specs = [
    ('workflow/controller/WorkflowTaskController.java', 'controller route and dependencies', 27, 33,
     'The two named queues share /api/v1/workflow/tasks and the real task repository/engine dependencies; this is not the base administrative list endpoint.'),
    ('workflow/controller/WorkflowTaskController.java', 'todo', 88, 103,
     'page defaults to1,size50; assigneeId is replaced by currentOperatorId; native query runs before int start/end slicing; return type remains ApiResponse<List<WorkflowTask>>.'),
    ('workflow/controller/WorkflowTaskController.java', 'done', 108, 122,
     'page defaults to1,size50; authenticated operator supplies owner; int start/end are computed before range guard; beyond-list start returns an empty array.'),
    ('workflow/controller/WorkflowTaskController.java', 'currentOperatorId', 186, 192,
     'Missing, unauthenticated or anonymous principal is rejected with AUTH_004; authenticated principal string supplies the queue identity.'),
    ('workflow/repository/WorkflowTaskRepository.java', 'findTodoForUser native query', 21, 26,
     'Read query limits status to PENDING/PROCESSING, excludes DHR_SUMMARY instances and retains existing assignee/candidate/unrestricted predicates; created_at descending order. No claim that all adjacent delegation-display policy is adjudicated.'),
    ('workflow/repository/WorkflowTaskRepository.java', 'findDoneForUser native query', 28, 31,
     'Read query uses assignee equality, COMPLETED/REJECTED/TRANSFERRED statuses and DHR exclusion; completed_at descending nulls-last order.'),
    ('common/exception/GlobalExceptionHandler.java', 'handleBusinessException', 29, 37,
     'A BusinessException is translated to its HTTP status and ApiResponse.error using that numeric HTTP status; GENERAL_001 therefore produces HTTP400 and body code400.'),
    ('common/exception/GlobalExceptionHandler.java', 'handleGenericException', 80, 87,
     'Uncaught negative/reversed subList bounds exceptions match generic Exception and are translated to HTTP500/body code500; source-derived path only, not executed here.'),
    ('common/config/SecurityConfig.java', 'securityFilterChain', 39, 60,
     'These workflow queues are absent from public matchers; anyRequest requires authentication and JWT filter runs before UsernamePasswordAuthenticationFilter.'),
    ('common/config/SecurityConfig.java', 'writeErrorResponse', 62, 69,
     'Security authentication entry point uses numeric HTTP status with the same JSON API envelope.'),
    ('identity/security/JwtAuthenticationFilter.java', 'doFilterInternal', 26, 54,
     'Validated JWT userId becomes the Authentication principal consumed by currentOperatorId; JWT permissions become authorities; filter clears AuditContext afterward.'),
    ('common/dto/ApiResponse.java', 'success(T)', 26, 34,
     'Successful queue data is the supplied List under data with code200, message, timestamp and traceId; paging does not introduce PageResult metadata here.'),
    ('common/dto/ApiResponse.java', 'error(int,String)', 46, 54,
     'Error response carries status code/message and null data; the class-level NON_NULL setting remains outside any pagination repair.'),
    ('common/exception/BusinessException.java', 'constructors with ErrorCode/detail', 11, 19,
     'Existing GENERAL_001 plus a concrete pagination-parameter detail can express invalid input without changing global exception policy.'),
    ('common/exception/BusinessException.java', 'getHttpStatus/getCode', 26, 32,
     'HTTP status derives from existing ErrorCode; domain code is independently available for logging.'),
    ('common/exception/ErrorCode.java', 'existing GENERAL error declarations', 75, 78,
     'GENERAL_001 is already the HTTP400 request-parameter validation error, not a new business decision or lifecycle rule.'),
]

scopes = []
for index, (tail, method, start, end, conclusion) in enumerate(specs, 1):
    path = BASE + tail
    raw = git('show', FIXED + ':' + path)
    assert 1 <= start <= end <= len(raw.splitlines())
    scopes.append({'id': f'w3-page-backend:{index:03d}', 'path': path, 'method': method,
        'range': [start, end], 'sourceCommit': FIXED,
        'blob': git('rev-parse', FIXED + ':' + path).decode().strip(), 'sha256': sha(raw),
        'readDepth': 'actual finite source inspection',
        'reviewer': '/root/pagination_source_support', 'wholeFileReviewComplete': False,
        'runtimeExecuted': False, 'conclusion': conclusion})

def i32(value):
    return (value + 2**31) % 2**32 - 2**31

cases = []
for page, size, behavior, after in [
    (0, 50, 'start=-50 leads to negative subList bound for empty or nonempty queues', 'HTTP400'),
    (-1, 2, 'start=-4 leads to negative subList bound', 'HTTP400'),
    (1, 0, 'start=end=0 returns a successful empty array rather than rejecting zero size', 'HTTP400'),
    (1, -1, 'start=0,end=-1 yields reversed subList bounds for nonempty queues', 'HTTP400'),
    (-2147483648, 1, 'page-1 itself overflows to MAX; small queues return successful empty array', 'HTTP400'),
    (2147483647, 2, 'multiplication wraps start to-4; subList bound is negative', 'successful empty array'),
    (65537, 65536, 'multiplication wraps start to0; five-item queue silently returns its first five items', 'successful empty array'),
    (2147483646, 2147483647, 'multiplication wraps start to3; addition wraps end negative; a five-item queue reaches reversed bounds', 'successful empty array'),
    (2147483647, 2147483647, 'multiplication wraps start to-2147483646; negative subList bound', 'successful empty array'),
    (1, 2147483647, 'start0/end5 for a five-item queue; currently accepted positive large size', 'same full five-item array, without an invented maximum size'),
    (2, 2147483647, 'startMAX is beyond five-item queue, so range guard returns empty despite unused negative end', 'same successful empty array'),
]:
    start = i32(i32(page - 1) * size)
    cases.append({'page': page, 'size': size, 'queueLengthForArithmetic': 5,
        'startInt32': start, 'endInt32ForFive': min(i32(start + size), 5),
        'unboundedOffset': (page - 1) * size, 'derivedCurrentBehavior': behavior,
        'expectedAfterProposedMinimalFix': after, 'actualProductRuntimeExecuted': False,
        'requiresProductReproduction': True})

document = {'schema': 'edhr-finite-source-map/v1', 'fixedCommit': FIXED,
    'author': '/root/pagination_source_support', 'status': 'FINAL-pending-frontend-child',
    'recordedAt': datetime.now(ZoneInfo('Asia/Shanghai')).isoformat(),
    'sourceScopes': scopes, 'arithmeticExamples': cases,
    'arithmeticQualification': 'Python int32 arithmetic models the inspected Java expressions only; no HTTP/database/browser product tests or Maven ran in this instance.',
    'safePositiveIntUpperBounds': {'offset': (2147483647-1)*2147483647, 'offsetPlusSize': 2147483647**2, 'fitsSignedLong': True},
    'businessSemanticsAssessment': 'A repair limited to positive integer pagination parameters and safe slicing preserves list shape, original owner/candidate/status/DHR predicates, ordering, lifecycle/actions, persisted rows and audit meaning. It requires no new task policy. This is a finite source assessment, not final QA acceptance.',
    'nonGoalsAndUnresolved': ['generic action/type matrix remains unanswered', 'no whole-workflow tenant isolation or delegation-display policy acceptance', 'record-control/DHR high/A12 deferred boundaries remain', 'W5-AUDIT-HASH-001 and historical signature recovery remain separate', 'no global pagination refactor or invented maximum page size'],
    'runtimeExecuted': False, 'repositoryMutations': False, 'wholeFileOrBranchAcceptance': False}
Path('/tmp/edhr-page-backend-scopes.json').write_text(json.dumps(document, ensure_ascii=False, indent=2) + '\n')

# Preserve child originals. Split only the child's explicitly read disjoint ranges,
# never a bounding range that would silently include unread intervening lines.
front_path = Path('/tmp/edhr-page-front-consumers.json')
front_raw = front_path.read_bytes()
front = json.loads(front_raw)
assert front['sourceCommit'] == FIXED and len(front['entries']) == 18
front_scopes = []
for entry in front['entries']:
    assert entry['sourceCommit'] == FIXED and entry['wholeFileReviewComplete'] is False and entry['runtimeExecuted'] is False
    raw = git('show', FIXED + ':' + entry['path'])
    blob = git('rev-parse', FIXED + ':' + entry['path']).decode().strip()
    assert entry['sha256'] == sha(raw) and entry['gitBlobSha'] == blob
    assert entry['fileLineCount'] == len(raw.splitlines())
    for ordinal, read_range in enumerate(entry['readRanges'], 1):
        start, end = read_range['startLine'], read_range['endLine']
        assert 1 <= start <= end <= len(raw.splitlines())
        front_scopes.append({'id': 'w3-page-' + entry['id'].lower() + f':range{ordinal:02d}',
            'path': entry['path'], 'method': entry['method'] + f' (original finite read segment {ordinal})',
            'range': [start, end], 'sourceCommit': FIXED, 'blob': blob, 'sha256': sha(raw),
            'readDepth': entry['readDepth'], 'reviewer': '/root/pagination_source_support/frontend_consumer',
            'originalClaimId': entry['id'], 'originalArtifactSha256': sha(front_raw),
            'wholeFileReviewComplete': False, 'runtimeExecuted': False, 'conclusion': entry['conclusion']})
document['status'] = 'FINAL'
document['sourceScopes'] = scopes + front_scopes
document['childInstances'] = [{'name': '/root/pagination_source_support/frontend_consumer', 'status': 'FINAL', 'runtimeExecuted': False, 'repositoryMutations': False}]
document['frontendQualification'] = {'originalClaimEntries': 18, 'explicitDisjointReadSegments': len(front_scopes),
    'mechanicalRangeSplitIsNotNewRead': True, 'wholeFileOrDistinctMethodCounting': False,
    'originalPath': str(front_path), 'originalSha256': sha(front_raw),
    'summary': 'Actual routed dashboard source uses page1,size5 and task arrays. Separate form/DHR review source uses page0,size20 and content/totals at distinct endpoints; do not change those request conventions. Same-named workflow-tasks API helpers have only definitions in fixed-src textual reference search and are not the routed dashboard consumer.'}
out_path = Path('/tmp/edhr-page-source-map.json')
out_path.write_text(json.dumps(document, ensure_ascii=False, indent=2) + '\n')
report = f'''# 工作流待办/已办分页的有限源码辅助

固定 Git：`{FIXED}`。本实例只读后端，子实例只读前端接口消费来源；两者已 FINAL，均未改仓库、未跑 Maven、数据库、HTTP、浏览器、构建或 UI 设计审查。这里的算术模型不是产品运行证据，也不替代主侧真实 JWT/PG 红绿或最终独立质量门禁。

## 当前接口与真实调用来源

后端两个队列默认 page=1,size=50，返回 ApiResponse<List<WorkflowTask>>，身份来自真实认证 principal。待办按原 assignee/candidate/unrestricted 谓词及 PENDING/PROCESSING 查询，已办按 assignee 及 COMPLETED/REJECTED/TRANSFERRED 查询；两者排除 DHR_SUMMARY，沿用原排序。以上是已读有限源码事实，不代表完整租户隔离、转办展示政策或全流程已验收。

实际首页 route→DashboardPage→TodoList/DoneList→DashboardTaskList 源码直接 GET /workflow/tasks/todo 或 /done，初始 page=1、显式 size=5，把 res.data.data 当 Task[]。同名 getTodo/getDone helper 请求 /workflow/tasks，但固定 frontend/src 文本引用只命中定义，不是这条路由消费链。表单审批和 DHR 审批独立入口使用 page=0,size=20、content/totals，不能把本批正页码校验扩展到这些不同接口。

## 分页边界（仅源码推导）

- page=0,size=50：start=-50；负页码/负页长可进入负或反转 subList 边界并由通用异常处理映射500。
- page=1,size=0：当前返回200空数组，未拒绝零页长。
- page=INT_MIN,size=1：page-1已先溢出到INT_MAX，少量队列返回200空数组而非拒绝非法页码。
- page=INT_MAX,size=2：乘法溢出到start=-4。
- page=65537,size=65536：乘法正向回绕到start=0，五条队列静默返回第一页；没有异常也不是正确越界页结果。
- page=2147483646,size=2147483647：乘法回绕到start=3，start+size再溢出到end=-2147483646，五条队列进入反转边界。
- page=INT_MAX,size=INT_MAX的start为-2147483646；JSON中的具体数值均用int32模型机械复核。
- page=1,size=INT_MAX当前可正常返回整条有限队列，page=2,size=INT_MAX当前可由start越界保护返回空。不能为实现便利发明最大页长。

仅在 page/size 都为正后，最大 offset=(INT_MAX-1)*INT_MAX=4611686011984936962，offset+size上界4611686014132420609，均在signed long内。转换须发生在乘法前；安全确认start小于List.size后再转为int索引。预期越界页空数组、正常原排序/结果和现有身份/候选/DHR谓词保持。主侧仍需真实HTTP/PG复现与验收。

## 范围与政策判断

正整数分页参数和安全下标属于局部技术输入边界，未引入任务动作、候选集合、生命周期、审计、签署或快照政策，也没有数据库迁移。通用动作类型矩阵仍未得到用户答复；记录控制/两项DHR high/A12延期、W5-AUDIT-HASH-001、历史签名不可恢复及整体W2/W3/W4–W7边界保持，不能随此片关闭。

地图含后端16个实际有限范围，加前端18条原claim中明确已读的{len(front_scopes)}个离散范围，总{len(document['sourceScopes'])}范围、{len({s['path'] for s in document['sourceScopes']})}路径。有交叉且非不同方法数；全文件完成0。前端离散range仅机械拆成固定格式，不扩到未读间隔、不冒称父实例重新亲读。全部Git blob/SHA和行范围再次机械核对有界；前端原JSON/MD保留原字节和作者归属。
'''
Path('/tmp/edhr-page-source-review.md').write_text(report)
manifest_paths = [out_path, Path('/tmp/edhr-page-source-review.md'), Path('/tmp/edhr-page-source-build.py'), front_path, Path('/tmp/edhr-page-front-consumers.md')]
Path('/tmp/edhr-page-source-manifest.json').write_text(json.dumps({'author':'/root/pagination_source_support','status':'FINAL','fixedCommit':FIXED,'childInstances':document['childInstances'],'files':[{'path':str(p),'sha256':sha(p.read_bytes()),'bytes':len(p.read_bytes())} for p in manifest_paths],'runtimeExecuted':False,'repositoryMutations':False},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'backendScopes': len(scopes), 'frontOriginalClaims':18, 'frontFiniteSegments':len(front_scopes), 'totalSourceScopes':len(document['sourceScopes']), 'paths':len({s['path'] for s in document['sourceScopes']}), 'sourceMapSha256':sha(out_path.read_bytes()), 'runtimeExecuted':False}))
