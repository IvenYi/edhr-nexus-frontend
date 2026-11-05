# DHR冻结导出读取审查及局部复用

本批L2沿原全审的DHR归档/导出资源队列推进，目标5bfd96ff；没有新功能或业务政策。实际产品仅改DhrFormFiles一次resolve内的签名图复用。用户看过真实查询/分配证据后明确答“先修复重复图片读取（推荐）”，这项工程批准不是新电子签名业务规则。

## 确定性整改及保护边界

ExecutionAccess.signField为每次签署产生独立签名ID，但图片来自人员认证快照，多个字段重复引用同一fileId是实际可达来源。旧resolveValues每次引用都查询file_object、读完整图片、复验MD5并编码；open-in-view=false且没有外层持久化事务，因此这里并非被一级缓存消除的假设。

新实现仅多传一个局部Map<String,String>。同一fileId首次执行原read的租户、类型、截止时点、登记长度与MD5校验，再检查PNG/JPEG并生成data URL，成功后放入map。随后复用已校验URL，不额外保留原件byte[]；一次resolve结束即释放map。普通原件map独立，因此把同一个ID伪装成普通附件仍拒绝。新调用重新读取校验，不存在全局缓存、跨表单陈旧资格或失败值缓存；record先deepCopy，全部签名ID、人员、时间及原冻结数据保持，签名图不新增为ZIP原件条目。

本批三项新增/扩展测试文件：真实PG/JPA/JFR读取与归档观察；Controller成功/中断清理；原FormFiles单测增加100个嵌套字段、2种图片身份及跨调用/类型/坏文件边界。旧源码+新测试19项中3项是真预算红（原生10/100字段、单测每身份读取一次），16正、0E/S；产品修复后完整49/49。旧源与最终原生测试源指纹相同。初次容量夹具缺origin_kind/created_at出现3E，主审按canonical约束补齐，原件保留，未关闭触发器或弱化断言，不把夹具E当产品缺陷。

## 实测及仍开放的容量风险

完整原件见evidence主侧归档和performance-report.json。最终11观察事件33 SELECT（24显式JDBC、9 Hibernate SELECT），另3 Hibernate审计INSERT；原阶段141 SELECT为同类11事件，下降来自签名图片。8次字段预热、5次拒绝守卫读取及3次归档后审计断言不计业务观察，初始化/EXPLAIN也不混计。独立质量须以其自己服务器日志复核，不把应用计数冒称全部网络SQL。

| 同一256KiB图片引用数 | 旧查询/读取量 | 新查询/读取量 | 旧→新线程累计分配 |
|---|---|---|---|
| 1 | 1 / 0.25MiB | 1 / 0.25MiB | 1.27→1.27MiB |
| 10 | 10 / 2.5MiB | 1 / 0.25MiB | 12.73→1.28MiB |
| 100 | 100 / 25MiB | 1 / 0.25MiB | 127.30→1.34MiB |

这是每表单一次解析的暖缓存合成实验，100只是规模点，不是产品数量上限。JFR为指定路径逻辑读取量，不是物理磁盘IO。ThreadMXBean是调用线程累计分配，不是峰值、保留堆或进程RSS；heapBefore/After为快照，可因GC下降。

第二项性能风险仍open：ArchiveService保留formPdfs数组，随后合并PDDocument并序列化为整块byte[]。1/10/100张约190KiB有效PDF，生成ZIP约0.57/3.97/38.03MiB，最终生成线程累计分配约4.80/13.19/148.47MiB；每组9 SELECT，容量风险在PDF缓冲而非N+1。打印器在这部分被mock隔离，实际冻结完整性/ZIP/PDFBox/审计均运行，不证明真实Chromium、300表单或生产并发。建议下一批讨论磁盘暂存单表PDF、逐个追加合并并直接写ZIP，仍保留单表PDF及总PDF输出；未经讨论不实施。50MiB原件输出数组、多附件及审计/签名清单载荷规模另留轴，不能用这次实验关闭。

## 正确性、A23与具体抽取结论

- 显式dhrId/versionId、冻结成员、单记录source_snapshot/hash、版本整体摘要、原件实际MD5/长度和冻结附件SHA分别保护不同依据；SELECTED的非空、成员、排序去重与写出数量守卫也不是相同检查。没有证据可机械删去这些保护。
- PDF源文档关闭缺陷假设被PDFMergerUtility.appendDocument及PDFBox3.0.3克隆实现反证。真实Chromium6方法通过；实际归档合并页数和单表字节核对通过。不能凭源close增加兜底。
- 当前新实例号固定ASCII FR-日期-序列，长中文title与最大ASCII编号的真实ZIP可解压。两个长中文片段可超255B仅是历史/宽列假设，没找到现行中文编号写入口；不据此改正常文件名或修历史数据。Linux组件边界通过不代表全部Windows旧MAX_PATH已认证。
- ZIP生成失败catch和Controller流finally各自拥有不同生命周期，新增成功/传输中断均删除临时ZIP。未执行完整servlet异步调度拒绝/超时/取消、删除失败或文件系统故障，不把这些候选当已复现缺陷，也不添加防御框架。
- 长服务可先提取writeFrozenRecords、writeFrozenSummaryAttachments、appendTraceManifest，保持排序、数量、AS_OF_EXPORT及提交截止时点。若真正实施磁盘资源方案，再分读取校验FrozenArchiveContext与ArchiveRecordWriter；不先建通用导出引擎。version重复读取有复用可能，但须先设计单一已验证上下文，不能跳过独立摘要输入。本次仅局部map，没有为降低行数重构。

## 知识及全审余项

原本体20条有限记录为19个既有ID+1Markdown，18条明确子范围一致，2条完整验收场景保留evidence-gap；签名复用delta仅重核受影响子集，不叠加成更多unique。知识350及0.3.25/schema1.2/P0 in-progress不变；生成ZIP不等于受控DHR归档生命周期。该观察直接持久化合法冻结夹具，不认证创建/submit/START；真实HTTP权限、完整七格式/50MiB、树切版/全布局等场景没有因本次局部回归完成。

固定基线7562路径只代表盘点，整文件完成仍0，历史unique未知。W2余项、W3/W4/W5交叉、W6健壮性/性能/抽取/A23及已审代码复查、W7新提交增量继续；原931知识候选/86 UI、history容量、文本ID索引、汇总605 SELECT、导出内存、原DHR high/A12/完整运行矩阵保留。朋友负责的通用任务密码/签名页面与生产管理弹窗样式继续暂停。全部FINAL后才做最终任务漂移检查并开PR；不自动merge/deploy/恢复或触发查询CI。
