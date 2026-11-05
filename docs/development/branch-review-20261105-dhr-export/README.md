# DHR归档读取、完整性与资源审查

L2；`edhr-dev@5bfd96ff1e10a665a41db8fdf88352f65b1288a3`，PR62已合入、整树同97621802，无外部代码/知识/契约增量。新分支audit/edhr-dev-dhr-export-review-20261105。

本轮继续原导出内存队列，核对显式冻结版本、FULL/SELECTED、附件/签署完整性、流失败与临时ZIP释放及真实读取资源。实测后用户已批准“先修复重复图片读取”：只在一次表单resolve中复用完整校验后的签名图片显示编码，普通附件缓存独立，不跨调用，不改签署/冻结/资格或导出内容。PDF累计内存保持开放风险。

主侧最终49/49，知识89/89，均0F/E/S；旧源码预算原XML为19=16正/3真红/0E/S。同字节可证范围为原生预算测试；旧unit未由runner预先捕获源码，保留XML但不补造快照或声称独立旧源unit复跑。原测试夹具缺必填字段的首次15=12正/3E原件单独保留，已修夹具，不降数据库保护。100个字段复用256KiB签名图片：100→1查询，25→0.25MiB逻辑读取，线程累计分配127.30→1.34MiB；不是生产SLA或峰值承诺。普通附件仍一次读取。PNG/JPEG嵌套/多身份、跨调用/普通类型隔离、损坏/截止时点/租户资格拒绝均验证。

容量部分1/10/100个有效PDF实际通过冻结摘要/ZIP输出/解压/清单长度与SHA/合并页数/导出审计；打印器用有效PDF夹具隔离，不能代表Chromium容量或创建/START。真实Chromium另跑6个必需方法，主审只视觉查看末页和横向两张样本；Controller直接回调3例不是完整HTTP/RBAC矩阵。

clean受测`1eff0b51fbec41ce272f51a1089a670697b86384`已取得全新[独立quality passed](quality-result.yaml)，16/16必需检查，无发现/阻断；独立49/49、知识89/89均0F/E/S。服务器33业务SELECT、3审计INSERT及控制查询分别对齐，11份独立JFR重算。两个本体结果均not-applicable，所有角色和子项正式FINAL，自有PG/软链/工作树清理。[PR前漂移及阶段复核](scope-review.md)已实际完成，目标仍5bfd、无漂移；之后仅L0结果归档/台账与交付，受测代码测试保持。[详细结论](review-notes.md)、[实测数据](performance-report.json)、[主侧结果](main-validation.json)、[旧源反证](negative-control.json)、[固定盘点](inventory-summary.json)。全部原全审/性能余项和暂停保持，不自动merge/deploy/恢复或查询触发CI。
