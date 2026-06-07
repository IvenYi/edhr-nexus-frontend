package com.zencas.edhr.gct.service;

import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.gct.dto.GctActionRequest;
import com.zencas.edhr.gct.dto.GctDemoFlowDto;
import com.zencas.edhr.gct.dto.GctRecordDto;
import com.zencas.edhr.gct.dto.GctRecordQueryRequest;
import com.zencas.edhr.gct.store.InMemoryGctRecordStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GctDemoFlowService {

    private static final String DEMO_PAGE = "gct_1_1_workbench";

    private final InMemoryGctRecordStore store;

    public GctDemoFlowDto getDemoFlow() {
        GctRecordDto record = firstDemoRecord();
        return flow(record, "ready", List.of("load-page", "query-record", "process", "finish"));
    }

    public GctDemoFlowDto reset() {
        store.reset();
        return flow(firstDemoRecord(), "reset", List.of("reset-store", "load-page", "query-record"));
    }

    public GctDemoFlowDto run() {
        GctRecordDto record = firstDemoRecord();
        store.executeAction(DEMO_PAGE, record.getId(), "process",
                GctActionRequest.builder().actor("demo-flow").remark("演示流程处理").build());
        GctRecordDto finished = store.executeAction(DEMO_PAGE, record.getId(), "finish",
                GctActionRequest.builder().actor("demo-flow").remark("演示流程完成").build()).getRecord();
        return flow(finished, "completed", List.of("load-page", "process", "finish"));
    }

    private GctRecordDto firstDemoRecord() {
        PageResult<GctRecordDto> result = store.query(DEMO_PAGE, GctRecordQueryRequest.builder()
                .page(1)
                .size(1)
                .sort("id")
                .order("asc")
                .build());
        if (result.getContent().isEmpty()) {
            throw new IllegalStateException("GCT demo flow has no records");
        }
        return result.getContent().getFirst();
    }

    private GctDemoFlowDto flow(GctRecordDto record, String status, List<String> steps) {
        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("pageCode", DEMO_PAGE);
        metrics.put("recordId", record.getId());
        metrics.put("recordStatus", record.getStatus());
        metrics.put("steps", steps.size());
        return GctDemoFlowDto.builder()
                .id("gct-demo-flow")
                .title("GCT eDHR 演示流程")
                .status(status)
                .currentRecord(record)
                .steps(steps)
                .metrics(metrics)
                .build();
    }
}
