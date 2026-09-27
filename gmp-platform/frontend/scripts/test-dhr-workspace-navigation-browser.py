"""Isolated UI regression: real browser, mocked HTTP, no production writes."""
import json
import re
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, expect
BASE_USER = {"id": 1, "username": "nav-qa", "displayName": "导航测试", "permissions": ["dhr.instances.view", "records.dhr-summary", "records.dhr-filling"]}
BASE_DHR = {"id": "1", "productionObjectId": "2", "objectNo": "BATCH-QA", "objectType": "BATCH", "workOrderNo": "ORDER-QA", "productCode": "P-01", "productName": "测试产品", "status": "COMPLETED", "displayStatus": "PENDING_SUMMARY", "productionStatus": "COMPLETED", "dhrTemplateName": "批记录模板", "dhrTemplateVersion": "V2", "createdAt": "2026-09-27T12:00:00", "executionHistory": []}

USER = {**BASE_USER, "permissions": BASE_USER["permissions"] + ["dhr.summaries.edit", "dhr.summaries.submit", "dhr.filling.act", "dhr.filling.supplement", "records.dhr-review"]}
FIELD = {"id": "value", "code": "value", "name": "记录值", "type": "text", "typeConfig": {}, "status": "enabled", "sortOrder": 0}
def design(payload):
    return json.dumps({"schema": "edhr-template-designer-react", "version": 1, "payload": payload})
MODEL = design({"groups": [], "fields": [FIELD]})
CANVAS = design({"currentPageId": "page-1", "pages": [{"id": "page-1", "name": "记录", "sheet": {"rowCount": 6, "columnCount": 4, "defaultRowHeight": 50, "defaultColumnWidth": 140}, "nodes": [{"id": "input", "type": "input", "props": {}, "style": {"position": "absolute", "cellRange": {"t": 2, "l": 2, "b": 2, "r": 3}}, "bindings": {"fieldId": "value"}}], "cells": {}, "mergedCells": [], "medias": [], "images": []}]})
def record(id, kind, form):
    return {"id": id, "instanceNo": "FR-" + id, "templateId": "700", "templateVersionId": "701", "templateName": "目录记录" if kind == "DIRECTORY" else "作业记录", "templateVersion": "V1", "originKind": kind, "status": "COMPLETED", "operationId": "op", "operationName": "包装", "formId": form, "copyId": id, "snapshot": {"name": "记录", "model": MODEL, "canvas": CANVAS, "fields": [FIELD], **({"dhrItemId": "201"} if kind == "DIRECTORY" else {"workId": "w", "workNodeId": form})}, "fieldValues": {"value": id}}
RECORDS = [record("101", "DIRECTORY", "dir"), record("102", "DIRECTORY", "dir"), record("103", "WORK", "node-a"), record("104", "WORK", "node-a"), record("105", "WORK", "node-b")]
DIRECTORY = {"directories": [{"id": "10", "parentId": None, "name": "生产记录", "items": [{"id": "201", "displayName": "目录记录", "formName": "目录记录", "required": True, "records": RECORDS[:2]}]}]}
DHR = {**BASE_DHR, "dhrNo": "DHR-NAV-QA", "summaryStatus": "DRAFT", "dhrReviewMode": "NONE", "directorySnapshot": DIRECTORY, "recordsByOrigin": {"directory": RECORDS[:2], "work": RECORDS[2:], "custom": []}}
FORM = {"id": "dir", "versionId": "701", "name": "目录记录", "version": "V1", "code": "F1", "dhrItemId": "201", "model": MODEL, "canvas": CANVAS, "fields": [FIELD]}
VIEW = {"objectStatus": "COMPLETED", "dhrSummaryStatus": "DRAFT", "revision": 1, "directorySnapshot": DIRECTORY,
        "snapshot": {"context": {}, "operations": [{"id": "op", "name": "包装", "forms": [FORM], "works": [], "documents": []}]},
        "state": {"operations": {"op": {"status": "COMPLETED", "forms": {r["id"]: {"status": "ACTIVE", "instanceNo": r["instanceNo"], "values": r["fieldValues"]} for r in RECORDS[:2]}, "works": {}}}, "history": []},
        "availability": {"op": {"forms": {}, "formCopies": {"dir": {"instanceIds": ["101", "102"], "instances": {r["id"]: {"canAct": True, "permissions": {"value": "WRITE"}, "buttons": []} for r in RECORDS[:2]}}}}}}
for form_id in ['node-a', 'node-b']:
    form = {**FORM, 'id': form_id, 'name': '作业记录', 'workId': 'w', 'workNodeId': form_id}
    form.pop('dhrItemId')
    VIEW['snapshot']['operations'][0]['forms'].append(form)
    rows = [r for r in RECORDS if r['formId'] == form_id]
    for r in rows:
        r['copyId'] = 'copy-' + r['id']
        VIEW['state']['operations']['op']['forms'][r['copyId']] = {'status': 'ACTIVE', 'instanceNo': r['instanceNo'], 'values': r['fieldValues']}
    VIEW['availability']['op']['formCopies'][form_id] = {'instanceIds': [r['copyId'] for r in rows], 'instances': {r['copyId']: {'canAct': True, 'permissions': {'value': 'WRITE'}, 'buttons': []} for r in rows}}

def main():
    state = {"draft": {"id": "20", "revision": 1, "overlayDirectories": [], "placements": []}, "saves": 0}
    task = {"id": "5", "dhrId": "1", "dhrNo": DHR['dhrNo'], "versionId": "99", "versionNo": 1, "nodeName": "质量审批", "objectNo": "BATCH-QA", "status": "PENDING"}
    def api(route):
        path = urlparse(route.request.url).path.removeprefix("/api/v1")
        data = {"content": [], "totalElements": 0}
        if path == "/auth/me": data = USER
        elif path == "/system/menu-configuration": data = {"modules": [], "configured": False}
        elif path.startswith("/system/settings"): data = {"systemName": "DHR QA"}
        elif path in ["/dhr-instances", "/dhr-filling", "/dhr-instances/summary-list"]: data = {"content": [DHR], "totalElements": 1, "totalPages": 1}
        elif path == "/dhr-instances/1": data = {**DHR, 'archiveLayout': state['draft']}
        elif path == "/dhr-filling/1": data = {**VIEW, 'archiveLayout': {**state['draft'], 'recordRefs': [{k: r[k] for k in ['id', 'operationId', 'formId', 'copyId']} for r in RECORDS]}}
        elif path == '/dhr-filling/1/supplements':
            command = route.request.post_data_json
            assert command['operationId'] == 'op' and command['formId'] == 'node-a'
            VIEW['revision'] += 1
            VIEW['state']['operations']['op']['forms']['new-copy'] = {'status': 'ACTIVE', 'instanceNo': 'FR-NEW', 'values': {'value': '新增补录'}}
            group = VIEW['availability']['op']['formCopies']['node-a']
            group['instanceIds'].append('new-copy')
            group['instances']['new-copy'] = {'canAct': True, 'permissions': {'value': 'WRITE'}, 'buttons': []}
            data = {**VIEW, 'createdCopyId': 'new-copy', 'archiveLayout': {**state['draft'], 'recordRefs': [{k: r[k] for k in ['id', 'operationId', 'formId', 'copyId']} for r in RECORDS]}}
        elif path == "/dhr-instances/1/summary": data = {"dhr": DHR, "draft": state["draft"], "candidates": RECORDS, "attachments": [], "versions": [state["frozen"]["version"]] if "frozen" in state else [], "sourceScopeHash": "qa-scope"}
        elif path == "/dhr-instances/1/summary/versions/99": data = state["frozen"]
        elif path == '/dhr-reviews': data = {'content': [task], 'totalElements': 1, 'totalPages': 1}
        elif path == '/dhr-reviews/5': data = {**state['frozen'], 'task': task, 'canAct': False, 'buttons': []}
        elif path == "/dhr-instances/1/summary/draft":
            command = route.request.post_data_json
            assert command["revision"] == state["draft"]["revision"]
            assert command["expectedScopeHash"] == "qa-scope"
            state["draft"] = {**command, "id": "20", "revision": command["revision"] + 1}
            state["saves"] += 1
            data = {"id": "20", "revision": state["draft"]["revision"]}
        else: assert route.request.method == "GET", path
        route.fulfill(json={"code": 200, "message": "OK", "data": data})

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
        context = browser.new_context(viewport={"width": 1440, "height": 960})
        context.add_init_script("localStorage.setItem('token','qa');localStorage.setItem('user'," + json.dumps(json.dumps(USER)) + ");")
        context.route("**/api/v1/**", api)
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        out = Path("output/dhr-workspace-navigation")
        out.mkdir(parents=True, exist_ok=True)
        def open_workspace(kind):
            page.goto("http://localhost:3000/dhr-management/" + kind)
            label = {"list": "查看 DHR 档案", "filling": "打开 DHR 填报", "summary": "进入汇总"}[kind]
            page.get_by_role("button", name=label + " DHR-NAV-QA", exact=True).click()
            expect(page.locator("[data-dhr-navigation]")).to_be_visible()
        try:
            for kind in ["list", "filling", "summary"]:
                open_workspace(kind)
                nav = page.locator("[data-dhr-navigation]")
                expect(nav.get_by_text("DHR 导航", exact=True)).to_be_visible()
                assert nav.locator('[data-dhr-navigation-heading]').bounding_box()['height'] <= 44
                expect(page.get_by_role('button', name='数据审计', exact=True)).to_have_count(0)
                expect(nav.get_by_role('button', name='按来源' if kind == 'filling' else '档案目录', exact=True)).to_have_attribute('aria-pressed', 'true')
                nav.get_by_role('button', name='按来源', exact=True).click()
                expect(nav.get_by_role("tab")).to_have_count(3)
                nav.get_by_role("button", name="查看表单 目录记录", exact=True).hover()
                nav.get_by_role("button", name="实例列表 目录记录", exact=True).click()
                instance_icon = nav.get_by_role("button", name="实例列表 目录记录", exact=True)
                expect(instance_icon).to_have_attribute('aria-expanded', 'true')
                expect(instance_icon).to_have_css('color', 'rgb(24, 144, 255)')
                page.get_by_text('DHR 导航', exact=True).hover()
                expect(instance_icon).to_have_css('opacity', '1')
                pane = page.locator("[data-dhr-instances]")
                pane.get_by_role("button", name="查看实例 FR-102", exact=True).click()
                pane.get_by_role("button", name="收起实例列表").click()
                expect(pane).to_have_count(0)
                expect(instance_icon).to_have_attribute('aria-expanded', 'false')
                expect(instance_icon).not_to_have_css('color', 'rgb(24, 144, 255)')
                nav.get_by_role("button", name="实例列表 目录记录").click()
                expect(pane.get_by_role("button", name="查看实例 FR-102")).to_have_css("background-color", "rgb(232, 244, 255)")
                nav.get_by_role("button", name="实例列表 目录记录").click()
                expect(pane).to_have_count(0)
                nav.get_by_role("button", name="实例列表 目录记录").click()
                expect(pane.get_by_role("button", name="查看实例 FR-102")).to_have_css("background-color", "rgb(232, 244, 255)")
                page.screenshot(animations="disabled", path=str(out / (kind + ".png")))
                if kind == "filling":
                    field = page.get_by_role("textbox").last
                    field.fill("未保存值")
                    nav.get_by_role('button', name='档案目录', exact=True).click()
                    expect(field).to_have_value('未保存值')
                    expect(page.get_by_text('当前表单尚未保存', exact=True)).to_have_count(0)
                    nav.get_by_role('button', name='按来源', exact=True).click()
                    nav.get_by_role("button", name="实例列表 目录记录").click()
                    expect(pane).to_have_count(0)
                    expect(field).to_have_value("未保存值")
                    expect(page.get_by_text("当前表单尚未保存", exact=True)).to_have_count(0)
                    nav.get_by_role("button", name="实例列表 目录记录").click()
                    expect(pane).to_be_visible()
                    expect(field).to_have_value("未保存值")
                    nav.get_by_role("tab", name="自定义表单", exact=True).click()
                    expect(page.get_by_text("当前表单尚未保存", exact=True)).to_be_visible()
                    page.get_by_role("button", name="取消", exact=True).click()
                    expect(field).to_have_value("未保存值")
                    nav.get_by_role("tab", name="自定义表单", exact=True).click()
                    page.get_by_role("button", name="放弃修改并继续", exact=True).click()
                    expect(nav.get_by_text("暂无此来源表单")).to_be_visible()
                else:
                    nav.get_by_role("tab", name="作业表单", exact=True).click()
                    icons = nav.get_by_role("button", name="实例列表 作业记录", exact=True)
                    icons.nth(0).click()
                    expect(pane.get_by_role("button", name="查看实例 FR-103", exact=True)).to_be_visible()
                    nav.get_by_role("button", name="查看表单 作业记录", exact=True).nth(1).hover()
                    expect(page.get_by_role("tooltip")).to_have_count(0)
                    icons.nth(1).click()
                    expect(pane.get_by_role("button", name="查看实例 FR-105", exact=True)).to_be_visible()
                    icons.nth(1).click()
                    expect(pane).to_have_count(0)
                    icons.nth(0).click()
                    expect(pane.get_by_role("button", name="查看实例 FR-103", exact=True)).to_be_visible()
                    nav.get_by_role("tab", name="批记录模板", exact=True).click()
                    nav.get_by_role("button", name="实例列表 目录记录").click()
                    pane.get_by_role("button", name="查看实例 FR-102", exact=True).click()
                print("PASS common navigation / retained instance:", kind)
            footer = nav.locator('[data-dhr-navigation-footer]')
            expect(footer.get_by_role('button', name='附件 0')).to_be_enabled()
            footer.get_by_role('button', name='附件 0').click()
            expect(page.locator('[data-dhr-attachments]')).to_be_visible()
            expect(page.locator('[data-dhr-instances]')).to_have_count(0)
            page.get_by_role('button', name='返回表单', exact=True).click()
            expect(page.locator('[data-summary-preview]')).to_contain_text('FR-102')
            nav.locator('[data-dhr-navigation-heading]').get_by_role("button", name="整理目录", exact=True).click()
            sources = page.locator("[data-summary-sources]")
            tree = page.locator("[data-summary-directory]")
            expect(sources).to_be_visible()
            expect(tree.locator('..')).to_have_class(re.compile('MuiCollapse-wrapperInner'))
            expect(tree.locator('../../..')).to_have_class(re.compile('MuiCollapse-entered'))
            expect(page.locator('[data-summary-preview]')).to_contain_text('FR-102')
            expect(footer.get_by_role('button', name='附件 0')).to_be_visible()
            nav.get_by_role('button', name='完成整理', exact=True).click()
            expect(tree).to_have_count(0)
            expect(page.locator('[data-summary-preview]')).to_contain_text('FR-102')
            page.emulate_media(reduced_motion='reduce')
            nav.get_by_role('button', name='整理目录', exact=True).click()
            expect(tree.locator('../../..')).to_have_class(re.compile('MuiCollapse-entered'))
            expect(tree.locator('../../..')).to_have_css('transition-duration', '0s')
            page.emulate_media(reduced_motion='no-preference')
            expect(sources.locator('..')).to_have_css('transform', 'none')
            a, b = sources.bounding_box(), tree.bounding_box()
            assert 0 <= b["x"] - (a["x"] + a["width"]) <= 12
            group = sources.locator("[data-source-key]").filter(has_text="node-a")
            expect(group).to_have_count(1)
            target = tree.locator('[aria-label="插入到 base-dir-10 末尾"]')
            group.locator("[data-source-drag]").drag_to(target)
            with page.expect_response(lambda response: response.url.endswith("/summary/draft") and response.request.method == "PUT"):
                page.get_by_role("button", name="保存草稿", exact=True).click()
            expect(page.get_by_text("草稿已保存", exact=False)).to_be_visible()
            placed = [r for r in state["draft"]["placements"] if r["recordId"] in ["103", "104"]]
            assert len(placed) == 2 and all(r["targetNodeKey"] == "base-dir-10" for r in placed), placed
            expect(group).to_be_visible()
            expect(page.get_by_text("表单实例", exact=True).locator("..")).to_have_text("5表单实例")
            page.screenshot(animations="disabled", path=str(out / "arrange-adjacent.png"))
            page.set_viewport_size({"width": 1024, "height": 768})
            expect(sources).to_be_visible()
            expect(tree).to_be_visible()
            expect(page.locator("[data-summary-preview]")).not_to_be_visible()
            page.screenshot(animations="disabled", path=str(out / "arrange-narrow.png"))
            # Verify actual layout interpolation, not merely a CSS duration declaration.
            for width in [1024, 1100]:
                page.set_viewport_size({'width': width, 'height': 768})
                target_width = width - 260
                for label, opening in [('完成整理', False), ('整理目录', True)]:
                    samples = page.evaluate('''async label => {
                      const button = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === label);
                      const widths = [], start = performance.now(); button.click();
                      await new Promise(resolve => {
                        function frame() {
                          const panel = document.querySelector('.MuiCollapse-root:has([data-summary-directory])');
                          widths.push(panel?.getBoundingClientRect().width ?? 0);
                          if (performance.now() - start < 320) requestAnimationFrame(frame); else resolve();
                        }
                        requestAnimationFrame(frame);
                      });
                      return widths;
                    }''', label)
                    assert len(set(round(w) for w in samples)) >= 4, samples
                    assert any(target_width * .2 < w < target_width * .8 for w in samples), samples
                    if opening:
                        assert samples[0] < target_width * .2 and abs(samples[-1] - target_width) < 2, samples
                    else:
                        assert samples[0] > target_width * .8 and samples[-1] == 0, samples
            page.set_viewport_size({"width": 1440, "height": 960})
            open_workspace("summary")
            expect(nav.get_by_role('button', name='查看表单 作业记录', exact=True)).to_have_count(2)
            expect(nav.get_by_role('button', name='收起目录 自定义表单（0）')).to_be_visible()
            nav.get_by_role('button', name='收起目录 作业表单（1）').click()
            expect(nav.get_by_role('button', name='查看表单 作业记录', exact=True)).to_have_count(1)
            nav.get_by_role('button', name='展开目录 作业表单（1）').click()
            nav.get_by_role('button', name='按来源', exact=True).click()
            page.locator("[data-dhr-navigation]").get_by_role("tab", name="作业表单", exact=True).click()
            expect(page.locator("[data-dhr-form-row]")).to_have_count(2)
            page.get_by_role("button", name="整理目录", exact=True).click()
            expect(tree.get_by_role("button", name="来源表单 作业记录 2 份", exact=True)).to_be_visible()
            group.get_by_role("button", name="展开实例 作业记录", exact=True).click()
            expect(group.locator(".MuiCollapse-entered")).to_be_visible()
            group.locator('[data-source-instance="104"] [data-instance-drag]').drag_to(tree.locator('[aria-label="插入到 base-item-201 之前"]'), source_position={"x": 8, "y": 12})
            with page.expect_response(lambda response: response.url.endswith("/summary/draft") and response.request.method == "PUT"):
                page.get_by_role("button", name="保存草稿", exact=True).click()
            expect(page.get_by_role("button", name="保存草稿", exact=True)).to_be_enabled()
            expect(page.get_by_text("草稿已保存", exact=False)).to_be_visible()
            moved = next(r for r in state["draft"]["placements"] if r["recordId"] == "104")
            assert moved.get("beforeNodeKey") == "base-item-201" and moved["targetNodeKey"] == "base-dir-10", state["draft"]["placements"]
            assert state["saves"] == 2
            nav.get_by_role('button', name='完成整理', exact=True).click()
            expect(nav.get_by_role('button', name='档案目录', exact=True)).to_have_attribute('aria-pressed', 'true')
            expect(nav.get_by_role('button', name='查看表单 作业记录', exact=True)).to_have_count(3)
            for kind in ['list', 'filling']:
                open_workspace(kind)
                nav.get_by_role('button', name='档案目录', exact=True).click()
                expect(nav.get_by_role('button', name='查看表单 作业记录', exact=True)).to_have_count(3)
                nav.get_by_role('button', name='查看表单 作业记录', exact=True).first.click()
                expect(page.get_by_role('textbox').last).to_have_value('104')
                if kind == 'filling':
                    page.get_by_role('textbox').last.fill('跨视图保留')
                nav.get_by_role('button', name='按来源', exact=True).click()
                expect(nav.get_by_role('tab', name='作业表单', exact=True)).to_have_attribute('aria-selected', 'true')
                expect(nav.get_by_role('button', name='查看表单 作业记录', exact=True)).to_have_count(2)
                expect(page.get_by_role('textbox').last).to_have_value('跨视图保留' if kind == 'filling' else '104')
                nav.get_by_role('button', name='档案目录', exact=True).click()
                expect(page.get_by_role('textbox').last).to_have_value('跨视图保留' if kind == 'filling' else '104')
                if kind == 'filling':
                    nav.get_by_role('button', name='查看表单 作业记录', exact=True).nth(1).click()
                    expect(page.get_by_text('当前表单尚未保存', exact=True)).to_be_visible()
                    page.get_by_role('button', name='取消', exact=True).click()
                    expect(page.get_by_role('textbox').last).to_have_value('跨视图保留')
                    page.get_by_role('button', name='追加补录', exact=True).click()
                    page.get_by_role('button', name='放弃修改并继续', exact=True).click()
                    page.get_by_role('textbox', name='实际发生时间').fill('2026-01-01T10:00')
                    page.get_by_role('textbox', name='补录原因').fill('补录导航回归')
                    page.get_by_role('button', name='创建并填写', exact=True).click()
                    expect(nav.get_by_role('button', name='按来源', exact=True)).to_have_attribute('aria-pressed', 'true')
                    expect(page.get_by_role('textbox').last).to_have_value('新增补录')
            print("PASS group/individual placement, source retention, save/reopen, adjacent/narrow layout")
            state["frozen"] = {"dhr": DHR.copy(), "version": {"id": "99", "versionNo": 1, "status": "FORMALIZED", "reviewMode": "NONE", "baseDirectory": DIRECTORY, "overlayDirectories": [], "candidates": json.loads(json.dumps(RECORDS)), "attachments": [], "snapshotHash": "hash"}, "placements": state["draft"]["placements"], "evidenceChanges": []}
            # Real frozen snapshots store definitions without realtime item.records.
            state['frozen']['version']['baseDirectory'] = json.loads(json.dumps(DIRECTORY))
            del state['frozen']['version']['baseDirectory']['directories'][0]['items'][0]['records']
            DHR["summaryStatus"] = "FORMALIZED"
            RECORDS.append(record("106", "WORK", "live-only"))
            page.goto("http://localhost:3000/dhr-management/list")
            page.get_by_role("button", name="查看 DHR 档案 DHR-NAV-QA", exact=True).click()
            nav.get_by_role('button', name='按来源', exact=True).click()
            nav.get_by_role("tab", name="作业表单", exact=True).click()
            expect(page.locator("[data-dhr-form-row]")).to_have_count(2)
            expect(page.get_by_role("button", name="保存草稿", exact=True)).to_have_count(0)
            nav.get_by_role("button", name="档案目录", exact=True).click()
            expect(nav.get_by_role('button', name='查看表单 作业记录', exact=True)).to_have_count(3)
            expect(page.get_by_text("表单实例", exact=True).locator("..")).to_have_text("5表单实例")
            expect(page.locator('[draggable="true"]')).to_have_count(0)
            expect(page.get_by_role("button", name="新增根目录", exact=True)).to_have_count(0)
            page.screenshot(animations="disabled", path=str(out / "frozen.png"))
            print("PASS frozen scope excludes live-only record; archive is read-only")
            page.goto('http://localhost:3000/dhr-management/review')
            page.get_by_role('button', name='查看并审批 DHR-NAV-QA', exact=True).click()
            review_nav = page.locator('[data-dhr-navigation]')
            expect(review_nav.get_by_text('DHR 导航', exact=True)).to_be_visible()
            assert review_nav.locator('[data-dhr-navigation-heading]').bounding_box()['height'] <= 44
            review_nav.get_by_role('button', name='按来源', exact=True).click()
            review_nav.get_by_role('tab', name='作业表单', exact=True).click()
            expect(review_nav.locator('[data-dhr-form-row]')).to_have_count(2)
            review_nav.get_by_role('button', name='查看表单 作业记录', exact=True).first.click()
            expect(page.get_by_role('textbox').last).to_have_value('104')
            review_nav.get_by_role('button', name='实例列表 作业记录', exact=True).first.click()
            expect(review_nav.get_by_role('button', name='实例列表 作业记录', exact=True).first).to_have_attribute('aria-expanded', 'true')
            expect(review_nav.get_by_role('button', name='实例列表 作业记录', exact=True).first).to_have_css('color', 'rgb(24, 144, 255)')
            page.get_by_role('button', name='查看实例 FR-103', exact=True).click()
            expect(page.get_by_role('textbox').last).to_have_value('103')
            review_nav.get_by_role('button', name='档案目录', exact=True).click()
            expect(page.get_by_role('textbox').last).to_have_value('103')
            expect(page.get_by_role('button', name='整理目录', exact=True)).to_have_count(0)
            expect(page.get_by_role('button', name='数据审计', exact=True)).to_have_count(0)
            page.screenshot(animations='disabled', path=str(out / 'review.png'))
            print('PASS review uses compact navigation and frozen records; no summary editing controls')
            DHR['summaryStatus'] = 'DRAFT'
            state['draft']['placements'] = [
                {'recordId': '103', 'targetNodeKey': 'base-dir-10', 'displayName': '首件检查', 'displayOrder': 0},
                {'recordId': '104', 'targetNodeKey': 'base-dir-10', 'displayName': '末件检查', 'displayOrder': 1},
            ]
            open_workspace('summary')
            expect(nav.get_by_role('button', name='查看表单 首件检查', exact=True)).to_be_visible()
            expect(nav.get_by_role('button', name='查看表单 末件检查', exact=True)).to_be_visible()
            nav.get_by_role('button', name='整理目录', exact=True).click()
            expect(tree.locator('[data-summary-record="103"]')).to_have_attribute('aria-label', '来源表单 作业记录 1 份')
            expect(tree.locator('[data-summary-record="104"]')).to_have_attribute('aria-label', '来源表单 作业记录 1 份')
            expect(tree.get_by_text('末件检查', exact=True)).to_be_visible()
            tree.get_by_role('button', name='重命名汇总 作业记录', exact=True).first.click()
            expect(page.get_by_text('将应用于当前相邻的 2 份实例', exact=True)).to_have_count(0)
            page.get_by_role('button', name='取消', exact=True).last.click()
            for kind in ['list', 'filling']:
                open_workspace(kind)
                nav.get_by_role('button', name='档案目录', exact=True).click()
                nav.get_by_role('button', name='查看表单 末件检查', exact=True).click()
                expect(page.get_by_role('textbox').last).to_have_value('104')
                expect(page.get_by_text('末件检查', exact=True)).to_have_count(2)
            state['draft']['placements'] = [
                {'recordId': id, 'targetNodeKey': 'source-work', 'displayOrder': index}
                for index, id in enumerate(['104', '105', '103'])
            ]
            open_workspace('summary')
            before = nav.locator('[data-dhr-form-row]').evaluate_all('(rows) => rows.map(r => r.dataset.dhrFormRow)')
            assert [key for key in before if key in ['record-104', 'record-105', 'record-103']] == ['record-104', 'record-105', 'record-103']
            nav.get_by_role('button', name='整理目录', exact=True).click()
            ordered = tree.locator('[data-summary-record]').evaluate_all('(rows) => rows.map(r => r.dataset.summaryRecord)')
            assert [id for id in ordered if id in ['104', '105', '103']] == ['104', '105', '103'], ordered
            tree.locator('[data-summary-record="104"]').click()
            expect(page.locator('[data-summary-preview]')).to_contain_text('FR-104')
            print('PASS distinct aliases keep action scope; default source interleaving matches archive; preview titles match aliases')
            assert not errors, errors
        except Exception:
            page.screenshot(animations="disabled", path=str(out / "failure.png"))
            print(page.locator("body").inner_text()[-6000:])
            raise
        finally:
            browser.close()

if __name__ == "__main__": main()
