# 本批发现关闭范围

## W6-SECURITY-STREAM-HEADER-RACE-001

medium / verified-resolved（initial安全链与导出body交接）。沿用PR71保留的原ID，不把旧QF或官方框架缺陷重复计为多个发现。实际JWT/Tomcat受控旧源maxConcurrent=2、nosniff重复，最新同字节13负控三项真AssertionF之一；新源max1、下载任务仅1次、字节完整。请求局部monitor保持lazy头时机与三预览缓存，没有全局eager/依赖升级/复制安全策略。活动流实际网络中断等仍保留。

## W6-JWT-ASYNC-IDENTITY-001

medium / verified-resolved（有效Bearer的ASYNC重新派发）。旧JWT默认跳过ASYNC，身份未保存到request repo，两个失败路径错误401；前端同会话401返回登录页的源码路径已核，未作浏览器复现。仅让ASYNC按原Bearer重跑原验签/身份/权限与审计上下文，不改session、ERROR、无效/过期边界或权限政策。新拒绝/排队超时正确进入原错误处理器500，匿名/无效401、缺权限403、原JWT过期fixture保持。

## W6-DHR-ASYNC-ERROR-FRAMING-001

medium / verified-resolved（未开始body且未commit的异步错误）。恢复身份后显现错误JSON137沿用ZIP长度162的EOF；旧401原件也保留错误attachment元数据。中间124/125的两个真实EOF错误、长度修正后两个attachment残留失败均保存，不冒称基线原401必有长度EOF。现在同一请求单一归属可CAS到FAILED，Servlet长度-1/JSON类型/精确inline消除ZIP元数据，completion仍能删除文件且晚到body不得启动。BODY/已commit不修改，不承诺HTTP或审计回滚。

最终clean受测703f2ee90417e778cf745fbbcd24f908a345d3bd：主侧和全新独立125/125，独立知识89/89，12/12必需检查passed/FINAL，三medium均由未参与修复实例复核resolved；本体NA、350知识及32输入保持。历史编译/校准/真实失败与最终结果分列，非降低测试或累计通过。

有限历史检索未找到两个新ID已关闭同项，不能认证全历史unique；完整语义/整文件/运行矩阵尚未完成。原W2-W7、931知识/86UI/A12/高风险/容量/性能/A23含已审与暂停队列不关闭。
