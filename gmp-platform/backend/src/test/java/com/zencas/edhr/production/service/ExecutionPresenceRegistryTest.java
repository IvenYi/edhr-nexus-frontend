package com.zencas.edhr.production.service;

import org.junit.jupiter.api.Test;
import java.time.Clock;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class ExecutionPresenceRegistryTest {
    @Test void sessionsAreScopedAndExpireWithoutAClosingRequest() {
        Clock clock = mock(Clock.class);
        when(clock.millis()).thenReturn(1000L);
        var registry = new ExecutionPresenceRegistry(clock);
        registry.heartbeat(1, "one", "alice", "甲", "op", "form", "copy1");
        registry.heartbeat(1, "two", "alice", "甲", "op", "form", "copy2");
        registry.heartbeat(1, "one", "bob", "乙", "op", "form", "copy1");
        registry.heartbeat(2, "one", "alice", "甲", "op", "form", "copy1");
        assertThat(registry.list(1, "op")).hasSize(3);
        assertThat(registry.list(1, "other")).isEmpty();
        registry.leave(1, "bob", "two");
        assertThat(registry.list(1, "op")).hasSize(3);
        registry.leave(1, "alice", "one");
        assertThat(registry.list(1, "op")).hasSize(2);
        when(clock.millis()).thenReturn(46_000L);
        assertThat(registry.list(1, "op")).isEmpty();
        assertThat(registry.list(2, "op")).isEmpty();
    }
}
