package com.zencas.edhr.gct.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.gct.dto.GctPageSpecDto;
import com.zencas.edhr.gct.dto.GctSpecBundleDto;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GctPageRegistryTest {

    private final GctPageRegistry registry = new GctPageRegistry(new ObjectMapper());

    @Test
    void loadsGeneratedSpecBundleFromClasspath() {
        GctSpecBundleDto bundle = registry.getBundle();

        assertThat(bundle.getSchemaVersion()).isEqualTo("1.0.0");
        assertThat(bundle.getSourceFile()).isEqualTo("GCT_eDHR_功能详细规格与AI实现提示词.md");
        assertThat(bundle.getPageCount()).isEqualTo(99);
        assertThat(bundle.getPages()).hasSize(99);
        assertThat(bundle.getModuleCounts()).containsExactlyInAnyOrderEntriesOf(Map.of(
                "操作面板", 1,
                "基础建模", 24,
                "生产管理", 13,
                "检验管理", 10,
                "放行管理", 4,
                "记录管理", 17,
                "统计报表", 17,
                "系统管理", 13
        ));
        assertThat(bundle.getPageTypeCounts()).containsExactlyInAnyOrderEntriesOf(Map.of(
                "list", 22,
                "master", 40,
                "approval", 6,
                "execution", 8,
                "transaction", 9,
                "report", 11,
                "dashboard", 3
        ));
    }

    @Test
    void findsPagesByPageCode() {
        GctPageSpecDto page = registry.getPageOrThrow("gct_1_1_workbench");

        assertThat(page.getCode()).isEqualTo("gct_1_1_workbench");
        assertThat(page.getModule()).isEqualTo("操作面板");
        assertThat(page.getType()).isEqualTo("list");
        assertThat(page.getActions()).extracting("code").contains("process", "detail");
        assertThat(registry.findPage("gct_1_1_workbench")).contains(page);
        assertThat(registry.getPage("gct_1_1_workbench")).isEqualTo(page);
        assertThatThrownBy(() -> registry.getPageOrThrow("missing_page"))
                .isInstanceOf(BusinessException.class)
                .satisfies(error -> assertThat(((BusinessException) error).getErrorCode())
                        .isEqualTo(ErrorCode.GENERAL_001))
                .hasMessageContaining("missing_page");
    }
}
