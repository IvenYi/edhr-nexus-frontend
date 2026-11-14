# AI表单工作台切片2C

基线`450379670504ca3f8bd1f65a275f48633dd50379`，分支`codex/ai-experiments`，L2。用户授权受控本体/关系查询、局部编辑、语义检查和预览反馈，不开发页面；真实模型可用DeepSeek。本切片使用确定性DSH驱动，不消耗模型额度，模型自然语言配置质量仍属于2D。

## 已实现的受控入口

Worker注册8项工具：原有read_current_form/create_form/save_form_design，加get_applicable_knowledge/query_business_relations/patch_form/check_form/preview_form。模型不能指定用户、任务、目标、SQL、文件路径或URL。内部请求继续检查当前任务所有者资格、能力、运行轮次及领取代际。

新增工具接口在`/api/v1/ai/internal/workbench`与`/forms/patch`，2C服务另要求默认关闭的`edhr.ai.internal-validation=true`。该开关仅供已授权隔离验证部署显式开启，不是客户许可证；不能以开关替代知识发布治理。配置基线升级为`form-worker-2c / ai-task-v3 / form-knowledge-2c-internal / fixture-no-model`；旧任务不静默迁移。原3项工具仍沿原资格契约，原生成果不会因为AI关闭而删除。

## 知识与关系

构建脚本`scripts/ai-form-agent/build-2c-knowledge.mjs`从固定Git提交提取明确白名单18条记录：6个概念及其6个词条、2个关系、追溯单绑与引用配置2条规则、2个相关未决问题。保留原visibility/status、完整explanation/context/impact、术语别名与关系说明；不包括历史一次性清理规则或任意研发原文。包包含知识版本、源提交、文件哈希和记录定位，Java启动核验包内容摘要。摘要保证内容一致性，不是签名或发布审批。

检索分页每页8条，返回total/nextOffset；不存在/包外知识不降级到文件读取。关系查询返回显式概念关系及术语，不声称是全部产品知识或生产实例图谱。不传ID查询当前追溯及业务用途目录；`catalog.reference-dictionaries`配合query查询实际字典，沿原目录20条上限，满页须细化关键词；`catalog.material-types`查询当前物料类型。查询结果和请求留哈希及包版本，不在运行日志复制整段知识或用户查询。

本包是internal-validation投影，不是客户或生产运行知识发布。原有0.3.25/P0成熟度不提升，不授予生产动作或改变已确认业务规则。

## 局部编辑与检查

patch_form先读取当前修订，使用限定在三份设计文档内的JSON Pointer add/replace/remove/test；每文档最多100步，禁止根替换、move/copy和身份/目标修改。数组下标来自当前读回，建议先test字段ID再修改。未触及字段及未知扩展配置保留，不重建整个设计。Java比较expectedRevision，复用原生保存校验、审计和事务回执；补丁请求本身参与幂等摘要，重放不再次应用数组编辑。未知写入仍按原pending与回执恢复契约处理。

check_form检查真实保存版本：重复字段身份、类型、画布悬空字段、未落位字段；复用原生引用条件与投影配置校验，并使用当前查找目录。引用配置执行共享查询的最小候选检查，字典需存在且有效；空候选不算配置错误。正式统计用途返回客户来源职责待核对警告，不凭字段标签确认政策。错误/警告带代码与目标，结果绑定revision；检查通过不证明原件完整、字段业务含义、签署政策或正式提交通过。

## 原生预览反馈

`preview/entry.tsx`只供无头渲染，复用现有FormDocumentPreview及原生解析器，没有增加产品路由或客户页面。构建时明确使用前端React及MUI图标模块，避免依赖解析不同导致空白或渲染错误。支持原生保存格式，拒绝静默将未知格式归一化为空表。

Worker从Java获取当前修订快照，独立无登录浏览器只装入固定构建产物；初始文档由路由直接提供，其他网络请求禁止，CSP禁用连接和框架。当前限制1–10页、每页最多20000网格单元、截图高度20000px、渲染阶段30秒。工具卸载/任务取消会关闭浏览器。未加载图片、文字裁切、页面溢出和字段落位异常返回问题；超限或渲染失败拒绝产生成功反馈，不截断后宣称完整。

PNG和manifest保存在任务专属目录，权限0700/0600；manifest关联当前revision、渲染器哈希、图片哈希及检查项，工具返回artifactId和摘要。Java再次检查执行资格与当前修订后记录`worker-native-renderer`观测；修改后的旧修订反馈拒绝，相同调用编号不能改写已记录证据。Java没有独立判断图片视觉正确性，模型也没有上报预览指标的工具。尚未提供客户图片下载/保留清理策略、OS级沙箱和多宿主存储，不是已完成商用部署。

## 验证与复现

需Java21、Node>=24.9、前端依赖及隔离PostgreSQL。工具运行前先安装对应无头浏览器，不使用管理员账号或开发库。所有后台验证只通过已有JUnit的严格独立数据库配置执行。

```sh
npm ci --ignore-scripts --prefix gmp-platform/ai-worker
# 在gmp-platform/ai-worker运行
npx playwright install chromium --only-shell
npm test
npm audit
# 仓库根目录
node scripts/ai-form-agent/build-2c-knowledge.mjs --check
# gmp-platform/backend目录；官方CLI专用安装路径沿2B
AI_TASK_DATABASE_URL=jdbc:postgresql://127.0.0.1:5432/edhr_ai_task_test_20261113_1b \
PGUSER=ivenwang EDHR_DSH_BIN=/tmp/edhr-dsh-2b-rc2/node_modules/@deepseek-ai/dsh/lib/bin.js \
mvn -q -Dexec.skip=true -Dtest=AiWorkbenchTest,AiFormPostgresTest,AiTaskPostgresTest,SecurityConfigTest test
```

正式验收检查0跳过；不设置EDHR_DSH_BIN会跳过官方CLI案例，不能作为完整2C证据。真实DSH fixture顺序查询知识/关系、原生建表、读取、局部修改、再读、检查及离线预览；不证明模型自主规划能力。另测越权/停用、内部开关、包外查询、补丁幂等与保留、修订冲突、预览注入拒绝和旧修订反馈拒绝。测试输出在`output/ai-product-slice-2c`及本机临时目录归档，最终结果以独立质量记录为准。

2026-11-14收尾验证：主侧及独立质量实例分别运行后端58项、Node 15项，均零失败、零跳过；适配包依赖审计为零。知识收尾增量后本体实例运行知识工具89项通过，固定18条知识包重建一致。本体结果为`updated`；独立质量结果及候选文件SHA256清单分别归档于`output/ai-product-slice-2c/quality-result.yaml`和`quality-candidate.json`。本次没有付费模型调用、页面开发或生产数据库验证。主侧查看了DSH fixture生成的原生预览PNG，确认简单日期字段可见；该观察不代表三张安速康表单验收。

收尾已通过系统现有代理成功fetch目标分支，并以GitHub compare再次核对远端与基线`450379670504ca3f8bd1f65a275f48633dd50379`一致，无契约增量。本轮是内部工程切片验收，不代表仓库分支保护或必需CI门禁已启用。

完整官方DSH分发的既有依赖风险仍是商用分发阻断项，适配包审计不能替代完整CLI复验。2D仍需模型预算/供应商失败恢复、原件解析与政策依据、三张安速康表单及未见变体；本切片没有发布成功状态、上传入口或页面。

来源分级：用户授权为user-confirmed；固定知识源、源码和实际测试为original-evidence；实验v3为secondary-reference；内部包选择、JSON Pointer编辑及无头渲染安排为inference。
