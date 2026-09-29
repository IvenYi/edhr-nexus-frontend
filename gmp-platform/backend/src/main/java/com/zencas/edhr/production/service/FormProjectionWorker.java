package com.zencas.edhr.production.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@EnableScheduling
@RequiredArgsConstructor
public class FormProjectionWorker {
    private final JdbcTemplate jdbc;
    private final FormProjectionService projection;

    @Scheduled(fixedDelay = 5000, initialDelay = 5000)
    public void processPending() {
        for (Long id : jdbc.queryForList("SELECT id FROM form_projection_batch WHERE status='PENDING' ORDER BY id LIMIT 50", Long.class)) {
            try { projection.process(id); }
            catch (RuntimeException error) { projection.failed(id); }
        }
    }
}
