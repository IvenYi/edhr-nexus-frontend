# 独立 UI 复验

受测来源固定 `266a1635cc95870cd7907c574eb676db7f560d4f`，目标 `a8285be9b91fb76bcb27ccb16a5258bda1fb5077`；前后工作树干净，未修改仓库文件。角色/交接/设计契约实际读取于266a，知识0.3.25/schema1.2.0。

实际重跑36浏览器（20通用、16普通生产表单）全部通过，tsc/Vite构建通过。脚本使用真实两个页面、MUI共享组件、App主题、Router、QueryClient、Snackbar和真实client；合成API严格检查请求路径、生产真实所属操作/表单份及POST字段，旧GET/POST需实际settled/canceled后才断言无污染。没有把合成返回视图当数据库读回。409失败重试、503清空旧候选、输入保留、空结果、连续搜索、取消/关闭、路由切换、忙碌防重及两视口均在实际运行中覆盖。

四张填写态及两张390宽候选弹层已亲视：中文和目标姓名清楚，关闭/取消/确认可达，弹层未超出视口。沿用既有AppDialog/FormDialog及MUI Autocomplete，没有引入独立控件体系或改DESIGN。通用工作流的新目标/原因和成功责任提示与DEC0081一致；普通表单的新租户范围文字明确，DHR不由本UI脚本认证。

本实例重新从官方skill URI实际读取audit_project.py，原字节SHA67fd35597c85a2f37dd3c566f0bd79768cbe059114edcf28074fc5afa3e0ce68；对独立git archive导出的a828及真实候选运行strict，均exit2，各84条finding记录（82种不同字段集合），Counter按所有字段和重复次数完全相同，新增/移除0。npm lint实际exit2，原有ESLint配置缺失；这些只能作为无新增及既有限制披露，不能称全站严格静态检查通过。

发现QF-W3-UI-DOC-COUNT-001（low）：当前README:19/progress:81–82写各82而未说明distinct集合口径。主侧原始JSON数组实际84条，原对比用set计数82。建议L0交付说明明确84条/82种，保留所有主侧原件。这不涉及产品逻辑或测试标准，也不阻断当前代码切片；本实例未修改任何内容，交由主侧处置。

局部结论：未复现新的阻断性UI缺陷。受控API不等于全栈；没有运行真实后端、数据库、权限或DHR，也未认证完整IME/屏幕阅读器/200%缩放/离线会话/主题矩阵。原有window.confirm离页保护及全站strict/lint限制继续保留。不据此签收完整W3或整个分支；整批正式qualityResult由父质量实例汇总。
