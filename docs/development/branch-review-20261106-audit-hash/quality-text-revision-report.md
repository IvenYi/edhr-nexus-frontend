# W5 新行摘要：全新独立复验

正式结果 **failed**。固定候选 `f640dc75e5e588da9dd60579157092bfcd0e8148`，base/实际fetch目标 `9dc5c0014643d99db299d27a80788cc777a0ccca`。本实例未参与实现或任何修复，未改受测产品、测试、夹具或配置。独立detached工作树、独立PG16容器/数据库/端口实际跑通201/201和知识89/89，0失败/错误/跳过，但额外原生JDBC探针发现当前验收范围内一个新的可复现持久化边界，不能以套件通过替代新事件往返要求。

## 已通过并保留其实际范围的检查

6份原始归档与1181个列明文件大小/摘要全部吻合。初版1c077d28的failed报告原件保持，两项原失败已在当前候选修复：额外原六案例（正常中文😀、普通文本高/低/嵌入代理项、128姓名+尾空格、512摘要+尾空格）独立重放6/6 v2匹配；13个varchar宽度逐一与正式DDL吻合，原生15项覆盖代码点宽度及原非空格超限拒绝，界内空格不被通用trim。普通text修复只影响摘要编码，不改event字段和原接收规则。

旧基线JSON/时间2条真实hash失败与初版v2文本4例1正3真实hash失败均保留；最终相同测试源字节一致，非编译/环境错误。新完整201项包含48单元、真实PG JSON与时间/兼容/迁移/实际生产者/文本/宽度、附件27与事务11、原Signature原生9、Auth与读者/切面相邻回归，均实际通过。配置controller+真实仓储，切面合成joinpoint+真实仓储，签署关联审计私有producer+真实JPA的局部边界保持，不称全HTTP/密码图片认证。原切面吞审计异常未改，不能称全49入口已认证同事务回滚。

独立Python按实际PG成功execute参数、精确Decimal、UTF-16对象键排序、确定转义及VARCHAR实际投影重算59次v2审计INSERT摘要，全吻合；成功执行不等于最终提交。核心写1INSERT、读1SELECT，SET/driver类型元数据另列，没有hash专用SQL。固定UTF-8向量由Python重新计算吻合。正常补充字符的JSON生成器转义为大写代理对，与编码文档一致。

正式0092仅nullable无default版本列，无历史DML或索引；原baseline不改。真实Liquibase旧master升级/重复执行保留旧行，旧应用列集合读写是协议兼容模拟，非真实旧二进制混部部署；应用回滚保留列。未标旧值不重封存，未知版本不猜算法，不改页面/下载、Signature/DHR/file摘要或原ZIP投影。350知识/契约逐字节不变，初16有限记录14一致2gap和本次6增量记录不相加unique，全审原队列与暂停保持。

## QF-W5-JSON-UTF16-003：原始JSON字符串传输替换遗漏

当前 `AuditEventHash.json` 在JDBC传输之前直接解析 `contentBefore/After` Java String。原始Java String若含未配对UTF-16代理项，Jackson可解析该原始字符并在v2 UTF-8 JSON生成器中输出代理转义；PG JDBC却先把原始代理项替换为`?`，再把JSON传给PG。该JSON随后合法入库，读回字段值或键已为`?`，因此v2重算不等。

外部当前实际编译class+PG16/JDBC五案例见 `json-text-persistence-probe.jsonl`：

| 案例 | PG结果 | v2读回复算 |
| --- | --- | --- |
| 正常原始中文😀 | 成功 | 一致 |
| 原始高代理项作为JSON值 | 成功，存`{"value":"?"}` | 不一致 |
| 原始低代理项作为JSON键 | 成功，存`{"?":1}` | 不一致 |
| JSON内六字符ASCII转义`\uD800` | 原规则拒绝，缺低代理 | 不形成持久行 |
| 默认ObjectMapper.writeValueAsString(Map.of("value", 高代理项)) | 输出包含原始Java代理项，成功存`?` | 不一致 |

这不是要求放宽JSONB原来的转义拒绝；原始Java字符与ASCII反斜线转义必须区分。实际生产来源在 `SystemSettingsController`：83使用默认ObjectMapper，110接收systemName，137用同一saved实体形成快照，416放入snapshot，523-524到538-540用writeValueAsString形成JSON。该路径与外部mapper_high案例一致，不是假造无入口的数据类型。

本发现 severity medium/open，当前“新自动AuditEvent成功持久化后可重算”要求未满足。不得通过新业务拒绝、修改原历史或降低断言让结果通过；实现修复交主角色。本实例不参与修复，L2修复后应另派全新最终质量。201/89、六案例和59参数通过只覆盖已实际执行范围，不覆盖此三条成功持久化反例。

## 运行与剩余边界

所有自有PG容器、仅为本次构建创建的依赖软链接和独立工作树已清理，主树未修改，无子实例。原始命令、classpath/class/source指纹、XML/log/PG/JFR/探针输出已封存。没有查询/触发Actions、merge/deploy或恢复历史。

仍保留旧未标历史不可可靠复算、裁剪ZIP不含完整18字段而不能自足校验、JSON树/键排序资源成本及生产峰值/并发/真实HTTP/生产混部未认证等限制；整体W2-W7、931/86、A12/高风险/完整矩阵/大上传PDF-Office导出/UNKNOWN/A23及用户暂停队列保持。当前failed仅来自上述同一编码/持久化范围内的新反例。
