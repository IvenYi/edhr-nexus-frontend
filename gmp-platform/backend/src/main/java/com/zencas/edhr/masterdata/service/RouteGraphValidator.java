package com.zencas.edhr.masterdata.service;

import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.masterdata.entity.RouteNode;
import com.zencas.edhr.masterdata.entity.RouteRelation;

import java.util.*;

/** Save-time connectivity of the normal production skeleton, independent of execution. */
public final class RouteGraphValidator {
    private RouteGraphValidator() {}

    public static void validate(List<RouteNode> nodes, List<RouteRelation> relations) {
        Map<String, RouteNode> byKey = new LinkedHashMap<>();
        for (RouteNode node : nodes) {
            if (!Set.of("START", "END", "OPERATION", "REWORK").contains(node.getNodeType())) fail("路线节点类型不正确");
            if (byKey.putIfAbsent(node.getNodeKey(), node) != null) fail("路线节点标识不能重复");
        }
        List<RouteNode> starts = nodes.stream().filter(n -> "START".equals(n.getNodeType())).toList();
        List<RouteNode> ends = nodes.stream().filter(n -> "END".equals(n.getNodeType())).toList();
        if (starts.size() != 1 || ends.size() != 1) fail("路线必须有且只有一个开始节点和一个结束节点");
        String start = starts.getFirst().getNodeKey(), end = ends.getFirst().getNodeKey();
        Map<String, List<String>> next = new HashMap<>(), previous = new HashMap<>();
        Map<String, Set<String>> targets = new HashMap<>();
        for (RouteRelation relation : relations) {
            String source = relation.getSourceNodeKey(), target = relation.getTargetNodeKey();
            if (!byKey.containsKey(source) || !byKey.containsKey(target)) fail("路线连线引用了不存在的节点");
            if (source.equals(target)) fail("节点不能连接自身");
            if (!targets.computeIfAbsent(source, ignored -> new HashSet<>()).add(target)) fail("同一对节点之间不能重复连线");
            if (start.equals(target)) fail("开始节点不能有进入连线");
            if (end.equals(source)) fail("结束节点不能有出去连线");
            if ("REWORK".equals(byKey.get(source).getNodeType()) || "REWORK".equals(byKey.get(target).getNodeType())) continue;
            next.computeIfAbsent(source, ignored -> new ArrayList<>()).add(target);
            previous.computeIfAbsent(target, ignored -> new ArrayList<>()).add(source);
        }
        Map<String, Integer> incoming = new HashMap<>();
        nodes.stream().filter(n -> !"REWORK".equals(n.getNodeType())).forEach(n -> incoming.put(n.getNodeKey(), previous.getOrDefault(n.getNodeKey(), List.of()).size()));
        Deque<String> pending = new ArrayDeque<>();
        incoming.forEach((key, count) -> { if (count == 0) pending.push(key); });
        int visited = 0;
        while (!pending.isEmpty()) {
            String key = pending.pop();
            visited++;
            for (String target : next.getOrDefault(key, List.of())) {
                if (incoming.compute(target, (ignored, count) -> count - 1) == 0) pending.push(target);
            }
        }
        if (visited != incoming.size()) fail("普通生产工序不能形成循环");
        Set<String> fromStart = reachable(start, next), toEnd = reachable(end, previous);
        if (!fromStart.contains(end)) fail("开始节点必须连通到结束节点");
        for (RouteNode node : nodes) {
            if (!"OPERATION".equals(node.getNodeType())) continue;
            String label = node.getOperationName() == null ? node.getNodeKey() : node.getOperationName();
            if (!fromStart.contains(node.getNodeKey())) fail("工序「" + label + "」未连接到开始节点");
            if (!toEnd.contains(node.getNodeKey())) fail("工序「" + label + "」无法到达结束节点");
        }
    }

    private static Set<String> reachable(String from, Map<String, List<String>> links) {
        Set<String> seen = new HashSet<>();
        Deque<String> pending = new ArrayDeque<>();
        pending.push(from);
        while (!pending.isEmpty()) {
            String id = pending.pop();
            if (!seen.add(id)) continue;
            links.getOrDefault(id, List.of()).forEach(pending::push);
        }
        return seen;
    }

    private static void fail(String message) {
        throw new BusinessException(ErrorCode.GENERAL_001, message);
    }
}
