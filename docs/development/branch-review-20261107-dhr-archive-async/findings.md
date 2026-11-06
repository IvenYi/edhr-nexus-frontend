# 本批发现与关闭边界

## W6-DHR-EXPORT-UNSTARTED-STREAM-001

medium / robustness / **verified-resolved（未启动body的临时ZIP请求归属范围）**。旧Controller只在body删除ZIP；真实执行器拒绝、排队超时及取消请求后最终结束，body不运行就遗留文件。最新同字节旧源5=2正3真实文件遗留Assertion失败、0E/S；最终主侧和全新独立95/95，知识89/89、16/16必需检查passed/FINAL。

一个请求局部CAS在body/TWR与完成回调之间分配归属，完成不提前删活动流；晚到body拒绝，重复完成不能再删替代路径。元信息同步失败保原异常并清理；清理失败保留自有路径日志/附属错误，不承诺必然删除。只删本请求ZIP，不改原件、冻结、权限、审计顺序或已发HTTP结果，不恢复/扫删历史文件。

有限历史去重依据是20261105-dhr-export/review-notes.md及PR70明确保留的未启动流/拒绝/超时gap；不重开PR70错误覆盖问题，不称全历史唯一性完成。

## QF-DHR-ASYNC-NORMAL-HTTP-001

初版独立quality failed/FINAL保留原状：normal200/164但started2，Tomcat MimeHeaders/HeaderWriterFilter并发异常及二次GET。主侧仅在独立Basic测试链显式eager，保留全部五断言、一次启动标准和真实容器；新的全新实例7b68eabc实际normal仅启动1次，按**隔离测试positive-control范围resolved**。未以偶然重跑、放宽计数或改250ms使之通过。

这项有限处置不等于下面产品风险已解决，亦不将推测的客户端GET自动重试当已证协议事实。

## W6-SECURITY-STREAM-HEADER-RACE-001

medium / **open，产品JWT链待专项复现及缓存保持方案**。与上述QF共享同一来源，不记为两个产品缺陷。默认lazy在servlet返回与worker提交响应时存在并写入口，真实Basic容器异常及依赖微例已证；产品SecurityConfig共享路径但还未在其JWT/异常处理装配复现。全局eager会改变当前FileController缓存及304/reset边界，因此未直接修改产品全局策略，未借测试隔离掩盖剩余风险。详细触发和下一轮步骤见[header-risk-followup.md](header-risk-followup.md)。

pre-async外部失败、实际网络活动body中断、Error/OOM/崩溃/UNKNOWN持久对账及容量，全部原W2-W7/A23和用户暂停队列保持，不因本批通过而关闭。
