# r2：安装测试与交接元数据增量本体复核

FINAL：not-applicable。此r2只补充后续明确的相邻测试/交接范围，r1的11份原件及manifest全部按原字节保存，原manifest SHA256仍为13448176c111b5ae8959d3248aafbee781fe654f4069b701797c26fdf145ea6f。

实际读取CurrentDatabaseBaselinePostgresTest的差异：首次与重复安装的databasechangelog数量从9改11，恰好承接0091两条新增changeset；增加两新索引indisvalid=2的断言，属于更精确的当前安装验收。三个原测试方法仍保留：fresh/repeat及签名原始字节/权限/约束验证、拒绝已有业务表且保留原数据、旧当前基线升级只生成真实已完成修订及再次安装幂等。没有删除这些路径，也不把计数更新解释为降低业务标准。

实际核对decisionPackage affectedFiles已经完整列出8个当前产品/迁移/测试路径，与工作树源差异集合相同。相对r1新增一份baseline测试指纹及更新包SHA，其余23个原源/契约/知识/测试指纹逐字节相同；DhrReviewService、0091及master均未再改。r2当前源码与包以source-fingerprints.json为准，不为未提交工作树编造Git提交。

本轮没有新的本体语义：保留r1的14既有ID=12有限consistent+2旧high evidence-gap、知识0.3.25/schema1.2.0与P0/in-progress；330份知识资产再次核对全部未变。实际知识89/0/0/0沿用原执行原件，验证器及知识未变，未重复运行知识Maven。既有候选/已办/版本/签署/冻结/权限边界和ICU运行前置说明仍取r1。

本体只读测试与交接增量，没有执行主开发的143后端回归、3项安装库测试、迁移/容量/浏览器或独立质量验收；这些必须由实际执行角色分别说明命令、候选和原件。本体NA不替代质量FINAL，两旧DHRhigh、666/44/183、W6/W7及原暂缓继续开放，不表示全量审计或发布完成。
