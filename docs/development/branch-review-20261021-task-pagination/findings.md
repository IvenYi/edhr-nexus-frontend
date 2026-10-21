# W3D-TASK-PAGINATION-001

唯一技术medium，首次源码线索来自前批W3动作审查，当前13def47d真实HTTP/PG复现；不是重复新增旧签名或权限问题。

两个接口手工以int计算(page-1)*size及start+size，非正输入未拒。真实测试使用合成签名JWT经过产品安全filter，原生PG提供有序5条合法todo/done及其他用户、终止和DHR干扰项；请求伪造assigneeId=2，真实principal=1。page=0/负值、size=0/负值未得到预期400；page=INT_MAX,size=2负偏移；65537/65536正向回绕到0，误返回第一页；2147483646/2147483647产生正start再加法溢出。不能仅修会报500的分支或把size任意封顶。

同一新增fixture、同组28：旧产品基线22失败/6正向通过、0errors/skip；修复后28通过，原控制器2和实例授权22同时通过，总52个不同测试、50原生PG。主侧运行时HEAD仍13def47d且测试/修复未提交，安全summary原样保留，不将其HEAD改写成已提交运行；相同测试及修复字节随后提交25e974e0。全新QA须针对干净固定候选独立验收。

最小修复仅todo/done：认证身份解析后、查询前拒page<1或size<1；以long先乘，先判断超出实际List范围，再安全转换下标及求尾端。所有正int组合的最大偏移/尾端小于Long.MAX_VALUE。签署、候选、委托、DHR专属规则、SQL及排序、返回ApiResponse<List>、默认值与原大小合法能力保持，不产生写入或迁移。

本项仅整数范围技术修复，无业务政策、知识定义或客户解释替代，本体门禁not-applicable。不是全局请求参数绑定/异常策略、全站分页、数据库分页优化或整体工作流验收；其他遗留open/deferred与未回答动作矩阵不关闭。当前处置fixed-awaiting-independent-acceptance，原件归档与之后正式acceptance分别记录。
