# DHR附件写入失败与下载容量观测

本轮L2，从最新`edhr-dev@e3e49784eda6bc01e7e5c686d6f79dc5a600d5ae`建立`audit/edhr-dev-dhr-attachment-write-20261102`。PR53人工合入且整树同2a0d9fd2，无外部源码/知识/契约增量。初候选601的127/127、容量1/12组84请求及fresh QA已过；用户随后明确“如果对用户来说没什么体验差距，那么就做流式摘要优化”，新增独立小提交后组合源码为320a4c74717dd913d44d6e01e6c5a6f2993d4695。组合主侧再次127/127及容量1/12组84请求通过，当前等待另一全新最终QA，旧601不覆盖新组合。

初QA114原件（113+manifest）以[初候选映射](initial-quality-manifest.json)完整打包；原evidence-manifest.json的87原件/5源码快照及最初本体源指纹均对应601阶段，校验该阶段Git/字节而非新stream代码，不能回写原件。本轮运行次数不累加为唯一业务覆盖。

旧服务在事务完成回调登记前直接Files.write，写入或关闭IOException会留下未登记文件。最终故障测试用真实输出流和实际部分字节配合显式IOException注入，不是磁盘耗尽实验。创建碰撞的既有文件/目录必须保留；补偿清理失败保留最初错误、附suppressed异常并记录附件ID/路径。

初601候选只修改DhrAttachmentService.upload：CREATE_NEW取得流放在清理catch外，成功取得当前新文件后才进入写入/关闭补偿；维持现有JDK Files.write的8KiB分块写法，避免改成单次巨数组write。失败不进入附件登记/LINK审计。原COMMITTED/ROLLED_BACK/UNKNOWN回调、来源/50MiB/格式、SHA256、核验、解除保留历史、冻结下载和HTTP权限保持。当时未新增事务/存储框架、状态表或性能实现。

上段为初601写入修复范围；本轮按用户新增条件授权，第二小提交只在同一服务的file()使用私有Path摘要重载、8KiB固定缓冲，完整SHA比较后再返回原FileSystemResource路径。verify仍保留解析所需byte[]，Controller/SQL/UI及错误文本未改。新增响应头断言验证文件名、下载类型、contentType/nosniff保持，完整输出字节/SHA及坏文件输出前拒绝均通过。

file()还被汇总附件集合/提交核验、归档取原件和任务下载间接使用，这些摘要阶段同样有界，完整校验/冻结/审批资格及锁不改。相邻27个DHR用例是有限回归，不外推为全部实际账号/完整任务下载认证。

首轮静态mock设置提前创建路径导致3个夹具断言失败，原件及初版源码保留，不算产品红。修正conditional Answer后旧实际e3树5项=3真断言红2碰撞正控；该中间测试随后仅移除unused import，保留归一化证明；另有exact最终字节旧控制及全新独立旧控制，阶段不加总唯一覆盖。当前127含新5与既有122，均0failure/error/skip。

下载前后量化见[performance.md](performance.md)：原每请求约50MiB；流式后后续约0.1–0.23MiB（首次约2MiB），16并发采样堆增量约820MiB降到2–4MiB。当前/冻结有效5/6查询、坏4/5、有效100MiB/坏50MiB每请求逻辑读取不变。只代表本次2GiB JVM、暖文件缓存/稀疏PNG、Hikari池和进程内路径，不是物理IO、完整HTTP/RBAC、直接内存/RSS或生产SLA；不承诺单次更快。用户条件授权已按实际字节/头/拒绝回归满足，查询复用仍另核。

本体NA/FINAL、14既有ID有限核对、25源指纹、知识89与330资产不变。6604路径/135SQL/464HTTP/216路由仅盘点，整文件完成0、历史unique未知。有限A23与具体拆分见[source-review.json](source-review.json)和[review-notes.md](review-notes.md)。当前生产显式upload调用仅注入Controller入口，未发现无事务内部上传，按有限源码证据排除该猜测，不新增全局防御；不等于认证所有动态/未来入口。

整体仍W3/W4/W5交叉；原666路径/44知识文件/183ID候选、W2余项、W6健壮性/性能/A23含旧已审/W7增量、两DHR旧high/A12/四gap、完整账号UI收件人/ACL引用并发与原暂缓保持。进程崩溃、补偿失败/UNKNOWN持久对账仍残余。全部正式角色FINAL后实际向用户做PR前漂移/阶段复核再交付；不自动merge/deploy/恢复/扫删孤儿，不查询触发CI/Actions。
