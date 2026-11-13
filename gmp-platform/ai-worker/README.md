# eDHR AI Worker 适配候选（2A）

当前仅包含固定Worker接口客户端和DSH原生表单工具插件，不是可部署Worker进程。没有模型请求、轮询、续租调度、知识查询、预览或任务完成入口。正式应用启动需遵守DSH profile契约，见[复用评估](../../docs/architecture/ai-harness-evaluation-20261113.md)。

```sh
npm ci --ignore-scripts --prefix gmp-platform/ai-worker
npm test --prefix gmp-platform/ai-worker
npm audit --prefix gmp-platform/ai-worker
```

Node >=24.9；依赖锁定DSH 0.2.2-rc.2。测试只使用本地合成数据和替身HTTP以及真实工具注册表，不启动数据库或付费模型。

宿主提供固定origin、Worker key、服务端claim、DSH sessionId和专属持久目录。凭据不得交给模型。每任务只允许一个宿主串行使用；这个模块尚未提供多进程锁或调度。写前标记与回执核对是保守恢复辅助，不是完整崩溃一致性保证。

网络或不明结果保留pending并阻断，宿主调用reconcile查询匹配回执后解除；404不自动重试写入。明确应用4xx拒绝（不包含IDEMPOTENCY_CONFLICT）清理本次pending，修改配置后可用新调用标识重试。所有写入及恢复都使本地修订缓存失效，后续保存先读取当前对象。卸载中断本地请求，但已提交成果不会撤销，服务端资格仍是最终边界。

不记录模型推理和原始表单到pending文件，不将该文件当作用户可读操作日志。当前事件继续由Java提供；完整工具过程事件映射在后续切片实现。
