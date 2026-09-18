# DHR 汇总设计合规评估（开发门禁）

knowledgeModelVersion: `0.3.24`

评估日期：2026-09-19

结论：当前“基础目录冻结 + 完整候选范围冻结 + 受控证据关联 + 不可变汇总版本 + 权限与审计 + 已发布审批流程版本绑定”的设计方向未发现阻断开发的 P0 合规冲突，但仍需在 DHR 审核与产品放行阶段补齐审批运行时、电子签名适用性、退回后新版本、最终批准和验证证据。本评估是产品与软件设计评估，不替代法规顾问或质量体系负责人的法律/合规意见。

原始法规证据：

- 中国国家药监局《医疗器械生产质量管理规范》（2025 年第 107 号，2026-11-01 施行）：电子记录应具备权限、审计追踪、电子签名和备份等控制；生产记录、检验记录及产品放行所需记录应完整、真实、可追溯。官方公告：<https://app.www.gov.cn/govdata/gov/202511/06/539701/article.html>；规范全文：<https://sjj.ganzhou.gov.cn/c102441/202602/641808d29cc149dfa867782aa807affa.shtml>。
- FDA Quality Management System Regulation (QMSR) 自 2026-02-02 生效并纳入 ISO 13485:2016：<https://www.fda.gov/medical-devices/postmarket-requirements-devices/quality-management-system-regulation-qmsr>。
- 21 CFR Part 11 要求封闭系统电子记录具备真实性、完整性、必要时保密性及可靠可检索性，并控制访问、审计追踪和签名：<https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-11>。
- EU MDR 要求制造商 QMS 覆盖生产、质量控制、变更、记录和上市后活动，并保持器械可追溯性：<https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32017R0745>。

设计风险与处置：

1. 仅保存“被纳入的证据”会丢失汇总时的判断上下文；因此必须冻结完整候选范围及纳入关系，未纳入记录无需逐条原因，但必须可证明当时存在且未被选择。
2. 修改已提交汇总会破坏审批对象和审计链；因此版本提交后不可变，退回必须生成新草稿/新版本。
3. 只绑定流程定义、不绑定已发布版本会导致历史解释漂移；因此在制程版本和 DHR 实例中冻结定义与版本 ID。
4. DHR 汇总完成不等于产品放行。授权产品放行仍是最终质量门禁，必须检查完整生产、检验、偏差及适用批准记录。
5. 当前代码尚未实现 DHR 审核运行时与电子签名，因此 `REQUIRED` 汇总只能进入待审核状态，不能声称已获批准或可用于最终放行。
