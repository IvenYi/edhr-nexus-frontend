# DHR比较复用与流式摘要整改

L2；PR82已合入`edhr-dev@b12a29f0`，整树同6975f647，无外部增量。受测候选`ff93b4598d91413b96c3b79d958c4d4c61cf10d5`，仅两产品、两测试和DP。

已交付[PR83](https://github.com/IvenYi/edhr-nexus-frontend/pull/83)，来源`audit/edhr-dev-dhr-impact-reuse-20261111`、目标`edhr-dev`，观察OPEN/MERGEABLE/CLEAN，建议人工合入两项已授权优化。验收提交`8fa9dea652296d268c08103a3d9122946108da29`；受测后仅L0归档/台账，当前仅交付登记。登记前本地/真实远端/PR head一致、50/359输入及包摘要未变，见[实际交付核对](evidence/delivery-verification.json)；登记正常推送后再次核对，不改称重新运行测试。

落实用户明确授权：detail复用version已有完整比较结果；changes使用本次局部8KiB缓冲完整SHA。权限/签署/审批锁/独立请求新鲜度/事务/审计/历史保持，UI/API/schema/索引/知识政策不改。

单50MiB原件的审批详情从19→13 SELECT、读100→50MiB；当前线程累计分配约0.31MiB（原约100MiB），不是峰值/RSS/物理IO/SLA。审批命令仍29SELECT、完整读50MiB，仍拒绝页面读取后篡改的原件；正常批准保留冻结附件。

主侧实际76/76（38原生PG＋30H2＋8mock）、知识89/89，均0F/E/S。同最终测试旧源6=4正2真预算红，新6全过。58JFR、58组SQL/482业务SELECT、36组11表摘要已核；完整DTO、缓冲边界及末字节、跨请求重核和原失败路径保持。

全新独立实例对同一候选正式quality passed/FINAL，16必需项全过、无发现阻断，实际76/89及58JFR/58SQL/36组11表摘要吻合；详情累计327456B，证明同一25MiB资源预算通过，不把不同运行分配数当固定常量。双方自有PG与独立软链已清，独立工作树clean。

- [详细规则/A23、源码、实测、提取及剩余范围](review.md)
- [L2决策与影响包](decision-package.yaml)
- [主侧机械核对](main-analysis.json) · [SQL多重集核对](sql-multiset-verification.json) · [固定树盘点](inventory-summary.json)
- [本体正式结果](ontology-result.yaml) · [有限语义核对](ontology-review.md)
- [独立正式质量](quality-result.yaml) · [独立复核](independent-review.md)
- [原始证据包及摘要](evidence-packages.json) · [原件归档](evidence/)
- [全部角色FINAL后的实际漂移/阶段复核](pre-pr-drift-review.md) · [机器核对记录](evidence/pre-pr-verification.json)

2026-11-11 19:38:33 Asia/Shanghai已实际PR前复核：目标仍b12a29f0，50/359输入及三包1912成员/角色manifest核过，无任务漂移。之后仅L0归档/台账/交付，不能改称重跑了测试。本体NA/FINAL，有限18=15一致/2原gap/1原范围外待决，不增加unique；353知识不变。整体审计、原high/A12/容量/暂停及strict86/lint缺配置继续；未自动合并、部署、恢复或查询触发CI。
