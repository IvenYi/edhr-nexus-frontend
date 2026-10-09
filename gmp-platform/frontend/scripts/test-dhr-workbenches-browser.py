"""Isolated UI checks: all business HTTP is mocked; no development data writes."""
import copy
import json
import os
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright, expect

USER = {"id": 1, "username": "dhr-qa", "displayName": "隔离测试", "permissions": [
    "records.dhr-filling", "dhr.filling.act", "dhr.filling.supplement", "records.dhr-review", "dhr.reviews.act"]}
DHR = {"id": "1", "productionObjectId": "2", "dhrNo": "DHR-UI-QA", "objectNo": "BATCH-QA", "objectType": "BATCH",
       "workOrderNo": "ORDER-QA", "productName": "测试产品", "status": "COMPLETED", "productionStatus": "COMPLETED", "displayStatus": "FINALIZED", "summaryStatus": "FORMALIZED"}
DIRECTORY = {"directories": [{"id": "10", "parentId": None, "name": "生产记录", "items": []},
                            {"id": "11", "parentId": "10", "name": "包装工序", "items": [{"id": "20", "displayName": "包装检查", "records": []}]}]}
FORM = {"id": "f", "versionId": "100", "name": "包装检查", "version": "V1", "code": "F1", "dhrItemId": "20", "model": "{}", "canvas": "{}", "fields": []}
VIEW = {"objectStatus": "COMPLETED", "dhrSummaryStatus": "FORMALIZED", "revision": 1, "directorySnapshot": DIRECTORY,
        "snapshot": {"context": {}, "operations": [{"id": "op", "name": "包装", "forms": [FORM], "works": [], "documents": []}]},
        "state": {"operations": {"op": {"status": "COMPLETED", "forms": {
            "copy1": {"status": "COMPLETED", "instanceNo": "FR-1", "values": {}},
            "copy2": {"status": "COMPLETED", "instanceNo": "FR-2", "values": {}}}, "works": {}}}, "history": []},
        "availability": {"op": {"forms": {}, "formCopies": {"f": {"instanceIds": ["copy1", "copy2"], "instances": {
            "copy1": {"canAct": False, "permissions": {}, "buttons": []}, "copy2": {"canAct": False, "permissions": {}, "buttons": []}}}}}}}
TASK = {"id": "5", "dhrId": "1", "versionId": "8", "dhrNo": "DHR-UI-QA", "versionNo": 1, "objectNo": "BATCH-QA",
        "workOrderNo": "ORDER-QA", "productName": "测试产品", "nodeName": "质量审核", "submittedBy": "提交人", "status": "PENDING", "snapshotHash": "frozen-hash"}
RECORD = {"id": "10", "instanceNo": "FR-1", "templateName": "包装检查", "templateVersion": "V1", "originKind": "DIRECTORY",
          "status": "COMPLETED", "snapshot": FORM, "fieldValues": {}}
WORK_RECORDS = [
    {**RECORD, "id": "11", "instanceNo": "FR-2", "templateName": "作业记录", "originKind": "WORK"},
    {**RECORD, "id": "12", "instanceNo": "FR-3", "templateName": "作业记录", "originKind": "WORK"},
]

def main():
    state = {"view": copy.deepcopy(VIEW), "dhr": copy.deepcopy(DHR), "queries": [], "affected": False, "acted": [], "held": None, "hold": False}
    def reply(route, data, code=200, message="OK"):
        route.fulfill(status=code, json={"code": code, "message": message, "data": data})
    def api(route):
        req = route.request
        path = urlparse(req.url).path.removeprefix("/api/v1")
        if path == "/auth/me": reply(route, USER)
        elif path == "/system/menu-configuration": reply(route, {"modules": [], "configured": False})
        elif path.startswith("/system/settings"): reply(route, {"systemName": "DHR QA", "browserTitle": "DHR QA"})
        elif path == "/dhr-filling":
            state["queries"].append(parse_qs(urlparse(req.url).query))
            reply(route, {"content": [state["dhr"]], "totalElements": 1, "totalPages": 1})
        elif path == "/dhr-filling/1": reply(route, state["view"])
        elif path == "/dhr-filling/1/supplements":
            command = req.post_data_json
            assert command["reason"].strip() and command["occurredAt"] and command["revision"] == 1
            state["view"]["revision"] = 2
            state["view"]["state"]["operations"]["op"]["forms"]["new"] = {"status": "DRAFT", "values": {}}
            group = state["view"]["availability"]["op"]["formCopies"]["f"]
            group["instanceIds"].append("new")
            group["instances"]["new"] = {"canAct": True, "permissions": {}, "buttons": [{"action": "SUBMIT", "label": "提交", "requireOpinion": True}]}
            reply(route, {**state["view"], "createdCopyId": "new"})
        elif path == "/dhr-filling/1/actions":
            assert req.post_data_json["instanceId"] == "new" and req.post_data_json["revision"] == 2
            reply(route, None, 400, "测试：执行记录已更新，请保留修改")
        elif path == "/dhr-reviews": reply(route, {"content": [TASK], "totalElements": 1, "totalPages": 1})
        elif path == "/dhr-reviews/5":
            reply(route, {"dhr": DHR, "task": TASK, "canAct": True,
                "version": {"id": "8", "versionNo": 1, "baseDirectory": DIRECTORY, "overlayDirectories": [], "candidates": [RECORD, *WORK_RECORDS]},
                "placements": [{"recordId": "10", "targetNodeKey": "base-item-20"},
                               {"recordId": "11", "targetNodeKey": "base-dir-11", "beforeNodeKey": "base-item-20", "displayOrder": 1, "displayName": "归档文档 A"},
                               {"recordId": "12", "targetNodeKey": "base-dir-11", "beforeNodeKey": "base-item-20", "displayOrder": 0, "displayName": "归档文档 B"}],
                "buttons": [{"action": "APPROVE", "label": "审核通过", "requiresSignature": True}, {"action": "RETURN", "label": "退回整理", "requireOpinion": True, "style": "DANGER"}],
                "evidenceChanges": [{"recordId": "10", "instanceNo": "FR-1", "message": "表单已更正"}] if state["affected"] else []})
        elif path == "/dhr-reviews/5/actions":
            state["acted"].append(req.post_data_json)
            assert req.post_data_json["expectedSnapshotHash"] == "frozen-hash"
            if state["hold"]: state["held"] = route
            else: reply(route, {})
        elif req.method == "GET": reply(route, {"content": [], "totalElements": 0, "totalPages": 0})
        else: raise AssertionError(f"Unexpected write: {req.method} {path}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path=os.environ.get("CHROME_PATH", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"))
        context = browser.new_context(viewport={"width": 1440, "height": 960})
        context.add_init_script("localStorage.setItem('token','isolated-qa');localStorage.setItem('user'," + json.dumps(json.dumps(USER)) + ");")
        context.route("**/api/v1/**", api)
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        base = os.environ.get("DHR_QA_URL", "http://localhost:3000")
        page.goto(base + "/dhr-management/filling")
        page.wait_for_load_state("networkidle")
        page.get_by_role("button", name="打开 DHR 填报 DHR-UI-QA").click()
        expect(page.get_by_text("生产记录", exact=True)).to_be_visible()
        expect(page.get_by_text("包装工序", exact=True)).to_be_visible()
        expect(page.get_by_label("表单实例", exact=True)).to_have_count(0)
        page.get_by_role("button", name="切换实例", exact=True).click()
        page.get_by_label("表单实例", exact=True).click()
        page.get_by_role("option", name="第 2 份 · FR-2").click()
        expect(page.get_by_text("FR-2 ·", exact=False)).to_be_visible()
        page.get_by_role("button", name="切换实例", exact=True).click()
        expect(page.get_by_label("表单实例", exact=True)).to_have_count(0)
        page.screenshot(path="/Users/ivenwang/Documents/edhr-nexus/output/dhr-filling-workbench-qa.png")
        print("PASS actual directory hierarchy and collapsed multi-instance switch")

        page.get_by_role("button", name="追加补录", exact=True).click()
        expect(page.get_by_role("button", name="创建并填写")).to_be_disabled()
        page.get_by_label("补录原因", exact=False).fill("遗漏的实际记录")
        page.get_by_label("实际发生时间", exact=False).fill("2026-01-01T10:00")
        page.get_by_role("button", name="创建并填写").click()
        expect(page.get_by_role("button", name="提交", exact=True)).to_be_enabled()
        page.get_by_role("button", name="提交", exact=True).click()
        expect(page.get_by_role("button", name="确认", exact=True)).to_be_disabled()
        page.get_by_label("操作意见", exact=False).fill("核对后提交")
        page.get_by_role("button", name="确认", exact=True).click()
        expect(page.get_by_text("测试：执行记录已更新，请保留修改", exact=True)).to_be_visible()
        expect(page.get_by_label("操作意见", exact=False)).to_have_value("核对后提交")
        print("PASS supplement reason/time, new-copy selection, conflict retains input")

        state["view"] = copy.deepcopy(VIEW)
        state["view"]["objectStatus"] = "EARLY_TERMINATED"
        state["view"]["orderStatus"] = "EARLY_TERMINATED"
        state["view"]["state"]["operations"]["op"]["forms"]["copy1"]["status"] = "ACTIVE"
        state["dhr"].update(status="IN_PROGRESS", productionStatus="EARLY_TERMINATED", displayStatus="TERMINATED")
        page.reload()
        page.wait_for_load_state("networkidle")
        expect(page.get_by_role("cell", name="已终止", exact=True)).to_be_visible()
        expect(page.get_by_role("cell", name="生产中", exact=True)).to_have_count(0)
        page.get_by_label("DHR 状态", exact=True).click()
        page.get_by_role("option", name="已终止", exact=True).click()
        page.get_by_role("button", name="查询", exact=True).click()
        page.wait_for_load_state("networkidle")
        assert state["queries"][-1]["displayStatus"] == ["TERMINATED"]
        assert "status" not in state["queries"][-1]
        entry_button = page.get_by_role("button", name="查看已终止 DHR DHR-UI-QA")
        expect(entry_button.locator('[data-testid="PreviewOutlinedIcon"]')).to_be_visible()
        entry_button.click()
        expect(page.get_by_role("alert")).to_contain_text("批次已提前结束，DHR 已终止，仅可查阅已保存记录。")
        expect(page.get_by_text("只读查阅 · 生产已提前结束", exact=True)).to_be_visible()
        for name in ["追加补录", "提交", "保存", "审批"]:
            expect(page.get_by_role("button", name=name, exact=True)).to_have_count(0)
        expect(page.locator('.MuiDialog-container')).to_have_css('opacity', '1')
        page.screenshot(path="/Users/ivenwang/Documents/edhr-nexus/output/dhr-filling-terminated-qa.png", animations="disabled")
        page.locator('.MuiDialogActions-root').get_by_role("button", name="关闭", exact=True).click()
        page.get_by_role("button", name="重置", exact=True).click()
        page.wait_for_load_state("networkidle")
        assert state["queries"][-1]["displayStatus"] == ["FILLING"]
        print("PASS real production status projection, query/reset, filling icon and termination read-only notice")

        page.goto(base + "/dhr-management/review")
        page.wait_for_load_state("networkidle")
        page.get_by_role("button", name="查看并审批 DHR-UI-QA").click()
        expect(page.get_by_text("汇总目录", exact=True)).to_be_visible()
        assert page.locator("[data-review-record]").evaluate_all("rows => rows.map(row => row.getAttribute('data-review-record'))") == ["12", "11", "10"]
        page.locator('[data-review-record="11"]').click()
        expect(page.get_by_text("归档文档 A · FR-2", exact=True)).to_be_visible()
        print("PASS frozen archive order, per-instance name and review navigation")
        page.get_by_role("button", name="审核通过并签署", exact=True).click()
        expect(page.get_by_role("button", name="确认", exact=True)).to_be_disabled()
        page.get_by_label("当前账号", exact=True).fill("reviewer")
        page.get_by_label("账户密码", exact=True).fill("isolated-test-password")
        state["hold"] = True
        page.get_by_role("button", name="确认", exact=True).click()
        expect(page.get_by_role("button", name="处理中…", exact=True)).to_be_disabled()
        expect(page.get_by_role("button", name="取消", exact=True)).to_be_disabled()
        assert len(state["acted"]) == 1 and state["held"] is not None
        reply(state["held"], {})
        expect(page.get_by_role("dialog", name="DHR-UI-QA · 汇总 V1")).to_have_count(0)
        print("PASS configured signing and in-flight action mutex")

        state["affected"] = True
        state["hold"] = False
        page.get_by_role("button", name="查看并审批 DHR-UI-QA").click()
        expect(page.get_by_text("FR-1：表单已更正", exact=True)).to_be_visible()
        expect(page.get_by_role("button", name="审核通过并签署", exact=True)).to_have_count(0)
        expect(page.locator('.MuiDialog-container')).to_have_css('opacity', '1')
        page.screenshot(path="/Users/ivenwang/Documents/edhr-nexus/output/dhr-review-workbench-qa.png", animations="disabled")
        page.get_by_role("button", name="退回整理", exact=True).click()
        expect(page.get_by_label("操作意见", exact=False)).to_have_value("已纳入表单发生变化：FR-1。请重新整理并提交新汇总版本。")
        page.get_by_role("button", name="确认", exact=True).click()
        expect(page.get_by_role("dialog", name="DHR-UI-QA · 汇总 V1")).to_have_count(0)
        assert state["acted"][-1]["action"] == "RETURN"
        assert not errors, errors
        print("PASS affected evidence notification, blocked approval and explicit human return")
        browser.close()

if __name__ == "__main__": main()
