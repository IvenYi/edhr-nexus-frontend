# 上传文件所有权与真实上传者

当前最终验收：全新独立质量对clean `2bdea59bc591fcec6ba9a4c8cbc4374cc65da1ab` 正式passed/FINAL、12/12必需检查；当前37/37和新知识89/89通过。同源最终17在实际最新目标0bd为7真实红10正，在预补正e954为1保留句柄红16正，均0error/skip。两个发现按[验收](acceptance.json)有限resolved；[最终报告](evidence/final-quality/quality-review.md)与[42份原件映射](evidence/final-quality/archive-map.json)保留原始证据。原18/首failed45/整合41及原包字节保持；下文待QA/未补正的检查点由本段覆盖当前状态，失败历史不回写。全部正式角色FINAL后、建PR前已实际向用户完成范围/漂移/阶段复核，见scope-review.md。

初始L2基线edhr-dev@032b83e9d5b8a25bee6d5b59c45d86892f672d00：PR47人工合入、当时整树同f73005b4，无外部增量；新分支audit/edhr-dev-file-consistency-20261031。初始5173路径/130SQL清单留在inventory，仅盘点。

收尾中目标新增至`0bd0848bbded6d6954d62a4f924e0b2eec6623ad`，已正常merge形成e9548d5f，保留协作历史；产品/知识666路径增量见[integration-increment.json](integration-increment.json)，逐项pending、不可算语义完成。项目/角色契约无增量，三本批源码哈希未变，原18主侧证据与原包字节保留；当前决策包/新本体/最终质量按最新实际候选重新核对。当前330知识文件，不能沿用原303不变的全局声明。新固定全量清单在inventory-current，不覆盖初始清单。

当前补正覆盖上文“源码未变”检查点：独立实际持有预占文件READ句柄，证明替换式Files.copy会unlink/recreate，路径新字节虽正确、旧句柄却EOF；属于同一所有权发现未闭环。当前改为在已预占文件上newOutputStream(WRITE)+transferTo，两条流都try-with-resources，不释放预占路径。新增持句柄读取的确定性回归，补正前6copy中1真实红，补正后最终5类37/37通过；原36/89/16及失败探针作为历史原件保留，不回写。新最终质量须fresh实例，尚不提前passed。

新当前盘点5758路径/134迁移、464 HTTP注解/216路由候选仍inventory-only。666路径中新增4迁移同样pending；旧A23 SQL130是固定历史队列，不冒称它是永久当前分母。

新代码已经包含记录变更/作废、DHR联动和工作流干预/转办签署实现，“记录控制尚未实现”不再描述当前代码，转为增量待审。旧DHRhigh/A12剩余历史视图、知识gap及TaskDetail友方问题不因新代码存在自动关闭；按实际新证据逐项核定。原TaskDetail页面本身不在本次目标差异中，既有友方归属保持。

最小修复只有FileController一个产品文件：`AUD-W5-FILE-COPY-OWNERSHIP-001` medium，先以createFile原子预占新路径再复制，失败只清理已拥有的本次路径，碰撞不能覆盖或删除旧原件；第二流打开、部分复制和关闭失败均处理，清理失败附加到原异常并记录，不吞掉真实失败。`AUD-W4-FILE-UPLOADER-001` medium，HTTP上传者从既有AuditContext认证主体ID读取，旧system只保留给无请求上下文的直接内部调用，不回填旧记录。

主侧旧同源两类16执行为6真实断言红/10正（copy5中4红，HTTP11中2红），0error/skip；当前copy5+HTTP11+原资源9+原控制器9+DhrFormFiles2=36/36通过。实际磁盘和JWT/filter/MVC参与，仓储受控mock；不冒称原生DB、完整对象ACL或跨存储事务验收。复制清理只关闭上批跨介质候选中的局部残片问题，不关闭DB保存/提交失败、delete顺序或进程崩溃。

共享文件权限已核不同业务真实入口，不能一刀切加文档页权，不能只相信targetType/targetId。DHR受控附件为独立dhr_attachment及专用冻结任务链；其规则不等同全部FileObject。三项尚未确认的未绑定/多引用/个人认证材料边界已集中向用户提问，依赖ACL实现保持pending。该问题不阻止本批已明确的路径/身份纠错。详见review-notes.md及本体原件。

当前本体原及最新增量均NA/FINAL，新最终质量已按顶部结果闭环；10旧有限ID重放不计新unique，七新DEC仅兼容上下文筛查，330当前知识/44变动文件/183ID候选、666路径均非全语义完成。整文件完成0；当前A23六记录与2改1增不关闭旧856语言+feature1、另130SQL及历史增量、新4迁移。整体W3/W4/W5交叉推进；下一批先fetch实际合入和外部增量，优先真实事务下DB登记/提交失败及delete一致性，ACL待用户三边界答复。原暂缓按上文最新实现分流，旧DHRhigh/A12剩余及其他gap不自动关闭。本批无UI产品修改，未验收新目标全部界面。受测后仅L0归档/验收/范围/交付，保护路径同blob见evidence/delivery-verification.json；不自动merge/deploy/恢复，不查询触发CI。
