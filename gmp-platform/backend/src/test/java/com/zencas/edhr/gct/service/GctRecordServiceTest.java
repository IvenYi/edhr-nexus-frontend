package com.zencas.edhr.gct.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.gct.dto.GctRecordDto;
import com.zencas.edhr.gct.dto.GctRecordMutationRequest;
import com.zencas.edhr.gct.dto.GctRecordQueryRequest;
import com.zencas.edhr.gct.store.InMemoryGctRecordStore;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class GctRecordServiceTest {

    private static final String PAGE_CODE = "gct_2_3_product_list";

    private GctRecordService recordService;

    @BeforeEach
    void setUp() {
        GctPageRegistry registry = new GctPageRegistry(new ObjectMapper());
        InMemoryGctRecordStore store = new InMemoryGctRecordStore(registry);
        recordService = new GctRecordService(store);
    }

    @Test
    void initializesTwentyVisibleRecordsForEachPage() {
        PageResult<GctRecordDto> result = recordService.query(PAGE_CODE, GctRecordQueryRequest.builder()
                .page(1)
                .size(50)
                .build());

        assertThat(result.getTotalElements()).isEqualTo(20);
        assertThat(result.getContent()).hasSize(20);
        assertThat(result.getContent())
                .allSatisfy(record -> assertThat(record.getPageCode()).isEqualTo(PAGE_CODE));
    }

    @Test
    void supportsPaginationFilteringSearchAndSorting() {
        PageResult<GctRecordDto> firstPage = recordService.query(PAGE_CODE, GctRecordQueryRequest.builder()
                .page(1)
                .size(5)
                .sort("id")
                .order("asc")
                .build());

        assertThat(firstPage.getTotalElements()).isEqualTo(20);
        assertThat(firstPage.getTotalPages()).isEqualTo(4);
        assertThat(firstPage.getContent()).hasSize(5);
        assertThat(firstPage.getContent()).extracting(GctRecordDto::getId)
                .containsExactly(
                        "gct_2_3_product_list-001",
                        "gct_2_3_product_list-002",
                        "gct_2_3_product_list-003",
                        "gct_2_3_product_list-004",
                        "gct_2_3_product_list-005"
                );

        String status = firstPage.getContent().getFirst().getStatus();
        PageResult<GctRecordDto> statusFiltered = recordService.query(PAGE_CODE, GctRecordQueryRequest.builder()
                .page(1)
                .size(20)
                .status(status)
                .build());
        assertThat(statusFiltered.getContent())
                .allSatisfy(record -> assertThat(record.getStatus()).isEqualTo(status));

        PageResult<GctRecordDto> searched = recordService.query(PAGE_CODE, GctRecordQueryRequest.builder()
                .page(1)
                .size(20)
                .q("演示记录-05")
                .build());
        assertThat(searched.getContent()).singleElement()
                .extracting(GctRecordDto::getId)
                .isEqualTo("gct_2_3_product_list-005");

        PageResult<GctRecordDto> sortedDesc = recordService.query(PAGE_CODE, GctRecordQueryRequest.builder()
                .page(1)
                .size(3)
                .sort("id")
                .order("desc")
                .build());
        assertThat(sortedDesc.getContent()).extracting(GctRecordDto::getId)
                .containsExactly(
                        "gct_2_3_product_list-020",
                        "gct_2_3_product_list-019",
                        "gct_2_3_product_list-018"
                );
    }

    @Test
    void createsAndUpdatesRecords() {
        GctRecordDto created = recordService.create(PAGE_CODE, GctRecordMutationRequest.builder()
                .status("草稿")
                .remark("新增演示")
                .values(Map.of(
                        "field_c94faa71", "NEW-001",
                        "customField", "custom-value"
                ))
                .build());

        assertThat(created.getId()).startsWith("gct_2_3_product_list-NEW-");
        assertThat(created.getStatus()).isEqualTo("草稿");
        assertThat(created.getValues()).containsEntry("customField", "custom-value");
        assertThat(recordService.query(PAGE_CODE, GctRecordQueryRequest.builder().page(1).size(50).build())
                .getTotalElements()).isEqualTo(21);

        GctRecordDto updated = recordService.update(PAGE_CODE, created.getId(), GctRecordMutationRequest.builder()
                .status("启用")
                .remark("已启用")
                .values(Map.of(
                        "field_c94faa71", "NEW-001-UPDATED",
                        "customField", "updated-value"
                ))
                .build());

        assertThat(updated.getId()).isEqualTo(created.getId());
        assertThat(updated.getStatus()).isEqualTo("启用");
        assertThat(updated.getRemark()).isEqualTo("已启用");
        assertThat(updated.getValues()).containsEntry("customField", "updated-value");

        GctRecordDto reloaded = recordService.find(PAGE_CODE, created.getId());
        assertThat(reloaded.getValues()).containsEntry("field_c94faa71", "NEW-001-UPDATED");
    }

    @Test
    void keepsPageStoresIsolated() {
        List<String> pageCodes = List.of("gct_1_1_workbench", PAGE_CODE, "gct_3_1_work_order_management");

        assertThat(pageCodes)
                .allSatisfy(pageCode -> assertThat(recordService.query(pageCode, GctRecordQueryRequest.builder()
                        .page(1)
                        .size(50)
                        .build()).getTotalElements()).isEqualTo(20));
    }
}
