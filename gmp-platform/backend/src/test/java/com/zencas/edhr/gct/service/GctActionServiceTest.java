package com.zencas.edhr.gct.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.gct.dto.GctActionRequest;
import com.zencas.edhr.gct.dto.GctActionResultDto;
import com.zencas.edhr.gct.dto.GctRecordDto;
import com.zencas.edhr.gct.dto.GctRecordQueryRequest;
import com.zencas.edhr.gct.store.InMemoryGctRecordStore;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class GctActionServiceTest {

    private static final String WORKBENCH_PAGE = "gct_1_1_workbench";
    private static final String PRODUCT_PAGE = "gct_2_3_product_list";

    private GctRecordService recordService;
    private GctActionService actionService;
    private GctAuditService auditService;
    private GctStatusService statusService;

    @BeforeEach
    void setUp() {
        GctPageRegistry registry = new GctPageRegistry(new ObjectMapper());
        InMemoryGctRecordStore store = new InMemoryGctRecordStore(registry);
        recordService = new GctRecordService(store);
        actionService = new GctActionService(store);
        auditService = new GctAuditService(store);
        statusService = new GctStatusService(store);
    }

    @Test
    void executeActionWritesAuditAndStatusHistoryWhenStateChanges() {
        GctRecordDto record = recordService.query(WORKBENCH_PAGE, GctRecordQueryRequest.builder()
                .page(1)
                .size(1)
                .sort("id")
                .order("asc")
                .build()).getContent().getFirst();

        GctActionResultDto result = actionService.executeAction(WORKBENCH_PAGE, record.getId(), "process",
                GctActionRequest.builder()
                        .actor("tester")
                        .remark("开始处理")
                        .input(Map.of("reason", "demo"))
                        .build());

        assertThat(result.isChanged()).isTrue();
        assertThat(result.getRecord().getStatus()).isEqualTo("处理中");
        assertThat(result.getAuditEntry()).isNotNull();
        assertThat(result.getAuditEntry().getActionCode()).isEqualTo("process");
        assertThat(result.getStatusHistoryEntry()).isNotNull();
        assertThat(result.getStatusHistoryEntry().getFromStatus()).isEqualTo(record.getStatus());
        assertThat(result.getStatusHistoryEntry().getToStatus()).isEqualTo("处理中");

        assertThat(auditService.listAudit(WORKBENCH_PAGE, record.getId())).hasSize(1);
        assertThat(statusService.listStatusHistory(WORKBENCH_PAGE, record.getId())).hasSize(1);
    }

    @Test
    void logicalDeleteIsHiddenByDefaultButCanBeQueriedByDeletedStatus() {
        GctRecordDto record = recordService.query(PRODUCT_PAGE, GctRecordQueryRequest.builder()
                .page(1)
                .size(1)
                .sort("id")
                .order("asc")
                .build()).getContent().getFirst();

        GctActionResultDto result = actionService.executeAction(PRODUCT_PAGE, record.getId(), "delete",
                GctActionRequest.builder().actor("tester").remark("删除演示").build());

        assertThat(result.getRecord().getStatus()).isEqualTo("已删除");
        assertThat(recordService.query(PRODUCT_PAGE, GctRecordQueryRequest.builder()
                .page(1)
                .size(50)
                .build()).getContent())
                .extracting(GctRecordDto::getId)
                .doesNotContain(record.getId());

        PageResult<GctRecordDto> deletedOnly = recordService.query(PRODUCT_PAGE, GctRecordQueryRequest.builder()
                .page(1)
                .size(20)
                .status("已删除")
                .build());
        assertThat(deletedOnly.getContent()).extracting(GctRecordDto::getId).contains(record.getId());
    }

    @Test
    void copyAndVersionActionsCreateRecordsWithoutMutatingSource() {
        GctRecordDto source = recordService.query(PRODUCT_PAGE, GctRecordQueryRequest.builder()
                .page(1)
                .size(1)
                .sort("id")
                .order("asc")
                .build()).getContent().getFirst();
        Object originalName = source.getValues().get("field_c94faa71");

        GctActionResultDto copy = actionService.executeAction(PRODUCT_PAGE, source.getId(), "copy",
                GctActionRequest.builder()
                        .actor("tester")
                        .values(Map.of(
                                "field_c94faa71", "COPY-001",
                                "copyOnly", "copy-value"
                        ))
                        .build());
        GctActionResultDto version = actionService.executeAction(PRODUCT_PAGE, source.getId(), "version_create",
                GctActionRequest.builder()
                        .actor("tester")
                        .values(Map.of(
                                "field_c94faa71", "VERSION-001",
                                "versionOnly", "version-value"
                        ))
                        .build());

        assertThat(copy.getCreatedRecord()).isNotNull();
        assertThat(copy.getCreatedRecord().getId()).isNotEqualTo(source.getId());
        assertThat(copy.getCreatedRecord().getValues())
                .containsEntry("field_c94faa71", "COPY-001")
                .containsEntry("copyOnly", "copy-value");
        assertThat(version.getCreatedRecord()).isNotNull();
        assertThat(version.getCreatedRecord().getId()).isNotEqualTo(source.getId());
        assertThat(version.getCreatedRecord().getValues())
                .containsEntry("field_c94faa71", "VERSION-001")
                .containsEntry("versionOnly", "version-value");

        GctRecordDto reloadedSource = recordService.find(PRODUCT_PAGE, source.getId());
        assertThat(reloadedSource.getValues()).containsEntry("field_c94faa71", originalName);
        assertThat(reloadedSource.getValues()).doesNotContainKeys("copyOnly", "versionOnly");
        assertThat(recordService.query(PRODUCT_PAGE, GctRecordQueryRequest.builder()
                .page(1)
                .size(50)
                .build()).getTotalElements()).isEqualTo(22);
    }
}
