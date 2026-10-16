# W2-F001 独立质量复验

实际候选 `6db50c935d81d9601bf0e8e1212c28f0c4499bfa`，独立重新获取的目标为 `edhr-dev@9542cb4cc2071df2c00129cc5dbb4572a245cfa1`，知识基线 0.3.25。本实例未参与修复，只写本目录及测试正常忽略产物；未查询/触发 Actions、写业务数据、修改缓存、合并或部署。

结论只覆盖 W2-F001-SAVE-ACK 及列明相邻回归。实际独立执行：79 项 Node 行为/SSR、5 个真实 Shell/Canvas Chromium 场景、34 项后端直接引擎/解释器/提取、Mockito 与 H2 快照测试均通过；完整 tsc/Vite 构建通过。两份桌面/390px 截图由本实例亲看。保存回调与目录 API 是隔离 fixture，无真实后端保存或 PostgreSQL/HTTP 全链验收。窄屏只验证未保存确认及键盘可达，大画布/头部既存裁切未被宣称适配通过。

同一最终脚本只读载入旧 9542 组件后实际复现 closed=1（预期0），旧 store 5 项中4红。当前 store 绑定成功请求文档，不把未发送 B 标为已保存；undo 回到 A 后 clean、redo B 后 dirty，其他模板/版本延迟确认不替换当前基线。

原工作区设计器检查仍因未跟踪 vendor/online-form-designer 缓存失败。本实例用 git archive 导出候选343份前端文件，逐文件核对实际 blob 字节，只链接原 node_modules，原检查通过；未修改检查脚本、删缓存或降低断言。ESLint 缺配置退出2；官方 premium strict 前后各26项、13 unresolved +13 violations、0新增，均保留非通过状态，归后续 W5/W6。

主侧运行发生在 HEAD 9542 的未提交最终代码字节；已回核4份生产/测试字节与候选相同、11日志和5原始XML的SHA，不冒充其曾在6db候选执行。原后端摘要有1条 inspect-xml，原始及本实例XML证实该例通过，system-out/system-err不是失败。固定来源清单1606对UTF-8路径/blob全部pending；12条记录只是选定方法/分支，盘点不是全部文件审查通过。

两项旧 DHR high、A12依赖、其余知识/权限/E2E缺口继续作为批次外残余；本轮不接受完整 W2、全分支或生产发布。正式结构与检查在 qualityResult.yaml，安全摘要、截图见 artifact-manifest.json 的 safeToCommit=true。日志、XML、完整保护清单和导出目录仅留本机，不应提交。
