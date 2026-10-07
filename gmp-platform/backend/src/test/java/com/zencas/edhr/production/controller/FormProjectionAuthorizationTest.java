package com.zencas.edhr.production.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.template.service.FormLookupCatalogService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import java.util.Map;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = FormProjectionAuthorizationTest.Config.class)
class FormProjectionAuthorizationTest {
    @Configuration @EnableMethodSecurity
    static class Config {
        @Bean JdbcTemplate jdbc() { return mock(JdbcTemplate.class); }
        @Bean FormProjectionController controller(JdbcTemplate jdbc) {
            return new FormProjectionController(jdbc, new ObjectMapper(), mock(AuditEventRepository.class), mock(SnowflakeIdGenerator.class), mock(FormLookupCatalogService.class));
        }
    }
    @Autowired FormProjectionController reports;
    @Autowired JdbcTemplate jdbc;
    @BeforeEach void resetMocks() { reset(jdbc); }

    @Test @WithMockUser(authorities = "form-instances.view")
    void reportPermissionAloneCannotReadProductionSourceOrCount() {
        assertThatThrownBy(() -> reports.query(new FormProjectionController.Query("formTrace", null, null, Map.of(), 0, 20, null, null))).isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> reports.source(1)).isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> reports.status()).isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(jdbc);
    }
    @Test @WithMockUser(authorities = {"form-instances.view", "production.execution"})
    void reportReaderCannotRetryOrReadDhrWithoutThosePermissions() {
        assertThatThrownBy(() -> reports.retry(1, Map.of("reason", "test"))).isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> reports.dhr(1)).isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(jdbc);
    }
    @Test @WithMockUser(authorities = {"system.edit", "dhr.instances.view"})
    void administrativePermissionsDoNotReplaceSourcePermissions() {
        assertThatThrownBy(() -> reports.retry(1, Map.of("reason", "test"))).isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> reports.dhr(1)).isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(jdbc);
    }
}
