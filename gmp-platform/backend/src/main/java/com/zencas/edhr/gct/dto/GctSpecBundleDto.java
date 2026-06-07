package com.zencas.edhr.gct.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class GctSpecBundleDto {

    private String schemaVersion;
    private String source;
    private String sourceFile;
    private String sourceHash;
    private String generatedAt;
    private Integer pageCount;
    private Map<String, Integer> moduleCounts;
    private Map<String, Integer> pageTypeCounts;
    private List<Map<String, Object>> menus;
    private List<GctPageSpecDto> pages;
}
