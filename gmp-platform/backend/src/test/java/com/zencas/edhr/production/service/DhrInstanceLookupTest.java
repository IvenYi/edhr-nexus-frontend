package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.production.controller.DhrInstanceController;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;

import java.sql.ResultSet;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DhrInstanceLookupTest {
    @Test
    void findsDhrByProductionObjectWithinTenant() throws Exception {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        DhrInstanceService service = new DhrInstanceService(jdbc, new ObjectMapper(), mock(AuditEventRepository.class), mock(SnowflakeIdGenerator.class));
        ResultSet row = mock(ResultSet.class);
        when(row.getString("id")).thenReturn("91");
        when(row.getString("dhr_no")).thenReturn("DHR-91");
        when(row.getString("production_object_id")).thenReturn("42");
        when(row.getString("summary_status")).thenReturn("FORMALIZED");
        when(jdbc.query(anyString(), any(RowMapper.class), eq("default"), eq(42L))).thenAnswer(invocation -> {
            RowMapper<ObjectNode> mapper = invocation.getArgument(1);
            return List.of(mapper.mapRow(row, 0));
        });

        ObjectNode found = service.findByProductionObjectId(42L);

        assertThat(found.path("id").asText()).isEqualTo("91");
        assertThat(found.path("summaryStatus").asText()).isEqualTo("FORMALIZED");
        verify(jdbc).query(org.mockito.ArgumentMatchers.argThat((String sql) ->
                sql.contains("FROM dhr_instance WHERE tenant_id=? AND production_object_id=?")), any(RowMapper.class), eq("default"), eq(42L));
        assertThat(new DhrInstanceController(service).byProductionObject(42L).getData().path("dhrNo").asText()).isEqualTo("DHR-91");
        assertThat(DhrInstanceController.class.getAnnotation(PreAuthorize.class).value()).contains("dhr.instances.view");
        assertThat(DhrInstanceController.class.getMethod("byProductionObject", Long.class).getAnnotation(GetMapping.class).value())
                .containsExactly("/by-production-object/{productionObjectId}");
    }

    @Test
    void missingDhrReturnsNullWithoutCreatingOne() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        DhrInstanceService service = new DhrInstanceService(jdbc, new ObjectMapper(), mock(AuditEventRepository.class), mock(SnowflakeIdGenerator.class));
        when(jdbc.query(anyString(), any(RowMapper.class), eq("default"), eq(43L))).thenReturn(List.of());

        assertThat(service.findByProductionObjectId(43L)).isNull();
        assertThat(new DhrInstanceController(service).byProductionObject(43L).getData()).isNull();
    }
}
