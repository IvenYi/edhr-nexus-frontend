# 签署原文的数据库往返与归档校验

延续edhr-dev整体审查，PR21已人工合入c3343f45bb79f72368937f0d197ae01f989f0390，树与交付360b07ad相同，无契约增量。当前L2仅修签署原文存储；W3任务动作/候选/终态链另有有限源码映射，未据此修改业务政策。PR5–21不重开。

`W3-SIGNATURE-PAYLOAD-001`：现有服务对原JSON字符串UTF8作SHA-256，Signature却以JSONB存储，PG会规范化字符；真实DHR来源及审批签名消费者按读回原字符串重算，合法新签署因此被拒绝。旧归档测试用H2/TEXT，未覆盖该差异。原生PG初组7项有1原文断言失败、3实际归档业务异常及3对照通过；不是夹具setup失败。原件与源码见 [findings.md](findings.md)。

核心2ead6de2仅把snapshot_data改TEXT、增加0118前向迁移及master引用。CHECK保留原JSONB语法/数值范围可接受性，不存规范化结果；不改原摘要算法、签署服务、归档拒绝、资格/权限或JSON形状政策。旧注解镜像测试由18项真实原生PG行为检查替代。知识c4af50a7只同步4条实现证据与原锚点，正式ontologyResult updated/FINAL；实际89知识及12条有限语义通过，版本和成熟度不升。

主侧104个不同业务测试已有有效通过：focused-final104中103过、1项测试字体Unicode别名导致PDF提取失败；纠正本地字体后AuthControllerTest24全过并只替换该suite，不累计成128。包括18原生PG、完整master独立临时新库、旧元数据/摘要保留、JSON输入拒绝及形状、重复应用、旧不可验仍拒、有损回退拒绝；DhrArchive13包含系统Chromium实际PDF/ZIP回归，另DHR生命周期5为H2。真实签署服务+JPA+JDBC消费者不冒称完整HTTP授权/登录E2E，个人快照用例只为实体原文往返。详见 [主侧摘要](evidence/primary/validation-summary.json)。

全新独立实例对干净aaef52a782327e68da736faf83a249a3217b7228正式[qualityResult passed](evidence/independent/edhr-sig-qa-qualityResult.yaml)，8/8必需检查通过：一次完整clean104业务（18原生PG）、89知识，均0失败/错误/跳过；另独立重现旧基线同组7例的1断言失败+3真实业务异常及3对照通过，并完成原件/继承/范围及ledger字节核对。全部专业实例和子实例FINAL；后续只L0归档/验收/PR登记，受测产品、测试、知识、脚本、契约和冻结catalog/ledger保持。[acceptance.json](acceptance.json)登记本批high已独立验收，冻结台账的原待验状态不回写。原结果中的/tmp路径通过[归档收据](evidence/independent/archive-receipts.json)定位同名原字节。

首次缺字体/默认浏览器缓存环境失败、首个迁移夹具未提交种子、完整master先用自定义schema触及旧0077硬编码public，以及字体别名失败均保留，未改产品或断言让环境变绿。默认缓存指向系统Chromium154，不称安装了bundled145；字体仅本地测试缓存，原件URL/SHA与处理说明保留，不提交字体/浏览器二进制、日志/XML或凭据。

迁移保留旧JSONB当前可读文本、摘要及其他列，不恢复已丢字符、不重算旧摘要。旧签名仍可能阻断归档，不能据本批声称存量档案已恢复。无损自动回退到JSONB不成立，Liquibase回退应拒绝；应用与迁移应配套，不能把旧JSONB映射应用继续写新库宣传成已验证的混跑/回退兼容。本轮只在自建合成PG测试，未执行生产迁移、数据修复、合并或部署。

本批[目录](source-catalog.json)及[总账](ledger/summary.json)固定c062c2f9：2801路径/2552知识ID，485有交叉源码范围（旧392+辅助88+主侧5）、108历史及当前有限语义（旧96+正式12）、48含父子/夹具/文档等问题记录。101源码文件变化范围及57语义或依赖变化记录仍待增量；整文件完成0，没有可信整体完成百分比。原辅助w3d-signature-source:028将20行文件声明为10–22行，原件保留、显式排除，不静默裁剪或补称已审；其余93条新范围有界。生成器不执行源码/语义/运行验收，12正式核对与104主侧测试另有原件。详见[进度](progress.json)。

全量W2/W3、W4–W7、四旧gap、两项用户暂缓DHR high/A12、记录控制延期与W5-AUDIT-HASH-001保留。todo/done分页线索留后续小批；generic动作类型矩阵已单独问用户，无答复不改该政策。已在全部角色FINAL后、PR创建前实际向用户完成[范围/进度复核](scope-review.md)，本批无任务漂移。自建临时PG按确切ID清理，未合并或部署。
