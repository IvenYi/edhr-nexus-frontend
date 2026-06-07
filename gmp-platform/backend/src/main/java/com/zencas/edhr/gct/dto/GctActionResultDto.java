package com.zencas.edhr.gct.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class GctActionResultDto {

    private String actionCode;
    private String message;
    private GctRecordDto record;
    private GctRecordDto createdRecord;
    private GctAuditEntryDto auditEntry;
    private GctStatusHistoryDto statusHistoryEntry;
    private boolean changed;
}
