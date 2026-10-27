# 登录并发、错误恢复与委托解释审查

已交付 [PR34](https://github.com/IvenYi/edhr-nexus-frontend/pull/34)，目标edhr-dev，创建时OPEN/MERGEABLE/CLEAN，等待用户人工合并。受测810e73f5之后仅L0原件/范围台账及PR登记，产品、测试、知识保持；隔离PG已按确切ID停止并确认自动移除，临时基线工作树已清理。下轮先fetch，不能将PR创建当作已合并。

目标 `edhr-dev@00b98f8cf3ca8a3696e15d1ffac2b3b766314f2c`，PR33已人工合入，树同交付 `b1eaac8c`；开始及收尾fetch均无其他增量。执行级别L2，登录安全及事务门禁；本体审前评估已FINAL/not-applicable，全新独立对 `810e73f585608e2e86d8bb8c51f6cb41f8deb5f4` 正式passed/FINAL，13/13必需检查通过。当前是整体审计的有限切片，不是完整W2/W3/W5或全分支通过。

## 实际整改

1. **AUTH-CONCURRENCY-001 / high**：同账号并发两次错误密码都读取旧计数0，分别写1，绕过按实际失败次数达到阈值的锁定。原生PG可控竞争复现。登录改用账户行级写锁并在同事务中读取、判断、保存；其他账号可独立完成，不用全局锁。既有阈值/锁定时间/成功清零不变。
2. **AUTH-ATOMICITY-001 / medium**：正确密码后登录日志失败返回500，但此前清零和lastLogin已经提交。现同事务回滚。仅专用 `FailedLoginException` 豁免回滚以保存正常拒绝密码的计数；不对所有业务异常豁免。
3. **LOGIN-RECOVERY-001 / medium**：登录401被全局失效跳转拦截，重载后错误及用户名丢失。仅公开登录请求设置既有 `skipAuthRedirect`，保留本页错误恢复；受保护API全局行为不改。
4. **DELEGATION-COPY-001 / low**：普通生产表单审批帮助文字仍宣称转办受节点候选约束，违背DEC0081。纠正为同租户正常可用的其他用户、必须原因；RECORD_CONTROL分支、DHR和运行策略保持。

测试、修复与正式验收分开登记；四项整改已按[acceptance](acceptance.json)及[正式独立原件](evidence/quality-result.yaml)在本批范围resolved。现有AuthControllerTest只适配七处查询stub，原断言均保留。无schema、迁移、历史数据、生产管理弹窗或大模块重构修改。

## 规则与源码范围

- [决策包](decision-package.yaml)记录影响及验收；[本体原件](evidence/ontology-result.yaml)和[8条审前评估](evidence/rule-review.json)区分四条DEC0081声明及四条实现边界。登录参数来自设置、源码、旧测试，未找到独立知识ID，不能伪称用户逐字确认，也不新增政策。
- [设计器非拖动源码辅助报告](evidence/designer-nondrag-review.md)列明10个入口/方法范围。显示组件可点击、已有子表可菜单放置、快速添加只建模型；已追踪入口仍未找到已有普通字段的非拖动首次放置。沿用旧候选 `adjacent.designer-field-card-keyboard-placement`，未重复登记或声称整个设计器无替代。
- [源码映射](source-review.json)只覆盖所列方法；没有整文件完成或可信全量百分比。ContextMenu/Shift+F10、选区及普通字段实际交互待下一批运行核对。

## 实现侧验证与证据边界

独立新库真实PG四项及相邻认证26项合计30/30；Chromium同8场景在1280/390各通过，目标基线2红6正独立复现；TypeScript/生产构建及知识89/89通过，无跳过。strict基线/候选完整27项集合相同，仍exit2；ESLint缺配置仍exit2，不冒称全绿。独立未重复后端基线红例，已核对主侧正确夹具原件。[独立可读报告](evidence/quality-review.md)和[安全证据](evidence/quality-evidence.json)列明边界；[集成路径边界](integration-boundary.json)仅盘点受测候选路径/blob，不等于全文件审计。正式验收后只有L0归档及交付，不将后续文档SHA改称重新受测。

[primary-evidence.json](evidence/primary-evidence.json)保留各次运行命令、输出摘要、原始日志摘要和散列；后端原始日志可能含隔离账号/token，留在工作区临时目录，不进Git。浏览器受控HTTP，使用真实React/MUI/router/auth store/client，不称真实后端登录端到端。

首轮夹具有问题：设置UPDATE影响0行，因此原两次并发丢计数红例并未实际使用阈值2；已改为隔离库upsert并断言设置值，再独立运行基线红例。首轮回归另因缺失中文字体失败，配置Noto字体后PDF提取将“人”映为“⼈”，原文字断言仍失败；最终配置已有EdhrTestCJK测试字体，未改产品PDF、字体、断言或降低标准。新增基线工作树首次缺Vite依赖导致未运行测试，补链接现有依赖再跑；这些失败不覆盖为绿。

## 后续与暂缓

生产管理弹窗由用户重新设计，两原文件必须与目标逐字节相同。TaskDetail签名密码待朋友修复后读取新代码再复验；记录控制变更/作废及依赖DHR high/A12暂缓；旧知识gap及未经批准的性能优化继续保留。DHR分块、工单列表、拆分循环读取和作业匹配等已有风险不是本批实施范围。

下一批先fetch新提交并做增量审计，再完成设计器上述运行核对，继续W3/W5未审入口、W4剩余以及W6具体提取和W7全局反查。畸形登录API输入/账户管理并发/令牌撤销等仍未覆盖，不能把这30项或本次独立验收当完整安全审计。[任务漂移/整体阶段复核](scope-review.md)已在全部角色FINAL后向用户汇报；不自动merge/deploy/恢复。
