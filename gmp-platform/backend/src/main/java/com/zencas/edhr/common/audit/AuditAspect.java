package com.zencas.edhr.common.audit;

import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * AOP aspect that intercepts @Auditable methods and persists audit_event records.
 * Captures method execution context only. Business endpoints that need field-level
 * before/after diffs should write those snapshots explicitly.
 */
@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditEventRepository auditEventRepository;
    private final SnowflakeIdGenerator idGenerator;

    @Around("@annotation(auditable)")
    public Object audit(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        Object result = joinPoint.proceed();

        try {
            AuditEvent event = AuditEvent.builder()
                    .id(idGenerator.nextId())
                    .tenantId("default")
                    .entityType(auditable.entityType())
                    .entityId(resolveEntityId(joinPoint, auditable))
                    .action(auditable.action())
                    .operatorId(AuditContext.getOperatorId())
                    .operatorName(AuditContext.getOperatorName())
                    .operatorAccount(AuditContext.getOperatorAccount())
                    .source(AuditContext.getSource())
                    .moduleName(auditable.moduleName())
                    .menuName(auditable.menuName())
                    .functionName(auditable.functionName())
                    .dataSummary(auditable.dataSummary())
                    .ipAddress(AuditContext.getIpAddress())
                    .createdAt(LocalDateTime.now())
                    .build();

            auditEventRepository.save(event);
        } catch (Exception e) {
            log.error("Failed to persist audit event: {}", e.getMessage(), e);
        }

        return result;
    }

    private String resolveEntityId(ProceedingJoinPoint joinPoint, Auditable auditable) {
        if (!auditable.entityIdExpr().isEmpty()) {
            // Simple resolution: use the first argument's id field
            for (Object arg : joinPoint.getArgs()) {
                if (arg instanceof Number) {
                    return arg.toString();
                }
            }
        }
        // Fallback: try method parameter named "id"
        MethodSignature sig = (MethodSignature) joinPoint.getSignature();
        String[] paramNames = sig.getParameterNames();
        Object[] args = joinPoint.getArgs();
        for (int i = 0; i < paramNames.length; i++) {
            if ("id".equals(paramNames[i]) && args[i] != null) {
                return args[i].toString();
            }
        }
        return "-";
    }
}
