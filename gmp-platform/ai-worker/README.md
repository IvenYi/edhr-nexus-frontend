# eDHR AI Worker（2C受控表单工具）

提供固定Worker接口客户端、DSH原生表单插件、单轮驱动和过程事件。2C增加内部知识/关系查询、局部编辑、配置检查与离线原生预览；没有客户启动入口、付费模型或任务成功判定。当前边界及复现见[2C工具说明](../../docs/development/ai-form-workbench-2c.md)，前序底座见[2B记录](../../docs/development/ai-worker-runtime-2b.md)。

```sh
npm ci --ignore-scripts --prefix gmp-platform/ai-worker
npm test --prefix gmp-platform/ai-worker
npm audit --prefix gmp-platform/ai-worker
```

Node >=24.9；依赖锁定DSH 0.2.2-rc.2。npm test需前端依赖及`npx playwright install chromium --only-shell`，用合成数据、本地测试HTTP和离线浏览器；Java专用JUnit另启动真实DSH/隔离数据库链路，无付费模型。

宿主提供固定origin、Worker key、服务端claim、DSH sessionId和专属持久目录。凭据不得交给模型。每任务只允许一个宿主串行使用；这个模块尚未提供多进程锁或调度。写前标记与回执核对是保守恢复辅助，不是完整崩溃一致性保证。

网络或不明结果保留pending并阻断，宿主调用reconcile查询匹配回执后解除；404不自动重试写入。明确应用4xx拒绝（不包含IDEMPOTENCY_CONFLICT）清理本次pending，修改配置后可用新调用标识重试。所有写入及恢复都使本地修订缓存失效，后续保存先读取当前对象。卸载中断本地请求，但已提交成果不会撤销，服务端资格仍是最终边界。

不记录模型推理和原始表单到pending文件，不将该文件当作用户可读操作日志。工具开始、错误、未知结果经受控接口记录；业务保存由Java确认。知识查询记录包与请求/结果摘要；检查记录修订与问题数；预览记录Worker观测及当前修订，不等同于Java独立视觉验证或任务成功。
