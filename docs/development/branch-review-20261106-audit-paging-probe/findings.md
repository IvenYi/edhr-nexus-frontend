# 本批发现与去重

PERF-AUDIT-LIST-MATERIALIZATION-001事件全载子项：open、native-confirmed、proposal-pending-discussion。PR68已关闭页内姓名N+1，本轮不得重开或重复计新缺陷。真实小页宽JSON仍加载全部事件；测试原型少读本页但多一次COUNT，结果和条件等价仅覆盖明确案例，派生及极大offset回退未优化。

候选限制/工程发现而非当前产品新bug：JPA int offset拒绝（当前已修超尾页应保持）；单字段同时间顺序原未定义且LIMIT计划可改变，需讨论稳定ID次序；内容/COUNT两语句READ_COMMITTED与RR的代表性视图差异；/me内部调用使只给list加事务注解不足。现有准确totalPages被普通表单三个200续页调用消费，不能删总数或截断总记录。完整索引计划、非正输入及真实Service并发仍待正式实施验证。

主侧及独立162/162、知识89/89、独立15必需项passed/FINAL，无新质量发现或阻断；本体NA/FINAL。只交付测试和证据，没有为了交付修业务逻辑；新产品方案须按用户实际选择推进。全审及所有原暂停/证据缺口保持。
