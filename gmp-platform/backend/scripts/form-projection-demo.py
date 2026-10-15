#!/usr/bin/env python3
"""Fictional, isolated demo. Seeds configuration only; production APIs create the evidence and projections."""
import json
import os
import subprocess
import time
import urllib.request
import urllib.error

DB = os.environ.get('PROJECTION_DEMO_DATABASE', 'edhr_form_projection')
BASE = os.environ.get('PROJECTION_DEMO_API', 'http://localhost:8087/api/v1')
if DB != 'edhr_form_projection' or not BASE.startswith('http://localhost:8087/'):
    raise SystemExit('This demo only operates on local edhr_form_projection at port 8087.')

def sql(statement):
    return subprocess.check_output(['psql', '-X', '-v', 'ON_ERROR_STOP=1', '-d', DB, '-Atc', statement], text=True).strip()

def quote(value):
    return "'" + str(value).replace("'", "''") + "'"

token = None
def api(path, body=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    request = urllib.request.Request(BASE + path, data=json.dumps(body).encode() if body is not None else None, headers=headers)
    try:
        with urllib.request.urlopen(request) as response:
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
seeded = sql("SELECT count(*) FROM material WHERE code='PROJECTION-DEMO2-P'") != '0'
def batch_count(status=None):
    return int(sql("SELECT count(*) FROM form_projection_batch b JOIN form_instance_record f ON f.id=b.form_instance_id WHERE f.object_id=980018" + (" AND b.status=" + quote(status) if status else '')))
if seeded and batch_count('SUCCEEDED') == 2:
    print('Demo already exists; no records changed. Open /reports/form-projections on port 3007.')
    raise SystemExit(0)

fields = []
for field_id, name, kind in [('material', '消耗物料', 'reference'), ('lot1', '物料批号一', 'text'), ('qty1', '实际用量一', 'number'),
                              ('lot2', '物料批号二', 'text'), ('qty2', '实际用量二', 'number'), ('unit', '单位', 'text'),
                              ('team1', '班组一', 'text'), ('team2', '班组二', 'text'), ('good', '正式良品数', 'number'),
                              ('scrap', '报废数量', 'number'), ('category', '报废分类', 'text')]:
    fields.append({'id': field_id, 'name': name, 'code': field_id, 'type': kind, 'status': 'enabled', 'sortOrder': len(fields),
                   'typeConfig': {'sourceType': 'material'} if kind == 'reference' else {}})
bindings = [
    {'id': 'consume-1', 'modelId': 'consumption', 'sources': {'material': 'material', 'materialLotText': 'lot1', 'quantity': 'qty1', 'unit': 'unit', 'teamText': 'team1'}},
    {'id': 'consume-2', 'modelId': 'consumption', 'sources': {'material': 'material', 'materialLotText': 'lot2', 'quantity': 'qty2', 'unit': 'unit', 'teamText': 'team2'}},
    {'id': 'report', 'modelId': 'production', 'sources': {'goodQuantity': 'good', 'unit': 'unit'}},
    {'id': 'scrap', 'modelId': 'scrap', 'sources': {'material': 'material', 'materialLotText': 'lot1', 'quantity': 'scrap', 'unit': 'unit', 'category': 'category'}},
    {'id': 'trace-1', 'modelId': 'formTrace', 'sources': {'materialLotText': 'lot1', 'teamText': 'team1'}},
    {'id': 'trace-2', 'modelId': 'formTrace', 'sources': {'materialLotText': 'lot2', 'teamText': 'team2'}},
]
for binding in bindings:
    binding['enabled'] = True
model = {'fields': fields, 'groups': [{'id': 'default-group', 'name': '默认分组'}], 'projection': {'version': 'form-projection-v1', 'bindings': bindings}}
nodes = []
for index, field in enumerate(fields):
    nodes.append({'id': 'node-' + field['id'], 'type': 'inputnumber' if field['type'] == 'number' else 'input',
                  'props': {'label': field['name'], 'placeholder': field['name']},
                  'style': {'position': 'absolute', 'cellRange': {'t': index + 2, 'l': 3, 'b': index + 2, 'r': 7}},
                  'bindings': {'fieldId': field['id'], 'displayLabel': field['name']}})
canvas = {'pages': [{'id': 'p1', 'name': '虚构投影演示', 'nodes': nodes,
                    'cells': {f'{index + 2}:1': {'value': field['name']} for index, field in enumerate(fields)},
                    'mergedCells': [{'t': index + 2, 'l': 1, 'b': index + 2, 'r': 2} for index in range(len(fields))],
                    'sheet': {'canvasMode': 'paper', 'paperMode': 'table', 'defaultRowHeight': 42, 'rowCount': 16, 'columnCount': 8}}], 'currentPageId': 'p1'}
wrapper = lambda payload: json.dumps({'schema': 'edhr-template-designer-react', 'version': 1, 'payload': payload}, ensure_ascii=False)
settings = {'fillMode': 'DIRECT', 'directFillConfig': {'buttons': [{'id': 'save', 'action': 'SAVE', 'label': '暂存', 'visible': True}, {'id': 'submit', 'action': 'SUBMIT', 'label': '完成填报', 'visible': True}]}}
if not seeded:
    sql(f"""BEGIN;
INSERT INTO material(id,code,name,unit) VALUES(980001,'PROJECTION-DEMO2-P','虚构演示产品','件'),(980002,'PROJECTION-DEMO2-M','虚构物料M','件');
INSERT INTO route(id,name) VALUES(980003,'虚构演示路线');
INSERT INTO route_version(id,route_id,version,code) VALUES(980004,980003,'V1','PROJECTION-DEMO2-ROUTE');
INSERT INTO route_node(id,route_version_id,node_key,operation_name,node_type) VALUES(980005,980004,'a','演示工序A','OPERATION'),(980006,980004,'b','演示工序B','OPERATION');
INSERT INTO dhr_template(id,name) VALUES(980007,'虚构演示DHR');
INSERT INTO dhr_template_version(id,dhr_template_id,version_label) VALUES(980008,980007,'V1');
INSERT INTO dhr_directory(id,version_id,name) VALUES(980019,980008,'虚构生产记录');
INSERT INTO product_process(id,owner_type,owner_id) VALUES(980009,'PRODUCT',980001);
INSERT INTO product_process_version(id,product_process_id,version_label,production_mode,production_form,route_version_id,dhr_template_version_id) VALUES(980010,980009,'V1','量产','批次',980004,980008);
INSERT INTO form_template(id,code,name,status) VALUES(980011,'PROJECTION-DEMO2-F','虚构追溯投影演示表','ACTIVE');
INSERT INTO form_template_version(id,template_id,version_label,status,model_design_json,canvas_design_json) VALUES(980012,980011,'V1','PUBLISHED',{quote(wrapper(model))},{quote(wrapper(canvas))});
INSERT INTO dhr_template_item(id,directory_id,form_template_id,form_template_version_id) VALUES(980020,980019,980011,980012);
INSERT INTO product_process_operation_binding(id,product_process_version_id,route_node_key,operation_name) VALUES(980013,980010,'a','演示工序A'),(980014,980010,'b','演示工序B');
INSERT INTO product_process_operation_form_binding(id,product_process_operation_binding_id,form_template_version_id,fill_settings_json) VALUES(980015,980013,980012,{quote(json.dumps(settings))}),(980016,980014,980012,{quote(json.dumps(settings))});
INSERT INTO work_order(id,order_no,product_id,process_version_id,planned_quantity,status) VALUES(980017,'PROJECTION-DEMO2-WO',980001,980010,100,'CREATED');
INSERT INTO production_object(id,work_order_id,object_no,object_type,process_version_id,target_quantity) VALUES(980018,980017,'PROJECTION-DEMO2-BATCH','BATCH',980010,100);
COMMIT;""")
values = {'material': {'id': '980002', 'name': '虚构物料M'}, 'lot1': 'DEMO-L1', 'lot2': 'DEMO-L2', 'qty1': 2, 'qty2': 3, 'unit': '件', 'team1': '甲班', 'team2': '乙班', 'good': 100, 'scrap': 1, 'category': '虚构外观类'}
preview = api('/master-data/template-modeling/projection-preview', {'model': model, 'values': values})
assert len(preview) == 6
def action(operation, command, form=None, submitted=None):
    view = api('/production/execution/980018')
    return api('/production/execution/980018/actions', {'revision': view['revision'], 'operationId': operation, 'action': command, 'formId': form, 'values': submitted})
for operation, form in [('a', 'form-980015'), ('b', 'form-980016')]:
    current = api('/production/execution/980018').get('state', {}).get('operations', {}).get(operation, {})
    if current.get('forms', {}).get(form, {}).get('status') == 'COMPLETED':
        continue
    if current.get('status') != 'IN_PROGRESS':
        action(operation, 'START')
    action(operation, 'SAVE', form, values)
    before = batch_count()
    assert before == (0 if operation == 'a' else 1), 'Draft unexpectedly projected'
    action(operation, 'SUBMIT', form, values)
for attempt in range(30):
    if batch_count('SUCCEEDED') == 2:
        break
    time.sleep(1)
else:
    raise RuntimeError('Projection did not succeed within 30 seconds')
report = api('/reports/form-projections/query', {'modelId': 'production', 'objectId': 980018, 'page': 0, 'size': 20})
assert len(report['totals']) == 2 and all(row['goodQuantity'] == 100 for row in report['totals']), report
cross = api('/reports/form-projections/query', {'modelId': 'consumption', 'objectId': 980018, 'filters': {'materialLotText': 'DEMO-L1', 'teamText': '乙班'}, 'page': 0, 'size': 20})
assert cross['total'] == 0, 'Cross-row false match'
consume = api('/reports/form-projections/query', {'modelId': 'consumption', 'objectId': 980018, 'page': 0, 'size': 20})
assert consume['total'] == 4
source = api('/reports/form-projections/' + consume['records'][0]['batchId'] + '/source')
assert source['values']['lot1'] == 'DEMO-L1'
assert len(api('/reports/form-projections/' + consume['records'][0]['batchId'] + '/dhr')) == 1
print('PASS: preview 6 records; drafts do not project; two final batches; 4 consumption details; per-operation totals 100/100; cross-row mismatch excluded; frozen source and actual DHR verified.')
print('Open http://localhost:3007/reports/form-projections; demo production object 980018.')
