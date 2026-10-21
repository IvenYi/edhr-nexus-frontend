package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.List;
import java.util.Map;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class RetiredProjectionRetryTest {
    @Test void obsoletePendingBatchCannotMaterializeRetiredTraceRecordsOnRetry() throws Exception {
        var mapper = new ObjectMapper();
        var jdbc = mock(JdbcTemplate.class);
        var source = mapper.readTree("""
            {"model":{"fields":[{"id":"value","type":"text"}],"projection":{"version":"form-projection-v1",
              "bindings":[{"id":"old","modelId":"formTrace","enabled":true,"sources":{"teamText":"value"}}]}},
             "values":{"value":"旧班组"}}
            """);
        when(jdbc.queryForList(anyString(), eq(7L))).thenReturn(List.of(Map.of(
                "source", source.toString(), "status", "PENDING", "rule_version", "form-projection-v1")));
        assertThatThrownBy(() -> new FormProjectionService(jdbc, mapper).process(7L))
            .hasMessageContaining("追溯项已停用");
        verify(jdbc).queryForList(anyString(), eq(7L));
        verifyNoMoreInteractions(jdbc);
    }
}
