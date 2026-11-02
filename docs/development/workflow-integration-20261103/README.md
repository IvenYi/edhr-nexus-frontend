# 流程功能集成到 edhr-dev

用户于2026-11-03授权提交、拉取、合并和推送。本轮在主目录操作，不创建工作树；原验收及历史证据保持，独立集成证据在本目录记录。

初始本地提交为 `0bd0848bbded6d6954d62a4f924e0b2eec6623ad`，实际获取的远端为 `2ac66928046aa98dc196376ed2abb4f76f61e545`。远端包含42项新增提交，产品变化集中于文件事务安全、DHR审批分页与查询索引、附件写入及读取优化；项目、角色、交接契约无增量，远端没有结构化知识修改。

既有本地功能及其验收见 [整体闭环检查](../workflow-record-dhr-closure-20261102/README.md)。该历史通过不替代当前合并候选的验证。范围、数据保护与成功标准见 [decision-package.yaml](decision-package.yaml)。旧output、数据库备份及无关调试报告保留在本地。

本地功能提交为 `5d1bdc82533b3178701b0bf3f9ab885d382f22bb`。远端已在主目录自动合并，无文本冲突；双方新增的记录控制集成测试均保留。最终结果、提交关系和实际检查在收尾追加；未取得适用门禁前不推送。

原始参考摘录 `docs/reference-assets/research/crown-workflow-scope-20261102/evidence/source-excerpts.txt` 中带行号的空行保留原提取格式，含行尾空格；原测试输出 `docs/development/workflow-list-ui-20261102/evidence/generic.log` 的62/65行也保留原空白输出。这两个明确的原始证据文件不参与源码空白检查，摘要和历史来源保持。其余产品、手写文档及其他证据仍执行通常的差异空白检查。只将该目录及前轮交付目录中被报告引用的测试日志纳入证据，不提交数据库备份或根output。

## 实际合并候选与主侧验证

受测合并提交为 `96ea63a1948110f1ff7ab4eccdcb2b87de48dda7`，双父分别为本地功能提交与上述远端提交。双方祖先关系、完整产品树摘要和前端源码未被远端改动的事实固定于 [candidate-proof.json](evidence/primary/candidate-proof.json)。后续本目录证据补交只允许改变研发记录，产品树必须保持。

- 独占PostgreSQL端口55483运行本轮临时集群，四个回归库与主5432完全隔离；后端621项，577通过、44条件跳过、0失败/错误。包含记录控制真实PG42项、DHR分页99项、文件上传/删除事务5/10项、附件事务/下载元数据11/11项、查询观察2项和全新初始化基线3项；知识89项通过。逐类原件及跳过范围见 [backend-summary.json](evidence/primary/backend-summary.json)，未把条件跳过计通过。
- 主侧真实浏览器到合并后真实后端及全新恢复副本的all链12步通过（含登录和初始化），无业务API拦截、无页面异常；主库9张业务表前后指纹一致，见 [live-result.json](evidence/primary/live-result.json)。测试副本为 `edhr_record_control_test_closure_e2e_integration_20261103`，通过专用13002/18082访问，不切换正常开发入口。
- 前端构建、列表规范和数值工具2项通过，原件在 [primary](evidence/primary)。远端没有前端源码增量，前轮40项组件交互的对应内容保持；真实组合链另按本轮实际报告判定。
- 本体增量结果为 [not-applicable](ontology-result.yaml)：当前知识与feature树相同，无需新增政策或更改成熟度；已核对DHR分页与责任调整、附件原件与冻结下载的交叉关系。

独立质量针对上述实际候选单独出具本轮结果，原始证据与报告在 `evidence/independent-quality` 和 `quality-result.yaml`。主侧和前轮通过均不替代该门禁。

本轮适用L2门禁已完成：[本体结果](ontology-result.yaml)为 `not-applicable`（既有政策与知识保持），[独立质量结果](quality-result.yaml)为 `passed`、无阻断发现。独立后端同为621项中577通过、44条件跳过；独立全新副本真实all 12/12、知识89项及当前构建/规范/数值检查通过。独立副本正常升级到11条changeset，0091两索引有效，未向主开发库应用迁移。前端40项合成API组件检查仅按完全相同的源码树复用旧证据，不冒称本轮又执行40项。

后续提交仅补交本目录验证记录，受测产品与知识树保持。推送采用普通 `edhr-dev` 更新，保留本地功能和远端全部历史。临时13002/18082服务与55483测试集群已停止，主3000/8081仍为原进程，主业务数据指纹一致；原件见 [cleanup.json](evidence/cleanup.json) 和 [main-final-integrity.json](evidence/primary/main-final-integrity.json)。

## 保留范围

不新增归档、打印过滤、活动表单作废、完整放行后变更、通用质量/异常/源签署自动判读或作业/工艺路线功能。原闭环记录列明的通知、目录及全部角色组合等未测范围保持；迁移降级恢复、生产发布及容量/SLA不由当前测试替代。0091只增加查询索引，本轮主开发库不执行它，不重置既有人工验收样本；正常3000/8081服务保持。
