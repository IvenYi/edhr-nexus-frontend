# DHR导出双重失败的根因保留

L2，基线edhr-dev@2cb85492b2dbf47f5b837c565eecc5832b62b39a。PR69已人工合入且整树同5f1a0fa4，无额外代码/知识/契约增量。本轮推进原20261105-dhr-export/review-notes.md第32行明确未测的删除失败/文件系统故障队列；数据库分页方案仍待实际答复，未因merge视为授权。

确认一个medium健壮性缺陷W6-DHR-EXPORT-PRIMARY-ERROR-001：生成/审计保存失败后Service两处直接删除，以及Controller输出流finally删除，在删除也失败时会覆盖原异常。业务阻断原应携带原错误码/消息，覆盖后可能只剩通用I/O失败；审计不可用或传输中断也会丢失真实诊断。是原基线已存在的边界，非PR69引入；有限历史检索无已关闭同项ID，承接旧未测队列，不重复记PDF容量或已修文件问题。

最小修复仅两产品文件：Service私有helper在删除失败时保留原异常、附加suppressed清理错误并记录自有临时路径；Controller用JDK Closeable try-with-resources保持原输出错误及附属关闭错误。Service生成/审计失败不交出ZIP路径，流body继续向容器传播原输出错误；单独删除失败也继续报错，未吞清理错误。已写响应的字节/HTTP状态不能由此回滚，未宣称客户端一定未收到文件。成功ZIP、HTTP头、原件/摘要、冻结范围、权限及审计写入次序保持。不新增递归清扫、自动重试、文件生命周期框架、恢复或持久对账。

同字节新故障测试在旧产品13项=7正/6真失败，0错误/跳过；最终85/85通过（service7、stream6、原生导出12、FormFiles4、layout3、hash48、event2、aspect3）。19个运行输入与当前逐字节一致，两产品旧源匹配2cb Git。新故障用例以显式property启用，在独立JVM临时根运行真实Linux路径置换非空目录，模拟删除IOException；不冒称真实磁盘掉线、其他OS权限故障或生产事故。测试只移除自身blocker/路径。原三项stream断言保留，新增同时IO/Runtime输出和清理失败、仅清理失败仍报错；service含关闭异常与清理错误同时suppressed、原BusinessException/IOException/审计错误身份、正常删除和成功真实ZIP摘要。

新lifecycle测试使用mock数据库/renderer/冻结协作者，成功空记录版本只是隔离打包夹具，不能推导空DHR业务资格或真实HTTP。原生12采用完整canonical+0092真实PG/冻结完整性/原件/ZIP/PDF合并/真实审计，renderer仍mock合成有效PDF，覆盖1/10/100张表单；不声称Chromium布局或全servlet端到端。原11观察器区间33 SELECT，服务器3次成功EXPORT审计INSERT；已有11 JFR重算原件读取量一致。因原观察器无服务器逐事件tag，不把33说成全网络或逐区间SQL归因。没有本轮性能优化或容量风险关闭。

主侧Docker --rm删除初次立即观察false原件保留，随后实际inspect证实容器已消失，记录于cleanup-final-verification.json；原编排器只修为有限轮询观察删除，不改变测试/产品。run.json记录实际命令、时间及全部受测输入，当前归档run.py为后改的清理观察版，不冒称原预运行脚本副本。非产品/JUnit失败。两阶段临时ZIP无遗留，完整原始XML/日志/源与JFR见evidence，[分析](main-analysis.json)。

rule.dhr-summary-zip-source-trace及DEC-0063现有冻结/失败阻断/格式/资格保持；DEC-0090区分汇总冻结、受控归档生命周期和指定版本导出，本修复只涉及导出临时副本，不实现归档/放行能力。本体NA/FINAL，有限10=8一致/2gap、350知识及0.3.25/schema1.2/P0保持；只读源码/历史子项均FINAL。全新独立质量在clean受测a4777e9f6ef7518d8684a48516c21cf5904cff01实际85/85+知识89/89、15/15必需项passed/FINAL，无新发现或阻断，149主侧原件/19输入/双方各11 JFR及3实际EXPORT/v2绑定核验通过；质量源码子项FINAL，资源清理。见[质量结果](quality-result.yaml)、[独立复验](independent-review.md)。

全部角色及子项FINAL后已实际[PR前漂移复核](pre-pr-drift-review.md)，目标仍2cb，无外部/知识/契约增量、无任务漂移，产品/测试与受测候选相同；之后仅L0验收/台账/交付文档。W6-DHR-EXPORT-PRIMARY-ERROR-001仅按本批异常传播范围verified-resolved，不关闭临时文件生命周期和其他旧风险。

保留Files.size/响应建立失败、流未开始/异步拒绝/取消/超时、Error/OOM路径、UNKNOWN及持久对账、PDF/上传/Office容量和共享ACL/原件并发等原缺口；不扫描未知孤儿或自动恢复。整体W3/W4/W5交叉与W6专项、W2余项/W7增量/A23含已审代码、931知识/86UI候选/A12/高风险/完整矩阵和用户暂停项保持。整文件0、历史unique未知；不自动merge/deploy/恢复或查触发CI。
