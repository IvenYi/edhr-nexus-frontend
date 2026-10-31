# 上传登记事务与失败补偿

本轮L2基线edhr-dev@a98e60792554f7753d22406d02b274fd50ea2e6c。PR48人工合入、整树同4df7620f，无额外代码/知识/契约增量；新分支audit/edhr-dev-upload-transactions-20261031。5927路径/134迁移、464HTTP注解/216路由候选只固定盘点，不代表已审计。

`AUD-W5-UPLOAD-REGISTRATION-ROLLBACK-001` medium：旧上传只补偿复制失败，登记SQL失败或外层事务回滚后原件仍遗留。当前仅FileController一个产品文件新增局部登记事务：复制完成后再开启短DB事务，登记前注册完成回调，确认ROLLED_BACK才清理本次原件；UNKNOWN保留原件并报告，不能无条件删除可能已提交的文件。未进入登记仓储的启动失败可清理。清理失败保留错误/日志，不伪报成功、不扫描删除历史。原PR48预占、复制所有权、真实上传者和全部业务规则保持。

旧同源最终H2/PG各5为3真实红2正，0error/skip；当前主侧一次60通过（H2/PG10+原37+ExecutionAccess13），另事务启动/未知结果3通过，未伪称一次命令63。真实JPA、SQL、JWT/MVC和磁盘参与事务5组，使用当前canonical file_object原表DDL/PK加测试CHECK隔离故障；不是全schema/历史迁移或生产DB认证。原控制器/mock回归仅补真实轻量事务管理器，旧断言全保留；read-only生产证据删除测试仍有效。

两轮早期故障夹具分别在无活动同步时注册回调、对Mockito接口callRealMethod报错，原日志/XML保留，不算产品红控或降低断言。最终夹具在真实JpaTransactionManager启动完成后注册beforeCommit钩子、实际SQL完成后测试外层回滚，不mock持久化仓储。新独立最终须按最终同源两类重建旧红与当前运行。

本体NA/FINAL，8个既有ID有限核对、330知识和契约未变，知识89实际通过；当前待新独立最终质量，不提前resolved。源码、具体抽取与A23见source-review.json和review-notes.md。受测后归档/验收与交付须核同blob；全部正式角色FINAL后实际向用户复核漂移/进度再PR。

整体W3/W4/W5交叉推进，记录控制等666路径/44知识/183ID候选仍pending，不能以已实现或本批63执行当全审通过。A23旧856语言+feature1、旧130SQL+新4迁移、全部历史与当前6改4增队列继续W6含旧已审/W7增量。共享文件ACL三规则未答不默认；DELETE一致性、真实断连未知提交对账、DHR附件相邻回调、容量和缺文件政策继续。旧DHRhigh/A12剩余/四gap、TaskDetail友方及生产弹窗归属不自动关闭。不自动merge/deploy/恢复，不查询触发CI。
