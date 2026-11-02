# Development TODO

## 表单记录控制、DHR联动与集中流程建设

- [x] 表单变更／作废申请、审批生效、退回终结后新编号重提、保留原有效修订，已完成；不再等待朋友补公共流程运行时。
- [x] 受限撤回、当前处理人转办、管理员电子签名重新分配，及只读流程日志、流程干预集中入口，已完成；普通表单和DHR汇总审批已纳入，作业／工艺路线保持原范围。DHR仅支持管理员签名改派，本期不新增本人转办或撤回。
- [x] DHR在审与表单在审申请的双向阻断、生效影响与站内提醒、当前贡献切换、冻结证据保留、作废默认隐藏，已完成；表单与DHR数据审计均体现改派事实及签署身份。
- [x] DHR汇总修订、旧冻结版本回读、重新核查提交和专属审批，已完成；不等于放行后完整受控变更。
- [x] 2026-11-03补齐真实浏览器→真实后端→隔离PostgreSQL的整链验证，以及候选全登录读取权限和四个表单入口数值提交归一化修复；范围、原件与独立门禁见[整体闭环检查](workflow-record-dhr-closure-20261102/README.md)。主开发数据及已有人工验收样本不重置。
- [ ] 明确暂缓的归档执行、打印作废过滤、活动表单作废、完整放行后受控变更，继续按[原边界](record-control-dhr-linkage-20261029/README.md)保留。通用质量／异常／源签署变化自动判读、DHR目录组合验证及A12历史检索／规则重建尚未闭环，不能由上述链路通过替代。

## 工序产出 → 批次最终产出 → 工单产出联动

- [x] 已在 `edhr-dev` 工作树补齐最终产出工序、使用时快照、正式产出来源、工序/批次/工单累计及列表详情；按新本体契约完成L2验证，本体 `updated`、全新独立质量 `passed`，待用户验收。规则、原始调研与边界见[任务记录](final-output-linkage-todo-2026-10-15.md)，实现及18+9=27的实际验证见[交付记录](final-output-linkage-2026-10-15.md)。旧实例不补算；后续已在3000/8081用安速康原件新建模拟完成58+39=97件、两份DHR V1及报表追溯验证，见[原表复跑记录](ansukang-final-output-e2e-2026-10-15.md)。当时披露的质量三列未联动已按后续确认补齐：最终工序良品/NG、全流程本批产品报废、工序面板和数值悬停来源，缺单位保留待核对，旧数据不回写；L2本体updated、全新最终质量passed，见[质量联动记录](batch-quality-linkage-2026-10-15.md)。

## Production Work Condition Runtime Closure

- [ ] Before opening production work condition fields, confirm each field's real source, type, value snapshot method, field catalog version, supported operators, and execution-engine parsing contract. Then implement field selection, value controls, business validation, runtime condition evaluation, and auditable execution snapshots. Until this is complete, the first-release condition builder is draft-only and must not be treated as a closed production execution capability. The main agent must remind the user of this TODO when production execution or condition evaluation work begins.

## RDO Version Governance (post-MVP / 1.0 evolution)

- [ ] Add RDO dependency impact analysis. A concrete version must show every dependent configuration and production-use context that references it, including the referenced version and lifecycle state.
- [ ] Add copy-forward revision for dependent configurations. It must clone the existing configuration into a new draft with its concrete references intact, so users can explicitly replace only the references they choose.
- [ ] Add controlled bulk replacement assistance. It may create or update explicit drafts only, present an impact summary, and require user confirmation; it must never silently alter an already effective configuration.
- [ ] Persist execution-time snapshots of every concrete RDO version used by a production record, including the version ID, business identifier, version number, effective window, and immutable content/hash where applicable.
- [ ] Add pre-effective validation for new or revised configurations: each new reference must point to a currently effective concrete version. Existing historical references remain traceable after their source version expires.
- [ ] When work-order, batch, or SN production execution is introduced, add a required product-configuration-version selector. It must list all matching active concrete versions and persist the explicit choice; it must never resolve a version automatically.
- [ ] Do not introduce a current/default version or automatic latest-version selection. Any future upgrade flow must retain the MVP rule that parent RDOs only aggregate independently effective child versions.
