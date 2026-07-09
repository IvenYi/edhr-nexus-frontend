package com.zencas.edhr.workflow.engine;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Scans all beans annotated with @StateMachineDef and builds a registry
 * of entity types to their allowed state transitions.
 */
@Slf4j
@Component
public class StateMachineRegistry {

    private final ApplicationContext applicationContext;
    private final Map<String, Map<String, Set<String>>> registry = new ConcurrentHashMap<>();

    public StateMachineRegistry(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @PostConstruct
    public void init() {
        Map<String, Object> beans = applicationContext.getBeansWithAnnotation(StateMachineDef.class);
        for (Object bean : beans.values()) {
            StateMachineDef def = bean.getClass().getAnnotation(StateMachineDef.class);
            if (def == null) continue;
            register(def.entityType(), def.transitions());
        }
        log.info("StateMachineRegistry: registered {} state machines", registry.size());
    }

    private void register(String entityType, String[] transitionDefs) {
        Map<String, Set<String>> transitions = new LinkedHashMap<>();
        for (String def : transitionDefs) {
            String[] parts = def.split("->");
            if (parts.length != 2) {
                log.warn("Invalid transition def: {}", def);
                continue;
            }
            String from = parts[0].trim();
            String to = parts[1].trim();
            transitions.computeIfAbsent(from, k -> new LinkedHashSet<>()).add(to);
        }
        registry.put(entityType, transitions);
    }

    public Map<String, Set<String>> getTransitions(String entityType) {
        return registry.get(entityType);
    }

    public Set<String> getRegisteredTypes() {
        return Collections.unmodifiableSet(registry.keySet());
    }
}
