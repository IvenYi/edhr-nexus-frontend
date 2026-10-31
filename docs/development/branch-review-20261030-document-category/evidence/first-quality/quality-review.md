# 独立质量复验 FINAL — failed

候选 `ac3a421e42529bdb304e2c72145ceb580ec70618`，目标 `edhr-dev@d10590bd3fe8f3da4e68bcc087b2102d2c211934`。目标已实际fetch核对且为候选祖先，工作树干净。契约实际读取候选提交；知识0.3.25未改。本实例未参与任何产品、测试、夹具、知识、迁移或主审文档修改。

## 必须修复的真实阻断

`AUD-W4-DOCUMENT-CATEGORY-ORDER-AUDIT-001`（medium）仍open：两个合法并发排序请求可使第二次真实持久化变更无审计。已有顺序用例通过，不能关闭整个排序审计家族。

在自有完整canonical PostgreSQL数据库中，初始分类201=30、202=40。独立JDBC事务锁201，然后发qa-A反序请求，确认写锁等待；再发qa-B原序请求，确认两个写者等待；释放外部锁。两请求都返回HTTP200。qa-A把顺序改为40/30，qa-B随后恢复30/40。最终audit_event只有qa-A的两条排序UPDATE，qa-B没有任何一条记录。

根因位于 `DocumentManagementController.java:140-160`：未锁定的分类读取先形成previousOrder；并发后写事务仍以旧前值决定是否跳过审计。当前实现会写更新时间，因而恢复排序实际提交，但旧前值等于恢复目标导致审计被抑制。真实HTTP、JWT、controller、事务与canonical FK均生效，不是mock，也不是纯SQL模拟产品路径。

原件：`q1-concurrency-result.json`、`q1-concurrency-probe.txt`及`/tmp/EdhrCategoryConcurrencyProbe.java`，完整路径与哈希见独立证据清单。主侧已确认复现，后续主侧处理稳定锁序、新鲜前值与并发回归；本实例不参与修复。L2修复后的最终复验须由全新未参与修复实例完成。

## 已实际完成

- 258条既有H2 + 140条真实PG全部通过，0fail/error/skip；共398跨引擎执行，不能称398unique。8+3 XML和HTTP原始输出保存。
- 自有PostgreSQL16.15/en_US.utf8，两个独立数据库。分类库完整执行未变现行0001 fresh schema，ddl-auto none，真实Aspect、FK RESTRICT和五表回滚；读写回归库独立。未回放历史迁移、未接生产数据库。
- native14顺序审计/NULL/同值/ID兼容/权限/保护/新增引用/注入故障500及完整回滚全部通过。内部存储故障500是正确边界，不改GlobalHandler，也不降低回滚断言。
- 浏览器当前10/10，旧UI同脚本4项错误文案红、6正；两宽390/1440为重复变体。真实页面和共享弹窗/通知配受控API，非浏览器到native DB的整链E2E。PNG全部保留；图片查看调用输出截断，不宣称完成全部人工视觉检查。
- `npm run build`、generic-ui14、list-table-style通过。知识89实际全过。
- 119证据文件hash/size、6源码快照、9本体原件与manifest、303未变知识资产以及4份原始Git来源核对一致。四份inventory独立重建逐字节一致：4755/130仅盘点。
- 14手工路径空白检查通过。全原始区间exit2及原始日志/XML/冻结CSV空白输出保留，未清洗。
- 删除错误承诺文案ID `AUD-W4-DOCUMENT-CATEGORY-DELETE-PROMISE-001` 已独立证实resolved。原有引用409并非本批新增保护；后端只清理当前保护后不可达的自动迁移路径。

## 未执行及既有限制

确认新真实并发阻断后，按主侧明确要求停止补跑成功项并正式failed收尾。本实例未创建旧目标worktree，未执行最终旧native14；未重跑premium精确src旧/current对照。这两项为not-run，不引用主侧原件冒充自身实跑，也不借用旧initial14。

`verify:process-modeling`实际因0014旧路径ENOENT在断言前blocked；lint实际因无ESLint配置exit2。均保存原始输出，不修无关配置，不报通过。本报告足以形成failed结论，不因这些工具问题改报blocked。

既有12项有限ID/本体NA没有被知识89升级为整仓一致；知识版本与成熟度不提升。8源码/12语义含历史重叠，不增加unique。A23历史856+feature1/另130SQL与本轮4改2增仍pending。整体W3/W4交叉，W2余项、W5-W7尚未完成；设备/物料及分类计数、详情/版本删除性能等仍依既有边界讨论，友方TaskDetail、生产弹窗设计、记录控制DHRhigh、A12、四knowledge gap不越权处理。

## 清理与交付

自有唯一容器535d32d654d4c88ecb3a39a2bd1f2283fb685c758192e70bc5976ca545b7301c经owner核验后删除，inspect确认不存在；运行探针Spring/JDBC/executor均关闭。没有旧worktree、测试复制或依赖symlink需回收，共享依赖未动。主候选HEAD与clean状态再次确认。详见q1-cleanup.json。

**不建议合并当前候选。** 需主侧修复同家族并发审计遗漏，补并发回归，重新冻结候选并由全新独立L2实例验收。全部原件逐文件path/sha256/bytes见q1-independent-evidence.json。
