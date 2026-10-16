# F004 独立最终复核

结果：passed，仅限 F004 已存引用显示与 F004-ASYNC-BINDING-LOSS 异步绑定保护及相邻回归。

全新验证实例 /root/audit_f004_independent 未参与任何实现、测试、环境或文档修复。实际候选 58fb346f2d1eb860c09c3f95eed448ef8b813112，来源 d63a73ce017388c5ae89bd1fbc66e872f998f825；重新 fetch 的 edhr-dev 仍为 76b214426a271929bba2708cdda9e4d84d1f0679。契约实际读取候选，知识 0.3.25，工作树始终干净。

独立实际运行：真实Chromium组件12场景全过；后端Mockito控制器/服务21项（14+7）全过、0失败/错误/跳过；完整前端build含TypeScript、现有process静态验证通过。两项旧组件红回归分别在空显示及空绑定0≠1处预期退出1；候选对应回归通过。两张独立桌面/390px截图已亲看。

浏览器选项和HTTP为fixture，onSubmit回调负载，并非真实后端/数据库E2E；后端为Mockito单元，也未声称PG或真实HTTP集成。主侧结果是在d63工作树运行；三处最终源码字节与候选相同、9日志及2原XML哈希真实，但本实例实际运行单独归属。

清单核对：来源1569行真实UTF-8 path/blob与git ls-tree -r -z完全相等，全部pending；目标1524、候选1586，不混分母。四条方法范围不冒充整文件审查。1586候选跟踪文件及2个Maven工具SHA前后完全一致。

ESLint退出2（项目无配置，代码尚未lint），全frontend premium strict修前/修后26项（13unresolved+13violations）、新增0，仍退出2；两者未记为passed，后续W5/W6处理。额外repository-root探索扫描含文档示例共84项，其中26为同一frontend发现、58为未改docs/.superpowers路径；不将它混入frontend26分母。

两项旧DHR high仍open+用户暂缓A12依赖。完整DHR/W1/全分支/P0/全站UI与生产发布未验收。没有改业务政策/候选资格/权限/迁移/知识/历史快照，未写真实业务数据，未提交推送/合并部署或查询Actions。

相对证据路径以本目录为根。原始日志/XML可能含测试认证输出，仅留/tmp；交付可复制安全结果JSON/YAML、SHA清单、纯fixture截图，不复制原始日志/XML。
