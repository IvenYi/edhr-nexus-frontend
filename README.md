# edhr-nexus

商业级可定制 eDHR 产品与工程仓库。

当前仓库用于沉淀商业级 ToB eDHR 的产品需求、业务闭环、功能矩阵、领域模型、流程引擎和第一阶段工程基座设计。产品定位不是绑定某一个行业，而是面向需要批次/SN 生产记录、DHR 汇总、审核放行、追溯和受控电子记录的数据完整性场景，提供可配置、可私有化交付、可二开定制的 eDHR 平台。

医疗器械、GMP、CSV/CSA 等内容保留为高监管行业的实施参考和验证场景，不再作为产品总边界。

## 当前文档

- [eDHR 0-1 产品化功能矩阵与业务闭环设计规格](docs/superpowers/specs/2026-06-05-edhr-p0-business-closure-and-function-matrix-design.md)
- [商业级可定制 eDHR MVP 产品需求文档](docs/prd/edhr-mvp-prd.md)
- [商业级可定制 eDHR 正式商用版产品需求文档](docs/prd/edhr-commercial-prd.md)
- [Phase 0 产品内核与流程底座开发启动说明](docs/development/phase-0-compliance-foundation-start.md)
- [技术栈与 AI 协作开发策略](docs/architecture/technology-stack-and-ai-development.md)
- [LLM 协作编码规范](codeplzreadme.md)

## 第一阶段建议

优先开发产品内核、流程底座和第一条批次生产闭环：

- 组织、用户、角色、权限
- 审计追踪
- 电子签名
- 流程模板、流程实例、任务、日志、最小转办
- 表单模板、表单实例、字段权限和表单内审核流程
- DHR 模板、DHR 实例、DHR 汇总和汇总审核
- 工厂/车间/产线、产品、设备、SOP、工序、工艺路线
- 制程配置：产品/路线/DHR 模板/放行单/工序表单/SOP/权限/事务
- 事务配置：全局/按需事务、表单节点、条件分支、事务实例
- 生产执行：工单、批次、工序过站、表单填报、事务触发
- 放行单生成、放行审核、归档冻结
- DHR/表单/生产追溯

后续检验、记录本、返工返修、物料仓储、第三方集成、AI 表单还原等模块应复用上述基座能力，避免重复实现审计、签名、流程运行和状态流转。
