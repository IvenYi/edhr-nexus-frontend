# W3 H004 全新独立质量复核

正式结论：**failed**。受测 base `ca98ab2897990eba30bf1433134aa8560578f562`，候选 `ef07ee7c34520c509d91954bd6fff4ca436ecd9d`。本实例未参与实现、修复或 tracked 测试/夹具修改；只写 /tmp，实际运行构建产生 ignored target/dist。知识 `0.3.25 / schema1.2.0`，契约实际读取 ef07。显式远端 fetch 两次均为 ca98。

## 必须修复：QF-W3B-001（medium）

`FormFillSettingsService::validateDraftBindingReferences` 在已查到具体表单、PUBLISHED 版本及 FORM_PROCESS 定义后，对 `nodesJson` 的非数组结果直接 return。语法错误会被 parse 拒绝，但合法 JSON 的非法图形状 `{}`、`null`、字符串均会跳过引用检查。这不符合本批 decisionPackage 及知识证据所承诺的“已有损坏元数据不作为未完成草稿放行”，也与原完整 validate 的数组门槛不同。

独立 standalone Java 探针使用候选真实编译 controller/service，仓储为 Mockito，只计数持久化命令，不声称真实数据库：三种非数组输入都正常返回，draft graph 被修改且保留 `start:removed`，version.save / rebuildForWorkVersion / audit.save 各调用1次。`[]`、正常数组、语法坏 JSON 三个对照都拒绝，图不变且上述写入0次。编译exit0，断言exit1，详情为 `edhr-w3b-independent-malformed-process-metadata.json` 与原件 `W3BindingMetadataProbe.java`。原严格发布仍会拒绝坏图，故此处评级为局部草稿门槛错误medium，不声称生产越权或数据泄露。

应由主会在服务端将此处已有非法图结构明确拒绝，并添加拒绝前无图/审计/引用投影写入的必要回归；本实例不参与修复。L2修复后须使用未参与修复的全新质量实例最终验收，不能将本 failed 改成 passed 或用旧绿覆盖。

## 已实际通过的检查与准确边界

- 10个 Java suites：302总数，299通过、3既有条件跳过、0失败/错误；真实DHR-print前端构建执行。知识89、work controller72、shared service14等原断言保留。H2 PostgreSQL兼容并非原生PG；3跳过为原生PG并发专用1项及两个独立浏览器fixture，均不计通过。
- 原ca98源码+仅候选controller测试重放：3项中失效引用反例1失败、合法/休眠和不完整草稿2正对照通过，0错误/跳过。原共享UI首个DIRECT案例也按预期断言失败，余5未运行；不误记为6失败。
- Node13通过；实际新增共享组件Chromium6场通过，亲阅11张PNG；DIRECT/PROCESS两宽度、打开取消保留、合法/default/休眠保留、流程详情延迟、表单503失败均有实际断言。故障场景恰有1条预期503网络console，其余5场console0，全部pageerror0。
- 原相邻模式浏览器5场通过。另独立构建/tmp探针，亲跑**真实WorkTemplateEditor两模式**的canonical确认→父适配→实际graph PUT→reload，共2场通过/4张PNG，验证嵌套pruned map确实进入图请求且休眠/default/其他form配置保留，打开取消不额外写请求，reload不再写。所有API为受控fixture，并非认证后端/数据库E2E。工序两个父适配源映射已核对，未称各完整页面全部实跑。
- npm run build exit0。npm run lint真实exit2（缺配置），明确未通过。
- 当前技能资源曾短暂恢复，读取了upstream+premium、canonical gate、verification/async/anti-pattern refs，恢复官方audit_project.py原件37716bytes、SHA256 `67fd35597c85a2f37dd3c566f0bd79768cbe059114edcf28074fc5afa3e0ce68`。本轮实际仓库根strict：base/candidate均exit2、84 errors（13unresolved/71violations），**完整finding对象含file/line完全相同，0新增/移除**。这只是当前范围无新增，不称全站规范通过，也没有沿用PR16旧扫描。前端目录单独扫描得到26属于不同分母，不用于仓库根84比较。
- 默认git diff --check将新增固定CSV的2119个CRLF行判作尾部空白；该CSV是原生成器的标准CRLF且历史要求保留原字节。显式按CRLF做diff检查exit0，无其他空白问题，未改Git全局配置或测试门槛。

## 需求、知识与所有权结论

已完整读项目/角色/统一交接、知识README/open-questions、DEC0023/0035/0009/0067与原始设计证据、DESIGN、本批decisionPackage/影响/台账及当前差异。三个生产文件均落在H004和必要可纠正路径；复用既有清理或阻止保存政策，不新增业务规则。原完整validate的主体、按钮、签署、可用signature和必需事件绑定仍在，草稿只检查已提供活动引用，缺少ID/不存在记录/未发布/错类型的未完成上下文保留。没有引用时不加元数据查询；仓储异常及语法坏JSON传播。休眠配置、历史快照、CUSTOM、生产engine未修改。新增绑定引用私有helper提取范围可控，没有大重构。

本体FINAL updated及89正式知识检查证明资产结构/引用等检查通过，不能代替上述实现反例。当前existing published元数据的非法图结构仍需修复；知识不应通过修改政策来适配这个return。

## 任务漂移与交付状态

只读辅助FINAL已收并亲读：2118路径/blob逐条等于原base，全部pending/inventory-only；14项是历史覆盖CSV文件，不是缺陷总数，原主历史记录21项，H012明确保留。PR16合并树与c54交付相同，原53文件/41receipts及14历史CSV未改写。仅NEXT为进度追加。W2/W3交叉推进有明示，未假称完整W2/W3完成，H009/H010不夹带修，A12/两旧DHR high继续暂缓。

scope-review目前明示preliminary，其中一行“等待本体”需最终L0同步为updated；不能当正式PR前复核完成。用户要求主会在**修复后全新QA passed之后、创建PR之前**实际复核范围并先汇报当前W0–W7进度、剩余W2/W3及W4–W7工作。当前failed候选不建议创建交付PR或合并，先修QF-W3B-001再按门禁继续。

全部运行子进程与只读辅助已结束，tracked/protected-tools前后hash无变化，HEAD仍ef07、远端target仍ca98、工作树clean。Maven原始日志/XML可能含认证材料，仅归档安全suite/case/count/hash，禁止发布原始日志或system-out。

独立探针准备阶段两次环境/假设诊断不作为产品反例：/tmp ESM需绝对esbuild导入，Work页面初始dirty状态须与打开前比较而非假定为false；最终父适配探针采用实际打开前后状态等值及精确写请求断言。上述准备未修改tracked实现/测试/夹具，也未撤销任何仓库原断言。
