package com.zencas.edhr.masterdata.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.zencas.edhr.masterdata.entity.RouteNode;
import com.zencas.edhr.masterdata.entity.RouteRelation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteGraphResponse {
    @JsonSerialize(using = ToStringSerializer.class)
    private Long routeId;
    @JsonSerialize(using = ToStringSerializer.class)
    private Long routeVersionId;
    private List<RouteNode> nodes;
    private List<RouteRelation> relations;
}
