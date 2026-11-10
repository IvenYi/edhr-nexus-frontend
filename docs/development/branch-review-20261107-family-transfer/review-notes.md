# 健壮性、维护性与后续范围

本切片核对服务transferMember、addMembers预校验/写入循环、三方审计helper、Controller确认/权限、成员实体及唯一索引；不是整Service或95KiB Controller完成审查。方法级原始来源见source.zip，源码/运行指纹不等于整文件语义覆盖。

事务：delete后的flush仍可整体回滚，三个成功提交tag各mutation同非零XID；两种触发器拒绝验证删除后回滚及审计原子性。外部JDBC连接在worker flush后commit前仍见旧成员，提交后唯一新成员；非所有并发写者矩阵。权限：实际JWT签发/filter/controller/advice配MockMvc核401/403/确认400和成功200；没有绕权限、新租户政策或真实登录目录结论。

边界：同簇no-op保原ID/创建时间且无审计；不存在、非合格、未归属按旧拒绝。新关系仍新ID/新创建元数据。异常不吞、不拆事务、不靠重试或宽松唯一索引掩盖原因。审计内容及actor按提交后数据库值核，Python普通夹具摘要复算与产品readback分开。

A23过度防御：新增flush是经旧源真实失败及SQL顺序证实的必要协调点，没有全局锁、兜底写、自动恢复、任意限量、泛型工厂或重复验证。原bulk第二轮成员读可在READ COMMITTED时看到并发新增，不能仅因“重复”删除；本轮只量化，下一批授权仅批量预校验。新测试触发器/sequence/latch/ThreadLocal分别对应真实回滚、尝试计数、提交前外部读与按调用归因，不进入产品路径；自有数据库严格URL guard因存在TRUNCATE，不能当过度防御移除。

N+1/context复用：bulk目前6N+2已分解，只有预校验批读获得下一批授权。transfer单次9 SELECT属本次夹具下的读取，含新ID merge读取和审计merge；未证明这些可无条件删。未引入内存分页、循环新SQL、跨请求缓存或大数组。数据规模假设和性能方案见performance-next.md，未把本地微秒时钟当生产性能承诺。

可抽取方案：当前267行成员Service已有`resolveEligibleProducts`、审计及snapshot helper，并不需要为了本次一行fix分层。下一批应优先将现有`resolveEligibleProducts`的读取改为批量上下文，在原Service内整理预校验成员冲突读取；不另建重复资格方法。原写入及审计仍由现有事务编排拥有，不拆成多个事务或创建通用仓储框架。较大的ProcessModelingController应另批按products、families/members、processes、work applicability路由职责拆Controller，URL/authority/confirmed与事务语义逐端点回归；先整体移动产品簇/成员路由并保留原Advice，若需DTO/确认helper复用再最小抽取，不与本次顺序fix混做。该方案未实施、未算审完。

W3-W5跨链及W6专项继续，W2余项/W7增量、原931知识/86UI候选、A12/高风险/完整矩阵、上传PDFOffice/导出容量/text-ID索引/UNKNOWN、A23含已审代码及用户暂停项均保留。朋友处理的通用工作流签名密码页和生产管理弹窗样式不动。每轮fetch并按实际依赖新增审计，不能因旧文件曾检查而豁免A23或代码增量。本批整文件完成0、历史unique未知；不需要每轮必须发现新bug或产出产品修改。
