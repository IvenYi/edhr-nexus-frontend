# W2 Excel 图片尺寸适配本体核对

正式结果：not-applicable / FINAL。受测候选 `38aae69e345ca1505873bb47c7456e02ec4783ff`，目标 `8a415040babc1cc91ca9f5683bf0db46829eea76`。实际读取契约采用目标基线；最终逐字节核对契约、知识与候选一致。知识保持0.3.25/schema1.2.0，P0 in-progress，无成熟度或发布投影变化。

本轮是格式适配缺陷修复：合法oneCellAnchor只有tl和ext，ExcelJS已将ext从EMU转换为px。旧导入只计算br与tl差值，使180×72误成24×24。补读ext不是新增图片尺寸业务政策；既有双锚点、最小24、媒体身份和存储路径保持。原图probe由主侧实际执行，本体仅读取原件和依赖源码核对；没有声称本体重新运行浏览器、Node、Java、数据库或CI，也没有声称手动视觉检查。

DEC-0077-12使用时冻结/不回写历史，22同一配置保存撤销归属，30草稿免业务完整性但保留格式/权限/证据安全均保留。原确认中的DEC-0075编号依2026-10-15集成映射到现DEC-0077，历史原话不改写。当前代码仅更新Excel适配层，不修改服务API/执行/实例/DHR、签署、权限或审计，也不创建新数据迁移。

有限8记录=6个既有ID和2段选定说明；5consistent、1保留evidence-gap、2保留needs-decision。原通用质量/异常/源签署有效性变化high、A12历史视图和非MVP完整多租户未决保留，不依赖本图片切片，不需要为本轮重问用户。没有新增历史unique覆盖，不声称全库语义通过。353文件、2849唯一schema资产仅机械盘点，清单全部pending，和有限语义记录分开。

已核对主侧正式证据：Node101、浏览器80次执行，以及Java各组`[{"class": "TemplateModelingControllerTest", "tests": 41, "failures": 0, "errors": 0, "skipped": 0}, {"class": "BusinessKnowledgeModelTest", "tests": 89, "failures": 0, "errors": 0, "skipped": 0}]`。知识XML实际89个testcase及源时间/摘要和前后输入已核验。来源指纹数48、知识/知识测试输入359与候选/当前相同。测试读取是证据核对，不替代未参与修复的独立QA。

300行/75列clamp与24像素最小值只作为既有工程行为保留，不写成用户业务上限；物料/作业数据导入中的MAX_IMPORT_ROWS属于另一个入口，不机械外推。PERF-DESIGNER-OFFICE-EXPANSION-001沿原条目，Word重复表解析及全Office载入容量仍须量化讨论，不由局部适配修复默认授权优化或证明生产SLA。完整W2/W3–W7、全知识语义、A23已审补查及原用户暂停保持。

没有知识文件更新，changedArtifacts为空；当前切片无conflicts/questions，不新增试点、运行知识引擎或P1–P3阶段完成结论。原件清单、源快照、有限逐条记录和正式结果由manifest及SHA256SUMS封存。
