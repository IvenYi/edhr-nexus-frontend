package com.zencas.edhr.common.exception;

import lombok.Getter;

/** Standardized error codes following {MODULE}-{NUMBER} format. */
@Getter
public enum ErrorCode {

    // AUTH - Authentication / Authorization
    AUTH_001(401, "AUTH-001", "用户名或密码错误"),
    AUTH_002(401, "AUTH-002", "Token 已过期"),
    AUTH_003(403, "AUTH-003", "无操作权限"),
    AUTH_004(401, "AUTH-004", "未登录或登录已失效"),

    // IDN - Identity / Organization
    IDN_001(404, "IDN-001", "租户不存在"),
    IDN_002(404, "IDN-002", "用户不存在"),
    IDN_003(404, "IDN-003", "角色不存在"),
    IDN_004(404, "IDN-004", "部门不存在"),
    IDN_005(400, "IDN-005", "用户名已存在"),
    IDN_006(400, "IDN-006", "角色编码已存在"),
    IDN_007(400, "IDN-007", "部门编码已存在"),
    IDN_008(404, "IDN-008", "工厂不存在"),
    IDN_009(404, "IDN-009", "车间不存在"),
    IDN_010(404, "IDN-010", "产线不存在"),

    // WF - Workflow Engine
    WF_001(404, "WF-001", "流程模板不存在"),
    WF_002(400, "WF-002", "版本已经发布，不可修改"),
    WF_003(400, "WF-003", "非法的状态流转"),
    WF_004(400, "WF-004", "并行节点聚合规则未满足"),
    WF_005(404, "WF-005", "流程实例不存在"),
    WF_006(404, "WF-006", "流程任务不存在"),
    WF_007(400, "WF-007", "任务已被处理"),
    WF_008(404, "WF-008", "流程绑定规则不存在"),
    WF_009(400, "WF-009", "没有可匹配的流程模板"),
    WF_010(400, "WF-010", "版本不存在"),
    WF_011(404, "WF-011", "流程节点不存在"),
    WF_012(400, "WF-012", "条件表达式格式错误"),

    // AUD - Audit
    AUD_001(404, "AUD-001", "审计记录不存在"),

    // SIG - Signature
    SIG_001(401, "SIG-001", "二次认证失败"),
    SIG_002(400, "SIG-002", "签名对象已变更"),
    SIG_003(404, "SIG-003", "签名记录不存在"),

    // MD - Master Data
    MD_001(404, "MD-001", "产品家族不存在"),
    MD_002(404, "MD-002", "产品不存在"),
    MD_003(404, "MD-003", "产品版本不存在"),
    MD_004(404, "MD-004", "单位不存在"),
    MD_005(404, "MD-005", "设备类型不存在"),
    MD_006(404, "MD-006", "设备不存在"),
    MD_007(404, "MD-007", "工序不存在"),
    MD_008(404, "MD-008", "工艺路线不存在"),
    MD_009(404, "MD-009", "SOP 文档不存在"),

    // FILE
    FILE_001(404, "FILE-001", "文件不存在"),
    FILE_002(400, "FILE-002", "文件大小超出限制"),
    FILE_003(400, "FILE-003", "不支持的文件类型"),

    // TPL - Template
    TPL_001(404, "TPL-001", "表单模板不存在"),
    TPL_002(404, "TPL-002", "表单模板版本不存在"),
    TPL_003(400, "TPL-003", "表单模板编码已存在"),

    // General
    GENERAL_001(400, "GENERAL-001", "请求参数校验失败"),
    GENERAL_002(500, "GENERAL-002", "系统内部错误"),
    GENERAL_003(400, "GENERAL-003", "不支持的操作");

    private final int httpStatus;
    private final String code;
    private final String message;

    ErrorCode(int httpStatus, String code, String message) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.message = message;
    }
}
