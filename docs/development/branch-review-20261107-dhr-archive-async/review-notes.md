# 源码映射、健壮性和抽取判断

本批只审查 DHR 已冻结版本导出的响应交接生命周期，不把其邻接源码映射记为整文件审完。固定基线764258b8、受测8fc765dd。历史来源是20261105-dhr-export/review-notes.md明确待测的完整servlet拒绝/超时/取消项；PR70的主异常保留结论继续有效。

| 真实源码边界 | 本轮核对 | 结论/证据范围 |
|---|---|---|
| DhrArchiveService.export:51及临时ZIP:98 | 同一冻结版本、源资格、摘要、ZIP生成及EXPORT保存后才返回Path | 本批逐字节保持；12原生PG回归，不冒称完整START/submit链 |
| DhrArchiveController.export:36 | Service返回后到body开始前只有路径，旧body不执行就不删除 | 旧同源真实HTTP5项2正3文件遗留失败，非fixture错误 |
| registerCallableInterceptor:44 | Spring6.1.8完成链覆盖全部注册项；reject已async启动，preProcess不是前提 | 安装依赖源码/字节码+3依赖微例，真实HTTP另跑 |
| body入口:50与原TWR | 一次CAS竞争，body领取后回调不得删除；latebody不得再读路径 | 5直接归属检查+原6stream+真实正常HTTP |
| discardUnclaimedArchive:68 | 同步异常与请求结束复用；只删自有路径，失败路径ERROR可见 | 不自动扫删/重试；同步保主异常，完成回调不能修改已结束响应 |

N+1/SQL循环/分页：本次产品Controller无SQL，也未把任何数据库读取移入新循环。相邻Service的原native12沿用11观察33调用线程SELECT，服务器另3实际EXPORT/v2写入，读取量未变化；这不是全Service或全系统消除N+1的证明。Service目录/表单证据、逐份PDF/原件载荷、审计/签名清单和重复上下文读取仍按原性能队列处理，不借本次清理修复优化。

数据量：本缺陷的增长轴是失败请求次数乘以生成ZIP大小。旧请求即使未开始传输也已经占用临时磁盘，最终结束后未释放可能积累；本轮没有测试磁盘配额、并发上限或SLA。Service保留formPdfs并整块合并的既有内存风险未修改，100张合成PDF实验不是业务上限；一份DHR通常≤300表单的用户说明也不等于真实renderer/多附件/并发容量验收完成。

A23与错误语义：单次CAS有确定的完成/活动流竞争依据，既有原件资格/冻结摘要/范围校验没有被当作重复防御删除。没有新增空ZIP兜底、宽catch转成功、默认替代源、跨请求缓存、参数配置、扫描器或重试框架。完成删除失败不冒称清理成功，只记录剩余路径；正常body保留TWR的主异常/suppressed。框架监听器建立前的失效、Error/OOM、crash/UNKNOWN不靠本回调宣称解决。

大模块的具体拆分继续沿既有方案，不本轮无关重构：

1. `DhrArchiveService.export` 中冻结目录排序/重复检查和每条record读取、`formFiles.resolve`、单表PDF写入这一段，可提取私有 `writeFrozenRecords`；参数是同一个已验证冻结上下文、ZIP及inventory，返回原顺序PDF结果，不能重新查“最新”配置。验证需保留目录顺序/成员数、source_snapshot/hash、提交截止时点、单表PDF字节及全/选定范围。
2. 当前冻结附件遍历/原件读取/SHA/ZIP写入段可提取 `writeFrozenSummaryAttachments`；仍使用同一次筛选的冻结附件，不删资格/hash校验。容量方案若获讨论确认，再考虑磁盘暂存/流式写入，不能只把readAllBytes藏进helper就称优化。
3. `auditsFor`、`sourceAuditEvents`、`sourceSignatures`、`signaturesFor`及追溯JSON打包可由 `appendTraceManifest`编排；保持AS_OF_EXPORT/提交截止、字段及排序，SQL批量化要先量化并讨论，不机械合并不同语义窗口。
4. 当前Controller同步交接/异步body职责已经分界，清理两处共用一个私有方法足够。若将来响应交接出现更多已证生命周期需求，再评估专用OwnedArchive组件；当前不添加只包装一次CAS的公共抽象。

这是具体可实施的抽取方案而非已完成重构，不用行数或方法清单充当全量覆盖。下一轮先fetch真实合入/新增提交并按影响做增量审查；无新增时继续上述Service容量与源复用、共享ACL/原件并发及原W2-W7队列。性能方案需要讨论，确定性缺陷按实际证据修复。朋友负责的通用任务签名密码页、生产管理弹窗样式保持暂停。
