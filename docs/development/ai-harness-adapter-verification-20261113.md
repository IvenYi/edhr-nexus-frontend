# Harness适配层2A验收记录

执行级别L2，来源/目标/契约基线均为 `66fd109f24636613c4f3dc5404ca551c19a5c27b` 加本轮候选；目标 `codex/ai-experiments`。git fetch连续网络超时，已通过GitHub官方API核对远端仍为同提交，没有合并其他分支。知识0.3.25/P0/internal。

## 范围

新Node适配包、8项聚焦测试、DSH复用评估及增量知识关系。没有改Java、数据库或前端，也未连接任何数据库、模型或业务服务器。不是完整Worker交付，不宣称DSH已可商用。

## 主侧证据

- `npm test --prefix gmp-platform/ai-worker`：最终8项通过，0失败/跳过。包含真实Cordis/DSH注册与卸载，其余为适配层合成测试，不能替代Java端到端。
- `npm audit --json --prefix gmp-platform/ai-worker`：rc.2候选0项。旧rc.1安装曾报告8个Zod传播高危条目，旧实验包未升级。新候选安装过程中旧锁产生peer冲突，使用全新生成锁消除，未force安装。
- `npm ls --prefix gmp-platform/ai-worker --depth=1`：DSH依赖统一rc.2，Cordis4.1.0；可选loader/include未安装，不是运行插件装载验收。
- `git diff --check`通过。
- 初次真实注册测试的清理钩子误用ctx.dispose/ctx.stop导致失败；按实际API修正ctx.fiber.dispose后通过，未删除断言。

## 专业门禁

本体实例ai_2a_ontology返回updated，知识Maven89项通过。结果在本地 `output/ai-product-slice-2a/ontology-result.yaml`；只新增证据/实现关系，不改变业务政策。

首轮ai_2a_quality返回failed，7项独立测试和审计通过，但复现QF-AI2A-001/medium：明确400/409拒绝也被当成未知写入，任务无法纠正后继续。主侧增加受控WorkerRejection；仅确认应用错误信封时清理pending，IDEMPOTENCY_CONFLICT、网络错误、超时及不明响应继续保留。增加纠正重试与冲突保留回归，主侧8项通过；reconcile与工具调用共用busy保护。

全新独立实例ai_2a_final_quality返回qualityResult.result: passed；独立8项通过、审计0项，并额外组合真实客户端与插件核对400/普通409可修正，幂等冲突和500保留pending，关闭QF-AI2A-001。结果与13文件内容快照位于本地 `output/ai-product-slice-2a/final-quality-result.yaml`、`final-quality-snapshot.json`。本段仅归档已返回结论，之后源码、锁文件及知识未变。门禁只覆盖2A适配候选，不覆盖完整Worker或商用上线。

## 未覆盖

正式profile启动、全模型循环、Java真实HTTP连接、进程强杀、多实例、版本迁移、知识包、完整工具过程日志、预览及SUCCEEDED证据、双模型样本、容量和上线均未验证。单宿主单任务限制是当前适配候选的前置条件，不是已实现分布式互斥。未来部署需用Java资格代际与宿主所有权共同保护；默认AI关闭。
