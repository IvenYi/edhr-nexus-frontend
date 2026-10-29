# 冠骋 DHR／表单变更与下游影响复核

同日后续澄清见 [clarification-round.md](clarification-round.md)；最新能力盘点见 [capability-inventory.md](capability-inventory.md)，核对现有审核、封存规划与 DHR 变更缺口，并记录用户新确认的“DHR审批中先退回，再申请表单变更／作废”。下面保留此前研究与验收范围，当前补充规则以 DEC-0063-16／DEC-0068-13／DEC-0068-14 为准；各轮均未修改产品代码。

日期：2026-10-29，Asia/Shanghai。范围：用户要求在继续记录控制、DHR 与 A12 TODO 前，重新核对冠骋参考材料。执行级别 L1；本次增加内部调研材料，并同步用户随后明确确认的通知对象与渠道；不修改产品代码、数据库或既有验收结果。

## 结论与证据边界

冠骋确有 DHR 变更入口，但已核对的含义是“通过 DHR 目录定位并变更其中一张表单”。表单、DHR、记录本入口复用表单变更审批处理器，不能据名称推断存在整份 DHR 不可变修订及自动重审能力。

可直接借鉴的业务思路是：独立申请、原因与签署、批准后落实数据、状态与下游数据联动。我们已经确认的完整证据冻结、旧批准保留及人工发起新版本重审，仍应遵从本项目 DEC-0063／0068；这次未获得足以证明冠骋具有完全相同闭环的证据。竞品一致性是参照，不是合理性或合规性的证明。

证据标记：

- `original-evidence`：本次直接读取的原始 DOCX 文本、其内嵌图片及原始前后端源码；源码说明静态实现，不冒充运行结果。
- `secondary-reference`：旧调研文档，仅作检索线索，不单独支持本次事实。
- `user-confirmed`：当前仓库既有用户确认，按具体 DEC 声明定位，不把竞品行为升级为本产品需求。
- `inference`：本次方案建议、风险判断与未闭合调用链，不写入当前权威规则。

本地参考工程没有 Git 元数据，不能声明为冠骋最新发布版。原始 DOCX 中亦有重复章节和不同界面示例；本文不将所有示例解释成同一部署版本。20 个原始文件与 4 张字节一致图片的 SHA-256 见 [source-manifest.json](source-manifest.json)。没有启动冠骋、调用其接口或更改其数据。

eDHR 核对基线为 `2f46b5f66af44ea5973b9ead93f6eb85e62dbcc7`。本轮获取到目标分支 `edhr-dev@635711f97e9b794f4af02e1e5d1939bb2ecf920f`；相对原目标 8784ba87，PR42 改动主数据数值边界与设计器标题，项目／角色／交接契约、知识及本文直接引用的 DHR／投影服务无增量。本轮未合并新目标，也不将此前集成质量通过扩展为新组合验收。

## 1. 冠骋的“DHR 变更”具体是什么

`original-evidence`：原始 `/Users/ivenwang/Documents/iven space/edhr探索之旅.docx` 的 `word/document.xml` 零基段落 2691～2693 明确说明：以 DHR 形式变更目录中的表单，操作同表单变更；段落 6258～6269 的示例为批次／SN 查询、选中表单、修改产品料号、提交及查看批注／日志。可复核的原文抽取见 [original-document-excerpts.txt](original-document-excerpts.txt)。

原始 DOCX 图片（直接解压，未经编辑）：

- [DHR 目录中的变更入口](../../screenshots/2026-10-29-crown-dhr-change/rId588-image583.png)：左侧批次／SN、目录和实例，右侧选中表单及表单变更／作废按钮。
- [进入单张表单编辑](../../screenshots/2026-10-29-crown-dhr-change/rId589-image584.png)。
- [DHR 内选中表单并填写变更原因](../../screenshots/2026-10-29-crown-dhr-change/rId741-image736.png)。
- [另一示例的双签提交弹窗](../../screenshots/2026-10-29-crown-dhr-change/rId743-image738.png)：只能证明该示例展示双签，不能替代现有源码的签署实现核对。

`original-evidence` 前端：

- `crown-front/src/projects/web-render/src/views/edhr-application/render/record-change/edhr-change.vue:2` 复用同一个容器，传入 `recordType="eDHR"`。
- `record-change/record-change-container.vue:5` 显示 DHR 目录，`:22` 打开选中表单实例，`:88` 采用 `pageType: 'record-change'`。
- `crown-front/src/projects/online-form/src/views/integration/apaas_ebr/hooks/useEbrWikiFactory.ts:247` 开放批注、作废、变更按钮，`:253` 用 `DHR_CHANGE` 区分入口。
- `crown-back/approve/factory/ProcessHandlerFactory.java:35` 将 `FORM_CHANGE`、`DHR_CHANGE`、`NOTEBOOK_CHANGE` 映射到同一个表单处理器。

以上 `crown-front` 为 `/Users/ivenwang/Documents/iven space/paas-main-front`；以下 `crown-back` 为 `/Users/ivenwang/Documents/iven space/gct-edhr-bed/gct-edhr-bed/src/main/java/com/gct/apaas/edhr`。完整路径与哈希见 manifest。

## 2. 从申请到生效

| 阶段 | 冠骋静态证据确认的行为 | 原始锚点 |
|---|---|---|
| 提交变更 | 要求表单 COMPLETED 及所选审批模板；保存请求、旧实例参数、实例身份、变更编号；启动独立业务审批 | `approve/biz/OnlineFormChangeBs.java:98` |
| 申请期间 | 表单状态改为 IN_AUDIT；不是在此把拟数据写成正式业务值 | 同文件 `:128`；`:139` 的记录追踪调用不等于应用拟数据 |
| 提交作废 | 保存原状态和作废申请，启动审批，再改为 IN_AUDIT；此入口只明确排除 IN_AUDIT，不能外推完整活动表单作废政策 | `approve/biz/OnlineFormAbandonBs.java:76` |
| 审批结束 | 流程表调用平台 change，普通表调用平台 submit，作废调用平台 abandon；再写完成／作废状态，并调用 DHR 状态刷新 | `approve/handler/business/OnlineFormChangeProcessHandler.java:94`、`:171` |
| 退回 | 不应用拟数据；变更回 COMPLETED，作废恢复 oldParams 中原状态；恢复记录号关系并记录日志 | 同文件 `:107`、`:214` |
| 配置与签署 | 当前前端按 `__change_process__` 选择已有模板；eDHR 请求携带申请人签名，审批动作有独立日志签名入口 | `crown-front/packages/nocode-web-render/src/annotation/form-abandon-v2-modal.vue:187`；`form-annotation-controller.ts:649`；处理器 `:146` |

签署证据有版本／路径差异：DOCX 示例展示提交人、审核人双签，而本地 eDHR 叠加审批路径构造的是申请人签名，审核签名另属审批动作。不能据截图要求本项目回到提交时双签，也不能把 MedPro 保留的旧立即变更路径当成 eDHR 当前审批路径。

## 3. 变更／作废的下游影响，哪些可以确认

| 下游 | 已确认的源码行为（original-evidence） | 不能据此声称的能力 |
|---|---|---|
| DHR 汇总提交 | `edhr/biz/SummaryReportFinishBs.java:145` 对已纳入汇总的实例检查 IN_AUDIT，有则拒绝完成整理 | 不证明 DHR 已在审核时，会主动发现后来发起／生效的变更 |
| DHR 实例状态 | 变更结果处理器 `:103` 调用 `refreshInstStatusByOfInstId` | 此平台服务实现不在所给套件源码中，无法确认精确目标状态、跨 DHR 传播、旧批准保留或重审策略 |
| 当前报工统计与汇总成员 | `bizProcess/listener/OnlineFormButtonEventListener.java:352` 的 ABANDON 分支，对非放行单按表单 ID 删除 FORM_REPORT_INFO 与 EDHR_SUMMARY_FORM_INST | 不等于删除原始表单；也不证明所有统计、报废、物耗、库存均已一致冲销 |
| 报工数据更新机制 | 同监听器 `:221` 的 SAVE／SUBMIT 分支调用采集及产出更新；`OnlineFormDataCatchService.java:375` 对报工数据按表单 ID 先删后插 | 平台 change／submit 内部发何种事件未取得源码；不能认定每类变更批准都触发了全部采集器 |
| 内容追溯 | `notebook/FormTraceManager.java:299` 按表单 ID 替换当前追溯主线；调用方 `FormSubmitEventListener.java:72` 有 OF_APPROVE 上下文条件，`:85` 异常只记录日志 | 未闭合 BUSINESS_APPROVE 结束至该上下文／事件的调用链，不能声称变更必定刷新、与生效原子一致 |
| 汇总打印 | `service/EdhrFileTaskPrintService.java:184` 按当前汇总成员取实例，并过滤 ABANDON | 不证明旧打印／汇总版本不可变，也不证明失效原件在历史导出中仍保留 |
| 通知 | 按钮监听器 `:375` 在流程表作废且仍存在相关待办时，清理待办并向这些受让人发送作废消息 | 这是条件有限的表单待办通知，不是所有受影响 DHR 审批人／历史批准人的影响通知 |

两个额外风险线索（`inference`，不是已复现的产品缺陷）：

1. `OnlineFormDataCatchService.java:587` 的报废登记只在新集合非空时删旧再插；不能假定清空来源时自然撤销旧贡献。报工、报废、物耗／库存必须按各自路径验证，不能从一个采集器推定全模块一致。
2. `crown-front/packages/nocode-base/src/hooks/annotation/form-annotation-controller.ts:502` 在 `submit_abandon` 返回后按必填配置查询并调用 `insertFormInstance`，没有在这段代码中等待审批最终生效。它是前端副作用，不适合直接复制为“作废批准后原子补开”的本产品承诺。

另有整份 DHR 作废入口 `edhr/biz/AbandonEdhrBs.java`／`EdhrInstanceAbandonBs.java`，与本节“DHR 目录内表单变更”不是同一动作。本轮不因它们存在而新增本项目整份 DHR 作废或重开生产规则。

## 4. 与我们已确认方案的对照

| 主题 | 我们当前依据 | 处理结论 |
|---|---|---|
| 变更发起入口 | `user-confirmed` DEC-0086-02／03／04：首版按表单流水号，批次／SN 延期，不单设 DHR／记录本入口 | 冠骋目录入口可作未来体验参考，本轮不自动补独立 DHR 变更页或第二套审批引擎 |
| 申请与生效 | DEC-0087-02／03：申请期间原 COMPLETED 与有效修订不变，批准才换修订／作废；DEC-0068-04：申请不冒充有效变化 | 明确保留与冠骋 IN_AUDIT 的差异；不把其待审统一阻断规则静默搬入本项目 |
| 作废证据 | DEC-0063-04／05：真实作废及替代记录仍可见，旧冻结保留 | 不能复制冠骋删除当前汇总关联／打印过滤的做法来清理我们的历史证据 |
| 审核中来源生效 | DEC-0068-05：识别影响、通知、阻断过时批准，由人退回 | 沿既有规则接入真实生效点；不自动退回、不重复实现朋友负责的审批 |
| 已批准后来源生效 | DEC-0068-06：保留旧结论、旧证据，由人发起新草稿并重新核查提交 | 复用已有发起修订与冻结版本机制；冠骋证据不足不取消这项需求 |
| 放行及生产状态 | DEC-0063-08、DEC-0068-08：DHR 审批不等于最终放行，不自动改生产／放行 | 不复制冠骋汇总后创建放行单的跨域副作用，本轮不扩大到放行模块 |
| 签署 | DEC-0087-06：原签名归属原修订；申请／审批签名独立，不新增原业务签署人 Rev.2 重签 | 不因冠骋双签示例改写现行签署政策 |

## 5. 当前代码证实的缺口与接续顺序

`original-evidence`，在上述 eDHR 固定基线重新核对：

- `RecordControlService.handle:348` 的批准分支实际执行 `applyChange`／`applyObsolete`；`:376` 起更新修订、当前记录及执行 state_json，未接追溯、正式投影和 DHR 影响消费。不能监听“申请已创建”替代生效。
- `DhrEvidenceImpactService.changes:34` 取快照、值、状态、模板版本比较；未读取 `current_revision_id`。只比较内容无法可靠解释“修改后再改回原值”的修订历史。
- `DhrReviewService:89` 起有对象／DHR 锁及批准前重新检查；`:115` 阻断已发现的过时证据，但这不等于主动事件和通知闭环。
- `FormProjectionService:37` 仍把正式 final_revision 固定为 1；`FormTraceIndexService:30` 已有最近保存索引刷新能力，但记录控制批准路径没有调用。

建议开发顺序（`inference`，复用现有已确认规则）：

1. **先统一真实生效的下游输入。** 以来源实例、前／后有效修订、实际动作、申请／事件／审计关联和生效时点定位变化。在记录控制实际成功的事务边界留下可幂等消费依据；复用现有事件身份，不另建通用审批或通用规则平台。同步核对普通用户权限及最新目标集成增量。
2. **完成 DHR 的有效修订识别和影响处理，同时刷新当前追溯。** 冻结来源明确修订身份；生效后查找真实引用关系中的受影响 DHR，分别解释待审与已批准版本，不改旧证据。沿已有人工退回／发起修订路径，批准前在既有锁序下复核。新旧内容相同但修订不同也必须可解释。通知对象和渠道已经由下述本轮用户确认补齐，不从冠骋表单待办消息推导本项目通知策略。
3. **完成 A12 的正式统计修订切换／作废处理。** 用同一实例和修订定位原贡献与新贡献，避免重复累计；保留各版本来源，覆盖报工、报废、物耗及依赖它们的最终产出查询。不重算生产生命周期、不重开工序、不自动增加替代表单。
4. **按同一次来源生效联调验收。** 开发可分步，不能以 DHR 提示已完成就宣告全链路完成，让报表继续读旧贡献。DHR 两项 high 与 A12 仍保持开放，取得各自真实业务证据后才关闭。

关键验收场景：申请待审与退回不改变正式来源；变更批准只产生一份新修订并更新当前追溯／统计；作废后当前统计不再贡献但历史证据可查；重复事件不重复处理；最终业务失败整体回滚；来源生效与 DHR 批准并发不通过过时证据；改回相同值仍识别修订变化；已批准旧版正文、签署、导出不被更新覆盖；BATCH／SN 及普通申请人／审批人权限分别覆盖。

本次没有实现上述步骤，也没有运行产品测试、迁移或浏览器业务操作；调研交付检查仅为来源定位、哈希、图片原件一致性、引用与独立证据复核。研究结论不提升知识成熟度，不关闭既有 TODO。

## 6. 本轮补充的用户确认

`user-confirmed`：对“表单变更／作废生效并影响 DHR 后，提醒先采用哪种范围”的问题，用户明确选择“站内提醒当前审批人和该版本汇总提交人（推荐）”。因此接续通知采用站内渠道，接收人为当前审批人和受影响冻结版本的汇总提交人。历史批准人及邮件渠道未由本次选择纳入。

这项确认只补齐既有通知要求的对象和渠道，不改变来源实际生效时点、人工退回、新版本重审、旧批准保留或生产／放行边界；也不证明通知功能已经实现。其余投递去重、无当前审批任务时如何解析已有受众、账号状态和消息存储属于后续实现须核对的工程细节，不由本次记录虚构人员或变更授权。

研究原始证据首轮独立质量已通过，见 `quality-result.yaml`。新增确认触发本体同步及后续独立复核，最终结果另存，首轮原件不改写。

## 7. 本轮交付结果

本体结果为 [ontology-result.yaml](ontology-result.yaml) 的 `updated`：只在三个知识文件补充通知对象／渠道、原始问答和验收要求，知识版本仍为 0.3.25。正式知识检查 89 项通过、无失败或跳过；原始日志和 JUnit 已归档。

最终独立质量为 [quality-final-result.yaml](quality-final-result.yaml) 的 `passed`，6 项适用检查通过、无发现或阻塞；覆盖原始资料完整性及新增确认与既有语义、成熟度和证据的一致性。质量独立核验了本体运行证据并解析全部知识 YAML，未声称重新运行该 89 项测试或执行产品运行验收。此前 `quality-result.yaml` 是用户回复前的研究审查原件；最终检查覆盖用户回复后的三文件知识增量。

本轮完成的是参考调研、接续方案核对和通知规则确认，未完成通知投递、DHR 真实生效联动或 A12 实现。下一代码切片按 L2 开始，先同步最新目标增量，再执行第 5 节的风险匹配验收，不复用本次研究通过来关闭业务缺口。
