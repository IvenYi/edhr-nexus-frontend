package com.zencas.edhr.identity.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class LoginLogItem {
    Long id;
    Long operatorId;
    String operatorName;
    String username;
    String eventType;
    String eventTypeLabel;
    String actionLabel;
    String authMethod;
    String authMethodLabel;
    LocalDateTime occurredAt;
    String platform;
    String platformLabel;
    String clientType;
    String clientTypeLabel;
    String browser;
    String ipAddress;
}
