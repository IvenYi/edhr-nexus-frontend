# eDHR 结构化业务知识基线

当前知识模型版本：`knowledgeModelVersion: 0.3.0`。

本目录是 eDHR 业务概念、关系、规则、决策、证据和未决问题的机器可读权威来源。人员阅读架构文档、业务运行代码和界面都可以提供证据，但不能替代这里的结构化知识基线。

用户不手工维护本目录。主智能体从已确认的正常业务讨论中自动生成 `decisionPackage`，业务知识本体建模智能体依据角色契约更新知识资产；只有真正存在业务歧义时才请求用户确认。

## 目录结构

- `glossary.yaml`：稳定术语、定义、别名和知识状态。
- `ontology.yaml`：概念和概念间关系。
- `rules/*.yaml`：按业务域维护的结构化规则。
- `decisions/*.yaml`：已确认决策、背景、替代关系和验收场景。
- `evidence/*.yaml`：代码、数据库、测试和文档证据索引。
- `open-questions.yaml`：尚需用户判断的真实业务问题。

## 状态与投影

知识状态只能是：

- `planned`：已识别但尚未完成业务定义。
- `specified`：业务定义已确认但尚未实现。
- `implemented`：已有实现，尚未完成发布级验证。
- `verified`：实现、测试和执行契约证据完整且已验证。
- `deprecated`：已废弃，仅为历史追溯保留。

内部知识投影可以读取全部状态。只有 `verified` 且具备有效 `executionContractId` 的规则可以进入客户知识投影和运行时投影；`planned`、`specified`、`implemented` 和 `deprecated` 规则均保持 `visibility: internal`，不得作为客户解释或生产执行依据。

## 标识规则

- 术语、概念、关系、规则、证据和验收场景分别使用稳定前缀 `term.`、`concept.`、`relation.`、`rule.`、`evidence.` 和 `scenario.`。
- 决策使用 `DEC-NNNN`；业务变化通过新决策的 `supersedes` 显式关联旧决策。
- 标识一经引用不得复用或改变语义；历史决策和证据不得因新实现而删除。
- 所有 `termId`、关系端点和 `evidenceIds` 必须解析到当前知识基线中的真实记录。

## 维护流程

1. 主智能体从已确认讨论生成 `decisionPackage`，区分 `confirmed`、`inferred` 和 `unresolved`。
2. 本体建模智能体读取当前基线、相关实现和历史决策，只将 `confirmed` 写入权威资产。
3. `unresolved` 非空时停止正式建模并返回 `blocked-by-question`；冲突通过新决策和 `supersedes` 解决，不静默覆盖。
4. 状态推进必须补齐相应实现、测试和执行契约证据；缺少任一项不得标记 `verified`。
5. 修改后执行 YAML、标识、引用、证据路径和投影边界校验，再进入独立质量验证。

## 验证命令

在仓库根目录执行 YAML 解析：

```bash
ruby -e 'require "yaml"; Dir["docs/knowledge/**/*.yaml"].sort.each { |path| YAML.safe_load(File.read(path), permitted_classes: [], permitted_symbols: [], aliases: false) }; puts "YAML parse: passed"'
```

执行标识唯一性、引用完整性、证据路径和规则投影校验：

```bash
ruby - docs/knowledge <<'RUBY'
require "yaml"
root = Dir.pwd
docs = Dir[File.join(ARGV.fetch(0), "**/*.yaml")].to_h do |path|
  [path, YAML.safe_load(File.read(path), permitted_classes: [], permitted_symbols: [], aliases: false)]
end
records = Hash.new { |hash, key| hash[key] = [] }
docs.each_value do |doc|
  %w[terms concepts relations rules decisions evidence].each do |key|
    records[key].concat(Array(doc[key]))
  end
end
records.each do |kind, entries|
  ids = entries.map { |entry| entry.fetch("id") }
  raise "duplicate #{kind} ID" unless ids.uniq.length == ids.length
end
terms = records["terms"].to_h { |entry| [entry.fetch("id"), entry] }
concepts = records["concepts"].to_h { |entry| [entry.fetch("id"), entry] }
evidence = records["evidence"].to_h { |entry| [entry.fetch("id"), entry] }
records["concepts"].each { |entry| raise "unknown termId" unless terms.key?(entry.fetch("termId")) }
records["relations"].each do |entry|
  raise "unknown relation source" unless concepts.key?(entry.fetch("source"))
  raise "unknown relation target" unless concepts.key?(entry.fetch("target"))
end
(records["concepts"] + records["relations"] + records["rules"] + records["decisions"]).each do |entry|
  Array(entry["evidenceIds"]).each { |id| raise "unknown evidence #{id}" unless evidence.key?(id) }
end
evidence.each_value { |entry| raise "missing evidence path #{entry.fetch("path")}" unless File.file?(File.join(root, entry.fetch("path"))) }
records["rules"].each do |entry|
  raise "non-verified rule is not internal: #{entry.fetch("id")}" if entry.fetch("status") != "verified" && entry.fetch("visibility") != "internal"
  raise "verified rule lacks execution contract: #{entry.fetch("id")}" if entry.fetch("status") == "verified" && !entry.key?("executionContractId")
end
puts "Knowledge integrity: passed"
RUBY
```
