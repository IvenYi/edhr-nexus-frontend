# 上传文件所有权与真实上传者

本轮L2基线edhr-dev@032b83e9d5b8a25bee6d5b59c45d86892f672d00。PR47人工合入、整树同f73005b4，无外部代码/知识/契约增量；新分支audit/edhr-dev-file-consistency-20261031。5173路径/130SQL及442 HTTP注解/198路由候选只盘点，不等于全仓语义或运行完成。

最小修复只有FileController一个产品文件：`AUD-W5-FILE-COPY-OWNERSHIP-001` medium，先以createFile原子预占新路径再复制，失败只清理已拥有的本次路径，碰撞不能覆盖或删除旧原件；第二流打开、部分复制和关闭失败均处理，清理失败附加到原异常并记录，不吞掉真实失败。`AUD-W4-FILE-UPLOADER-001` medium，HTTP上传者从既有AuditContext认证主体ID读取，旧system只保留给无请求上下文的直接内部调用，不回填旧记录。

主侧旧同源两类16执行为6真实断言红/10正（copy5中4红，HTTP11中2红），0error/skip；当前copy5+HTTP11+原资源9+原控制器9+DhrFormFiles2=36/36通过。实际磁盘和JWT/filter/MVC参与，仓储受控mock；不冒称原生DB、完整对象ACL或跨存储事务验收。复制清理只关闭上批跨介质候选中的局部残片问题，不关闭DB保存/提交失败、delete顺序或进程崩溃。

共享文件权限已核不同业务真实入口，不能一刀切加文档页权，不能只相信targetType/targetId。DHR受控附件为独立dhr_attachment及专用冻结任务链；其规则不等同全部FileObject。三项尚未确认的未绑定/多引用/个人认证材料边界已集中向用户提问，依赖ACL实现保持pending。该问题不阻止本批已明确的路径/身份纠错。详见review-notes.md及本体原件。

当前等待本体及新最终质量正式FINAL，尚不提前关闭发现。受影响ID有限核对、整文件完成0、unique未知；当前A23与2改1增不关闭旧856语言+feature1、另130SQL及历史增量，W6含旧已审全量/W7增量反查仍待做。整体W3/W4/W5交叉推进，其他入口、性能量化讨论、原暂缓/四gap/缺文件政策保持。无UI变更，不借历史构建或浏览器结果当本次运行。所有正式角色FINAL后实际完成PR前范围/漂移/阶段复核，再交付；不自动merge/deploy/恢复，不查询触发CI。
