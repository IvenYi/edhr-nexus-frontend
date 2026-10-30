# 本批发现、反证与结构处置

## AUD-W4-VERSION-COMPARATOR-ORDER-001 / medium

承接上批同名 CAND，不重复记缺陷。基线实际正常 API 已复现相同组成员随创建/输入顺序改变而给出不同版本列表和组头。根因及原件见 README/decision-package；已最小修复且主侧 133 通过，当前待独立验收。修复没有限制此前可接受标签，不能将组头“展示版本”解释为唯一发布版本、自动选择制程或历史冻结依据。未复现排序 500，不扩张影响。

## 文档读取的下一批候选（仅源码证据，未正常 API 复现）

- `CAND-W4-DOCUMENT-PAGE-ARITHMETIC-001`：`DocumentManagementController.list` 在 `Math.min` 前用 int 计算页偏移/末下标，与已修物料路径有同类溢出风险；尚未取得该控制器正常 API 红绿，不并入本批排序修复。
- `PERF-DOCUMENT-PAGE-VERSION-MATERIALIZATION-001`：同一入口先加载所有文档，再按分类收集全部关联版本，按版本信息匹配 keyword，最后内存分页。D（文档数）、V（候选文档全部版本数）增长时，即使小页也可能加载 O(D+V) 实体。反证：版本使用一个 `IN` 查询批量读取，不应笼统称这里逐文档 N+1；完整版本关键词匹配和响应成员是当前语义，不能直接 LIMIT 版本行。尚无运行次数/内存/PG 计划，pending-measurement-and-discussion。
- `PERF-DOCUMENT-VERSION-FILE-LOOKUPS-001`：分页后 `toResponse → versions.stream().map(toVersionResponse)` 对每个非空 fileId 调用 `FileObjectRepository.findById`。风险按当前页各文档版本总数 F 增长，不等于整个库 V 次文件查询；实际 SQL 还受事务/持久化上下文/重复 ID 影响，未实测不能报固定 F+常数。候选方案为请求内批量读去重文件 ID 并传 map；暂不实现。

分类统计的反证：`toDocumentCategoryResponses` 一次读文档后 groupingBy 统计、一次读分类，不是逐分类统计 SQL；仍有全库实体物化成本。`countDocumentsByCategory` 的全量读取另用于分类编辑的前后审计/返回以及分类删除，不能把其源码存在直接算入列表请求。候选需后续按实际调用链分别取证、与已有风险按根因去重。

## 大模块拆分可行性

当前 `compareVersion` 仅一个私有调用链，本批不为它单独制造服务或通用框架。若未来第二个真实使用者需要完全相同的比较含义，可抽纯 `VersionLabelComparator.compare(String,String)`：输入原标签、输出比较符号，无仓储/状态/时钟；用排序性质、数字段/文本回退和真实分组 API 保护，不引入 SemVer 规则。

文档控制器的具体后续方案：`DocumentReadService.list(DocumentQuery)` 负责读取阶段、过滤和分页语义；`DocumentResponseAssembler.toResponse(document, versions, categoriesById, filesById)` 只做投影，不允许内部仓储查询。写入、文件资格校验、事务、删除保护及审计仍留原职责。预期收益是显式暴露每请求共享上下文、阻止投影函数暗中逐版本读库，便于独立度量查询数；先实测并讨论性能方案，确认后才实施。保护测试应覆盖版本关键词匹配、空/缺失文件、同一文件重复引用、分类及未分类、完整组版本和既有权限。当前仅方案，不算重构或性能修复完成。

## 当前保留范围

三项已实测设备/物料性能风险沿原风险台账 pending-discussion；新文档风险没有冒充第四/第五个已实测缺陷。原用户暂缓、旧历史签署/审计限制、strict 既有提示和 ESLint 配置缺口均没有因本批运行自动关闭。整体 W2/W3/W4 剩余及 W5–W7 继续。
