"""Four-list detail/audit interaction checks. Mocked HTTP; no business data writes."""
import json
import os
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright, expect

USER = {"id": 1, "username": "detail-qa", "displayName": "详情测试", "permissions": [
    "dhr.instances.view", "records.dhr-summary", "records.dhr-filling", "records.dhr-review"]}
DHR = {"id": "1", "dhrNo": "DHR-DETAIL-QA", "productionObjectId": "2", "objectNo": "BATCH-QA", "objectType": "BATCH",
       "workOrderNo": "ORDER-QA", "productCode": "P-01", "productName": "测试产品", "status": "COMPLETED",
       "displayStatus": "PENDING_SUMMARY", "productionStatus": "COMPLETED", "summaryStatus": "NOT_STARTED",
       "dhrTemplateName": "批记录模板", "dhrTemplateVersion": "V2.0", "dhrReviewMode": "REQUIRED",
       "createdAt": "2026-09-27T12:00:00", "updatedAt": "2026-09-27T12:01:00", "completedAt": "2026-09-27T12:01:00",
       "directorySnapshot": {"directories": []}, "recordsByOrigin": {"directory": [], "work": [], "custom": []}, "executionHistory": []}
TASK = {"id": "5", "dhrId": "1", "versionId": "8", "dhrNo": DHR["dhrNo"], "versionNo": 2,
        "objectNo": "BATCH-QA", "workOrderNo": "ORDER-QA", "productName": "测试产品", "nodeName": "质量审批",
        "status": "PENDING", "submittedBy": "提交人", "submittedAt": "2026-09-27T12:00:00"}
EVENT = {"id": "9", "entityType": "DHR_SUMMARY_VERSION", "action": "CREATE", "functionName": "提交汇总", "operator": "测试员",
         "at": "2026-09-27T12:10:00", "reason": "核查完成", "before": None,
         "after": json.dumps({"versionNo": 2, "status": "PENDING_REVIEW", "placements": [{"recordId": "11", "displayName": "归档名称"}]})}

def main():
    state = {"empty": False, "fail": False, "detail_fail": False, "audit_requests": [], "writes": []}
    def reply(route, data, code=200):
        route.fulfill(status=code, json={"code": code, "message": "测试错误" if code != 200 else "OK", "data": data})
    def api(route):
        req = route.request
        path = urlparse(req.url).path.removeprefix("/api/v1")
        if req.method != "GET":
            state["writes"].append(path)
            return reply(route, None, 400)
        if path == "/auth/me": return reply(route, USER)
        if path == "/system/menu-configuration": return reply(route, {"modules": [], "configured": False})
        if path.startswith("/system/settings"): return reply(route, {"systemName": "DHR QA"})
        if path in ["/dhr-instances", "/dhr-filling", "/dhr-instances/summary-list"]:
            return reply(route, {"content": [DHR], "totalElements": 1, "totalPages": 1})
        if path == "/dhr-reviews": return reply(route, {"content": [TASK], "totalElements": 1, "totalPages": 1})
        if path.endswith("/audit"):
            page_no = int(parse_qs(urlparse(req.url).query).get("page", ["0"])[0])
            state["audit_requests"].append((path, page_no))
            return reply(route, {"events": [] if state["empty"] else [{**EVENT, "id": str(page_no + 9)}],
                                 "total": 0 if state["empty"] else 51, "page": page_no}, 500 if state["fail"] else 200)
        if path in ["/dhr-instances/1", "/dhr-instances/1/summary/detail", "/dhr-filling/1/detail"]:
            return reply(route, DHR, 500 if state["detail_fail"] else 200)
        if path == "/dhr-reviews/5":
            return reply(route, {"dhr": DHR, "task": TASK, "version": {"id": "8", "versionNo": 2, "attachments": [], "candidates": [], "baseDirectory": {"directories": []}, "overlayDirectories": []}, "placements": [], "buttons": [], "canAct": False, "evidenceChanges": []})
        if path == "/dhr-filling/1": return reply(route, {"objectStatus": "COMPLETED", "directorySnapshot": {"directories": []}, "snapshot": {"operations": []}, "state": {"operations": {}, "history": []}, "availability": {}})
        # Workspace fetching is deliberately failed, so this test cannot submit/edit evidence.
        if path == "/dhr-instances/1/summary": return reply(route, None, 400)
        return reply(route, {"content": [], "totalElements": 0, "totalPages": 0})

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path=os.environ.get("CHROME_PATH", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"))
        context = browser.new_context(viewport={"width": 1440, "height": 960})
        context.add_init_script("localStorage.setItem('token','isolated-qa');localStorage.setItem('user'," + json.dumps(json.dumps(USER)) + ");")
        context.route("**/api/v1/**", api)
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        base = os.environ.get("DHR_QA_URL", "http://localhost:3000")
        out = Path(os.environ.get("DHR_QA_OUTPUT", "/Users/ivenwang/Documents/edhr-nexus/output/dhr-list-detail"))
        out.mkdir(parents=True, exist_ok=True)
        drawer = page.get_by_role("dialog", name="DHR 详情 DHR-DETAIL-QA", exact=True)
        def close():
            drawer.get_by_role("button", name="关闭 DHR 详情").click()
            expect(drawer).to_have_count(0)
        for source, audit_path in [("list", "/dhr-instances/1/summary/audit"), ("filling", "/dhr-filling/1/audit"), ("summary", "/dhr-instances/1/summary/audit"), ("review", "/dhr-reviews/5/audit")]:
            page.goto(f"{base}/dhr-management/{source}")
            page.wait_for_load_state("networkidle")
            row = page.get_by_role("row", name="查看 DHR-DETAIL-QA 详情", exact=True)
            row.click(position={"x": 35, "y": 20})
            expect(drawer.get_by_text("生产来源", exact=True)).to_be_visible()
            assert drawer.bounding_box()["width"] == 560
            drawer.get_by_role("tab", name="数据审计", exact=True).click()
            expect(drawer.get_by_text("共 51 条 · 第 1 页", exact=True)).to_be_visible()
            assert state["audit_requests"][-1] == (audit_path, 0)
            drawer.get_by_role("button", name="提交汇总", exact=False).click()
            expect(drawer.get_by_text("汇总版本号", exact=True)).to_be_visible()
            expect(drawer.get_by_text("归档名称", exact=True)).to_be_visible()
            if source == "review": expect(drawer.get_by_text("当前审批版本的提交", exact=False)).to_be_visible()
            page.screenshot(path=str(out / f"{source}-audit.png"), animations="disabled")
            drawer.get_by_role("button", name="下一页").click()
            expect(drawer.get_by_text("共 51 条 · 第 2 页", exact=True)).to_be_visible()
            expect(drawer.get_by_role("button", name="下一页")).to_be_disabled()
            close()
            row.focus(); row.press("Enter")
            expect(drawer.get_by_role("tab", name="数据信息")).to_have_attribute("aria-selected", "true")
            close()
            row.focus(); row.press("Space")
            expect(drawer.get_by_text("生产来源", exact=True)).to_be_visible()
            close()
            # Independent operation buttons must never open the standard row drawer.
            button = row.get_by_role("button").last
            button.focus(); button.press("Enter")
            expect(page.get_by_role("dialog").first).to_be_visible()
            expect(drawer).to_have_count(0)
            page.reload(); page.wait_for_load_state("networkidle")
            row.get_by_role("button").last.click()
            expect(page.get_by_role("dialog").first).to_be_visible()
            expect(drawer).to_have_count(0)
            print(f"PASS {source}: row/pointer/keyboard, drawer tabs, audit scope/page, action isolation")

        page.goto(base + "/dhr-management/list"); page.wait_for_load_state("networkidle")
        row = page.get_by_role("row", name="查看 DHR-DETAIL-QA 详情", exact=True)
        state["detail_fail"] = True
        row.click(position={"x": 35, "y": 20})
        expect(drawer.get_by_text("DHR 详情加载失败，请重试。", exact=True)).to_be_visible(timeout=15000)
        state["detail_fail"] = False
        drawer.get_by_role("button", name="重试").click()
        expect(drawer.get_by_text("生产来源", exact=True)).to_be_visible()
        state["fail"] = True
        drawer.get_by_role("tab", name="数据审计").click()
        expect(drawer.get_by_text("数据审计加载失败，请重试。", exact=True)).to_be_visible(timeout=15000)
        state["fail"] = False; state["empty"] = True
        drawer.get_by_role("button", name="重试").click()
        expect(drawer.get_by_text("暂无审计记录", exact=True)).to_be_visible()
        close()
        page.set_viewport_size({"width": 390, "height": 844})
        row.click(position={"x": 35, "y": 20})
        expect(drawer.get_by_text("生产来源", exact=True)).to_be_visible()
        assert drawer.bounding_box()["width"] == 390
        page.screenshot(path=str(out / "mobile-detail.png"), animations="disabled")
        assert not state["writes"], state["writes"]
        assert not errors, errors
        print("PASS detail/audit retry, empty state, mobile width, no writes or JS errors")
        browser.close()

if __name__ == "__main__": main()
