# AI 原生表单写入 1B 验证

分支 `codex/ai-experiments`，来源、远端目标和契约基线均为 `1ee8cd30f63c68b5b3eb3447d5b31b76d7c71297` 加本切片工作树。2026-11-13再次fetch确认远端未变化；没有合并其他分支。执行级别L2，知识基线0.3.25/schema1.2.0/P0。

## 实现范围

共用模板应用服务；任务新建原生模板并保存设计，后续只编辑本任务版本；修订与编辑占用；停用/停止/接手后的旧执行拒写；操作回执、真实用户审计与可读事件。既有前端增加修订请求和设计器保存串行队列，不新增AI页面。完整边界见[1B开发说明](ai-native-form-writes.md)。

## 主侧验证

隔离库 `edhr_ai_task_test_20261113_1b`、`edhr_ai_migration_test_20261113_1b`、`edhr_projection_integration_test`；第三个库由测试创建临时schema并清理。主侧及正式JUnit均使用这些库；独立质量临时探针曾误连开发库，详见下文事故记录。未访问生产库。

```sh
# gmp-platform/backend；URL、PGUSER等通过环境变量指定专用测试库
mvn -q -Dexec.skip=true -Dtest=AiFormPostgresTest,AiTaskPostgresTest,AiTaskMigrationPostgresTest,TemplateModelingControllerTest,TemplateProjectionAuthorizationTest,SecurityConfigTest,FormLookupCatalogPostgresTest,FormProjectionPostgresTest test
# gmp-platform/frontend
node --test scripts/test-form-design-save-queue.mjs
npm run build
```

后端修复前累计119项通过：原生AI 10、任务23、迁移1、模板应用服务41、授权1、安全6、追溯目录23、生产投影14；0失败/错误/跳过。首次组合118项中有一条旧中文异常消息断言失败：修订冲突现在通过统一409返回“表单已被修改”。更新断言并新增占用阻止解除追溯关联案例后，目录23项复跑通过。原始失败与复跑证据均保留，不把第一次运行写成通过。前端保存队列2项通过，TypeScript和Vite生产构建通过。

主要验证：实际HTTP→认证→事务→PostgreSQL链路、原子建表失败回滚、并发重复操作只提交一次、相同ID不同请求拒绝、跨任务目标隔离、原生修订与占用、停止与保存竞争、人工接手后保留修改、过期重领重新读取、即时权限与能力停用、真实用户AI审计关联、回执与可读事件。迁移覆盖从1A升级、0094重复执行不重复应用、原模板/设计/修订及身份/审计保留。

本地原件位于 `output/ai-product-slice-1b/` 及对应 `target/surefire-reports`；输出目录不是生产发布资产。测试不是进程SIGKILL或浏览器交互证明。

## 专业门禁

本体实例 `ai_native_form_ontology_1b` 返回 `updated`，实际运行知识测试89项通过。其发现任意既有模板绑定超出首版范围；主侧已删除入口，本体增量复核确认仅创建路径能够绑定目标。知识保留internal与P0边界，没有将源码观察声明为商用运行资格。

首个独立实例 `ai_native_form_final_quality_1b` 返回failed；独立复跑119项、队列2项和构建通过，但发现high：原生服务外层事务回滚资格撤销时的终态/占用释放；medium：重新打开设计器沿用列表缓存；low：任务视图的可写标识恒true。主侧分别修复为：只对写入前已终止的专用异常保留终态事务；打开设计器先GET当前版本内容与修订；可写标识按当前运行、租约、期限、配置与能力动态计算。新增撤权读、超时写及资格标识3项正式HTTP/数据库回归。本轮事务与恢复修复后主侧122项后端通过，前端2项和构建通过。

全新质量实例复跑122项、前端2项/构建及知识89项通过后，收尾发现medium：两个DELETE的必填参数在缺失时落入500兜底，未履行409刷新契约。主侧将参数设为可选并由既有领域guard统一拒绝null，新增父/版本缺少修订均409且对象保留的HTTP案例。主侧14项原生AI测试复跑通过，当前累计123项后端；其余未改范围沿用上述结果。全新独立实例 `ai_native_form_release_quality_1b` 最终返回 `qualityResult.result: passed`，独立运行122项后端及14项增量复验，最终覆盖123项，均0失败/错误/跳过；前端2项、生产构建及知识89项通过。高风险事务修复由未参与修复的新实例验证，删除缺失参数的medium问题由该实例增量复验。结构化结果为本地 `output/ai-product-slice-1b/release-quality-result.yaml`，候选与测试快照为 `release-quality-final-snapshot.json`；最终审查暂存差异SHA256 `8ebd0bc9537433dd78ee731531c3467e6c97eed78ffeffb2dcf1821b2361a891`。本段仅归档已返回的结论，之后代码、测试、迁移及知识未变。本体updated与独立质量passed满足本轮1B门禁，不等于商用发布或后续切片验收。

## 验证环境事故及处置

2026-11-13 15:34:52，首个独立质量实例的临时JShell探针使用低优先级Spring默认属性设置测试库，实际被开发profile覆盖，启动到了本机 `edhr_dev`，自动应用0093/0094。此行为超出约定隔离范围，已即时向用户披露并停止；此探针不能作为验证通过依据。后来确认该库AI任务为0，未创建表单；留下 `ai_capability(default,false)` 和一条测试孤立权限记录。不能据此宣称全库业务内容已审计无影响。

主侧以只读查询确认迁移记录和污染；按id920001、role920001、permission10137、创建时间2026-11-13 15:34:54.609515且对应role不存在的完整条件，仅删除孤立权限行1条，读回确认残留0、AI任务0。保留追加迁移与关闭的能力记录，未进行破坏性结构回退。开发数据库结构因此已经前移，此事实须随交付披露。完整原件及事故过程在 `output/ai-product-slice-1b/quality-incident.md` 和相关日志。

最终复验只允许运行已有URL格式限制和DynamicPropertySource指定数据库的正式JUnit；禁止额外Spring/JShell应用探针或访问 `edhr_dev`。该限制是此次事故整改，不能用测试结果掩盖环境错误。

## 保留边界

本切片不运行模型，不消耗OpenAI或DeepSeek额度。DSH产品Worker、能力知识包、工具全过程日志、三张表单双模型质量、当前修订预览与任务完成证据属于切片2；新AI页面和时间线属于切片3。生产选用未完成模板、部署容量、高可用、附件与日志保留策略仍须上线前验收。原生并发协议要求后端与既有前端协调更新；旧客户端缺失修订号返回409。

原生对象即使AI关闭也保留；回退先停用和停止任务，保留数据、回执与审计。没有执行浏览器视觉或真实Worker进程重启验收，不把接口和队列测试替代这些证据。本轮不宣告商用上线。

来源分级：源码/测试/数据库为original-evidence，用户要求为user-confirmed，既有DSH报告为secondary-reference，分期与技术选择为工程推断。
