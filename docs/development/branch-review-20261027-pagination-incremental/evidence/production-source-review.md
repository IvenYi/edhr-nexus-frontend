# 生产增量只读源码证据（非正式独立验收）

- 状态：FINAL；未修改仓库代码、测试、知识或 Git。
- 仓库：`/workspace/edhr-nexus-frontend`。
- knowledgeBaselineVersion：`0.3.25`。
- contractBaseline：sourceCommit / targetCommit / contractReadCommit 均为 `1579c06c20e1382705362001278ae514583e9853`，targetBranch=`edhr-dev`，uncommittedContractPaths=`[]`。
- 增量对比起点：`66b89eafa97a82b2080afd4f60a468d3f6824458`；新增生产界面提交 `a32d8d761293661cc3209342512050e96bba3ba7`、`af1e024442faf0f9cfce106624a2aabbb64e2320`。
- 已读取 AGENTS、codeplzreadme、统一交接契约、knowledge README/open-questions、当前 production 规则、batch-process 确认证据及对应 decisionPackage。本文不是 ontologyResult / qualityResult，也不是整文件审计完成证明。

## 亲读范围及结论

1. `frontend/src/components/ProductionObjectEditDialog.tsx:9–47`：查询、数量上限、可提交判断、共享更新命令、成功失效缓存与关闭。新增对 missing allocation / 查询失败 / 后台刷新 / 制程身份缺失 fail-closed 符合既有规则。计划量20、已分配15、本对象4时 max9，0.5合法而9.0001越额。SN数量输入禁用；后端仍强制1。
2. `frontend/src/pages/production/WorkOrderPage.tsx:407–425`：对象/候选/预览读取。预览按当前所选来源 workspace 读取当前配置，没有拿它冒充已开工快照。
3. 同页 `440–446,458–516`：批量提交、有效分配、剩余量、手动/批量候选生成、固定生产形态。新 splitDataReady 阻止加载或刷新中提交；未改变 CREATED/IN_PROCESS 子对象资格。新页签状态不持久化生产状态。
4. 同页 `517–565`：Excel/CSV 导入、空值、SN=1、重复编号、时间、分配校验、异步候选追加；发现下述两个原有缺口。
5. 同页 `639,714–777`：已拆分编辑入口、当前弹窗关闭与最终提交。`canSplit && item.status === CREATED` 只决定入口，最终资格依赖服务端；未自行修改用户暂缓的布局设计。
6. `frontend/src/utils/productionAudit.ts:87–136`：原始内容解析、字段排序与冻结快照详情移到 processReference；同条原件仍直接作为 details，缺引用时保留 processSnapshot 行，未回查当前主数据重建。新增4项测试覆盖此直接变换，但不是服务器审计不可变性证明。
7. `backend/.../ProductionService.java:50–116,214–239,289–315`：实际 split / splitBatch / updateObject / processOptions / requireApplicableProcess。父工单→对象锁顺序、对象 CREATED 且无 execution、父工单 CREATED/IN_PROCESS、形态固定、BigDecimal >0且最多4位、额度、SN=1全部仍在服务端实施。
8. `backend/.../ProductionObjectController.java:50–99,143–188,218–230`：更新、整批事务、响应、审计前后像和候选来源；当前新增前端不改变这些契约。`ProductProcessController.java:177–186` 实际 workspace GET 无单独 master-data `@PreAuthorize`，故不能凭前端调用这个路径直接断言生产用户必然403。

## 候选 A：合法小数导入被浮点合计误拒（原有）

- 定位：`WorkOrderPage.tsx:557–559`。
- 触发：批次形态、还可分配 `0.3`，CSV含两条数量 `0.1`、`0.2`。
- 预期：两条均大于0、最多4位小数，合计0.3，进入待提交清单。
- 实际：原函数合计 `0.30000000000000004`，以大于0.3报超额，清单未加入。
- 真实函数证据：用 TypeScript AST 提取当前 `importPendingObjects` initializer，不改函数体；`transpileModule` 后在 Node VM 注入真实 `xlsx`，调用实际 CSV 解析链。控制台实际输出：
  `events=[["导入失败：导入数量合计 0.30000000000000004 超出剩余可分配数量 0.3","error"]], state=[]`。
- 历史去重：`git show 66b89eaf:gmp-platform/frontend/src/pages/production/WorkOrderPage.tsx` 中相同 reduce/compare 已存在；不是这两笔新增提交造成的回归。在本次亲读的 production-growth/incremental 性能记录中未发现已登记该小数缺陷，不等于证明所有历史台账均无重复。
- 反证：后端 BigDecimal 校验正确，没有放宽后端额度的理由。修复应按既有最多4位小数语义做精确数量处理，不应随便加 epsilon 接受真正超额/超精度数据。
- 限制：已执行真实函数体的 Node/真实解析器验证，未执行真实页面/PG；不称完整端到端。

## 候选 B：离开工单后的旧导入回调污染新工单待提交清单（原有）

- 定位：`WorkOrderPage.tsx:517–520,543,559–564`；打开新对象对话框重置在 `477`，关闭按钮 `768` 仅由 `split.isPending` 禁用，没有导入任务状态/代次。
- 触发：在工单A选文件，`file.arrayBuffer()`尚未完成时关闭；打开工单B；旧读取完成。
- 预期：A导入结果只能进入A本次仍有效的编辑会话，离开后不能追加到B。
- 实际代码：旧函数闭包仍使用A的制程/形态/额度/旧清单，而 React setter 更新当前共享 `pendingObjects`，会追加到B当前清单，并把B切到导入/待提交页签。
- 真实函数证据：同上提取原函数体，延迟真实 CSV buffer Promise；在读取完成前模拟B当前清单 `B-pending/PROC-B`，旧闭包保存 `PROC-A`。实际输出：
  `events=[["已导入 1 条待添加记录"]]`，
  `state=[{objectNo:"B-pending",processVersionId:"PROC-B",targetQuantity:"1"},{rowNumber:2,processVersionId:"PROC-A",targetQuantity:"1",objectNo:"A-OLD-CALLBACK",...}]`。
- 后端反证和影响边界：不同产品/不适用制程时后台会阻断；但A/B同产品且A制程对B同样合法、编号未占用、B额度充足时，这些业务校验不能识别“候选原来来自A UI会话”，因此不能据后台校验宣称无风险。本次未实际提交到真实服务，不声称已证实落库。
- 历史去重：66b89旧函数同样 await 后直接追加，当前新增的是切回待提交页签，并非根因首次引入。
- 建议下一步：主审用真实浏览器延迟 File.arrayBuffer 复现关闭A/打开B，另测同一个工单关闭再打开、并发两次导入、读取失败、换制程期间导入和已提交期间导入。最小修复宜绑定工单编辑会话代次/取消旧结果，不能以简单比较工单ID掩盖同ID重开；候选合并前还要按最新清单重新核对额度/重复，而不是无条件信任旧闭包。

## 健壮性及性能（仅候选，不实施）

- `WorkOrderPage.addPendingBatch:505–513` 的 `Array.from({length:count})` 无工程分批上限，SN数量/按批次数可很大；CSV同步 XLSX 解码及 rows 多轮复制/重复编号 findIndex+some 为二次级候选。实际工单计划量上限远大于合理单次 DOM 清单，存在 UI 主线程/堆内存风险。尚未量化容量/延迟，不设置新业务上限，不直接改性能方案。
- 后端 `ProductionService.splitBatch` 逐条 split、split 与 processOptions 重复 objects/上下文读取，沿用既有 `PERF-PRODUCTION-SPLIT-REPEATED-SCAN-001`，不是新问题或新解决；现有 growth 报告已量化三角和读取，此轮没有重跑计量。
- `ProductionObjectController.toOption` 按候选逐条 route、DHR、snapshot identity 查询，`toResponse`按对象读取版本/产出；有源码N+1候选信号，但本轮未测 SQL，不给运行次数/时延承诺。
- 无证据表明本次 front-end placeholderData 修改优化了这些后端负载，也不能把新增分页 UI 当作后端数据库分页已经修复。

## 长模块的具体拆分建议（未实施）

`WorkOrderPage.tsx` 当前781行，重要的是它同时拥有列表、表单、分配、导入、批次命令、预览和审计。建议小批提取：

1. `parseProductionObjectImport`：只负责真实工作簿/列别名/日期/合法原始值解析，输入明确形态和所选制程，输出带行号候选或错误；保留SN旧备注兼容、必填字段和非法值拒绝。
2. `useProductionObjectDraft` 或同作用域 reducer：拥有 workOrderId + 编辑会话代次、pending、导入 pending/result 应用和关闭失效。提交、重开、清单追加与候选额度检查在同一所有者中协调；不能把异步导入继续留成跨会话闭包。
3. 批量候选生成纯函数：按次数/每批数量/SN固定1和最后余数生成，精确4位数量并先验证日期、编号与规模；事务与服务端命令仍由现有 owner 持有。
4. 只有已量化性能方案另经用户讨论后，再评估服务层 `splitBatch` 持锁上下文复用；绝不拆成逐条独立提交。

这些是方案而非本次修复许可或已完成抽取。必要回归应保持不同制程候选同工单同形态、合法小数、重复编号、退出重开、读文件失败、原子提交/回滚和首次START冻结。

## 附带测试盲区

- `test-production-object-edit.mjs` 的6项新增 Node 测试对真实组件转换后注入状态/query hooks；覆盖 missing allocation、max9/0.5、fetch/error阻断、缺身份、旧引用、SN/非法数字，但不执行真实 QueryClient、MUI输入、网络状态竞态和后端锁。
- `test-production-audit.mjs` 的4项覆盖真实变换结果、不制造冻结配置、同版不同内容、缺引用详情；不证明审计数据端到端写入。
- `test-work-order-template-browser.mjs` 当前源覆盖 SN1440/BATCH1440/SN390、下载/导入/兼容/提交；本实例未重跑，不把旧报告当本次结果。其 fixtures 即时完成 File read，未覆盖小数合计或跨工单导入会话。
- 本实例没有执行 build、完整Node、浏览器、PG或最终独立验收。主审仍需按实际交付范围执行适用验证。
