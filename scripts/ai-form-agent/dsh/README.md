# DeepSeek Harness 表单 Agent 实验

在独立进程内使用 DSH 0.2.2-rc.1 的 Agent、原生工具执行器、Cordis 插件生命周期和 JSONL 会话持久化。只装配实验使用的组件。eDHR 插件复用 v3 的本体查询、业务目录、设计保存、局部编辑、语义检查与原生预览。两个模型仍走既有 eDHR 实验 API 连接，适配器从 DSH 会话生成单次请求并把响应交回 DSH。

## 运行

使用 Node.js 24.9+、现有前端依赖和 Playwright CLI。参考 [v3 环境说明](../v3/README.md)启动未修改的后端（18093）和前端（15175），后端只连接独立实验 PostgreSQL。本轮从上一轮隔离数据库复制业务字典和目录。预览通过原生模拟填报，不提交生产记录。

需要原有三份脱敏样本以及 `verify.mjs` 使用的既有 clean 草稿夹具。模型凭据从本机忽略的 `.env.ai.local` 读取，沿用实验账号和模型网络设置。

```sh
npm ci --prefix scripts/ai-form-agent/dsh --ignore-scripts
export AI_FORM_AGENT_PORT=18093
export AI_FORM_AGENT_BATCH=ai-form-agent-dsh-20261112
node --test scripts/ai-form-agent/agent.test.mjs scripts/ai-form-agent/v3/agent.test.mjs
node scripts/ai-form-agent/dsh/verify.mjs
node scripts/ai-form-agent/dsh/run.mjs debug openai clean 1
node scripts/ai-form-agent/v3/assess.mjs --freeze
for provider in openai deepseek; do
  for form in clean label scrap; do
    node scripts/ai-form-agent/dsh/run.mjs final "$provider" "$form" 1
  done
done
node scripts/ai-form-agent/v3/assess.mjs
```

调试只允许 OpenAI。冻结后六次正式运行共享工具、知识、样本、代码和依赖锁快照。若代码变更，使用新批次保留旧结果。每次调用上限和估算预算见 `provider.mjs`，估算不代表账单。会话、工具日志、快照、预览和评估留在本机 `output/`；模型侧不会获得独立评分答案。

## 权限和恢复的验证范围

每个实验进程服务一个任务。Cordis 卸载会移除工具，能力许可和任务归属决定工具可见性，插件在执行及 Java 写入前再次检查许可。任务使用隔离账号，`verify.mjs` 额外验证匿名和无表单权限账号的原生设计保存请求被拒绝。能力许可来自实验夹具。

DSH 恢复对话与工具记录。表单插件独立保存最近一次确认结果，包括模板 ID、版本、草稿和引用上下文。Java 写入开始前记录待确认标记，成功保存且写入检查点后清除。真实进程中断测试覆盖确认保存后续改同一版本，以及创建已成功但结果未写检查点时拒绝自动重放。

生产部署仍需 eDHR 的真实客户授权、用户身份委托、原子版本检查、事务内幂等和业务审计。检查点是本地进程恢复证据，跨进程部署、并发写入和人工核对流程需另行实现与验收。
