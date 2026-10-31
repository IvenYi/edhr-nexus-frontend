# 记录控制集成与后续开发入口

本切片为 L2 集成准备。功能来源为 `feat/record-change@aef427c524bd7270b3775fbd7c599c72a545e21b`，初始目标为 `edhr-dev@099bb29f4873d863f51e61493c0ebcbe94803801`，随后取得目标增量 `8784ba87166addae9cb9659d6120aa84f993c7ef`。工作在隔离分支 `codex/record-control-integration-20261028` 中进行；实际最终候选和独立质量结果以质量报告为准。

## 已确认的集成问题

1. **迁移未注册**（original-evidence）：主线已采用 schema/seed 初版基线，来支 `0087-record-control.sql`、`0088-record-change-menu-permissions.sql` 未进入正常 master。已在不可变基线之后追加原文件，不改历史 SQL 或基线摘要。新装、重复执行及已安装当前基线后的完成记录回填均由独立 PostgreSQL 数据库验证。
2. **新完成表单缺少 Rev.1**（original-evidence）：迁移只处理执行当时的旧完成记录；当前 `FormInstanceRecordService.saved` 没有创建初始修订。已在首次完成的同一事务中保存 Rev.1、原值摘要和当前引用；重复完成不新增修订。
3. **申请签名外键失败**（original-evidence）：JPA 保存的申请签名尚未 flush，JDBC 已插入引用该签名的申请，真实 PostgreSQL 拒绝外键。已在记录控制提交服务局部 flush 签名，仍由原事务负责整体回滚。
4. **知识 ID 与成熟度冲突**（original-evidence）：来支 DEC-0075～0078 与主线同号不同义，已映射为 DEC-0086～0089 并更新引用。来支缺本候选发布证据的 verified/runtime 声明收回至内部实现规格；旧用户确认与历史 Git 原件保留。
5. **公共文件集成**（original-evidence）：保留主线任务锁、认证与字体配置保证，接入记录控制适配器；路由和菜单同时保留变更管理、DHR 和现有报表及自定义报表。来支两处旧任务分页测试调用已适配现有方法签名。
6. **正常子表被拒绝**（独立 original-evidence）：首轮独立质量在 `40e39a17` 复现 `QF-RC-INTEGRATION-001/high`，生产子表的 `__rowId` 被当未知字段。已保留独立 failed 原件；主侧补回归并保留来源行标识，既有标识不可更换或重用，省略时沿原行恢复，不放宽未知业务列。单元 8 项及含真实格式行标识的全应用 PostgreSQL 6 项通过，最终须由全新质量实例复核。

首轮真实失败及夹具清理/外键引用遗漏均保留在 evidence 中；夹具问题不计为产品缺陷。所有测试数据库均为专用 `edhr_record_control_test_*` 或 `edhr_baseline_test_*`，未修改 `edhr_dev`。

冗长原始日志以同名 `.log.gz` 无损归档，避免将大量 Hibernate SQL 展开在功能差异中。`evidence/log-archives.json` 记录原始路径、字节数和 SHA-256；解压即还原结果文件引用的原始 `.log`，当前工作树也保留原日志。首轮 failed 结果内容未改写。

## 后续 DHR / A12 切片应消费的真实来源

- 申请确认入口：`RecordControlService.submit`。申请在审时来源仍为 COMPLETED，不能据申请创建或流程待办触发来源失效。
- 签署和最终任务入口：`RecordControlTaskActionService.complete` → `WorkflowEngine.completeRecordControlTask` → `RecordControlWorkflowResultHandler.handle`。最终业务失败必须回滚任务、签名、日志、修订和申请结果。
- 实际生效点：`RecordControlService.handle` 中 APPROVED 分支的 `applyChange` / `applyObsolete`。变更后用 `form_instance_record.id + current_revision_id` 定位当前有效修订；作废读取来源状态和修订 VOIDED。工作流 APPROVED 事件只是传入编排的结果，不能脱离实际业务事务当作已生效通知。
- 当前实现同时更新 `production_execution.state_json` 的表单值/状态，但**尚未刷新追溯索引、冲销/重建正式投影或发送 DHR 影响通知**。不得将它作为当前报表正确性的证明。
- 后续应先定义含来源实例、前后修订、实际生效类型及事件/审计关联的消费契约，再分别接入 DHR 与投影，复用幂等和事务边界。通知的受众/渠道如无现行决定，集中确认后实现；不在页面或通用流程引擎中复制领域落地逻辑。

## 保留范围与待核对事项

- `discrepancy.dhr-review-effective-source-integration`、`discrepancy.dhr-review-complete-evidence-impact-gap` 保持 high/open。当前 DHR 有读时证据比较和批准阻断；实际生效消费、主动通知及生效/批准并发仍需后续联调。
- A12 的修订切换、作废冲销、规则重建和历史解释仍未验收。正式投影仍以首次最终修订为基线，不能直接支持新修订统计。
- 旧 P0 的撤回、记录控制转办和重新分配尚无完整业务运行入口；不因存在 WITHDRAWN 枚举或公共通用转办而计为完成。活动表单作废和重新分配签名的未来政策问题保持原范围。
- 普通用户候选流程权限仍有原来支已记录的差异：申请入口为已认证范围，候选接口要求 `record-control.corrections.create` / `record-control.voids.create`。拥有菜单不自动拥有这些权限；必须单独核对普通用户矩阵，不能用特权主路径通过替代。
- 2026-09-16 的“无可靠 DHR 来源”属于旧阶段说明。当前主线已有真实 DHR 实现，待完成的是跨域集成；不据旧记录删除、绕过或重新定义现有 DHR 规则。

## 验证边界

主侧已经执行真实 PostgreSQL 应用服务链、初始化及升级、聚焦后端回归、菜单/报表导航和前端构建；具体命令和结果见本目录 evidence。本体独立知识检查 89 项通过，结果见 `ontology-result.yaml`。

浏览器验证以 `40e39a17` 对应的后台进程进行：两个不同账号在真实页面上完成主表变更申请、签署、待办审批与签署，数据库确认 Rev.2 EFFECTIVE、旧 Rev.1 保留、任务完成且实际签署人=处理人=42。账号均为专用数据库的合成已认证用户，临时赋予 ADMIN 角色；这不是普通菜单授权矩阵或真实用户签名认证流程验证。UI 前的首次密码修改通过真实页面完成。截图、数据库读回与范围见 `evidence/browser-verification.md`；该主表路径未因后续子表校验补修而改变，不用旧页面证据替代新子表路径验证。

首轮独立 `quality-result.yaml` 为 failed，原件保留。全新质量实例已对固定候选 `1437f73b5172310e073f8dd8e8011b6f2017f1c9` 返回 `quality-final-result.yaml: passed`：后端 293 项中 290 通过、3 项既有条件跳过；真实 PostgreSQL 9 项及知识 89 项包含在此总数内。独立旧类红例仍可复现，当前类 13 项身份正负向探针通过，原 high 已按修复提交 `0e782e3d` 核验为 resolved。导航 9 项及前端构建通过。本体结果为 updated。该固定候选之后只归档验收报告和接续说明，不改变受测产品、测试、迁移或知识。

本切片的集成准备验收完成。完整 P0、DHR 生命周期及生产发布仍不在完成声明内；未执行独立实机浏览器、完整子表视觉矩阵、全部普通用户权限或完整 HTTP 并发验收，具体限制见最终质量结果。普通白空格检查通过；完整差异的空白检查仍因两份保留原始诊断文本的尾空格非绿，不改写原件以伪造通过。

## 本地接续状态

- `edhr_dev` 的只读检查确认已安装两条当前初版基线，尚无修订表和当前修订引用；接入候选时走已验证的追加迁移，不需要重置该库。证据为 `evidence/existing-dev-*-readonly.csv`。本轮没有应用开发库迁移。
- 临时 8097/3017 服务、命名浏览器会话以及主侧和质量侧各自创建的专用测试库均已清理；隔离工作树和分支保留，供后续开发使用。
- 下一功能切片先完成记录控制实际生效契约与 DHR 消费：有效修订标识、影响通知、旧冻结保留和生效/批准并发。随后实施 A12 的正式投影切换、作废冲销与相邻统计验证。通知接收对象和渠道尚无明确确认依据，实施通知前集中确认；不把现有示例通知数量当真实通知能力。
