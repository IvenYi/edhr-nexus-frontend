# audit-event-v2 编码与兼容

本版本是AuditEvent新自动封存的工程编码，不是业务状态、电子签名算法、链式日志或带密钥认证。普通SHA-256不能抵抗可同时改内容和摘要的数据库写权限持有者；本批不增新的安全承诺。

SHA-256消费UTF-8 JSON数组的确定输出。首项为字符串`audit-event-v2`，随后固定18项：id、tenantId、entityType、entityId、action、contentBefore、contentAfter、operatorId、operatorName、operatorAccount、source、moduleName、menuName、functionName、dataSummary、reason、ipAddress、createdAt。id为十进制字符串，其他普通字段为原字符串或JSON null；不trim、不做Unicode规范化。JSON结构分界使空值、空字符串与字段内容明确区分。

contentBefore/After：SQL null写为null；存在的JSON值写为单元素数组`[value]`，故JSON null为`[null]`。JSON解析为精确整数/十进制，重复的解码键保留最后值，沿JSONB语义。对象键递归按Java字符串自然顺序（UTF-16代码单元）排序；数组保原顺序。数字转BigDecimal去尾零后按`toString()`输出，故1/1.0/1e0同值，负零与零同值，大于2^53仍精确。字符串保解码值，转义和原字节格式不参与JSONB值摘要；不得把它称为保存原JSON字符串字节。

createdAt保持无时区LocalDateTime。新自动封存先将实体自身截断到微秒，再按`uuuu-MM-dd'T'HH:mm:ss.SSSSSS`固定六位格式输出。只格式化而不赋回实体会被PG舍入影响，因此不能省略赋值。未填时间仍保原空值语义/DB原约束，不私自补当前时间；历史或显式已有摘要的事件时间不改。

独立固定向量对应单测：原JSON `{ "z" : 1.00, "a" : "原始变更" }`、其余字段沿测试常量，确定UTF-8文本为：

```json
["audit-event-v2","1","default","AUDIT_PROBE","42","UPDATE",null,[{"a":"原始变更","z":1}],"7","审查人员","audit-probe","UI","审计","审计验证","修改","对象42","验证持久化","127.0.0.1","2026-11-06T12:00:00.123456"]
```

摘要为`ebfb3e7a6cda30e0d9c91cd58b7939c4e5cb2cefeba9597343dd1023b10a1e81`。此向量由独立Python UTF-8/SHA计算并固定在Java断言中，不仅检查hex长度。

0092追加`snapshot_hash_version varchar(32)`，nullable无default，无历史DML。未标版本不能按hash长度或时间推断算法；`computeSnapshotHash`保留旧算法仅作诊断，旧事件往返不可保证相同。非空外部提供hash仍保留、不自动盖v2；未知非null版本明确拒绝算法计算。没有新增“验证通过”字段、页面行为、下载阻断或读时自愈。当前49生产位点/37文件都走自动入口，代码允许外部提供hash不代表过去所有数据都来自该49入口。

升级先追加列，旧进程仍按旧列集合写null版本，新进程给新自动事件标v2。应用回滚保留列与已有hash，旧读取仍透传摘要；旧进程不会重算v2。不要DROP列、回写旧算法、后台补算或改写历史。测试证明实际Liquibase从旧master升级与重复执行不改旧行，及旧应用列集合插入/读取兼容；这不等于生产混部部署或生产迁移已执行。

确定编码helper只在本审计域内使用，局部parser约束覆盖PG既有可接受边界，不改全局设置；显式容器栈支持深层JSON，不建通用插件/缓存/查询归一化框架。仍有JSON树和对象键排序成本，不能用Digest流式输出宣称全路径常量内存。
