# W1 审批、汇总修订与冻结导出审查

固定来源/目标：`edhr-dev@76b214426a271929bba2708cdda9e4d84d1f0679`，审查分支 `audit/edhr-dev-w1-review-export-20261016`。PR [#8](https://github.com/IvenYi/edhr-nexus-frontend/pull/8)已由用户手动合并；合并树严格等于批准头8d58ad39，1,196个受测保护文件与实际独立候选1113fe14相同，见[合并回执](merge-receipt.json)。未执行部署或擅自合并后续批次。

本批按L2核对已实现路径的权限、签署、并发、回滚和冻结输出。代码、测试、知识定义、迁移均未修改；目前没有新增已确认可达代码缺陷。本目录仅记录实际审查和运行结果，不将既有已知功能/集成缺口改为通过，也不新增完整A12或通知功能。

## 实际源码与运行

已核对的12个路径/方法范围见[增量记录](review-progress.jsonl)与[源码映射](source-map.md)。工序执行本次START修复已合并，本批转向DHR个人任务、通用工作流防绕过、真实签署双身份、汇总修订与旧冻结版本、FULL/SELECTED档案及原件完整性。

主侧在新目标实际运行74项：首组8类48项，追加汇总持久化24项与两个专属流程版本/防绕过用例；0failure/error/skip。命令与原XML摘要见[主侧结果](evidence/main-result.json)，逐用例见[索引](evidence/main-case-index.json)。这是本批主测，不复用或累加PR7/PR8旧通过数，不称新的独立结论。

环境为隔离H2、实际Spring事务/JPA及部分Mock上下文，权限测试按其实际MockMvc/直接方法边界解释。归档13项实际调用DhrPdfRenderer、Playwright Chromium和PDFBox，核对中文PDF/ZIP/原件与范围；Maven未跳过打印资源构建。没有本批整页视觉、用户浏览器E2E或真实A12生效联调，不把原SQL改行测试冒称合法A12业务入口。新PostgreSQL16.15测试服务仅做真实TCP SELECT可用性核对，未冒称本批事务场景已在PG运行。

## 既有缺口仍然开放

本体只读核对结果为[not-applicable](ontology/ontology-result.yaml)：本批无需定义写入；整体知识审查仍适用。36条声明是精确来源导航，不计36项全链通过。知识252文件、2487定义、版本0.3.25保持。

两个原有high实现差异继续open：完整证据影响比较/主动通知缺口，以及记录控制来源变更作废真实生效与DHR消费联调缺口，见[继承项](findings.yaml)。读时比较和现有并发测试不能关闭它们。DHR汇总“发起修订”已经实现为新草稿/新汇总版本；表单A12修订/作废拥有独立来源生效职责，不能互相替代。原四个知识evidence-gap与发布级并发/完整质量签署判断继续保留。

本批可确认已实现范围的审查证据，不代表完整DHR生命周期、W1或全分支发布验收通过。待审范围与依赖继续按W0→W7台账推进；不因上述依赖停止无关代码审查。

## 独立结果与交付

首轮独立实例另行实际运行相同74个唯一用例，0failure/error/skip，真实执行打印构建及Chromium/PDFBox归档；[首轮报告](evidence/independent-first-failed/qualityResult.yaml)原样保留failed，仅反映修正前CSV路径问题。未参与修正的新实例已对真实path/blob集合、红绿摘要、历史清单、原XML/日志/manifest、源码定位、政策来源及报告边界完成8项必需检查，[最终结果passed](evidence/final-independent/qualityResult.yaml)，关闭该medium。最终实例没有重跑Maven，不把两次74累加为148个不同用例。

最终passed仅接受本批审查台账、清单整改及已实现路径证据，不是两项high的功能关闭或发布批准。本体not-applicable只指无需定义写入。报告后的L0结果登记、NEXT指针与受保护源码核对见[交付回执](delivery-receipt.json)；实际产品受测SHA仍为76b214，不将文档提交冒称新受测产品候选。

下一批继续W1：先沿F004的已保存制程/执行方式ID核对后端有效候选、前端受控值与保存/历史读取，再补真实来源生效及质量影响依赖的源码证据。只整改具备合法触发和原确认依据的问题；两项high、原四个知识gap、W1剩余和W2→W7继续开放。入口见[持续台账](../branch-review-20261015/NEXT.md)。

## 基线与环境

新固定清单是1,524个跟踪路径，全部从pending/inventory-only开始；12条方法级阅读单列，不把整个文件或清单标完。旧1423/1474清单及结论保留原来源，新增报告不能倒填旧分母。主侧完整契约实际初读537，后续8d58局部重读并核对本批76完全相同blob；本体实例实际新读76，分别保留，不伪写统一读取时间。

首轮独立复核指出新清单中六个中文路径被Git默认转义，数量虽正确却无法与真实路径匹配。已保存原CSV摘要并以`git ls-tree -r -z`生成真实UTF-8路径、逐条核对1,524个path/blob；pending和分母不变。原1423/1474清单也按各自Git基线复核，均零缺失/额外路径，保持原样。见[本次修正](evidence/coverage-utf8-correction.json)及[旧清单复核](evidence/legacy-inventory-path-recheck.json)。该medium属于审查元数据问题，未改业务代码。

新云实例保留/workspace缓存而丢失/tmp工具。已从Apache下载Maven3.9.11并核对官方SHA512，复用系统Java21和现有Node24、依赖/Chromium/CJK字体；工具和脚本改存/workspace/.edhr-cloud-tools，未改应用声明/锁文件。安装验证及专用PostgreSQL启动脚本实际执行、重复启动SELECT通过，install_script/start_skill已保存环境草稿。草稿需要用户在环境设置审阅保存并发布才成为新的复用配置；保存不等于执行或发布，当前实例已实际恢复可运行。
