package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class FormInstanceRecordStageTest {
    private final ObjectMapper mapper = new ObjectMapper();

    @Test void activeApprovalNodesAndMixedParallelNodesHaveDifferentDisplayStages() throws Exception {
        var form = mapper.readTree("""
                {"flow":{"nodes":[{"id":"a","data":{"kind":"APPROVAL"}},
                 {"id":"b","data":{"kind":"APPROVAL"}},{"id":"fill","data":{"kind":"FILL"}}]}}
                """);
        assertThat(FormInstanceRecordService.savedStage(form, mapper.readTree("{\"status\":\"ACTIVE\",\"active\":[\"a\",\"b\"]}"))).isEqualTo("APPROVAL");
        assertThat(FormInstanceRecordService.savedStage(form, mapper.readTree("{\"status\":\"ACTIVE\",\"active\":[\"a\",\"fill\"]}"))).isEqualTo("FILLING_AND_APPROVAL");
        assertThat(FormInstanceRecordService.savedStage(form, mapper.readTree("{\"status\":\"ACTIVE\",\"active\":[\"fill\"]}"))).isEqualTo("FILLING");
    }

    @Test void completedLifecycleTakesPrecedenceAndDirectEntryRemainsFilling() throws Exception {
        var form = mapper.readTree("{}");
        assertThat(FormInstanceRecordService.savedStage(form, mapper.readTree("{\"status\":\"COMPLETED\",\"active\":[\"entry\"]}"))).isEqualTo("COMPLETED");
        assertThat(FormInstanceRecordService.savedStage(form, mapper.readTree("{\"status\":\"ACTIVE\",\"active\":[\"entry\"]}"))).isEqualTo("FILLING");
    }
}
