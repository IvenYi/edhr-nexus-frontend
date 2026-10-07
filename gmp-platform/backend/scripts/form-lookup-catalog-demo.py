#!/usr/bin/env python3
"""Fictional lookup catalog demo; requires form-projection-demo.py in the isolated local database."""
import json
import os
import subprocess
import time
import urllib.request
import urllib.error

DB = os.environ.get('PROJECTION_DEMO_DATABASE', 'edhr_form_projection')
BASE = os.environ.get('PROJECTION_DEMO_API', 'http://localhost:8087/api/v1')
if DB != 'edhr_form_projection' or BASE != 'http://localhost:8087/api/v1':
    raise SystemExit('Only local edhr_form_projection and port 8087 are supported.')

def sql(statement):
    return subprocess.check_output(['psql', '-X', '-v', 'ON_ERROR_STOP=1', '-d', DB, '-Atc', statement], text=True).strip()

def quote(value):
    return "'" + str(value).replace("'", "''") + "'"

token = None
def api(path, body=None, method=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    request = urllib.request.Request(BASE + path, data=json.dumps(body).encode() if body is not None else None,
                                     headers=headers, method=method)
    try:
        with urllib.request.urlopen(request) as response:
            result = json.load(response)
    except urllib.error.HTTPError as error:
        raise RuntimeError(error.read().decode()) from None
    if result['code'] != 200:
        raise RuntimeError(result.get('message', 'API failure'))
    return result.get('data')

if sql("SELECT count(*) FROM production_object WHERE id=980018 AND object_no='PROJECTION-DEMO2-BATCH'") != '1':
    raise SystemExit('Run scripts/form-projection-demo.py first.')
login = api('/auth/login', {'username': 'admin', 'password': os.environ.get('PROJECTION_DEMO_PASSWORD', 'admin123')})
token = login.get('token') or login.get('accessToken')
if not token:
    raise RuntimeError('Login did not return a token')
name = '虚构演示灭菌锅次'
item = next((row for row in api('/form-lookup-items') if row['name'] == name), None)
if item is None:
    item = api('/form-lookup-items', {'name': name, 'description': '虚构数据；填写锅次编号，如 DEMO-POT-001。'})
key = item['id']
catalog = api('/master-data/template-modeling/projection-catalog')
assert any(attribute['id'] == key for model in catalog['models'] if model['id'] == 'formTrace' for attribute in model['attributes'])

def query():
    return api('/reports/form-projections/query', {'modelId': 'formTrace', 'filters': {key: 'DEMO-POT-001'}, 'page': 0, 'size': 20})

if sql("SELECT count(*) FROM form_template WHERE code='LOOKUP-DEMO-20261007'") == '0':
    assert query()['total'] == 0, 'New item unexpectedly matched historical forms'
    sql("""BEGIN;
INSERT INTO material(id,code,name,unit) VALUES(985009,'LOOKUP-DEMO-PRODUCT','虚构追溯项演示产品','件');
INSERT INTO product_process(id,owner_type,owner_id) VALUES(985001,'PRODUCT',985009);
INSERT INTO product_process_version(id,product_process_id,version_label,production_mode,production_form,route_version_id,dhr_template_version_id) VALUES(985002,985001,'V1','量产','批次',980004,980008);
INSERT INTO form_template(id,code,name,status) VALUES(985003,'LOOKUP-DEMO-20261007','虚构追溯项目录演示','ACTIVE');
INSERT INTO form_template_version(id,template_id,version_label,status) VALUES(985004,985003,'V1','PUBLISHED');
INSERT INTO product_process_operation_binding(id,product_process_version_id,route_node_key,operation_name) VALUES(985005,985002,'a','演示工序A');
INSERT INTO product_process_operation_form_binding(id,product_process_operation_binding_id,form_template_version_id,fill_settings_json) VALUES(985006,985005,985004,'{"fillMode":"DIRECT","directFillConfig":{"buttons":[{"id":"submit","action":"SUBMIT","label":"完成填报","visible":true}]}}');
INSERT INTO work_order(id,order_no,product_id,process_version_id,planned_quantity,status) VALUES(985007,'LOOKUP-DEMO-WO',985009,985002,1,'CREATED');
INSERT INTO production_object(id,work_order_id,object_no,object_type,process_version_id,target_quantity) VALUES(985008,985007,'LOOKUP-DEMO-BATCH','BATCH',985002,1);
COMMIT;""")

existing = sql("SELECT count(*) FROM form_projection_batch b JOIN form_instance_record f ON f.id=b.form_instance_id WHERE f.object_id=985008")
if existing == '0':
    model = {'fields': [{'id': 'pot', 'name': '锅次编号', 'type': 'text', 'status': 'enabled', 'typeConfig': {}}],
             'projection': {'version': 'form-projection-v1', 'bindings': [
                 {'id': 'trace', 'enabled': True, 'modelId': 'formTrace', 'sources': {key: 'pot'}}]}}
    canvas = {'pages': [{'id': 'p1', 'name': '虚构追溯项演示', 'nodes': [
        {'id': 'pot-node', 'type': 'input', 'props': {'label': '锅次编号', 'placeholder': '锅次编号'},
         'style': {'position': 'absolute', 'cellRange': {'t': 2, 'l': 2, 'b': 2, 'r': 5}},
         'bindings': {'fieldId': 'pot', 'displayLabel': '锅次编号'}}],
        'cells': {'2:1': {'value': '锅次编号'}}, 'sheet': {'canvasMode': 'paper', 'paperMode': 'table', 'rowCount': 12, 'columnCount': 8}}], 'currentPageId': 'p1'}
    wrapper = lambda payload: json.dumps({'schema': 'edhr-template-designer-react', 'version': 1, 'payload': payload}, ensure_ascii=False)
    saved = api('/master-data/template-modeling/form-templates/985003/versions/985004/design',
                {'modelDesignJson': wrapper(model), 'canvasDesignJson': wrapper(canvas)}, 'PUT')
    saved_model = json.loads(saved['modelDesignJson'])['payload']
    assert saved_model['projection']['lookupItems'][key]['name'] == name
    def action(command, values=None):
        view = api('/production/execution/985008')
        return api('/production/execution/985008/actions', {'revision': view['revision'], 'operationId': 'a',
            'action': command, 'formId': 'form-985006' if command != 'START' else None, 'values': values})
    state = api('/production/execution/985008').get('state', {}).get('operations', {}).get('a', {})
    if state.get('status') != 'IN_PROGRESS':
        action('START')
    assert query()['total'] == 0, 'Draft unexpectedly projected'
    action('SUBMIT', {'pot': 'DEMO-POT-001'})

for attempt in range(30):
    result = query()
    if result['total'] == 1:
        break
    time.sleep(1)
else:
    raise RuntimeError('Expected one completed result within 30 seconds')
record = result['records'][0]
assert record['objectId'] == '985008'
assert record['hits'][0]['sources'][key] == 'pot'
source = api('/reports/form-projections/' + record['batchId'] + '/source')
assert source['model']['projection']['lookupItems'][key]['name'] == name
assert source['values']['pot'] == 'DEMO-POT-001'
assert sql("SELECT count(*) FROM audit_event WHERE entity_type='FORM_LOOKUP_ITEM' AND entity_id=" + quote(key)) != '0'
print('PASS: catalog available before bindings, API design save, use-time snapshot, draft excluded, final completion query, source location, audit; repeated runs preserve completed evidence.')
print('Open http://localhost:3007/system/form-lookup-items and /reports/form-projections; query 虚构演示灭菌锅次 = DEMO-POT-001.')
