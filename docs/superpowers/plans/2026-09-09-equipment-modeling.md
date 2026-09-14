# 设备建模实施与验收

用户要求：数据模块新增设备建模目录，下挂设备类型和设备列表。类型页面参照工序管理，左侧分类内置生产设备、检验设备、计量器具且允许自定义；右侧为注塑机、模温机等类型；设备列表维护具体单台设备。用户已明确恢复项目门禁并继续执行。

执行级别 L2：存在数据库迁移与接口契约完善。本体和质量门禁均触发。保留已有未跟踪 `.superpowers/brainstorm/4167-1786931085/`，不提交、不推送。首轮仅隔离验证；用户随后授权备份、更新本地服务和追加管理员设备权限，后续同功能修复沿用授权。

1. 主开发补齐分类、类型、设备接口及迁移，保持原设备 URL 管理单台设备。验证关系、输入校验、唯一性、删除引用保护、权限及审计。
2. 前端接入默认及已保存菜单、类型分类布局和单台设备列表。验证编译、菜单归一化和实际增删改查交互。
3. 本体角色并行维护确认的三级关系；主开发完成接口集成测试和 PostgreSQL 迁移验证后，由独立质量角色集中验收。

实现假设：新增类型必须选择分类，新增设备必须选择类型；内置分类不可改名删除，自定义分类支持增改删；被引用的分类及类型禁止删除。历史未分类类型保留并展示在未分类筛选中。沿用已有设备字段，新增分类不扩展到保养、校准、维修或生产执行状态机。

```yaml
decisionPackage:
  id: DEC-PACKAGE-20260909-EQUIPMENT
  scope: equipment-modeling
  knowledgeBaselineVersion: 0.3.12
  summary: 设备分类、设备类型和单台设备的三级建模与两个管理页面
  confirmed:
    concepts:
      - {id: concept.equipment-category, name: 设备分类, definition: 设备类型的分类，内置生产设备、检验设备和计量器具并支持用户新增, status: specified, sourceReferences: [docs/superpowers/plans/2026-09-09-equipment-modeling.md]}
      - {id: concept.equipment-type, name: 设备类型, definition: 注塑机或模温机等某一种类设备, status: specified, sourceReferences: [docs/superpowers/plans/2026-09-09-equipment-modeling.md]}
      - {id: concept.equipment, name: 设备, definition: 具体某一台设备, status: specified, sourceReferences: [docs/superpowers/plans/2026-09-09-equipment-modeling.md]}
    relationships:
      - {id: relation.equipment-category-types, sourceId: concept.equipment-category, targetId: concept.equipment-type, cardinality: one-to-zero-or-many, description: 分类下维护设备类型, sourceReferences: [docs/superpowers/plans/2026-09-09-equipment-modeling.md]}
      - {id: relation.equipment-type-instances, sourceId: concept.equipment-type, targetId: concept.equipment, cardinality: one-to-zero-or-many, description: 类型下登记具体单台设备, sourceReferences: [docs/superpowers/plans/2026-09-09-equipment-modeling.md]}
    rules:
      - {id: rule.equipment-purchase-date-not-future, name: 采购时间不得晚于今天, status: specified, trigger: equipment.save, condition: {all: [{fact: equipment.purchaseDateIsFuture, operator: equals, value: true}]}, result: {type: block, message: 采购时间不能晚于今天}, sourceReferences: [docs/superpowers/plans/2026-09-09-equipment-modeling.md]}
    executionContracts: []
  inferred:
    - {id: inference.equipment-purchase-fields, statement: 品牌与采购时间可空，品牌最多128字并去除首尾空格，采购时间使用日期YYYY-MM-DD，旧列偏好按默认相邻位置插入新增列, rationale: 兼容已有设备与个人列设置，不引入采购流程或时区转换, relatedIds: [concept.equipment]}
    - {id: inference.equipment-reference-protection, statement: 内置分类固定保留且被引用的分类和类型不可删除，新增记录必须选择上级, rationale: 沿用分类维护惯例并保证引用完整性，属于当前实现假设不冒充用户明确业务决策, relatedIds: [concept.equipment-category, concept.equipment-type, concept.equipment]}
  unresolved: []
  impactAnalysis:
    level: L2
    directImpacts:
      - {area: equipment-purchase-date-limit, change: 本轮L1补充采购日期不得晚于今天，日期选择器设置max、手动输入提示并阻断保存、后端按服务器当日校验；沿用本地自然日，不改变可空及历史数据, evidenceReferences: [gmp-platform/frontend/src/pages/master-data/EquipmentPage.tsx, gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/controller/EquipmentController.java]}
      - {area: equipment-purchase-fields, change: 单台设备新增品牌和采购日期的实体请求响应保存回显及列表字段，品牌位于型号前, evidenceReferences: [gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/entity/Equipment.java, gmp-platform/frontend/src/pages/master-data/EquipmentPage.tsx]}
      - {area: master-data, change: 新增分类与类型 CRUD，完善已有设备接口，新增菜单和页面, evidenceReferences: [gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/controller/EquipmentController.java, gmp-platform/frontend/src/pages/master-data/EquipmentPage.tsx]}
      - {area: equipment-system-fields, change: 两页补齐创建人创建时间更新人更新时间，服务端记录当前真实操作者并只读返回，标准列纳入个人字段设置, evidenceReferences: [gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/controller/EquipmentController.java, gmp-platform/frontend/src/pages/master-data/EquipmentPage.tsx]}
    transitiveImpacts:
      - {area: menu-management, change: 已保存菜单归一化必须加入设备建模并不再剔除设备路径, evidenceReferences: [gmp-platform/frontend/src/utils/menuManagement.ts]}
    potentialImpacts: []
    unaffectedAreas:
      - {area: production-runtime, reason: 不新增生产选机、校准、维修或保养流程}
    compatibilityAndMigration:
      - {area: equipment-purchase-fields, change: 0075仅新增可空brand及purchase_date列，历史行保留且不推断采购信息，回滚仅删除新增列；旧请求仍可提交，旧列配置保留既有排序显隐及宽度}
      - {area: database, change: 新建分类表并为类型增加可空分类引用，保留旧设备和类型数据及原设备 URL，不猜测历史分类归属}
      - {area: system-fields, change: 0074为类型和设备新增可空created_by/updated_by，仅按匹配租户实体的既有CREATE和最新CREATE/UPDATE审计回填，姓名缺失使用账号，无依据留空，原时间和审计不改写；回滚仅移除新增列}
    snapshotImpacts: []
    auditImpacts:
      - {area: equipment-purchase-fields, change: 品牌和采购日期纳入原有设备前后快照，沿用空值省略规则；审计界面新增两个中文字段名称映射}
      - {area: master-data, change: 新增修改删除记录变更前后快照，沿用 AuditEvent 与 AuditContext}
      - {area: system-fields, change: 沿用工序管理系统字段记录方式，操作者取AuditContext而非客户端；创建同时记录创建和更新人员，编辑保留创建信息并更新更新人员，既有业务快照及无业务变化不重复审计的规则不变}
    permissionImpacts:
      - {area: authorization, change: 沿用现有 master-data.equipment 权限覆盖两个页面对应接口，不扩展角色授权}
    testImpacts:
      - {scope: equipment-purchase-fields, scenarios: [创建和编辑持久化, 清空, 非法日期, 超长品牌, 审计前后值, 历史行迁移和回滚, 旧列偏好补列, 日期无时区转换], evidenceReferences: [gmp-platform/backend/src/test/java/com/zencas/edhr/masterdata/controller/EquipmentControllerIntegrationTest.java, gmp-platform/frontend/scripts/test-equipment-modeling.mjs]}
      - {scope: equipment-modeling, scenarios: [内置分类初始化, 分类类型设备增删改查, 筛选分页, 无效及重复输入, 引用保护, 权限, 审计, 历史迁移, 菜单恢复, 页面交互], evidenceReferences: []}
    evidenceGaps:
      - 最新迁移和运行启用结果按下方分轮证据记录；空真实库的有数据验证在隔离数据库进行，不把空表界面验证当作CRUD实测。
  extensionStrategy:
    selectedPaths: [product-core]
    rationale: 设备建模属于标准主数据能力，复用现有领域及菜单归一化
    ownershipBoundaries:
      - {owner: main, responsibility: 后端及迁移、基础测试和集成验收}
      - {owner: frontend-implementer, responsibility: 两个设备页面、API 客户端、路由、菜单和相关前端测试}
      - {owner: business-knowledge-modeler, responsibility: docs/knowledge 与相关架构投影}
  affectedFiles:
    - {path: gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/controller/EquipmentController.java, changeType: update, reason: 单台设备接口完整性}
    - {path: gmp-platform/frontend/src/pages/master-data/EquipmentPage.tsx, changeType: update, reason: 单台设备维护页面}
    - {path: gmp-platform/frontend/src/utils/menuManagement.ts, changeType: update, reason: 恢复设备建模目录}
    - {path: docs/knowledge/ontology.yaml, changeType: update, reason: 确认的三级概念关系}
  acceptanceScenarios:
    - {id: scenario.equipment-purchase-date-limit, given: 新增或编辑设备, when: 输入今天明天过去日期或清空采购时间, then: 今天过去和空值可保存，未来日期前后端拒绝且不产生设备变更或成功审计, evidenceRequirements: [边界测试, 接口测试, 浏览器检查]}
    - {id: scenario.equipment-brand-purchase, given: 编辑或新增单台设备, when: 填写设备品牌与采购时间后保存并重新打开, then: 品牌位于型号之前且两个字段持久化回显并可清空，已有设备和设备类型不受影响, evidenceRequirements: [接口与数据库测试, 迁移验证, 前端偏好测试, 浏览器检查]}
    - {id: scenario.equipment-system-fields, given: 两页均有已有个人列配置, when: 展示标准四列并由不同用户创建和编辑记录后刷新, then: 创建信息保留且更新人来源真实登录用户，四列可设置且旧偏好不丢失, evidenceRequirements: [集成测试, 数据库迁移验证, 字段偏好测试, 浏览器检查]}
    - {id: scenario.equipment-menu, given: 已存在菜单配置, when: 打开数据模块, then: 展示设备建模及设备类型和设备列表, evidenceRequirements: [菜单测试, 页面检查]}
    - {id: scenario.equipment-category-type, given: 内置三个分类, when: 新建自定义分类并在该分类下新增类型, then: 分类切换和刷新后仍正确显示类型, evidenceRequirements: [接口测试, 持久化验证, 页面检查]}
    - {id: scenario.equipment-instance, given: 生产设备分类下有注塑机类型, when: 新建注塑机001并选择该类型, then: 设备列表展示该单台设备并持久化类型关联, evidenceRequirements: [接口测试, 页面检查]}
```

## 首轮验证证据（表格规范补齐前）

- Java 21：`mvn -Dtest=EquipmentControllerTest,EquipmentControllerIntegrationTest,BusinessKnowledgeModelTest test`，64 项全部通过（3 单元、8 H2 集成、53 知识校验），日志 `/tmp/zencas-equipment-backend-tests.log`。
- PostgreSQL 18 隔离数据库：同一 `EquipmentControllerIntegrationTest` 8 项全部通过，覆盖 CRUD、审计回滚、权限、并发编码唯一性、历史分类空值、迁移重复执行和回滚、旧孤立引用保留及新无效引用阻断；日志 `/tmp/zencas-equipment-postgres-tests.log`。
- 前端 `npm run build`、`verify:menu-management`、`test:equipment-modeling` 5 项、`test:generic-ui` 13 项及聚焦未使用变量/any lint 通过。仓库没有常规 ESLint 配置，未声称全量 lint 通过。
- `verify:system-menu-pruned` 的 4 个表单模板检查失败，经独立质量角色与 HEAD 核对为原有问题，非设备改动回归。
- 完整应用在原开发库的隔离克隆 `zencas_equipment_qa_20260909` 上启动，8086 后端自动执行两个 0073 changeset，3002 前端代理该后端。现有 8081/3000 服务未替换。
- CUA 浏览器真实操作：使用隔离测试账号（id=-9901）已有设备权限角色登录，确认设备建模两个入口；内置三分类展示；创建“辅助设备QA”分类、“模温机QA / QA-T001”类型、“模温机001QA / QA-E001”设备，型号 M100、序列号 SN100。刷新后设备仍存在，编辑型号为 M200 后正确回显。
- CUA 真实引用保护：删除上述类型显示“该类型下存在设备，不能删除”；删除上述分类显示“该分类下存在设备类型，不能删除”，失败后对话框保留、记录仍在。
- CUA 视觉：默认 1280×720 展示分类左侧、类型右侧；900×800 自动上下排列且分类与行操作可见，表格横向滚动独立。已恢复默认视口。
- 只读 SQL 确认设备类型/分类关联及 M200、SN100 持久化，新增三级对象 CREATE 与设备 UPDATE 审计均有真实操作者和快照散列。
- 权限边界：克隆库现有 ADMIN 角色未被授予 `master-data.equipment`，该账号设备菜单隐藏、接口 403；带既有设备权限的测试账号可用。不自动扩大任何现有账号权限。无权限账号需通过角色管理授予既有设备权限后使用。
- 本体门禁 `ontologyResult.result: updated`，基线保持 0.3.12，新增知识为 implemented/internal。
- 独立质量门禁 `qualityResult.result: passed`，基准与 HEAD 均为 `cb3cfc13ea70951b6d70af55f66dfdfd6e5234a7` 加上述工作树改动，无功能阻断发现。轻微视觉一致性（63px 表头、100px 操作列及弹窗分组）未扩大为额外改造。
- `mvn -DskipTests package` 成功生成 `gmp-platform/backend/target/edhr-0.0.1-SNAPSHOT.jar`；日志 `/tmp/zencas-equipment-package.log`。测试已在此前单独执行，打包阶段不重复运行。
- 收尾已停止本次 8086/3002 临时服务，删除两座本次创建的隔离数据库与克隆 SQL 文件；保留测试日志。现有 8081/3000 服务及业务数据库未替换，未提交或推送。

## 用户补充要求与本地启用（2026-09-09）

- 用户确认备份并重启本地后端、给当前管理员补齐设备权限，同时要求对照其他页面补齐设备表格规范。继续沿用本功能 L2 门禁；展示偏好不改变三级设备模型，无新增本体语义。
- 对照 `docs/frontend/list-page-guidelines.md`、`ProcessModelingPage`（工序/物料）和 `UserPage`：两个设备页面新增字段显隐、拖拽排序、至少保留一列、恢复默认；列宽和字段配置按当前用户与页面分别持久化。表头拖拽具有可见手柄，窄列标题省略，操作列固定 96px；统一表头48px、数据行40px、查询控件40px、分页56px及分组编辑弹窗和 ConfirmDialog。
- 本轮只修改 `EquipmentPage.tsx` 和 `test-equipment-modeling.mjs` 及本文。8 项设备测试、13 项通用 UI 测试通过；前端完整构建通过，日志 `/tmp/zencas-equipment-ui-build.log`。首轮后端/迁移代码无继续改动，复用已通过的原始测试证据。
- 首次本轮独立复核发现 QF-EQUIPMENT-TABLE-001：查询输入框34.125px。已补显式40px并在两个页面实测（设备列表两个查询输入均40px，分页选择32px）；修复后重新完整构建通过。最终由全新实例复核。
- 本地完整数据库备份已用 `pg_restore --list` 校验，目录 `/Users/wangzilin/.local/share/zencas/backups/equipment-20260909-012100/`，包括 `edhr_dev.dump`、旧进程启动命令、启用的 `activation.jar`、权限变更前列表和新服务日志。该 JAR 是本次启用产物，不是旧服务回滚产物。
- 8081 旧进程69204正常终止并释放端口，Java21新进程75321从备份目录中固定的 `activation.jar` 启动；3000既有前端开发服务保留。两个0073 changeset均 EXECUTED，Liquibase锁已释放，api-docs返回200。
- 通过现有角色权限 API 给 ADMIN（角色1）追加既有设备权限43：590→591，回读集合验证原权限全部保留，操作使用现有审计机制。新登录后设备分类、类型与单台设备三个接口均200；生产设备、检验设备、计量器具内置分类正常。未在真实库新增测试业务对象。
- 3000实际浏览器验收：字段编码拖至名称前，隐藏分类，刷新后仍保持顺序/显隐；编码列281px拖至391px，刷新仍391px；仅剩一个数据字段时复选框禁用，恢复默认后完整字段恢复。切到设备列表配置独立。
- 1280px视口实测表头48px、操作列96px；横向滚动296px后操作列右边1258px与容器右边1259px相差边框1px。768px窄屏文档宽768px、表格容器458px、内部表格1266px，无文档横向溢出；查询区改为单列。编辑弹窗分组和分割线已实际查看。浏览器未在真实空表验证有数据行高度，40px数据行由源码规范及既有CRUD证据支持。
- 全新独立实例 `quality_equipment_release` 最终 `qualityResult.result: passed`，基线0.3.12，base/head均为 `cb3cfc13ea70951b6d70af55f66dfdfd6e5234a7` 加本设备功能工作树；QF-EQUIPMENT-TABLE-001已关闭。独立重跑8+13项与菜单校验通过，独立浏览器实测两个页面查询40px、表头48px、操作96px；设备名称列220→300px刷新保留，恢复默认成功；独立只读确认迁移、锁、备份、进程及权限集合仅增加43。
- 权限审计SQL确认 `2026-09-09 01:23:29.012244` 操作者admin、ROLE/UPDATE前后权限数组590→591；匿名设备接口401，新服务日志无ERROR。聚焦未使用变量/any lint通过。两个质量与主验收标签已关闭、偏好恢复默认、视口覆盖清除；服务继续运行。未提交或推送。

## 四个标准系统字段补齐（2026-09-09）

- 用户要求设备类型和设备列表补齐创建人、创建时间、更新人、更新时间。两页默认追加这四列于操作前，宽度140/160/140/160；时间沿用建模页面的 `YYYY-MM-DD HH:mm` 格式，空历史字段显示 `-`。四列参与字段显隐、排序和宽度记忆，旧个人配置自动补齐新列且保留原排序、显隐与宽度。
- Equipment、EquipmentType增加可空createdBy/updatedBy，响应补齐字段；由服务器AuditContext姓名优先账号，缺少依据留空。创建保存两个人员，编辑保留创建人和创建时间；请求中的伪造人员/时间不进入请求DTO。0074按同租户同实体的最早CREATE/最新CREATE或UPDATE审计回填人员，不改写既有时间与审计；无匹配审计留空。
- 红测 `/tmp/zencas-equipment-metadata-red.log` 先复现创建人为空。实现后 `/tmp/zencas-equipment-metadata-backend.log` 66项通过（53知识、3单元、10H2集成）；`/tmp/zencas-equipment-metadata-postgres.log` 10项PostgreSQL集成通过。新增场景包括不同用户创建/编辑、持久化后重新列表读取、客户端字段伪造无效；迁移验证实体/租户隔离、时间及ID排序、账号回退、无证据留空、时间保留、重复执行及回滚。临时测试数据库已删除。
- 前端10项测试通过，日志 `/tmp/zencas-equipment-metadata-ui-tests.log`；完整构建成功，日志 `/tmp/zencas-equipment-metadata-frontend.log`；聚焦lint和diff检查通过。最终 `mvn -Dtest=BusinessKnowledgeModelTest package` 再次校验最终53项知识测试并打包成功，日志 `/tmp/zencas-equipment-metadata-package.log`。
- 本体门禁 updated，基线0.3.12，DEC-0037-05及证据保持implemented/internal，来源区分用户字段需求与实现推断，无新业务关系或执行契约。
- 新备份目录 `/Users/wangzilin/.local/share/zencas/backups/equipment-metadata-20260909-094047/`，包含已校验edhr_dev.dump、旧运行previous.jar、新activation.jar、旧进程命令及backend.log。旧75321进程正常停止，Java21新进程96574监听8081。0074 EXECUTED，迁移锁false，两表新增人员字段均存在；api-docs200且两个响应模型字段齐全。
- 新登录后两个设备列表API均200，匿名请求401，权限未继续调整。CUA实测两页四列表头齐全、字段设置四项默认勾选；类型页隐藏创建时间刷新后仍隐藏，再恢复勾选；设备列表横向滚动后四列与右侧固定操作正常。真实库仍为空，未新增业务测试对象；非空记录值的验收证据来自上述隔离HTTP/数据库测试。
- 本轮全新 `quality_equipment_metadata` 独立质量门禁 passed，无发现，base/head仍为cb3cfc13ea70951b6d70af55f66dfdfd6e5234a7加本轮工作树，知识基线0.3.12。独立重跑10项前端及2项新增H2集成测试（`/tmp/zencas-equipment-metadata-independent.log`），浏览器确认两个页面四列及字段设置，并只读核验运行库迁移、人员字段、接口schema、进程和备份。验收标签均已关闭，测试隐藏字段已恢复，临时数据库已清理，服务继续运行。

## 设备品牌与采购时间（2026-09-10）

- 用户要求单台设备新增设备品牌、采购时间，品牌放在型号前。沿用本功能 L2 及本地备份更新授权。新增/编辑表单、默认列表与字段设置均加入两项；品牌在型号前、采购时间在序列号后。品牌可空、最多128字符并裁剪首尾空格，采购时间使用可空日期选择器和YYYY-MM-DD，无时区转换。旧字段偏好按默认相邻位置插入新增列并保留既有排序、显隐、宽度。
- 后端实体、请求、响应、保存及设备审计快照均增加两项。非法日期与超长品牌返回400，可编辑及清空；审计沿用既有空值省略规则，审计界面增加两个中文名称映射。0075仅增加equipment.brand和purchase_date可空列，历史数据不回填猜测值，回滚仅删除新增两列。
- 红测先复现品牌未保存（`/tmp/zencas-equipment-purchase-red.log`）。最终68项通过（53知识、3单元、12H2集成），日志 `/tmp/zencas-equipment-purchase-backend.log`；12项PostgreSQL集成通过，日志 `/tmp/zencas-equipment-purchase-postgres.log`，隔离数据库已删除。新增测试覆盖保存回读、编辑清空、闰日及无效日期、超长品牌、审计前后值，0075历史行保留、重复执行及回滚。
- 前端12项聚焦测试、审计页面静态检查及完整构建通过，日志分别为 `/tmp/zencas-equipment-purchase-ui-tests.log`、`/tmp/zencas-equipment-purchase-audit-ui.log`、`/tmp/zencas-equipment-purchase-frontend.log`。最终53项知识检查和打包成功，日志 `/tmp/zencas-equipment-purchase-package.log`。本体结果updated，基线仍0.3.12，DEC-0037-06 implemented/internal；新增信息为设备属性，无新概念关系或采购流程。
- 已校验数据库备份与旧运行JAR位于 `/Users/wangzilin/.local/share/zencas/backups/equipment-purchase-20260910-004851/`。96574正常停止，Java21新进程38851从activation.jar启动并监听8081，3000原前端保留。0075 EXECUTED、迁移锁false、API schema200含新字段；新登录设备和类型接口200、匿名401。完整比对迁移前后现有1设备和1类型旧字段及时间均不变，新增字段为null；未修改真实业务记录，日志无ERROR。
- CUA实际检查编辑已有设备，品牌在型号前，采购时间日期选择器与状态同排，原型号03与序列号0001保留；取消未保存。刷新后字段设置两项默认勾选、顺序正确。非空保存清空与审计的验证来自隔离HTTP/数据库集成测试，不声称在真实库做过写入测试。
- 全新独立质量实例 `quality_equipment_purchase` 复核通过：独立12项前端测试、审计静态检查及2项新增H2集成测试（`/tmp/zencas-equipment-purchase-independent.log`）；独立CUA确认编辑顺序、日期控件、旧值和字段设置，取消并关闭临时标签；只读SQL确认0075、可空列、锁和旧字段全部保留，无发现。基线0.3.12，base/head为cb3cfc13ea70951b6d70af55f66dfdfd6e5234a7加设备功能工作树。未提交或推送。

## 采购时间不得晚于今天（2026-09-10）

- 本轮L1：用户明确要求限制未来采购日期。日期输入设置本地今天为max；手动输入未来日期显示“采购时间不能晚于今天”并禁用保存，提交时重新检查；后端创建和更新统一按服务器当前自然日校验。今天、过去和空值保留可用。不新增迁移、权限或采购流程，已有记录不改写；若有历史未来值，编辑保存前需改为有效日期或清空。
- 后端新增边界测试先红（未来日期原返回200），实现后13项集成通过，覆盖未来新增/更新拒绝、原值与审计不变、今天过去及空值接受；日志 `/tmp/zencas-equipment-date-limit-red.log`、`/tmp/zencas-equipment-date-limit-backend.log`。前端13项测试通过（含月末、年末及本地午夜），完整构建成功，日志 `/tmp/zencas-equipment-date-limit-frontend-tests.log`、`/tmp/zencas-equipment-date-limit-build.log`。最终53项知识校验和打包成功，日志 `/tmp/zencas-equipment-date-limit-package.log`。本轮无SQL变更，未重复PostgreSQL迁移套件。
- CUA实测编辑已有设备，输入明天后出现中文错误且保存禁用，改为今天错误消失且保存恢复；最后取消，原品牌恩格尔、型号03、序列号0001、采购日期2026-07-09保留。未保存真实设备。
- 本体结果updated，基线0.3.12；新增rule.equipment-purchase-date-not-future、DEC-0037-07及证据，保持implemented/internal。
- 备份目录 `/Users/wangzilin/.local/share/zencas/backups/equipment-date-limit-20260910-010214/` 包含已校验数据库dump、旧previous.jar、新activation.jar和设备快照。旧38851正常停止，新Java21进程41416监听8081，api-docs200。实测未来日期API返回400“采购时间不能晚于今天”（使用已确认不存在的类型0，避免意外业务写入），完整设备快照比对不变。3000前端保留，未提交或推送。
- 独立质量实例 `quality_purchase_limit` 重跑13项前端及1项新增日期边界集成测试通过，日志 `/tmp/zencas-equipment-date-limit-quality-frontend.log`、`/tmp/zencas-equipment-date-limit-quality-backend.log`；核对日期上限、错误提示、保存拦截、服务端边界和拒绝无写入审计断言，无发现。本轮聚焦日期限制，未扩大为全系统回归。
