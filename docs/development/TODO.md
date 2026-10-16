# Development TODO

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
