# W4 混合版本标签排序审计

本批以最新 `edhr-dev@635711f97e9b794f4af02e1e5d1939bb2ecf920f` 为基线。PR42 已人工合入，整树与交付 `5539d26e` 相同，无额外代码、知识或契约增量。执行级别 L2；全新独立实例对干净候选 `57d44a125132a788606507619e07896f0b21bc38` 正式 `passed/FINAL`，12/12 必需检查通过，无本批交付阻断。详见 [acceptance.json](acceptance.json)，整体审计尚未完成。

## 实际问题与修复边界

`CAND-W4-VERSION-COMPARATOR-ORDER-001` 从上批方法级候选推进为实际 API 缺陷 `AUD-W4-VERSION-COMPARATOR-ORDER-001`，只算一个问题，严重度 medium。正常 POST 接受 `V2a3`、`V2b` 等同组标签，GET 列表在不同创建顺序/原始排序方向下给出不同的组头与版本顺序。旧基线 60 项检查为 8 失败、52 通过、0 error/skip；24 项为新增混合标签组合，36 项沿用上批边界回归。见原件 [baseline-summary.json](evidence/baseline-summary.json)、[baseline-http.jsonl](evidence/baseline-http.jsonl)。不声称已经复现排序异常引起的 500。

根因：`while (leftMatcher.find() && rightMatcher.find())` 在右边已无数字段时先消费左边剩余数字段；退出后再次 `leftMatcher.find()` 跳过该段。结果可能正反比较都返回负数。已仅将两侧下一段的存在性各读取一次，再比较是否同时存在，保留原数字段逐段顺序、额外数字段分支和相等时文本回退。产品源码一文件 7 增 3 删。不新增 SemVer、版本格式限制或发布策略，不改字符串、身份、SQL、分组/过滤阶段、权限或生产/DHR 冻结。

## 验证与覆盖边界

测试使用实际 JWT/filter/控制器/H2 物料、类型、审计仓储；通过正常 POST 创建，再 GET 检查组头、完整成员 ID、计数、聚合状态及读取前后完整三表行快照。其他未配置制程依赖仍为明确 mock。新增方法级有限集合排序性质检查与实际 API 证据分开记录；不把有限集合性质检查当任意字符串形式证明。

主侧实际 133/133 后端通过，0 failure/error/skip：60 边界集成（旧 36 + 新 24）、55 Process 控制器（旧 54 + 新 1）、14 Product 控制器、4 物料导入。60 同组旧 8 红/52 正 → 当前 60 绿；22 标签性质测试旧 1 红 → 当前 1 绿。24 是六组标签×两种创建顺序×两个列表输入排序方向，不称 24 种业务政策。59 条授权 GET 原件另有一个测试执行三次匿名 401，请求数不当唯一覆盖数。原件及命令见 [primary-summary.json](evidence/primary-summary.json)。没有 UI 改动，本批未重新执行浏览器/前端 build/strict/lint；既有 strict 19 和 ESLint 配置缺口仍非通过。

独立实际后端 133/133、知识 89/89，均 0 failure/error/skip。独立旧基线 115 项为 9 真实失败、106 正向通过：恰 8 个 API 排序断言和 1 个性质失败，0 error/skip，旧记录均 HTTP 200，不声称排序 500。独立复验及 30 份原件归档映射见 acceptance；不将主侧和独立同类运行相加成 unique 覆盖。受测提交全区间空白 1 项 optional failed（8 个原样日志/XML），13 个非证据路径通过；后续归档继续保留原件字节，不宣称全局空白已绿。

固定清单 4311 路径、130 迁移、442 HTTP 注解候选、198 前端路由候选只是盘点，独立四文件逐字节重建通过。源码方法范围见 [source-review.json](source-review.json)，整文件完成 0，未重新计算全历史唯一覆盖率。本体角色 5 个既有 ID 有限一致、`not-applicable/FINAL`，知识版本和成熟度保持，实际结构校验 89 通过；5 条与历史重叠，不叫新增 unique 覆盖。H2 不是原生 PostgreSQL 计划、迁移或生产容量认证。

## 其他实际源码审查与后续

除比较器调用链，本批开始核对文档管理关联读取，具体候选、反证及拆分方案见 [findings.md](findings.md)。性能候选仅登记，未经讨论不实施优化。下轮先 fetch 最新目标，优先文档列表正常 API 的分页边界、关联文件加载及容量证据，再推进 W3/W4 其他未审入口；W2 余项和 W5–W7 尚未完成。

原 TaskDetail 签名页、生产弹窗设计、记录变更/作废依赖 DHR high/A12、四知识 gap 保持。三项既有设备/物料性能建议仍待讨论；不因“已合并/继续”实施 SQL、缓存、索引或分组分页优化。不自动合并、部署或恢复历史数据。
