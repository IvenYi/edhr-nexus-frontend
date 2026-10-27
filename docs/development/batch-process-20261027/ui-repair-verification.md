# 批次界面与日常服务修复验收

2026-10-27，L2，同一批次制程功能切片的连续修复。来源和目标均为 `3aebfd49faa21a27fb3db7075e1ac2d9c8b2f176` 加本次工作树；已 fetch 核对契约无增量。知识版本 0.3.25。决策和影响范围在原 `decision-package.yaml` 的 `uiRepairContinuation` 中维护。

## 根因与改动

用户五张截图为 user-confirmed 问题证据。主侧直接请求日常 8081 的工单 222 及制程候选，确认它仍使用 10 月 25 日启动的旧 JVM：工单响应含旧 processVersionId/processVersion、缺 allocatedQuantity/hasObjects，候选缺 processReference。新版前端将缺失额度参与计算，得到 NaN，并缺少制程归属名称及预览来源。8082 的新版独立服务字段完整，前序验收没有覆盖日常服务同步。上述为 original-evidence，不将问题归因于用户数据操作。

- 更新日常后端到当前已提交实现；本轮没有修改后端源码或数据库基线文件。
- 批次编辑：未读取完整有限数值、候选身份缺失、请求失败或刷新中时禁用保存；不把未知额度当零或无限。选项显示版本和所属产品/产品簇，当前既有引用仍保留并由后端再次验证。统一使用 FormDialog 及字段分组。
- 拆分：保留三种添加方式，使用横向紧凑表单和全宽清单；待提交/已拆分页签保留各自数据，提交成功后切换到已拆分。加载失败可重试，关键数据未就绪时禁用添加与提交。预览增加重试和加载占位。
- 工单：基础信息接入 FormDialogFieldGrid，三个普通字段中的最后一个产品字段自动跨两列。
- 既有数量占用、工单计划、生产形态、首次开工冻结、实时作业与审计政策不变。

## 日常开发库同步

用户已授权 MVP 直接删除或硬调整旧数据。本轮选择保留数据并定点改结构：

1. 完整备份 `edhr_dev` 至 `/tmp/edhr-dev-before-batch-ui-repair-20261027.dump`。
2. 对照当前干净基线库，应用表列差异只有 work_order 的旧制程列与两个缺失终止字段；停止旧 8081 JVM。
3. 事务内删除 fk_delete_guard_013 和 work_order.process_version_id，新增 termination_reason varchar(500) 及 termination_at timestamp。
4. 对照新基线逐项核对全部应用表列（类型、长度、空值约束、默认值）、外键/约束、索引，差异均为空；此后才将该 schema 基线单条 checksum 置空并由 Liquibase 重算。没有用 checksum 跳过实际结构调整。seed checksum 不变。
5. 重新启动 dev 服务 8081，Liquibase/Hibernate 正常启动；schema checksum 与新基线库一致，为 `9:2b872f09ed4a9725481873bd3ba3a1bd`。启动原始日志 `/tmp/edhr-daily-backend-20261027.log`。

重启后真实接口复核：222 的 allocatedQuantity=22222、hasObjects=true；processReference 含 V1.0 及产品身份，所属 workspace 返回该版本。原有工单与批次数据保留，未修改用户 111 系列批次数量。无仓库兼容代码、双读、迁移链或 seed 改动；不涉及部署。

## 实际验证

- `node --test scripts/test-production-object-edit.mjs`：6 项全部通过，覆盖缺失额度/身份、刷新与失败阻断、最大数量、正小数、SN 固定、当前引用保留。
- `npm run build`：TypeScript 与 Vite 构建通过。`mvn -q -DskipTests -Dexec.skip=true compile` 通过，本轮无后端代码改动，未声称重新运行前序 132 项测试。
- 在日常 `3000 → 8081 → edhr_dev` 页面，222 的 V1.0 当前配置预览成功；111-181 编辑显示具体产品和版本、最大数量82，输入83时保存禁用，随后取消未写入。
- 在独立验收工单 `QA-UI-REPAIR-20261027`（计划0.5）上：批量生成两个0.25，切换清单后保留；移除一个，手动添加0.1，再导入CSV的0.15，三项统一提交成功。提交后自动显示已拆分3项。
- 编辑验收批次 UI-MAN：0.1001超量禁保存；0.05保存成功。数据库确认三批数量为0.25/0.15/0.05，工单计划仍0.5，分配0.45。三条CREATE审计含具体制程引用，UPDATE只记录 targetQuantity 的真实变更。
- 1440×1000、1024×900、390×844实际浏览器布局检查；窄屏输入单列、底栏可见，表格在自身容器横向滚动，弹窗scrollWidth未超过clientWidth。产品字段跨满基础信息分组。
- 浏览器无本轮请求失败或运行异常。公共 FormDialogFieldGrid 的 `:nth-child` 引发既有 Emotion SSR 提示，React Router future flag 提示仍在；当前应用为客户端渲染，本轮不修改公共组件或路由配置。

原始截图与验收工单信息在 `output/playwright/batch-ui-repair-20261027/`。最终布局截图采用 `split-final-1440.png`、`order-full-row-final.png`；早期 order-full-row.png 抓到过渡动画，不作为最终视觉证据。本体 `ontology-result-ui-repair.yaml` 为 updated，实际知识检查89项通过。首轮独立质量结果 `quality-result-ui-repair.yaml` 为 passed，并指出一处旧导入展示描述；已直接修正 DEC-0014-09 及相邻证据，业务与测试代码未变。该知识修正由全新质量实例复核，最终结果另见 `quality-result-ui-repair-final.yaml`，不以主侧检查代替它。

## 设计适用边界与暂缓

采用用户指定 taste skill 的审查、对齐、信息密度、响应式及完整状态原则。该 skill 明确排除后台表格和多步骤产品界面，因此沿用项目现有 React/MUI、蓝色与字体/圆角规范，不引入营销页动效、图像、外部字体或第二套组件系统。DESIGN_VARIANCE=3、MOTION_INTENSITY=2、VISUAL_DENSITY=5。既定其他冻结详情入口继续暂缓，本轮不扩大样式到其他页面。
