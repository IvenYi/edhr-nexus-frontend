# 共享终端按钮签署知识增量

确认日期：2026-09-26。唯一交接包：`DEC-PACKAGE-20260926-BUTTON-SIGNATURE`。读取与保留知识基线：`0.3.24`。新决策：`DEC-0074`，状态 `specified/internal`，不新增执行契约或客户/运行时投影。

## user-confirmed

- 普通按钮签署使用实际签署人的独立电子签名密码及有效认证。共享终端允许 A 登录、B 本人输入 B 账号与签名密码签署，不代登录、不借用 A 的业务权限。
- 未认证或过期只阻断并就地提示、保留表单输入，不跳设置，不在 A 会话打开 B 的个人认证设置。
- 暂仅按签署用户名 `admin` 识别内部例外，使用登录密码且免个人认证；不按管理员角色判断、不扩大到客户管理员，不免业务资格或审计约束。
- `SIGN_FIELD` 保持原逻辑：当前用户、个人认证、独立签名密码、图片、有效期、权限、内容修改失效及历史保留都不变，admin 也没有字段签名例外。
- 新决定显式局部替代旧按钮账户登录密码约定；不是整体废弃旧决策，也不是把签署身份改为会话身份。

## 局部替代与保留

`DEC-0074.supersedes` 引用 `DEC-0028` 和 `DEC-0058`，只替代 `DEC-0028-03` 及按钮选项场景中的认证方式，以及 `DEC-0058` 背景/按钮回归场景对旧认证约定的沿用。当前 `DEC-0028-03` 已原位修正，旧陈述仅见 Git 历史，相关证据仍保留；`DEC-0058-01/02` 不废弃、不改写。

`DEC-0025/0035` 的事件配置、动作前签署、稳定 fieldId 绑定、每按钮独立事件及发布快照治理保留。配置 `ACCOUNT_PASSWORD` 是交接包要求保留的既有技术枚举，不再据其名称推导普通按钮应验证登录密码；实际认证方式须如实记录。本文不把该工程映射冒充额外用户确认，也不扩展到记录控制尚未实现的认证流程。

## original-evidence

本次直接读取源码，核对起点提交 `dcbc67864147750579b8328da28c45d380798693`。主智能体在同一工作树并行实现；以下描述明确指起点，不是对最新代码、部署或测试通过的断言。

- `ExecutionAccess.signTarget`：读取 `AuditContext` 会话用户，要求输入账号与其用户名一致，校验 ACTIVE/锁定及 `passwordHash`，记录 `authMethod=PASSWORD`。这正是需要替换的按钮认证起点。
- `ExecutionAccess.signField`：仍按会话用户读取 `USER_PROFILE` 认证，校验有效期、`signaturePasswordHash` 及图片文件，记录 `SIGNATURE_PASSWORD` 和认证引用。`AuthController.verifyCurrentUserSignature` 也是当前用户个人认证入口，不能用其存在证明跨账号按钮已接通。
- `ProductionExecutionEngine.formControls/formActionInternal`：从按钮事件计算 `requiresSignature`，先用 `operator` 做节点及字段授权，再区分 `SIGN_FIELD` 与按钮签署；历史和按钮填充字段也使用 `operator`。改认证不自动解决身份贯通问题。
- `DhrReviewService.act`：共享 `signTarget`，资格、任务完成与审计原来均使用会话 `actor()`。仅登记相邻调用风险，不调整任何 DHR 汇总、冻结版本或生命周期业务决定。
- `ProductionExecutionPage` 起点按钮签署弹窗仍显示“当前操作人账户”和“账户密码”。本次只读源码，未做浏览器验收。
- `ExecutionAccessTest` 起点断言当前账号登录密码签署；`ProductionExecutionIntegrationTest` 已有字段认证、签后内容失效、份隔离及审计失败回滚测试源码。本角色未执行它们。

### 并行工作树复核

2026-09-26 随后读取的未提交差异已包含 `authenticateButtonSigner`、`ButtonSigner`、普通签名密码校验、内部例外认证标识、双身份快照、实际签署人节点/字段权限及历史归属。DHR 调用也传递实际签署人并保留会话审计，但原会话资格前置检查仍存在，不能将共享认证推断为任意 A/B 组合都可访问或审批。新增 `ButtonSignatureCredentials` 展示签署账号及密码类型并在账号变化时清空密码。以上仅是可用源码证据，不是运行或质量通过。

历史实现差异：首次核对时后端用 `equalsIgnoreCase`、前端用 `toLowerCase` 判断 admin，超出交接包的用户名 `equals admin`。该历史登记保留；2026-09-27已修复为精确匹配，关闭记录见下文，不静默放宽知识规则。

只读逐字比较确认 `ExecutionAccess.signField` 方法及 `ProductionExecutionEngine` 内 `SIGN_FIELD` 分支与起点完全相同。方法 SHA-256 为 `0ecd118eae7a87ce75eef99a7831f42bbf866cef050b045b102ccfcf5db9d6c2`。这不证明前置授权、共享流程和真实交互无回归，字段签名聚焦测试仍必需。

### 最终源码复核

2026-09-27（Asia/Shanghai）收到主智能体实现收尾说明后完成最终源码复核，以下为 `original-evidence`，不是仅复述实现报告：

| 原始位置 | 核实的当前实现 |
| --- | --- |
| `ExecutionAccess.authenticateButtonSigner` / `ButtonSigner` | 按输入账号查找实际签署人；普通账号用个人认证中的签名密码，返回 `SIGNATURE_PASSWORD` 和认证 ID；内部例外返回 `ADMIN_LOGIN_PASSWORD`，认证 ID 为空。 |
| `ExecutionAccess.signTarget` | 签名实体 `signerId/Name` 归实际签署 B，`authMethod` 使用上述真实认证方式，普通用户 `authEventRef` 为个人认证 ID。快照包含 `sessionOperatorId/Name/Account`、`signerId/Name/Account`、`authMethod`、`certificationId` 及签署内容。 |
| `ProductionExecutionEngine.formActionInternal` / `history` | 签署动作按 B 校验当前节点和字段权限；`history.operator` 为 B，额外记录 A 的 `sessionOperatorId` 以及 `signerName/Account`、`signatureId`。按钮字段填充及表单收尾传递 `actionOperator`，不改变会话。 |
| `ProductionExecutionService.act` | 原 `operator` 来自 `AuditContext` 中的 A；顶层 `AuditEvent.operatorId/Name/Account` 仍归 A，`contentAfter.execution` 包含 B 的动作历史和会话关联。 |
| `DhrReviewService.act` | A 先通过现有任务 `eligible` 门禁及业务检查；需签署时认证 B 并额外要求 B `eligible`，`completeDhrTask` 使用 B。顶层审计仍归 A，动作证据关联 A/B 和签名 ID；不是以 B 身份扩大 A 的任务访问范围。 |

新增测试源码已能定位到 `ExecutionAccessTest.buttonSignatureAuthenticatesNamedSignerAndRetainsSessionWithoutCredentials`、`DhrReviewServiceTest.signedReviewChecksNamedSignerAndRecordsBothIdentities` 及 `ProductionExecutionIntegrationTest.sharedWorkstationUsesSignerPermissionsAndDualIdentityWithoutChangingSession` 等身份断言。它们属于测试源码证据，本角色未执行、不报告通过。

2026-09-27再次复核后端为 `"admin".equals(user.getUsername())`，前端为 `account.trim() === 'admin'`，均严格区分大小写；`ExecutionAccessTest.onlyInternalAdminUsesLoginPasswordAndSignatureFieldsRemainCurrentUserOnly` 已新增 `ADMIN` 登录密码拒绝豁免断言。`discrepancy.button-signature-admin-case-scope` 按 schema 合法状态 `resolved` 表达关闭（schema 无 `closed`），关闭的是已复核修复的源码差异，不声称新增断言已经运行。历史宽匹配不进入 confirmed，当前规则仍为 `specified/internal`，不新增已验证执行契约，不改 SIGN_FIELD、其他 DHR 知识或全局版本。

## secondary-reference 与 inference

交接包的影响分析和历史知识文件用于定位与边界核对，不替代上述原始源码或本次用户确认。

以下保持工程推断，不进入 confirmed 规则：`inference.button-signature-same-node` 的精确展示节点绑定及同次字段改动按签署人权限校验方案；`inference.button-signature-scope` 的共享入口覆盖生产/DHR及工作列表发现范围不扩大的实现策略。前者不削弱已确认的“签署人须有处理权”，后者不授权新增按他人身份查询数据。

交接包另指定在现有事务中处理授权与签名，签署动作和签名归属实际签署人、审计 operator 保留会话账号，通过 `sessionOperatorId` 等快照字段关联两者；不迁移旧签名、不改冻结配置。以上是主智能体交接的工程/审计验收范围，不追加为用户确认的新业务规则。扩展路径复用 `product-core` 与 `transaction-orchestration`，认证归 `ExecutionAccess`，动作授权和历史归调用引擎，错误提示归按钮界面。

## 验证与暂缓

本体适用校验覆盖 YAML/schema、全局 ID/引用、规则事实与操作符、投影状态及局部替代边界。交接包自定义结果 `verify-signing-account/reject-action` 映射到现有 schema 的 `allow-with-governance/block`，保留原动作约束，不扩大 schema。认证阻断规则显式排除 admin，普通认证与 admin 例外不重叠。

本角色不运行 Maven，避免与主构建争用；只读诊断不替代正式门禁。主智能体现已报告本轮 `BusinessKnowledgeModelTest` 通过及六套件163项含2跳过通过，后续新增断言会与质量继续回归。实际报告复核及边界见下节；不把跳过记作通过、不把较早运行归给较晚编辑。正式知识命令仍为后端目录的 `mvn -Dtest=BusinessKnowledgeModelTest test`。后续用例、最终知识编辑和独立质量收尾由主智能体汇总，知识 `updated` 不等于功能质量 `passed`。

### 已运行测试证据与时点

2026-09-27只读使用 `ruby -r rexml/document -r digest` 解析六个现有 Surefire XML；本角色未重新运行这些测试。

- `original-evidence`：`gmp-platform/backend/target/surefire-reports/TEST-com.zencas.edhr.knowledge.BusinessKnowledgeModelTest.xml` 显示59项、0失败、0错误、0跳过，文件修改时间为2026-09-26 23:59:34 +0800，SHA-256为 `63dc15cb9f5e3b0d7a017941933fd8a5d53423ba4dc70622099ab22e75da4ed7`。证明该时点运行通过，不代表随后知识编辑已经正式重跑。
- `secondary-reference`（主智能体实际运行报告）：此前六套件163项、2跳过通过；保留原汇总，不提升为本角色独立执行结果。跳过项不作为已验证场景。
- `original-evidence`：当前 `ProductionExecutionIntegrationTest.xml` 已是后续单用例报告，1项、0失败、0错误、0跳过，修改时间为2026-09-27 00:03:33 +0800，SHA-256为 `e512d0a7bcc407e04a9b340ca71d3b4741304b6915b2e23f8bc6dbf646d02d34`。其余报告来自23:59时段，不能将它们拼成同一次新运行，亦不能用当前混合报告反证此前163项汇总。
- 新增 `ADMIN` 断言已存在于源码；当前 `ExecutionAccessTest.xml` 修改时间为2026-09-26 23:59:40 +0800，不能据其11项零失败结果断言后加的断言已执行。后续新用例及最终独立质量回归仍由主智能体完成。

本次实际执行的只读结果：

- 从 `docs/knowledge/README.md` 提取并执行 Ruby bootstrap：`Bootstrap knowledge validation: passed`，退出码 0；覆盖 schema、版本、ID、证据路径、引用及投影结构。
- `ruby -r yaml -r open3` 内联补充探针：180 份知识 YAML、228 条规则、251 条事实的版本/引用、事实操作符及 provenance 核对通过；新规则 7 组适用性条件、局部替代引用及无循环、内部投影通过。样例包含 admin 有/无认证、客户管理员有效/无效认证、ADMIN 大写不豁免及不要求签署的按钮。
- 同一探针对照 Git 确认 `DEC-0058` 除背景补充外原数据不变，字段规则、schema、执行契约、未决问题及其他 DHR 知识未改。
- `ruby -r open3 -r digest` 内联逐字比较：`signField` 方法和引擎 `SIGN_FIELD` 分支与起点相同；仅校验源码局部，不等于运行回归通过。
- `git diff --check -- docs/knowledge docs/architecture/business-knowledge-model.md`：退出码 0。未执行 Maven、浏览器、数据库或独立质量验收。

2026-09-27关闭源码差异后已重新执行bootstrap及只读补充探针，均退出0；规则事实引用、7组适用条件、前后端admin精确匹配、ADMIN拒绝断言源码、resolved状态及SIGN_FIELD方法/分支逐字不变检查通过。DEC-0058字段内容、全局0.3.24、schema、执行契约、未决问题和其他DHR知识保持不变；不将该源码/结构复核称为新增断言的运行通过。

按用户名识别 admin 是用户确认的临时边界，不能推定管理员角色可信或任意重命名账号均应豁免。账号治理、失败次数策略、真实浏览器与测试数据可用性仍需主智能体按既有规则验证，本次不引入新的身份策略、迁移、客户分支或其他 DHR 知识变更。

### 主智能体最终收尾

2026-09-27，全新独立质量实例 `01a0de7f-2c34-7853-a067-da0dfca64c07` 返回 `qualityResult: passed`，未参与修复；三项发现（精确admin识别、按钮失败清密、交接枚举）均已复验关闭。本体结果为 `updated`。知识基线与 `specified/internal` 状态保持不变，下列收尾记录不覆盖上文各阶段的历史证据。

- `original-evidence`（主智能体解析原始报告）：`/tmp/button-signature-independent-qa-surefire/` 六份XML共163项，161通过、2个条件fixture跳过、0失败/错误；其中知识测试59项通过。报告由独立实例本次运行产生，不拼接早期结果。
- `original-evidence`（主智能体执行）：最新 `node --test scripts/test-button-signature.mjs scripts/test-signature-display.mjs` 10项通过，`npm run build` 退出0（`/tmp/button-signature-build-final.log`）。生产工作台在隔离H2环境完成A登录B签署、未认证阻断保值、切换账号清密及API再读双身份验证；截图位于 `output/playwright/button-signature-uncertified.png` 和 `button-signature-shared-success.png`。
- `secondary-reference`（独立质量实例直接运行并报告）：前端10项、TypeScript/Vite构建再次通过；实际React组件的隔离浏览器验证确认个人填报失败清密且业务值/意见保留，DHR回调收到原密码但输入已清空，SIGN_FIELD保持原行为。截图为 `/tmp/button-signature-qa-personal-failure.png`、`/tmp/button-signature-qa-dhr-failure.png`、`/tmp/button-signature-qa-field-unchanged.png`；此验证mock了API及无关画布，不能称为完整业务数据库E2E。
- 暂缓范围：没有重启用户现有后端、修改其数据库、提交或推送代码；未逐页执行个人及DHR完整真实后端浏览器链。隔离测试服务和本次浏览器均已关闭。此记录仅关闭本切片的待验证缺口，不代表发布、生产部署或全系统验收。
