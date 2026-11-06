# PNG/JPEG 核验优化：独立最终质量

结果 **passed**，限 `cf5594947e96dcc56497997d7941da0f7a89be7e..b7f576e9a5b519ceac97b372341612c3a217c12a` 本批。实例未参与任何实现或修复，没有修改受测代码、测试、夹具或配置；独立 detached 工作树和自有 PG16 容器实际跑完87/87及知识89/89，0失败/错误/跳过。目标实际fetch仍cf559494；契约在b7f576e9读取且与目标全同。正式结论18项适用检查通过，无新发现、无本批阻断。后续源/目标变化须主侧按影响重核。

测试期间仅有frontend/node_modules外部依赖软链接，runner原始status如实保留；结束后仅移除此链接，候选工作树clean。没有触发或查询Actions，没有merge/deploy/历史修复。

## 实现与规则

verify保持父DHR锁→附件锁→active→原件存在。仅PNG/JPEG使用8192缓冲边复制边完整SHA，摘要匹配后ImageIO读取同次自有快照上的原header/尺寸检查；不重新消费可能改变的原路径。临时Closeable完成后才原VERIFIED更新与VERIFY审计。上传仍byte[]，原图片检查抽取复用；PDF/Office/下载/冻结/接口/权限/schema/历史不改。没有新增SQL、SQL循环、内存分页、缓存框架或兜底放行。异常保护围绕本批实际持有的资源，不属于凭空增加业务限制的过度防御。

DEC-0063-10/13及七格式/52428800含边界/原件SHA/冻结引用/人工来源核验不变。350知识文件及协作契约逐字节相同，知识0.3.25/schema1.2.0/P0不升级。本体原件16有限记录=13在声明子范围一致+3证据缺口，实际核对过原记录和源码指纹，未用schema通过或文件存在顶替全库一致性。

6新生命周期测试全部实际通过：成功清理、部分写失败、清理失败拒绝更新、摘要/格式主错误加suppressed清理IO及日志路径、复制后外部改原路径仍读固定视图。真实PG原27项涵盖七格式/1-10-50MiB/超限、租户/DHR/active/状态、缺失/篡改/格式拒绝、SQL和审计CHECK拒绝及flush后外层回滚；54相邻测试保持通过。模拟IO/删除故障不是本机真实磁盘满；状态夹具不代替全部生命周期启动认证。

## 独立原始证据复核

主/本体/W5三原始归档及447文件大小/SHA全匹配。旧源27项25通过+2真实预算失败，0错误/跳过，两个失败均50MiB核验约52.54MB分配超25MiB阈值；旧产品快照等于base，native测试同最终候选完全同指纹。主侧中间一次新增测试AssertJ类型编译失败没有新测试报告，后续修复断言类型、最终87全通过；没有隐去或用旧报告补齐。

独立PG日志按动作逐SQL形状与调用侧匹配52动作/128业务SELECT，额外驱动类型元数据查询单列。服务器成功execute为52 SET、36 INSERT、12 UPDATE；48写执行中4随后回滚，3预期失败INSERT另列。**成功audit INSERT执行23次=22正常往返+1外层回滚**，全部23条实际参数的action/操作者ID、姓名、账号、tenant/source、DHR/attachment身份与摘要hex形状已核；不是23条已提交，也未以摘要存在证明旧AuditEvent可重算。

JDK21 CLI独立解析全部52份原始JFR，按动作线程和原件/夹具/快照路径重新加总，与测试观察JSON完全一致；所有被记录临时快照路径在独立检查时不存在。50MiB PNG核验独立线程累计堆分配124,928字节，generic轴124,784字节（约0.12MiB）；原件完整读52,428,800字节并新增同量临时写，格式读53字节。结果支持本批整数组分配问题已消除，不能外推原生/直接内存、峰值、物理IO、并发或生产SLA。JPEG只小格式回归，大案例是填充PNG；仍为原header/尺寸而非全像素解码。

W5只读方案未改AuditEvent、schema、旧行或Signature/DHR/file摘要，保留preexisting-medium-open；建议版本列/canonical新行并未实施。当前49自动生产位点/37文件与方案边界可核，ZIP部分字段不能冒充独立自足hash验证。上传/PDF/Office/导出容量、完整场景及全审931/86/A12/高风险/矩阵/history/text-ID索引/UNKNOWN对账/A23复查队列保持；whole-file完成计数0、历史唯一覆盖未知。

证据索引：qualityResult.yaml、validation-summary.json、server-sql-check.json、audit-parameter-check.json、external-jfr-check.json、negative-control-check.json、archive-check.json、knowledge-contract-check.json、worktree-state.json。原始日志/XML/PG/JFR/源码在native-retry与source-snapshot，所有产物由manifest.json封存。
