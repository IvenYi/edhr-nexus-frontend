# 业务报表字段链实现与验证（2026-10-13）

本轮级别 L2；基线 `d050f8b63b53974523936175c990f4804f768881`，分支 `form-traceability-projection`，知识基线 0.3.24。延续 DEC-0075-35 与现有 decisionPackage，扩展路径为 product-core/configuration。

## 已实现

- 投入工时绑定数字字段，由填报人员填写人时；不从时间段、人数或签名推算。未填保留缺失，负值或非数字拒绝。
- 报工开始时间、结束时间、生产日期和报工人分别映射；开始/结束要求日期时间，结束不得早于开始。生产日期不以系统时间补齐；报工人不以创建人替代。
- 人时进入既有冻结事实与合计；业务记录显示独立列，保留既有生产对象/工序/单位分组。
- 报废分类、原因支持字典值及其标签，并在业务记录中直接展示、筛选；额外展示字段仍在详情显示。原因不是当前合计的分组维度。
- 查询补齐冻结的工单、产品、业务日期/人员和表单系统日期等条件。日期范围包含首尾日期，列表与合计使用同一筛选。
- 设计器沿用侧栏、展开区、下拉和画布选取；报工信息与备注展示分开，顶部统一保存。

无数据库结构迁移。历史冻结记录不会虚构人时、生产日期或人员；旧事实缺少的信息显示为“—”。本轮修正现行知识，不以猜测替代冠骋精确聚合规则。

## 验证

主智能体完成：

1. 后端聚焦测试69项通过：`FormProjectionInterpreterTest,FormProjectionPostgresTest,FormProjectionAuthorizationTest,TemplateModelingControllerTest`。
2. 后端回归76项通过：`BusinessKnowledgeModelTest,ProductionExecutionFormValuesTest,FormTraceIndexPostgresTest,FormFillSnapshotTest`。
3. 前端4个脚本29项通过：`test-projection-source-editor.mjs,test-projection-panel.mjs,test-projection-preview.mjs,test-projection-report.mjs`；日期显示微调后重跑报表脚本3项通过。
4. `npm run build`、`npm run verify:template-designer-react` 通过。
5. 隔离库 `edhr_form_projection`，后端8087：`scripts/form-projection-report-demo.py` 实际执行模板保存/重读、生产启动、暂存、最终完成及报表查询。暂存不进入正式统计；两笔良品10/20、人时3.5/未填，合计良品30、人时3.5；报废原因划伤2/污染3，总量5，按划伤筛选后总量2。
6. 浏览器 localhost:3007：报工记录筛选示例对象返回两行，区分3.5与未填；点击行进入公共详情抽屉。设计器展开第一笔报工记录，画布选取人时数字来源、展开报工信息、顶部保存显示成功，API重读确认绑定保留。

本地视觉证据：`output/playwright/report-person-hours-detail-20261013.png`、`output/playwright/report-person-hours-designer-fixed-20261013.png`。设计器初次截图暴露演示数据缺失绝对定位；已修正新demo脚本及演示模板，刷新重开后布局正常，不修改生产快照。窄屏完整交互、全系统E2E未执行，不冒称已验证。

独立质量报告：`form-projection-business-fields-quality-2026-10-13.yaml`，结果 passed；独立后端31项、前端22项及API边界验证通过。本体结果 updated，知识仅局部 implemented，未将 DEC-0075 全部事项标记完成。

## 明确暂缓

自定义报表、多人分摊、人数计算、新原因汇总、工单产出联动、库存、跨行共享来源；冠骋精确分组/覆盖更新逻辑仍是证据缺口。当前一行一笔的业务记录已与合计视图区分，不能将截图列反推为竞品分组键。
