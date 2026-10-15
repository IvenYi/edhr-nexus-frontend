#!/usr/bin/env python3
"""Fictional report-fields acceptance via actual save, completion and query APIs. Local isolated DB only."""
import json
import os
import subprocess
import time
import urllib.request

BASE = 'http://localhost:8087/api/v1'
CODE = 'REPORT-FIELDS-20261013'
OBJECT_ID = 1053018
token = None


def api(path, body=None, method=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    request = urllib.request.Request(BASE + path, headers=headers, method=method,
                                    data=None if body is None else json.dumps(body).encode())
    with urllib.request.urlopen(request, timeout=30) as response:
        result = json.load(response)
    assert result['code'] == 200, result.get('message')
    return result['data']


def sql(statement):
    return subprocess.check_output(['psql', '-X', '-h', 'localhost', '-d', 'edhr_form_projection', '-At', '-v', 'ON_ERROR_STOP=1', '-c', statement], text=True).strip()


def quote(value):
    return "'" + str(value).replace("'", "''") + "'"


login = api('/auth/login', {'username': 'admin', 'password': os.environ.get('PROJECTION_DEMO_PASSWORD', 'admin123')})
token = login.get('token') or login.get('accessToken')
occupied = sql(f'SELECT object_no FROM production_object WHERE id={OBJECT_ID}')
if occupied:
    assert occupied == CODE + '-BATCH', 'Demo ID occupied by other data'
    if sql(f"SELECT count(*) FROM form_projection_batch b JOIN form_instance_record f ON f.id=b.form_instance_id WHERE f.object_id={OBJECT_ID} AND b.status='SUCCEEDED'") != '0':
        print('Existing completed fictional demo retained; no changes. Object: ' + occupied)
        raise SystemExit(0)


def field(id, name, type, config=None):
    return {'id': id, 'code': id, 'name': name, 'type': type, 'status': 'enabled', 'typeConfig': config or {}}


fields = [field('good1', '第一笔良品数', 'number'), field('hours1', '第一笔投入人时', 'number'),
          field('good2', '第二笔良品数', 'number'), field('hours2', '第二笔投入人时', 'number'),
          field('start', '报工开始时间', 'datetime', {'mode': 'datetime'}), field('end', '报工结束时间', 'datetime', {'mode': 'datetime'}),
          field('date', '生产日期', 'datetime', {'mode': 'date'}), field('reporter', '报工人', 'reference', {'sourceType': 'user'})]
columns = [field('mat', '报废物料', 'reference', {'sourceType': 'material'}), field('qty', '报废数量', 'number'),
           field('cause', '报废原因', 'singleSelect', {'options': [{'value': 'scratch', 'label': '划伤'}, {'value': 'dirty', 'label': '污染'}]}),
           field('kind', '报废分类', 'text'), field('note', '现场说明', 'text')]
fields.append(field('scraps', '报废明细', 'subTable', {'columns': columns, 'initialRows': 1, 'allowAddRow': True, 'allowDeleteRow': True}))
bindings = [{'id': 'report' + str(n), 'modelId': 'production', 'enabled': True,
             'sources': {'goodQuantity': 'good' + str(n), 'workHours': 'hours' + str(n), 'reportStartTime': 'start', 'reportEndTime': 'end', 'productionDate': 'date', 'reporter': 'reporter'}} for n in [1, 2]]
bindings.append({'id': 'scrap', 'modelId': 'scrap', 'enabled': True, 'tableId': 'scraps', 'detailFieldIds': ['note'],
                 'sources': {'material': 'mat', 'quantity': 'qty', 'reason': 'cause', 'category': 'kind'}})
model = {'groups': [{'id': 'default-group', 'name': '默认分组'}], 'fields': fields, 'projection': {'version': 'form-projection-v1', 'bindings': bindings}}
nodes, cells = [], {}
for index, item in enumerate(fields[:-1], 2):
    cells[f'{index}:1'] = {'value': item['name']}
    nodes.append({'id': item['id'] + '-node', 'type': {'number': 'inputnumber', 'datetime': 'datetimepicker'}.get(item['type'], 'input'),
                  'props': {'label': item['name']}, 'style': {'position': 'absolute', 'cellRange': {'t': index, 'l': 3, 'b': index, 'r': 8}}, 'bindings': {'fieldId': item['id']}})
canvas = {'pages': [{'id': 'p1', 'name': '报工示例', 'nodes': nodes, 'cells': cells,
                    'mergedCells': [{'t': i, 'l': 1, 'b': i, 'r': 2} for i in range(2, 10)],
                    'sheet': {'canvasMode': 'paper', 'paperMode': 'table', 'defaultRowHeight': 44, 'rowCount': 16, 'columnCount': 8}}], 'currentPageId': 'p1'}
wrap = lambda payload: json.dumps({'schema': 'edhr-template-designer-react', 'version': 1, 'payload': payload}, ensure_ascii=False)
existing = sql(f"SELECT f.id::text || ':' || v.id::text FROM form_template f JOIN form_template_version v ON v.template_id=f.id WHERE f.code='{CODE}-F' AND v.version_label='V1'")
if existing:
    tid, vid = existing.split(':')
else:
    template = api('/master-data/template-modeling/form-templates', {'code': CODE + '-F', 'name': '虚构报工与报废字段验证', 'version': 'V1'})
    tid, vid = template['id'], template['versions'][0]['id']
path = f'/master-data/template-modeling/form-templates/{tid}/versions/{vid}'
api(path + '/design', {'modelDesignJson': wrap(model), 'canvasDesignJson': wrap(canvas)}, 'PUT')
restored = json.loads(api(path)['modelDesignJson'])['payload']
assert restored['projection']['bindings'][0]['sources']['workHours'] == 'hours1'
settings = json.dumps({'fillMode': 'DIRECT', 'directFillConfig': {'buttons': [{'id': 'save', 'action': 'SAVE', 'label': '暂存', 'visible': True}, {'id': 'submit', 'action': 'SUBMIT', 'label': '完成填报', 'visible': True}]}})
if not occupied:
    sql(f"""BEGIN;
INSERT INTO material(id,code,name,unit) VALUES(1053001,'{CODE}-P','虚构报工验证产品','件'),(1053002,'{CODE}-M','虚构螺丝','件');
INSERT INTO route(id,name) VALUES(1053003,'虚构报工验证路线');
INSERT INTO route_version(id,route_id,version,code) VALUES(1053004,1053003,'V1','{CODE}-ROUTE');
INSERT INTO route_node(id,route_version_id,node_key,operation_name,node_type) VALUES(1053005,1053004,'a','虚构报工验证工序','OPERATION');
INSERT INTO dhr_template(id,name) VALUES(1053007,'虚构报工验证DHR');
INSERT INTO dhr_template_version(id,dhr_template_id,version_label) VALUES(1053008,1053007,'V1');
INSERT INTO dhr_directory(id,version_id,name) VALUES(1053019,1053008,'虚构生产记录');
INSERT INTO dhr_template_item(id,directory_id,form_template_id,form_template_version_id) VALUES(1053020,1053019,{tid},{vid});
INSERT INTO product_process(id,owner_type,owner_id) VALUES(1053009,'PRODUCT',1053001);
INSERT INTO product_process_version(id,product_process_id,version_label,production_mode,production_form,route_version_id,dhr_template_version_id) VALUES(1053010,1053009,'V1','量产','批次',1053004,1053008);
INSERT INTO product_process_operation_binding(id,product_process_version_id,route_node_key,operation_name) VALUES(1053013,1053010,'a','虚构报工验证工序');
INSERT INTO product_process_operation_form_binding(id,product_process_operation_binding_id,form_template_version_id,fill_settings_json) VALUES(1053015,1053013,{vid},{quote(settings)});
INSERT INTO work_order(id,order_no,product_id,process_version_id,planned_quantity,status) VALUES(1053017,'{CODE}-WO',1053001,1053010,30,'CREATED');
INSERT INTO production_object(id,work_order_id,object_no,object_type,process_version_id,target_quantity) VALUES({OBJECT_ID},1053017,'{CODE}-BATCH','BATCH',1053010,30);
COMMIT;""")


def action(command, values=None):
    view = api(f'/production/execution/{OBJECT_ID}')
    return api(f'/production/execution/{OBJECT_ID}/actions', {'revision': view['revision'], 'operationId': 'a', 'action': command,
               'formId': 'form-1053015' if values is not None else None, 'values': values})


def query(model_id, filters=None):
    return api('/reports/form-projections/query', {'modelId': model_id, 'objectId': OBJECT_ID, 'filters': filters or {}, 'page': 0, 'size': 20})


action('START')
values = {'good1': 10, 'hours1': 3.5, 'good2': 20, 'start': '2026-10-12T23:00', 'end': '2026-10-13T01:00', 'date': '2026-10-12',
          'reporter': {'id': '1', 'sourceType': 'user', 'code': 'admin', 'name': '管理员'},
          'scraps': [{'mat': {'id': '1053002', 'name': '虚构螺丝', 'code': CODE + '-M', 'sourceType': 'material'}, 'qty': 2, 'cause': 'scratch', 'kind': '外观', 'note': '边缘划伤'},
                     {'mat': {'id': '1053002', 'name': '虚构螺丝', 'code': CODE + '-M', 'sourceType': 'material'}, 'qty': 3, 'cause': 'dirty', 'kind': '外观', 'note': '表面污染'}]}
action('SAVE', values)
assert query('production')['total'] == 0, 'Draft contributed formal records'
saved = api(f'/production/execution/{OBJECT_ID}')['state']['operations']['a']['forms']['form-1053015']['values']
assert saved['hours1'] == 3.5 and not saved.get('hours2')
action('SUBMIT', saved)
for attempt in range(30):
    report = query('production')
    if report['total'] == 2:
        break
    time.sleep(1)
else:
    raise RuntimeError('Formal reports did not appear')
assert report['totals'][0]['goodQuantity'] == 30 and report['totals'][0]['workHours'] == 3.5
assert sum('workHours' in row['attributes'] for row in report['records']) == 1
assert query('production', {'productionDateFrom': '2026-10-13'})['total'] == 0
assert query('production', {'productionDateTo': '2026-10-12', 'reporter': '管理员', 'workOrderNo': CODE + '-WO'})['total'] == 2
assert query('scrap')['totals'][0]['quantity'] == 5
assert query('scrap', {'reason': '划伤'})['totals'][0]['quantity'] == 2
assert {row['details'][0]['value'] for row in query('scrap')['records']} == {'边缘划伤', '表面污染'}
print('PASS: designer save/reopen, draft exclusion, final completion, manual hours, absent hours, period, business date, reporter, frozen context and cause-filtered totals.')
print(f'Template {tid}, version {vid}; object {CODE}-BATCH. This combined form is a test fixture, not a recommended customer form.')
