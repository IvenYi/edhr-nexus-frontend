# 首轮独立失败后的主侧整改验证

首轮实际质量结果是failed，原件在 [independent-first-failed](../independent-first-failed/quality-result.yaml)，不回写。当前完整命令类别、返回码、源字节及原日志摘要见 [verification.json](verification.json)，逐例分别见 candidate128-cases.json、firstCandidateRed-cases.json；实际两视口ModelTab JSON与截图按原字节归档。

当前主侧：128 Node全通过，实际ModelTab新增及主动改型子列、自动保存载荷、未编辑选项直接设置默认、两新行真实值在1440/390px全部通过，构建及静态guard通过。相同12条选项回归在首候选c449为10通过/2失败；实际ModelTab保存的canonical预置也在1440px准确失败，390未达。没有删除旧13浏览器场景，完整脚本现在15场景，等待全新独立实例实际执行。

父表columns命令只初始化新增或实际改型的子列；旧同类型空/missing选项不补齐。backend生产、测试和6343bytes原始fixture与首轮完全一致，其186通过/3跳过仍明确属于首轮，最终独立将重跑。首轮原始官方扫描实际84/84集合无新增，不作为修正版当前扫描。新增UI场景初次因child-design无全局保存按钮而等待超时，已按实际document清脏等待，原业务断言不变，该诊断不计产品红证。
