# W2 已授权的Word表格解析复用

L2；用户明确选择本批优化。受测 `de9aa396115ac326dd016235ec664a9c0c95fe15`，目标 `edhr-dev@8a415040`。PR87尚OPEN，当前Word分支独立于其Excel修复，不将它当已合入或继承覆盖。

已交付 [PR88](https://github.com/IvenYi/edhr-nexus-frontend/pull/88)，本批分支→edhr-dev；实际观察OPEN/MERGEABLE/CLEAN，建议按当前受测基线人工合入。验收归档13ad54ea后仅L0登记，登记前本地/真实远端/PR head一致，目标仍8a且49/359输入、481原件成员摘要保持，见[交付核对](evidence/delivery-verification.json)。正常推送登记后再核对，不改称重新跑测试。

仅importWord.ts产品14增/10减，加两维护测试及共享夹具、DP。表格按本次DOM Element共享ParsedTable，图片及高度读取原结果，不跨文件/请求缓存，不改图位/段落/边框/媒体/业务政策/保存/历史。300行50处图片的同包正式对照52→1次，旧中位约1440ms、新48.5ms，完整页面JSON相同；是局部合成转换含测试JSON准备，不是生产SLA或上限。

主侧及独立实例各实际91 Node、8纯解析、78组件浏览器、41控制器=218功能执行，另知识89，0失败/错误/跳过；build及原3guard过。旧同最终纯脚本1正/7真实解析次数预算失败，全部输出仍相同。49/359输入绑定，strict仓库86/前端28完整旧问题集合相同、新增0；lint缺配置保持。受控组件/mock控制器不冒称HTTP/PG全链、全部Word版式或生产容量。

本体NA/FINAL，有限8=5一致/1原gap/2原待决，353文件/2849ID和0.3.25/schema1.2.0/P0保持。独立quality passed/FINAL，17必需检查通过、无findings/blocking，软链已清/工作树clean，三包481成员及角色原manifest核过。父Office全ZIP/工作簿/媒体容量风险保持，当前只关闭重复整表解析子项。原图文布局近似/窄屏限制不借完整JSON相同认证正确。

- [根因、性能、完整输出对照、A23及提取判断](review.md)
- [L2决策包](decision-package.yaml) · [方法范围](method-review-records.jsonl)
- [主侧机械核验](main-analysis.json) · [固定树盘点](inventory-summary.json)
- [本体正式结果](ontology-result.yaml) · [有限核对](ontology-review.md)
- [独立正式结果](quality-result.yaml) · [独立报告](independent-review.md)
- [原件包及摘要](evidence-packages.json)
- [实际PR前漂移复核](pre-pr-drift-review.md) · [机器门禁](evidence/pre-pr-verification.json)

整体仍在W2，下一轮先fetch本PR、PR87及目标新增，再接叶子归一化和Office图文布局/序列化信息与身份保留；全W2/W3–W7、A23已审补查、全知识语义、另一质量high、A12、完整UI/账号/权限矩阵、非MVP多租户、strict/lint旧债、容量UNKNOWN及原暂停/未答保留。不自动merge/deploy/恢复或查询触发CI。

2026-11-12 14:59:52 Asia/Shanghai全部角色正式FINAL后已实际PR前复核：目标仍8a、PR87仍OPEN，49/359输入及481原件成员/角色manifest核过，无任务漂移；此后仅L0验收/交付登记，不冒称重新运行测试。
