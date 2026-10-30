# 文档读取发现与反证

## AUD-W4-DOCUMENT-PAGE-ARITHMETIC-001 / medium

承接上批 `CAND-W4-DOCUMENT-PAGE-ARITHMETIC-001`，同一缺陷不重复计数。正常API创建后，大页号/页长的3个组合，以及空库一个组合500。根因为int乘法/加法先溢出，再Math.min无法恢复合法下标。已仅改两行中间运算为long，全新独立170通过、15/15必需检查，最终处置在acceptance overlay登记resolved，不回写旧候选原件。不新增400或页长上限，不改变原非正归一化。

## PERF-DOCUMENT-PAGE-VERSION-MATERIALIZATION-001 / runtime-observed, pending-discussion

实际 `list → findAll documents → category filter → batch IN all candidate versions → keyword match/sort → in-memory page`。合成20/100文档、每文档3版本、页长5：均3SQL，实际分别加载20/100文档及60/300版本、1分类；返回5文档及每份完整3版本。增长变量为D候选文档、V其完整版本数，内存及CPU不随小页缩小。

反证：版本一个IN批量查询，不是逐文档版本N+1；版本编码keyword可命中较旧版本且须返回该文档全部版本，正常POST/GET回归保留。不能直接LIMIT版本行。候选方案为先按完整语义取文档页/计数，再批取当前页全部版本；需讨论版本关键词、分类、稳定排序、响应完整性和一致视图，先原生PG计划/规模证据，不实施。

分类计数单独实测20/100文档均2SQL、仅文档和5分类实体，未加载版本。它有全量文档物化成本，但无逐分类计数SQL，不按相同源码重复制造N+1问题；同源全量成本在本风险解释，不另加一个修复成绩。

## PERF-DOCUMENT-VERSION-FILE-LOOKUPS-001 / runtime-observed, pending-discussion

`toResponse → versions.map(toVersionResponse) → FileObjectRepository.findById`。固定8文档×4版本，页2/5：无fileId均3SQL；共用1文件或各不相同文件均11/23SQL，实际文件实体加载8/20次。open-in-view=false、列表无外层读事务，仓储调用的持久化上下文不跨次复用，不能假设同ID天然有一次查询。

范围为当前页完整版本数F，而不是全库V次文件查询。这里读取文件元数据，未读取磁盘文件字节；没有测网络/磁盘/生产时延。候选方案：收集当前页去重fileId批读为请求内map，纯投影接收map；保留无fileId、合法缺失兼容（需核政策）、原文件ID/名称/MIME、顺序、身份与权限。暂不加跨请求缓存，不删校验，不实现优化。

## 其他候选与结构安排

- `A23-W4-MATERIAL-COMPARATOR-NULL-001`、`A23-W4-DOCUMENT-FILE-FALLBACK-001` 见独立A23记录；一个是可简化候选，一个证据缺口，不当已修功能bug。
- `CAND-W5-DOCUMENT-ENTITY-NULLABILITY-001`：当前规范schema的文档父code可空、控制器正常创建写null，而遗留实体@Column(nullable=false)生成不同DDL。本批H2显式对齐规范schema，未改实体/迁移；后续W5对native schema/ORM初始化用途核对，不将夹具对齐叫生产修复。
- `CAND-W3-DOCUMENT-METHOD-AUTH-001`：当前DocumentManagementController无方法级PreAuthorize，SecurityConfig只要求已登录；本批仅认证/匿名拒绝，不认证文档操作权限矩阵。后续W3核对实际业务权限规范和所有入口，不能凭前端权限码直接自定新后端政策。

大模块方案：`DocumentReadService.list(DocumentQuery)`拥有读取/匹配/分页语义；`DocumentResponseAssembler.toResponse(document, versions, categoriesById, filesById)`只投影，不在内部查库。写入/审计、文件资格、删除保护和事务留原所有者；接口把已有上下文暴露出来，可控制隐式逐版本查询。以页边界、旧版本keyword、完整成员、分类/未分类、重复文件和缺失文件政策、真实权限作保护。当前局部算术仅两行，不先把整控制器搬进大service；性能与结构方案讨论后再实施。
