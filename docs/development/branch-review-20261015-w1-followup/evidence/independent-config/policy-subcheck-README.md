# W1 START 配置冻结：独立质量辅助只读核对

本报告是最终质量实例的辅助检查，不是最终 `qualityResult`，不替代父实例必须实际运行的 PostgreSQL/H2/知识测试。本人未参与任何代码、测试、数据夹具或配置修复；未修改仓库，未运行 Maven、数据库写入、浏览器或 GitHub Actions。

实际读取候选：`1113fe14f7f7539b9727fc708f49838504287d4f`；本地远端目标引用：`edhr-dev@6379bf105127b05a65695992b008b55c142264f9`；本批代码区间起点 `31a8074a8962da66b2c4e49f4bf5a1a92724bfa0`。当前台账等工作树变更由主审持有，存在于提交之外；本辅助只核对其内容，不声称工作树 clean。

本实例实际从候选读取 AGENTS、quality-verifier、统一交接契约；三个契约 blob 分别为 `8e62c2aee54a78468861bb01cfad4d7f77b11665`、`581e647c37daebeb9dd3d6397ae53e30e7822fb3`、`9b54a3610a5b5f835c95e2dcd31c3a60ac4886d4`，均与主侧原读取提交 `537bb2402227bfe6369c44c2b1b4686481c50f27`、目标 6379 相同。本实例的实际 contractReadCommit 为 1113，不复制他人历史读取时间。知识版本 0.3.25/schema1.2.0。

## 结论

限定政策、写侧可达性和同步边界检查通过，无有据的新增缺陷。首 START 读取自洽已提交配置是已确认身份关系与使用时冻结的技术实现，不新增管理员禁止编辑、额外发布、冻结时点提前、历史修复或合并部署政策。

### 合法原子重绑定具有实际入口

- `ProductProcessController.java:261–267` 的 PUT owner-version 入口调用 `ProductProcessOwnerService.updateVersion`。
- `ProductProcessOwnerService.java:132–150` 使用一个 `@Transactional` 更新同一 versionId；`:238–239` 设置新 routeVersionId 与 dhrTemplateVersionId；`:295–335` 先验证新路线节点、表单引用，再删旧绑定并保存新绑定。
- `:345–360` 真实检查新 dhrTemplateItem 属于所选 DHR 版本且 formTemplateVersionId 匹配；`:397–399` 通过 directory.versionId 核对归属；`:415–425` 删除表单/文档子绑定并 flush 后删除工序绑定。
- 因此现行合法管理员入口可以在一个提交中切换 route/DHR/children。受控测试采用该原子 SQL 模型有源码依据；其缺少管理员 HTTP/JPA 全链验证的限制已如实披露。

### 旧 composition 项的移除可达，但不能外推无条件删除

- `DhrTemplateWorkspaceController.java:101–137` 的 composition PUT 明确 templateId/versionId，并在一个事务中全量替换；`:107–117` 校验父属与请求，`:120–124` 删除旧 items/directories 后保存新的请求集合。
- `:350–357` 只检查指定模板/版本存在及父属；`:367–420` 校验目录和请求项形状与引用，没有把模板已用于生产作为统一编辑禁令。`:455–475` 为新请求项分配新 ID；因此测试中的单独 DELETE item50 是当前入口能产生的条目移除效果投影，非逐句模拟全部 SQL 或管理员 HTTP E2E。
- `0086-master-data-deletion-protection.sql:68` 的 `fk_delete_guard_066` 仍阻止删除被工序表单绑定引用的 DHR item；`:69` 还有可选 dhr_evidence_item 限制。测试先提交旧绑定移除，再删 item50，且首 START 尚未落地 DHR，受控场景没有这些剩余引用。此结论不能扩展成任何历史被引用项都允许删除。
- 本批四文件没有改迁移、删除保护实现或相关政策。

### 现行政策一致

- DEC-0001-04/-05/-06 分别约束制程绑定路线/DHR、工序节点归属和 DHR item/form version 身份；DEC-0001-09 明确当前局部执行快照在首次合法 START 构建。
- DEC-0062-02/-03 保护生产对象唯一 DHR 及创建时上下文/目录冻结，后续模板变化不改写实例。
- DEC-0077-12 与 `form-traceability-projection-ownership-user-confirmed.md:82–86` 保留同版本编辑、新使用取当时配置、旧使用不回写，不新增投影专属发布冻结。
- `ProductionExecutionService.java:153–154` 的 RR 是工程机制；`:176–181` 首次创建才读取 builder，已有执行沿用 JSON；`:230–240` DHR 创建和执行保存仍在同一事务。
- `ProductionExecutionController.java:53–65` 仅在服务代理调用抛错后按原因链 SQLState 40001 转为既有 400 提示，没有自动重试。其他异常仍抛出；权限、生命周期、数量逻辑没有 diff。
- `DhrFillingService.java:61–76` 的外层事务可以加入 act，但允许动作集合排除 START。因此证据没有声称全部来源入口都获得独立 RR。

### 知识与决策包边界

Python/PyYAML 原始文件对比确认：仅新增 `evidence.production-execution-start-configuration-consistency-tests`，原两项 evidence 只改 description；没有删除 ID、改 DEC、规则、状态或 visibility。排除 schema 词汇后的递归定义数为 2487，重复业务定义 ID 为 0。

decision-package 将 RR 放 inferred，confirmed 四类列表为空，replacementScopes/unresolved 为空；impactAnalysis 保留管理员 SQL 模型、其他并发组合和 W1/W2–W7 未完成限制。ontology-result 将自身源码/引用核对、主侧实际测试与待完成独立质量分开，没有将 skip 计作通过或提升 verified/runtime。

## 明确未验证

本辅助未执行管理员 HTTP 端到端、全部配置写交错、生产发布、历史数据修复、Maven、PG/H2 运行或视觉验证。受控测试未穷举删除保护 FK 与所有遗留证据关联，不能用本报告证明全仓审查或完整删除保护验收完成。父最终质量实例仍须独立验证本次 PG 专项真实执行及相邻并发/回滚回归。
