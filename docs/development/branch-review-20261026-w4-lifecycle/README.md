# W4 生产对象生命周期审计

目标基线 `c49c0c7f98ca5c66eb59eb6876c78af03a07d28b` 已包含用户合并的 PR28，树与其交付 `744e804b` 相同；没有额外产品或契约增量。L2，本轮修复核心 `3281863b0974dc1e4e7b4c343ca9d42a7a4103ac`。本目录是整体审计的有限增量，不替代旧冻结总账。

已按 DEC-0019-02/04 修复 AUD-H007：实际执行事务中对象状态变化时追加一条 PRODUCTION_OBJECT UPDATE，仅保存 status 前后值和真实操作者等元数据。既有 PRODUCTION_EXECUTION 审计保留；无状态变化不产生对象事件。最后一张必填批次表单 SUBMIT 触发完工也覆盖，不仅判断命令名 COMPLETE。

不新增状态或接口、不改资格/锁顺序/DHR/质量产出规则，不补造历史审计。新增写入复用当前锁内对象及前状态，没有附加业务查询。审计失败必须整体回滚。

主侧原生 PostgreSQL 同组6例：旧代码6失败、修复6通过；相邻回归121项中119通过、2个原有浏览器驻留夹具按原条件跳过，0失败/错误。83项为真实JWT/MockMvc/事务服务及隔离PG，主数据部分仓储/状态机/产出服务仍为原测试mock，非完整应用全链。另36项为控制器/授权/单元测试。不把6与121累加成独立覆盖。独立验收另见收尾 acceptance，不把主侧结果冒称独立通过。

继续保留 AUD-H006 两段已知差异，H008尚待本轮后续实际核对。新登记审计列表全量读取与批量拆分重复扫描的性能风险，均未实施。详见 [findings](findings.md)、[structure-plan](structure-plan.md)、[source-review](source-review.json) 和 [scope-review](scope-review.md)。

验证复现命令及安全结果在 evidence/primary-regression.json；只保存摘要、测试名和SHA，不提交原始日志/XML/JWT。无浏览器/构建/生产迁移/部署声明。没有自动合并。
