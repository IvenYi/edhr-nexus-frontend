package com.zencas.edhr.production.service;

import org.springframework.stereotype.Component;
import java.time.Clock;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

/** Ephemeral editing sessions; never changes execution revisions or audit history. */
@Component
public class ExecutionPresenceRegistry {
    private final Clock clock;
    private final ConcurrentHashMap<Key, Editor> editors = new ConcurrentHashMap<>();
    public ExecutionPresenceRegistry() { this(Clock.systemUTC()); }
    ExecutionPresenceRegistry(Clock clock) { this.clock = clock; }

    public void heartbeat(long objectId, String session, String userId, String name, String operationId, String formId, String instanceId) {
        purge();
        editors.put(new Key(objectId, userId, session), new Editor(userId, name, operationId, formId, instanceId, clock.millis() + 45_000));
    }
    public void leave(long objectId, String userId, String session) { editors.remove(new Key(objectId, userId, session)); }
    public List<Editor> list(long objectId, String operationId) {
        purge();
        return editors.entrySet().stream().filter(e -> e.getKey().objectId == objectId && e.getValue().operationId.equals(operationId))
                .map(java.util.Map.Entry::getValue).toList();
    }
    private void purge() { editors.entrySet().removeIf(e -> e.getValue().expiresAt <= clock.millis()); }
    private record Key(long objectId, String userId, String session) {}
    public record Editor(String userId, String name, String operationId, String formId, String instanceId, long expiresAt) {}
}
