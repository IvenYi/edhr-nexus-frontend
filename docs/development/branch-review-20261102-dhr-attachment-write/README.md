# DHR附件写入失败与下载容量观测

本轮L2，从最新`edhr-dev@e3e49784eda6bc01e7e5c686d6f79dc5a600d5ae`建立`audit/edhr-dev-dhr-attachment-write-20261102`。PR53人工合入且整树同2a0d9fd2，无外部源码/知识/契约增量。主侧单次127/127通过；容量另一次1项测试包含12组、84请求通过，不把观测组或请求加总成业务测试覆盖。当前等待全新独立最终质量，不提前resolved。

旧服务在事务完成回调登记前直接Files.write，写入或关闭IOException会留下未登记文件。最终故障测试用真实输出流和实际部分字节配合显式IOException注入，不是磁盘耗尽实验。创建碰撞的既有文件/目录必须保留；补偿清理失败保留最初错误、附suppressed异常并记录附件ID/路径。

产品只DhrAttachmentService.upload一处：CREATE_NEW取得流放在清理catch外，成功取得当前新文件后才进入写入/关闭补偿；维持现有JDK Files.write的8KiB分块写法，避免改成单次巨数组write。失败不进入附件登记/LINK审计。原COMMITTED/ROLLED_BACK/UNKNOWN回调、来源/50MiB/格式、SHA256、核验、解除保留历史、冻结下载和HTTP权限保持。未新增事务/存储框架、状态表或性能优化。

首轮静态mock设置提前创建路径导致3个夹具断言失败，原件及初版源码保留，不算产品红。修正conditional Answer后旧实际e3树5项=3真断言红2碰撞正控；该中间测试随后仅移除unused import，保留归一化证明；另有exact最终字节旧控制及全新独立旧控制，阶段不加总唯一覆盖。当前127含新5与既有122，均0failure/error/skip。

下载量化与建议见[performance.md](performance.md)。50MiB有效当前/冻结分别5/6个显式Jdbc查询，损坏4/5；每请求堆分配约50MiB，16并发采样堆增量约820MiB，JFR观察有效文件两遍/损坏一遍的逻辑读取。只代表本次2GiB JVM、暖文件缓存/稀疏PNG、Hikari池和进程内Controller/service/resource路径，不是物理磁盘IO、完整HTTP/RBAC、总进程内存或生产SLA。固定缓冲摘要作为下一批建议已询问用户，本批未实施；查询复用另核。

本体NA/FINAL、14既有ID有限核对、25源指纹、知识89与330资产不变。6604路径/135SQL/464HTTP/216路由仅盘点，整文件完成0、历史unique未知。有限A23与具体拆分见[source-review.json](source-review.json)和[review-notes.md](review-notes.md)。当前生产显式upload调用仅注入Controller入口，未发现无事务内部上传，按有限源码证据排除该猜测，不新增全局防御；不等于认证所有动态/未来入口。

整体仍W3/W4/W5交叉；原666路径/44知识文件/183ID候选、W2余项、W6健壮性/性能/A23含旧已审/W7增量、两DHR旧high/A12/四gap、完整账号UI收件人/ACL引用并发与原暂缓保持。进程崩溃、补偿失败/UNKNOWN持久对账仍残余。全部正式角色FINAL后实际向用户做PR前漂移/阶段复核再交付；不自动merge/deploy/恢复/扫删孤儿，不查询触发CI/Actions。
