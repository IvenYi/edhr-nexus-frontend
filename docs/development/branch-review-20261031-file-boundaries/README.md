# 文件资源与公开预览边界

本轮L2基线edhr-dev@ccedd56453c02c5d3acd60aa4351809a3928e83e。PR46已人工合入，整树同b5a29fbc，无额外代码/知识/契约增量；新分支audit/edhr-dev-file-boundaries-20261031。5109路径、130迁移、442 HTTP注解/198 route仅盘点，非语义或运行完成。

已交付[PR47](https://github.com/IvenYi/edhr-nexus-frontend/pull/47)，登记时OPEN/MERGEABLE/CLEAN、待用户人工merge。实际受测17f1fad4，之后d740678d仅L0原件/验收/进度，当前只补[交付登记](delivery.json)；保护路径无变，运行证据继续适用，不冒称重跑。下一批先fetch实际合入与外部增量，再优先对象授权及跨介质失败一致性。

当前最终验收：全新独立质量对clean `17f1fad49c863761269c1937b7d5059a5ecfe9e6` 正式passed/FINAL、11/11必需检查；实际当前29/29、知识89/89，真正旧目标同最终18为7真实红11正、0error/skip，两项按[acceptance.json](acceptance.json)有限resolved。[最终报告](evidence/final-quality/quality-review.md)和[30份原件映射](evidence/final-quality/archive-map.json)保持原始输出。全部正式角色FINAL后已实际向用户完成PR前范围/漂移/阶段复核，见[scope-review.md](scope-review.md)；下文主侧“待最终QA”只作历史检查点，由本段覆盖当前状态。受测后仅L0归档/验收/交付，产品、测试、知识、契约、工具和固定清单同blob，见evidence/delivery-verification.json。

主侧源码/运行确认两个medium发现：`AUD-W5-FILE-UPLOAD-STREAM-001`上传两次输入流未关闭，且摘要读取IO异常被吞成空摘要继续保存；`AUD-W3-FILE-PUBLIC-NULL-TARGET-001`可选用途null传给Set.of.contains导致公开预览500。最小修复仅FileController：两处try-with-resources，IO向上失败、不注册伪成功；MD5算法缺失为内部异常；private资格方法的入口已由orElseThrow确保实体非空，将原多余实体null判断换成真实可空用途判断，沿既有拒绝分支返回400。不新增权限/格式/大小政策、删除流程或迁移。

旧同源资源9：6真实断言红/3正，HTTP9：1真实红/8正，均0error/skip。当前资源9+HTTP9+旧FileController9+DhrFormFiles2=29执行全通过；HTTP有真实JWT/filter/MVC/磁盘响应字节，仓储是mock，不能称数据库/完整对象ACL验收。流用可观察read/close故障注入，不把Java ByteArrayInputStream的无效果close当充分证明。初版HTTP测试用了当前Spring不支持的MockitoBean，编译失败原件保留；改用当前MockBean后才执行旧红控，未改断言或产品来洗绿。

本体FINAL/not-applicable，6既有ID有限核对，知识89实际通过、303知识文件未变。通用上传150MiB/MD5和DHR受控附件50MiB/SHA256不同，不混用；不提高成熟度。主测完成时等待新最终质量，现已由上文独立结果闭环。源码/结构/A23及后续风险见review-notes.md与source-review.json。

整体仍W3/W4与W5交叉推进；W2–W4未审入口、W5其余安全/文件/容量、W6结构和A23全量（包括旧已审）、W7增量反查继续。旧856语言+feature1、另130SQL及历史增量均保持，当前1改2增不关闭整文件清单；unique未去重。原TaskDetail友方、生产弹窗、记录控制依赖DHRhigh/A12、四知识gap及缺文件政策不恢复。新性能仍先讨论，不自动merge/deploy/恢复，不查询触发CI。正式角色全部FINAL后实际向用户完成范围/漂移/阶段复核，再PR。
