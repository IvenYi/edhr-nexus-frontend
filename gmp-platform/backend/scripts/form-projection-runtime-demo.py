#!/usr/bin/env python3
"""Fictional saved-trace/subtable demo, restricted to the isolated local environment."""
import json
import os
import re
import subprocess
import time
import urllib.error
import urllib.request

DB = 'edhr_form_projection'
BASE = 'http://localhost:8087/api/v1'
CODE = 'PROJECTION-RUNTIME-20261010-V2'
OBJECT_ID = 992018


def sql(statement):
    return subprocess.check_output(['psql', '-X', '-h', 'localhost', '-v', 'ON_ERROR_STOP=1', '-d', DB, '-Atc', statement], text=True).strip()


def quote(value):
    return "'" + str(value).replace("'", "''") + "'"


token = None


def api(path, body=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    request = urllib.request.Request(BASE + path, data=json.dumps(body).encode() if body is not None else None, headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            result = json.load(response)
    except urllib.error.HTTPError as error:
        raise RuntimeError(error.read().decode()) from None
    if result['code'] != 200:
        raise RuntimeError(result.get('message', 'API failure'))
    return result.get('data')


login = api('/auth/login', {'username': 'admin', 'password': os.environ.get('PROJECTION_DEMO_PASSWORD', 'admin123')})
token = login.get('token') or login.get('accessToken')
if not token:
    raise RuntimeError('Login did not return a token')
if sql('SELECT count(*) FROM form_template WHERE code=' + quote(CODE + '-F')) != '0':
    print('Runtime sample already exists; existing records and edits are preserved.')
    raise SystemExit(0)
if sql('SELECT count(*) FROM production_object WHERE id=992018') != '0':
    raise SystemExit('Reserved fictional object ID 992018 is occupied; nothing changed.')


def field(identifier, name, kind, config=None):
    return {'id': identifier, 'code': identifier, 'name': name, 'type': kind, 'status': 'enabled', 'typeConfig': config or {}}


columns = [field('material', '消耗物料', 'reference', {'sourceType': 'material'}), field('lot', '物料批号', 'text'),
           field('quantity', '实际用量', 'number'), field('unit', '单位', 'singleSelect',
               {'options': [{'label': '件', 'value': 'PCS'}], 'defaultValue': '件'}),
           field('team', '班组', 'text'), field('note', '现场说明', 'text')]
table = field('items', '上料明细', 'subTable', {'columns': columns, 'initialRows': 1, 'minRows': 0, 'allowAddRow': True, 'allowDeleteRow': True})
model = {'groups': [{'id': 'default-group', 'name': '默认分组'}], 'fields': [field('headerLot', '表头物料批号', 'text'), table],
         'projection': {'version': 'form-projection-v1', 'bindings': [
             {'id': 'consume', 'modelId': 'consumption', 'enabled': True, 'tableId': 'items', 'detailFieldIds': ['note'],
              'sources': {'material': 'material', 'quantity': 'quantity', 'unit': 'unit', 'materialLotText': 'lot'}},
             {'id': 'header-trace', 'modelId': 'formTrace', 'enabled': True, 'sources': {'materialLotText': 'headerLot'}},
             {'id': 'row-trace', 'modelId': 'formTrace', 'enabled': True, 'tableId': 'items', 'sources': {'materialLotText': 'lot', 'teamText': 'team'}}]}}
nodes = [{'id': 'header-node', 'type': 'input', 'props': {'label': '表头物料批号'},
          'style': {'cellRange': {'t': 2, 'l': 3, 'b': 2, 'r': 8}}, 'bindings': {'fieldId': 'headerLot'}},
         {'id': 'items-node', 'type': 'sub-table', 'props': {'label': '上料明细', 'columns': columns},
          'style': {'cellRange': {'t': 5, 'l': 1, 'b': 11, 'r': 8}}, 'bindings': {'fieldId': 'items',
          'subTableRegion': {'id': 'items-region', 'fieldId': 'items', 'mode': 'record',
              'ranges': [{'pageId': 'p1', 'range': {'t': 5, 'l': 1, 'b': 11, 'r': 8}, 'order': 1}],
              'repeat': {'type': 'dynamic', 'minCount': 1, 'addPosition': 'bottom', 'allowRemove': True, 'removeConfirm': True},
              'recordTemplate': {'direction': 'row', 'anchor': {'row': 7, 'col': 1},
                  'groupRange': {'t': 7, 'l': 1, 'b': 7, 'r': 8}, 'fields': []},
              'presentation': {'showHeader': False, 'showIndex': False, 'emptyText': '暂无数据', 'addEntry': 'bottom'}}}}]
for column, (left, right) in zip(columns, [(1, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 8)]):
    nodes.append({'id': 'column-' + column['id'], 'type': {'number': 'inputnumber', 'singleSelect': 'select'}.get(column['type'], 'input'),
                  'props': {'label': column['name']}, 'style': {'cellRange': {'t': 7, 'l': left, 'b': 7, 'r': right}},
                  'bindings': {'fieldId': column['id'], 'subTableId': 'items', 'subTableFieldId': column['id'], 'subTableField': column}})
    nodes[1]['bindings']['subTableRegion']['recordTemplate']['fields'].append(
        {'fieldId': column['id'], 'rowOffset': 0, 'colOffset': left - 1, 'rowSpan': 1, 'colSpan': right - left + 1})
canvas = {'pages': [{'id': 'p1', 'name': '虚构上料单', 'nodes': nodes, 'cells': {'2:1': {'value': '表头物料批号'}},
                    'mergedCells': [{'t': 2, 'l': 1, 'b': 2, 'r': 2}],
                    'sheet': {'canvasMode': 'paper', 'paperMode': 'table', 'defaultRowHeight': 42, 'rowCount': 14, 'columnCount': 8}}], 'currentPageId': 'p1'}
wrapper = lambda payload: json.dumps({'schema': 'edhr-template-designer-react', 'version': 1, 'payload': payload}, ensure_ascii=False)
settings = {'fillMode': 'DIRECT', 'directFillConfig': {'buttons': [{'id': 'save', 'action': 'SAVE', 'label': '暂存', 'visible': True}, {'id': 'submit', 'action': 'SUBMIT', 'label': '完成填报', 'visible': True}]}}
sql(f"""BEGIN;
INSERT INTO material(id,code,name,unit) VALUES(992001,'{CODE}-P','虚构过程追溯产品','件'),(992002,'{CODE}-M','虚构螺丝','件');
INSERT INTO route(id,name) VALUES(992003,'虚构过程追溯路线');
INSERT INTO route_version(id,route_id,version,code) VALUES(992004,992003,'V1','{CODE}-ROUTE');
INSERT INTO route_node(id,route_version_id,node_key,operation_name,node_type) VALUES(992005,992004,'a','虚构上料工序','OPERATION');
INSERT INTO dhr_template(id,name) VALUES(992007,'虚构过程追溯DHR');
INSERT INTO dhr_template_version(id,dhr_template_id,version_label) VALUES(992008,992007,'V1');
INSERT INTO dhr_directory(id,version_id,name) VALUES(992019,992008,'虚构生产记录');
INSERT INTO product_process(id,owner_type,owner_id) VALUES(992009,'PRODUCT',992001);
INSERT INTO product_process_version(id,product_process_id,version_label,production_mode,production_form,route_version_id,dhr_template_version_id) VALUES(992010,992009,'V1','量产','批次',992004,992008);
INSERT INTO form_template(id,code,name,status) VALUES(992011,'{CODE}-F','虚构过程追溯与子表统计','ACTIVE');
INSERT INTO form_template_version(id,template_id,version_label,status,model_design_json,canvas_design_json) VALUES(992012,992011,'V1','PUBLISHED',{quote(wrapper(model))},{quote(wrapper(canvas))});
INSERT INTO dhr_template_item(id,directory_id,form_template_id,form_template_version_id) VALUES(992020,992019,992011,992012);
INSERT INTO product_process_operation_binding(id,product_process_version_id,route_node_key,operation_name) VALUES(992013,992010,'a','虚构上料工序');
INSERT INTO product_process_operation_form_binding(id,product_process_operation_binding_id,form_template_version_id,fill_settings_json) VALUES(992015,992013,992012,{quote(json.dumps(settings))});
INSERT INTO work_order(id,order_no,product_id,process_version_id,planned_quantity,status) VALUES(992017,'{CODE}-WO',992001,992010,10,'CREATED');
INSERT INTO production_object(id,work_order_id,object_no,object_type,process_version_id,target_quantity) VALUES(992018,992017,'{CODE}-BATCH','BATCH',992010,10);
COMMIT;""")


def action(command, values=None):
    view = api(f'/production/execution/{OBJECT_ID}')
    return api(f'/production/execution/{OBJECT_ID}/actions', {'revision': view['revision'], 'operationId': 'a', 'action': command,
               'formId': 'form-992015' if values is not None else None, 'values': values})


def query(model_id='formTrace', filters=None):
    return api('/reports/form-projections/query', {'modelId': model_id, 'objectId': OBJECT_ID, 'filters': filters or {}, 'page': 0, 'size': 20})


def saved_values():
    return api(f'/production/execution/{OBJECT_ID}')['state']['operations']['a']['forms']['form-992015']['values']


action('START')
raw = {'headerLot': 'HEADER-LOT', 'items': [
    {'material': {'id': '992002', 'name': '虚构螺丝'}, 'lot': 'ROW-A', 'quantity': 2, 'team': '甲班', 'note': '第一笔现场记录'},
    {'material': {'id': '992002', 'name': '虚构螺丝'}, 'quantity': 3, 'unit': '', 'team': '乙班', 'note': '无批号且未填单位'}]}
action('SAVE', raw)
saved = saved_values()
assert saved['items'][0]['unit'] == 'PCS', saved
ids = [row['__rowId'] for row in saved['items']]
assert len(set(ids)) == 2 and all(re.fullmatch(r'[a-f0-9-]{36}', row_id) for row_id in ids), ids
assert query()['total'] == 1 and query()['records'][0]['savedStage'] == 'FILLING'
assert query('consumption')['total'] == 0, 'Draft generated a formal fact'
assert query(filters={'materialLotText': 'ROW-A', 'teamText': '乙班'})['total'] == 0, 'Conditions crossed actual rows'
assert query(filters={'materialLotText': 'HEADER-LOT', 'teamText': '乙班'})['total'] == 1, 'Header/detail matching failed'
saved['items'].reverse()
saved['items'][1]['lot'] = 'ROW-A-UPDATED'
action('SAVE', saved)
assert [row['__rowId'] for row in saved_values()['items']] == list(reversed(ids))
assert query(filters={'materialLotText': 'ROW-A'})['total'] == 0, 'Stale saved content is still searchable'
assert query(filters={'materialLotText': 'ROW-A-UPDATED'})['total'] == 1
action('SUBMIT', saved_values())
for attempt in range(30):
    consumption = query('consumption')
    if consumption['total'] == 2:
        break
    time.sleep(1)
else:
    raise RuntimeError('Final statistics did not succeed within 30 seconds')
assert len(consumption['totals']) == 2 and sorted(row['quantity'] for row in consumption['totals']) == [2, 3], consumption
assert {row['unit'] or '' for row in consumption['totals']} == {'', 'PCS'}, consumption
assert {row['details'][0]['value'] for row in consumption['records']} == {'第一笔现场记录', '无批号且未填单位'}
assert {row['rowIndex'] for row in consumption['records']} == {0, 1}
assert all(row['tableId'] == 'items' for row in consumption['records'])
trace = query()['records'][0]
assert trace['status'] == 'COMPLETED' and trace['savedStage'] == 'COMPLETED'
source = api('/reports/form-projections/instances/' + trace['instanceId'] + '/source')
assert source['values']['items'][1]['__rowId'] == ids[0]
assert len(api('/reports/form-projections/instances/' + trace['instanceId'] + '/dhr')) == 1
print('PASS: saved trace, same-row conditions, stable UUID after reorder, latest saved values, persisted option default, optional lot/unit, isolated formal totals, extra detail values and actual DHR.')
print('Open http://localhost:3007/reports/form-projections; production object ' + CODE + '-BATCH.')
