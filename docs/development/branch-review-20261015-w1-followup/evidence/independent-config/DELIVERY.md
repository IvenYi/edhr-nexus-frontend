# 独立验收证据交付边界

本目录从未参与修复的最终质量实例原样复制安全报告、结果/用例索引、源码/契约/保护清单和临时验证probe源码。其结构化最终结果为passed；实际受测候选为 `1113fe14f7f7539b9727fc708f49838504287d4f`，目标 `6379bf105127b05a65695992b008b55c142264f9`。主侧核对报告SHA256为 `db6dcee6ca61387bb711af630ef144a8f19043a8c754d2663623387b3e7d2e55`。

报告和原实例README内的裸相对证据路径以其实际原始工作目录 `/tmp/edhr-w1-snapshot-independent/` 为基准；安全同名文件已复制至此。原XML和日志可能含测试JWT或随机测试凭据，保留在上述原始目录，不直接提交。`raw-xml-summary.json`、三组result/index及commands提供原始位置、命令、case状态与SHA；没有用脱敏摘要冒充原始文件。政策辅助实例的安全结果另存为 `policy-subcheck-result.yaml`、`policy-subcheck-README.md`，其来源仍为原 `/tmp/edhr-w1-snapshot-policy-subcheck/`。

复制后仅更新主审台账中的发现状态、独立结果链接、方法级状态与交付摘要；没有修改候选代码、测试、知识、工具或契约。`delivery-receipt.json`核对受测保护文件及实际文档增量；后续文档提交不是新一轮业务测试，不改写独立qualityResult的headCommit。

独立结果中PostgreSQL67项、H2相邻33项、知识89项分别报告。两个原有opt-in浏览器夹具未运行；临时控制器probe另3检查不加入Maven数量。新增PG专项实际通过，默认H2跳过不能替代它。管理员写侧为合法有序SQL事务模型，未宣称管理员HTTP、全UI视觉、全部并发矩阵或W1/W2–W7完成。本批无已确认未关闭缺陷或技术验收阻断，没有执行合并/部署。
