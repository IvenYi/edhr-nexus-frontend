# W2首批：表单设计器保存确认一致性

已重新获取edhr-dev并从PR9合并提交9542cb4cc2071df2c00129cc5dbb4572a245cfa1建立audit/edhr-dev-w2-form-integrity-20261016。合并树与此前批准交付98465347相同，项目/角色/交接契约及知识基线未变。知识0.3.25。固定清单1606对UTF-8路径/blob全部pending/inventory-only；方法级阅读另记，不把盘点计为审查完成率。

## 确定缺陷及最小修复

W2-F001-SAVE-ACK为high：用户点击保存发出文档A，等待期间继续编辑成B，成功回调却把当前B标为已保存。真实Shell、Canvas和Chromium中，保存回调payload仅包含A；之后通过真实单元格键盘操作输入B，再完成A的回调、点击关闭，实际直接退出（__closed=1，预期0），没有未保存确认。最初5项store回归4项红。当前最终浏览器脚本只读加载旧9542源也复现同一断言，不是源码正则推断。

根因是Shell捕获并序列化currentDocument、await持久化后调用无参数markSaved，后者取回调时store最新document。修复只有两个生产文件：markSaved接受实际成功请求的文档，并忽略其他模板/版本的延迟确认；Shell手动保存及字段自动保存的共用入口明确传递捕获文档。当前B与成功A的snapshot不同就仍dirty，关闭沿用原确认；再保存B成功才clean。统一undo/redo继续比较完整document，不清空历史或重建来源映射。

现有DEC-0077-22的同配置保存/撤销及-12的使用时冻结足够支持此纠错。只读本体结果not-applicable，无新业务疑义、知识定义、版本、发布步骤、业务校验、后端生产逻辑、API/迁移或历史数据改写。A12变更/作废及依赖项按用户决定暂缓，旧DHR high继续open。

## 实际验证与限制

- 主侧79项前端Node行为/SSR用例通过，含新增5项保存状态、跨模板/版本延迟确认、序列化与统一撤销保护；不是79个浏览器场景。
- 主侧5个真实Chromium Shell/Canvas场景通过：请求期间继续编辑与关闭确认、无后续编辑正常关闭、失败保留与重试、撤销重做、390px确认及键盘可达。保存回调与目录API为隔离fixture，不写真实后端/数据库。桌面及窄屏最终截图已亲看；窄屏结论只覆盖确认框及操作可达，不代表整个大画布移动端或全站WCAG验收。
- 主侧34项后端既有聚焦测试通过，0失败/错误/跳过；直接引擎/解释器、提取函数、Mockito替身与H2快照用例，不是完整HTTP或真实PostgreSQL完成事务验证。实际源码链见[source-map.md](source-map.md)。
- 完整npm run build（tsc与Vite）通过。既有verify-template-designer-react混合静态/函数检查在当前工作区因未跟踪vendor/online-form-designer缓存目录存在失败；未改原脚本或删除用户缓存。将343份前端源码/测试（跟踪字节加本批新增测试）导出、逐文件校验相同、只链接node_modules后，原检查通过；此隔离源码结果与原工作区失败分别保留。
- npm run lint因项目缺ESLint配置在检查代码前退出2，保留blocked。官方premium严格扫描修前/修后均26项（13unresolved、13violations）、新增0、移除0，继续归W5/W6；不称全局lint或UI合规passed。UI保留现有MUI、AppDialog、SnackbarProvider、DESIGN第10节及list-page-guidelines维护边界，没有改设计系统。

浏览器隔离入口初期CJS图标加载、单元格选择及通知遮挡的测试装配失败仅为本机诊断，不计产品复现或最终通过；最终使用已安装MUI图标真实ESM分发、真实F2编辑与通知关闭。没有mock被修复组件、使用force点击、降低断言或改业务代码消除装配问题。

新实例独立质量待正式结果。本批只接受W2-F001及列明相邻回归，完整W2、W1其他gap、W3—W7、全分支与生产发布均未完成。大模块具体提取方案见历史辅助资料，保留唯一文档协议与事务/历史所有者，本批没有执行大重构。
