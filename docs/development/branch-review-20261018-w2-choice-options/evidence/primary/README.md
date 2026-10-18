# 主侧实际验证

这里是实现者的实际结果，不是独立 QA。命令、返回码、代码字节指纹、未公开原始日志的摘要与实际夹具来源见 [verification.json](verification.json)；Node 逐项见 [node-cases.json](node-cases.json)，浏览器逐场景见 [browser-results.json](browser-results.json)，Java 逐 suite/case 见 [java-cases.json](java-cases.json)。原始浏览器 JSON、Java 安全摘要及 PNG 均按原字节归档，未复制原始含认证测试日志或 XML。

- 当前：126 Node 通过、无跳过；13 Chromium 场景通过，每场景独立断言 pageerrors 与 consoleErrors 均空；tsc/Vite 构建和设计器静态检查通过。
- 原 b191 基线：新增10项中的8项真实失败，旧文档读取和无关编辑两项保护正例通过；实际1440px Inspector 编辑后的 canonical 选项缺失也复现，390px在首个断言失败后未执行。
- Java：189总项，186实际通过、3个既有条件夹具跳过。新增真实设计/值夹具进入 START 冻结、SAVE、非法值 SUBMIT 回滚、合法值 SUBMIT、全量解析快照树不变的场景实际通过。H2 PostgreSQL兼容模式，不是原生PG或认证浏览器HTTP贯通。
- 新建字段及主动类型变更显式保存原界面两项预置；读取旧模板不补齐选项。多选浏览器验证只覆盖实际选项配置、多个默认选择/取消及保存，不扩展新行工厂现有类型支持。

初次新增重复主字段夹具有误使用普通picker，导致两条fixture错误，已改为合法导入文档重复位置；这些初始错误不计产品红证。主字段picker隐藏已用字段，实际浏览器使用合法的重复子列位置。新Java测试最初比较JSON原文字节时仅数字词法格式变化；完整解析树一致，现断言整个解析树，没有删掉字段或放松允许值。实际重复位置出现React key碰撞，最小改为valueKey加node身份，原数据身份不变。

旧静态检查把默认按钮固定为保存raw optionLabel。本批保留原多选数组支持断言，并强化单选/多选实际value解析、active标记、默认按钮传值检查；没有删除其他门槛。

主会实际查看1440px的单选Inspector/正式纸面，以及390px的纸面/多选Inspector截图，配置、默认标记与同值两位置显示符合本批。窄屏原工具条溢出、固定纸面横滚及hover操作仍是既有边界；本批仅确认滚动后目标控件可达，不代表完整移动端、触摸或全站视觉验收。

`npm run lint` 仍因仓库缺ESLint配置退出2。官方premium技能当前不可用，主侧未执行本轮扫描；历史84项不作为本轮结果。当前工作区没有旧vendor目录，设计器静态检查实际通过，不沿用上一批vendor阻断。是否满足本批独立验收，以后续全新实例的原始qualityResult为准。
