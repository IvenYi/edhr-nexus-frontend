# FINAL：601候选独立最终质量结果

`qualityResult.result: passed`；本实例未参与任何修复，仅验证，未修改产品、测试、夹具或配置。没有本批新发现。范围为 clean `6012672aa8be4d0d0c8f35a01b0dee0dd4af2882` 对固定目标/base `e3e49784eda6bc01e7e5c686d6f79dc5a600d5ae`，实际读取契约提交/source 是 `6012672aa8be4d0d0c8f35a01b0dee0dd4af2882`。目标远程 `edhr-dev` 在最终只读 ls-remote 核对仍为 e3；本地旧 edhr-dev ref没有作为目标。知识基线0.3.25/schema1.2.0，模型、知识及项目/角色/交接契约对e3无增量。此结果是601初候选的局部通过，不覆盖随后在独立树实施的流式摘要优化；组合候选必须重新fresh独立QA。

| 实际独立运行 | 结果 | 说明 |
|---|---|---|
| 单次17类新故障及相邻回归 | 127/127，0F/E/S | 新fault5已包含；Archive13实际Chromium生成PDF |
| 独立知识校验 | 89/89，0F/E/S | 精确当前知识；不代替有限语义审读 |
| 单独容量测试 | 1/1，0F/E/S | 12组84请求，不能按84个业务用例相加 |
| own detached旧e3精确测试反证 | 5=3产品assertion红+2碰撞正控，0error/skip | Maven预期exit1；旧产品未改 |

四次运行均保留原始命令、日志、fresh XML及汇总。127测试的17份XML逐项检查mtime晚于本次运行开始；知识/容量/旧树各自独立fresh XML。受测最终fault源码7002B，SHA256 `6088d5bb120f1800da70d8542a16278a625f6efd5ea233c8b5e753013b81c69f`，与旧树仅复制文件和HEAD git blob完全一致。旧树只有该新测试及正确位置的`gmp-platform/frontend/node_modules`链接；旧生产diff为空。三红是部分写/关闭后当前原件未清理、清理失败缺suppressed断言；两类碰撞保留正控均过。旧初版stubbing夹具错误仍单独保留/excluded，不算产品红；重复反证阶段不相加唯一覆盖。

自有`postgres:16-alpine`仅loopback 127.0.0.1:32769，trust，PG16.15/en_US.utf8/UTF8/UTC。使用`pg_isready -h 127.0.0.1 -p5432`等到最终TCP server，再创建两指定库；元数据从`pg_database.datcollate`查询，未误用SHOW lc_collate。指定DHR/UPLOAD环境变量均指向本实例容器，postgres/空密码。主回归与容量使用同own原生PG环境，容量输出目录全新且为空；容量JVM为-Xmx2g。容器stop+rm、旧树worktree remove均正常exit0，无force、不碰他人资源。主工作树最终HEAD601且clean。

源码独立复核确认只替换DhrAttachmentService的原Files.write行：CREATE_NEW开流在catch外，取得当前文件后try-with-resources覆盖8KiB写和close IOException；补偿只删本次未登记文件，清理失败suppressed+ID/path技术日志且原异常保留。原事务COMMITTED/ROLLED_BACK/UNKNOWN、格式/50MiB/元信息/SHA/资格/核验/unlink历史/冻结与HTTP权限无本批变化。实际wrapper JDK21 Files.write字节码1965B与原存件完全一致，8192B分块沿用原行为。有限A23检查未新增全局状态、重试、SQL循环、集合N+1或多读Multipart。当前显式typed生产upload只有注入Controller入口；不能据此认证动态/未来入口或部署完整事务/HTTP认证。原同步guard未改。

容量42次有效请求均完整输出52428800B且精确测试SHA断言通过；42损坏请求均获得响应体前以摘要错误拒绝。12JFR、12reads.json及capacity.json保留。另以自有Java RecordingFile程序逐份重解析JFR，目标文件字节/事件与test原读数一致；成功Jdbc显式查询、ThreadMXBean堆分配及采样heap分别记录：

| 场景 | 成功显式Jdbc/请求 | 分配MiB/请求 | 采样heap增量MiB | JFR逻辑MiB/请求 | 组耗时ms |
|---|---:|---:|---:|---:|---:|
| current-good-1 | 5 | 51.80–51.80 | 52.96 | 100 | 314.9 |
| current-good-4 | 5 | 50.20–50.20 | 205.18 | 100 | 401.6 |
| current-good-16 | 5 | 50.19–50.20 | 821.09 | 100 | 1187.0 |
| current-corrupt-1 | 4 | 50.27–50.27 | 51.03 | 50 | 166.6 |
| current-corrupt-4 | 4 | 50.09–50.09 | 206.04 | 50 | 265.5 |
| current-corrupt-16 | 4 | 50.08–50.09 | 819.08 | 50 | 798.7 |
| frozen-good-1 | 6 | 50.51–50.51 | 51.03 | 100 | 224.6 |
| frozen-good-4 | 6 | 50.21–50.21 | 205.04 | 100 | 326.3 |
| frozen-good-16 | 6 | 50.21–50.21 | 819.15 | 100 | 1032.7 |
| frozen-corrupt-1 | 5 | 50.10–50.10 | 51.02 | 50 | 121.8 |
| frozen-corrupt-4 | 5 | 50.10–50.10 | 204.07 | 50 | 249.0 |
| frozen-corrupt-16 | 5 | 50.10–50.11 | 818.17 | 50 | 767.4 |

容量只代表2GiB进程内Controller/实际service proxy/FileSystemResource、四张canonical表和手工版本元数据。暖页缓存/稀疏padded PNG、非全预热JIT、Hikari10、64KiB输出校验缓冲和JDBC/断言/JFR开销限制外推。JFR逻辑读取不是物理磁盘IO；allocation和采样heap不含native/direct/RSS/network，不是完整HTTP/RBAC、DHR冻结流程或生产SLA。未以精确heap/延迟门槛要求复现。601产品无下载/SQL/索引性能改动；本质量结果不能覆盖新优化。

本体/知识子角色已FINAL passed，14既有ID为12+9-7有限当前定义核对，本体NA/FINAL成立，无知识或阶段提升。证据子角色已FINAL passed，469机械核对全过：固定e3四盘点重建逐字节一致6604paths/135SQL/464HTTP/216routes；87primary原件stored/raw/source三方及5源码快照一致；ontology12+manifest13一致，manifestSHA `470b0b8adaa2b9e4eb30dd05b0950ced70a4948463919142b6a044b88c4671a2`；25源指纹、330知识+6模型/治理文件与实际e3一致。盘点仍inventory-only/pending，wholeFile0、历史unique未知。默认diff-check仅生成CSV的canonical CRLF提示exit2，原输出保留；命令级cr-at-eol复核其余空白exit0，未修改配置或盘点字节。

全部派发子角色实际FINAL，见roles-final.json。证据分类：当前源码、提交、运行XML/日志、数据库元数据、JFR、原bytes/hash为original-evidence；任务包/旧报告只作secondary-reference索引并回到原件核对；DEC0063原确认属user-confirmed；所有权补偿工程解释及有限调用排除属inference，不提升为新业务政策。

本批只关闭当前已创建原件的登记前写关失败局部问题，不证明完整跨资源原子、崩溃持久对账、重试幂等、共享ACL/引用并发、完整schema/FK/migration/UI/RBAC/tenant/recipient或部署入口认证。两旧DHR high/A12/四gap、原666paths/44knowledge/183ID、W2余项、W3/W4/W5交叉、W6健壮性/性能/A23含旧已审全量、W7增量及朋友签署页/生产弹窗原暂缓保持；原记录控制已实现继续增量审，不写成未实现。不能宣称整审完成。人工merge/deploy，未执行CI/Actions查询或触发、merge/deploy、历史恢复或扫删孤儿。主审仍须在所有FINAL后对实际交付候选做漂移与阶段复核；新组合候选重做fresh质量门禁。

正式结果：/tmp/edhr-dhr-write-qa-quality-result.yaml。原始自有证据与子报告按/tmp/edhr-dhr-write-qa-manifest.json保存路径、raw字节长度及SHA256；清单自身的SHA在最终交接回执给出。
