# 有限审查结论与剩余项

基线`1579c06c`；以下三项都是本轮重新核对旧路径发现的缺口，不记作`a32d8d76`/`af1e0244`新增回归。修复后实际运行通过不代替独立签收；最终状态见本批acceptance。

## 本批确定整改

- `W4-IMPORT-DRAFT-CONTEXT-001`（high）：`WorkOrderPage.importPendingObjects`在`file.arrayBuffer()`后继续使用原闭包，却向当前共享待提交清单追加。关闭A再打开同产品同制程的B，或同A关闭重开、修改清单、切制程、提交既有清单、再选新文件，旧读取都会继续加入。真实浏览器固定基线分别复现；后端检查制程/额度不能识别UI旧草稿原归属。最小修复以请求序号绑定本次编辑，打开/关闭/卸载/新导入使旧请求失效，读取返回再核对当前制程、工单、清单、已分配数据及可提交资格。过期结果不写清单、不弹旧错误、不自动提交；当前编辑变更可重选文件。保留原导入后待确认和后台事务校验。
- `W4-IMPORT-DECIMAL-SUM-001`（medium）：剩余0.3时CSV两行0.1与0.2被浮点合计0.30000000000000004误拒。按后端原有正数且最多四位小数资格先校验，再按万分整数合计和比较；不增加epsilon、不四舍五入非法输入、不放宽额度。浏览器正向提交payload仍为[0.1,0.2]，0.3001真正超额及小于额度的0.10001超精度均阻止。服务端`ProductionService.split/updateObject`的BigDecimal和precision校验保持。
- `W5-ICON-SUCCESS-SHRINK-001`（medium）：图标末页删除或其他会话删除后，成功返回totalPages变小，但page状态没有回退；旧显示Math.min只是伪装页码，本次新分页显示真实page后缺口仍在。仅成功、非占位且非刷新结果确定越界才回最后有效页；等待/失败保持目标页。原浏览器脚本显式跳过icons缩页，本轮补断言，真实基线1红/2正对照→候选3组通过，原跨分类隔离断言全部保留。

## 只读候选：继续核对，不混入已修复

- `W5-LIST-SHRINK-ADJACENT-001`：BusinessDictionary父/子页、ProcessModeling、TemplateModeling、ModelTab等独立分页消费仍有成功缩页回退缺口的源码线索。字典自动换父项也可能沿用旧子项页码。尚未逐页完成合法删除浏览器复现，保持pending-reproduction；下一批优先实际复现，不把图标通过外推全部列表。日志只增不减等反证影响优先级。
- `adjacent.designer-field-card-keyboard-placement`：已有普通字段首次非拖动放置继续pending；此前Shift+F10/ContextMenu可用的实测反证保持，不宣称整个设计器不支持键盘。

## 性能与健壮性：待讨论，未实施优化

1. `PERF-DICTIONARY-ITEM-COUNT-MATERIALIZATION-001`：`BusinessDictionaryController.listDictionaries`父项已数据库分页，但为计数通过`findByDictionaryIdIn`加载本页所有子项实体后在内存groupingBy。不是N+1，但20个父项不限制其子项数；若子项持续积累，结果加载与堆内存仍随全部子项增长。建议隔离库量化后讨论改为数据库group count；图标组已有聚合count接口是反证。未测生产规模/耗时/查询计划，不称已发生容量事故。
2. `PERF-PRODUCTION-IMPORT-DUPLICATE-SCAN-001`：导入每行使用parsedRows.findIndex，并反复pendingObjects.some/objectRows.some，静态比较量为R²+R(P+E)量级；同步XLSX解析及候选数组也占内存。批量SN/重复导入量增长才放大，不以单份DHR少于300张推断导入规模上限。建议先测100/1000/10000合法行的耗时/内存，再讨论复用Set和有界导入策略；本轮不改限制或算法。
3. 既有工单列表全量实体/逐单SQL、批量拆分重复扫描、作业逐工序读取、DHR宽JSON分块方案继续沿原风险ID和原量化证据待讨论，不重复计成新问题，不默认获得优化授权。
4. 追溯目录`FormLookupItemsPage/useFormLookupItems`确有全目录GET及前端filter/slice；属于配置元数据，须核对实际可能规模及响应宽度后定级，不泛化为所有业务列表都在内存分页。

## 大模块具体拆分建议（未执行大重构）

`WorkOrderPage`当前仍同时负责列表/写命令/导入/下载/待提交状态。可分三步，逐步保留回归：先抽取纯文件解析器（bytes、生产形态、制程ID→规范候选及行号错误）；再抽取纯候选验证（当前合法上下文、精度/总量、编号及日期→通过或具体错误），副作用与请求代次保留在编辑会话；最后把工单对象管理区提为按工单编辑会话隔离的组件，页面继续管主列表和缓存失效。模板下载若单独提取，必须保留真实XLSX表头、示例、旧备注导入、一次确认提交测试。不得机械移行数、复制接口、改变事务或冻结点。

列表缩页若后续多个合法删除页证实同根因，可在现有共享列表层形成成功响应边界hook，领域页保留0/1基、分类和子项状态所有权；当前单个图标修复不新建通用分页框架。
