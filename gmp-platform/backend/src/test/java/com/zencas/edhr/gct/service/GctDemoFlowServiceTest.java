package com.zencas.edhr.gct.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.gct.dto.GctDemoFlowDto;
import com.zencas.edhr.gct.dto.GctPageSpecDto;
import com.zencas.edhr.gct.store.InMemoryGctRecordStore;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class GctDemoFlowServiceTest {

    private GctPageRegistry registry;
    private GctDemoFlowService demoFlowService;

    @BeforeEach
    void setUp() {
        registry = new GctPageRegistry(new ObjectMapper());
        InMemoryGctRecordStore store = new InMemoryGctRecordStore(registry);
        demoFlowService = new GctDemoFlowService(store);
    }

    @Test
    void runUsesPageMetadataThatDeclaresExecutedActions() {
        GctDemoFlowDto flow = demoFlowService.run();
        String pageCode = (String) flow.getMetrics().get("pageCode");
        GctPageSpecDto page = registry.getPageOrThrow(pageCode);

        assertThat(page.getActions())
                .extracting("code")
                .contains("process", "finish");
        assertThat(flow.getStatus()).isEqualTo("completed");
        assertThat(flow.getCurrentRecord().getStatus()).isEqualTo("已完成");
        assertThat(flow.getSteps()).containsExactly("load-page", "process", "finish");
    }
}
