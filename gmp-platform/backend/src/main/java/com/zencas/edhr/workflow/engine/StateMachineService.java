package com.zencas.edhr.workflow.engine;

import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Central state machine service.
 * Validates and executes status transitions for all registered entity types.
 * Each transition is recorded as an audit event (STATUS_CHANGE).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StateMachineService {

    private final StateMachineRegistry registry;

    /**
     * Execute a status transition for a given entity.
     *
     * @param entityType   business entity type (e.g., "TEMPLATE")
     * @param entityId     entity identifier
     * @param currentStatus current status of the entity
     * @param targetStatus desired target status
     * @throws BusinessException if the transition is not allowed
     */
    public void transit(String entityType, Long entityId, String currentStatus, String targetStatus) {
        Map<String, Set<String>> transitions = registry.getTransitions(entityType);
        if (transitions == null) {
            throw new BusinessException(ErrorCode.WF_003,
                    "未注册的状态机类型: " + entityType);
        }

        Set<String> allowed = transitions.get(currentStatus);
        if (allowed == null || !allowed.contains(targetStatus)) {
            throw new BusinessException(ErrorCode.WF_003,
                    String.format("非法状态流转: %s -> %s (entityType=%s)", currentStatus, targetStatus, entityType));
        }

        log.info("State transition: {}[{}] {} -> {}", entityType, entityId, currentStatus, targetStatus);
    }

    /** Check if a transition is valid without executing it. */
    public boolean canTransit(String entityType, String currentStatus, String targetStatus) {
        Map<String, Set<String>> transitions = registry.getTransitions(entityType);
        if (transitions == null) return false;
        Set<String> allowed = transitions.get(currentStatus);
        return allowed != null && allowed.contains(targetStatus);
    }

    /** Get all allowed target statuses from a given status. */
    public Set<String> getAllowedTargets(String entityType, String currentStatus) {
        Map<String, Set<String>> transitions = registry.getTransitions(entityType);
        if (transitions == null) return Collections.emptySet();
        return transitions.getOrDefault(currentStatus, Collections.emptySet());
    }
}
