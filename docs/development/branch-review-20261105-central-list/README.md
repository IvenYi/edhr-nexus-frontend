# 中央流程列表审查

L2；目标 `edhr-dev@b52138259111dd5a0d99299087913500eff627f4`，PR61已合入且整树同3597a81c，无额外增量。真实入口流程中心→流程日志 `/workflow/instances`、流程干预 `/workflow/interventions`，共同列表API。

交付[PR62](https://github.com/IvenYi/edhr-nexus-frontend/pull/62)，已观察OPEN/MERGEABLE/CLEAN，建议人工合入本轮测试/证据。受测900edae7、归档271a5384后仅L0交付登记；最终推送状态再次核对，原始观察见evidence/delivery-verification.json。性能风险不因此关闭，不自动merge或部署。

先核对现有计数/分页/过滤/权限，再新增显式opt-in PostgreSQL取证，分离每对象表单量及累计对象量；COUNT用于页数不可当无用查询直接删除。性能发现讨论后再定整改；本批不预设产品修改。

当前状态：受测候选 `900edae735f5bd37e070a4c2f519e06e4e8728e3` 已取得全新独立最终质量 `passed/FINAL`，13/13必需检查通过，无发现/阻断。主侧完整184/184（新增7含于其中）、独立86/86、知识89/89均0F/E/S；完整运行115观察事件/344业务SELECT，其中新中央25事件/48请求SELECT（24COUNT），独立服务器16签名吻合，28EXPLAIN回放及25初始化SELECT单列。主侧原运行是b521+dirty新增测试，实际源码指纹吻合后来900候选，不改写当时提交。

本体NA/FINAL，12既有ID有限核对为10consistent/1局部superseded/1旧多租户gap；350知识、0.3.25/schema1.2.0/P0保持。没有产品/前端/迁移/索引/契约/知识变更；无需新增UI构建或视觉验证，Maven自动DHR打印资源构建实际执行，不冒称全前端回归。

新增7项实际覆盖每对象1/30/300表单、30对象×100表单、日志/干预首屏、末页、有限权限、状态、字面关键词、精确ID、空页和无SQL参数拒绝。性能风险 `central-list-json-rescan` 已原生复现，仍open；本批交付取证，不是优化完成。方案已向用户提出，未收到的答复不能当批准。详见[源码与风险](review-notes.md)、[完整运行性能数据](performance-report.json)及[PR前范围复核](scope-review.md)。

所有派发角色及质量子项均正式FINAL，自有运行资源清理；初次分析误将Liquibase空库探测当异常的原件保留，更正分析分类，未发生JUnit失败或产品修复。原86份主侧/本体原件保持，最终独立与只读源码原件另归档。

完整资格人员分页及原暂停/剩余队列保持。7529仅固定盘点，全文件已完成0、历史unique未知；931旧知识候选/86UI、W2余项、W3/W4/W5交叉、W6健壮性/性能/抽取/A23（含旧已审复查）、W7增量仍继续。不自动merge/deploy/恢复/扫删，不查询触发CI。
