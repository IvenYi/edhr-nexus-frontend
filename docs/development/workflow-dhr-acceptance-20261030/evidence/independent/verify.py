"""Independent destructive probes, restricted to our disposable QA clone and port 8108."""
import importlib.util
import json
import subprocess
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
spec = importlib.util.spec_from_file_location("uat_seed", ROOT / "seed.py")
seed = importlib.util.module_from_spec(spec)
spec.loader.exec_module(seed)
seed.DB = "edhr_acceptance_quality_20261030"
seed.BASE = "http://127.0.0.1:8108/api/v1"
assert seed.sql("SELECT current_database()") == "edhr_acceptance_quality_20261030"
manifest = json.loads((ROOT / "manifest.json").read_text())
cases = {c["code"]: c for c in manifest["cases"]}
checks = []
tokens = {r: seed.login(r) for r in seed.ACCOUNTS}

def check(name, condition, evidence):
    checks.append({"name": name, "passed": bool(condition), "evidence": evidence})
    if not condition: raise AssertionError(name + ": " + str(evidence))

def http(method, path, role="applicant", payload=None):
    request = urllib.request.Request(seed.BASE+path, method=method,
        headers={"Content-Type":"application/json", "Authorization":"Bearer "+tokens[role]},
        data=None if payload is None else seed.encoded(payload).encode())
    try:
        with urllib.request.urlopen(request, timeout=30) as response: body=json.load(response)
    except urllib.error.HTTPError as error:
        raise RuntimeError(path+": "+error.read().decode()) from None
    if body.get("code") != 200: raise RuntimeError(path+": "+json.dumps(body,ensure_ascii=False))
    return body.get("data")

def refused(name, path, role, payload, message):
    try:
        http("POST", path, role, payload)
    except RuntimeError as error:
        check(name, message in str(error), str(error))
    else: check(name, False, "Unexpected success")

def record(c):
    return http("GET", "/record-control/records/by-number?" + urllib.parse.urlencode({"instanceNo": c["instanceNo"]}))

def submit_command(c, business="CHANGE"):
    source = record(c)
    offset = 200 if business == "CHANGE" else 300
    return {"requestType": business, "instanceNo": c["instanceNo"], "sourceRevisionId": source["current_revision_id"],
            "proposedValues": dict(source["fieldValues"], value="QA-AFTER-RETURN") if business == "CHANGE" else None,
            "reason": "独立质量验证", "workflowDefinitionId": str(seed.B+offset), "workflowVersionId": str(seed.B+offset+1),
            "account": "uat_applicant", "password": seed.SIGN_PASSWORD, "idempotencyKey": "independent-"+c["code"]+business}

def workflow(c): return http("GET", "/workflow/operations/instances/"+c["workflowInstanceId"], "manager")
def detail(c): return http("GET", "/record-control/requests/"+c["requestId"])
def approve(c, role="reviewer"):
    return http("POST", f"/record-control/workflow-tasks/{c['taskId']}/approve", role,
                {"opinion": "独立质量验证通过", "account": seed.ACCOUNTS[role][1], "password": seed.SIGN_PASSWORD})

def frozen(c):
    return seed.sql(f"SELECT md5(to_jsonb(v)::text) FROM dhr_summary_version v WHERE id={c['versionId']}")
def approval(c):
    return seed.sql(f"SELECT md5(to_jsonb(r)::text) FROM dhr_summary_review r WHERE summary_version_id={c['versionId']}")
def signatures(c):
    return seed.sql(f"SELECT md5(COALESCE(string_agg(to_jsonb(s)::text,'' ORDER BY s.id),'')) FROM signature s WHERE target_type='DHR_SUMMARY' AND target_id='{c['versionId']}'")

def draft(c):
    path = f"/dhr-instances/{c['dhrId']}/summary"
    workspace = http("GET", path)
    command = {"expectedScopeHash": workspace["sourceScopeHash"], "overlayDirectories": [], "placements": []}
    if workspace.get("draft"): command.update(draftId=workspace["draft"]["id"], revision=workspace["draft"]["revision"])
    d = http("PUT", path+"/draft", payload=command)
    return {"expectedDraftId": d["id"], "expectedRevision": d["revision"],
            "manualReview": {"qualityAndExceptionsReviewed": True, "sourceSignaturesReviewed": True,
                             "completeScopeReviewed": True, "note": "独立质量验证核对完整来源"}}

def execute():
    c = cases["REASSIGN"]
    before = workflow(c)
    task = next(t for t in before["tasks"] if t["id"] == c["taskId"])
    command = {"targetUserId": str(seed.B+3), "reason": "独立质量改派", "expectedTaskState": task["taskState"], "account": "uat_manager", "password": seed.SIGN_PASSWORD}
    path = f"/workflow/operations/tasks/{c['taskId']}/reassign"
    refused("reassign-missing-signature", path, "manager", dict(command, password=""), "密码")
    refused("reassign-wrong-signature", path, "manager", dict(command, password="incorrect-signature"), "密码")
    refused("reassign-login-password-is-not-sign-password", path, "manager", dict(command, password=seed.PASSWORD), "密码")
    refused("reassign-signer-needs-intervention-permission", path, "manager", dict(command, account="uat_reviewer"), "签署人没有流程干预权限")
    refused("reassign-session-needs-intervention-permission", path, "reviewer", command, "权限")
    refused("reassign-cannot-select-applicant", path, "manager", dict(command, targetUserId=str(seed.B+1)), "目标不在")
    check("reassign-negative-cases-have-no-side-effects", workflow(c) == before, "Task/state/logs unchanged")
    http("POST", path, "manager", command)
    after = workflow(c)
    changed = next(t for t in after["tasks"] if t["id"] == c["taskId"])
    check("signed-reassignment-only-changes-responsibility", changed["assigneeId"] == str(seed.B+3) and detail(c)["status"] == "IN_REVIEW" and after["status"] == "RUNNING", changed)
    check("reassignment-has-log-signature-and-original-candidates", any(l["action"] == "TASK_REASSIGN" for l in after["logs"]) and seed.sql(f"SELECT count(*) FROM workflow_intervention i JOIN signature s ON s.id=i.signature_id WHERE i.instance_id={c['workflowInstanceId']} AND s.target_type='WORKFLOW_INTERVENTION'") == "1" and "883010000002" in seed.sql(f"SELECT candidate_snapshot->>'originSnapshot' FROM workflow_task WHERE id={c['taskId']}"), "Original snapshot, TASK_REASSIGN, protected signature")
    refused("stale-reassignment-replay-refused", path, "manager", command, "已变化")

    c = cases["TRANSFER"]
    path = f"/record-control/workflow-tasks/{c['taskId']}/transfer"
    context = http("GET", f"/workflow/operations/tasks/{c['taskId']}/transfer-context", "reviewer")
    targets = http("GET", f"/workflow/operations/tasks/{c['taskId']}/transfer-targets", "reviewer")
    check("transfer-config-requires-signature-and-excludes-applicant", context["signatureRequired"] and [u["id"] for u in targets] == [str(seed.B+3)], targets)
    transfer = {"targetUserId": str(seed.B+3), "reason": "独立质量转办", "expectedTaskState": context["taskState"], "account": "uat_reviewer", "password": seed.SIGN_PASSWORD}
    refused("transfer-signature-required-by-frozen-node", path, "reviewer", dict(transfer, password=""), "密码")
    http("POST", path, "reviewer", transfer)
    state = workflow(c)
    check("signed-transfer-does-not-approve", detail(c)["status"] == "IN_REVIEW" and detail(c)["canWithdraw"] and state["status"] == "RUNNING", "IN_REVIEW/RUNNING; withdrawal still allowed")
    refused("old-transfer-operator-cannot-approve", f"/record-control/workflow-tasks/{c['taskId']}/approve", "reviewer", {"opinion": "旧处理人", "account": "uat_reviewer", "password": seed.SIGN_PASSWORD}, "当前用户不是该任务的待处理人")
    context = http("GET", f"/workflow/operations/tasks/{c['taskId']}/transfer-context", "target")
    check("new-transfer-target-has-current-responsibility", context["canTransfer"] is True, context)

    c = cases["WITHDRAW"]
    old_record = record(c)
    path = f"/record-control/requests/{c['requestId']}/withdraw"
    refused("only-applicant-can-withdraw", path, "manager", {"reason": "无权撤回"}, "申请人")
    http("POST", path, payload={"reason": "独立质量撤回"})
    check("withdrawal-closes-request-workflow-all-tasks", detail(c)["status"] == "WITHDRAWN" and workflow(c)["status"] == "WITHDRAWN" and all(t["status"] == "WITHDRAWN" for t in workflow(c)["tasks"]), "All runtime/application states WITHDRAWN")
    current = record(c)
    check("withdrawal-keeps-effective-revision-and-values", current["current_revision_id"] == old_record["current_revision_id"] and current["fieldValues"] == old_record["fieldValues"], current["current_revision_id"])
    c = cases["DECIDED"]
    check("prior-decision-case-is-still-pending-with-no-withdrawal", detail(c)["status"] == "IN_REVIEW" and not detail(c)["canWithdraw"] and seed.sql(f"SELECT count(*) FROM workflow_task WHERE instance_id={c['workflowInstanceId']} AND action='APPROVE'") == "1", "One APPROVE decision, second node pending")
    refused("prior-decision-blocks-withdrawal", f"/record-control/requests/{c['requestId']}/withdraw", "applicant", {"reason": "错误撤回"}, "已有审批决定")

    c = cases["DHR-REVIEW"]
    frozen_before = frozen(c)
    for business in ("CHANGE", "OBSOLETE"):
        refused("pending-dhr-blocks-source-"+business.lower(), "/record-control/requests", "applicant", submit_command(c, business), "关联 DHR 正在审批")
    check("dhr-block-does-not-change-frozen-evidence", frozen(c) == frozen_before, frozen_before)
    review = http("GET", "/dhr-reviews/"+c["reviewTaskId"], "reviewer")
    frozen_hash = seed.sql(f"SELECT snapshot_hash FROM dhr_summary_version WHERE id={c['versionId']}")
    http("POST", "/dhr-reviews/"+c["reviewTaskId"]+"/actions", "reviewer", {"action": "RETURN", "opinion": "独立质量：先退回再更正", "expectedSnapshotHash": frozen_hash})
    request = http("POST", "/record-control/requests", payload=submit_command(c))
    check("dhr-human-return-reopens-controlled-source-application", request["status"] == "IN_REVIEW" and seed.sql(f"SELECT summary_status FROM dhr_instance WHERE id={c['dhrId']}") == "DRAFT", "DHR DRAFT; new source application IN_REVIEW")

    c = cases["DHR-PENDING"]
    command = draft(c)
    path = f"/dhr-instances/{c['dhrId']}/summary/submit"
    refused("pending-source-blocks-dhr-submission", path, "applicant", command, "来源表单有审批中的")
    http("POST", f"/record-control/requests/{c['requestId']}/withdraw", payload={"reason": "独立质量：先结束来源申请"})
    submitted = http("POST", path, payload=draft(c))
    check("after-source-request-ends-dhr-can-submit", submitted["id"] and seed.sql(f"SELECT summary_status FROM dhr_instance WHERE id={c['dhrId']}") == "PENDING_REVIEW", submitted["id"])

    for code in ("DHR-CHANGE", "DHR-VOID"):
        c = cases[code]
        old_frozen, old_approval, old_signatures = frozen(c), approval(c), signatures(c)
        approve(c)
        check(code+"-effective-application-approved", detail(c)["status"] == "APPROVED", detail(c)["status"])
        source = record(c)
        if code == "DHR-CHANGE":
            check("change-effective-current-revision-updated", source["fieldValues"]["value"] == "UAT-LOT-NEW" and source["fieldValues"]["qty"] == 120 and source["revision_no"] == "2", source["fieldValues"])
        else:
            check("void-effective-current-record-obsolete", source["status"] == "OBSOLETE", source["status"])
        historical = http("GET", f"/dhr-instances/{c['dhrId']}/summary/versions/{c['versionId']}")
        (HERE/(code.lower()+"-historical.json")).write_text(json.dumps(historical, ensure_ascii=False, indent=2)+"\n")
        check(code+"-keeps-frozen-version-approval-signature", frozen(c) == old_frozen and approval(c) == old_approval and signatures(c) == old_signatures, {"frozen": old_frozen, "approval": old_approval, "signature": old_signatures})
        check(code+"-records-evidence-impact", len(historical["evidenceChanges"]) == 1 and seed.sql(f"SELECT count(*) FROM dhr_evidence_impact WHERE summary_version_id={c['versionId']}") == "1", historical["evidenceChanges"])
        notices = http("GET", "/dhr-impact-notifications")
        check(code+"-notifies-actual-summary-submitter", any(n["instanceNo"] == c["instanceNo"] for n in notices["content"]), notices)
        check(code+"-no-invented-current-reviewer", seed.sql(f"SELECT string_agg(recipient_id,',' ORDER BY recipient_id) FROM dhr_impact_notification n JOIN dhr_evidence_impact i ON i.id=n.impact_id WHERE i.summary_version_id={c['versionId']}") == str(seed.B+1), "Only actual submitter; no current pending review task")
        if code == "DHR-VOID":
            check("old-frozen-evidence-keeps-original-completed-status", "COMPLETED" in json.dumps(historical) and "UAT-LOT-OLD" in json.dumps(historical), "Old candidate retains original status/value")
    check("original-acceptance-data-not-consumed", subprocess.check_output(["psql","-X","-d","edhr_acceptance_20261030","-Atc","SELECT count(*) FROM record_control_request WHERE status='IN_REVIEW'"],text=True).strip() == "7", "Retained acceptance database still has 7 active applications")

try:
    execute()
finally:
    (HERE/"api-verification.json").write_text(json.dumps({"database":seed.DB,"baseUrl":seed.BASE,"checks":checks,"summary":{"passed":sum(c["passed"] for c in checks),"failed":sum(not c["passed"] for c in checks)}},ensure_ascii=False,indent=2)+"\n")
print(json.dumps({"passed":len(checks),"failed":0}))
