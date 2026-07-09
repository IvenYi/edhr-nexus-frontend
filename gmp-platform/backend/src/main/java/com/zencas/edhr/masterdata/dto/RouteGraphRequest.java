package com.zencas.edhr.masterdata.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteGraphRequest {
    private List<NodePayload> nodes;
    private List<RelationPayload> relations;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NodePayload {
        private String nodeKey;
        private Long operationId;
        private String operationCode;
        private String operationName;
        private String nodeType;
        private Integer positionX;
        private Integer positionY;
        private Integer sortOrder;
        private String configJson;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RelationPayload {
        private String sourceNodeKey;
        private String targetNodeKey;
        private String sourceHandle;
        private String targetHandle;
        private String relationType;
        private String label;
        private String ruleExpression;
        private Integer priority;
    }
}
