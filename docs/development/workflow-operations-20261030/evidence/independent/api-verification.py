"""Independent HTTP/DB probe. Only the named, disposable QA database and loopback QA server are used."""
import json
import subprocess
import urllib.error
import urllib.request
from pathlib import Path

BASE = "http://127.0.0.1:8108/api/v1"
DATABASE = "edhr_record_control_test_ops_quality_20261030"
OUTPUT = Path(__file__).with_name("api-verification.json")
checks = []

def sql(statement):
    return subprocess.check_output(["psql", "-d", DATABASE, "-Atc", statement], text=True).strip()

def http(method, path, token=None, payload=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = "Bearer " + token
    request = urllib.request.Request(BASE + path, headers=headers, method=method,
        data=None if payload is None else json.dumps(payload).encode())
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            return response.status, json.load(response)
    except urllib.error.HTTPError as error:
        return error.code, json.load(error)

def check(name, condition, evidence):
    checks.append({"name": name, "passed": bool(condition), "evidence": evidence})
    if not condition:
        raise AssertionError(name)

def login(username):
    status, body = http("POST", "/auth/login", payload={"username": username, "password": "test-signature-password"})
    assert status == 200 and body["data"]["token"]
    return body["data"]["token"]

def execute():
    request_id, instance_id = sql("SELECT id,workflow_instance_id FROM record_control_request WHERE status='IN_REVIEW'").split("|")
    task_id = sql(f"SELECT id FROM workflow_task WHERE status='PENDING' AND instance_id={instance_id}")
    request_no = sql(f"SELECT request_no FROM record_control_request WHERE id={request_id}")
    tokens = {name: login(name) for name in ["rc-applicant", "rc-reviewer", "qa-target", "qa-manager", "qa-viewer"]}
    manager, viewer = tokens["qa-manager"], tokens["qa-viewer"]
    check("anonymous-query-rejected", http("GET", "/workflow/operations/instances")[0] == 401, "HTTP 401")
    status, result = http("GET", "/workflow/operations/instances?keyword=" + request_no, viewer)
    check("unrelated-viewer-filtered-before-count", status == 200 and result["data"]["totalElements"] == 0, {"http": status, "count": result.get("data", {}).get("totalElements")})
    check("unrelated-viewer-cannot-read-active-detail", http("GET", "/workflow/operations/instances/" + instance_id, viewer)[0] != 200, "Active application detail denied")
    check("unrelated-viewer-cannot-query-reassignment-targets", http("GET", f"/workflow/operations/tasks/{task_id}/reassignment-targets", viewer)[0] == 403, "HTTP 403")
    status, detail = http("GET", "/workflow/operations/instances/" + instance_id, manager)
    check("intervention-role-can-read-current-task", status == 200 and detail["data"]["tasks"][0]["id"] == task_id, "Current task is included")
    command = {"targetUserId": "43", "reason": "QA管理调整", "expectedTaskState": detail["data"]["tasks"][0]["taskState"], "account": "qa-manager", "password": "test-signature-password"}
    signature_count = sql("SELECT count(*) FROM signature")
    check("session-without-intervention-permission-rejected", http("POST", f"/workflow/operations/tasks/{task_id}/reassign", viewer, command)[0] == 403, "HTTP 403 despite valid signer credentials")
    bad_command = dict(command, password="invalid-qa-password")
    check("invalid-signature-rejected-without-mutation", http("POST", f"/workflow/operations/tasks/{task_id}/reassign", manager, bad_command)[0] != 200 and sql("SELECT count(*) FROM signature") == signature_count and sql(f"SELECT assignee_id FROM workflow_task WHERE id={task_id}") == "42", "No signature or task mutation")

    status, context = http("GET", f"/workflow/operations/tasks/{task_id}/transfer-context", tokens["rc-reviewer"])
    check("frozen-node-requires-transfer-signature", status == 200 and context["data"]["signatureRequired"] is True, context["data"]["signatureRequired"])
    transfer = {"targetUserId": "43", "reason": "QA签署转办", "expectedTaskState": context["data"]["taskState"], "account": "rc-reviewer", "password": "test-signature-password"}
    check("signed-transfer-succeeds", http("POST", f"/record-control/workflow-tasks/{task_id}/transfer", tokens["rc-reviewer"], transfer)[0] == 200 and sql(f"SELECT assignee_id FROM workflow_task WHERE id={task_id}") == "43", "Current responsibility changed to 43")
    check("transfer-signature-binds-request-and-action", sql(f"SELECT count(*) FROM signature WHERE target_type='RECORD_CONTROL_REQUEST' AND target_id='{request_id}' AND meaning LIKE 'TRANSFER%'") == "1", "One TRANSFER signature targets the application")
    check("stale-transfer-replay-rejected", http("POST", f"/record-control/workflow-tasks/{task_id}/transfer", tokens["rc-reviewer"], transfer)[0] != 200, "Stale task state denied")
    status, old_queue = http("GET", "/record-control/workflow-tasks?scope=todo&page=0&size=20", tokens["rc-reviewer"])
    status2, new_queue = http("GET", "/record-control/workflow-tasks?scope=todo&page=0&size=20", tokens["qa-target"])
    check("transfer-moves-todo-to-current-user-only", status == 200 and status2 == 200 and old_queue["data"]["totalElements"] == 0 and new_queue["data"]["totalElements"] == 1, {"old": old_queue["data"]["totalElements"], "new": new_queue["data"]["totalElements"]})
    _, detail = http("GET", "/workflow/operations/instances/" + instance_id, manager)
    command.update(targetUserId="42", expectedTaskState=detail["data"]["tasks"][0]["taskState"])
    check("signed-reassignment-succeeds", http("POST", f"/workflow/operations/tasks/{task_id}/reassign", manager, command)[0] == 200 and sql(f"SELECT assignee_id FROM workflow_task WHERE id={task_id}") == "42", "Current responsibility changed to 42")
    check("responsibility-actions-do-not-approve", sql(f"SELECT status FROM record_control_request WHERE id={request_id}") == "IN_REVIEW" and sql(f"SELECT status FROM workflow_instance WHERE id={instance_id}") == "RUNNING", "Application IN_REVIEW; workflow RUNNING")
    intervention_signature = sql("SELECT id FROM signature WHERE target_type='WORKFLOW_INTERVENTION'")
    status, signature_list = http("GET", "/signatures", manager)
    check("intervention-signature-excluded-from-generic-list", status == 200 and all(s["targetType"] != "WORKFLOW_INTERVENTION" for s in signature_list["data"]["content"]), "Generic list excludes the protected target")
    for method, payload in [("GET", None), ("PUT", {"targetType": "OTHER", "targetId": "qa"}), ("DELETE", None)]:
        check("protected-signature-" + method.lower(), http(method, "/signatures/" + intervention_signature, manager, payload)[0] != 200, "Protected signature action denied")

    for path, payload in [("/workflow/instances", {"id": 9191, "businessType": "SYNTHETIC_CASE", "status": "RUNNING"}), ("/workflow/logs", {"instanceId": 9106, "action": "FAKE"})]:
        check("runtime-crud-readonly-" + path.rsplit("/", 1)[-1], http("POST", path, manager, payload)[0] == 403, "HTTP 403 for direct runtime write")
    check("runtime-task-crud-readonly", http("PUT", "/workflow/tasks/9107", manager, {"instanceId": 9106, "assigneeId": "43"})[0] == 403 and sql("SELECT assignee_id FROM workflow_task WHERE id=9107") == "42", "No direct assignment bypass")
    sql("UPDATE workflow_instance SET business_type='DHR_SUMMARY' WHERE id=9106")
    check("dhr-operation-detail-isolated", http("GET", "/workflow/operations/instances/9106", manager)[0] != 200, "DHR excluded from generic detail")
    check("dhr-reassignment-targets-isolated", http("GET", "/workflow/operations/tasks/9107/reassignment-targets", manager)[0] != 200, "DHR targets denied")

    check("unrelated-withdrawal-denied", http("POST", f"/record-control/requests/{request_id}/withdraw", viewer, {"reason": "不得撤回"})[0] == 403, "HTTP 403")
    status, request = http("GET", "/record-control/requests/" + request_id, tokens["rc-applicant"])
    check("transfer-and-reassign-do-not-close-withdrawal-window", status == 200 and request["data"]["canWithdraw"] is True, "No approval decision was created")
    check("applicant-withdrawal-succeeds", http("POST", f"/record-control/requests/{request_id}/withdraw", tokens["rc-applicant"], {"reason": "QA撤回重填"})[0] == 200, "HTTP 200")
    check("withdrawal-atomically-closes-request-workflow-and-task", sql(f"SELECT status FROM record_control_request WHERE id={request_id}") == "WITHDRAWN" and sql(f"SELECT status FROM workflow_instance WHERE id={instance_id}") == "WITHDRAWN" and sql(f"SELECT status FROM workflow_task WHERE id={task_id}") == "WITHDRAWN", "All three statuses WITHDRAWN")
    check("withdrawal-preserves-effective-source", sql("SELECT status FROM form_instance_record") == "COMPLETED" and sql("SELECT values_json::jsonb->>'value' FROM form_instance_record") == "old", "Effective source remains COMPLETED with old value")
    check("withdrawal-replay-denied", http("POST", f"/record-control/requests/{request_id}/withdraw", tokens["rc-applicant"], {"reason": "重复撤回"})[0] != 200, "Duplicate withdrawal denied")

try:
    execute()
finally:
    OUTPUT.write_text(json.dumps({"database": DATABASE, "baseUrl": BASE, "checks": checks, "summary": {"passed": sum(c["passed"] for c in checks), "failed": sum(not c["passed"] for c in checks)}}, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"passed": len(checks), "failed": 0}))
