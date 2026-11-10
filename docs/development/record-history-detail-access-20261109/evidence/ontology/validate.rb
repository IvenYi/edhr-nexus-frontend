require 'yaml'
require 'json'

root = File.expand_path('../../../../..', __dir__)
Dir.chdir(root)
changed = [
  'docs/knowledge/decisions/DEC-0096-record-control-system-admin-detail-read.yaml',
  'docs/knowledge/decisions/DEC-0087-record-control-v1-closure.yaml',
  'docs/knowledge/rules/record-change.yaml',
  'docs/knowledge/implementation-anchors/core-business.yaml',
  'docs/knowledge/evidence/record-control-v1.yaml',
  'docs/knowledge/evidence/record-history-detail-access-20261109.yaml'
]
schema = YAML.safe_load(File.read('docs/knowledge/schema.yaml'))
documents = Dir['docs/knowledge/**/*.yaml'].to_h { |path| [path, YAML.safe_load(File.read(path))] }
records = []
visit = lambda do |value, path|
  case value
  when Hash
    records << [value, path] if value['id'].is_a?(String)
    value.each_value { |nested| visit.call(nested, path) }
  when Array
    value.each { |nested| visit.call(nested, path) }
  end
end
documents.each { |path, document| visit.call(document, path) }
ids = records.group_by { |record, _path| record['id'] }
changed_ids = changed.flat_map { |path| records.select { |_record, source| source == path }.map { |record, _| record['id'] } }
changed_ids.each { |id| raise "duplicate affected ID #{id}" unless ids[id].size == 1 }
checked = 0
changed.each do |path|
  document = documents.fetch(path)
  raise "version #{path}" unless document['knowledgeModelVersion'] == '0.3.25'
  document.each do |collection, entries|
    type = schema['collectionTypes'][collection]
    next unless type
    entries.each do |entry|
      descriptor = schema['recordTypes'].fetch(type)
      missing = descriptor['requiredFields'] - entry.keys
      raise "missing #{entry['id']}: #{missing}" unless missing.empty?
      %w[status visibility].each do |field|
        enum_key = descriptor.fetch('fieldTypes')[field]&.delete_prefix('enum:')
        next unless enum_key && entry[field]
        raise "enum #{entry['id']} #{field}" unless schema['enums'].fetch(enum_key).include?(entry[field])
      end
      if entry['status'] && entry['status'] != 'verified'
        raise "projection #{entry['id']}" unless entry['visibility'] == 'internal'
      end
      checked += 1
      schema['nestedCollectionTypes'].each do |nested_collection, nested_type|
        Array(entry[nested_collection]).each do |nested|
          nested_descriptor = schema['recordTypes'].fetch(nested_type)
          raise "missing nested fields #{nested['id']}" unless (nested_descriptor['requiredFields'] - nested.keys).empty?
          raise "nested maturity #{nested['id']}" unless schema['enums']['statuses'].include?(nested['status']) || nested_type == 'acceptanceScenario' || nested_type == 'implementationDiscrepancy'
          raise "nested visibility #{nested['id']}" if nested['visibility'] && !schema['enums']['visibilities'].include?(nested['visibility'])
        end
      end
    end
  end
end
records.select { |_record, path| changed.include?(path) }.each do |record, _path|
  Array(record['evidenceIds']).each { |id| raise "dangling evidence #{id}" unless ids.key?(id) }
  Array(record['supersedes']).each { |id| raise "dangling decision #{id}" unless ids.key?(id) }
  if record['targetId']
    raise "dangling target #{record['targetId']}" unless ids.key?(record['targetId'])
  end
  if record['path'] && record['id'].start_with?('evidence.')
    path = record['path']
    raise "invalid evidence path #{path}" if path.start_with?('/') || path.split('/').include?('..')
    raise "missing evidence #{path}" unless File.exist?(path)
  end
end
decision = documents.fetch(changed[0]).fetch('decisions').first
raise 'replacement scope' unless decision['decisionStatements'].first['statement'].include?('仅此详情读取范围替代DEC-0087-09')
raise 'historical text removed' unless File.read(changed[1]).include?('IN_REVIEW 申请详情仅申请人、当前候选或处理人及本人已处理任务相关人员可见')
rule = documents.fetch(changed[2])['rules'].find { |item| item['id'] == 'rule.record-control-active-detail-access' }
raise 'write qualification changed' unless rule['result']['actionEligibilityUnchanged'] && rule['result']['listProjectionGrantsAuthority'] == false
raise 'rule maturity' unless rule['status'] == 'implemented' && rule['visibility'] == 'internal'
proof_dir = 'docs/development/record-history-detail-access-20261109/evidence/ontology'
%w[before-manager.json before-manager.png source-proof.txt].each do |name|
  raise "missing original evidence #{name}" unless File.exist?(File.join(proof_dir, name))
end
%w[RecordControlPostgresIntegrationTest.txt RecordControlAccessTest.txt].each do |name|
  raise "missing test report #{name}" unless File.exist?(File.join(proof_dir, name))
end
raise 'missing account query' unless File.exist?('docs/development/record-history-detail-access-20261109/admin-identity-permissions.json')
result = YAML.safe_load(File.read('docs/development/record-history-detail-access-20261109/ontology-result.yaml')).fetch('ontologyResult')
raise 'result status' unless result['result'] == 'updated' && result['conflicts'].empty? && result['questions'].empty?
raise 'result version' unless result['baselineBefore'] == '0.3.25' && result['baselineAfter'] == '0.3.25'
raise 'result evidence' unless result['validationEvidence'].all? { |item| item['outcome'] == 'passed' }
puts JSON.pretty_generate({result: 'passed', scope: 'incremental ontology only; not full semantic audit or runtime verification', yamlFiles: changed.size, topLevelRecordsChecked: checked, affectedIdsUnique: changed_ids.uniq.size, checks: ['required-fields-and-status-enums', 'evidence-and-decision-references', 'evidence-path-existence', 'internal-projection-and-retained-maturity', 'statement-level-replacement-and-history', 'read-only-scope-and-server-authority']})
