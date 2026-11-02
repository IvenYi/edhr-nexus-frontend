# 本次合并的增量语义核对

核对对象：合并候选 `96ea63a1948110f1ff7ab4eccdcb2b87de48dda7`，父提交为本地功能 `5d1bdc82533b3178701b0bf3f9ab885d382f22bb` 与远端 `2ac66928046aa98dc196376ed2abb4f76f61e545`。知识 `0.3.25`；本角色实际按候选读取项目、角色与交接契约，远端相对原本地基点的契约和知识增量为空。原始源码摘要与祖先关系见 [source-proof.json](source-proof.json)。

本轮是集成增量核对，不重做前轮681记录的领域审计，不把前轮运行通过套用到当前合并候选。

## original-evidence

| 范围 | 实际源码及声明核对 | 语义结论 |
| --- | --- | --- |
| DHR个人审批列表 | `DhrReviewService.list` 从Java批次扫描改为同一MVCC SQL中的计数和分页，仍要求default租户、待审状态与当前候选/无候选时处理人，已办仍限实际处理人；`eligible`、`detail`、`act`没有因分页改变。新增参数化PG测试源码按旧Java判断构造oracle，覆盖历史JSON形状、literal/Unicode关键词、页边界。 | 查询实现和性能变化，不新增业务资格或状态；测试源码存在不等于本角色执行过这些测试。 |
| 签名改派与分页交叉 | `WorkflowResponsibilityService.change` 将当前`userIds`收敛为新处理人，原候选保存于`originSnapshot`，同时写`assigneeId`。因此新分页SQL和原详情/动作判断读取的是同一当前责任。`centralDhrReassignmentPreservesEvidenceChangesHandlerAndAppearsInBothDomainAudits`在合并后仍保留旧人列表不可见/详情拒绝、新人列表可见、冻结证据不变和两层审计断言。 | DEC-0093-02/03的当前责任、原候选保留、签名、领域审计及专属批准/退回边界保持。 |
| 现有集中查询 | `WorkflowOperationsQuery.visibility`和`WorkflowResponsibilityService.requireActive/eligible`仍分别限制集中读取、DHR未处理审批、目标资格、签署人干预资格与执行状态；分页没有替代集中读取，也不向DHR通用批准、本人转办或撤回开放路径。 | `rule.workflow-central-entry.domain-projection`及`signed-responsibility-change`保留。 |
| 文件事务 | `FileController`先独占本次新路径，仅补偿明确回滚且本次拥有的未注册文件；事务结果未知保留可能已提交原件。删除继续受生产执行/签名引用阻断，物理删除延迟到提交后；上传人取实际审计身份。 | 属既有原件/引用保护和事务一致性约束的工程修复，不新增生命周期或审批政策。 |
| DHR附件原件 | `DhrAttachmentService`保留DHR、当前active或指定冻结版本、附件ID与SHA-256匹配门禁，解除关联不删除原件；流式SHA-256使用相同算法及原件全部字节。`Download(path,originalName)`由同次已授权核验查询返回，控制器复用名称，不再重复读取元数据。 | 既有受控附件和冻结任务附件资格保持，不扩大附件或任务读取范围，不更改冻结正文/摘要。 |
| 索引迁移 | 0091只为当前待审及本人已办查询建立并发索引，并要求ICU collation以保持原Locale.ROOT搜索含义；不改业务记录或状态。 | 存储/查询工程依赖，运行及迁移执行由主方/质量按实际候选验证，本体不冒称部署或主库已应用。 |

文件/附件子范围由本角色派发的只读本体实例独立回看原始差异及相关规则后返回`not-applicable`，没有修改文件或运行Maven、数据库、浏览器。本角色核对DHR与集中责任交叉范围及两父提交/当前知识树；两个结论仅覆盖上述增量。

## user-confirmed / retained

既有DEC-0093、DEC-0094、DEC-0063/0068、按钮实际签署规则及DHR完整证据范围继续有效。本次用户授权Git提交、合并、推送，不构成新增业务政策。归档执行、打印作废过滤、活动表单作废、通用质量/异常/源签署自动变化判读、其余通知/目录组合、A12、多租户和作业条件运行契约均不因合并而关闭。

当前合并的`docs/knowledge`树与本地已验收功能提交完全相同，无重复ID或并行声明替代需新处理；历史锚点的原捕获基点继续作为provenance保留，当前集成基点由本轮回执补充，不反填旧证据日期或验收结果。

## 验证边界

本体角色只执行原始差异/源码/测试源码核对、祖先与内容摘要、声明和路径检查，未执行Maven、数据库迁移、浏览器或独立质量。主方和质量需对实际合并候选另取运行证据；本结果不等于运行验收、生产发布或全部知识阶段完成。
