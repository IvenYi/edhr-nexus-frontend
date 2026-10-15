package com.zencas.edhr.production.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.production.service.DhrTraceReportService;
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
@ContextConfiguration(classes = TraceReportAuthorizationTest.Config.class)
class TraceReportAuthorizationTest {
    @Configuration @EnableMethodSecurity static class Config {
        @Bean JdbcTemplate jdbc() { return mock(JdbcTemplate.class); }
        @Bean DhrTraceReportService dhrs() { return mock(DhrTraceReportService.class); }
        @Bean FormLookupCatalogService catalog() { return mock(FormLookupCatalogService.class); }
        @Bean TraceReportController reports(JdbcTemplate jdbc, DhrTraceReportService dhrs, FormLookupCatalogService catalog) {
            return new TraceReportController(jdbc, new ObjectMapper(), catalog, dhrs);
        }
    }
    @Autowired TraceReportController reports;
    @Autowired JdbcTemplate jdbc;
    @Autowired DhrTraceReportService dhrs;
    @Autowired FormLookupCatalogService catalog;
    @BeforeEach void resetMocks() { reset(jdbc, dhrs, catalog); }
    private final TraceReportController.Query query = new TraceReportController.Query("FORWARD", Map.of(), Map.of(), 0, 20);

    @Test @WithMockUser(authorities = "dhr.instances.view")
    void dhrPermissionDoesNotReplaceFormAndProductionAccess() {
        assertThatThrownBy(() -> reports.forms(query)).isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> reports.dhrs(query)).isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> reports.detail(1, query)).isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(jdbc, dhrs, catalog);
    }
    @Test @WithMockUser(authorities = {"form-instances.view", "production.execution"})
    void formReadersCannotReadDhrRowsCountsOrDetails() {
        assertThatThrownBy(() -> reports.dhrs(query)).isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> reports.detail(1, query)).isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(jdbc, dhrs, catalog);
    }
    @Test @WithMockUser(authorities = {"form-instances.view", "production.execution", "dhr.instances.view"})
    void authorizedForwardQueryDoesNotNeedLookupCatalog() {
        when(dhrs.query(false, Map.of(), java.util.List.of(), 0, 20)).thenReturn(new ObjectMapper().createObjectNode());
        reports.dhrs(query); verifyNoInteractions(catalog);
        assertThatThrownBy(() -> reports.dhrs(new TraceReportController.Query("REVERSE", Map.of(), Map.of("unknown", "value"), 0, 20))).hasMessageContaining("筛选追溯项");
        assertThatThrownBy(() -> reports.dhrs(new TraceReportController.Query("FORWARD", Map.of(), Map.of(), -1, 201))).hasMessageContaining("合法页码");
    }
}
