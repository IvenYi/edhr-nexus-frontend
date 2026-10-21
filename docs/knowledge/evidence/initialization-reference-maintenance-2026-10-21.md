# 初始化来源定位维护（2026-10-21）

本次只修正初始化整理后失效的知识引用，知识版本保持 `0.3.25`。来源工作树为 `d405a9afb4327b859545fa5a12c7eebe1350f418` 加本轮未提交基线整理；已核对目标 `edhr-dev@c671b23fd9847a7e1cb2d1bad3c3bb138fc5620f`，两者知识与治理契约没有增量差异。本次不是全库语义审计，也不提升业务资产成熟度。

`user-confirmed`：用户允许清除没有当前页面触发路径的旧接口、旧测试数据及无必要初始化兼容/清理，并在旧入口修复后继续处理初始化相关的本体知识。截图中的两份灌数工具是修复前触发方式，并非待运行任务；本次没有恢复或执行它们。

`original-evidence`：生产初始化 master 只加载 [当前结构](../../../gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql) 和 [当前预置](../../../gmp-platform/backend/src/main/resources/db/changelog/baseline/0002-current-seed.sql)。当前数据库事实和实现锚点因此定位到最终表、列、约束或预置权限；历史回填、删列、旧汇总转换和签名格式迁移不在新建库时执行。

历史 SQL 原字节保存在 `gmp-platform/backend/src/test/resources/db/changelog/`，只承载历史来源和隔离迁移测试。历史证据、决策中记录的原行为、原时间及原验收边界保持；移动后的路径不表示这些迁移仍属于当前生产初始化。当前锚点的 `sourceRevision`、`capturedAt` 和原定位说明保留此前核对时点，追加的明确日期注记只说明本次数据库定位维护，不倒填新的业务验收。

特别保留的边界：

- `0104` 旧汇总转换和 `0118` 签名转换继续作为历史证据；当前结构直接创建最终列，不执行历史转换，也不据此声称旧签名恢复可验。
- `form_template_version.projection_frozen_json` 在当前基线仍存在；其列存在不证明当前执行复制路径读取它，不把历史列名解释为新的冻结契约。
- `material.brand_name` 是当前可空品牌列；旧 `0078`/`0081` 的加列与重命名过程仅保留为历史证据。
- `0059` 审计补写、`0095` 删除重复备注列以及 `0112` 退役追溯项删除不在当前初始化执行。当前锚点指向最终结构/预置，原审计和清理记录不重写。

逐处映射和独立验证见 [本次维护记录](../../development/initialization-knowledge-references-20261021/README.md)。该记录与原盘点分开保存；路径校验通过只证明本次引用闭环，不替代业务运行、数据库迁移或全部历史知识验收。
