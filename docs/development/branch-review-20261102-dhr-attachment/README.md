# DHR附件上传事务结果

本轮L2，实际`edhr-dev@ab5adafb9629b94f95eb88825ec0a4ea06f4efb1`，PR52已合入且整树同2d2238e2，没有额外源码/知识/契约增量。分支`audit/edhr-dev-dhr-attachment-transactions-20261102`。全新独立质量对clean受测`a6f799459eb105da5e98ab3d548d6b03d18d9e43`出具passed/FINAL，13/13必需检查、单次122/122和知识89/89通过。两项按[验收](acceptance.json)有限resolved，整体审计未结束。

独立同源旧11再次复现2真断言红9正、0error/skip；47份最终原件含manifest逐字节归档，见[映射](final-evidence-manifest.json)。全部正式角色FINAL后已实际向用户说明范围/阶段/余项，并再次fetch核对目标未变、完成[PR前漂移复核](scope-review.md)。后续仅L0验收/归档/交付，受测保护路径保持。source-review.json保留主侧检查点文字，最终处置以acceptance及独立质量为准。

旧DhrAttachmentService.upload在`status != COMMITTED`时删除本次原件，把UNKNOWN误当回滚，并吞掉清理IOException。最终同一新测试类在真实旧ab5工作树执行11项：2个断言失败、9个正向，0error/skip。最严重场景先执行真实PostgreSQL COMMIT，再在事务管理器合成确认失败：数据库附件登记与实际JPA LINK审计存在，旧回调却删掉原件。这不是实际网络断连实验。另一红例用真实非空目录制造清理失败，原回调没有文件ID/路径异常记录。

产品只改DhrAttachmentService一文件：仅STATUS_ROLLED_BACK补偿清理本次路径；UNKNOWN保留并记录ID/路径；清理异常记录定位且不替换原事务错误。继续使用原注解事务，不加状态表、重试、持久队列或磁盘事务框架。成功提交、外层提交/回滚、SQL与审计拒绝、提交前错误、原编辑保护和解除关联历史保留均有回归。

主侧一次16类122执行含新11、既有DHR附件/汇总/生命周期27和既有文件84，均0failure/error/skip；不能按执行次数算唯一语义覆盖。新测试使用实际Spring代理、JPA AuditEvent、JdbcTemplate、原生PG与磁盘，三表原始canonical DDL/PK加test-only拒绝CHECK，不是全库迁移、全部真实外键、完整HTTP/RBAC或浏览器认证。没有修改UI或业务知识。

6503路径/135 SQL、464 HTTP/216路由是固定基线盘点，整文件完成0、历史unique未知。有限源码、A23、具体拆分和下载性能候选见[source-review.json](source-review.json)及[审查记录](review-notes.md)。本批不关闭写入中断/无事务内部调用、UNKNOWN重试/崩溃/持久对账、完整共享ACL与历史DHR风险。整体仍W3/W4/W5交叉，原666路径/44知识文件/183ID候选、W2余项、W6含旧已审的健壮性/性能/A23与W7增量全部保持；朋友签署页/生产弹窗暂缓保持。

只人工merge，不自动部署、恢复历史、扫删孤儿或查询/触发CI/Actions。
