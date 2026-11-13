# AI Worker运行切片2B

基线4ca507d294859213bde8eaf5d1efff77a0a93406，分支codex/ai-experiments，L2。2B验证执行底座，不提供页面、付费模型、知识包或配置完成判定。

## 执行与版本

`runClaimedWorker`每进程处理一个已领取轮次，按服务端claim固定task/run/leaseEpoch；每5秒串行续租，续租失败中断DSH驱动并卸载工具。网络请求最长30秒，停止后的写入由Java资格检查立即拒绝，不承诺远端请求被撤回。宿主只接受form-worker-2b / ai-task-v2 / unpublished / fixture-no-model基线；不兼容拒绝执行。Java默认版本同步升级；旧任务不会自动迁移，新建任务取新基线。DSH锁定0.2.2-rc.2。

驱动正常结束通过yield进入STOPPED/WORKER_YIELDED，释放占用并保留成果。该状态不表示配置成功；没有SUCCEEDED入口。生产模型适配、预算调用、知识和预览将在后续接入，当前测试替身不进行自然语言理解。

正式profile启动路径使用官方DSH CLI、自定义空bundle profile和显式服务清单。测试launcher生成10项核心服务及一个eDHR测试启动插件：模型接口、session、投影、system-prompt、工具注册、原生工具执行、agent、agent-loop、JSONL持久化及checkpoint-policy。只注册read_current_form/create_form/save_form_design三个工具，确定性模型每次调用核对完整工具列表。未加载Shell、文件工具、插件管理、MCP、网络工具、base、遥测及会话上传插件。

这是已实际启动的最小profile验证，不是只生成配置。测试启动器位于test目录并要求isolated-java-test标识；不是供客户执行的产品启动入口。正式服务托管、OS资源及网络隔离、跨宿主存储和安装裁剪仍属于部署建设，工具白名单不是操作系统沙箱。全量官方CLI安装在独立/tmp测试目录，没有把其全部依赖引入产品包。此次安装674包耗时约18分钟；完整CLI的npm audit报告3项（undici high、MCP client moderate、libreoffice-kit内fflate moderate），与产品适配包0项分别报告。当前只在本机合成数据隔离验证；此CLI不是已验收商用分发，漏洞修复/分发裁剪及完整依赖复验是上线阻断项，不以未挂载相关工具代替漏洞评估。

## 过程日志

新增Worker接口POST `/api/v1/ai/internal/tool-events`只接收固定工具名称、调用编号和STARTED/FAILED/RESULT_UNKNOWN；当前用户资格、轮次和代际每次重验。相同调用重复开始不重复落日志，不同工具复用编号拒绝；FAILED/INTERRUPTED编号不得重新开始或执行写入，纠正后使用新编号。每轮最多256次开始。无自由文本、模型推理或原始设计内容。

读取接口可选callId；成功读回后在同一事务写TOOL_COMMITTED及修订。保存由Java核对工具类型与原生动作，只有真实保存及回执同事务提交后写COMMITTED；回滚不留下成功日志。停止/禁用将尚未结束的步骤记为INTERRUPTED；已经COMMITTED不改写。错误/未知结果不能伪造业务成功。普通原生创建/保存事件仍保留审计、目标和修订身份。

POST `/api/v1/ai/internal/forms/reconcile`由当前领取资格查询原操作回执，幂等记录FORM_OPERATION_CONFIRMED，明确是核对旧提交而非再次保存。未知步骤的历史不删除，通过关联operationId的新确认事件解释结果；继续写前重新读取当前表单。回执404仍不证明未提交，不换编号盲重试。日志使用已有分页接口和确定性中文摘要，前端时间线尚未开发。

本地pending按operationId独立文件保存并在执行前重新扫描。旧Worker迟到响应只能清理自己的文件，不能删除重领Worker的新操作标记；多个待核对项逐个查回执。保守读取2A旧单文件标记，不静默丢弃。该机制覆盖同轮代际重领的进程重叠，不宣称任意共享目录或多宿主调度均已验收。

## 可重复验证

Node >=24.9，Java21及PostgreSQL。只允许已有正式JUnit配置指向独立测试库，DynamicPropertySource及URL模式阻止落到开发库；不通过临时Spring启动探针验证。

```sh
npm ci --ignore-scripts --prefix gmp-platform/ai-worker
npm test --prefix gmp-platform/ai-worker
# 官方CLI测试分发，可单独安装于专用临时目录；不启动默认profile
npm install --prefix /tmp/edhr-dsh-2b-rc2 --ignore-scripts --save-exact @deepseek-ai/dsh@0.2.2-rc.2
# 在gmp-platform/backend运行；先准备独立测试数据库
AI_TASK_DATABASE_URL=jdbc:postgresql://127.0.0.1:5432/edhr_ai_task_test_20261113_1b \
PGUSER=ivenwang EDHR_DSH_BIN=/tmp/edhr-dsh-2b-rc2/node_modules/@deepseek-ai/dsh/lib/bin.js \
mvn -q -Dexec.skip=true -Dtest=AiFormPostgresTest,AiTaskPostgresTest,SecurityConfigTest test
```

EDHR_DSH_BIN必须指定；否则普通链路使用进程内测试装配，强杀/禁用profile测试跳过，不能作为完整2B通过。正式验收须检查0跳过。测试进程仅拿合成Worker key，没有用户API key或生产身份。测试输出留在独立临时目录和本地output中。

首轮主侧后端48项（原生19、任务23、安全6）及Node11项通过；产品适配包npm audit0项；profile dump确认清单；知识89项由本体角色运行。新增覆盖真实DSH CLI→Java→PG建表与读写、提交后应用层尚未获得响应时强杀、DSH checkpoint恢复/同轮代际重领与回执核对、运行中关闭能力、伪造成功事件拒绝、类型冲突回滚、恢复事件幂等、真实TCP断开和本地未知结果阻断。

首轮独立审查发现high：旧Worker迟到响应误删新Worker固定文件名的pending；medium：失败callId再次写入后工具日志仍显示失败。主侧分别改为按操作文件隔离及终态ID拒绝复用，增加旧/新代际重叠Node回归和PG直接绕过开始事件的拒绝案例。修复后主侧及全新质量实例分别运行Node12项、后端49项（原生20、任务23、安全6），均通过且0跳过。全新质量实例复核两项缺陷关闭，实际执行官方CLI强杀恢复及运行中禁用；产品适配包audit仍为0。独立质量结果为passed，本体结果为updated；质量复核本体角色的89项通过记录，未将其声称为质量侧重跑。结果归档于本地output/ai-product-slice-2b/final-quality-result.yaml及ontology-result.yaml，验收范围仅为本切片。

初次checkpoint恢复验证暴露profile未声明agents注入，已补齐并实际复跑通过；不以较早不含checkpoint的通过代替。此处未模拟断电、磁盘损坏、数据库故障切换或付费供应商重试。端到端恢复使用确定性模型，不代表复杂自然语言对话的恢复质量。

来源分级：用户授权为user-confirmed；代码、测试与官方rc2源码为original-evidence；前期实验总结为secondary-reference；分层及yield是inference。当前仍不宣称商用上线。
