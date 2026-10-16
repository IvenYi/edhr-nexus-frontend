# W2第三批：保存到正式投影的来源一致性

用户已手动合并PR11。重新拉取edhr-dev并从400c2dd2b836aa520f7b671c348ad9e79ac33748建立audit/edhr-dev-w2-projection-integrity-20261016；合并树与批准交付2b73e72f完全相同，没有额外契约、知识或代码增量。知识0.3.25。1820路径/blob清单全部pending/inventory-only，定向阅读与运行范围另记，不把盘点当完成率。

本批按L2核对保存、完成、原始份、过程索引和正式投影的关键数据契约，最终独立验证针对冻结候选另记。**没有确认新的生产代码缺陷，没有修改生产代码或业务规则。**只在既有FormTraceIndexPostgresTest新增两条贯通回归，保护已确认行为；没有为了旧线索或测试结果改变规则、补算历史数据。

## 源码结论与反证

正常design API调用prepareDesign清除rowKeyFieldId；执行保存为新行生成规范UUID并拒绝非法或重复身份。因此自定义/空白行键导致定位分歧、trace固定bindingId与旧自定义键碰撞的静态线索，尚无当前正常入口的合法触发。保留为旧冻结配置范围的线索，不用绕过正常入口的fixture制造新生产缺陷，也不自动宣称全部历史兼容已通过。

实际保存使用执行冻结表单和真实份身份，刷新最近保存的过程索引；仅最终COMPLETED才进入正式投影预检及outbox。正式process读取完成时持久化source，失败不撤销已完成记录，重试不重新生成行身份。统计只查询SUCCEEDED来源。源码入口及精确核对范围见[source-map.md](source-map.md)，技术辅助反证原文另存，不作为独立质量结果。

## 新增回归及实际边界

1. 真实engine开工并SAVE，内部UUID经序列化重开和换序保存后仍指向同一行，查询命中行位置随换序更新；SUBMIT后真实记录服务生成不可变outbox，待处理时正式报表无数据。注入明细写入故障后中间正式结果全部回滚、记录仍COMPLETED；通过真实retry方法并重复process，主表与两行明细只生成三笔正式记录，UUID、来源字段及冻结source保持。主表5是另一笔独立报工，不是子表2+3的小计，总10不能外推为同事实可重复统计。
2. 合法草稿SAVE后，在最终提交中改追溯文本并给正式数量负数；必要预检失败，数据库原记录status/values、追溯索引均回滚，outbox没有生成。该失败是业务预检，与已完成后投影系统故障分开。

组合用例使用真实引擎、记录服务、索引、正式投影和读取controller，PostgreSQL事务由TransactionTemplate驱动；身份权限和重试审计仓储为替身。这不是完整ProductionExecutionService HTTP/JPA事务、真实签署或全权限矩阵证明。现有Spring方法安全授权回归单列，不冒充HTTP层或完整生产端到端。

主侧173项Java用例通过（含45项真实PG、89项知识及7项方法安全授权），0失败/错误/跳过；13项前端Node用例通过。原75项是扩展前基线，不与后续重复累加为额外覆盖。全新独立实例实际复跑冻结候选3b642ab47ed55e8a26f3531b09f107b7f06188c9，同组173 Java及13 Node全部通过、无跳过；主侧与独立次数不累加为不同覆盖。无UI/生产/构建配置变更，本批未重跑完整前端构建或浏览器视觉，不把旧PR通过记录冒充本轮通过。

主侧原始日志/XML留/tmp/edhr-w2-projection-evidence，安全结果索引见[evidence/primary-result.json](evidence/primary-result.json)。测试新建临时PostgreSQL16.15容器，端口预检为空，只绑定127.0.0.1:5432、数据为tmpfs，数据库为edhr_projection_integration_test；每项PG测试使用随机schema并清理，未恢复或改写任何既有库。全部主侧/独立进程结束后已确认测试schema及public表均为0，停止并自动删除本轮容器，复查容器不存在、5432已关闭，见[清理凭据](evidence/runtime-cleanup.json)。可复用的可选PG验证启动说明已追加保存至云环境start_skill草稿，install_script、网络、凭证和仓库声明未改；草稿不等于已发布或新任务恢复验证。

本体正式结果为[not-applicable](evidence/ontologyResult.yaml)：当前知识与政策已准确，不新增决策或提高成熟度。全新实例[最终质量结果passed](evidence/independent/qualityResult.yaml)，16项必需检查通过、blockingConditions为空；1831 tracked文件及2项受保护工具前后摘要一致。原报告保留非阻断low QF-W2-PROJECTION-DOC-001在受测SHA时open的事实；后续L0登记已将上述MockMvc称谓改为Spring方法安全授权，未修改任何源码、测试、知识或治理契约，范围见[交付凭据](evidence/delivery-receipt.json)。独立原始日志/XML及全量摘要只留/tmp，8份安全产物按白名单逐字节归档。ESLint缺配置、既有premium全局84项及无关vendor缓存检查限制继续保留，本批没有修改相应工具或声称重新通过。

完整W2及全分支审查未完成。A12表单变更/作废及两项旧DHR high继续按用户决定暂缓，不因首次完成回归关闭。后续仍需核对设计器其他命令、导入和撤销对字段身份/来源映射的保护，再推进W3；大模块拆分沿已有具体方案留W6，本批不做大重构。不合并、部署、恢复历史或查询/触发GitHub Actions。
