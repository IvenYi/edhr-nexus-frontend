# 导入链审查发现

固定base `189cb2c100dd7bc81048981c99d0350daf93ec4d`。PR38已人工merge，目标整树同42c8467a，无额外契约/知识增量。以下是实际源码和浏览器证据；两项修复已在干净55461b8d由全新独立QA正式验收，14/14必需检查passed/FINAL，按acceptance resolved，未将其他候选同时关闭。

## W2-IMPORT-DRAFT-CONTEXT-001 · high

`TemplateDesignerReactShell.handleImportFileChange`在开始时把原page传给解析器，await完成后调用`replaceCurrentPageFromImport`。store实际替换的是完成时的currentPage，且保留这个新页ID/name；所以导入结果携带原pageId并不能阻止跨页、跨模板版本或关闭重开后的覆盖。原文、节点及用户期间编辑可能被替换并进入新document历史。多个文件读取反序返回也会让旧文件覆盖新选择。

修复由Shell持有请求代次：新文件、加载上下文、真实关闭及卸载使旧请求失效；await返回同时校对发起时不可变document和page对象。过期结果与错误不写文档、不写历史、不跳tab、不弹旧错误；当前文档期间改变则提示重新选文件。正常合法导入仍用原store一次替换命令，保留其他页、字段模型、workflow、原序列化及undo/redo，不自动保存。关闭确认中“继续编辑”未真正关闭，原导入仍有效，须保留正向回归。

## W2-IMPORT-WORD-XML-001 · medium

`importWord.parseXml`未识别DOMParser的解析失败文档。损坏的document.xml可产生空blocks并被当作空白Word成功导入；损坏rels也可能静默丢掉对应内容。浏览器解析器并不总是throw。修复仅检测真正parsererror元素及已知错误命名空间后报错，不按文本查关键字，不禁止合法空白XML或正文中的parsererror字面文本，不新增布局/字段规则。

首轮仅检查Mozilla错误命名空间，真实Chromium两项仍失败；独立原始DOM probe看到Chromium将错误元素放在XHTML命名空间，已补支持两者。首轮13/15原件保留，不能改写为一次全过。当前只有Chromium运行证据，Mozilla命名空间分支的源码支持不冒称Firefox运行通过。

## 有限覆盖与未关闭范围

真实Shell、CanvasTab、store及原Excel/Word解析器；测试只控制File.arrayBuffer返回顺序和宿主props/open，透明finally标记等待实际解析完成，不mock结果。完整比较document/undo/redo/dirty/tab及自动保存次数。旧12项8红4正是早期组；完整15项旧10红5正是后来加入损坏XML/合法空白后的组，不相加。初始DOCX夹具错把静态段落当Word blocks的断言错误单列，不算产品红。

有限读了Shell保存、templateImport分流与normalize、Word ZIP/XML/段落组装、Excel边界和全工作簿load、importGrid已有clamp、store替换及history、document解析与meta、宿主Dialog和缩略图切页。不是全文件审完，也不证明.xls/.xlsm/.doc旧格式、所有版式/图片、后端旧Word服务、完整保存并发或历史payload已验收。

另记`candidate.designer-save-catalog-context`：handleSave等待用途目录后再次读当前document，但onSave仍来自旧调用闭包；跨版本props变化时可能错配目标。当前只有源码线索，需用受控catalog真实宿主切换验证，不由现有“保存请求发出后的脏值”测试关闭。作为下一优先项，未混进本次导入修复。

## 性能与大模块方案

`PERF-DESIGNER-OFFICE-EXPANSION-001`，source-confirmed/pending-discussion：模板来自办公文件、图片和多工作表会增大压缩文件S、解压总字节U、条目E/工作簿单元格N。Word的`readZipEntries`同时解压所有非目录条目并保留全部Uint8Array，之后还生成XML字符串、DOM和图片编码；无关条目也有成本。ExcelJS/XLSX先完整解析工作簿，再只选择首张表，所以下游小网格不证明输入内存有界。源码不等于已经测得OOM、掉帧或生产容量。

反证必须保留：importGrid已有300行/75列clamp，转换矩形最多22500格，不能声称其循环无界；它不限制Office库预先读入的全部内容。该截断是既有工程行为，本批不把它提升为客户确认的业务上限，也不随意修改。当前没有SQL链，不把前端循环称为N+1 SQL；旧.doc会调用后端服务，服务端容量另需审查。

先用合法多表、图片和无关ZIP条目比较S/U/E/N及各阶段耗时、堆/长任务和并发文件数，再讨论按需解压、worker、结构错误预检或显式输入限制。缩短ZIP读取会影响图片引用/关系、取消语义及版式，不能先改再补业务依据。此风险未修复、未容量认证，用户对性能先讨论的要求保持。

具体提取方案：Shell继续持有编辑会话和消息；若其他入口复用异步导入，可抽`useTemplateImportOperation`，输入获取当前document/page、原parser、原replace命令和showMessage，输出文件选择处理及invalidate；不得建立第二套保存/历史或复制整个Shell。Word可按ZIP条目读取/结构XML解析/版式转换三层边界拆开，分别传明条目Map、XML Document和纯布局输入输出，保留现有page装配。先有真实必要与保护测试再实施，不为行数做本批大重构。

原非拖动入口、多选/Word交互待定、其他性能候选、TaskDetail/生产弹窗设计/记录控制及DHR high/A12、四知识gap继续保留。整体W0–W7未完成；不合并、部署或恢复历史数据。
