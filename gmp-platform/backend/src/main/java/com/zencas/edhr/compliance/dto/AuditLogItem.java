package com.zencas.edhr.compliance.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class AuditLogItem {
    Long id;
    String entityType;
    String entityId;
    String action;
    String actionLabel;
    String operatorId;
    String operatorDisplayName;
    String operatorAccount;
    String operationTime;
    String triggerMethod;
    String triggerMethodLabel;
    String moduleName;
    String menuName;
    String functionName;
    String dataSummary;
    String contentBefore;
    String contentAfter;
    String reason;
    String ipAddress;
    LocalDateTime createdAt;
}
