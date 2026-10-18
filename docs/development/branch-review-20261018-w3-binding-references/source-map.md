# 方法覆盖与所有权

基线 ca98ab2897990eba30bf1433134aa8560578f562。只声明下列方法/分支亲读，不宣称整文件或全分支已审。后端根为 `gmp-platform/backend/src/main/java/com/zencas/edhr/`，前端根为 `gmp-platform/frontend/src/`。

| 入口 | 核对和所有权 |
| --- | --- |
| 后端 `workflow/controller/WorkTemplateController.java` `saveGraph` | 原锁、草稿状态、图边界、写入、引用投影和审计顺序不搬移；在图赋值前接入已提供活动引用检查。原发布精确签署错误先于完整共享校验，不改。 |
| 后端 `workflow/service/FormFillSettingsService.java` `validateDraftBindingReferences`、`bindingReferences`、`validateConfiguredBindingReferences`、原 `validate` | 共享组/事件/真实字段集合。有限草稿入口仅检查可取得上下文的已提供引用，严格validate仍校验主体/按钮、所有必需签名及可用signature资格；不扩大为草稿发布完整性。 |
| 后端 `masterdata/service/ProductProcessOwnerService.java`、`masterdata/controller/ProductProcessController.java` 写入/复制→serialize→validate | 两个既有工序保存适配不放宽完整校验，共享内部引用提取改变需回归原正反例。未验证所有管理HTTP复制组合。 |
| 后端 `production/service/ExecutionSnapshotBuilder.java`、`ProductionExecutionService.act` 与原 engine 消费 | 未改生产代码，已有首次START、冻结、权限、签署、事务和CUSTOM测试继续跑；不声称原生PG并发全矩阵已覆盖。 |
| 前端 `components/form-fill-settings/FormFillSettings.tsx` 元数据queries、字段设置按钮及明确onSave | 两种模式共同纠正入口，当前key元数据success才可提交；确认命令同时prune字段权限及事件，不加自动effect；休眠配置保持。 |
| 前端 `components/form-fill-settings/FormFieldPermissions.tsx` `pruneFieldPermissions`、`pruneEventBindings`、`FormPermissionConfigDialog` | 原纯函数和Dialog不修改。读取完整draft但只展示当前组/字段的特征，解释为什么外层明确保存需prune隐藏失效项。 |
| 前端 `pages/workflow-center/WorkTemplateEditor.tsx` `updateSelectedNode`、表单选择/清除、流程升级、`saveGraph`请求/失败 | 图配置合并、父级history/dirty和保存所有权保持。backend拒绝后可使用现有字段权限确认路径；本批没有重写选择异步机制。 |
| 前端 `pages/master-data/ProductModelingWorkspacePage.tsx`、`components/ProductProcessVersionEditorDialog.tsx` | workspace及产品/产品簇完整Dialog复用原共享组件，绑定新增显式DIRECT保持，未改页面适配或保存协议。 |
| `frontend/scripts/test-binding-reference-confirmation-browser.mjs` | 实际canonical React/MUI配置确认，后切换输入夹具+受控GET；两模式/两视口、取消、延迟、503失败、有效/休眠保留，不冒充完整父页HTTP切换。 |

原始只读辅助报告及25/18个源码文件的基线SHA在evidence/helpers，报告不代替独立QA。H009/H010的newDraft/copy-to-draft旧结构旁路仅作后续线索，没有把只修saveGraph称为全面关闭。

## 大模块拆分提案（未实施）

1. WorkTemplateController后续独立提取`WorkGraphValidator`，只负责边界/出口/旧字段形状与结构诊断，不读写版本；`WorkTemplatePublicationService`持有草稿发布、继承新草稿、引用投影和审计的同一事务。不能把DEC-0009草稿门槛与发布门槛合并，也不能把controller行数当缺陷。
2. WorkTemplateEditor后续分离纯graph协议/诊断和`useWorkGraphCommands`，保留父级唯一nodes/edges/history/dirty提交；表单/流程选择若改为异步原子命令，必须先固定延迟、取消、过期响应、快速换选和保存失败回退测试，不另建页面私有权限解析器。
3. 共享填报设置继续是配置界面所有者，FormFillSettingsService继续是服务端模式/活动引用和严格校验所有者，快照/engine继续各自冻结与执行所有权。本批仅在同一小service提取共享引用集合以避免两条检查漂移，不实施上述模块搬迁。

后续拆分按纯函数→命令→事务用例小批推进，以完整图保存/undo/版本继承、精确签署错误、发布/审计失败回滚保护，可普通revert；不顺带改业务政策或迁移历史。
