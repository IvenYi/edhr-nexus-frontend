# 独立质量复验 FINAL — passed

全新实例file_consistency_final_qa2_20261031，L2，未参与任何修复。实际base=0bd0848bbded6d6954d62a4f924e0b2eec6623ad，clean受测及契约读取head=2bdea59bc591fcec6ba9a4c8cbc4374cc65da1ab，知识0.3.25。12/12必需检查全部通过，未修改产品/测试/夹具/知识/仓库台账，不查询CI、合并、部署或恢复数据。

当前37/37实际执行：Copy6、HTTP11、旧资源9、原控制器9、DhrFormFiles2；知识89/89另实际运行。完全相同最终Copy6与HTTP11在真实最新目标0bd得7个断言失败/10正向，在预补正合并e954得1个保留句柄断言失败/16正向，均0error/skip，测试sha完全相同。e954预占路径在Files.copy REPLACE_EXISTING中被unlink/recreate，原句柄EOF；当前对原预占文件newOutputStream(WRITE)+transferTo，同句柄读到最终3字节，闭环首轮独立failed同一发现。普通路径字节正确不足以证明保留预占，本次两者均核实。

实际部分复制、第二流open/close失败清理自有路径；碰撞不覆盖旧原件、不进入旧路径清理；cleanup失败保留原IOException及DirectoryNotEmpty suppressed。真实JWT/filter/MVC的两个主体保存正确上传者ID，不接受提交的spoofed uploadedBy，原非HTTP system fallback保留。格式、150MiB/MD5、公开四用途实际引用、原生产/签名删除保护不变，无新ACL/迁移/历史回填。DHR受控附件50MiB/SHA256为不同专属链，不能混同。

仓储mock，真实磁盘字节/故障流/HTTP响应参与，不声称原生数据库、DBsave/commit或delete跨介质原子性、全部文件对象ACL、PDF浏览器或所有并发认证。三ACL未答仍pending，个人证件与生产冻结签名展示图区分，不选择默认；实际DHR任务附件是dhr_attachment专属资格/冻结成员链，不误报通用FileObject已绕过该表。

独立逐字节核原18、firstfailed45、整合41原件；初始3源码对Git ec485，当前3及本体19来源对当前候选，初始包字节保留。330当前知识逐文件匹配最新目标，44变动文件和183ID候选全pending；666路径增量清单与实际Git差异完全一致且全pending。10旧有限ID重放、七新DEC上下文筛查不作完整语义通过。新四盘点5758路径/134迁移、464HTTP/216route按实际base重建字节完全相同，旧5173/130四清单与Git初始版本一致。六有限源码/A23六方法2改1增、旧856语言+feature1/130SQL与新4迁移仍待W6含旧已审/W7增量，不给全仓完成率或新增unique。

记录控制变更/作废与DHR/工作流新实现已存在，转增量待审，不能继续写尚未实现；旧两high、完整A12/四gap/TaskDetail友方和原其他归属不自动关闭。无本批UI产品变动，未跑浏览器/完整前端构建/静态UI；旧工具结果不能覆盖新增目标。9手工路径空白检查通过，immutable原件/盘点未重排。

两个自有detached旧工作树按确切路径正常移除，只恢复自有复制测试/移除自有依赖链接，未prune/force他人工作树；未启动数据库容器。当前工作树仍clean同head，目标仍0bd。此passed只建议本批局部修复交付，不认证整个文件子系统或新增666路径。
