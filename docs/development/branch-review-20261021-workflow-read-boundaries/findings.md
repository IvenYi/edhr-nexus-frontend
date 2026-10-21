# W3 实例读取边界

原始基线 d405a9afb4327b859545fa5a12c7eebe1350f418；核心修复725127d46ca1ae758f7fddeeaf94af1079afe432。以下三项为不同触发/根因的medium技术缺陷；不把父子台账记录数当唯一缺陷数。开发证据和原待验目录保留；最终由全新独立对干净749c9f9b正式passed/FINAL，验收见acceptance.json。

## W3-INSTANCE-GRAPH-CURRENT-001

实例currentNodeIds是完整节点ID的CSV，graph却用String.contains判断节点当前性。合法节点1/10/101与1101等可误中，导致图投影标错节点；不代表权威状态被改写。修复split/trim为Set后精确contains，保持实例自己的versionId、权威状态与持久化数据。原生HTTP/JWT/PG旧28项中7项实际红，21项正向通过；修复同组28通过，覆盖并行/空白/null和旧版本，不新增图UI或状态机规则。

## W3-INSTANCE-LOGS-ARRAY-001

真实GET /workflow/instances/{id}/logs返回有序日志数组；InstanceLogs按PageResult读取content/totalPages，正常日志被显示为空。修复消费原数组并在页面按10条切片；换实例回第一页，错误时隐藏分页，保留加载/空/异常/迟到响应隔离。真实HTTP原生库证明数组契约和实例范围；真实维护组件的受控API浏览器验证25条的10/10/5页，不新增后端分页或改日志内容。

## W3-INSTANCE-READ-ID-PRECISION-001

InstanceDetail/InstanceLogs把路由字符串id传给Number，Long超过JS安全整数可舍入到另一个合法实例。修复原样传字符串，两个GET helper接受string|number兼容已有调用；不改API协议、实体或ID生成。浏览器验证700000000000000001请求保持原样；后端证明相邻长实例ID在日志/详情中彼此独立。不是全仓所有Number(id)整改。

## 实际证据与限制

主侧原生初跑28=9失败，其中7真实graph问题、2MockMvc默认ISO8859解码夹具错误；只补UTF8解码，原断言未删改。保留首次夹具ZIP与差异，校正后旧28=7失败/21通过，0errors/skip。修复一次clean53（50原生PG+3H2）全过，含新28、原授权22、DHR保护3；新读取夹具有只读快照，原授权suite另含受控写操作。原始计数/命名案例及摘要见evidence/primary，未提交JWT、原日志或XML。

浏览器旧16=12失败/4正对照，修复16通过；8场景×1440/390，实际页面/主题/client与受控合成API，不是完整App密码登录到真实后端E2E。tsc/Vite完整build退出0。主侧仅实际查看两个分页截图；旧详情元数据/节点投影、日志节点名/状态展示及窄屏样式缺口保留，不能称完整UI验收通过。

通用读取权限维持原单租户MVP，DHR排除与匿名401回归，不擅自新增本人/候选人可见政策。TaskActionRequest未消费页面password，completeTask仅保存可选signatureId，terminate签名参数未使用；DEC0042明确记录控制来源/签名真实性/申请结果落地待实现。是否隐藏未接入密码输入已向用户提问，未收到答复不修改；不得借读取修复强制签署、改动作矩阵或普通表单/DHR规则。本体门禁not-applicable，无新增知识语义已审记录。

完整W2/W3、W4–W7、四知识gap、W5-AUDIT-HASH-001、记录控制/两项DHR high/A12用户暂缓及旧JSONB签名原文不可恢复保持；不连接用户Mac的edhr_dev、不部署、不恢复数据、不自动merge。
