# 响应头并发风险：保留专项

**W6-SECURITY-STREAM-HEADER-RACE-001 / medium / open（产品JWT链待复现与方案验收）**。这是初版独立质量QF-DHR-ASYNC-NORMAL-HTTP-001揭示的同一响应头问题，两个角色ID不算两个产品缺陷。测试装配隔离后该QA失败可在其有限验收范围复核关闭；产品风险不能随之关闭。

已证事实：初版真实Tomcat、独立Basic安全链中，正常HTTP单次调用返回200/164字节，但执行器启动2次；日志包含Tomcat MimeHeaders越界、HeaderWriterFilter servlet返回阶段与异步输出commit同时写头和第二次GET。自动客户端重试符合时序，尚无客户端trace证实。实际安装Spring Security6.3.0默认lazy，两个写头入口没有同一请求的互斥；依赖级确定性barrier微例证实lazy两线程/两writer，eager单线程/单writer。不将该微例当真实Tomcat崩坏或生产事故重放。

源码关联：产品common/config/SecurityConfig使用同一个默认HeaderWriterFilter，JWT过滤器不负责写这些头；但实际JWT、异常处理、session、CSRF等与独立Basic装配有差异，当前还没有产品链HTTP复现。当前源码搜索StreamingResponseBody只有DhrArchiveController。正常流可能在原servlet线程退出安全过滤器前就开始写出，具备共享竞争入口；不能据此声称所有用户必现或已量化生产频率。

本批处置：仅对已隔离的Basic测试安全链设置eager，保留真实Tomcat、原执行器、全部五项断言和normal启动一次的标准。产品SecurityConfig、FileController及依赖版本均未改。主侧及新的全新质量必须复核旧源同字节负对照仍是三项文件遗留真失败；原failed报告不覆盖、不删。

不直接全局eager的具体依据：默认cache writer会检查当前status和已有Cache-Control/Pragma/Expires。FileController的page-preview与buildInlinePreviewResponse当前声明private,max-age=300；全局提前写入会残留原本没有的Pragma:no-cache/Expires:0。304和下游reset也有依赖级非等价结果。这个反例要求设计保留现有HTTP行为，不是授权修改缓存业务。

下一切片优先步骤（进入前重新fetch与增量审计）：

1. 真实嵌入式容器装配实际SecurityConfig/JwtAuthenticationFilter、实际Controller和产品异常处理；ZIP生成仍可独立mock。使用明确标注的合成JWT及权限，分别记录正常/无权请求、请求次数、头/字节和自有ZIP清理，区分真实身份签发与测试凭据。
2. 对共享writer时序取得可重复证据；依赖微例、真实HTTP和生产配置三种证据分别记录，不依赖偶然多次重跑变绿或把客户端重试当已证。
3. 选择保留当前语义的最小修复。若使用提前写头，必须限定适用范围或完整保护已有缓存/条件请求/重置行为；不为一个下载接口复制整套认证政策或引入通用锁/生命周期框架。若考虑依赖升级，先证明具体版本已修路径并核兼容，不能凭“更新”当修复。
4. 对DHR正常/拒绝/超时/取消/活动流归属、实际JWT401/403、默认安全头与两个真实预览缓存入口做回归；保留用户资格、冻结/摘要、流前EXPORT顺序、CSP/nosniff及输出。由未参与修复的全新实例最终验收。

本项不阻断已独立声明范围的临时ZIP归属修复，但仍是明确的下一轮审查风险；是否最终交付本批，以新的正式质量结果及全部FINAL后的范围复核为准。不声称整个异步/安全/容量审计完成。
