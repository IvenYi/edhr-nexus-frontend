# W4 产品簇成员转移：真实 JPA 写入顺序

L2；目标 `edhr-dev@04db7e838ec5e194355ff954ff173a02205e0fd6`。PR72已人工合入，整树与上批交付42bd62cc一致，无外部代码、知识或契约增量。实际156项运行受测提交 `1709dbc4d3d28d8721ff001b69ad934a6de54d18`；后续 `b2b0df85572f634925d9e3b1ac4a91c0988bb86c` 仅删除新测试一个未使用导入。双方重新test-compile成功，三个新测试及嵌套类javap指令输出相同，24项输入原字节不变、测试只有该导入删除，未冒称新SHA实际重跑156。全新独立质量已核增量及复用依据，正式passed/FINAL、10项必需检查通过、medium及low均resolved；实际独立156/156和89/89均0F/E/S。所有角色及孩子FINAL后，23:13实际[PR前复核](pre-pr-drift-review.md)通过，此后仅L0文档/原件/交付。

已交付[PR73](https://github.com/IvenYi/edhr-nexus-frontend/pull/73)，audit/edhr-dev-family-membership-transfer-20261107→edhr-dev，观察OPEN/MERGEABLE/CLEAN，建议人工合入本批有限修复。验收fb18a959后仅L0交付登记，登记前真实远端/PR head/本地一致且25输入同，见evidence/delivery-verification.json；登记提交推送后再核一次。下一批先fetch真实合入及新增，执行已授权的预校验批读；不自动merge、部署或恢复。

成员转移已有二次确认、单一产品簇归属、同事务及三方审计规则。旧实现调用delete后以新ID保存，但Hibernate会在同次flush先INSERT后DELETE，原tenant/product唯一索引因此拒绝合法转移。完整canonical PostgreSQL、真实Spring事务代理和JPA已复现，不是根据mock推断。

产品仅增加一行：删除旧成员后调用仓储flush，仍在原事务内，再按原逻辑新建关系和产品/旧簇/新簇三方审计。flush不是commit；不改变新ID、创建元数据、唯一约束、原资格、权限、二次确认、不收原因或开工/制程/作业政策。

主侧最终 **156/156，0失败/错误/跳过**。新原生13覆盖合法服务提交、实际JWT/MockMvc入口、未确认/匿名/无权/不合格/不存在/未归属、同簇no-op、第三条审计拒绝及新成员拒绝整体回滚、外部连接提交前仍见旧关系，以及批量添加1/10/100观察。相邻原测试143：成员5、仓储6、制程解析3、Controller55、批次21、审计53。仓储6为原H2隔离测试，新转移13及批次21为真实PG，不能混称全部PG。

同字节测试在旧业务源码上是 **13=9通过/3 assertion failures/1真实产品ERROR/0跳过**：直接合法转移唯一冲突为DataIntegrityViolation ERROR；MVC实际400而非200、第三audit拒绝尚未到达、提交前gate未到达为另3个失败。原件全部保留，不将真实错误改写为夹具错误或0E。最初final阶段工具拼错既有测试类名，Maven前终止、0JUnit；retry156中原两项growth观察未启用而跳过；verified启用原开关及测试PG扩展后156全部执行，没有削弱断言。

服务器带tag成功执行记录证明：合法转移同一非零事务先DELETE、后INSERT member、再3条audit；审计拒绝时成功DELETE/member及前2条audit，第三条仅在ERROR/STATEMENT出现，最终旧关系和零审计恢复。新成员拒绝时DELETE成功、新INSERT失败，同样整体回滚。失败SQL不计成功execute，Hibernate prepared语句数量不等于批量实际INSERT次数。观察JSON保留真实提交后成员/审计完整值；独立Python按本批普通UTF-8/整数夹具重算旧控222及修复后231个审计摘要并核身份，不能外推所有编码边界。见[main-analysis.json](main-analysis.json)。

本体有限28项核对，仅纠正两条已有fact指错Service的来源信息到真实Controller；350知识文件349不变、1文件中2ID各5项provenance字段改变。事实定义、类型、操作符、可用性及implemented/internal保持；0.3.25/schema1.2/P0不升级。纠正后实际知识89/89，正式结果updated。来源、有限语义与知识自动检查不代表931项全盘语义一致。

批量添加100个产品仍602次SELECT，1/10对应8/62，两版同值；本批不优化。用户已明确授权**下一批先批量化预校验读取**，保留原实时复核、写入和审计，见[performance-next.md](performance-next.md)。DP里的未授权描述是基础测试前的时点记录，由此新答复更新下一批队列，不回写受测输入。

原件归档于evidence：main.zip保留四阶段、SQL参数、XML、工具和1709源码指纹，source.zip保留只读源码/历史角色，ontology.zip保留正式来源纠错和知识校验，import-clean.zip保留主侧无用导入删除后的编译与前后指令，independent.zip保留全新质量实际运行/独立编译/工具数值编码校准及initial-1709报告。五包311成员逐SHA通过，独立原manifest另110文件核过。运行是合成隔离数据/JWT+MockMvc，不是浏览器、socket或真实登录目录；本批不证明完整跨租户、并发写及首次START矩阵、生产容量/SLA。资源清理单独记录。

整体仍W3/W4/W5交叉及W6，W2余项/W7增量、931知识/86UI候选、A12/高风险/完整矩阵、text-ID索引/上传PDFOffice/导出容量/UNKNOWN、A23含已审代码及用户暂停项继续。本批整文件完成0、历史unique未知；不以局部修复代替全审完成。不得自动合并、部署、恢复历史或查询/触发CI。
