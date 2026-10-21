# 工作流待办/已办分页的有限源码辅助

固定 Git：`13def47d4def51237d1393eaa7bf2651e98a0cbd`。本实例只读后端，子实例只读前端接口消费来源；两者已 FINAL，均未改仓库、未跑 Maven、数据库、HTTP、浏览器、构建或 UI 设计审查。这里的算术模型不是产品运行证据，也不替代主侧真实 JWT/PG 红绿或最终独立质量门禁。

## 当前接口与真实调用来源

后端两个队列默认 page=1,size=50，返回 ApiResponse<List<WorkflowTask>>，身份来自真实认证 principal。待办按原 assignee/candidate/unrestricted 谓词及 PENDING/PROCESSING 查询，已办按 assignee 及 COMPLETED/REJECTED/TRANSFERRED 查询；两者排除 DHR_SUMMARY，沿用原排序。以上是已读有限源码事实，不代表完整租户隔离、转办展示政策或全流程已验收。

实际首页 route→DashboardPage→TodoList/DoneList→DashboardTaskList 源码直接 GET /workflow/tasks/todo 或 /done，初始 page=1、显式 size=5，把 res.data.data 当 Task[]。同名 getTodo/getDone helper 请求 /workflow/tasks，但固定 frontend/src 文本引用只命中定义，不是这条路由消费链。表单审批和 DHR 审批独立入口使用 page=0,size=20、content/totals，不能把本批正页码校验扩展到这些不同接口。

## 分页边界（仅源码推导）

- page=0,size=50：start=-50；负页码/负页长可进入负或反转 subList 边界并由通用异常处理映射500。
- page=1,size=0：当前返回200空数组，未拒绝零页长。
- page=INT_MIN,size=1：page-1已先溢出到INT_MAX，少量队列返回200空数组而非拒绝非法页码。
- page=INT_MAX,size=2：乘法溢出到start=-4。
- page=65537,size=65536：乘法正向回绕到start=0，五条队列静默返回第一页；没有异常也不是正确越界页结果。
- page=2147483646,size=2147483647：乘法回绕到start=3，start+size再溢出到end=-2147483646，五条队列进入反转边界。
- page=INT_MAX,size=INT_MAX的start为-2147483646；JSON中的具体数值均用int32模型机械复核。
- page=1,size=INT_MAX当前可正常返回整条有限队列，page=2,size=INT_MAX当前可由start越界保护返回空。不能为实现便利发明最大页长。

仅在 page/size 都为正后，最大 offset=(INT_MAX-1)*INT_MAX=4611686011984936962，offset+size上界4611686014132420609，均在signed long内。转换须发生在乘法前；安全确认start小于List.size后再转为int索引。预期越界页空数组、正常原排序/结果和现有身份/候选/DHR谓词保持。主侧仍需真实HTTP/PG复现与验收。

## 范围与政策判断

正整数分页参数和安全下标属于局部技术输入边界，未引入任务动作、候选集合、生命周期、审计、签署或快照政策，也没有数据库迁移。通用动作类型矩阵仍未得到用户答复；记录控制/两项DHR high/A12延期、W5-AUDIT-HASH-001、历史签名不可恢复及整体W2/W3/W4–W7边界保持，不能随此片关闭。

地图含后端16个实际有限范围，加前端18条原claim中明确已读的37个离散范围，总53范围、26路径。有交叉且非不同方法数；全文件完成0。前端离散range仅机械拆成固定格式，不扩到未读间隔、不冒称父实例重新亲读。全部Git blob/SHA和行范围再次机械核对有界；前端原JSON/MD保留原字节和作者归属。
