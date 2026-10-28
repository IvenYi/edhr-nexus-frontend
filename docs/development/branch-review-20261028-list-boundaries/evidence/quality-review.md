# 列表边界最终独立复验

状态：**FINAL / passed，16/16 必需检查通过**。另三项既有全局检查按实际失败保留，未改成绿。

实际受测候选与来源：`8efb21f74dcc07050ccfbc3f516747ff2accab90`；目标：`edhr-dev@cf0eb57c3553b5efee7a4cfee20a0ea0a50c0d34`。实际在候选读取项目、质量角色和交接契约；工作树始终干净。知识版本0.3.25。本实例及其只读盘点辅助未参与产品、测试、夹具或知识修复，没有修改仓库。

## 独立实际运行

- Node 40/40、既有字典/工艺/模板控制器103/103、知识89/89，均零失败、错误、跳过。后端为Mockito/controller测试，不冒用旧原生PG结果。
- 实际BusinessDictionaryPage、ProcessModelingPage的operations、TemplateModelingPage的formTemplates，配合React Query/client/MUI/Chromium：桌面1440和窄屏390运行同11场景均通过，不称22种不同业务场景。
- 固定cf0原三页使用同一组11断言，精确5红/6正：字典父、字典子项、工序、模板四种合法末页删除与自动换字典子页为红；等待/失败/缓存/页长及零总页正对照为绿。期望exit1已实际取得。
- 四个删除场景实际完成原确认和DELETE，工序/模板还完成原关联预检。签收等待新总数20后回有效页1，未把旧缓存page1/总数21当作最终完成。字典父删除夹具为空自定义字典，未跨过内置或有子项保护。
- 自动换父项时A/B均21子项，从B子页2切回A后，A显示子项1，没有向A发出旧page2请求、没有写入。这一反例独立于“新父项只有1页”的缩页修复。
- 相邻共享分页、图标、设备3组通过，原零基FormListPagination及跨分类隔离断言保持。TypeScript/Vite生产构建通过；字典、模板静态脚本通过。

## 源码、规则和视觉核对

亲读10行一基hook与四个调用的success/fetching/placeholder条件、字典派生selectedItemPage及自动选择effect、原列表查询和DELETE handlers。hook只校正已知新范围的上界；没有新请求框架、全站分页迁移或新增业务政策。模板保留缺totalPages时按totalElements/pageSize计算的既有兼容，ProcessModeling共享pageKey的影响做源码核对，浏览器实测并未覆盖全部变体。

删除规则、权限、版本、后台事务和审计不变。DEC0053只用于本次对应工艺/模板保护，系统字典沿原builtin、子项等限制；管理页自动浏览选择不是DEC0082-14中表单引用字典的显式配置。13条知识ID及2节UI契约的有限NA摘要与候选源码吻合，知识结构89通过不等于全库语义审完。

实际查看390px模板删除截图：新总数20、页1及可达操作列明确；查看字典自动换父项截图：父DICT-01/子A-ITEM-01、父子页1且均保留21项总数。未发现本补丁新增的布局变化；这是有限交互视觉验证，不是全站响应式或屏幕阅读器认证。

## 盘点与原件

只读辅助独立重建固定cf0的3961路径、130迁移与入口候选四份文件，逐字节一致；四主侧方法/路径与14条辅助范围存在交叉，不加总为整文件完成。来源blob/SHA、知识涉及8个源码摘要、13知识ID及2节UI契约、19份归档原件hash全部匹配。原8ec3c3a1交付与cf0整树一致；后端、知识、契约、DESIGN及列表规范对目标无改动。

辅助首轮非NUL Git路径枚举把六个中文路径按引号转义读入，造成盘点取样假红；原诊断JSON保留，按Git NUL路径重新核对全部集合。此纠正没有修改产品、测试、清单或断言，最终盘点完整性通过。独立临时盘点目录和本实例静态导出已按确切路径清理。

## 既有失败及剩余边界

当前官方静态脚本SHA256 `b56ca0495ace4aaac2bfa779dc707b04baab0f7d4537e6856b6348c63230661c`，独立重跑cf0/候选src各19项、均exit2，完整finding多重集合仅忽略行号相同、无新增或移除；不与旧27项混算。ESLint仍因缺配置exit2。

`verify-process-modeling-pages.mjs`在独立cf0导出和当前候选均因退役`0014-process-modeling-permissions.sql`不存在而ENOENT/exit1；后续完整断言未执行。脚本还保留多个旧迁移名字，本次未为其通过修改业务、脚本或降低断言。该未通过项与strict/lint均独立列为非必需全局失败和残余风险，不能宣传所有验证全绿。

两项本批medium按候选独立复验resolved，无本批blocked或新增high/critical。原相邻父线索只处置已实测子范围，ModelTab/Menu保留pending-reproduction；其焦点刷新关闭、重挂载重置及合法刷新触发限制继续有效。性能原ID只分析、未优化；完整W0至W7、其他变体、真实后端持久化E2E和原生PG/容量认证未由本批完成。原生产弹窗样式、TaskDetail签名、记录控制及相关DHR high/A12和知识gap暂缓保持，不自动merge/deploy或恢复数据。

正式机器结果：`/tmp/edhr-list-final-quality.yaml`。安全摘要和原件收据：`/tmp/edhr-list-final-evidence.json`；只读辅助：`/tmp/edhr-list-qa-inventory-source.json`及同名MD。原始日志/JSON保留/tmp，所有结果仅覆盖实际候选。
