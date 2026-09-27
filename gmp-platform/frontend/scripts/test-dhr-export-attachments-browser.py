"""Isolated real-browser tests; all writes/download requests mocked, no live data changes."""
import copy
import json
from email import policy
from email.parser import BytesParser
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright, expect
from importlib.util import spec_from_file_location, module_from_spec

spec = spec_from_file_location('fixtures', Path(__file__).with_name('test-dhr-workspace-navigation-browser.py'))
fixtures = module_from_spec(spec)
spec.loader.exec_module(fixtures)

def main():
    user = {**fixtures.USER, 'permissions': fixtures.USER['permissions'] + ['dhr.summaries.export', 'dhr.summaries.reorganize']}
    dhr = {**fixtures.DHR, 'summaryStatus': 'FORMALIZED'}
    attachment = {'id': 'a1', 'name': '委外报告.pdf', 'sourceKind': 'EXTERNAL_REPORT', 'purpose': '委外检验', 'size': 2048, 'verificationStatus': 'VERIFIED', 'linkedBy': 'QA', 'linkedAt': '2026-09-27T12:00:00'}
    base = copy.deepcopy(fixtures.DIRECTORY)
    del base['directories'][0]['items'][0]['records']
    versions = {id: {'id': id, 'versionNo': n, 'status': 'FORMALIZED', 'reviewMode': 'NONE', 'baseDirectory': base, 'overlayDirectories': [], 'candidates': copy.deepcopy(fixtures.RECORDS), 'attachments': [attachment.copy()], 'snapshotHash': 'hash-' + id} for id, n in [('99', 1), ('100', 2)]}
    state = {'exports': [], 'attachments': [], 'writes': [], 'file_bytes': b'', 'revisions': []}
    def workspace():
        return {'dhr': dhr, 'draft': {'id': '20', 'revision': 1, 'overlayDirectories': [], 'placements': []}, 'candidates': fixtures.RECORDS, 'attachments': state['attachments'], 'versions': list(reversed(list(versions.values()))), 'sourceScopeHash': 'qa-scope'}
    def api(route):
        url = urlparse(route.request.url)
        path = url.path.removeprefix('/api/v1')
        data = {'content': [], 'totalElements': 0}
        if path == '/auth/me': data = user
        elif path == '/system/menu-configuration': data = {'modules': [], 'configured': False}
        elif path.startswith('/system/settings'): data = {'systemName': 'DHR QA'}
        elif path in ['/dhr-instances', '/dhr-instances/summary-list']: data = {'content': [dhr], 'totalElements': 1, 'totalPages': 1}
        elif path == '/dhr-instances/1': data = dhr
        elif path == '/dhr-instances/1/summary': data = workspace()
        elif path == '/dhr-instances/1/summary/reorganize':
            state['revisions'].append(route.request.post_data_json)
            assert state['revisions'][-1] == {'expectedVersionId': '100', 'reason': '补充检测报告'}
            dhr['summaryStatus'] = 'DRAFT'
            data = workspace()
        elif path.endswith('/export'):
            state['exports'].append((path, parse_qs(url.query, keep_blank_values=True)))
            route.fulfill(status=200, content_type='application/zip', body=b'PK\x05\x06' + b'\x00' * 18)
            return
        elif '/summary/versions/' in path: data = {'dhr': dhr, 'version': versions[path.rsplit('/', 1)[-1]], 'placements': [], 'evidenceChanges': []}
        elif path == '/dhr-instances/1/attachments':
            assert route.request.method == 'POST'
            content_type = route.request.headers['content-type']
            assert content_type.startswith('multipart/form-data; boundary='), content_type
            message = BytesParser(policy=policy.default).parsebytes(('Content-Type: ' + content_type + '\r\n\r\n').encode() + route.request.post_data_buffer)
            file = next(part for part in message.iter_parts() if part.get_filename())
            state['file_bytes'] = file.get_payload(decode=True)
            state['writes'].append('upload')
            state['attachments'] = [{**attachment, 'name': file.get_filename(), 'size': len(state['file_bytes']), 'verificationStatus': 'PENDING'}]
            data = {'attachmentId': 'a1'}
        elif path == '/dhr-instances/1/attachments/a1/download':
            route.fulfill(status=200, content_type='application/octet-stream', body=state['file_bytes'])
            return
        elif path.endswith('/verify'):
            state['writes'].append('verify')
            state['attachments'][0]['verificationStatus'] = 'VERIFIED'
        elif path.endswith('/unlink'):
            assert route.request.post_data_json['reason'] == '重复关联'
            state['writes'].append('unlink')
            state['attachments'] = []
        else: assert route.request.method == 'GET', path
        route.fulfill(json={'code': 200, 'message': 'OK', 'data': data})
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
        context = browser.new_context(viewport={'width': 1440, 'height': 960})
        context.add_init_script("localStorage.setItem('token','qa');localStorage.setItem('user'," + json.dumps(json.dumps(user)) + ');')
        context.route('**/api/v1/**', api)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        out = Path('output/dhr-workspace-navigation'); out.mkdir(parents=True, exist_ok=True)
        def open_workspace(kind='list'):
            page.goto('http://localhost:3000/dhr-management/' + kind)
            page.wait_for_load_state('networkidle')
            assert 'DHR-NAV-QA' in page.locator('body').inner_text()
            page.get_by_role('button', name=('查看 DHR 档案 ' if kind == 'list' else '进入汇总 ') + 'DHR-NAV-QA', exact=True).click()
        try:
            open_workspace()
            page.get_by_role('button', name='导出 DHR', exact=True).click()
            page.get_by_role('radio', name='自定义范围', exact=True).check()
            expect(page.get_by_role('button', name='导出 ZIP', exact=True)).to_be_disabled()
            page.get_by_role('checkbox', name='选择表单 FR-101', exact=True).check()
            expect(page.get_by_role('checkbox', name='选择目录 生产记录')).to_have_attribute('data-indeterminate', 'true')
            page.get_by_role('checkbox', name='选择表单 FR-103', exact=True).check()
            search = page.get_by_role('textbox', name='搜索目录、表单名称、实例号或附件')
            search.fill('委外')
            page.get_by_role('checkbox', name='全选当前筛选结果').check()
            expect(page.get_by_text('已选 2 份表单 / 1 份附件', exact=True)).to_be_visible()
            with page.expect_download(): page.get_by_role('button', name='导出 ZIP', exact=True).click()
            assert state['exports'][-1] == ('/dhr-instances/1/summary/versions/100/export', {'scope': ['SELECTED'], 'recordIds': ['101,103'], 'attachmentIds': ['a1']})
            expect(page.get_by_role('button', name='取消', exact=True)).to_be_enabled()
            page.get_by_role('button', name='取消', exact=True).click()
            page.get_by_role('combobox', name='档案版本').click()
            page.get_by_role('option', name='V1 · 已正式化', exact=True).click()
            page.get_by_role('button', name='导出 DHR', exact=True).click()
            expect(page.get_by_role('radio', name='完整 DHR', exact=True)).to_be_checked()
            page.get_by_role('radio', name='自定义范围', exact=True).check()
            expect(page.get_by_role('button', name='导出 ZIP', exact=True)).to_be_disabled()
            page.get_by_role('radio', name='完整 DHR', exact=True).check()
            with page.expect_download(): page.get_by_role('button', name='导出 ZIP', exact=True).click()
            assert state['exports'][-1] == ('/dhr-instances/1/summary/versions/99/export', {'scope': ['FULL'], 'recordIds': [''], 'attachmentIds': ['']})
            expect(page.get_by_role('button', name='取消', exact=True)).to_be_enabled()
            page.get_by_role('button', name='取消', exact=True).click()
            page.get_by_role('button', name='发起修订', exact=True).click()
            expect(page.get_by_text('将基于最新定版创建修订草稿', exact=False)).to_be_visible()
            page.get_by_role('button', name='取消', exact=True).click()
            page.get_by_role('button', name='附件 1', exact=True).click()
            expect(page.get_by_role('table', name='DHR附件列表')).to_contain_text('委外报告.pdf')
            expect(page.get_by_role('button', name='上传附件', exact=True)).to_have_count(0)
            page.screenshot(path=str(out / 'attachments-frozen.png'), animations='disabled')
            print('PASS mixed/full ZIP scope, version reset, frozen attachments, revision explanation')
            page.goto('http://localhost:3000/dhr-management/list')
            page.wait_for_load_state('networkidle')
            page.get_by_role('button', name='发起修订 DHR-NAV-QA', exact=True).click()
            expect(page.get_by_role('button', name='确认', exact=True)).to_be_disabled()
            page.get_by_role('textbox', name='操作意见').fill('补充检测报告')
            page.get_by_role('button', name='确认', exact=True).click()
            expect(page.get_by_role('button', name='保存草稿', exact=True)).to_be_visible()
            expect(page.get_by_role('combobox', name='档案版本')).to_contain_text('当前草稿')
            assert len(state['revisions']) == 1
            page.get_by_role('combobox', name='档案版本').click()
            page.get_by_role('option', name='V1 · 已正式化', exact=True).click()
            expect(page.get_by_role('button', name='导出 DHR', exact=True)).to_be_enabled()
            expect(page.get_by_role('button', name='保存草稿', exact=True)).to_have_count(0)
            page.screenshot(path=str(out / 'revision-old-version.png'), animations='disabled')
            page.get_by_role('combobox', name='档案版本').click()
            page.get_by_role('option', name='当前草稿', exact=True).click()
            expect(page.get_by_role('button', name='保存草稿', exact=True)).to_be_visible()
            print('PASS row revision creates draft from latest V2; V1 remains readonly/exportable; return to draft')
            dhr['summaryStatus'] = 'FORMALIZED'
            user['permissions'].remove('dhr.summaries.export')
            open_workspace()
            expect(page.get_by_role('button', name='导出 DHR', exact=True)).to_be_disabled()
            print('PASS export permission gate retained')
            dhr['summaryStatus'] = 'DRAFT'
            open_workspace('summary')
            page.get_by_role('button', name='附件 0', exact=True).click()
            page.get_by_role('button', name='上传附件', exact=True).click()
            page.locator('input[type=file]').set_input_files({'name': '委外报告.pdf', 'mimeType': 'application/pdf', 'buffer': b'%PDF-1.4 QA'})
            page.get_by_role('textbox', name='来源与用途').fill('委外检验')
            page.get_by_role('button', name='上传并关联', exact=True).click()
            expect(page.get_by_role('table', name='DHR附件列表')).to_contain_text('待核验')
            page.get_by_role('button', name='确认核验', exact=True).click()
            expect(page.get_by_role('table', name='DHR附件列表')).to_contain_text('已核验')
            page.screenshot(path=str(out / 'attachments-editable.png'), animations='disabled')
            page.get_by_role('button', name='解除关联', exact=True).click()
            expect(page.get_by_role('button', name='确认解除', exact=True)).to_be_disabled()
            page.get_by_role('textbox', name='解除原因').fill('重复关联')
            page.get_by_role('button', name='确认解除', exact=True).click()
            expect(page.get_by_role('table', name='DHR附件列表')).to_contain_text('暂无附件证据')
            assert state['writes'] == ['upload', 'verify', 'unlink'], state
            page.get_by_role('button', name='上传附件', exact=True).click()
            expect(page.get_by_text('单个文件不超过 50 MB', exact=False)).to_be_visible()
            accepted = page.locator('input[type=file]').get_attribute('accept').split(',')
            assert all('.' + ext in accepted for ext in ['pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx', 'xls', 'xlsx'])
            # Actual browser File size at the boundary; no live backend writes.
            page.locator('input[type=file]').evaluate('''input => {
                const transfer = new DataTransfer();
                transfer.items.add(new File([new Uint8Array(50 * 1024 * 1024 + 1)], 'oversize.doc', {type: 'application/msword'}));
                input.files = transfer.files; input.dispatchEvent(new Event('change', {bubbles:true}));
            }''')
            page.get_by_role('textbox', name='来源与用途').fill('容量限制')
            expect(page.get_by_role('button', name='上传并关联', exact=True)).to_be_disabled()
            expect(page.get_by_text('附件不能为空且不能超过 50 MB', exact=True)).to_be_visible()
            assert state['writes'] == ['upload', 'verify', 'unlink']
            page.screenshot(path=str(out / 'attachment-office-50mb.png'), animations='disabled')
            page.get_by_role('button', name='取消', exact=True).click()
            for extension in ['doc', 'docx', 'xls', 'xlsx']:
                name = '委外原件.' + extension
                payload = ('mock multipart/download ' + extension).encode()
                page.get_by_role('button', name='上传附件', exact=True).click()
                page.locator('input[type=file]').set_input_files({'name': name, 'mimeType': 'application/octet-stream', 'buffer': payload})
                page.get_by_role('textbox', name='来源与用途').fill('Office原件核查')
                page.get_by_role('button', name='上传并关联', exact=True).click()
                expect(page.get_by_role('table', name='DHR附件列表')).to_contain_text(name)
                assert state['file_bytes'] == payload
                with page.expect_download() as event:
                    page.get_by_role('button', name='下载原件', exact=True).click()
                download = event.value
                assert download.suggested_filename == name
                assert Path(download.path()).read_bytes() == payload
                page.get_by_role('button', name='确认核验', exact=True).click()
                expect(page.get_by_role('table', name='DHR附件列表')).to_contain_text('已核验')
                page.get_by_role('button', name='解除关联', exact=True).click()
                page.get_by_role('textbox', name='解除原因').fill('重复关联')
                page.get_by_role('button', name='确认解除', exact=True).click()
                expect(page.get_by_role('table', name='DHR附件列表')).to_contain_text('暂无附件证据')
            assert state['writes'] == ['upload', 'verify', 'unlink'] * 5
            print('PASS four Office upload/download filenames and bytes, >50MB rejected before request')
            assert not errors, errors
            print('PASS attachment upload/verify/reasoned unlink; no unexpected writes or browser errors')
        except Exception:
            page.screenshot(path=str(out / 'export-attachments-failure.png'), animations='disabled')
            print(page.locator('body').inner_text()[-5000:])
            raise
        finally: browser.close()

if __name__ == '__main__': main()
