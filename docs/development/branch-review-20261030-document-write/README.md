# W3/W4 文档专用接口授权与映射

本轮L2从实际最新`edhr-dev@2e24711aad1124bb28674161ef8f3dbaf00b569a`建立新分支；PR44确已人工合入，merge树与17ef99b7交付完全相同，无额外代码、知识或契约增量。不重开已完成PR。固定清单4650路径/130迁移、442 HTTP注解候选/198前端route候选只是盘点，不是语义通过或整体完成比例。

## 规则来源、合理性与实际缺陷

- `CAND-W3-DOCUMENT-METHOD-AUTH-001`承接为同一个`AUD-W3-DOCUMENT-PAGE-AUTHORITY-001` high：DEC0065-01、现行`rule.master-data.endpoint-page-authority`、旧ProcessModeling文档端点、PAGE权限seed与文档页面/API资源一致，未发现专用接口例外。按页面权限保护同一文档资源合理；不新增权限码或按角色名豁免。真实旧JWT测试的26缺权请求（空权限及仅物料权限×13端点）均200，20次实际改变业务/审计行，6次读取；13匿名正确401。当前类级`PreAuthorize(master-data.documents)`覆盖全部13映射，拒绝无业务SQL/五表不变，13有权正向保持。
- `CAND-W5-DOCUMENT-ENTITY-NULLABILITY-001`承接为`AUD-W5-DOCUMENT-PARENT-CODE-MAPPING-001` medium：历史3574179e的0051明确“编码属于受控版本，不属于父文档”，当前canonical父code可空、版本code必填；实体遗留NOT NULL与之矛盾。fresh ORM无DDL修补的真实创建旧400，新200、父code仍null、版本code持久化、两条审计；新版本缺code仍400且无额外版本/审计。仅同步字段映射，无生产迁移或历史数据修改。默认生产`ddl-auto:none`，不能声称当前规范生产库创建失败。

两产品文件仅3增1删；原读取测试移除3行临时DROP NOT NULL及旧说明，原断言不减少。权限对照测试双方显式对齐canonical父null，避免用ORM问题掩盖授权；另一个独立fresh ORM用例不执行任何DDL修补。

## 主侧真实执行与适用范围

当前后端384/384、0failure/error/skip：H2/既有258，原生PG126。新增55权限/原子性场景跨H2/PG重复，58读取通用场景也跨引擎重复，不称384个unique。旧目标同56例为27真实断言红/29正、0error/skip（26权限+1fresh ORM），原件保留。

每引擎55个写侧记录：39拒绝（13匿名+26缺权）、13有权、3实际审计CHECK约束失败。两引擎拒绝均0业务SQL、五表快照逐项相等；失败注入是隔离测试库约束，实际创建/更新/删除400后完整回滚。单独fresh ORM两次POST在JUnit中，不在110条helper流。主侧同一输出文件的两个55记录分组按真实runner顺序PG→H2解释，原件没有engine字段、不改写；最终独立须分输出运行。

真实JWT/filter、方法安全、事务、五类实体仓储及数据库参与；工序文档绑定仓储mock、删除保护Aspect未装配，不能将有权删除正向声称全产品引用/删除保护认证。源代码另核对PreAuthorize顺序200在删除Aspect1000之前，完整生产删除关系另按既有与后续独立范围。文件仅合成元数据，无真实磁盘内容验证。没有UI更改，不重跑浏览器/前端全量build/strict/lint，历史strict19/ESLint配置缺口保持。

本体角色已FINAL/NA，八既有ID有限核对和89实际知识校验通过，无知识版本或成熟度提升，不计新增unique；历史原始Git来源及303份知识未变摘要保留。全新独立质量对干净`fd1e80d9abb01e75b60d8d40e9f2c39587c420a1`正式passed/FINAL、16/16必需检查，权限high和映射medium均resolved；见[验收](acceptance.json)。主侧在2e基线加明确工作树差异运行，六源snapshot与候选逐字节一致；独立实际在候选重跑258H2/既有、126原生PG、知识89，均0failure/error/skip，且真正旧worktree同56为27红29正。两侧不是额外unique覆盖。

最终独立53份原件加manifest自身共54份逐字节归档，原/tmp引用到仓库路径映射见`evidence/final-quality/archive-map.json`；主侧37条记录、本体原件与303知识摘要及四份固定清单独立重建均匹配。14手工路径空白检查通过；1项可选全区间原始空白检查因日志/XML/三冻结CSV保持failed，不清洗原件。独立自建PG与旧worktree已按确切所有权清理，共享依赖保留；全部正式角色均FINAL。

## 健壮性、性能、结构与后续

见[source-review.json](source-review.json)、[review-notes.md](review-notes.md)和[a23-review.json](a23-review.json)。A23当前范围同步记录，不继承旧通过；旧856语言代码+feature1、另列130SQL及后续新源文件仍按增量待查，W6包含旧已审，W7反查。当前源/方法范围不等于整文件完成。

分类写入全量读取/重复计数、详情/删除随版本增长的查询只登记证据与代价，未获授权的新性能方案不实施；PR44仅列表范围已resolved，不泛化为所有文档路径。分类排序的审计归属、未知/重复ID兼容责任为单独待核候选，不把正向访问测试当其政策合法性证明。

整体仍W3/W4交叉批次，W2/W3/W4余项、W5安全/文件/存储/容量/批量/依赖、W6结构/A23全量回查、W7集成/覆盖未完成；TaskDetail友方修复、生产弹窗设计、记录控制依赖DHRhigh/A12、四知识gap及缺文件政策保持。全部正式角色FINAL后已实际向用户报告本批无任务漂移、当前阶段和余项，再准备新PR；后续仅L0原件/验收/交付登记，不改受测产品/测试/知识/契约/固定清单。不得自动merge/deploy/恢复。
