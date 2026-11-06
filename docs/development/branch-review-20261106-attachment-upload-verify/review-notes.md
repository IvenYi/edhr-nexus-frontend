# 附件上传／核验：资源、事务和历史问题核对

L2，基线c4e451c264c11978515b2ae0088e64011fe2fcef；PR64人工合入、整树同a89dbd36，没有其他代码/知识/契约增量。本批只新增显式opt-in原生测试及研发记录，产品/配置/索引/规则/接口/UI未改。未确认新的正常上传/核验正确性缺陷；已取得数组分配的真实范围和失败所有权证据，性能改造尚待用户实际答复。

## 原生场景及成功／失败证据

新27例：七格式小样7，ChannelInputStream的1/10/50MiB PNG3，合成generic InputStream的50MiB PNG1，实际SQL拒绝/上传审计拒绝/核验审计拒绝/已flush外层回滚4，缺失/篡改/当前digest一致但格式损坏/解除/跨DHR/tenant/定稿核验拒绝7，禁止状态的上传+核验双动作3，50MiB+1与截断PDF拒绝2。相邻SummaryService8/Persistence24/WriteFailure5/AttachmentAndArchive13/FormFiles4共54，完整81/81，知识89/89，均0F/E/S；聚焦27也全过，不叠加为108个unique。

实际完整canonical迁移、真实Spring代理/JPA/JDBC/事务管理和文件，仅mock后台FormProjectionWorker。输入用真实StandardMultipartHttpServletRequest包装MockHttpServletRequest+自有磁盘Part，native事件记录实际StandardMultipartFile类；Part数据流本身是夹具，不是Tomcat/网关multipart解析、网络上传或HTTP/JWT/RBAC认证。完成对象及DHR状态由SQL种入，拒绝状态不认证整个生产生命周期/START；宏加密等原工程防护通过原相邻回归，不声称全部恶意文档已覆盖。

七小格式各上传PENDING、真实核验VERIFIED与人员/时间、当前下载，Files.mismatch检查原始字节完全一致，登记size/SHA相符。LINK/VERIFY动作、身份、64字符摘要字段存在和原件保留均核对；没有将其写成AuditEvent全防篡改认证。50MiB边界完整通过，+1在打开Part输入前拒绝；截断PDF在永久原件/登记之前拒绝。磁盘丢失/篡改/格式损坏时核验元数据与原件状态保留，不擅自回写PENDING或删除已登记原件。

SQL/审计失败用隔离库额外具名CHECK注入，不删除产品约束，不是模拟Java返回值，也不是实际磁盘满/网络中断。上传登记拒绝与LINK审计拒绝均真实最终回滚、只删除本次原件；VERIFY审计拒绝回滚核验状态/人员/时间，原LINK和原件保留。外层先真实flush再setRollbackOnly，SQL确已执行，最终行/审计/本次新文件均消失；无关文件保留。相关原局部写/close/清理失败/CREATE_NEW碰撞5例亦运行，不假称是原生OS故障。

## 分配、读取与解释边界

| 入口/输入 | 1MiB | 10MiB | 50MiB |
|---|---|---|---|
| 上传，磁盘ChannelInputStream | 约1.10MiB | 约10.10MiB | 约50.10MiB |
| 核验，实际登记原件 | 约1.11MiB | 约10.11MiB | 约50.11MiB |
| 下载路径校验 | 约0.08MiB | 约0.07MiB | 约0.07MiB |

另50MiB合成generic InputStream上传约100.61MiB，同一文件核验仍约50.11MiB。源码/实际Spring6.1.8与JDK21字节码确认getBytes→FileCopyUtils→输入流自己的readAllBytes；ChannelInputStream对可seek/长度不变文件可一次分配，基类流会分块累计再拼接。因此不能固定声称所有上传“两倍复制”，也不能由磁盘Part证明真实容器只有一份。上传实测读fixture N/写原件N；核验和下载各完整读取原件N；同事务数据/审计更新与文件内容保持。

这些是调用线程累计分配，非存活堆/峰值/RSS或生产并发上限。JFR只计算自有fixture/store路径与动作Java线程的逻辑读写，未含所有ImageIO缓存/驱动物理IO；夹具写后暖缓存，时间不作SLA。小七格式和大PNG不代表大Office/PDF模型堆或所有内容可视。图片现实现只选reader并读width/height及像素尺寸上限，不全解码像素；全SHA不等于全格式解码。PDF仅解析/页数/加密检查，不是完整页面渲染。

52动作128业务SELECT逐application_name与SQL完整形状匹配，52SET分列；48次成功写execute=36INSERT+12UPDATE，内含4次随后回滚（上传审计拒绝1、核验审计拒绝1、外层回滚2），另3条约束拒绝ERROR单列。Hibernate StatementInspector记录尝试，包含被拒绝审计INSERT，不当成功执行或提交。初始种数/guard场景预上传/校验断言、驱动catalog、事务及runner SQL都不能混称请求计数。每入口读数保持固定，资源风险来自数组/解析器而非本处N+1；不重开PR64已修循环。

## A23、事务所有权与具体方案

声明size和实际byte.length分别保护早期元信息/实际读入，不机械删双校验；父DHR、附件tenant/DHR/active、完整SHA和格式各有目的。getBytes/写入checked IOException前只有SELECT锁，尚无业务登记，局部write/close catch只删本次片段；CREATE_NEW开流在catch外以免误删既有碰撞文件。成功关闭后、登记/审计前注册最终回滚hook，内层返回不能提前清理。UNKNOWN保留并记录定位，清理失败保留原异常/日志；不为假设加入catch Throwable、rollbackFor或全局扫删。

当前核验byte[]让摘要与格式读取同一复制视图。若改成流式SHA后重新按可变原路径解析，会改变这条属性，不能直接替换readAllBytes。已向用户提出先仅PNG/JPEG核验用有界缓冲形成临时文件快照、校验同一快照并清理的方案：降低数组分配、额外一次临时磁盘写入，页面/核验政策不变；尚未答复，不实现。PDF/Office与上传仍独立评估，保留宏/加密、完整ZIP索引/CRC/重复/项数和展开限制；100MiB展开限额不等于Java堆上限。

长方法可在原服务内提取readAndValidateUploadBytes、storeNewOriginal、registerRollbackCleanup，由原upload继续拥有顺序/事务/审计；verify可提取validateRegisteredOriginal，但必须先解决同一稳定视图，再保留资格/状态/错误顺序。这些是具体局部候选，不为行数执行大重构或建通用文件框架。PR64提交内部上下文及旧下载资格完全保留。

## 历史去重与全审余项

AuditEvent持久化后回读重算已是W5-AUDIT-HASH-001，medium/open；原ledger含a828两条原生PG红证据。本批实际源码仍按原JSON/LocalDateTime字符串PrePersist封存，PG jsonb/timestamp会规范化；当前生产读取只输出hash，未见读时computeSnapshotHash校验。64字符存在不能证明可重算或全防篡改；去重记录原字节保留，不新增问题计数，不改格式/算法或修历史hash，不将附件SHA/DHR冻结/签署摘要混为同一对象。

知识350、0.3.25/schema1.2/P0 in-progress不变。16有限记录13明确子范围一致/3gap（两广域场景及W5既有摘要），不叠加旧批unique。7630路径仅固定盘点，整文件0/历史unique未知；931知识/86 UI、W2余项/W3-W5交叉/W6健壮性性能抽取A23含旧已审/W7增量、原high/A12/完整矩阵、PDF/大解析器/UNKNOWN崩溃/持久对账及全部暂停保持。当前待全新独立质量，全部角色FINAL后实际PR前任务漂移复核，不自动merge/deploy/恢复或查询触发CI。
