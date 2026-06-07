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

    @Test
    void resetGetAndRunExposeConsistentFlowAndRecordStatus() {
        GctDemoFlowDto reset = demoFlowService.reset();
        assertThat(reset.getStatus()).isEqualTo("reset");
        assertThat(reset.getSteps()).containsExactly("reset-store", "load-page", "query-record");
        assertThat(reset.getMetrics())
                .containsEntry("recordId", reset.getCurrentRecord().getId())
                .containsEntry("recordStatus", reset.getCurrentRecord().getStatus());

        GctDemoFlowDto ready = demoFlowService.getDemoFlow();
        assertThat(ready.getStatus()).isEqualTo("ready");
        assertThat(ready.getCurrentRecord().getId()).isEqualTo(reset.getCurrentRecord().getId());
        assertThat(ready.getCurrentRecord().getStatus()).isEqualTo(reset.getCurrentRecord().getStatus());
        assertThat(ready.getSteps()).containsExactly("load-page", "query-record", "process", "finish");

        GctDemoFlowDto completed = demoFlowService.run();
        assertThat(completed.getStatus()).isEqualTo("completed");
        assertThat(completed.getCurrentRecord().getId()).isEqualTo(reset.getCurrentRecord().getId());
        assertThat(completed.getCurrentRecord().getStatus()).isEqualTo("已完成");
        assertThat(completed.getMetrics()).containsEntry("recordStatus", "已完成");

        GctDemoFlowDto readyAfterRun = demoFlowService.getDemoFlow();
        assertThat(readyAfterRun.getStatus()).isEqualTo("ready");
        assertThat(readyAfterRun.getCurrentRecord().getId()).isEqualTo(completed.getCurrentRecord().getId());
        assertThat(readyAfterRun.getCurrentRecord().getStatus()).isEqualTo("已完成");
        assertThat(readyAfterRun.getMetrics()).containsEntry("recordStatus", "已完成");
    }
}
