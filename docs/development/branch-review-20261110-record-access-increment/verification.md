# 实际验证及证据边界

## 主侧

`final/` 九类合计 **127 / 127，0 failure/error/skipped**。其中 RecordControl 原生 PG 69（原 66 + 容量 3），ProductFamilyTransfer 原生 PG 23，其他包含 H2、单元/静态与 MockMvc，不能统称 127 项真实 PG 或完整 HTTP。其余：RecordControlAccess 10、CurrentDatabaseBaseline 1、ProductionControllerAuthorization 5、WorkOrderCloseAtomicity 5、DhrReviewLifecycle 6、ProductFamilyMembership 5、ProductionExecution 选定的转办 3 项。

自有 PG16 隔离数据库，沿用 `edhr_record_control_test_*` / `edhr_family_transfer_test_*` 严格环境门槛，canonical Liquibase 至 0092。容量测试需显式 `-Dedhr.audit.recordReadCapacity=true -Dedhr.audit.recordReadOutput=<own-dir>`；收集真实原 SQL 的 auto_explain。未放宽 guard、删除断言或向共享库导入/恢复。运行脚本、完整命令/时间、源码快照、XML、Postgres/Maven 日志、12 观察及 24 计划在主包。40 实际输入均与 clean `0f5d4354` 逐字相同。

Tomcat 在 H2 执行夹具中使用临时端口启动，退出后端口关闭；API 断言是 MockMvc，不称真实 socket 业务访问。八表摘要等值断言通过，测量 application_name 标签下 24 条业务 SELECT、无 DML；摘要未序列化，不能补写原始 hash 值。

前端实际执行生产 build、列表样式、外部字体检查通过；真实组件 + 合成 API 浏览器 **58 workflow + 11 人员**通过，包含窄屏/桌面原始截图，不是生产环境真实签署。只创建自有 ignored Playwright 依赖软链，无 package/lock 更改。初始 Playwright 依赖/浏览器缺失日志保留，正确指定本机 Chromium 后才有实际通过。

premium strict 同一工具对旧 `2dc6941e` 与当前 UI：双方 **86 = 72 violations + 14 unresolved**，新增/消失均 0。`npm run lint` exit 2，原有缺 ESLint 配置。二者**没有通过或关闭**，不属于本批新回归，仍进入全审队列。不能因局部测试绿而写“全部静态检查通过”。

v2 发现父侧工具副本比云技能原件多一个末尾 LF；差异原样保留，并实际取完全相同的官方字节重跑，仍是同一 86 项。没有把有差异的工具摘要写成逐字一致，也没有为通过而改规则。

## 失败历史原样保留

| 时点 | 实际结果 | 原因/适用性 |
| --- | --- | --- |
| focused | 3 / 0F / 3E / 0S | 新容量 fixture 克隆了重复幂等键，测试数据错误；修正唯一键，不是产品 bug。 |
| retry | 127P | 目标任务早命中布局；未知 business_key 仍在。只保留有限读查询观察。 |
| verified，594a | 127P | 目标后入布局，但业务身份尚未正确克隆。不能作为最终身份完整性验收。 |
| 独立 v1，594a | **failed / FINAL** | QF-RECORD-ACCESS-001 medium：PG 忽略不存在的 business_key，保留旧 business_id；独立 SQL 证明。虽 127/89 与 UI 全过，正式结果仍 failed。 |
| 主侧 final | 127P | 两处改实际 business_id，追加 20 目标/背景 M 关联断言，按 0f5 字节重跑。 |
| 全新独立 v2 | 见本目录正式质量报告 | 修复后由未参与修复实例固定 clean 候选另行运行；不覆盖 v1 failed。 |

本体初轮实际知识 89，通过结构/引用/投影检查，不代表全量语义；最终 NA 仅做相同知识与夹具差异的来源绑定，没有重复声称执行。v2 的独立运行/复用项目逐项以其报告为准。

## 证据及交付

主侧、ontology、v1-failed、v2-final 分四个 ZIP，所有普通文件逐成员 SHA-256 及 ZIP SHA-256 记入 `evidence-packages.json`。各专业实例自有 manifest 另外验证；初版 failed 与本体原594a原件均保留。真实原件在各包内，不依赖 `/tmp` 链接长期存在。

全部专业实例 FINAL 后才做 PR 前任务范围/阶段复核与 fetch。后续 L0 归档不改变受测 40 输入；不查询/触发 Actions，不自动 merge、部署或恢复。建议只按本批测试和证据范围评估合入，不作为全部审计完成证明。
