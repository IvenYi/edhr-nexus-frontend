# 列表边界只读源码辅助

状态：FINAL。此报告是源码辅助，不是正式 `qualityResult`，没有执行浏览器、数据库、性能测试或产品修改。

## 基线与读取

- sourceCommit、targetCommit、contractReadCommit：`cf0eb57c3553b5efee7a4cfee20a0ea0a50c0d34`；targetBranch `edhr-dev`；uncommittedContractPaths `[]`。
- 开始时工作树干净；知识版本0.3.25。已读取AGENTS、codeplzreadme、统一交接契约、质量角色通用边界、知识README/open-questions，以及前批scope-review/findings。本文不承接旧报告的运行通过。
- 以下结论来自本轮亲读原始源码/接口/实体/迁移；前批报告仅用于风险ID去重。精确path、symbol、基线blob和SHA256见同名JSON。

## 1. ModelTab填报记录：成功缩页处理缺失，但不能套用删除场景

路径：`gmp-platform/frontend/src/pages/master-data/template-designer-react/tabs/model/ModelTab.tsx`。

- `ModelTab.reportQuery`（397–410）：UI `reportPage`初始为1；向`listFormInstanceRecords`发送`page: reportPage - 1`，接口为0基。这一转换正确。
- `reportPageCount`（483）：API仅返回`content/totalElements`，用`ceil(reportTotal / reportRowsPerPage)`得到页数。不能机械读取一个不存在的`totalPages`，也不能对UI再减1。
- 查询/重置（1029–1049）、页长（1225–1233）、进入子表（664–671）及子表ID变化effect（504–512）已重置为第1页，这是反证。
- 当前没有观察“本次成功、非占位、非刷新响应的总数减少”并回退越界页的effect。若当前页3，后台新合法结果仅1页，page仍3而数据为空，Pagination count=1/page=3。此处与图标是相似前端状态缺口，尚未实际浏览器复现，不计已验证缺陷。
- `FormInstanceRecordController`仅GET list/detail，无记录删除入口；不能使用“删除第2页唯一记录”作为该页合法业务场景，也不能造删除接口来证明它。
- 可使结果减少的合法写来源：已保存的活动表单在其他会话改变字段、更新人或更新时间后，不再命中原`keyword/operator/occurredAt`条件。`FormInstanceRecordService.saved`会更新`values_json/updated_by/updated_at`；`list` 117–138使用这些字段筛选并执行count及LIMIT/OFFSET。现有查询条件不变，若发生保持当前页状态的重新读取，匹配总量可能减少。建议用真实保存接口做这个触发，再验证合法刷新来源；不能只手造缩页JSON就称完整用户路径已复现。
- `pagedReportRows`（484–487）在子表视图将本页表单实例的子表行展开。分页分母仍为表单实例记录数，不是展开后的子表行数；不能将flatMap误报为后端全量内存分页，或为了修页码改变记录粒度。
- placeholder按`templateId`隔离正确，不能据其推断跨模板旧数据回流。模板ID变化本身无专门reportPage重置effect，但真实模板切换是否使Shell/ModelTab重新挂载尚未闭环，因此保持上下文页状态候选，不能定成真实错误。

## 2. MenuManagement图标选择器：成功缩页候选成立于原有合法外部删除链

路径：`gmp-platform/frontend/src/pages/system/MenuManagementPage.tsx`。

- `IconSelectorField`（90–274）从父页接收page/pageCount和翻页回调；其内部只管开关，分页UI为1基（253–260）。
- `MenuManagementPage.iconsQuery`（353–357）直接将1基`iconPickerPage`交给`getIconPage`；`api/system.ts#getIconPage`（244–253）也保留1基，后端`IconManagementController.listIcons`（195–220）在仓储边界转`page-1`。无0/1基错位。
- 分类、关键词和页长变化的effect及显式handlers（370–387）都重置1；placeholder按`queryKey[2] === selectedIconGroupId`隔离，索引正确。
- 无成功新总页数缩小时夹取page的effect。可正常进入图标选择第2页，另一会话在图标管理通过`DELETE /system/icons/{id}`删除该页最后的自定义图标；若保持当前页状态的实际查询刷新得到totalPages=1，旧page仍2，界面可空页而手动点第1页可恢复。当前只读核对了合法GET/DELETE来源，刷新触发仍须主审实际浏览器闭环；不要把源码候选写作已修复或新增回归。
- 图标删除保留系统内置保护（`ensureNotBuiltin`），无需越过保护或改菜单配置来触发。选择器本身不提供删除，不能把它改成删除入口。
- 该页与图标管理的查询根键不同（`system/menu-icon-picker` 对 `system/icons`），不要声称图标管理的invalidate会直接刷新菜单选择器。

两页共同的刷新反证：`utils/queryClient.ts`设置staleTime=30000且`refetchOnWindowFocus:false`，不能以“回到标签即重新读取”作为现实复现。MenuManagement重新挂载又会把本地page初始为1，所以“离开再进”本身不能保留page2复现。可进一步验证过期查询在网络重连等实际既有事件下的刷新（两query未自行关闭refetchOnReconnect），或者找到真实命令的合法invalidate路径；在此闭环之前保持pending-reproduction。此限制不影响对缺少成功响应处理这一源码事实的记录。

## 3. 字典计数增长模型：沿原风险ID，非N+1、未量化容量

保留 `PERF-DICTIONARY-ITEM-COUNT-MATERIALIZATION-001`，不新增重复ID。

- `BusinessDictionaryController.listDictionaries` 67–85先数据库分页父字典，取得本页ID，再`findByDictionaryIdIn`加载其所有子项实体；Java `groupingBy/counting`仅为计算数字。
- `BusinessDictionaryItemRepository.findByDictionaryIdIn` 13返回实体List；实体仅普通标量字段，无@ManyTo/@OneTo联表配置。因此此段不是“每字典循环发一条查询”的N+1。不能从仓储调用数宣称运行时总SQL数，Spring Data count优化等均未实际测量。
- 定义P=本页父字典数，m_i=第i个字典全部子项数，M=sum(m_i)，W=子项实体/字符串平均宽度。返回给浏览器的父DTO仅O(P)，但客户端读取/JPA实体构建/Java计数处理与M增长，应用内保留量约O(M*W + P)。P受本次页长约束，M不受父页长约束。后端`pageable` 325–327仅限制size至少1，没有服务器固定上限；不得把UI默认20当作服务器总量限制。
- 工作负载例仅为推导，非实测：P20、每父10/500/5000子项分别对应200/10000/100000个子项实体。无法据此认定某客户会有该存量、发生OOM或超出时延标准；应先查实际目录规模与可增长业务来源。
- 当前计数包含ACTIVE和DISABLED全部子项；父筛选并不使子计数只算ACTIVE。未来优化必须保留这一定义及空ID/零子项回0行为。
- 同一根因也出现在`updateDictionary` 133：修改父字典后为响应itemCount加载所有子项再取size，可与原风险一并评估，不重复计问题。
- 原生schema有`idx_business_dictionary_item_dictionary_sort(dictionary_id,sort_order)`（baseline SQL1834），可支持按字典ID查询，但不能仅凭索引存在断言真实查询计划或扫描量。索引不消除传输和实体物化M行的成本。
- `IconAssetRepository.countByGroupIdIn` 18–23已有数据库GROUP BY投影，`IconManagementController.listGroups` 86–95消费聚合，是可复用形态的反证。建议讨论在字典repo引入仅返回dictionaryId/count的投影，按本页ID聚合，再map默认0；update响应可复用count语义。DB仍可能扫描M项，不能宣传数据库工作量变成O(P)，主要先减少返回行/实体物化。
- 应在隔离PG量化P、每父子项数、字串宽度、仓储/JDBC返回行、堆与分配量、执行计划/索引、冷暖查询及并发；保持原status/租户/空值/排序计数语义。未获得性能方案讨论结论前不实施，不能用本批分页修复顺带优化SQL。
- `listOptions`返回实际ACTIVE选项、级联删除需要检查内置项及记录逐项历史，不能按“查全量”一概换成count；不在本计数整改范围。

## 4. 具体组件/函数拆分建议（未实施）

1. `ModelTab`可先提取`useFormRecordList`读取hook：输入templateId与显式查询条件，拥有reportPage/reportRowsPerPage及查询成功边界；维持UI1/API0、totalElements页数和disabled查询。字段定义、子表定义、撤销/history仍归设计器store，不移进读取hook。
2. 再提取`FormRecordTable`展示组件，接受已分页实例记录、列/宽度/排序状态和详情打开回调。子表展开属于视图适配，明确保留实例分页分母；新组件不能自行重查全量或重新切片。原字段编辑区域与报表列持久化所有权分别保留。
3. `IconSelectorField`已是明确组件边界，可移入共享或menu领域组件文件，保持同一props契约；父级用`useMenuIconPickerQuery`拥有分类/搜索/页长/成功缩页。不要让弹窗开关组件改变菜单配置提交或删除图标，也不要复制另一套图标API。
4. 字典性能改动若获讨论授权，优先添加repo聚合projection并让两个计数消费方复用；无需先把整个Controller重构成服务层，更不能改业务计数定义。是否引入小计数查询服务由真正复用与测试职责决定，不按行数机械抽取。

以上只读范围不等于全文件审完。没有修改产品、测试、知识、Git、数据库或CI；未触发merge/deploy。
