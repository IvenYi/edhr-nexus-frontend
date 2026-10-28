# 发现、根因和验收边界

固定目标8784ba87166addae9cb9659d6120aa84f993c7ef。PR41合入并未授权三项性能优化；本批仅数据/交互健壮性修复。下述问题均为实现完成、等待最终独立验收，正式关闭以acceptance overlay为准。

## AUD-W4-PAGE-ARITHMETIC-001 · medium

三个实际GET：`/master-data/process-modeling/materials`、`/master-data/process-modeling/products`、`/master-data/product-modeling/products`。正常POST创建两组产成品物料后，page=2147483647,size=20，或page=2,size=2147483647，或两项均最大正int，均可触发500。

根因：两个控制器先以int乘法计算起点，或把已裁剪的小起点与巨大size作int加法，再调用Math.min；溢出发生在裁剪之前，产生负的subList边界。它不是数据不足、数据库分页或权限问题。

仅将乘/加中间值提升long，裁剪到实际List.size后再转int；任意正int页参数的最大乘积小于2^62，long足够。原非正参数归一化为1、PageResult字段/总数/页值、筛选与排序、物料按组分页和产品沿物料ID不变。不新增页长上限，不把此处改成DB分页。27参数化案例为三路径各9组：首/次/末后页、大页号/页长及原非正归一化；旧9红18正、修复全过。

## AUD-W4-VERSION-NUMBER-RANGE-001 · high

真实POST接受不超过64字符的物料版本（符合当前列长度），例如V9223372036854775808。它与同code/name其他版本一起保存后，普通物料列表GET会在组内排序时抛NumberFormatException，整个列表返回500，不只是错误显示单行。

根因：版本字段是字符串，写侧未限定数字段为long，读取compareVersion却使用Long.parseLong。最小修复只用BigInteger比较同一正则匹配的数字段，不限制、截断、迁移已接受字符串；既有多段比较、前导零数值相等和最后文本忽略大小写回退保持。没有把显示版本等同具体制程冻结身份。

8参数化案例通过真实写入/数据库回读，验证V10/V2、long上边界、60位数、多段超long、长前导零、V1/V01回退、多段数字和日期式标签；每组含V0第三版本并验证完整ID/顺序、主显示版本、有效版本数及ACTIVE状态。旧3红5正，修复8全过。另1测试验证三个匿名读取仍401。共36后端测试：27页边界+8排序+1匿名；35条被记录的授权GET，不把匿名三请求加成38测试。

每次成功读取前后比较物料、类型和审计三表完整行序列化快照，不只比较count。真实JWT/filter/controller和物料/类型/audit repository；产品建模无制程配置，相关其他依赖显式mock。数据库为H2 PostgreSQL模式，不认证原生PG约束、计划或完整制程流程。

## AUD-W2-HEADER-NARROW-CONTEXT-001 · medium

新增远端8784ba87使用`minmax(0,1fr) auto`布局，390px下操作组占据自动列，模板标题实际宽度0，初始保存/关闭超出首屏。浏览器trial点击能自动横向滚动后操作，不能误报完全不可达；问题是当前模板上下文消失和首屏操作溢出。

原保存回归13项在390px均停在标题必须可见的前置，标为fixture-blocked，不当成13个保存逻辑红。独立DOM诊断确认title宽0；专门header脚本记录任何trial滚动前的全部初始几何，要求标题可见、按钮在viewport内且可非强制点击。390/768/1024/1440四宽旧1红3正、修复4通过。

局部样式修复：仅767px以下header一列，tabs沿第二行，操作组第三行并用flex gap换行。保留更宽布局及居中tabs、按钮尺寸/色彩和已移除流程入口；不动保存/取消/导入回调。修改后同13保存场景双宽通过。已实际查看旧390、修复390和1440截图：首屏标题及操作恢复；侧栏和整个宽画布仍有既有窄屏裁剪，不将头部验收扩成整页移动端或无障碍认证。

## 新提交与知识核对

新提交不是后台流程取消：旧`workflowDesignJson`仍由document parse/serialize保留，真实PROCESS绑定继续沿独立已发布WorkflowDefinitionVersion/FormFillSettingsService。新增Node测试证明旧payload经model/canvas编辑、undo/redo和保存重开不丢失，不恢复WorkflowTab。实际后台执行仍有原范围/暂缓，未认证完整工作流或TaskDetail。

本体8个既有ID有限一致、NA/FINAL，无需改知识；原来源合理性和工程选择见rule-review，8不称为历史新增unique。高风险数据读取修复需要全新独立QA；业务规则、知识0.3.25及成熟度、权限/签署、审计和生产/DHR冻结没有改变。

## 结构与性能

原大控制器的具体拆分方案继续见[前批findings](../branch-review-20261028-master-data-reads/findings.md)：MaterialListQueryService负责组键页/页内完整版本及筛选编排，MaterialGroupAssembler只做纯组装/排序/状态；写侧多版本同步、审计及冻结不搬入此只读服务。未来实施必须保护分组、有效期、身份和分页顺序。本批只修5行算术表达式，不机械搬模块。

数字版本比较只有一个私有调用链，当前不为BigInteger引入通用版本框架；若出现第二个真实调用方，再抽纯`VersionLabelComparator.compare(String,String)`，保持现有数字段/文本回退、null/空白和方向测试，不能默认引入SemVer规则。两个简单分页片段不强行建通用服务；以后按组DB查询将由只读服务取代，不将内存分页包装成性能整改。

三项已实测性能风险仍pending-discussion；本批不减少设备/物料关联SQL或全量加载，不改变状态/资格/审计以换性能。BigInteger处理的版本字符串受既有64字符存储边界约束，不声称已做容量/CPU/GC测量。

## 原始证据、夹具和未执行项

后端首轮36为12真实断言失败、24正向，0error/skip，没有把夹具异常算产品红。头部脚本首次因HTML请求不存在的bundle.css导致Node退出，原日志保留；按实际是否产出CSS来引用资源、服务器缺资源返回404后重跑，没有改产品或断言标准来解决夹具。此前另一个临时诊断复用活跃构建目录，目录被拥有者正常清理时产生ENOENT，已弃用；不作产品证据，替换为独立诊断，资源边界见cleanup。

原13项可见性前置未改；只有单独的诊断副本放宽前置来测量几何，不用于正式回归。首轮13 blocked、诊断、最终header基线/修复分别归档，不能合并成红绿成绩。

主侧72后端回归为54 ProcessModelingControllerTest+14 ProductProcessControllerTest+4 MaterialImportIntegrationTest；前端36 Node含35既有+1旧workflow保留，13保存双宽不记26 unique；15导入和6真实父页/受控子组件在头部修复前通过，相关导入逻辑/父页源码未变，作为无依赖回归保留，最终QA另对实际候选复验。verifier/build已在头部修复后重跑。

strict官方脚本SHA256为b56ca0495ace4aaac2bfa779dc707b04baab0f7d4537e6856b6348c63230661c；头部修复前实际frontend/src等于最新目标，strict19，修复后同19且规范化多集相同，均退出2。ESLint缺配置既有失败保留、不冒称本轮运行通过。原样日志可能带尾空格，保留原件hash，不为全区间diff-check绿清洗证据。

未执行原生PG/生产迁移、真正后端浏览器持久化、整页移动端/物理设备、完整main/autoSave并发、容量/时延/堆实验。TaskDetail/生产管理弹窗设计/记录变更作废依赖DHR high/A12/四gap及旧宿主反馈、非拖动放置候选等保留。W2/W3/W4剩余及W5–W7未完成。
