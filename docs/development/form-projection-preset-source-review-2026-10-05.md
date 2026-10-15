# 查找项与业务用途预置清单：冠骋原始源码复核

核对日期：2026-10-05。首轮项目基线：`form-traceability-projection` / `ca30878fc2eaab31b0278312231bf95e2d7ab0fa`；同日设计器整体补查基线为 `2741842f2a3baeaa91b9e50b2833cfe156cfa754`，知识基线均为 `0.3.24`。本轮是同一功能切片的 L2 研究与证据增量，不修改代码、数据库、运行默认或旧快照。

## 当前实现，而非完整 MVP

**管理员维护查找项目录尚未实现。**设计器通过只读 `/projection-catalog` 接口读取代码中的固定目录；没有本功能的查找项新增、编辑、停用及管理授权闭环。

| 类别 | 当前已内置 | 源码证据 |
| --- | --- | --- |
| 查找用途 `formTrace` | 物料批号、序列号、设备编号、责任班组、关联单据号 | `FormProjectionInterpreter.java:21–25,38` |
| 正式报工 `production` | 良品数量、不良品数量、单位；班组、关联单据号为补充信息 | 同文件 `:39,94–95` |
| 报废记录 `scrap` | 物料、物料批号、数量、单位；原因、分类、班组、关联单据号为补充信息 | 同文件 `:40,96–98` |
| 实际物料消耗 `consumption` | 物料、物料批号、数量、单位；原因、分类、班组、关联单据号为补充信息 | 同文件 `:40,96–98` |

上述解释器位于 `gmp-platform/backend/src/main/java/com/zencas/edhr/template/service/`；目录入口位于 `template/controller/TemplateModelingController.java:254–257`。查找用途不生成统计合计，不能将它算成第四种统计模型。

报表查询接口目前固定支持上述五种文本属性以及单位、原因、分类，另有真实生产对象编号／ID、工序名称／ID筛选；它不是客户自定义目录。当前 `formTrace` 沿最终完成投影链路查询成功批次，多条件落在同一投影记录，尚未实现未来独立索引的状态范围与更新契约。证据：`production/controller/FormProjectionController.java:30–53,72`、`frontend/src/pages/reports/FormProjectionReportPage.tsx:19–21`（路径均相对 `gmp-platform/`，后端控制器同上 Java 根目录）。

当前正式报工没有独立“工序产出数量”属性，批次最终产出及工单汇总联动也未实现。良品数量不能未经口径确认充当该数量；这属于已确认语义的实现差距，不能借本次清单提炼隐去。

## 冠骋原始定义与实际消费

证据类型：`original-evidence`。本轮直接读取外部源码根目录 `/Users/ivenwang/Documents/iven space/gct-edhr-bed/gct-edhr-bed/src/main/java/com/gct/apaas/edhr`；下表路径相对此根目录。该源码不随本分支分发，未获得可标识的 Git HEAD，关键文件以文末 SHA256 标识。本轮没有运行冠骋页面或其外部平台 SDK。

| 冠骋字段／字段族 | 原始代码事实 | 对本项目的提炼 |
| --- | --- | --- |
| LOT/SN `material_no` | `EDHRFieldTypeEnum.java:10`；`MaterialNoFieldStructureHandler.java:19` 绑定 `PRODUCTION_IDENTIFICATION` | 生产批号／产品序列号的线索，不能按变量名误认成物料批号 |
| 设备、产品、工单 | 枚举 `:8–11`，字段处理器分别绑定 DEVICE、PRODUCT、MFG_ORDER；反查请求消费设备 ID、产品 ID、工单 ID | 业务身份可成为查找含义；文本检索与实体引用职责分开 |
| 记录单号、追溯日期 | 枚举 `:14–15`；反查请求消费记录单号及追溯日期范围 | 记录编号与日期含义可借鉴；日期不是系统修改时间 |
| 订单号、事务、E-SOP | 枚举有定义；`OrderNo.java` 分组为 BIZ；本次反查入口没有消费订单号 | 不能把枚举、文件所在目录或业务动作一律当成已支持的追溯查询项 |
| 报工字段 | 枚举 `:18–36`；抓取服务读取工序节点、良／不良／报废数量、起止时间、工时、生产日期、报工人和原因分类 | 数量是度量；日期／人员是维度；工序归属和身份有真实上下文约束，不是一份同层选项清单 |
| 检验字段 | 枚举 `:32–34,40–46` 有检验数、结论、人员及时间定义 | 字段定义不证明完整统计消费；本次未确认完整检验报表消费者，不能据此定合格率或缺陷口径 |
| 消耗、仓储字段 | 抓取服务处理 MATERIAL_CONSUME 子表、实耗／需求量及仓储出入子表，并调用库存处理 | 实耗、需求、上料、领退料、出入库需区分；查找／统计投影不自动执行库存动作 |

精确来源：`model/enums/EDHRFieldTypeEnum.java:6–56`；`model/handler/structure/MaterialNoFieldStructureHandler.java:19`；`model/field/trace/OrderNo.java`；`model/handler/structure/MfgOrderFieldStructureHandler.java`；`model/handler/ProductFieldBizHandler.java`、`model/handler/DeviceFieldBizHandler.java`；`notebook/method/NotebookReverseListMethod.java:76–105`；`bizProcess/service/OnlineFormDataCatchService.java:112–198,626–697,713–789,796–958`。枚举里的普通 OPERATION 与活跃的 ROUTING_OPERATION 也不能混淆：`model/field/report/Operation.java:17` 的服务注解被注释。

### 不直接复制的查询与汇总行为

- 冠骋 `notebook/FormTraceManager.java:223–249` 从子表收集字段值集合，`:134–166` 对各类集合做笛卡尔组合。这条构建路径不保留原子表行配对；若把它用作“同一行同时满足”证据，会有跨行组合风险。本轮静态核对不能断言其所有查询都存在错误。我们必须显式区分同表单分别命中与同明细同时满足，保留来源位置，不据此关闭待定项。
- `service/ProductNumDataService.java:39–81,114–154` 按批次／工序节点汇总，并使用最终产出标记：指定节点良品合计更新批次，再汇总工单。可借鉴层级；其取良品和缺失值处理不替代本项目用户已确认的产出数量语义。
- `OnlineFormDataCatchService.java:353–385` 在部分路径加入表头记录与子表记录。如果两处记载同一事实，机械相加会有重复风险；不能因表头与子表都能配置就默认重复计入。

## 建议预置的查找含义（候选，尚未新增到运行目录）

以下优先级与命名是 `inference`，不是用户已确认的默认清单。产品提供常用含义，管理员补充供应商批号、灭菌锅次等客户查找项，制表人员只将普通字段／子表列关联到含义；不用为每个新含义增加一种字段组件。

| 优先层 | 建议项 | 边界及当前差异 |
| --- | --- | --- |
| 常用候选 | 生产批号、产品序列号 | 提炼冠骋 LOT/SN，但分开两种含义。现有序列号保留原身份，不能静默改成产品专属；生产对象上下文与表中填写值分开 |
| 常用候选 | 物料批号 | 保留现有项；不与生产批号或供应商批号混为一个身份 |
| 常用候选 | 设备编号、工单号、产品编码 | 设备已有文本项；工单、产品查找绑定尚未实现。字段映射查找不证明设备使用、工单归属或产品版本关系 |
| 常用候选 | 记录单号 | 提炼冠骋明确反查入口；表单实例号与填写的业务记录单号须区分，不能直接替换现有“关联单据号” |
| 兼容／补充 | 责任班组、关联单据号 | 当前已有，保留；不能声称它们均来自冠骋的这条反查入口。订单号也可作为补充候选，消费证据不足以提升为该入口的内置项 |
| 类型扩展候选 | 追溯日期 | 冠骋有实际范围查询；本项目日期支持、日期含义、操作符尚未定版，不能用完成／创建／更新时间代替 |

“查找含义”与“取值类型”是两层：设备编号等是查什么，文本、单选、引用、日期是如何取值和比较。当前设计器提供文本／单选候选，并不代表客户目录的首批类型、实体引用查询或日期范围契约已经确认。后续新增查找项应使用稳定身份；改名、类型变化、停用及历史补索引必须保护旧绑定和旧快照。

## 建议预置的统计用途（产品定义，MVP 保留三类）

| 用途 | 从冠骋提炼的核心信息 | 本项目范围 |
| --- | --- | --- |
| 正式报工 | 工序产出；良／不良数量作为独立指标；单位；生产日期与报工人等作为后续维度 | 保留用途；补齐独立产出属性及最终产出联动属于后续实现，不冒充已完成。按工序／用途／单位合计，不把工序间流转累加成批次产量 |
| 报废记录 | 报废物料、批号、数量、单位、原因、分类 | 保留用途；客户选择数量来源，但申请、批准、实际阶段仍不可混算或自行扣减产出 |
| 实际物料消耗 | 物料、批号、实耗数量、单位 | 保留用途；需求量、领料量、上料量不能默认当实耗；不触发库存扣减 |
| 工时、检验记录 | 起止／工时／人员；各检验数量、结论及检验审核人时 | 后续候选，未新增模型；工时口径、检验数与缺陷次数等需另定，枚举不足以确认统计规则 |
| 领退料、上卸料、仓储出入 | 来源动作、物料／批号、数量、仓库库位等 | 后续独立用途／动作候选，不能直接归并成实耗或库存事实 |

这里的单位、数量、原因、日期等是模型属性，不宜各自变成一个“业务用途”。MVP 展示产品预设统计报表，客户自定义业务报表仍在二期；本轮不新增指标公式、质量率、人员绩效或自由跨表关联。

## 决策与验证边界

- `user-confirmed`：本轮要求从冠骋追溯与业务字段提炼预置项；已确认两类用途并列、两类来源形态、按工序／用途合计、使用时快照、MVP 查找目录与二期自定义报表边界。来源为当前用户请求及 DEC-0075-17/18/19/20/21，不等于确认候选名单或所有实现细则。
- `secondary-reference`：[既有报表核对记录](form-projection-gct-report-reference.md) 仅作定位索引；上列事实已回到原始源码复核。
- `inference`：本轮候选名单、优先层与不直接复制的风险分析；候选不写入权威统计默认。
- 本轮只新增研究／来源证据，不改变数据库或端口，不回填旧数据。独立库仍为 `edhr_form_projection`；原库保留。验证只覆盖本轮文档、知识证据及原始源码一致性，不宣称运行候选项、冠骋 UI 或完整 MVP 已验证。
- 管理员目录 CRUD、动态查询条件、定义兼容与历史索引仍未实现；Q12 行身份、Q15 索引时机／状态、多条件范围、Q17 自动带入等未决项保留，A12 受控修订作废仍暂缓。

## 同日补查：表单设计器整体字段与配置

用户进一步要求总体考虑冠骋表单设计中的追溯字段和业务字段。此前读取后端定义和消费者不等于完整核对设计器；本增量直接读取原始前端及后端全部领域字段注册、相关处理器和结论字典迁移。以下是 `original-evidence`，提炼方案仍为 `inference`，没有新增预置运行项。

前端源码根目录：`/Users/ivenwang/Documents/iven space/paas-main-front`，下列前端路径相对此根目录。外部前后端均没有可读取的 Git HEAD，使用指纹记录版本线索；没有启动冠骋、执行其迁移或确认其当前租户字典值。

### 设计器的字段覆盖

`src/projects/online-form/src/views/designer/constants/index.ts:176–211` 定义 **8 种追溯字段、21 种业务字段**。同目录下 `modules/toolkit/toolkit-content-widgets/trace-widgets.vue:34–49`、`business-widgets.vue:34–49` 用这两份列表生成拖拽项；父组件 `toolkit-content-widgets.vue:3–6,19–27` 只在 eDHR 套件、简易版、非文本表单条件下显示，组合字段单元格另有过滤。这是源码中的条件性入口，不宣称所有版本／页面都无条件显示全部字段。

| 前端组／子类 | 原始字段全集 | 对本项目的候选归类 |
| --- | --- | --- |
| 追溯 8 项 | 设备、LOT/SN、关联批次、产品、工单、记录单号、订单号、追溯日期 | 查找含义与取值来源候选；不自动建立实体、单据或谱系关系 |
| 业务：工序与数量 3 项 | 工序节点、良品数、不良品数 | 工序来自真实上下文；数量属于报工模型属性，不各建一个用途 |
| 业务：报工时间与人员 5 项 | 报工开始时间、报工结束时间、工时、生产日期、报工人 | 时间／人员属性及带入候选；工时算法、业务日期和人员身份另定 |
| 业务：不良维度 2 项 | 不良原因、不良分类 | 主数据／字典来源候选；不擅定不良件数与缺陷次数 |
| 业务：报废 5 项 | 报废原因、报废分类、报废数、报废物料、报废物料批次号 | 报废模型属性；数量所处阶段与审批、处理动作分开 |
| 业务：检验数量 3 项 | 破坏性试验数量、产品检验数量、材料检验数量 | 后续检验模型的独立度量，不合并成一个检验总数或直接算合格率 |
| 业务：仓储 3 项 | 仓管员、单据编号、单据日期 | 单据属性与人员证据；出入库、领退料仍由相应业务动作决定 |

以上业务子类合计 21，不包含后端另有的检验结果／检验人等字段，也不包含实际消耗子表全部内置列。

后端 `model/field/**` 共有 **41 个类**，与本模块 `EDHRFieldTypeEnum` 的 41 项对应：trace 7、report 19、inspection 7、material 3、warehouse 3、顶层 Transaction／Esop 2。40 个类有活跃注册注解，普通 Operation 的注解被注释。后端集合和前端拖拽列表不是一一对应，不能用后端枚举代替设计器菜单：

| 后端补充组 | 全集或差异 | 处理边界 |
| --- | --- | --- |
| inspection 7 项 | 检验结果、评审结果、检验人、审核人、检验时间、审核时间、批次数量 | 结论、人员、时间、数量分别提炼；定义存在不证明完整统计或审批流程已消费 |
| material 3 项 | 需求数量、消耗数量、通用数量 | 前端类型映射支持数字组件，但不在上述 21 项内；专用消耗子表另有 BOM／上料及库存配置，需求与实耗不互相替代 |
| report 差异 | 后端还有普通工序 OPERATION（未活跃注册）；前端使用工序节点 ROUTING_OPERATION | 不将普通工序声明当成可操作的活跃字段 |
| trace 差异 | 前端多出关联批次 RELATED_LOT_NO；本次提供的 eDHR 后端模块没有对应类／枚举项 | 前端确有渲染和取值分支；外部平台 SDK 的完整关联语义未获得，不把它定义成正式上下游关系 |
| Transaction／Esop | 事务为 LOGIC/TEXT、字典取模型元数据；E-SOP 为 LOGIC/LONG_TEXT | 系统／文档配置，不应变成普通查找项或自动生产动作 |

### 配置项、选项值和默认值分开

| 能力 | 原始证据 | 可借鉴及限制 |
| --- | --- | --- |
| 记录单号的唯一／链接模式 | 前端 `trace/trace-props.vue:13–24,72–103,144–148`，唯一模式子模型禁用；文案在 `src/locales/lang/zh-CN/sys/onlineForm.ts:696–698` | 可识别不同单据意图；不能把页面文案当作后端全局唯一已验证证明，也不由同文本直接建立正式关系 |
| 日期默认与引用联动 | `trace-props.vue:42–52,124–132`；`ref/ref-props.vue:14–32,67–76` | 当前日期和选中引用后带出属性是取值配置，不属于查找或统计口径 |
| 业务字段重名约束 | `designer/hooks/reverse-modeling/useReverseModeling.ts:274–283` 检查同模型已有相同业务类型 | 本项目主表可有多笔分散来源，不能复制每模型仅一份同类型的限制，仍须明确配对与重复计数边界 |
| 数量及工时类型 | 后端数量类映射 DOUBLE；`WorkHours.java` 为 DECIMAL，`WorkHoursFieldStructureHandler.java:17` 设 digits=1；前端默认值与范围编辑见 `double/double-props.vue:13–25` | 提炼数量／精度能力，不复制浮点或一位精度作为统计契约；字段定义不证明工时公式。默认未填不等于 0 |
| 原因／分类字典 | 后端 `NotGoodReason/GroupFieldBizHandler`、`ScrapReason/GroupFieldBizHandler` 引用相应主数据 | 可预置属性含义和字典来源类型，实际原因／分类值由客户主数据维护，不虚构通用原因列表 |
| 检验结论选项 | 后端 `InspectionResultFieldStructureHandler.java`；原始迁移 `upgrade/601/changelog-inspection_result_601.xml:29–30,50–51` 为 qualified 合格、unqualified 不合格 | 结论字典候选；不是本项目已采用的默认，不自动认定完成即合格或放行 |
| 评审结论选项 | `ReviewResultFieldStructureHandler.java`；同目录 `changelog-review_result_601.xml:29–30,50–51,71–72,92–93` 为 concession 让步接收、sorting 挑选使用、scrap 报废、reject 退货 | 处置字典候选；选择值不自动执行审批、报废、退货或库存动作 |

配置组件短路径相对前端 `src/projects/online-form/src/views/__cell_widgets__/`；后端 Java 定位相对前述 eDHR Java 根目录；两份字典迁移相对后端项目的 `src/main/resources/com/gct/apaas/liquibase/suit/edhr/`。迁移只证明原始初始化选项，当前租户是否改动、完整运行校验均未确认。

默认带入确有前端实现线索：`packages/nocode-base/src/hooks/useRenderPageFactory.ts:489–522` 取得产品、工序、工单数据，将主 LOT、关联 LOT、产品、工序、工单及默认用户／组织交给 `packages/nocode-base/src/interface/render.ts:1288–1372`；后者形成各主表／子表的默认值和引用属性映射。设备不在该函数的默认取值分支，不能宣称自动带入当前设备。默认用户不等于报工签署人：`packages/nocode-base/src/interface/util.ts:610–611,664–665` 将报工人和仓管员渲染为签名组件；后端用户系统变量转换也不足以证明自动默认签署身份。

`useReverseModeling.ts:184–191` 创建字段时默认值为 NONE；日期的当前系统值、引用联动、生产上下文默认、客户输入的固定默认值属于不同来源。上述静态实现不能替本项目确定 Q17 的取值时点、覆盖、重开刷新、证据持久化及多设备策略。

### 本项目总体提炼建议

“预设哪些值”本轮按可选含义、用途、属性、取值来源与字典选项理解，**不代表给业务数量、日期或人员自动填默认数据**。建议在研发清单中分五类，但客户侧仍按场景渐进展示，不做五栏全铺开的配置页：

1. **查找含义**：常用候选沿用前文七项；新增关联批次、订单号为补充候选，日期为类型扩展候选。保留现有班组与关联单据身份。客户还可在产品支持类型内维护查找项。
2. **统计用途**：MVP 沿用报工、报废、实耗三类；检验、工时、仓储／领退料列为后续用途候选，不因发现更多字段就扩大首期报表范围。
3. **模型属性与字典来源**：提炼产出／良品／不良／报废／实耗／需求／各检验数、单位、物料、原因分类、业务日期／人员等候选，按用途显示可选属性。已确认独立产出数量仍待实现；其他属性未全部作为运行项启用。原因分类建议选择现有主数据；检验／评审选项只列候选，无预选结论或动作联动。
4. **取值来源**：手填、固定默认、主数据引用联动、真实上下文带入、系统当前日期是候选来源。数量不自动为 0；业务日期不默用更新时间；签署人不默用登录者；设备不假设工序只有一台。Q17 收敛前不新增默认规则。
5. **业务动作**：事务、E-SOP、审批放行、库存等继续由各自模块执行，不因“用于查找”或“用于统计”配置而自动触发。

子表优先按每行记录一次配置列含义；主表保留多笔分散字段配对能力。借鉴业务词汇、受控字典及引用带入，继续使用普通文本／数字／日期／单选／引用组件，不按竞品的每个业务词汇新增专用字段类型。共享表头、系统行身份、独立索引状态和目录兼容仍按已有未决项处理。此分层是候选设计，不是新增运行契约或客户易用性已验证结论。

## 原始文件指纹

2026-10-05 本机读取的 SHA256（路径相对上述冠骋根目录）：

| 文件 | SHA256 |
| --- | --- |
| `model/enums/EDHRFieldTypeEnum.java` | `6162c178aea62422b35188ad01dd6646a99ceef53416a819e79583084bcac88d` |
| `notebook/FormTraceManager.java` | `acd8dd55cf721aa1a8ed3d9889b4ed5826b4401e6e35151ac734c093a4a6b405` |
| `notebook/method/NotebookReverseListMethod.java` | `9ec6e438148e0c41d4f8fac81461912d41e9519d20bbe49e165ef8d8167b17c9` |
| `service/ProductNumDataService.java` | `624b0c513dae3dc8542db599770630518bb2576222dca04339780393d83c2196` |
| `bizProcess/service/OnlineFormDataCatchService.java` | `d457a6d1c731789618e21975db57eb40ed7100792f7f12c457111dc129177cee` |

同日设计器补查的前端指纹（相对前端根目录）：

| 文件 | SHA256 |
| --- | --- |
| `src/projects/online-form/src/views/designer/constants/index.ts` | `6e5ce52b5e7fd6728bc66907552e2957f5a55b44e407eccb1b4c8efe29a3d063` |
| `src/projects/online-form/src/views/designer/modules/toolkit/toolkit-content-widgets/toolkit-content-widgets.vue` | `f41ad856b4df214f81e2e2fdf1a63fc0fa2cb83933f0acd95383b75b177775f6` |
| `src/projects/online-form/src/views/designer/modules/toolkit/toolkit-content-widgets/trace-widgets.vue` | `a873b269a609e0238dd2596e893a88f9a93d2890eec238bc3419c992d4eddaa3` |
| `src/projects/online-form/src/views/designer/modules/toolkit/toolkit-content-widgets/business-widgets.vue` | `64111de72b372a19a0848b8152e776758714b5a43e1abe85e8232895fea30b49` |
| `src/projects/online-form/src/views/__cell_widgets__/trace/trace-props.vue` | `51fb97564225648f098a78c25dca5b8cd41c595f5c77d1a992854d5a431f8d2b` |
| `packages/nocode-base/src/interface/render.ts` | `ab87cbe69cd55bca940bf1564d1018a57338e1f0a0173694dd4bdca9f594b8bb` |

字典迁移指纹（相对后端项目根目录）：

| 文件 | SHA256 |
| --- | --- |
| `src/main/resources/com/gct/apaas/liquibase/suit/edhr/upgrade/601/changelog-inspection_result_601.xml` | `4567e2c232f55fa3da9ee97e16adc97c719ba178c061d5859260c8c88ef1c58a` |
| `src/main/resources/com/gct/apaas/liquibase/suit/edhr/upgrade/601/changelog-review_result_601.xml` | `cdf3e9f42d49dc2ccb7f62309b56779ea43beae9ff49fe6e96c2b746f1648682` |
