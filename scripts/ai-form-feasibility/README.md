# 隔离的三表实验脚本

只用于本地可行性研究，不是产品 AI 服务。结果与限制见 [实验报告](../../docs/experiments/ai-form-feasibility-20261112.md)。不修改产品页面。

## 依赖与隔离

需要项目 frontend 已安装的 ExcelJS、esbuild，Node，Java/Maven，本地 PostgreSQL。将当前 backend JAR **单独**连接一个新实验库，在 `127.0.0.1:18091` 运行；不要把该端口指向现有业务库。脚本使用该新库的初始化测试管理员；没有生产配置发现功能。浏览器检查使用原生前端的独立端口 15173，代理到 18091。

本机 `.env.ai.local` 设置 `DEEPSEEK_API_KEY`，文件由 `.env.*` 忽略，权限应为 0600。密钥只在请求内存中使用；脚本不会打印密钥。不要将该文件加入 Git。OpenAI 不参与本实验。

## 运行

在仓库根目录执行（需要自备空白/脱敏原件，按清洁、标签、报废顺序）：

```sh
node scripts/ai-form-feasibility/prepare.mjs '/path/清洁.xlsx' '/path/标签.xlsx' '/path/报废.xlsx'
node --test scripts/ai-form-feasibility/compile.test.mjs
node scripts/ai-form-feasibility/run.mjs 3
node scripts/ai-form-feasibility/run.mjs 1 --enhanced
node scripts/ai-form-feasibility/assess.mjs
node scripts/ai-form-feasibility/edit.mjs
```

`run` 两个命令会调用收费 API 并创建模板，普通模式 A/B 各三次；enhanced 为 C 组推理模式，每张一次。run 在协议一致时跳过已有 result，协议不同时直接拒绝且不覆盖旧证据；重跑实验应使用另一个隔离库并保留原证据后更换输出目录，不要删除失败结果冒充首次成功。`edit` 是一次性的改名延续验证，需要 `clean-C-1` 已成功写入，重复运行相同模板编码会被后端拒绝。

`--replay-bootstrap` 仅用于本次已经记录的空默认设计误判恢复，要求原 input/tool 哈希一致。当前工具协议修正后不能用它重放旧请求。不要把重放算成新增模型样本。

输出在 `output/ai-form-builder-v1-20261112/experiments/`，不纳入 Git。`assess` 是独立验收脚本，**禁止把它、assessment、旧配置脚本或标准答案作为模型输入**。评估统计核心填区覆盖而非完整准确率；投影值为合成数据，不代表真实引用授权/签名/生产提交。

本轮 21 个结果由 v1 协议产生。本轮发现原生单元格画布不支持分数 box 后，当前编译器已改为拒绝分数布局及范围重叠；原报告数值不能当成当前修正版协议重新跑出的结果。复杂原件尚需表格拆分能力，当前工具遇到这类情况应返回失败或未完成，不应生成重叠后宣称成功。
