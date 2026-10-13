# edhr-dev 首批代码审查修复

## 基线与范围

本批由用户在代码审查会话中授权直接修复。目标为 `edhr-dev`，读取的代码和契约基线均为 `cb863ad83e2aca20caf86f0e78602120e8b4727f`，修复分支为 `fix/review-batch-01-20261013`。具体交付提交以该 PR 的 head 及 CI 记录为准，不将本地临时 Git 提交伪称远端提交。

执行级别为 **L2**：包含跨登录会话的数据隔离和 DHR 版本写入目标，触发本体及质量门禁。知识模型仍为 `0.3.25`，schema 仍为 `1.2.0`。本批不提升业务成熟度，不代表全分支审查完成。

已确认依据：用户授权修复 F-001/F-002/F-003；`DEC-0060-01` 要求引用查询使用正确的主表及当前行依赖；`DEC-0061-02` 要求显式模板/版本的读取与保存隔离；`DEC-0074` 的他人按钮签署不切换当前登录会话。实现选择为工程判断，不新增业务决策或替代既有声明。

## 实现和影响

### F-001：账号切换缓存

将原有 QueryClient 配置提取到 `src/utils/queryClient.ts`，App 使用同一实例。统一退出入口 `clearAuthStorage` 清理查询及 mutation 缓存；LoginPage 和认证 store 的成功登录均在安装新身份前清理。只取消客户端查询及丢弃旧响应，不宣称撤销服务端已执行的事务。

HTTP 请求同步绑定会话代次。旧会话响应在成功解包、409 提示和 401 退出处理之前被拒绝，避免旧数据回流或旧 401 退出新账号；当前会话的 401 处理保留。代次只在内存使用，不将 token 放进查询键、日志或报告。签署认证不清理业务缓存、不切换会话。

影响范围为当前标签页中使用共享 client/QueryClient 的查询；未增加跨标签页 storage 同步协议，未完成真实浏览器多标签页验证。服务器权限仍由既有后端控制。

### F-002：两个个人入口引用上下文

FormFillingPage 和 FormReviewPage 原样转发 `dependencies` 第三参数。主表与当前子表行的上下文由现有 renderer 构造；不替换为外层整表 values，不绕过后端来源授权、有效性或 AND 1=0 的保护。没有改动生产执行入口与后端接口格式。

### F-003：明确 DHR 设计版本

提取 `dhrWorkspaceVersion.ts` 纯函数，在 composition 查询前解析目标。明确指定但缺失时返回无目标并提示错误，禁止自动换版；没有指定版本时仍按现有默认/已选逻辑选择。查询和保存复用同一已验证版本 ID。

工作区按 open、模板及显式版本建立状态边界；只有响应、草稿和目标版本一致才能编辑、保存。空列表、查询错误、旧草稿不能成为隐式保存依据。已有目录查重、保存 payload、后端事务和审计语义保持不变。

### 本批结构调整边界

只提取会话缓存管理、版本解析，并分出用于隔离本地状态的工作区组件。ProcessModelingPage 的全面拆分、共享 FormCanvasPreview 迁移以及 TemplateModelingController 的事务服务提取尚未实施。不能把本批小范围提取称为 R-001/R-002/R-003 全部关闭。

## 实际验证与证据

实现者在隔离源码副本及锁文件依赖环境中执行：

| 检查 | 结果及范围 |
| --- | --- |
| `npm run test:review-batch-01` | 13 项通过；真实 QueryClient/axios、实际登录和引用页面回调、DHR 实际组件的 hook/API 边界测试 |
| `node --test scripts/test-form-references.mjs scripts/test-form-document-preview.mjs scripts/test-button-signature.mjs scripts/test-generic-ui.mjs scripts/test-dhr-workspace-navigation.mjs` | 59 项相邻回归通过 |
| `npm run verify:dhr-template-workspace` | 静态结构契约检查通过；不替代行为测试 |
| 反向控制 | 临时移除缓存清理、移除两个入口的依赖转发、重新引入显式版本回退，三个分组均产生预期测试失败；随后恢复修复源码 |
| TypeScript / Vite 构建 | 以本 PR 的 frontend-review-regression CI 对实际候选的结果及日志为最终可复核证据 |

新增只读 CI 在 PR 的实际合并候选执行上述前端回归与构建，并记录 base/head/tested SHA；既有知识 CI 保持不变。CI 尚未执行的结果不能因为配置存在就被写成通过，最终状态以运行结果为准。临时传输/应用修复的工作流不进入最终 PR 差异。

尚未执行：真实后端/数据库联调、浏览器中的双账号切换与版本编辑验收、完整端到端回归、独立新质量实例复验。API/hook 边界模拟不能替代这些验证。未运行全仓 lint 和全部业务测试。

## 知识同步和门禁

只更新 DEC-0060/0061 的当前实现差异说明及定位，保留原业务规范、历史审计及全部来源。两条差异保持 `open`，表示实现已修复但完整独立/交互验收未闭环，而非仍按旧源码运行。

```yaml
contractBaseline:
  sourceCommit: cb863ad83e2aca20caf86f0e78602120e8b4727f
  targetBranch: edhr-dev
  targetCommit: cb863ad83e2aca20caf86f0e78602120e8b4727f
  contractReadCommit: cb863ad83e2aca20caf86f0e78602120e8b4727f
  uncommittedContractPaths: []
ontologyResult:
  result: updated
  note: 主实现者同步实现差异；规范语义未改，未伪造独立本体实例。
qualityResult:
  result: blocked
  note: 当前会话无真实专业子智能体调度；自测和 CI 不作为独立质量通过。
```

未决业务问题为空；保留待决 BATCH 数量下限、当前单租户 MVP、电子签名及放行政策，不借修复作任何决定。没有迁移、生产配置或部署变更；通过独立修复 PR 交付，不直接合并到 edhr-dev。

## 合并前验收

独立验证者应先核对实际 base/head 与本记录基线，再复跑 CI 并执行：A 退出、B 登录且 B 的列表请求延迟时不得显示 A 的记录；两个个人入口主表/子表依赖变化、清空和不同行查询结果正确；DHR 指定版本缺失必须显式拒绝，正确版本读写、目标切换、关闭重开和草稿不匹配均不能误写。失败场景保留业务输入与既有服务器权限/事务边界。

PR 合并前仍需本项目要求的独立质量结果。回滚应按 PR 提交正常 revert，不强制推送、不重写共享分支历史；回滚代码不等于撤销服务器已保存的数据。