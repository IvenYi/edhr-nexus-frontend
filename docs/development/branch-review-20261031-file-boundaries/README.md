# 文件资源与公开预览边界

本轮L2基线edhr-dev@ccedd56453c02c5d3acd60aa4351809a3928e83e。PR46已人工合入，整树同b5a29fbc，无额外代码/知识/契约增量；新分支audit/edhr-dev-file-boundaries-20261031。5109路径、130迁移、442 HTTP注解/198 route仅盘点，非语义或运行完成。

主侧源码/运行确认两个medium发现：`AUD-W5-FILE-UPLOAD-STREAM-001`上传两次输入流未关闭，且摘要读取IO异常被吞成空摘要继续保存；`AUD-W3-FILE-PUBLIC-NULL-TARGET-001`可选用途null传给Set.of.contains导致公开预览500。最小修复仅FileController：两处try-with-resources，IO向上失败、不注册伪成功；MD5算法缺失为内部异常；private资格方法的入口已由orElseThrow确保实体非空，将原多余实体null判断换成真实可空用途判断，沿既有拒绝分支返回400。不新增权限/格式/大小政策、删除流程或迁移。

旧同源资源9：6真实断言红/3正，HTTP9：1真实红/8正，均0error/skip。当前资源9+HTTP9+旧FileController9+DhrFormFiles2=29执行全通过；HTTP有真实JWT/filter/MVC/磁盘响应字节，仓储是mock，不能称数据库/完整对象ACL验收。流用可观察read/close故障注入，不把Java ByteArrayInputStream的无效果close当充分证明。初版HTTP测试用了当前Spring不支持的MockitoBean，编译失败原件保留；改用当前MockBean后才执行旧红控，未改断言或产品来洗绿。

本体FINAL/not-applicable，6既有ID有限核对，知识89实际通过、303知识文件未变。通用上传150MiB/MD5和DHR受控附件50MiB/SHA256不同，不混用；不提高成熟度。当前等待全新最终质量，不能以本体或主测代替验收。源码/结构/A23及后续风险见review-notes.md与source-review.json。

整体仍W3/W4与W5交叉推进；W2–W4未审入口、W5其余安全/文件/容量、W6结构和A23全量（包括旧已审）、W7增量反查继续。旧856语言+feature1、另130SQL及历史增量均保持，当前1改2增不关闭整文件清单；unique未去重。原TaskDetail友方、生产弹窗、记录控制依赖DHRhigh/A12、四知识gap及缺文件政策不恢复。新性能仍先讨论，不自动merge/deploy/恢复，不查询触发CI。正式角色全部FINAL后实际向用户完成范围/漂移/阶段复核，再PR。
