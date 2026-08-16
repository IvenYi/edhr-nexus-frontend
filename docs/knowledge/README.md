# eDHR 结构化业务知识基线

当前知识模型版本：`knowledgeModelVersion: 0.3.3`。

本目录是 eDHR 业务概念、关系、规则、决策、证据和未决问题的机器可读权威来源。人员阅读架构文档、业务运行代码和界面都可以提供证据，但不能替代这里的结构化知识基线。

用户不手工维护本目录。主智能体从已确认的正常业务讨论中自动生成 `decisionPackage`，业务知识本体建模智能体依据角色契约更新知识资产；只有真正存在业务歧义时才请求用户确认。

## 目录结构

- `schema.yaml`：版本化词汇、枚举、记录结构、条件/结果语法与投影契约。
- `execution-contracts.yaml`：已验证运行规则所引用的执行契约注册表；当前无已验证规则，因此集合为空。
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

`status` 与 `visibility` 是两个独立维度：`status` 表示成熟度，`visibility` 表示记录可进入的发布投影。`visibility` 只能是 `internal`、`customer`、`runtime` 或 `customer-and-runtime`；它不能替代成熟度、执行契约或证据。

内部投影可读取所有状态，但不会豁免 `verified` 的契约要求。规则必须遵守以下不变量：

- `planned`、`specified` 和 `implemented` 必须为 `visibility: internal`。
- `verified` 无论 visibility 为何，均必须有非空 `executionContractId` 和非空 `evidenceIds`。
- `deprecated` 不得使用 `runtime` 或 `customer-and-runtime`。
- customer 投影只接受 `verified` 且 visibility 为 `customer` 或 `customer-and-runtime` 的规则。
- runtime 投影只接受 `verified` 且 visibility 为 `runtime` 或 `customer-and-runtime` 的规则，并再次要求有效执行契约和证据。

`executionContractId` 不是自由文本。任何 `verified` 规则都必须引用 `execution-contracts.yaml` 中真实存在的记录；被引用执行契约必须为 `verified`，visibility 必须为 `runtime` 或 `customer-and-runtime`，并具有非空证据。当前产品制程规则均为非 `verified` 且 `internal`，因此注册表保持为空，不新增或伪造执行契约。

## Schema 驱动结构

`schema.yaml` 的 `collectionTypes` 将各顶层集合名映射到 `recordTypes`，`nestedCollectionTypes` 将决策内嵌集合映射到对应记录类型。校验器必须通过这两张映射发现记录，不得另行硬编码文件与记录类型对应关系；映射目标必须是已定义的 `recordTypes`，未知集合必须被拒绝。

`allowedFieldTypeDescriptors` 是 `fieldTypes` 的封闭语法。只允许 `string`、`integer`、`condition-expression`、`rule-result`、指向现有枚举的 `enum:<enumKey>`、`array<string>`，以及指向现有记录类型的 `array<recordTypeName>`。未知描述符、缺失枚举和缺失记录类型引用均为校验错误。正式 JUnit 校验器会消费这些结构约束，包括 ID 前缀、条件表达式形状、证据路径策略和执行契约引用完整性。

## 基数词汇

关系的 `cardinality` 固定按 `source -> target` 方向解释：

- `one-to-zero-or-one`：一个 source 关联零或一个 target。
- `one-to-zero-or-many`：一个 source 关联零到多个 target。
- `many-to-one`：每个 source 必须关联一个 target；一个 target 可被零到多个 source 关联。

除 `many-to-one` 已明确的反向语义外，其余词汇不对 target 端反向数量作额外断言。缺少已实现运行数据的关系必须用零下界，避免把配置或未来执行的可选性误写成必然存在。

## 标识规则

- 术语、概念、关系、规则、证据、未决问题和执行契约分别使用稳定前缀 `term.`、`concept.`、`relation.`、`rule.`、`evidence.`、`question.` 和 `execution.`。
- 决策和决策声明使用 `DEC-` 前缀，验收场景使用 `scenario.`，实现差异使用 `discrepancy.`；业务变化通过新决策的 `supersedes` 显式关联旧决策。
- 标识一经引用不得复用或改变语义；嵌套的决策声明、验收场景和实现差异同样必须全局唯一。
- 所有 `termId`、关系端点、`evidenceIds`、枚举值、必填字段和知识模型版本必须通过 `schema.yaml` 校验。

## 维护流程

1. 主智能体从已确认讨论生成 `decisionPackage`，区分 `confirmed`、`inferred` 和 `unresolved`。
2. 本体建模智能体读取当前基线、schema、相关实现和历史决策，只将 `confirmed` 写入权威资产。
3. `unresolved` 非空时停止正式建模并返回 `blocked-by-question`；冲突通过新决策和 `supersedes` 解决，不静默覆盖。
4. 状态推进必须补齐相应实现、测试和执行契约证据；缺少任一项不得标记 `verified`。
5. 修改后执行 Maven/JUnit 正式校验并进入独立质量验证；Ruby bootstrap 仅用于最小诊断。

## 正式校验

Maven/JUnit 是跨平台知识模型校验的正式入口，也是质量门禁依据：

```bash
cd gmp-platform/backend && mvn -Dtest=BusinessKnowledgeModelTest test
```

## Bootstrap 诊断

以下 Ruby 命令仅保留为最小 bootstrap/诊断手段，不是正式门禁入口。在仓库根目录执行；正式验证结果以 `BusinessKnowledgeModelTest` 为准。

```bash
ruby - docs/knowledge <<'RUBY'
require "yaml"
require "pathname"

root = File.realpath(Dir.pwd)
base = File.expand_path(ARGV.fetch(0), root)
paths = Dir[File.join(base, "**/*.yaml")].sort
docs = paths.to_h { |path| [path, YAML.safe_load(File.read(path), permitted_classes: [], permitted_symbols: [], aliases: false)] }
schema_path = File.join(base, "schema.yaml")
schema = docs.fetch(schema_path)
raise "schema version" unless schema.fetch("knowledgeModelVersion") == "0.3.3" && schema.fetch("schemaVersion") == "1.0.0"
docs.each { |path, doc| raise "knowledge version: #{path}" unless doc.fetch("knowledgeModelVersion") == schema.fetch("knowledgeModelVersion") }

record_types = schema.fetch("recordTypes")
collection_types = schema.fetch("collectionTypes")
nested_collection_types = schema.fetch("nestedCollectionTypes")
mapped_types = collection_types.values + nested_collection_types.values
raise "collection mapping target" unless mapped_types.all? { |type| record_types.key?(type) }
raise "collection mapping coverage" unless mapped_types.sort == record_types.keys.sort
raise "duplicate collection mapping" unless mapped_types.uniq.length == mapped_types.length

descriptor_policy = schema.fetch("allowedFieldTypeDescriptors")
literal_descriptors = descriptor_policy.fetch("literals")
raise "literal descriptor grammar" unless literal_descriptors.sort == %w[condition-expression integer rule-result string]
raise "unknown descriptor policy" unless descriptor_policy.fetch("unknownDescriptors") == "forbidden"
parameterized = descriptor_policy.fetch("parameterized")
raise "enum descriptor registry" unless parameterized.fetch("enum").fetch("referencedRegistry") == "enums" && parameterized.fetch("enum").fetch("unknownReferences") == "forbidden"
raise "array descriptor registry" unless parameterized.fetch("array").fetch("referencedRegistry") == "recordTypes" && parameterized.fetch("array").fetch("scalarItemTypes") == ["string"] && parameterized.fetch("array").fetch("unknownReferences") == "forbidden"

record_types.each do |type, definition|
  definition.fetch("fieldTypes").each do |field, descriptor|
    valid = literal_descriptors.include?(descriptor)
    if descriptor =~ /\Aenum:([A-Za-z][A-Za-z0-9]*)\z/
      valid = schema.fetch("enums").key?($1)
    elsif descriptor =~ /\Aarray<([A-Za-z][A-Za-z0-9]*)>\z/
      item_type = $1
      valid = item_type == "string" || record_types.key?(item_type)
      if record_types.key?(item_type)
        valid &&= nested_collection_types[field] == item_type
      end
    end
    raise "unknown field descriptor #{type}.#{field}: #{descriptor}" unless valid
  end
end

records = record_types.keys.to_h { |type| [type, []] }
docs.each do |path, document|
  next if path == schema_path
  document.each do |collection, value|
    next if collection == "knowledgeModelVersion"
    type = collection_types[collection]
    raise "unknown top-level collection #{collection}: #{path}" unless type
    raise "collection must be records #{collection}: #{path}" unless value.is_a?(Array) && value.all? { |record| record.is_a?(Hash) }
    records[type].concat(value)
  end
end

queue = collection_types.values.flat_map { |type| records.fetch(type) }
until queue.empty?
  record = queue.shift
  record.each do |field, value|
    next unless value.is_a?(Array) && value.any? { |item| item.is_a?(Hash) }
    raise "unknown nested collection #{field}" unless nested_collection_types.key?(field)
  end
  nested_collection_types.each do |field, type|
    next unless record.key?(field)
    children = record.fetch(field)
    raise "nested collection must be records #{field}" unless children.is_a?(Array) && children.all? { |child| child.is_a?(Hash) }
    records[type].concat(children)
    queue.concat(children)
  end
end

records.each do |type, typed_records|
  definition = record_types.fetch(type)
  typed_records.each do |record|
    missing = definition.fetch("requiredFields").reject { |field| record.key?(field) }
    raise "#{type} missing #{missing}" unless missing.empty?
    definition.fetch("fieldTypes").each do |field, descriptor|
      next unless record.key?(field)
      value = record[field]
      valid = case descriptor
              when "string" then value.is_a?(String)
              when "integer" then value.is_a?(Integer)
              when "condition-expression", "rule-result" then value.is_a?(Hash)
              when /\Aenum:(.+)\z/
                allowed = schema.fetch("enums").fetch($1).map { |item| item.is_a?(Hash) ? item.fetch("id") : item }
                allowed.include?(value)
              when "array<string>" then value.is_a?(Array) && value.all? { |item| item.is_a?(String) }
              when /\Aarray<(.+)>\z/ then value.is_a?(Array) && value.all? { |item| item.is_a?(Hash) }
              else false
              end
      raise "#{type}.#{field} type" unless valid
    end
  end
end

prefixes = schema.fetch("idPrefixes")
raise "ID prefix coverage" unless prefixes.keys.sort == record_types.keys.sort
records.each do |type, typed_records|
  prefix = prefixes.fetch(type)
  typed_records.each { |record| raise "#{type} ID prefix" unless record.fetch("id").start_with?(prefix) }
end
all_ids = records.values.flatten.map { |record| record["id"] }.compact
raise "duplicate ID" unless all_ids.uniq.length == all_ids.length

terms = records["term"].to_h { |record| [record["id"], record] }
concepts = records["concept"].to_h { |record| [record["id"], record] }
evidence = records["evidence"].to_h { |record| [record["id"], record] }
execution_contracts = records["executionContract"].to_h { |record| [record["id"], record] }
contract_policy = schema.fetch("projectionRules").fetch("executionContract")
contract_reference = contract_policy.fetch("referencedBy")
raise "execution contract source type" unless contract_reference.fetch("recordType") == "rule"
raise "execution contract target collection" unless collection_types.fetch(contract_reference.fetch("targetCollection")) == contract_reference.fetch("targetRecordType")
raise "execution contract target type" unless contract_reference.fetch("targetRecordType") == "executionContract"
records["concept"].each { |record| raise "unknown term" unless terms.key?(record.fetch("termId")) }
records["relation"].each { |record| raise "unknown concept" unless concepts.key?(record.fetch("source")) && concepts.key?(record.fetch("target")) }
records.values.flatten.each do |record|
  Array(record["evidenceIds"]).each { |id| raise "unknown evidence #{id}" unless evidence.key?(id) }
end

path_policy = schema.fetch("evidencePathPolicy")
evidence.each_value do |record|
  next unless path_policy.fetch("mustExistForTypes").include?(record.fetch("type"))
  configured_path = record.fetch("path")
  raise "absolute evidence path #{configured_path}" if path_policy.fetch("relativeOnly") && Pathname.new(configured_path).absolute?
  expanded = File.expand_path(configured_path, root)
  if path_policy.fetch("mustRemainWithinRepository")
    raise "evidence path escapes repository #{configured_path}" unless expanded.start_with?(root + File::SEPARATOR)
  end
  raise "missing evidence path #{configured_path}" unless File.file?(expanded)
  if path_policy.fetch("mustRemainWithinRepository")
    real_path = File.realpath(expanded)
    raise "evidence symlink escapes repository #{configured_path}" unless real_path.start_with?(root + File::SEPARATOR)
  end
end

condition_schema = schema.fetch("conditionExpression")
raise "condition additionalFields" unless condition_schema.fetch("additionalFields") == "forbidden"
validate_condition = lambda do |expression|
  raise "condition expression" unless expression.is_a?(Hash)
  group_keys = expression.keys & condition_schema.fetch("groupKeys")
  if group_keys.any?
    raise "condition group shape" unless group_keys.length == 1 && expression.keys == group_keys
    key = group_keys.first
    if key == "not"
      raise "condition not" unless expression[key].is_a?(Hash)
      validate_condition.call(expression[key])
    else
      raise "condition #{key}" unless expression[key].is_a?(Array) && !expression[key].empty?
      expression[key].each { |child| validate_condition.call(child) }
    end
  else
    raise "condition fields" unless expression.keys.sort == condition_schema.fetch("clauseRequiredFields").sort
    raise "condition fact" unless expression.fetch("fact").is_a?(String)
    raise "condition operator" unless schema.fetch("enums").fetch("ruleOperators").include?(expression.fetch("operator"))
    value = expression.fetch("value")
    value_type = case value
                 when String then "string"
                 when Integer then "integer"
                 when TrueClass, FalseClass then "boolean"
                 when NilClass then "null"
                 when Array then "array"
                 end
    raise "condition value" unless condition_schema.fetch("clauseValueTypes").include?(value_type)
  end
end

records["rule"].each do |record|
  validate_condition.call(record.fetch("condition"))
  result = record.fetch("result")
  raise "result fields" unless schema.fetch("ruleResult").fetch("requiredFields").all? { |field| result.key?(field) }
  raise "result type" unless schema.fetch("enums").fetch("ruleResultTypes").include?(result.fetch("type"))
  status = record.fetch("status")
  visibility = record.fetch("visibility")
  policy = schema.fetch("projectionRules")
  internal = policy.fetch("internal")
  non_verified = policy.fetch("maturityInvariants").fetch("nonVerified")
  verified = policy.fetch("maturityInvariants").fetch("verified")
  deprecated = policy.fetch("maturityInvariants").fetch("deprecated")
  raise "internal status" unless internal.fetch("allowedStatuses").include?(status)
  raise "internal visibility" unless internal.fetch("acceptedVisibilities").include?(visibility)
  raise "non-verified visibility" if non_verified.fetch("statuses").include?(status) && visibility != non_verified.fetch("requiredVisibility")
  if verified.fetch("statuses").include?(status)
    verified.fetch("requiredFields").each { |field| raise "verified missing #{field}" unless record.key?(field) }
    verified.fetch("nonEmptyFields").each do |field|
      value = record[field]
      raise "verified empty #{field}" if value.nil? || (value.respond_to?(:empty?) && value.empty?)
    end
  end
  if record.key?("executionContractId")
    contract_id = record.fetch("executionContractId")
    raise "empty execution contract reference" unless contract_id.is_a?(String) && !contract_id.empty?
    raise "unknown execution contract #{contract_id}" unless execution_contracts.key?(contract_id)
  end
  raise "deprecated runtime visibility" if deprecated.fetch("statuses").include?(status) && deprecated.fetch("forbiddenVisibilities").include?(visibility)
  ["customer", "runtime"].each do |projection|
    projection_policy = policy.fetch(projection)
    next unless projection_policy.fetch("acceptedVisibilities").include?(visibility)
    raise "#{projection} status" unless projection_policy.fetch("allowedStatuses").include?(status)
    projection_policy.fetch("requiredFields").each { |field| raise "#{projection} missing #{field}" unless record.key?(field) }
    projection_policy.fetch("nonEmptyFields").each do |field|
      value = record[field]
      raise "#{projection} empty #{field}" if value.nil? || (value.respond_to?(:empty?) && value.empty?)
    end
  end
end

records["executionContract"].each do |record|
  raise "execution contract status" unless record.fetch("status") == contract_policy.fetch("requiredStatus")
  raise "execution contract visibility" unless contract_policy.fetch("acceptedVisibilities").include?(record.fetch("visibility"))
  contract_policy.fetch("nonEmptyFields").each do |field|
    value = record[field]
    raise "execution contract empty #{field}" if value.nil? || (value.respond_to?(:empty?) && value.empty?)
  end
end

puts "Bootstrap knowledge validation: passed"
RUBY
```

负向变异探针必须失败：以下命令在临时副本中把一个规则变为 `verified/internal` 并移除执行契约；若 bootstrap 没有失败，则知识模型校验存在缺口。

```bash
tmp_dir="$(mktemp -d)"
cp -R docs/knowledge "$tmp_dir/knowledge"
ruby - "$tmp_dir/knowledge/rules/product-process.yaml" <<'RUBY'
require "yaml"
path = ARGV.fetch(0)
document = YAML.safe_load(File.read(path), permitted_classes: [], permitted_symbols: [], aliases: false)
rule = document.fetch("rules").first
rule["status"] = "verified"
rule["visibility"] = "internal"
rule.delete("executionContractId")
File.write(path, YAML.dump(document))
RUBY
if awk '/^ruby - docs\/knowledge <<'"'"'RUBY'"'"'$/{found=1; next} found && /^RUBY$/{exit} found {sub(/^  /, ""); print}' docs/knowledge/README.md | ruby - "$tmp_dir/knowledge"; then
  echo "negative mutation unexpectedly passed" >&2; exit 1
else
  echo "negative mutation rejected as expected"
fi
```

Ruby bootstrap 或负向探针通过不能替代 Maven/JUnit 正式校验，也不得作为发布级验证结果。
