#!/usr/bin/env python3
"""Create a fictional designer sample on the isolated projection environment only."""
import json
import subprocess

CODE = 'PROJECTION-UX-20261005'

def sql(statement):
    return subprocess.check_output(['psql', '-X', '-h', 'localhost', '-v', 'ON_ERROR_STOP=1', '-d', 'edhr_form_projection', '-Atc', statement], text=True).strip()

def quote(value):
    return "'" + value.replace("'", "''") + "'"

def field(field_id, name, kind):
    return {'id': field_id, 'code': field_id, 'name': name, 'type': kind, 'status': 'enabled', 'groupId': 'default-group',
        'typeConfig': {'sourceType': 'material'} if kind == 'reference' else {}}

main = [field('main-material', '主表消耗物料', 'reference'), field('main-lot', '主表物料批号', 'text'),
    field('main-qty', '主表实际用量', 'number'), field('main-unit', '主表单位', 'text'), field('equipment', '设备编号', 'text')]
columns = [field('row-key', '明细编号', 'text'), field('material', '物料', 'reference'), field('lot', '物料批号', 'text'),
    field('qty', '实际用量', 'number'), field('unit', '计量单位', 'text')]
table = field('items', '上料明细', 'subTable')
table['typeConfig'] = {'columns': columns, 'initialRows': 2, 'minRows': 1, 'allowAddRow': True, 'allowDeleteRow': True}
model = {'groups': [{'id': 'default-group', 'name': '默认分组'}], 'fields': main + [table],
    'projection': {'version': 'form-projection-v1', 'bindings': [
        {'id': 'table-consumption', 'modelId': 'consumption', 'enabled': True, 'tableId': 'items', 'rowKeyFieldId': 'row-key',
            'sources': {'material': 'material', 'materialLotText': 'lot', 'quantity': 'qty', 'unit': 'unit'}}]}}
nodes = [{'id': 'node-' + item['id'], 'type': 'inputnumber' if item['type'] == 'number' else 'input',
    'props': {'label': item['name'], 'placeholder': item['name']},
    'style': {'position': 'absolute', 'cellRange': {'t': index + 2, 'l': 3, 'b': index + 2, 'r': 7}},
    'bindings': {'fieldId': item['id'], 'displayLabel': item['name']}} for index, item in enumerate(main)]
nodes.append({'id': 'node-items', 'type': 'sub-table', 'props': {'label': table['name'], 'columns': columns},
    'style': {'position': 'absolute', 'cellRange': {'t': 9, 'l': 1, 'b': 14, 'r': 8}}, 'bindings': {'fieldId': 'items'}})
column_ranges = [(1, 1), (2, 3), (4, 5), (6, 6), (7, 8)]
for item, (left, right) in zip(columns, column_ranges):
    nodes.append({'id': 'node-column-' + item['id'], 'type': 'inputnumber' if item['type'] == 'number' else 'input',
        'props': {'label': item['name'], 'placeholder': item['name']},
        'style': {'position': 'absolute', 'cellRange': {'t': 11, 'l': left, 'b': 11, 'r': right}},
        'bindings': {'fieldId': item['id'], 'subTableId': 'items', 'subTableFieldId': item['id'], 'subTableField': item}})
canvas = {'pages': [{'id': 'p1', 'name': '子表与主表用途演示', 'nodes': nodes,
    'cells': {f'{index + 2}:1': {'value': item['name']} for index, item in enumerate(main)},
    'mergedCells': [{'t': index + 2, 'l': 1, 'b': index + 2, 'r': 2} for index in range(len(main))],
    'sheet': {'canvasMode': 'paper', 'paperMode': 'table', 'defaultRowHeight': 42, 'rowCount': 18, 'columnCount': 8}}], 'currentPageId': 'p1'}

def wrapper(payload):
    return json.dumps({'schema': 'edhr-template-designer-react', 'version': 1, 'payload': payload}, ensure_ascii=False)

if sql('select count(*) from form_template where code=' + quote(CODE)) != '0':
    print('Designer sample already exists; existing configuration is preserved.')
    raise SystemExit(0)

sql(f"""BEGIN;
INSERT INTO form_template(id,code,name,status,description) VALUES(984001,{quote(CODE)},'虚构子表与主表用途演示','ACTIVE','交互演示，不绑定真实生产对象。');
INSERT INTO form_template_version(id,template_id,version_label,status,model_design_json,canvas_design_json)
VALUES(984002,984001,'V1','PUBLISHED',{quote(wrapper(model))},{quote(wrapper(canvas))});
COMMIT;""")
print('Created fictional designer sample: ' + CODE + ', template 984001 (reserved IDs 984001–984002).')
print('Open http://localhost:3007/master-data/form-templates and design its V1 version.')
