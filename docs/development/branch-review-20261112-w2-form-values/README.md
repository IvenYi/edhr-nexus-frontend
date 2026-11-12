# W2表单值边界与子表证据校验优化

L2；PR84已真实合入`edhr-dev@fb68cf02`，整树同0c810883，无外部增量。受测候选`6e878e496189c2fdd765f9ea71b5264a3e181709`。

已交付[PR85](https://github.com/IvenYi/edhr-nexus-frontend/pull/85)，audit/edhr-dev-w2-form-serialization-20261112→edhr-dev，观察OPEN／MERGEABLE／CLEAN，建议人工合入两项已授权优化。验收归档d4dbef25后仅L0登记；登记前本地／真实远端／PR head一致，目标fb68及35／359输入、原件包摘要保持，见[交付核对](evidence/delivery-verification.json)。登记正常推送后再次核对，不改称重新运行测试。

按用户本轮实际答复“**两项一起优化**”落实两项已量化开销：每行只复制上下文顶层容器；每个公开字段证据校验调用树内复用本对象文件元数据，仍逐处核对名称且新调用重新查询。仅ExecutionAccess、新维护测试和DP三个受测文件；业务规则、权限、签署、事务、历史、API/UI/schema/索引及知识不改。

300行12说明字段的普通子表，局部校验累计分配约80–83MiB→**0.44MiB**；同原件引用资格查询**300→1**，文件场景累计约0.50MiB。方法局部实测，不是保存全事务、RSS／峰值、PG计划或生产SLA；300是行样本，不是人数／表单／可填行数上限。旧同最终测试11项5通过／6真实预算失败，新11全过。

主侧和全新独立实例各实际**205通过、0失败／错误、3项原条件未执行**；知识各89/89。3项为2个浏览器长驻夹具和1个仅PG的START竞争，未计passed、未改原测试／条件。独立正式quality passed／FINAL，16必需项通过、无findings／blocking；本体NA／FINAL，有限21=16一致／1原gap／4原待决，353知识及0.3.25/schema1.2.0/P0保持。35／359输入一致，原件封包，独立依赖软链已清、最终工作树clean。

- [详细规则、根因、验证、A23及具体提取方案](review.md)
- [L2决策包与影响范围](decision-package.yaml) · [方法范围台账](method-review-records.jsonl)
- [机械核对及7组前后实测](main-analysis.json) · [固定树盘点](inventory-summary.json)
- [本体正式结果](ontology-result.yaml) · [有限核对](ontology-review.md)
- [独立正式质量](quality-result.yaml) · [独立报告](independent-review.md)
- [三份原件包及摘要](evidence-packages.json) · [归档](evidence/)
- [实际PR前漂移复核](pre-pr-drift-review.md) · [机器门禁](evidence/pre-pr-verification.json)

整体W2其他解析／导入／保存与完成消费链、W3–W7、全知识语义、A23含已审补查、另一通用质量／异常／源签署变化high、A12、完整UI／账号切换／错误／权限矩阵、非MVP多租户、strict86/lint缺配置、生产容量UNKNOWN及其他未答／用户暂停保持。下一轮先fetch合入与新增，再接续原W2设计文档解析／导入和序列化余项；原行ID扫描CPU等其他性能不因本次授权顺带改。不自动merge／部署／恢复或查询触发CI。

全部角色正式FINAL后，2026-11-12 10:44:12 Asia/Shanghai已实际PR前复核：目标仍fb68，35／359输入及三包414成员和角色manifest已核，无任务漂移。此后仅L0验收／台账／交付，不改称重新运行测试。
