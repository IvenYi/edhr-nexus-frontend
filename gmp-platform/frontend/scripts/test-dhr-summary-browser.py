"""Real UI, isolated mock HTTP boundary. No requests are sent to the business API.

Run with Python Playwright installed and the local Vite server on port 3000.
Uses a disposable headless Chrome profile, never the user's browser session.
"""
import copy
import json
import os
import re
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright, expect


DIRECTORY_ID = "377634999500804097"
USER = {"id": 1, "username": "dhr-qa", "displayName": "DHR 隔离测试", "permissions": [
    "records.dhr-summary", "dhr.summaries.edit", "dhr.summaries.submit", "dhr.instances.view"]}
DHR = {"id": "1", "dhrNo": "DHR-ISOLATED-QA", "objectNo": "QA-BATCH", "objectType": "BATCH",
       "workOrderNo": "QA-ORDER", "productCode": "QA", "productName": "隔离测试产品", "status": "COMPLETED",
       "summaryStatus": "DRAFT", "dhrReviewMode": "NONE", "completedAt": "2026-09-23T00:00:00",
       "directorySnapshot": {"directories": [{"id": DIRECTORY_ID, "parentId": None, "name": "生产记录", "items": []}]}}
RECORD = {"id": "101", "instanceNo": "FR-QA-101", "templateName": "候选作业记录", "templateVersion": "V1",
          "originKind": "WORK", "status": "COMPLETED", "copyId": "copy-1", "operationName": "工序一",
          "snapshot": {"name": "候选作业记录", "fields": []}, "fieldValues": {}}


def main():
    state = {"dhr": copy.deepcopy(DHR), "draft": {"id": "10", "revision": 1, "overlayDirectories": [], "placements": []},
             "versions": [], "failSubmit": True, "requests": [], "saved": [], "held": None, "holdSave": False}

    def respond(route, data, code=200, message="OK"):
        route.fulfill(status=code, json={"code": code, "message": message, "data": data})

    def api(route):
        request = route.request
        url = urlparse(request.url)
        path = url.path.removeprefix("/api/v1")
        method = request.method
        state["requests"].append((method, path))
        if path == "/auth/me":
            respond(route, USER)
        elif path == "/system/menu-configuration":
            respond(route, {"modules": [], "configured": False})
        elif path.startswith("/system/settings"):
            respond(route, {"systemName": "DHR 隔离测试", "browserTitle": "DHR QA"})
        elif path == "/dhr-instances/summary-list":
            submitted = parse_qs(url.query).get("summaryStatus") == ["SUBMITTED_GROUP"]
            rows = [state["dhr"]] if submitted == bool(state["versions"]) else []
            respond(route, {"content": rows, "totalElements": len(rows), "totalPages": 1, "page": 0, "size": 20})
        elif path == "/dhr-instances/1/summary":
            respond(route, {"dhr": state["dhr"], "draft": state["draft"], "candidates": [RECORD], "versions": state["versions"]})
        elif path == "/dhr-instances/1/summary/draft":
            if state["holdSave"]:
                state["held"] = route
                return
            save(route)
        elif path == "/dhr-instances/1/summary/submit":
            assert request.post_data_json["expectedDraftId"] == state["draft"]["id"]
            if request.post_data_json["expectedRevision"] != state["draft"]["revision"]:
                respond(route, None, 400, "修订号冲突")
            elif state["failSubmit"]:
                state["failSubmit"] = False
                respond(route, None, 400, "测试：必填目录缺少已完成记录")
            else:
                version = {"id": "99", "versionNo": 1, "status": "FORMALIZED", "reviewMode": "NONE", "snapshotHash": "qa-hash",
                           "baseDirectory": copy.deepcopy(state["dhr"]["directorySnapshot"]),
                           "overlayDirectories": copy.deepcopy(state["draft"]["overlayDirectories"]), "candidates": [RECORD]}
                state["placements"] = copy.deepcopy(state["draft"]["placements"])
                state["versions"] = [version]
                state["draft"] = None
                state["dhr"]["summaryStatus"] = "FORMALIZED"
                respond(route, version)
        elif path == "/dhr-instances/1/summary/versions/99":
            respond(route, {"dhr": state["dhr"], "version": state["versions"][0], "placements": state["placements"]})
        else:
            # Block ALL other API access, including unanticipated writes.
            if method != "GET":
                raise AssertionError(f"Unexpected write {method} {path}")
            respond(route, {"content": [], "totalElements": 0, "totalPages": 0})

    def save(route):
        command = route.request.post_data_json
        assert command["draftId"] == state["draft"]["id"]
        if command.get("revision") != state["draft"]["revision"]:
            respond(route, None, 400, "修订号冲突")
            return
        state["saved"].append(copy.deepcopy(command))
        state["draft"] = {**command, "id": "10", "revision": command["revision"] + 1}
        respond(route, {"id": "10", "revision": state["draft"]["revision"]})

    with sync_playwright() as p:
        executable = os.environ.get("CHROME_PATH", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
        browser = p.chromium.launch(headless=True, executable_path=executable)
        context = browser.new_context(viewport={"width": 1600, "height": 1000})
        context.add_init_script("localStorage.setItem('token','isolated-qa');localStorage.setItem('user'," + json.dumps(json.dumps(USER)) + ");")
        context.route("**/api/v1/**", api)
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(os.environ.get("DHR_QA_URL", "http://localhost:3000/dhr-management/summary"))
        page.wait_for_load_state("networkidle")
        if os.environ.get("DHR_QA_INSPECT"):
            print(page.locator("body").inner_text())
            print(page.get_by_role("button").all_text_contents())
            browser.close()
            return

        page.get_by_role("button", name="进入汇总 DHR-ISOLATED-QA").click()
        page.get_by_role("button", name="新增一级目录").click()
        expect(page.get_by_label("目录名称", exact=True)).to_be_visible()
        page.get_by_label("目录名称", exact=True).fill("附录一")
        page.get_by_role("button", name="确定", exact=True).click()
        page.get_by_role("button", name="保存草稿", exact=True).click()
        expect(page.get_by_text("汇总草稿已保存", exact=True)).to_be_visible()
        page.mouse.move(100, 900)
        expect(page.locator(".MuiSnackbar-root")).to_be_hidden(timeout=6000)
        assert state["saved"][-1]["overlayDirectories"][0]["parentKey"] == "base-dir-" + DIRECTORY_ID
        page.get_by_role("button", name="关闭", exact=True).click()
        page.get_by_role("button", name="进入汇总 DHR-ISOLATED-QA").click()
        expect(page.get_by_role("button", name="附录一", exact=True)).to_be_visible()
        print("PASS save -> immediate reopen keeps latest draft and exact long ID")

        # A remote draft revision must not silently erase unsaved local edits.
        page.get_by_role("button", name="新增一级目录").click()
        page.get_by_label("目录名称", exact=True).fill("本地未保存")
        page.get_by_role("button", name="确定", exact=True).click()
        state["draft"]["revision"] += 1
        page.evaluate("window.dispatchEvent(new Event('offline'));window.dispatchEvent(new Event('online'))")
        expect(page.get_by_text("草稿已在其他操作中更新。", exact=False)).to_be_visible()
        expect(page.get_by_role("button", name="本地未保存", exact=True)).to_be_visible()
        expect(page.get_by_role("button", name="保存草稿", exact=True)).to_be_disabled()
        page.get_by_role("button", name="重新载入", exact=True).click()
        page.get_by_role("button", name="保留本地编辑", exact=True).click()
        expect(page.get_by_role("button", name="本地未保存", exact=True)).to_be_visible()
        page.get_by_role("button", name="重新载入", exact=True).click()
        page.get_by_role("button", name="确认重新载入", exact=True).click()
        expect(page.get_by_role("button", name="本地未保存", exact=True)).to_have_count(0)
        expect(page.get_by_role("button", name="保存草稿", exact=True)).to_be_enabled()
        print("PASS remote refresh preserves edits; explicit reload requires confirmation")

        # Verify mutual exclusion while the save HTTP request is genuinely in flight.
        state["holdSave"] = True
        page.get_by_role("button", name="保存草稿", exact=True).click()
        expect(page.get_by_role("button", name="提交汇总", exact=True)).to_be_disabled()
        expect(page.get_by_role("button", name="新增一级目录")).to_be_disabled()
        expect(page.get_by_role("button", name="关闭", exact=True)).to_be_disabled()
        page.wait_for_timeout(100)
        assert state["held"] is not None
        state["holdSave"] = False
        save(state["held"])
        expect(page.get_by_role("button", name="提交汇总", exact=True)).to_be_enabled()
        page.mouse.move(100, 900)
        expect(page.locator(".MuiSnackbar-root")).to_be_hidden(timeout=6000)
        print("PASS pending write locks concurrent submit/edit/close")

        page.get_by_role("button", name="提交汇总", exact=True).click()
        expect(page.get_by_text("测试：必填目录缺少已完成记录", exact=True)).to_be_visible()
        page.mouse.move(100, 900)
        expect(page.locator(".MuiSnackbar-root")).to_be_hidden(timeout=6000)
        expect(page.get_by_role("button", name="提交汇总", exact=True)).to_be_enabled()
        page.get_by_role("button", name="提交汇总", exact=True).click()
        expect(page.get_by_role("dialog")).to_have_count(0)
        assert len(state["versions"]) == 1
        page.get_by_role("combobox", name="汇总状态").click()
        page.get_by_role("option", name="已提交", exact=True).click()
        page.get_by_role("button", name="查看冻结版本 DHR-ISOLATED-QA").click()
        expect(page.get_by_text("DHR 汇总详情 V1", exact=True)).to_be_visible()
        expect(page.get_by_role("button", name="附录一", exact=True)).to_be_visible()
        expect(page.get_by_role("button", name="提交汇总", exact=True)).to_have_count(0)
        print("PASS submit failure retry + immediate frozen version view")
        assert not errors, errors
        print("PASS no uncaught browser errors; all business API calls intercepted")
        browser.close()


if __name__ == "__main__":
    main()
