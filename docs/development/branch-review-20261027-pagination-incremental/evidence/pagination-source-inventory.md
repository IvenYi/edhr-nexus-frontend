# 分页增量只读源码证据

状态：FINAL；临时源码辅助，不是正式 qualityResult，不是运行验收。

## 基线与范围

- sourceCommit / targetCommit / contractReadCommit：`1579c06c20e1382705362001278ae514583e9853`；targetBranch `edhr-dev`；uncommittedContractPaths `[]`。
- 对比原交付 `66b89eafa97a82b2080afd4f60a468d3f6824458`。实际读取 AGENTS、codeplzreadme、统一交接契约、质量角色边界及知识 README/open-questions（相关规则/当前知识版本为 0.3.25）。
- 31 个 `src/pages` 变更路径中的分页差异及对应当前方法/消费者；生产对象编辑、拆分新布局不在本辅助范围。没有把 31 个文件登记为整文件完成。
- 本辅助没有修改 Git、源码、测试、知识，也没有运行浏览器或后端测试。所有下列行为先按源码可达性定性，需主审独立复现后才能登记运行结论。

## 新差异的实质

1. `formManagementListStyles.tsx:FormListPagination`（46–94）：使用零基 page，显示 `page+1`；成功且非 fetching/placeholder 时才按服务端 totalPages 把越界页回到最后有效零基页。加载、失败、旧占位数据不强制回第一页。页数显示至少覆盖当前页，回调仍 `value-1`。未发现本次引入的零/一基转换错误。
2. `DhrWorklistTable.tsx` 透传 paginationReady；`DhrFillingPage`/`DhrReviewPage`/`DhrSummaryPage`/`DhrManagementPage`、`FormFillingPage`/`FormReviewPage`/`FormInstanceListPage`、`FormLookupItemsPage` 的列表/审计、`QualityReasonPage` 审计、`FormProjectionReportPage`/`DhrTraceReportPage` 都向共享分页提供 `isSuccess && !isFetching && !isPlaceholderData`（本地目录分页用 catalog 的 success/fetching）。这些路径没有在 shared UI 把 API page 额外加减一次。
3. 独立一基页的 `WorkOrderPage`、`BatchManagementPage`、`EquipmentPage`、`DocumentManagementPage`、`ProductFamilyModelingPage`、`ProductModelingPage`、`WorkshopManagementPage`、`QualityReasonPage`、`FormProcessList`、`ReviewTemplateList`、`WorkTemplateList`，均在本次差异中为越界回退 effect 加真实新响应门槛。其 Pagination 改为实际请求 page，避免仅显示 clamped 页而请求页不变。
4. `IconManagementPage`、`MenuManagementPage`、`BusinessDictionaryPage`、`ProcessModelingPage`、`TemplateModelingPage`、`PersonalSettingsPage`、`AuditLogPage`、`ModelTab` 增加占位数据或加载期间页数 fallback，但仍有下述成功缩页遗漏。不是所有新触及页面都已经具备完整缩页修复。

## 上下文隔离反证

新增占位逻辑不是全项目无条件 keepPreviousData：

- Equipment 按 pageKey；ProcessModeling/TemplateModeling 按 config 的查询根键；QualityReason 按 type；ModelTab 按 templateId。
- IconManagement/MenuManagement 按 groupId；BusinessDictionaryItems 按 dictionaryId；FormLookupItem audit 按 selectedId；QualityReason audit 按 type+selectedId；DocumentManagement 按 category。
- FormFilling/FormReview/DhrReview 按 view；DhrSummary 按 tab；ReviewTemplateList 按业务 category；FormProjectionReport 按 modelId。

这些 guard 使用真实 queryKey 对应位置，没有发现明显索引错位。图标组切换不应再复用旧组可拖动项；这与旧独立报告提过的问题有关，但这里的结论来自当前源码，不是复制旧报告。keyword/status 等同域过滤多保留旧行，部分页面只判断 isLoading，可能缺少后台查询中提示；目前不足以单独定成数据错写缺陷，不能将所有 keepPreviousData 视为缺陷。

## 最值得主审现场复现的候选（最多三组）

### 1. 图标删除最后页后缺少成功缩页回退（优先）

- 位置：`IconManagementPage.tsx:iconsQuery` 190–193，`setPage` effect 222–225，`deleteMutation` 306–312 / `batchDeleteMutation` 315–322，Pagination 712–715。
- 触发：自定义图标某组 21 项、每页 20，进入第 2 页；删除第 2 页唯一一项，或在另一会话删除后 invalidate。
- 预期：收到新的 `content=[]/totalPages=1/totalElements=20` 成功响应后请求有效第 1 页并显示现有数据。
- 实际源码：删除只 invalidate；唯一翻页重置 effect 只依赖 keyword/pageSize/groupId，没有 totalPages 响应处理。状态仍 page=2，count=1，空列表无法自动恢复；如果新提交显示 page 真值，则当前页甚至没有可见选中数字。
- 旧/新：旧基线已有不改变 page state 的缺口，旧 UI 用 Math.min 只把显示伪装成 1；本次移除显示 clamp 没补状态回退。应记“本次全项目分页整改尚未覆盖的旧缺口”，不能记新引入数据丢失。
- 测试遗漏：`test-shared-pagination-browser.mjs` 的 shrink 测试分支显式 `if (kind !== 'icons')`，对 icons 只查跨组隔离。因此其现有 passed 不覆盖成功缩页。
- 反证：组切换已有回 page1；同组普通翻页、缓存/失败不应回退。补修仅应在新成功响应证明越界时触发，不在 pending/error/placeholder 时触发。

### 2. 字典列表与子项列表成功缩页遗漏（优先）

- 位置：`BusinessDictionaryPage.tsx:dictionariesQuery/itemsQuery` 493–531；pageCount 559–560；deleteDictionaryMutation 647–655 / deleteItemMutation 658–665；分页 1117 / 1192。
- 触发：字典项共 21 项，右表每页20，进入第2页删除唯一项。左表有相同末页删除路径。
- 预期：删除成功后新总页数变1，回到有效第一页；不能显示“共20条”却是空表。
- 实际源码：删除仅 invalidates，未 setItemPage 或观察新 totalPages 的 effect。字典页同样没有成功缩页 clamp。
- 相邻候选：父字典翻页导致自动选中不同字典时，`selectedDictionaryId` effect（508–514）没有同步重置 itemPage；只有显式点击左表行（约1101）重置。若原字典子项在第4页、新字典仅1页，就会向新字典请求page4并停留空表。这是既有上下文页状态缺口，本次 guard 能防止旧字典行显示，却不能修复新字典请求页越界。
- 旧/新：均为旧状态缺口，本次加占位逻辑未补足。需实际 UI 复现，不能将空表推定成后端数据删除或权限问题。

### 3. 相同成功缩页遗漏仍散落其他独立分页页（合组追踪）

- `ProcessModelingPage.tsx` list query1183、pageCount1250、Pagination4049；`TemplateModelingPage.tsx` list759、pageCount825、Pagination1961；`ModelTab.tsx` reportQuery401/页数483/分页1225：没有观察成功 totalPages/totalElements 并调整当前page的 effect。
- `MenuManagementPage.tsx` iconsQuery353、IconSelectorField Pagination252，无成功缩页处理（通常需其他标签删除图标后重新读取）；`AuditLogPage` pageCount769/1028、`PersonalSettingsPage` PersonalLogPanel2291亦无成功缩页处理，但普通日志只增不减，优先级低于有直接删除操作的列表。
- 现场优先再选一个可合法删除的模板主列表末页，避免用人工坏响应制造业务缺陷；再按真正读写路径决定是否同批处理。
- 这些是同一类页状态遗漏，不应该按每个组件生成一套新的业务规则，也不应该为了覆盖所有文件做大重构。若最小修复复用现有分页状态 helper，应先评估现有一基/零基语义差异。

## 数据量与 SQL 读路径（只读风险，不实施优化）

1. `BusinessDictionaryController.java:listDictionaries` 74–83 采用数据库父字典分页，但为了 itemCount 调用 `itemRepository.findByDictionaryIdIn(dictionaryIds)`，把本页所有字典子项完整实体加载后 Java groupingBy/counting。不是 N+1；不过 20 个父字典可能各含大量子项，父页大小不能限制子项加载量。这是静态已确认的放大路径，尚无本轮 SQL/内存/延时规模测量。建议先量化，再讨论改数据库按 dictionaryId 聚合计数，不按本次“继续”授权自动优化。
2. `IconManagementController.java:listGroups` 85–95 的组计数已经 `countByGroupIdIn` 聚合，是相邻反证，不能误报此处逐组 SQL。
3. `FormLookupItemsPage.tsx` 48/86/114 + `api/formLookupCatalog.ts:useFormLookupItems` 9–12 使用全目录 GET、客户端 filter/slice，属于真实旧内存分页；这不是生产批次/DHR列表的分页实现。此目录主要是配置元数据，先确认可能规模/响应大小后再定性能等级，不因看到 slice 就宣称线上容量故障。
4. 本次分页差异没有后端查询修改；keepPreviousData 至多增加旧观察结果过渡保留，不能凭此推断新 SQL N+1。接口分页不等于完整后端性能认证。

## 剩余边界

没有完成全部31文件的整文件人工审查，没有运行浏览器/数据库/E2E，没有独立质量签收，也没有性能量化。上述候选由主审现场复现并决定最小修复；原用户暂缓区域和 TaskDetail 等保持。未修改业务规则、生产数据或CI。
