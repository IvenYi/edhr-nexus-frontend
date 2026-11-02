# PR55追加：下载原件名元数据复用

用户明确选择“先做这项复用（推荐）”。PR55尚未合入，来源eb9faf1202fa6cda23264efbe8b3fcb493b471b3、最新目标8ec8391721858a7f96d73a5d293d93f43679118a，无新增外部代码/知识/契约。本次L2在原分支追加独立小提交，再针对组合候选取得全新质量结果；原query目录的passed/原保护清单仅对应旧候选ec728837，不冒称覆盖本次实现，也不回写旧原件。

downloadableFile最后一次原件查询同时读取original_name，经原完整流式SHA检查后以内部Download(Path,originalName)交给两个Controller，取消末尾独立名字查询。保留两次DHR存在检查及顺序、当前active/显式冻结版本归属与id+SHA成员检查、任务detail资格先于原件读取；响应URL/参数、文件名、ContentDisposition/ContentType/nosniff、原字节和原错误保持。

原file()仍Path、原stored_path/sha256 SQL不加列，仅提取私有verifiedFile(Map)共用现有完整性代码。Summary/Archive调用不改，部分原夹具没有original_name的读取不为本次优化补业务fallback。没有通用缓存/配置框架、兼容wrapper、新索引、UI或大模块重构；删除本轮变为无调用的originalName方法，旧测试仅适配内部返回类型，不削弱断言。

新增原生PG测试覆盖有效当前/冻结响应与4/5查询、两DHR读取、缺失/损坏拒绝、解除后的冻结访问、成员id/SHA及跨DHR/版本/现有tenant谓词；任务Controller另加资格拒绝先于原件读取。主侧80/80通过，50MiB容量单项12组84请求通过；旧eb9相同11例为2真实查询断言红9正控、0error/skip。96份主侧/本体原件加manifest原字节归档，含11源快照、原生SQL/XML/JFR和旧控源码/清理；本体NA/FINAL、14既有ID有限重审、25源指纹/330知识不变、89知识通过。当前待组合fresh最终独立质量，不把原ec728837结果覆盖新实现。

汇总5+2N循环查询和ZIP整附件数组/PDF累计仍待讨论整改，不因本项省一次查询关闭。既有主键已支持该点查，不新增索引；没有完整安装混合分布EXPLAIN或生产SLA结论。完整HTTP/JWT/浏览器、全部账号/并发矩阵、原high/A12/四gap和原用户暂缓继续。

整体仍W3/W4/W5交叉、W2余项与W6健壮性性能/抽取/A23含旧已审/W7增量保持。目标固定盘点复用同8ec的[6785路径清单](../branch-review-20261102-dhr-attachment-query/inventory/inventory-summary.json)，仅盘点、整文件0、历史唯一增量未知；本次3产品修改/2测试修改/1新增测试另排增量，不把新方法覆盖计整文件完成。知识0.3.25/schema1.2.0/P0保持，知识门禁按有限相关ID复核。不自动merge/deploy/历史恢复/孤儿扫删，不查询触发CI。
