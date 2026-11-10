# 实际验证和证据边界

主侧：专用真实组件浏览器26/26，既有相邻 workflow 浏览器58/58；TypeScript+Vite build、list-style、no-external-font通过。浏览器均使用维护中的 React 页面/API client、实际 Chromium及受控延迟合成API；POST被拦截，仅验证 payload/次数，未访问主8081、真实数据库或真实签署。没有因为后台未改就把旧127项写成本轮已跑。

专用26/build发生于提交前dirty8be，相同暂存更改随后提交clean7e；58及静态检查在clean7e实际执行，27输入的文件/Git/源码快照指纹一致。独立质量在自己的固定候选工作树另跑；自己的临时依赖软链若被Git列为untracked，要按实际运行元数据披露，不能伪造成当时clean。

| 原件目录/检查 | 实际结果与处理 |
| --- | --- |
| initial.log | 0业务检查：harness缺少bundle.css导致服务器异常；改为导入实际index.css，原错误保留，非产品缺陷。 |
| baseline | 旧源12项核心乱序断言全部失败；无页面JS异常。 |
| focused | 修正后22P/4F：Enter打开确认后默认keyup取消它；只等待不能解决，产品键盘处理补preventDefault。 |
| confirmation | 等待焦点后仍0P/4F，保留“确认已关闭”的证据，不把等待当修复。 |
| confirmation-keyboard | 2P/2F：取消焦点/Escape已正确；确认后末尾断言早于退出动画，增加waitFor可达控件，保留原最终断言。 |
| corrected | 最终26P/0F。未降低预期、删断言或跳过检查。 |
| old-full | 同一最终脚本使用RECORD_CHANGE_ROOT指向自有未修改8be工作树，26F/0P；包含原生确认/IME/空态的旧行为与当前规范不一致，不是26独立缺陷，也不是编译或页面异常。 |
| workflow-ui | clean7e实际58P/0F，含表单/DHR相邻读取、入口资格及合成签署场景。 |

严格静态检查采用云技能原工具精确字节，SHA256 `67fd35597c85a2f37dd3c566f0bd79768cbe059114edcf28074fc5afa3e0ce68`。目标8be与当前均86项（72违规/14未决），按去掉行号迁移的完整身份**多重集合**比较，保留重复数量，新增/消失均0；不是仅用总数相等推断无回归。lint真实exit2，已有缺ESLint配置；均未声称全站通过。

本体353知识文件、359校验输入与先前实际0f5的89项知识运行一致，明确复用原命令/日志/XML，本体未重跑；不代表全量语义已核。最终独立质量的实际运行以正式报告为准，不把本体读取父证据算作独立执行。

主侧原始截图包括390候选弹出/桌面最新表单；检查取消初始焦点、Escape、草稿保留、明确版本和迟到错误，未宣称所有字段、所有浏览器或生产端到端/多租户通过。根DESIGN/list规范/现有主题和共享ConfirmDialog保持；与既有RecordRequestList的active清理模式比较，没有新增设计系统或 token。

自有旧工作树/依赖软链及首轮异常留下的命名临时目录按所有权清理；所有主侧工具进程完成，根node_modules保留。三份原件包分别为主侧、本体、最终独立质量，含失败历史、运行命令、源码快照、图片、正式结果及manifest，逐成员/ZIP SHA另存。全部专业实例FINAL后再实际fetch及做PR前漂移/阶段复核；其后仅L0报告登记。
