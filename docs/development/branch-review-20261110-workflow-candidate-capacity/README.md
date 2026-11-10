# PR77 合入后的候选流程目录性能取证

已交付 [PR78](https://github.com/IvenYi/edhr-nexus-frontend/pull/78)，`audit/edhr-dev-workflow-candidate-capacity-20261110` → `edhr-dev`。登记前实际观察OPEN/MERGEABLE/CLEAN，本地/真实远端/PR head均为验收提交 `57ed42003a74fe48c169824ec0bb684c00b76455`，30输入仍与受测字节一致，见 [交付核验](evidence/delivery-verification.json)。其后仅L0登记，推送后再次核对。建议按本批测试/取证范围人工合入；下一批批读＋必要字段投影已授权，当前风险尚未修复。

L2，基线 `edhr-dev@68861c2ab0291fc8f20271c2d2cae37d1eca66fd`。PR77已合入且整树同773fa942，无新增产品/知识/契约。沿原W3/W7与W6性能/健壮性/A23队列，回到原始service、repository、canonical schema和隔离PG量化前两批的候选当前版本读取信号。

**确认1+D次读取的性能风险，未确认新的正常数据功能缺陷。** 100个可选流程和2个过滤对照需要103条SQL，1000个需要1003条；全部选项返回，没有100个总量限制。风险编号 `PERF-WORKFLOW-CANDIDATE-CURRENT-VERSION-001`，与人员候选数组、文档版本及记录列表资格查询为不同消费者，未重复计修复。

本批仅既有PG测试类新增6个场景和DP，产品/UI/API/SQL/schema/索引/业务规则/知识无改。受测候选 `e173d4022079cb77b3eb53cd44d26c09935bbd27`，主侧clean候选实际 **94/94、0F/E/skip**：75原生PG、19单元/方法安全/静态；focused6在dirty688且字节与e173相同。全新独立实际94/89知识全过，正式passed/FINAL、10必需项通过；首次缺Vite导致0测试的失败、补自有依赖后的runtime untracked及清理后clean分别保留。20原service观察捕获4504实际SELECT和4504计划，60代表计划及完整日志保留。五档10表前后原始摘要相同，普通无创建权限JWT+MockMvc读取200、匿名401各10次；不是生产socket/浏览器或真实签署验证。

用户已明确批准**下一批批量读取当前版本并精简为必要字段**，保留全部候选、原筛选和异常；本批仍只取证。见 [具体性能与后续方案](performance-next.md)、[规则/健壮性/验证边界](review.md) 和 `next-batch-authorization.json`。其他记录列表资格SQL及事件DB分页未答，不属于此授权。

`ontology-result.yaml`/`ontology-review.md`、`quality-result.yaml`/`independent-review.md`、`evidence-packages.json`及三包原件保存实际执行/复用边界。全部专业FINAL后再实际执行 `pre-pr-drift-review.md`，后续仅L0证据/交付登记。

本体有限10项=8范围一致/1旧权限描述精确部分替代/1既有非阻断多租户待决；不重复前8/19或全量语义。353知识/359校验输入复用旧实际89，本体未重跑，knowledge0.3.25/schema1.2/P0保持。产品/UI未改，不重跑/冒称前轮92浏览器或全站strict/lint通过；既有86项与缺配置仍在。整体W2–W7/语义/A12/高风险/完整矩阵/已审A23/容量UNKNOWN/family4N/选项全载及用户暂停项继续，整文件0/historyUnique未知，不算总体完成率。
