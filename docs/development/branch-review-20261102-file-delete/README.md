# 通用文件删除与事务结果

已交付[PR52](https://github.com/IvenYi/edhr-nexus-frontend/pull/52)，本审查分支→edhr-dev，建议本批人工merge。交付观察及受测保护路径对比见[evidence/delivery-verification.json](evidence/delivery-verification.json)；后续交付登记仅L0文档，未冒称为新运行验证。

本轮L2，从实际`edhr-dev@6ec9812f1bb1f7980654510f53c5fa568cfd83fb`建立`audit/edhr-dev-file-delete-transactions-20261102`。PR51已人工合入，整树同b932，无额外业务、知识或契约增量。全新独立质量对clean受测`bd71f6cfb05f211863fcca4382d74445003aa26c`出具passed/FINAL、13/13必需检查；独立单次84/84与知识89/89通过。两项按[验收](acceptance.json)有限resolved，整体审计未结束。

独立同源旧21复现13真断言红8正，0error/skip；58份最终原件含manifest已逐字节归档，见[最终映射](final-evidence-manifest.json)。两次PG元数据/就绪探针错误和一次旧树vite依赖错误在产品断言前，原件保留，不计产品红。全部正式角色FINAL后已实际向用户说明范围/阶段/余项并完成[PR前漂移复核](scope-review.md)；后续仅L0验收/归档/交付，受测源码、测试、知识、契约与固定清单字节保持。

旧FileController.delete先删磁盘再删元数据。真实JPA/H2/PG证据表明，SQL拒绝、提交前错误、外层回滚时，数据库记录保留而原件已丢失；磁盘删除失败还会返回200。最终三个同源测试类共21执行，在真实旧6ec为13个断言红、8个正向，0error/skip。最初旧19的11红8正只作初始阶段，不与最终21加总。

产品仅FileController一文件：读记录/原保护检查/删除登记纳入既有REQUIRED事务，afterCommit才清理本次路径；回滚无物理删除，UNKNOWN保留并记录ID/路径。Path在删除登记前解析；afterCommit的IO失败记录技术错误并向正常HTTP调用传播500，不伪报完整成功。此时DB删除已经提交，不得说它回滚或自动恢复。原上传事务、登录边界、生产执行及认证原件拒绝规则保持。

主侧实际单次84/84通过：21个新增删除执行、63个既有上传/读取/原件保护与生产权限回归。首轮84中一旧纯单元夹具传null事务管理器，未执行到原保护断言；只补真实轻量H2管理器，原断言不改，失败原件保留。新native测试用canonical file_object原DDL/PK，加test-only FK注入拒绝；PG还测试真实COMMIT时延迟约束失败，不把该FK当产品新引用规则或全库迁移认证。JWT/MVC不代表浏览器、真实socket、登录/RBAC或全部ACL。

本体FINAL为NA，9个既有ID有限重审、330知识资产字节不变，知识89项实际通过；生产guard有原始源码证据，SIGNATURE_EVIDENCE literal仅作为保留的既有实现，不伪造独立用户确认。技术一致性不新增业务删除资格。具体A23/源码/抽取边界见[review-notes.md](review-notes.md)与source-review.json。

数据库/磁盘并非跨资源原子提交：提交后清理失败或进程崩溃可能留下原件，500后的同ID重试可能404；需要按ID/路径核对，持久清理对账、重绑/重复引用互斥和ACL三问仍待审/待决。本批不自动恢复数据库或历史、不扫删孤儿、不新增状态/队列/磁盘事务框架。相邻DHR附件UNKNOWN回调继续独立待审，不能因通用DELETE修复关闭。

6370路径/135SQL及464HTTP/216路由只是固定目标盘点，wholeFile0/unique未知；原666/44/183、A23旧856+feature1/SQL130+前4+0091及所有历史队列继续W6含旧已审/W7。两旧DHRhigh/A12/四gap/完整账号UI收件人、朋友签署页与生产弹窗暂缓保持。不自动merge/deploy/恢复，不查询触发CI。
