# 同切片列表图标纠正（2026-11-02）

用户指出变更管理及流程干预列表使用了常驻文字操作按钮，不符合已有列表规范。本次保持 L1，直接修改主目录 `edhr-dev` 未提交工作树；沿用并增量更新同一 [decisionPackage](decision-package.yaml)，没有创建工作树、集成其他分支或改写朋友的提交历史。

## 问题原因与原始证据

- `user-confirmed`：列表行操作应使用贴合动作的图标，遵守已有统一规范。
- `original-evidence`：[列表规范第 4.4 节](../../frontend/list-page-guidelines.md)已经要求 `IconButton size="small"`、`Tooltip` 和无障碍标签。初版 `InstanceList` 却以文字 `Button` 提供“重新分配”；`RecordRequestListPage` 使用“查看详情”，`RecordApprovalPage` 使用“查看申请／审批处理”。这是实现及审查遗漏。
- `original-evidence`：固定 HEAD `0bd0848bbded6d6954d62a4f924e0b2eec6623ad` 的 `verify-list-table-style-contract.mjs` 检查公共表格壳、样式 token 等，不检查操作按钮是否为图标；`publicListPages` 也未登记两个记录控制列表组件。此前样式检查通过不等于图标规范已被验证。
- `inference / implementation-choice`：本次通过三个实际列表组件的 TSX 语法树检查和浏览器场景补齐这个缺口；不声称已经覆盖全仓所有按钮或全部 UI 规范。

## 当前结果

| 页面／视图 | 操作图标 | 固定操作列 |
| --- | --- | --- |
| 我的变更、变更记录（共用请求列表） | `VisibilityOutlined`：查看详情 | 64px |
| 变更审批待办 | `VisibilityOutlined`：查看申请；`RateReviewOutlined`：审批处理 | 96px |
| 变更审批已办 | `VisibilityOutlined`：查看申请 | 同表保持 96px |
| 流程干预列表 | `AssignmentIndOutlined`：重新分配 | 64px |

每个操作具备悬停说明和同名无障碍标签，使用小号图标按钮，居中、无额外图标间距，保持右侧冻结和公共阴影。两个记录控制列表也改用已有 `ListTableShell` 和 48px 表头／40px 行样式，删除旧的页内阴影定义。没有新增列设置、详情抽屉、审批入口或业务能力。

查询、重置、提交、详情中的业务命令及弹窗确认继续使用文字按钮；本次只纠正独立列表操作单元格。现有查看／审批路由、待办／已办范围、重新分配目标选择、权限和必签保持。

规范补充了审批处理与重新分配图标映射，并明确文字／混合按钮的宽度说明不是新列表操作使用常驻文字的豁免。静态检查将两种记录控制列表注册到适用公共检查，并对上述三个组件增加：单元格内拒绝文字 `Button`，图标必须 `size="small"`、有 `Tooltip` 和 `aria-label`。三个反例探针分别验证文字按钮、缺失提示、缺失标签确实会被拒绝。

## 实际验证

- `npm run build`：退出 0，TypeScript／Vite 构建通过。
- `npm run verify:list-table-style`：退出 0；35 个公共列表、18 个样式入口、10 个可调列列表、5 个 RDO 页面及当前 3 个组件图标约束通过，反例拦截通过。
- [主侧受控 API 浏览器结果](evidence/icon-correction/browser/result.json)：34／34。保留原 26 项任务／签名／列设置回归，新增我的变更、变更记录、审批待办／已办在 1440px 和 390px 下的 8 项图标、提示、标签、真实列宽、图标显隐、鼠标／键盘导航验证。请求全部受控，不是实际后端签署事务验收。
- [正常主环境只读结果](evidence/icon-correction/live/result.json)：使用实际 3000／8081 服务，分别以 `uat_manager`、`uat_applicant`、`uat_reviewer` 查看流程干预、我的变更、变更记录、审批待办和已办；检查到实际 64／96px 图标列，打开重新分配后取消。未提交业务操作；允许的关联申请查询 POST 已回到原始服务核对为 `@Transactional(readOnly=true)` 和 SELECT 查询。
- 主环境验收申请、任务、8 个来源和4个 DHR 行的前后聚合摘要相同；本轮没有重置或消耗已有人工操作结果。只读核对仍有 7 条申请在审。
- [独立质量结果](quality-icon-correction-result.yaml)记录本次实际检查；[本体不适用结果](ontology-icon-correction-result.yaml)说明纯图标／UI 契约纠正不改变业务语义。初版质量报告和 9 项源码清单按原始时点保留，不能用于声明本次图标结果。

本轮没有重跑 Maven／PG 业务套件或全系统回归；后端、API、迁移、签名执行与业务状态均未修改。此前已记录的既有菜单图标测试失败未在本轮扩大修复。

来源 HEAD 仍为 `0bd0848bbded6d6954d62a4f924e0b2eec6623ad`，最近成功获取目标为 `e3e49784eda6bc01e7e5c686d6f79dc5a600d5ae`。本次确实尝试 `git fetch origin edhr-dev`，但 GitHub 连接超时；因此不声称已获取更新的远端状态。已缓存目标与来源在当前契约、规范及受影响前端范围没有增量，本轮没有跨分支集成。
