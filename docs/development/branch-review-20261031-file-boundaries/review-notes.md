# 后续风险、规模和具体拆分边界

当前检查用实际源码、真实磁盘字节和受控故障流。流泄漏是每次上传打开两个流不关闭，持续请求会积累系统资源；此次正确释放不是通过改业务标准做性能优化。摘要仍两次读文件，不擅自改为单次摘要复制。上传最大150MiB来自当前工程设置；DHR受控附件50MiB/SHA256另有已确认规则，不能混为一种能力。

后续候选（均未关闭，也不以本批通过证明其安全）：

- CAND-W3-FILE-OBJECT-ACCESS-001：通用私有读和list/delete仅由SecurityConfig要求登录，FileController没有基于实际业务关联的对象授权；list可返回FileObject含storedPath。当前HTTP只认证登录/匿名边界，合成未绑定文件无权限token可读是现状观察，不据此确认合法长期政策。下一批优先用真实文档/生产/签名引用链逐项核对已有读取授权，禁止仅凭可伪造targetType/targetId推断权限；未绑定上传和跨用途共享需要单独定边界。
- CAND-W5-FILE-CROSS-STORAGE-001：复制失败可能留下部分文件；DB保存失败留下孤儿；delete先删物理文件再删DB且吞IOException，存在两介质不一致。当前只保证流释放、摘要失败不继续注册，不保证补偿或完整原子性。下一批故障注入、真实数据库事务和引用核对后再定义最小补偿，不自动删除历史文件。
- CAND-W4-FILE-UPLOADER-001：getCurrentOperatorId仍返回system，需对照实际AuditContext与认证主体及显示用法，确认准确上传身份的最小修复；不是本批已修。
- CAND-W5-FILE-RENDER-CAPACITY-001：page-preview每次重新加载PDF并渲染110DPI图片，增长量是页幅像素、文档大小、页数和并发数，压缩文件小也可能像素很大；前端blob整份下载，DhrFormFiles.resolve将原件readAllBytes并对签名图片Base64，完整输出还保留结果集合。先用隔离合法样本量化堆/峰值/耗时与重复请求，再讨论上限或缓存/流化；本轮无SLA或压测结论。
- CAND-W5-FILE-RELATED-UPLOAD-001：AuthController独立签名材料上传也有computeMd5/getInputStream路径，需沿身份认证材料生命周期独立核对，不以此处改动假称全项目流已释放。

N+1/内存分页/循环SQL检查：通用list使用JpaSpecificationExecutor+PageRequest在DB分页，未发现该方法内存切片；public-preview单文件元数据加实际引用查询为资格校验，不是按页N+1；upload两次流扫描是I/O而非SQL。DhrFormFiles.validate按type:id在上下文去重，resolve普通附件复用map，但signatureImageFileId分支可能重复读取；属于需量化的上下文复用候选。当前未统计真实DB查询次数，不以mock断言冒充SQL/执行计划证据。

结构建议有明确边界而非整控制器搬家：若后续跨介质整改需要复用，可抽FileUploadStorage.store(MultipartFile, generatedId)返回StoredUpload(path,size,digest)，拥有流、临时文件及失败清理；FileRegistrationService在实际事务完成点协调DB注册/补偿，Controller只做HTTP输入输出。不能简单给现控制器加@Transactional就宣称磁盘可回滚。FileReadAccess.resolve(actor,fileId,purpose)应查询真实业务关联并返回已授权文件，跨模块权限用业务服务端口，不依赖调用者提交用途。保护测试应含成功原件/摘要/关闭、read/close/copy/DB失败、被引用删除保护、四公开引用、真实无权对象与冻结历史；按单入口委托推进，可逐入口撤回，不新增通用框架或跨请求缓存。当前没有足够复用收益，局部修复保持原所有者。

本批无UI源码变化，未执行浏览器、前端构建或静态UI复验；上批strict19/lint缺配置/process verifier旧SQL路径非绿保持。当前只有文本文件HTTP响应字节，不冒称PDF浏览器渲染/全部格式兼容。主侧HTTP初版不支持MockitoBean的编译错误原件保留，改为现版本MockBean不改变断言。正式最终独立须按当前最终测试旧红新绿复验。
