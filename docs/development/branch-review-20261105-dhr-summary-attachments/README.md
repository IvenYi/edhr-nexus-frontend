# DHR汇总附件提交读取审查

L2，edhr-dev@a429f983a7a69553753034e9306d12598fcc15be；PR63已合入，整树同f133e315，无外部代码/知识/契约增量。新分支audit/edhr-dev-dhr-summary-attachment-review-20261105。

继续原汇总附件5+2N队列。完整canonical真实成功提交取证后，用户已明确批准“先做提交内元数据复用”：最终仅改DhrAttachmentService、DhrSummaryService两个产品文件，新增原生测试并补原无附件mock，业务政策/接口/索引/迁移保持。旧605只认证局部guard/七表PK/替身依赖，不当本轮完整请求数。

最终主侧72/72（新18+相邻54）均0F/E/S，原知识89及350字节基线保持。旧产品+完全同字节新18为13正/5真查询预算红/0E/S。0/1/10/100/300及50MiB声明场景现在均13 SELECT；300由613→13，完整字节读取保持。最终19观察195业务SELECT（旧同测试1035），50写/19SET另列；逐tag/完整形状与PG成功execute吻合。单50MiB仍完整读约0.37MiB线程分配；300小附件由约13.67→7.34MiB累计分配，均非峰值/RSS/SLA。来源hash、逐份VERIFIED→完整SHA、错误顺序、冻结与两种并发unlink均保持。

完整索引混合分布：active组合索引命中，300行内存排序106KiB无临时块；id主键命中，不加推测索引。公开snapshot共用原字段/顺序映射，upload/verify/unlink/file/下载/导出资格尾部原字节保持；内部上下文仅同次父锁事务，不暴露路径、不跨请求缓存，元数据内存仍随N增长。

clean受测48be11f44962b2dfe7390f7bb45b1ec833ac2bd3已取得全新[quality passed](quality-result.yaml)，16/16必需检查，独立72/72、知识89/89均0F/E/S，无发现/阻断。195业务SELECT/另1驱动catalog/50写/19SET分列及19外部JFR吻合。两个本体结果NA，所有角色/子项正式FINAL，自有资源清理后已实际完成[PR前无漂移/阶段复核](scope-review.md)，目标仍a429；之后仅L0验收/归档/交付，受测既有路径保持。

7704阶段原test-only质量16/16、69/89仅认证历史阶段。原15有限=13一致/2完整场景gap，delta只重核子集、不叠加unique，350知识/版本/P0保持。[最新整改结论](reuse-review-notes.md)、[最终实测](reuse-performance-report.json)、[最终主侧验证](reuse-main-validation.json)、[旧源预算](reuse-negative-control.json)、[最终服务器核对](reuse-server-sql-review.json)、[固定盘点](inventory-summary.json)。原[取证说明](review-notes.md)和无reuse前缀数据保留7704时点。PR63签名图片复用、PDF累计内存/931知识/86UI及所有原全审余项和暂停保持，不自动merge/deploy/恢复或查询触发CI。
