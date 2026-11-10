# 固定候选594a独立最终QA

结果为 **failed**，仅发现一项需由主实现修复的测试数据关联缺陷，未确认本批新增产品业务缺陷。候选 `594a1944682f21550fbbd1a108b852d3ef34655b`；目标 `edhr-dev@07d6d4168a00a265afea8105db9a1a0e2554f683`。独立fetch后目标不变；知识0.3.25、schema1.2.0、P0阶段保持。该结果不能用于后续修复提交的最终验收。

## 独立性与边界

本实例未参与实现或修复，仅在独立detached工作树及自有PG16运行既有测试、构建和浏览器脚本。没有修改产品、测试源码、配置、断言、知识或契约；工具脚本和报告均在自己的/tmp原件目录。只将runner容器前缀改为唯一QA前缀，没有改数据库guard或测试命令。验证过程中临时建自己的node_modules软链（runner原始status如实记为untracked），结束仅unlink该软链，最终Git工作树clean。主侧依赖目标没有被改动。

已读取AGENTS、codeplz通用原则、统一交接/质量角色、DP、知识README/open questions、DEC0096及精确替代0087-09、0074、0093、0095。独立源绑定40/40文件与实际594a Git内容完全相同；补充知识文件另作hash绑定。当前候选相对07d6只有DP和原RecordControlPostgresIntegrationTest增加三个容量case。2dc至07的实际增量为101文件：6产品文件、7后端测试夹具、1浏览器脚本、8知识、1架构、78证据。本次不重新收尾已合并PR74。

## 需修复：QF-RECORD-ACCESS-001（medium）

`RecordControlPostgresIntegrationTest.requestListCapacityKeepsReadPolicyAndEvidence` 两处workflow_instance克隆使用 `jsonb_build_object(...,'business_key',...)`，但实体的 `@Column(name="business_id")` 和baseline schema实际列均为 `business_id`。PostgreSQL `jsonb_populate_record` 忽略不存在的JSON键，最终克隆仍保留原实例的business_id。

本实例在自己隔离PG用只读 `fixture-proof.sql` 复现：同时传入 `business_id='original-request'` 与 `business_key='new-request'`，实际返回original-request；信息架构仅返回business_id。源代码与数据库行为相互印证。当前task数量断言能够验证20021条，但无法检测实例业务身份未改。

应由主实现纠正两处键并增加目标20份申请/实例业务关联及背景实例关联断言，之后重新主测并由全新未参与修复实例最终验收。本实例未修复。此项不应叫作产品bug，也不应声称20个克隆完成了新的签署流程。

现有真实服务SQL使用 `q.workflow_instance_id` 与 `task.instance_id` 关联，这两列克隆值正确。因此本次捕获的SQL扫描现象、资格投影及原始实际submit产生的申请详情仍有其真实有限证据意义；需要撤回的是“克隆业务关联元数据完全一致”的声明。最终容量结论仍应绑定修复后候选重测，不跨提交复用本结果。

## 实际运行

- 后端9类127/127通过，0失败/错误/跳过；RecordControlPG69、Access10、Baseline1、ProductionAuth5、WorkOrderClose H2 5、DhrLifecycle H2 6、FamilyUnit5、FamilyNativePG23、ProductionExecution三个选定H2方法。不是全127原生PG或全部HTTP端到端，也不是完整2144。
- 知识自动校验89/89通过；不能代替全量知识语义审计。
- workflow真实维护组件、合成拦截API浏览器58/58通过，宽1440/390；personnel组件11/11通过。mock写计数不是主环境业务写入或真实签署验收。
- 前端production build、列表样式及外部字体检查通过。
- 全站strict实际exit2：86项=14 unresolved+72 violation。使用同一工具与主侧2dc基线原件逐项比较，发现集合完全相同，新增0；工具字节相同。该项不叫“全站已合规”。npm lint实际exit2，原因仍无ESLint配置，未新增配置或降低规则。
- 自有PG删除成功，运行子进程均结束，仅自建依赖软链被移除，最终工作树clean。原始日志、XML、截图、SQL计划、源码快照及失败输出均保留。

## 规则及代码核对

真正超管只读例外与DEC0096一致：服务取认证用户ID反查DB，要求ACTIVE且trim/casefold后username为admin。普通ADMIN角色、伪造display_name/JWT用户名、停用账号均不能获得例外。0074按钮签署的exact-lowercase-admin凭证例外是不同的已确认范围，本次没有扩大或合并两种规则。

列表canViewDetail及来源canViewActiveRequest只是入口提示，直接详情仍做后台资格复核。详情可读不授予任务详情、审批/退回/转办/重新分配、非申请人撤回或签署。申请人、当前/历史任务关系、改派新旧责任、结束历史及受控签名通用API隔离保持。原生PG10场景和跨签署人/登录人场景断言实际通过。

前端四入口沿现有MUI/Tooltip/Alert/ButtonSignature owner和列表规范：明确false禁用入口、wrapper可聚焦说明、旧链接显示真实后台错误、提交后重查失败不擅自开放成功链接。本轮人工查看了窄屏禁用图标焦点提示及列表布局原始截图；58项DOM/交互验证覆盖其他错误路径，不将截图本身冒称真实数据库整链。没有修改全站UX契约或生产管理弹窗。

七份已有集成夹具与源码核对：Page.content修正仍保留原人员ID/姓名/数量和锁定目标负例；forSubmission补既有依赖返回，不取消DHR生命周期断言；WorkOrderClose补必要依赖Bean；Baseline严格枚举补已有0091/0092；WorkOrder详情精确匹配现行hasAnyAuthority而其他API仍原权限；RecordControlAccess增加投影绑定参数，原租户/筛选条件保留；RecordControlPG新增例外矩阵保留普通无关/停用/伪造拒绝及撤回限制。本次没有通过降标准解决失败。

## 性能、长文件及过度防御

实际捕获12组原服务调用、每组count和page，共24份auto_explain JSON，并核12份20行结果及预期资格。三种背景规模0/5000/20000，20份metadata申请；只有原始1份是真实submit/签名流程。测试八表读取前后全行摘要相等断言实际通过；报告未虚构摘要值字符串。

2万背景任务物理排在目标task之前时，reviewer42的page实际SeqScan20 loops，每次平均过滤20010行，SQL62.367ms；无关44使用hashed子计划一次扫20021行（9.760ms），申请人41及DB ACTIVE admin因短路task0 loops。不能说所有人20次扫描。时间是自有机器warm/auto_explain观测，不是SLA；PostgreSQL generic/custom及物理布局会影响计划。源SQL中CAST关联与权限EXISTS值得后续按相同授权比较索引/查询方案，本轮仅量化，未改SQL、索引、权限或政策。

权限读中重复DB ACTIVE确认、列表到详情每次重核，以及任务动作再次校验，属于当前可变身份/责任和不同入口边界的必要保护，不应仅因看似重复删除。A23另核SQL CAST/相关子查询成本，性能风险按上文记录。

592行RecordControlService存在具体拆分空间：将findRecord/revisions/listRequests/requestDetail等读模型组装提取为RecordControlReadService，共享资格表达式归RecordControlReadPolicy；提交、修订应用、撤回、工作流结果回调保留写事务编排Service。拆分时必须保留写事务、锁顺序、实际签署人/登录人区分和领域审计同事务，不在读取helper中隐藏写入。当前没有据此重构产品；该建议进入后续维护队列。

## 残余队列与下一步

本批未运行完整2144、全部多租户/并发/真实环境矩阵、全站UI或所有历史知识语义。W2至W7、原931子集86UI、A12/高风险/容量UNKNOWN、A23全仓复核及用户暂停的通用工作流签名密码页/生产管理弹窗保持原队列。整文件完成数与历史去重总量不能据此提升。

主实现应先只修容量fixture的业务身份键和关联断言，保留本目录594a运行原件。新候选需新鲜独立最终QA；不将当前failed标记done，不将当前回归失败误报产品权限问题，也不擅自触发CI、合并或部署。
