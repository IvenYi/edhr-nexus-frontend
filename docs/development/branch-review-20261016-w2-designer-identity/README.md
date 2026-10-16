# W2第四批：设计器插列与来源身份

PR12已由用户人工合并。最新拉取基线8a9cd91f62742e9469c785baee482129eb6ec84e，合并树与批准交付0eb8d241完全相同；项目、角色、知识及架构无额外漂移，知识0.3.25。1843条路径/blob均为pending/inventory-only，未把盘点、历史验收或定向源码阅读等同全量完成。

本批为L2。实际核对导入、字段/子表编辑、文档结构命令、来源映射、保存与完整文档撤销链，方法范围见[source-map.md](source-map.md)，辅助原文见[evidence/inventory-review.md](evidence/inventory-review.md)。当前文件导入为Excel/Word，JSON是持久协议，不把手工坏JSON当合法导入；字段停用或类型不匹配保留原来源ID并经前后端校验，不随意清空绑定。

## 确证问题与最小整改

W2-F002-COLUMN-INSERT-NODE-ALIGNMENT：正常画布单元格/列菜单的左右插列进入insertSheetColumns。旧实现移动cells及mergedCells，却没有移动nodes。已放在第3列的字段在前方插入1列后仍位于3，原标签已到4；子表范围、记录组、anchor及子列派生偏移也遗漏同步。主审5条真实store API行为用例在原基线全部失败，Chromium通过真实右键菜单加键盘确认同样得到实际3、期望4。

修复仅在现有store补水平坐标变换，同步cellRange、compLeft/compWidth、subTableRegion的ranges/anchor/groupRange，并复用既有rebuildSubTableRecordTemplate重建字段偏移。范围前移动、内部扩展、范围后保持；递归节点同步，无单元格锚点的自由组件保持。仍只有原pushDocumentHistory提交一次，model、fieldId、tableId和projection均不变；保存协议及已有生产冻结来源不改。不是大模块重构，后续拆分继续沿既有纯坐标命令/节点工厂方案留W6。

W2-T001-CELL-DISPLAY-HARNESS：更宽94项Node初跑93通过、1失败，定位为旧测试仍导出不存在的MockFillPage；生产组件已名为FormSheetPage。仅修测试入口和无效追加export，原fixture与序号断言均保留；相邻动态行用例重新实际执行通过，没有修改业务逻辑或降低标准。

## 已运行及限制

主侧最终94项Node全部通过，无失败/跳过；7个真实Chromium场景通过（原5个保存/失败/未保存保护，加桌面1440和窄屏390插列、实际DOM对齐、可达性和undo/redo）。浏览器使用实际Shell、Canvas、MUI、Zustand；保存回调及目录API为受控替身，不声称真实后端持久化、完整HTTP/JPA、认证或签署E2E。窄屏验证是收起侧栏后滚动画布访问目标字段，不代表整个设计器移动端体验已完整验收。主审实际查看了桌面及窄屏截图。

npm run build（tsc -b及Vite）通过。npm run lint仍因缺少ESLint配置退出2；verify-template-designer-react仍因已存在的vendor/online-form-designer缓存退出1，未删除缓存或弱化检查。官方premium严格扫描前后均84项（13 unresolved、71 violations），逐项对照新增0、消失0，严格命令仍退出2，不称全局通过。上述全局限制不归本次坐标修复关闭；未改UI markup、token、主题、共享原语、locale或构建配置，新增生产diff无native-dialog/非语义点击等模式。

主侧原始日志仅留/tmp/edhr-w2-designer-evidence；安全命令/结果/文件摘要见[evidence/primary-result.json](evidence/primary-result.json)。本体正式[not-applicable](evidence/ontologyResult.yaml)，没有知识修改或成熟度升级。最终质量必须针对冻结候选由全新未参与修复的实例实际复验，当前待验收，不能用主侧结果代替。

## 保留检查点

子列embedded snapshot在父模型编辑后是否同步，源码已有线索与不同渲染路径反证，尚未实跑；登记W2-C002下一检查点，不能计已修或已验。本批不混入第二类整改。完整W2及全分支仍未完成；A12表单变更/作废和两项旧DHR high继续按用户决定暂缓/open，W3历史H003/4/H009/10保持后续顺序。

不合并或部署、不恢复或补算历史、不查询或触发GitHub Actions。云环境沿用现有依赖、Chromium和此前已保存启动说明；本批没有新增安装/启动要求或配置草稿修改。
