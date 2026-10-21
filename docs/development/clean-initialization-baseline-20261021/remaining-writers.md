# 旧入口的触发方式与修复结果

代码修复已在独立候选工作树完成，并将本次功能差异单独同步到原工作区、重建并更新8081；3000代理已验证到新程序。开发库四组旧演示数据已按用户授权备份并清理。本清单列出修复前的具体触发方式和修复结果。新初始化基线仍是独立候选，没有直接套用已有库账本。

## 没有当前页面调用的旧文档接口

旧SopDocumentPage未被现行路由引用；当前“数据 → 文档管理”使用版本化接口 `/api/v1/master-data/documents`。下列旧写口修复前只能在认证后直接通过接口工具调用。

| 接口 | 修复前如何触发 | 原问题 | 当前结果 |
|---|---|---|---|
| POST /api/v1/master-data/sop-documents | 请求体填 `{"title":"旧轻量文档"}` | 只建主记录，不建文档版本 | 写映射移除，405 |
| PUT /api/v1/master-data/sop-documents/{id} | 以已有ID提交旧编辑内容 | 绕过当前版本管理 | 写映射移除，405 |
| DELETE /api/v1/master-data/sop-documents/{id} | 认证后直接调用删除 | 旧删除旁路 | 写映射移除，405 |
| POST /api/v1/master-data/process-modeling/documents | 请求体填 `{"name":"旧轻量文档"}` | 只建主记录，不建版本 | 写映射移除，405 |
| PUT /api/v1/master-data/process-modeling/documents/{id} | 以已有ID提交旧编辑内容 | 绕过当前版本管理 | 路径移除，404 |
| DELETE /api/v1/master-data/process-modeling/documents/{id} | 认证后直接调用删除 | 另一条旧删除旁路 | 路径移除，404 |

请求示例（本轮已经在隔离候选与更新后的8081、3000代理验证拒绝且无写入）：

```http
POST /api/v1/master-data/sop-documents
Authorization: Bearer <当前登录令牌>
Content-Type: application/json

{"title":"旧轻量文档"}
```

两组历史GET保留。正式 `/api/v1/master-data/documents` 的新增、版本编辑、删除和审计保留。开发库没有“无任何版本的文档主记录”，因此无须为此删除文档数据。

## 页面可以触发的旧模板问题

前提：库中已有旧模板版本，formTrace仍绑定“产品序列号、相关生产批次、责任班组、关联单据”四个已退出预置含义之一。现行设计器已不提供这些项，正常新建配置不能制造此前提。

修复前的页面操作：

1. 在产品或产品簇的制程工序表单中引用这种旧版本，建立工单和批次。进入“生产 → 生产执行 → 生产工作台”，识别未开工批次并点击工序开工，旧配置会随新执行快照复制。
2. 对进行中的批次，在工作台追加表单，来源选上述旧模板版本，也会复制旧配置。
3. 对本身含旧配置的执行，在工作台新增表单份数或继续保存/提交，会再次形成旧记录或派生统计。这是页面可达的缺口，不能归为单纯旧接口问题。

现在对新执行、新附加来源模板、新增份数、表单持久化和旧待处理投影重试进行校验。退役追溯项会提示“追溯项已停用”，不形成新的执行来源、表单记录或投影结果；拒绝保存的事务不增加执行修订或业务审计。

旧记录可以读取，但不会因为测试数据需要继续填报而保留旧写入旁路。业务统计里的班组、单据号是独立属性，不随追溯项退出而误禁。

## 已删除的旧灌数工具（没有待执行操作）

`gmp-platform/backend/scripts/form-projection-demo.py` 和 `gmp-platform/backend/scripts/form-projection-runtime-demo.py` 已删除。

下面仅说明修复前的触发条件：需要有人恢复已撤掉的旧库及8087环境，再主动调用旧工具，才会直接用SQL写入旧演示模板和退役配置。当前页面、应用启动和Liquibase都不调用它们。

清理已完成，无须恢复旧库、启动8087或运行旧工具；重新执行只会再次制造已清掉的旧数据。这两份脚本也没有进入新的初始化master。

## 开发测试数据清理

已删除四个早期虚构演示对象：PROJECTION-DEMO-BATCH、PROJECTION-DEMO2-BATCH、PROJECTION-RUNTIME-20261010-BATCH、PROJECTION-RUNTIME-20261010-V2-BATCH，连同其4工单、4执行、4 DHR、7表单记录及关联投影/索引。4份模板中6处退役映射已删除，其他合法字段和统计保留。

本次是一次性开发库处置，不是产品启动脚本。全库备份在 `/Users/ivenwang/Documents/edhr-nexus-backups/2026-10-21-old-entry-closure`；具体范围见 [清理结果](../old-entry-closure-20261021/data-cleanup-result.json)。对98张表的非目标数据前后摘要比较均一致；安速康数据、11条签名、审计、文件和初始化账本未改写。清理后扫描模板、执行、表单与投影快照，退役绑定命中为0。

## 本体清单与验证边界

旧入口修复阶段未修改本体；用户随后已授权处理107处初始化路径，当前处理与验证见[初始化知识引用修正](../initialization-knowledge-references-20261021/README.md)。CSV已补UTF-8编码标记，关闭Excel旧窗口后重新打开即可使用；也可以直接阅读 [中文可读版](knowledge-path-followups-readable.md)。两份清单保留当时的盘点内容。

原始源码基线 edhr-dev@d405a9afb4327b859545fa5a12c7eebe1350f418。运行工作区HEAD为ca98ab2897990eba30bf1433134aa8560578f562，含原有原因/引用等在途改动；仅移植本次七个Java文件修复、对应测试并删除两份旧工具，保留原功能。新包SHA256为2e057186f057121858cdc72ec3dbfbb79c1a91cae0143f99dabf696a27689e21。页面调用判断来自路由/API源码；HTTP、测试与清理证据见[本轮验收](../old-entry-closure-20261021/README.md)。本轮未提交、未推送。
