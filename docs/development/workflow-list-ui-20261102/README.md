# 流程列表业务识别、列设置与重新分配（2026-11-02）

本轮为 L1 前端功能切片，直接修改主目录 `edhr-dev` 的未提交工作树；没有新建工作树，没有数据库结构、接口、权限或审批路径变更。来源提交为 `0bd0848bbded6d6954d62a4f924e0b2eec6623ad`。已获取远端目标 `e3e49784eda6bc01e7e5c686d6f79dc5a600d5ae` 的相关契约与流程实现无增量，本轮没有合并远端其他工作，也不代表发布验收。

## 用户可见结果

- 两个列表默认首列显示“业务类型”；业务编号、流程模板名称继续分别保留。
- 详情的数据信息与数据审计均显示业务类型、申请／业务编号及流程名称；重新分配弹窗也显示业务类型和编号。
- 两个列表左上角复用标准字段设置，支持显隐、拖拽排序和列宽调整，按用户及日志／干预列表分别保存。
- 流程干预右侧冻结“操作”列，使用“重新分配”图标及对应 Tooltip／无障碍标签。点击动作不会同时打开行详情。
- 列表动作每次打开均重新读取任务；一项当前任务直接进入既有签名弹窗，多项则先选择一项。没有当前待办、流程已结束或读取失败时明确说明，不猜测目标任务。原因、目标资格、必签和后端并发校验保持。
- 干预详情只列当前待处理任务；日志详情保留历史任务与运行日志。

## 业务类型和任务边界

| 业务 | 当前两个列表的范围 |
| --- | --- |
| 表单变更 `CHANGE` | 已接通的正常业务入口；日志含可见的各状态实例，干预只含运行中实例。 |
| 表单作废 `OBSOLETE` | 同上。 |
| DHR 汇总审核 `DHR_SUMMARY` | 原始查询明确排除，继续在 DHR 专属查询与操作入口办理。 |
| 生产表单填报／审批 | 属于生产执行引擎，不据此视为通用审批实例。 |
| 其他／未标注历史类型 | 查询并非两类白名单；如存在且有权查看，显示“其他业务（原码）”／“未标注业务类型”，不猜测成已接通业务。 |

“甲复核 → 乙批准”先只有甲的当前任务，甲完成后才出现乙。“甲复核 ∥ 乙复核 → 汇聚”可以同时有两项当前任务，分别重新分配。同一步有甲／乙两个候选人仍是一项逻辑任务，不等于两个并行步骤。并行政策范围保持记录控制审批，不扩展作业流程首版能力。

原始源码与决策出处见[本轮知识证据](../../knowledge/evidence/workflow-list-ui-20261102.md)；[决策包](decision-package.yaml)记录影响范围和验收标准。

## 实际验证及边界

以下为初版业务识别／列设置实现的历史验证；追加图标纠正后的当前验证见[图标纠正记录](icon-correction.md)，原证据不覆盖后续源码，也不删除或回填。

- `npm run build`：通过（包含 TypeScript 构建）。
- `npm run verify:list-table-style`：通过。
- `BusinessKnowledgeModelTest`：89 项，0 失败、0 错误、0 跳过。
- [受控 API 浏览器回归](evidence/browser/result.json)：26／26，通过 1440px、390px 下的单／多／无任务、结束、读取失败重试、加载、权限、历史类型、详情与审计身份、当前／历史任务、列设置与偏好隔离、实际拖动列宽、签名必填及目标任务提交绑定、30 秒缓存内重新打开刷新。
- [主环境只读验证](evidence/live/result.json)：实际 `localhost:3000` 前端和 `edhr_dev` 后端，登录 `uat_manager`，查看列表／详情／审计／列设置，打开重新分配再取消。没有提交业务操作；两个列表读取到 7 条保留申请，检查时 7 条仍为 `IN_REVIEW`，4 个 DHR 状态保持。
- 独立质量结果见 [quality-result.yaml](quality-result.yaml)，本体结果为 [updated](ontology-result.yaml)，知识基线仍为 0.3.25。

受控浏览器使用实际维护组件、主题及 API 客户端，合成接口全部拦截；该结果不替代真实后端重新分配事务或签署集成测试。本轮没有重跑先前的服务端流程业务套件，也没有消费主库人工验收样例。归档、独立 DHR 变更和打印过滤继续按原决定暂缓。

额外运行了既有 `test-generic-ui.mjs`：13／14，菜单图标保留用例在既有源码上失败（实际 `FactCheck`，预期 `asset:456`）。失败相关的 `menuManagement.ts`、`constants.ts` 和该测试均与上述 HEAD 一致，本轮没有修改；作为已有邻近问题记录，未扩大本次修改范围。

## 人工查看

正常打开 <http://localhost:3000/workflow/interventions>，刷新后查看业务类型、左上角字段设置和右侧重新分配。日志在 <http://localhost:3000/workflow/instances>。原动作／DHR 验收账号和步骤继续使用[验收说明](../workflow-dhr-acceptance-20261030/README.md)；本轮未重置既有人工操作结果。

受控浏览器重跑（需环境已提供 Playwright 和 Chrome）：

```sh
NODE_PATH=/Users/ivenwang/.npm/_npx/31e32ef8478fbf80/node_modules \
CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
WORKFLOW_LIST_ARTIFACTS=/tmp/edhr-workflow-list-browser \
node scripts/test-workflow-list-ui-browser.mjs
```

命令在 `gmp-platform/frontend` 执行；输出目录建议另设，保留本轮原始证据。
