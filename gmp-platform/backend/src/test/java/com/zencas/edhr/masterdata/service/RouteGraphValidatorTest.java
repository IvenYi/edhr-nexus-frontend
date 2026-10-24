package com.zencas.edhr.masterdata.service;

import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.masterdata.entity.RouteNode;
import com.zencas.edhr.masterdata.entity.RouteRelation;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RouteGraphValidatorTest {
    private RouteNode node(String id, String type) {
        return RouteNode.builder().nodeKey(id).nodeType(type).operationName(id).build();
    }
    private RouteRelation edge(String source, String target) {
        return RouteRelation.builder().sourceNodeKey(source).targetNodeKey(target).relationType("SEQUENTIAL").build();
    }
    private List<RouteNode> skeleton(RouteNode... operations) {
        var result = new java.util.ArrayList<>(List.of(node("start", "START"), node("end", "END")));
        result.addAll(List.of(operations));
        return result;
    }

    @Test void requiresConnectedBoundariesAndUniqueKeys() {
        assertThatThrownBy(() -> RouteGraphValidator.validate(skeleton(), List.of())).isInstanceOf(BusinessException.class).hasMessageContaining("开始节点必须连通");
        assertThatThrownBy(() -> RouteGraphValidator.validate(List.of(), List.of())).hasMessageContaining("一个开始节点");
        assertThatThrownBy(() -> RouteGraphValidator.validate(skeleton(node("start", "OPERATION")), List.of())).hasMessageContaining("标识不能重复");
        assertThatThrownBy(() -> RouteGraphValidator.validate(skeleton(node("second", "START")), List.of())).hasMessageContaining("一个开始节点");
    }

    @Test void rejectsOrphansAndDeadEndsEvenWhenBoundariesAreConnected() {
        var nodes = skeleton(node("op", "OPERATION"));
        assertThatThrownBy(() -> RouteGraphValidator.validate(nodes, List.of(edge("start", "end")))).hasMessageContaining("未连接到开始节点");
        assertThatThrownBy(() -> RouteGraphValidator.validate(nodes, List.of(edge("start", "end"), edge("start", "op")))).hasMessageContaining("无法到达结束节点");
    }

    @Test void validatesReferencesAndBoundaryDirections() {
        assertThatThrownBy(() -> RouteGraphValidator.validate(skeleton(), List.of(edge("start", "missing")))).hasMessageContaining("不存在的节点");
        assertThatThrownBy(() -> RouteGraphValidator.validate(skeleton(), List.of(edge("end", "start")))).hasMessageContaining("开始节点不能有进入");
        assertThatThrownBy(() -> RouteGraphValidator.validate(skeleton(node("op", "OPERATION")), List.of(edge("end", "op")))).hasMessageContaining("结束节点不能有出去");
    }

    @Test void rejectsSelfLinksAndDuplicatePairsRegardlessOfPortsOrRelationType() {
        var nodes = skeleton(node("a", "OPERATION"), node("r", "REWORK"));
        var valid = new java.util.ArrayList<>(List.of(edge("start", "a"), edge("a", "end")));
        var duplicate = edge("start", "a");
        duplicate.setSourceHandle("another-port");
        duplicate.setRelationType("PARALLEL");
        valid.add(duplicate);
        assertThatThrownBy(() -> RouteGraphValidator.validate(nodes, valid)).hasMessageContaining("重复连线");
        assertThatThrownBy(() -> RouteGraphValidator.validate(nodes, List.of(edge("start", "a"), edge("a", "a"), edge("a", "end")))).hasMessageContaining("自身");
        assertThatThrownBy(() -> RouteGraphValidator.validate(nodes, List.of(edge("start", "a"), edge("a", "end"), edge("r", "r")))).hasMessageContaining("自身");
    }

    @Test void preservesParallelAndReworkAndDoesNotRequireAnOperation() {
        var nodes = skeleton(node("a", "OPERATION"), node("b", "OPERATION"), node("r", "REWORK"));
        var edges = List.of(edge("start", "a"), edge("start", "b"), edge("a", "end"), edge("b", "end"), edge("a", "r"), edge("r", "a"));
        assertThatCode(() -> RouteGraphValidator.validate(nodes, edges)).doesNotThrowAnyException();
        assertThatCode(() -> RouteGraphValidator.validate(skeleton(), List.of(edge("start", "end")))).doesNotThrowAnyException();
    }

    @Test void reworkCannotSubstituteForTheNormalProductionPath() {
        var nodes = skeleton(node("a", "OPERATION"), node("r", "REWORK"));
        assertThatThrownBy(() -> RouteGraphValidator.validate(nodes, List.of(edge("start", "r"), edge("r", "a"), edge("a", "end")))).hasMessageContaining("开始节点必须连通");
    }

    @Test void rejectsNormalCyclesIncludingRelabeledEdgesAndUnknownTypes() {
        var nodes = skeleton(node("a", "OPERATION"), node("b", "OPERATION"), node("c", "OPERATION"));
        var edges = new java.util.ArrayList<>(List.of(edge("start", "a"), edge("a", "b"), edge("b", "c"), edge("c", "end")));
        edges.add(edge("b", "a"));
        assertThatThrownBy(() -> RouteGraphValidator.validate(nodes, edges)).hasMessageContaining("循环");
        edges.removeLast();
        var backward = edge("c", "a");
        backward.setRelationType("REWORK");
        edges.add(backward);
        assertThatThrownBy(() -> RouteGraphValidator.validate(nodes, edges)).hasMessageContaining("循环");
        assertThatThrownBy(() -> RouteGraphValidator.validate(skeleton(node("bypass", "UNKNOWN")), List.of(edge("start", "end")))).hasMessageContaining("节点类型");
    }
}
