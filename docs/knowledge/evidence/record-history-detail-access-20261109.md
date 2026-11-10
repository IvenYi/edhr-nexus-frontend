# 变更记录详情读取：系统超管与普通参与人

本轮知识基线为0.3.25；读取契约及功能基线为`7c2c74d0a9f6b30c6e2dfbd9ad1620d5d29f9a37`，已获取目标`edhr-dev@5e8edb47ae91af83555f4b67a87598c3c2a9a664`但未合并。契约无增量；目标新增DEC-0095不属于本次详情读取政策，不覆盖、不合并。本次源码核对包含主目录尚未提交的修复，不能将基线提交当作已含修复的发布版本。

## 用户确认与声明级替代

`user-confirmed`：2026-11-09用户在详情报错排查中补充：“我是超管为何会没有权限呢？超管应该默认有所有权限的？当然你也要排查没有权限的问题”。主方按当前查看详情上下文确定真正系统超管的在审详情只读例外，普通账号参与人限制和审批、签署等动作资格保持。本轮没有据此定义跨模块的全权限豁免。

DEC-0096-01只替代DEC-0087-09中IN_REVIEW详情不含系统超管例外的范围。原DEC-0087-09及证据保留为历史；其RECORD_CONTROL_REQUEST签名隔离、普通参与人、结束历史范围继续有效。DEC-0087-07的我的变更与审批任务范围、DEC-0074的签署资格与其他领域规则均不替代。

## 原始证据

- `original-evidence`：主方在主环境3000/8081以普通UAT经理`uat_manager`复现，变更记录第一条`RC-20261030-000007`、ID`391515366144282624`，列表200而详情403，服务器明确“当前用户无权查看该变更申请”，页面却显示通用加载失败。原始响应与截图副本见[响应](../../development/record-history-detail-access-20261109/evidence/ontology/before-manager.json)和[截图](../../development/record-history-detail-access-20261109/evidence/ontology/before-manager.png)。原件能证明无权入口和错误反馈问题，不能证明真正admin被拒绝的实际交互；经理身份依据主方复现交接，响应文件自身未记录身份。
- `original-evidence`：`identity/controller/UserController.java`的`SYSTEM_SUPER_ADMIN_USERNAME`和`isSystemSuperAdminUser`定义受保护admin账号，按username去空白、忽略大小写识别，不按显示名或普通ADMIN角色。
- `original-evidence`：`recordcontrol/service/RecordControlService.java`的`SYSTEM_SUPER_ADMIN`以认证actor ID查询`user_account`，要求`LOWER(BTRIM(username))='admin'`及`status='ACTIVE'`；`listRequests`和`requireRequestDetailAccess`共用该谓词及既有`RELATED_TASK_ACCESS`。请求仍按default租户查询，不新增跨租户读取能力。
- `original-evidence`：`RecordRequestListPage.tsx`沿用图标、tooltip并增加无权禁用及可聚焦原因；`RecordRequestDetailPage.tsx`展示APIclient已经提取的实际错误。列表字段是读取资格投影，旧链接或资格变化仍由详情后端复核。
- `original-evidence`：读取主方落盘的[主库身份与权限查询原件](../../development/record-history-detail-access-20261109/admin-identity-permissions.json)，记录ID1、username为admin、显示名系统管理员、ACTIVE、角色ADMIN及missingRelevantPermissions为null。它与受保护账号定义一致；本体没有亲自执行该查询，不将该身份原件当作修复前后admin实际浏览器交互。
- `original-and-test-evidence`：读取`RecordControlPostgresIntegrationTest.historyDetailAvailabilityMatchesAuthorizedActor`的10场景源码，验证列表与详情结果的断言覆盖申请人、候选、普通经理、真正超管、伪装显示名/角色、停用admin、终态历史、签名改派前后。主方原始surefire[PG报告](../../development/record-history-detail-access-20261109/evidence/ontology/RecordControlPostgresIntegrationTest.txt)为52项/0失败/0错误，[Access报告](../../development/record-history-detail-access-20261109/evidence/ontology/RecordControlAccessTest.txt)为10项/0失败/0错误；本体读取报告而未执行Maven。62项不是62种新增身份组合，不等于全系统或浏览器验收。

## 保持的范围及验证边界

普通无关人员仍无权读取在审详情，普通ADMIN角色或把显示名改为admin均不能获得例外。申请人、当前候选/处理人、本人已处理任务相关人员和终态历史沿原规则；列表计数、分页、元数据范围及我的变更/审批任务投影不扩张。

不改变申请、生效、修订、DHR冻结、通知、不可变审计或签名归属；可读详情不授予审批、转办、重新分配、撤回、提交或签署权。DEC-0074已有admin签署凭证方式例外不等于任务资格豁免，本次不改它。

本体角色执行增量结构、引用、来源路径、局部替代及内部投影核对，未运行Maven、浏览器、数据库查询/写入或全系统回归。源码与读取的主方原始测试报告分列，主方浏览器及全新独立质量实例的实际结果另行记录。知识版本0.3.25、schema1.2.0、P0及既有成熟度保持，不新增运行时知识规则注册或试点。

## 2026-11-10：四个变更管理入口跟进

`user-confirmed`：用户要求“检查一下变更管理里是否还有此问题”。本次沿用DEC-0096的只读例外及DEC-0087/0094原范围；不是新的跨模块超管豁免、本人任务范围扩大或审批政策变更。契约、来源提交、未提交候选与目标提交边界仍如本文开头，远端重新获取后契约无增量。

`original-evidence`：四入口的代码核对为：`RecordChangePage`的来源查询及CHANGE/OBSOLETE候选查询；`RecordRequestListPage`的scope=mine和scope=all；`RecordApprovalPage`的本人待办/已办及其请求映射。`RecordControlController`、`RecordControlWorkflowController`均要求已认证，候选接口没有额外创建权限条件。`RecordControlService.listMyWorkflowTasks`和`WorkflowTaskRepository`按认证ID、当前候选/处理人或本人已处理任务过滤；`WorkflowEngine.assertTaskReadableBy`仍按任务关系限制审批任务详情。超管在“我的变更”或“变更审批”没有他人的任务属于保留范围，不应为了展示数据移除人员条件；申请详情可从变更记录按权查看。

`original-evidence`：本轮发现的两个错误反馈/入口遗漏为：记录变更查询到已有在审申请时，申请编号链接未随详情资格禁用；审批处理页把申请或任务403显示为笼统的“加载失败，请确认任务和申请仍然存在”。另一个同类入口是提交成功后的“查看申请”：DEC-0074允许A登录、B本人签署且会话仍为A，实际申请人归B，因此不能从提交成功推定A有在审详情读取权。

`original-evidence`：当前修复源码中，`RecordControlService.findRecord`返回`canViewActiveRequest`，复用`canViewRequestDetail`及原超管/任务关系判断；`RecordChangePage`据此为活动申请链接和提交成功链接提供无权禁用及可聚焦tooltip。成功链接仅在提交后原有重新查询得到的`active_request_id`与新申请ID一致时启用；重新查询失败保持禁用并提示重新查询，不直接推定无权。提交响应及详情响应不新增资格字段，成功入口不依赖提交事务中新任务的可见时点。`RecordApprovalDetailPage`依次显示申请/任务API的真实错误，保留返回审批列表操作。原列表的单次SQL投影继续保持，不增加逐行权限请求。字段和错误反馈属于既有读取资格的技术投影，不新增业务动作或政策。

`retained-policy`：真正系统超管可读申请，不等于自动成为他人的审批人、申请人或签署人；不放宽任务详情、候选、转办、签名改派或本人受限撤回。来源已完成/有效修订、同实例活动申请冲突、DHR在审双向阻断及原签名证据仍按原决策；不将正常业务阻断解释成权限配置故障。

本跟进本体角色只核对原始源码和已确认语义，未运行Maven、浏览器或数据库，也不复用前轮运行报告作为本轮通过证明。主方聚焦验证及新独立质量结果应取`docs/development/record-history-detail-access-20261109/audit-20261110/`下本轮原件；当前知识状态、0.3.25/schema1.2.0及P0均保持。
