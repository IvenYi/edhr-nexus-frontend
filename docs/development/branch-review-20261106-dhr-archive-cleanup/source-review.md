# DHR 导出双失败：只读源码与历史核对

本角色 **completed / FINAL**，只读范围固定为 `edhr-dev@2cb85492b2dbf47f5b837c565eecc5832b62b39a`，知识 `0.3.25 / schema 1.2.0 / P0 in-progress`。固定 Git 源与当前主侧在途实现分开；DP 是明确标记的未提交工作树副本，不能给它伪造提交。未修改仓库产品、测试、配置、知识或数据库，未执行应用 JUnit、PostgreSQL、HTTP、浏览器或 CI。独立 JDK 微例只验证语言异常传播及自有目录删除故障，不能替主侧负对照和最终独立质量。

## 1. 三处同类传播缺口有固定源码依据

| 固定源位置 | 当前形状 | 双失败结果 |
| --- | --- | --- |
| DhrArchiveService.export:189–192 | 捕获生成/资源错误后直接 `Files.deleteIfExists(zip)`，再重抛原异常 | 删除若抛异常，执行不到原异常重抛，主错误被覆盖 |
| DhrArchiveService.export:194–202 | ZIP 完整关闭后计算 SHA、调用 EXPORT 审计 save；catch 内直接删除再重抛 | 审计、SHA 或该阶段原错误可能被删除异常覆盖 |
| DhrArchiveController.export:33–35 | `Files.copy(zip, output)` 的 finally 直接删除 | 传输错误与删除同时发生时，finally 的异常替代传输异常 |

这是源码确定的双失败异常传播形状；应用是否按相同故障夹具复现由主侧真实服务/Controller测试证明，本角色不把微例冒称应用复现。`CleanupSemanticsProbe.java` 实际在自有临时目录中创建非空 `owned.zip/`，运行三种 Java 形状：catch-delete-rethrow 和 finally-delete 均得到 DirectoryNotEmptyException，原异常身份丢失且无 suppressed；标准 Closeable try-with-resources 保留原异常身份及一个删除 suppressed。所有微例自有子文件和目录已删除，原件见 jdk-probe.jsonl。

## 2. 传播可影响错误含义，正常导出和业务依据不变

`ExecutionSnapshotBuilder.invalid` 使用 GENERAL_001（HTTP400）；GlobalExceptionHandler:33–40 对 BusinessException 保留业务状态和信息，105–111 对普通 Exception 返回500和通用内部错误。因此生成期间原有业务阻断若被清理 IOException 覆盖，异常处理器看到的类型和可定位原因会改变。这是源码映射关系，**未执行真实 MVC/HTTP**；流已开始、响应可能已提交后，不可承诺再发送新的400/500 JSON。

Service 的现有顺序是：显式 dhrId/versionId、冻结/范围/完整性验证 → 自有临时 ZIP 生成及资源关闭 → SHA 与 DHR_SUMMARY_EXPORT/EXPORT save 调用 → 返回 Path。Controller 接到 Path 后构造头和 StreamingResponseBody，流执行结束/中断时承担删除。两个所有权阶段不同，不应把删除全部搬到某一个 finally，也不能把异常改成成功返回临时包。save 调用位置不证明任何外部事务或 UNKNOWN 结果已处理；本批不新增事务或成功/失败审计政策。

Controller:27 仍要求 `dhr.instances.view` 且 `dhr.summaries.export`。请求标识解析、FULL/SELECTED范围、附件原件/摘要、冻结成员、排序/数量、来源截止时间、选择范围载荷裁剪、审计和签名等校验均不在本次异常处理修复内。DEC-0063-10/11/12/15、rule.dhr-summary-zip-source-trace继续表达现行原件和冻结证据规则；“导出归档包”不能等同 DEC-0090 的业务 DHR 归档/最终放行生命周期。

## 3. 最小修复边界与 A23

Service 可在本类一个私有清理方法中尝试删除本次创建的 ZIP：删除失败附到主异常 suppressed 并记录其自有路径，随后仍抛原异常。与已有 FileController:137–144、367–377 的原错误保留模式一致。Controller 可用 JDK Closeable 资源的标准抑制语义覆盖流 body，保持正常/中断都尝试删除；仅删除失败、传输成功时，关闭错误仍须上抛，不能一概吞掉清理错误。

这里不需要通用资源管理器、后台重试、任意递归删除、历史孤儿扫描、跨请求缓存、额外业务资格或推测型配置。捕获清理 IOException/RuntimeException 是对独立的文件系统操作保留主错误，不是用 catch 后成功返回来隐藏问题。真实已失败临时路径的附属诊断有明确作用，不应以 A23 移除冻结/签名/权限守卫，也不为理论自抑制等情形提前增加无证据防御分支。

验收应分别证明：原错误对象/类型及已有 suppressed 保持；生成、资源打开/关闭、审计及输出中断与删除故障组合；成功输出字节/头/审计/SHA和原删除；仅删除失败仍失败。主侧夹具将自有临时 ZIP 置换成非空目录可制造真实 IOException，但它不等于实测磁盘掉线、真实权限失效或生产事故。最终质量须仅读报告且由未参与修复的新实例完成。

## 4. 历史去重与尚未覆盖的相邻生命周期

20261105-dhr-export/review-notes.md:32 已明确留下“完整 servlet 异步调度拒绝/超时/取消、删除失败或文件系统故障未执行”的队列。这次沿其删除失败子范围推进，不能反称旧测试已验证双失败，也不是重新修复已关闭的签名图 N+1。历史文件上传的路径预占、持有句柄、提交/回滚清理属于其他发现；PDF累计内存、50MiB原件、多附件/来源清单容量也是独立开放风险。有限历史子项给出具体检索，不声称全仓唯一问题已穷尽。

本次不关闭以下缺口：

- Service 已生成并保存审计、Controller构造响应期间 `Files.size(zip)` 失败发生在流 body 之外；流 finally 尚未执行。未实测该路径，不在本次最小修复中补调度或所有权框架。
- StreamingResponseBody被创建不代表容器一定开始调用；拒绝调度、取消、超时、进程退出和客户端在 body 启动前断开仍需完整 servlet 生命周期证据。现有成功/中断单测只直接调用 body.writeTo，不能当完整异步链证明。
- 清理失败后的遗留临时文件、崩溃、UNKNOWN 提交及持久对账未获得自动扫描/删除或恢复授权；只记录当前失败，不承诺已持久化回收。
- 对后续代码而言，Service/Controller各自责任可继续保持；若未来实际实施磁盘 PDF 资源方案，再按既有 writeFrozenRecords/writeFrozenSummaryAttachments/appendTraceManifest 等具体职责拆分，不借本次几行修复大重构。

本结论只覆盖列明方法与路径，不算整文件完成（0），历史 unique 仍未知。全审 W2-W7、931知识/86UI候选、A12/高风险/完整矩阵、历史ZIP/text-ID索引、上传PDFOffice/导出容量、UNKNOWN/A23含已审代码，以及朋友签名页/生产弹窗样式暂停保持。没有合并、部署、恢复数据或查询/触发Actions。
