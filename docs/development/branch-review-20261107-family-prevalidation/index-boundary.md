# 有界批读与索引边界

新增谓词都是所选主键IN或既有tenant/product成员IN，没有文本转换、函数或新排序。canonical的material/material_type主键及`uk_product_family_member_tenant_product`覆盖这些查找条件，本轮无migration、索引或成本参数改动。覆盖谓词不等于保证每个计划都选择索引。

真实166项测试结束后，在同一自有隔离canonical PG中另追加50k物料和成员fixture、ANALYZE，再用PREPARE/EXPLAIN ANALYZE BUFFERS执行代表性SELECT。此为单独合成计划探针，不是产品API、业务审计、真实生产分布或端到端容量；追加数据在业务观察之后，未混入33个业务tag计数，自有PG最后删除。原SQL、JSON及catalog索引定义见main.zip内verified/index-*与*-plan.*。

| 查询样本 | 主侧实际计划 | 执行毫秒 | shared hit blocks |
| --- | --- | ---: | ---: |
| 物料100 | material_pkey Index Scan | 0.276 | 205 |
| 物料512 | material_pkey Index Scan | 0.434 | 1036 |
| 类型512 | Seq Scan | 0.120 | 6 |
| 成员100 | tenant/product唯一索引 Index Scan | 0.304 | 204 |
| 成员512 | Seq Scan | 7.502 | 417 |

成员512过滤约49489行后返回512行，类型小表只过滤6行；没有应用内读取全部5万对象、内存分页或返回截断。单个热缓存计划不构成“512必顺扫”的规则，也不能外推所有数据量、tenant分布、泛型/自定义prepare计划、冷缓存或远程耗时。独立实例会保留自己的计划及耗时，不要求复刻这些微秒数。

当前选择保留现有索引：100样本可利用原唯一索引，大批512只发生每批一次，不能只因Seq Scan字样重复建等价索引或禁用顺扫。更大成员表、宽行/冷缓存或高并发下，如出现可归因耗时，应再比较实际筛选基数、统计、计划和批次/往返成本，量化后讨论；不将单次本地7.5ms当生产SLA或性能关闭证据。

512个ID仅限制单SQL：物料/类型至多512参数、成员另加tenant至多513，1025产品跨三批仍全部可达。工程参数不进入业务人数/产品数政策，不增加前端“最多512”限制，也不借索引评估改租户授权、唯一性或写入锁顺序。
