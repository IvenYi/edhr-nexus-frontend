# 修复后全新实例独立验收

受测候选 `a9ecd501a9abf354df95df2a1a01e53474a41a2d`，tree `fa331993fda482384146074b2b815a4f3ed7f5bb`；目标 `edhr-dev@ca98ab2897990eba30bf1433134aa8560578f562`。本实例及其只读扫描辅助未参与实现、测试夹具或知识修复；没有修改 tracked 文件。正式结果只覆盖 AUD-H004 切片，不能替代主会在 FINAL 后、创建 PR 前应向用户完成的任务漂移复核与整体进度汇报。

## 判断

本次适用检查通过，未发现新的交付缺陷。首轮正式 failed 原件保留；QF-W3B-001 已由当前源码及本轮实际反例复验关闭。当前知识版本仍为 `0.3.25 / schema 1.2.0`，没有提高 specified/internal 或 P0/in-progress。

原 DEC-0023-08 与 permission-default-exception-design-v2 明确允许“清理或阻止保存”。DEC-0035 定义当前权限组和稳定 fieldId；原 buttons-events-v2 要求事件来自所引流程、字段来自所选表单。有限草稿 guard 与明确确认命令符合这些已有依据，没有以当前实现倒推新政策。DEC-0009 的不完整草稿与 DEC-0067 活动/休眠隔离仍保留。

实际源码检查了三个生产差异的全部变更及相邻方法：WorkTemplateController 的 guard 位于 nodes/edges 赋值、save、引用投影及审计之前；FormFillSettingsService 共享引用集合保持严格 validate 原主体、按钮和全部适用签名资格检查，草稿只检查提供的引用，不强制缺失必需签名完成；UI 使用当前 query key 的成功元数据，在既有明确保存命令同时 prune 权限和事件，无打开/取消/失败自动清理。产品/产品簇严格 serialize→validate 路径未放宽，父页面仍持有状态和保存责任。没有数据库迁移、历史恢复、冻结消费者、CUSTOM 或执行引擎生产变更。

## 根因反例与修复复验

独立在 `/tmp` 编译 ef07 原 FormFillSettingsService，使用同一个真实 controller/service 探针，复现 `{}`、JSON null、JSON 字符串三种已存在 PUBLISHED FORM_PROCESS 元数据被提前 return 放行：图改变且版本/投影/审计各写 1 次；数组和语法错误对照拒绝。当前 a9ec 编译类的同探针 6 输入全部拒绝且图不变、三种写均 0。探针只改变输出 head/文件标签，没有降低断言或修改受测源码；实际是 repository mock 计数，不是 HTTP/数据库原子性 E2E。

新增 controller 的 4 结构循环回归实际通过；两模式的过期组、字段、事件及事件字段引用拒绝，合法默认/例外、休眠数据及未完成上下文正对照通过。无引用不读元数据、仓储异常传播、缺签名允许草稿但严格发布拒绝均通过。多个循环输入不扩写为多个 JUnit testcase。

同一新增浏览器脚本独立使用 ca98 原共享组件时，首 DIRECT 案例因残留 `start:removed` 真实失败，exit 1、page/console errors 均为空；其余 5 案例未运行，不计失败。当前候选的 6 案例全部通过。

## 本轮实际执行

- Java 原 10 suite：303 项，300 实跑通过、3 既有条件跳过、0 失败/错误，实际 Maven exit 0；真实 `build:dhr-print` 前置已执行，没有 exec.skip。89 知识检查包含在 303 内，不相加。
- Node 三个既有脚本：13 通过，0 失败/跳过。
- 新共享浏览器：6 通过（两模式 × 1440/390、流程详情延迟、表单 503）；正常场景 console 0，故障场景恰好 1 条预期 503 网络 console，全部 page errors 0。
- 原模式邻接浏览器：5 通过，page/console errors 0。其 Work 案例只证明模式原行为，不冒称新清理链。
- 独立真实 WorkTemplateEditor 父适配探针：DIRECT/PROCESS 各 1 场，确认→真实父级状态→graph PUT→reload，精确核对活动组/字段/事件被清理、合法默认/例外及休眠配置保留、只写 1 次；打开取消不改 dirty 或写请求，重开不写。受控 API，不是认证后端/真实数据库 E2E。
- `npm run build` 实际 exit 0；`npm run lint` 实际 exit 2，缺 ESLint 配置，未称通过。
- 206 YAML 实际独立解析，排除 schema 字段描述后 2525 业务资产 ID、重复 0。正式 schema/引用/投影/路径/状态检查来自本轮 89 个知识测试。
- 官方 37716 bytes auditor 对仓库根 ca98 archive/a9ec 同范围 strict 扫描均 exit 2，各 84 项（71 violation、13 unresolved）；完整 finding 多重集合逐字段相同，新增/移除均 0。该比较通过不等于全站 strict 合规通过，也不混用 frontend 子目录分母。
- 本实例实际查看 390 窄屏配置弹窗、1440 流程配置弹窗和 Work 父页重开截图：文字及当前操作可达，没有页面横向溢出；保留既有 MUI/AppDialog 视觉，没有新增视觉系统。upstream/premium 技能及 canonical/verification 参考已实际读取。

## 完整性及剩余边界

2224 个当前 tracked 文件前后 bytes/SHA 不变、HEAD/tree/target 不变、工作树 clean；19 份原审查 CSV、PR16 的 53 文件、首轮 48 份 receipt 原件及 PR16 独立 21 份 receipt 原件均匹配。工具 wrapper/settings 仅取哈希，未展示或归档内容；原 Maven 日志和 XML 含认证材料的风险由白名单摘要隔离，不能归档原文。

后端集成实际 H2 PostgreSQL 兼容模式，非本轮原生 PostgreSQL；三个既有条件跳过为 formRecordsBrowserFixture、firstStartFreezesOneCommittedConfigurationDuringProcessRebinding、browserEvidenceFixture。未承诺全站、全部管理 HTTP 复制、原生 PG 并发或认证 DB 浏览器矩阵；本改动无新表/迁移/事务位置变动，guard 的失败零写由真实类探针和测试证明，原冻结/事务回归继续执行。

初始 2118 路径清单全部 pending/inventory-only；代码切片通过不是全分支审查完成。完整 W2 尚未完成，W2/W3 可交叉；H009/H010/AUD-H012 等完整 W3 仍待核对，A12 与依赖记录控制的两项旧 DHR high 按用户决定暂缓。主会的 PR 前范围复核及用户汇报尚属下一步骤，本实例不替代、不提前宣告该步骤已完成。全站 84 项与 ESLint 缺配置保留为既存限制；没有降低断言、移除 required 业务场景、修改扫描器或为了全绿改业务。

本验收及只读辅助全部子任务、Maven/Node/build/lint、浏览器及探针子进程已结束；最终工作树仍为上述候选且 clean。最终质量结构和安全产物收据见同前缀 quality-result.yaml、validation-summary.json、metadata.json 与 receipts.json。
