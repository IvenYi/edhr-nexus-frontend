package com.zencas.edhr.gct.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class GctPageSpecDto {

    private String code;
    private String section;
    private String module;
    private String moduleSlug;
    private String group;
    private String groupSlug;
    private String title;
    private String label;
    private String pageSlug;
    private String path;
    private String type;
    private String positioning;
    private String businessScenario;
    private String boundary;
    private String interfaceSuggestion;
    private List<String> apiSuggestions;
    private String acceptanceCriteria;
    private String aiPrompt;
    private String stateFlow;
    private List<String> baseStatuses;
    private List<String> businessStatuses;
    private List<GctFieldMetaDto> queryFields;
    private List<GctFieldMetaDto> listFields;
    private List<GctFieldMetaDto> formFields;
    private List<GctFieldMetaDto> systemFields;
    private List<GctFieldMetaDto> fields;
    private List<GctActionMetaDto> actions;
    private List<GctStateTransitionDto> stateTransitions;
}
