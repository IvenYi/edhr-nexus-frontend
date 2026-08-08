# eDHR 结构化业务知识基线

当前知识模型版本：`knowledgeModelVersion: 0.3.0`。

本目录是 eDHR 业务概念、关系、规则、决策、证据和未决问题的机器可读权威来源。人员阅读架构文档、业务运行代码和界面都可以提供证据，但不能替代这里的结构化知识基线。

用户不手工维护本目录。主智能体从已确认的正常业务讨论中自动生成 `decisionPackage`，业务知识本体建模智能体依据角色契约更新知识资产；只有真正存在业务歧义时才请求用户确认。

## 目录结构

- `schema.yaml`：版本化词汇、枚举、记录结构、条件/结果语法与投影契约。
- `glossary.yaml`：稳定术语、定义、别名、知识状态和可见性。
- `ontology.yaml`：概念和概念间关系。
- `rules/*.yaml`：按业务域维护的结构化规则。
- `decisions/*.yaml`：已确认决策、背景、替代关系、验收场景和实现差异。
- `evidence/*.yaml`：代码、数据库、测试和文档证据索引。
- `open-questions.yaml`：尚需用户判断的真实业务问题。

## 状态与投影

知识状态只能是：

- `planned`：已识别但尚未完成业务定义。
- `specified`：业务定义已确认但尚未实现。
- `implemented`：已有实现，尚未完成发布级验证。
- `verified`：实现、测试和执行契约证据完整且已验证。
- `deprecated`：已废弃，仅为历史追溯保留。

源知识资产统一标记 `visibility: internal`。内部投影可以读取全部状态；客户和运行时投影只允许 `verified` 规则，且必须同时具备有效 `executionContractId` 和非空 `evidenceIds`。`planned`、`specified` 和 `implemented` 绝不进入客户或运行时投影。

## 基数词汇

关系的 `cardinality` 固定按 `source -> target` 方向解释：

- `one-to-zero-or-one`：一个 source 关联零或一个 target。
- `one-to-zero-or-many`：一个 source 关联零到多个 target。
- `many-to-one`：每个 source 必须关联一个 target；一个 target 可被零到多个 source 关联。

除 `many-to-one` 已明确的反向语义外，其余词汇不对 target 端反向数量作额外断言。缺少已实现运行数据的关系必须用零下界，避免把配置或未来执行的可选性误写成必然存在。

## 标识规则

- 术语、概念、关系、规则、证据和验收场景分别使用稳定前缀 `term.`、`concept.`、`relation.`、`rule.`、`evidence.` 和 `scenario.`。
- 决策使用 `DEC-NNNN`；业务变化通过新决策的 `supersedes` 显式关联旧决策。
- 标识一经引用不得复用或改变语义；嵌套的决策声明、验收场景和实现差异同样必须全局唯一。
- 所有 `termId`、关系端点、`evidenceIds`、枚举值、必填字段和知识模型版本必须通过 `schema.yaml` 校验。

## 维护流程

1. 主智能体从已确认讨论生成 `decisionPackage`，区分 `confirmed`、`inferred` 和 `unresolved`。
2. 本体建模智能体读取当前基线、schema、相关实现和历史决策，只将 `confirmed` 写入权威资产。
3. `unresolved` 非空时停止正式建模并返回 `blocked-by-question`；冲突通过新决策和 `supersedes` 解决，不静默覆盖。
4. 状态推进必须补齐相应实现、测试和执行契约证据；缺少任一项不得标记 `verified`。
5. 修改后执行 bootstrap 校验并进入独立质量验证；任务 3 将以 Maven/JUnit 提供正式、跨平台的知识模型校验入口。

## Bootstrap 校验

以下 Ruby 命令是当前的 bootstrap 校验，不是正式跨平台入口。在仓库根目录执行；它校验 YAML 解析、schema 枚举、必填字段、版本一致性、嵌套决策声明/验收场景 ID、引用、条件操作符、结果类型、所有 visibility/projection 约束和证据路径。

```bash
ruby - docs/knowledge <<'RUBY'
require "yaml"
root = Dir.pwd
base = ARGV.fetch(0)
paths = Dir[File.join(base, "**/*.yaml")].sort
docs = paths.to_h { |path| [path, YAML.safe_load(File.read(path), permitted_classes: [], permitted_symbols: [], aliases: false)] }
schema = docs.fetch(File.join(base, "schema.yaml"))
raise "schema version" unless schema.fetch("knowledgeModelVersion") == "0.3.0" && schema.fetch("schemaVersion") == "1.0.0"
docs.each { |path, doc| raise "knowledge version: #{path}" unless doc.fetch("knowledgeModelVersion") == schema.fetch("knowledgeModelVersion") }
records = {
  "term" => Array(docs.fetch(File.join(base, "glossary.yaml"))["terms"]),
  "concept" => Array(docs.fetch(File.join(base, "ontology.yaml"))["concepts"]),
  "relation" => Array(docs.fetch(File.join(base, "ontology.yaml"))["relations"]),
  "rule" => Array(docs.fetch(File.join(base, "rules/product-process.yaml"))["rules"]),
  "decision" => Array(docs.fetch(File.join(base, "decisions/DEC-0001-product-process-modeling.yaml"))["decisions"]),
  "evidence" => Array(docs.fetch(File.join(base, "evidence/product-process.yaml"))["evidence"]),
  "openQuestion" => Array(docs.fetch(File.join(base, "open-questions.yaml"))["questions"])
}
records["decisionStatement"] = records["decision"].flat_map { |record| Array(record["decisionStatements"]) }
records["acceptanceScenario"] = records["decision"].flat_map { |record| Array(record["acceptanceScenarios"]) }
records["implementationDiscrepancy"] = records["decision"].flat_map { |record| Array(record["implementationDiscrepancies"]) }
%w[term concept relation rule decision evidence decisionStatement implementationDiscrepancy].each do |type|
  Array(records[type]).each { |record| raise "#{type} source visibility" unless record.fetch("visibility") == "internal" }
end
all_ids = records.values.flatten.map { |record| record["id"] }.compact
raise "duplicate ID" unless all_ids.uniq.length == all_ids.length
schema.fetch("recordTypes").each do |type, definition|
  Array(records[type]).each do |record|
    missing = definition.fetch("requiredFields").reject { |field| record.key?(field) }
    raise "#{type} missing #{missing}" unless missing.empty?
    definition.fetch("fieldTypes").each do |field, kind|
      next unless record.key?(field)
      if kind.start_with?("enum:")
        enum_name = kind.split(":", 2).last
        allowed = schema.fetch("enums").fetch(enum_name)
        allowed = allowed.map { |item| item.is_a?(Hash) ? item.fetch("id") : item }
        raise "#{type}.#{field} enum" unless allowed.include?(record[field])
      elsif kind == "string" && !record[field].is_a?(String)
        raise "#{type}.#{field} type"
      elsif kind == "integer" && !record[field].is_a?(Integer)
        raise "#{type}.#{field} type"
      elsif kind == "array<string>" && (!record[field].is_a?(Array) || !record[field].all? { |item| item.is_a?(String) })
        raise "#{type}.#{field} type"
      elsif kind.start_with?("array<") && !record[field].is_a?(Array)
        raise "#{type}.#{field} type"
      end
    end
  end
end
terms = records["term"].to_h { |record| [record["id"], record] }
concepts = records["concept"].to_h { |record| [record["id"], record] }
evidence = records["evidence"].to_h { |record| [record["id"], record] }
records["concept"].each { |record| raise "unknown term" unless terms.key?(record.fetch("termId")) }
records["relation"].each { |record| raise "unknown concept" unless concepts.key?(record.fetch("source")) && concepts.key?(record.fetch("target")) }
(records["concept"] + records["relation"] + records["rule"] + records["decision"] + records["acceptanceScenario"] + records["implementationDiscrepancy"]).each do |record|
  Array(record["evidenceIds"]).each { |id| raise "unknown evidence #{id}" unless evidence.key?(id) }
end
evidence.each_value { |record| raise "missing evidence path #{record["path"]}" unless File.file?(File.join(root, record.fetch("path"))) }
validate_condition = lambda do |expression|
  if expression.key?("all") || expression.key?("any")
    key = expression.key?("all") ? "all" : "any"
    raise "condition group" unless expression.keys == [key] && expression[key].is_a?(Array)
    expression[key].each { |child| validate_condition.call(child) }
  elsif expression.key?("not")
    raise "condition not" unless expression.keys == ["not"] && expression["not"].is_a?(Hash)
    validate_condition.call(expression["not"])
  else
    raise "condition fields" unless expression.keys.sort == %w[fact operator value]
    raise "condition operator" unless schema.fetch("enums").fetch("ruleOperators").include?(expression.fetch("operator"))
  end
end
records["rule"].each do |record|
  validate_condition.call(record.fetch("condition"))
  raise "result type" unless schema.fetch("enums").fetch("ruleResultTypes").include?(record.fetch("result").fetch("type"))
  status = record.fetch("status")
  visibility = record.fetch("visibility")
  raise "non-verified projection" if status != "verified" && visibility != "internal"
  if ["customer", "runtime"].include?(visibility)
    raise "projected status" unless status == "verified"
    raise "projected contract" unless record["executionContractId"].is_a?(String) && !record["executionContractId"].empty?
    raise "projected evidence" if Array(record["evidenceIds"]).empty?
  end
end
puts "Bootstrap knowledge validation: passed"
RUBY
```

任务 3 完成后，`BusinessKnowledgeModelTest` 将通过 Maven/JUnit 成为正式跨平台入口；在此之前，不应把 bootstrap 命令的通过误报为发布级验证。
