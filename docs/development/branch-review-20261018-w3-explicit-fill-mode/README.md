# W3 第一批：明确填报方式

已交付 [PR16](https://github.com/IvenYi/edhr-nexus-frontend/pull/16)，目标edhr-dev，建议人工合并。独立受测2f814422之后仅L0验收、原件归档和PR链接登记，没有自动合并或部署。

本批基线为 `edhr-dev@4b25dc7f29c27cfb39c0f570b547869aa0c2f289`。PR15 已人工合并，合并树精确等于批准交付 `b140c079c423bf55e977829f46b300341a5bf86f`。新分支只处理历史唯一问题 AUD-H003，不重开 PR5/PR6 或此前审查 PR。

本批为 L2：影响作业发布、工序配置保存和首次执行快照；触发本体与全新实例独立质量门禁。[决策包](decision-package.yaml) 区分既有确认规则与工程推断，没有新增业务政策。依据 DEC-0067-01/04/05，缺失模式不能推导成开放的 DIRECT；依据 DEC-0009-01/05，不完整作业草稿仍可保存和重读。

## 最小整改

- 共享后端解析、校验和序列化拒绝无效或缺失模式，不再补 DIRECT。作业草稿不补模式，发布统一检查配置；PROCESS 缺失、null、空串或空白流程引用也不能越过发布校验。
- 前端共享设置明确显示待配置，打开 Dialog 不补值，未选择时不能应用。作业编辑页显示未配置节点并在发布前提示“请选择填报方式”，该提示不会落入既有“表单版本失效”错误分支。
- 保留显式 DIRECT/PROCESS 的权限、签署、活动模式隔离、休眠配置和节点/按钮精确错误定位；保留工序创建命令已有的显式 DIRECT 配置。既有执行继续消费冻结配置，CUSTOM 挂载不被加上新的全局模式要求。

[发现与历史去重](findings.md) 复用 AUD-H003；[源码映射](source-map.md) 给出实际方法范围及大模块具体拆分提案，未进行大重构。固定 [coverage.csv](coverage.csv) 为 2062 个路径/blob，全部 pending/inventory-only，只代表盘点分母，不能称全量审查完成。

## 主侧实际验证

主侧原基线新增 Java 6 项为 5 失败、1 正对照通过；Node 4 项为 3 失败、1 正对照通过。PROCESS 空引用另有实际 1 项失败反例，来自修复中重排诊断后的未提交中间版本。独立实例对原始4b25的7项Java重放实际为5失败、2正对照通过，PROCESS空引用在原基线已拒绝，不能把中间版本反例算成原基线第6个失败。各原始结果按实际时点保留，不用缺夹具的NPE或编译失败作为产品反证。

当前 10 个 Java suite 共 296 项：293 通过、0 失败、0 错误、3 既有条件跳过，包含 89 项知识检查、发布/草稿、共享模式、首次 START 拒绝且 execution/DHR/审计不写、冻结及原事务回归。产品/产品簇写入与复制经过调用链核对及共享序列化边界测试；没有声称所有管理 HTTP 复制组合均已实测。13 项 Node、5 个真实 Chromium 场景及 tsc/Vite 构建通过。浏览器运行实际共享组件及实际 WorkTemplateEditor，使用受控 API；后端集成为 H2 PostgreSQL 兼容模式，不称原生 PostgreSQL 或浏览器到已认证后端的完整 E2E。

主侧安全摘要与截图在 `evidence/primary/`；只读辅助原件在 `evidence/helpers/`，本体原始结果在 `evidence/ontology/`。[正式本体结果](evidence/ontology/edhr-w3-mode-ontology-result.yaml) 为 updated，无待确认问题，版本与成熟度不升级。全新实例对 `2f8144220d1f7fc5a54b183204777bcae5bbd564` 正式 [qualityResult: passed](evidence/independent/edhr-w3-independent-quality-result.yaml)，11项必需检查通过。独立实际重跑293 Java通过/3条件跳过、13 Node、5浏览器与构建，21份公开安全原件按原字节归档。AUD-H003已独立核验resolved，建议本切片人工合并，后续仅L0验收与PR链接登记，详见[合并验收](merge-acceptance.md)。

## 保留边界

ESLint实际退出2，原因是既有配置缺失；不新增配置或降低标准来掩盖。主侧时点技能目录不可用、未取得官方premium审计脚本的原记录保持；独立实例随后恢复资源，取得官方37716bytes原脚本并对本轮4b25/2f8144实际strict扫描，两者各84项且完整finding数组精确一致、新增0，均退出2。两份原JSON和对比归档，不拿PR15旧84替代本轮，也不称全站strict通过。受影响UI实际浏览器、源码差异和10张截图已独立复核；全站旧规范债务保留。

AUD-H004/H009/H010 继续待 W3 后续核对，A12、变更/作废和依赖它的两项旧 DHR high 仍按用户决定暂缓。本批不迁移历史模板、恢复数据、合并或部署；完整 W2/W3 与分支整体审查仍未完成。
