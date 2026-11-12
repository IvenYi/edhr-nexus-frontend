# W2 Office导入信息保留与图片尺寸

L2；PR86已真实合入 `edhr-dev@8a415040`，树同4ea1a96f，无外部代码/知识/契约增量。受测候选 `38aae69e345ca1505873bb47c7456e02ec4783ff`。

修复 `W2-IMPORT-EXCEL-IMAGE-EXTENT-001`：单锚点Excel图片180×72原会变24×24；现读取ExcelJS已有的像素ext。产品仅importExcel.ts 5增/4减，原双锚点/最小尺寸、媒体、页面身份、撤销、保存协议及业务规则/后台/知识保持。新增两份真实Excel与组件维护测试，不实施格式迁移或大模块重构。

主侧与全新独立各101Node+80浏览器+41控制器=222功能执行，另知识89，0失败/错误/skip；build/原3guard过。旧同最终脚本Node4P6F，两屏各1P3F；当前新10Node/8浏览器过。48/359输入绑定。本体NA/FINAL，有限8=5一致/1原gap/2原待决，353文件/2849ID及0.3.25/schema1.2.0/P0保持。独立quality passed/FINAL，17必需项通过，无findings/blocking，依赖已清、工作树clean。三包488成员摘要及角色原manifest核过。

另量化Word同表图片重复解析：300行/50处图，表格解析52次，三次转换约1.14–1.26秒。是旧Office膨胀风险的细化子项，仅取证，已问后续复用顺序，未实施优化。样本数不是上限，不是生产SLA。原strict86/前端28和lint缺配置保持，受控组件/直接mock控制器不等同HTTP/PG E2E；窄屏原布局、所有格式/宏/历史及生产容量不因此认证。

- [源码链、根因、A23、性能实测及具体拆分建议](review.md)
- [L2决策包](decision-package.yaml) · [有限方法范围](method-review-records.jsonl)
- [主侧机械核验](main-analysis.json) · [固定树盘点](inventory-summary.json)
- [本体正式结果](ontology-result.yaml) · [有限语义核对](ontology-review.md)
- [独立正式结果](quality-result.yaml) · [独立报告](independent-review.md)
- [原件包和摘要](evidence-packages.json)
- [全角色FINAL后的实际PR前漂移复核](pre-pr-drift-review.md) · [机器门禁](evidence/pre-pr-verification.json)

整体仍在W2：先fetch本PR实际合入及新增，再续叶子归一化、Office格式/图文布局与序列化身份及信息保留；Word优化按实际答复另批处理。全W2/W3–W7、全知识语义、A23已审补查、另一通用质量/异常/源签署high、A12、全UI/权限矩阵、非MVP多租户及原暂停/未答保留。不自动merge/deploy/恢复或查询触发CI。

2026-11-12 13:55:59 Asia/Shanghai已实际PR前复核：目标仍8a，48/359输入及三包488成员/角色原manifest核过，无任务漂移；此后仅L0验收/交付登记，不改称重新运行测试。
