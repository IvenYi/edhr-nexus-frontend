# 源码方法范围与拆分方案

基线 `4b25dc7f29c27cfb39c0f570b547869aa0c2f289`；只声明以下方法/分支已经核对，行号为本批定位辅助，不声明整文件审查完成。

| 入口/所有者 | 实际核对和边界 |
| --- | --- |
| `workflow/service/FormFillSettingsService.java` `usesProcess:24`、`serialize:63`、`validate:70`、`parse`、`activeBinding` | 严格模式入口，序列化不补值，validate 不早退；parse 只解析/空对象，不做历史模式迁移。原 DIRECT/PROCESS 活动配置、字段权限和签署校验保留。 |
| `workflow/controller/WorkTemplateController.java` `saveGraph:183`、`publishVersion:238`、`formProcessReferenceStatuses:634`、`validatePublishableFormProcessReferences:745` | 草稿基础格式与发布完整校验分层；GET 只读显式引用；PROCESS 缺 ID 拒绝。原节点/按钮精确诊断先于完整设置检查，版本/审计事务不搬移。 |
| `masterdata/service/ProductProcessOwnerService.java` `saveOperationBindings:295`、`toOperationRequests:386`；`masterdata/controller/ProductProcessController.java` 对应写入/复制/响应映射 | 产品与产品簇两套现存适配路径都调用共享 serialize；复制把 parse 结果带回写入。无模式读取仍不补值，新写入必须严格校验。本批仅源码映射、共享边界与既有两 suite 回归，不称所有管理 HTTP 复制组合已实测。 |
| `production/service/ExecutionSnapshotBuilder.java` `build`、`attachFillSettings:139` | 工序绑定和 WORK FORM 首次冻结调用严格 helper；显式 DIRECT 生成 entryNode，PROCESS 固定版本/图及 binding。CUSTOM 不经过此配置模式入口。冻结消费和历史读取不改。 |
| `production/service/ProductionExecutionService.java` `act` 及首次 START/审计事务；原 engine 的冻结 entry/flow 消费 | 未改生产实现。新增真实集成测试拒绝 null/空/仅休眠流程配置，execution、DHR、对象状态及审计保持不写；既有冻结/签署/权限/自动推进与回滚正反例继续跑。 |
| `frontend/src/components/form-fill-settings/types.ts` `fillMode` | 只返回明确的合法 mode，缺失无效返回 undefined；directFillVersion 继续原直接模式配置表示。 |
| 同目录 `FormFillSettings.tsx`、`FormFillSettingsButton.tsx` | canonical 共用设置与标签/弹窗所有者。未配置无选中值、无活动权限显示；打开不写，Apply 需选择；非活动配置保留，使用现有 MUI/AppDialog。 |
| `frontend/src/pages/workflow-center/WorkTemplateEditor.tsx` `persistentFlowGraph:366`、`validateFlowGraphForPublish:454`、`nodeCaption:777`、实际 save/publish 命令和新增 FORM 三入口 | 原草稿序列化不补值；前端发布明确模式错误，节点显示待配置；新增配置仍 `{}`。错误“请选择填报方式”不含“表单”，不会误入 handlePublishError 的表单失效分支。 |
| `frontend/src/pages/master-data/ProductModelingWorkspacePage.tsx`、`components/ProductProcessVersionEditorDialog.tsx` 的绑定创建与设置适配 | 原创建命令明确写 DIRECT，保留。workspace 与产品/产品簇完整 Dialog 的父路径复用相同 canonical 设置按钮/组件；未重做整页布局或主题。 |
| `frontend/scripts/test-explicit-fill-mode.mjs`、`test-explicit-fill-mode-browser.mjs` | 实际 helper/编辑器函数和实际 React 页面；浏览器 API 被受控夹具替代，不能据此宣称后端数据库 E2E。 |

上表后端路径根为 `gmp-platform/backend/src/main/java/com/zencas/edhr/`。只读前端调用报告原件在 `evidence/helpers/`；旧调用报告保留在 PR15 批次，原报告声明不作为当前 QA。

## S04/S 工作流大模块拆分提案（未实施）

1. **纯图协议与发布诊断。** 后续单独提取 `workflow-center/workGraph.ts`，拥有 `persistentFlowGraph`、连通性、出口和节点诊断纯函数；输入 graph，输出不含 UI/请求副作用的 graph/diagnostics。先固定保存重读、条件 handles、缺模式、不完整草稿、节点 ID 的等价测试，再移动函数，不能把草稿保存偷偷改成发布校验。
2. **编辑命令与唯一 history。** 提取 `useWorkGraphCommands` 只负责 addQuickNode/addConditionBranchNode/addNode、连接/删除和 undo/redo；图编辑组件仍持唯一 nodes/edges、dirty 和 history 提交。每条命令一次历史，保留选中/几何/分支 lane；模式配置继续由共用 FormFillSettings 所有，不再新造页面私有模式解析。
3. **版本发布用例。** 后端后续提取 `WorkTemplatePublicationService`，拥有读当前草稿、调用图/配置验证、发布并继承新草稿、审计的同一事务。Controller 仅做 DTO 与权限入口，不把 repository 操作拆成异步步骤；纯图校验可独立 `WorkGraphValidator`。必须用原版本生命周期、精确签署错误、发布失败零写与审计回滚测试保护。
4. **保持冻结领域边界。** 模式解析与配置校验保留 FormFillSettingsService；ExecutionSnapshotBuilder 继续固定配置，engine 继续消费冻结结构。拆分不能顺带迁移旧配置、改签署政策或重解释已执行数据。按前端纯函数→命令→后端用例的小批次推进，每批可普通 revert；不是按行数拆文件。

本批只做局部修复及必要测试，不实施上述结构搬迁；完整 S04/W6 不计完成。
