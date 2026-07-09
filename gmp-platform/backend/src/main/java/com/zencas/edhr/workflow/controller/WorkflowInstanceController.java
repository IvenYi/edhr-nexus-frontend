package com.zencas.edhr.workflow.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.workflow.engine.WorkflowEngine;
import com.zencas.edhr.workflow.entity.*;
import com.zencas.edhr.workflow.repository.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Workflow instance controller with lifecycle and monitoring endpoints.
 */
@RestController
@RequestMapping("/api/v1/workflow/instances")
@RequiredArgsConstructor
public class WorkflowInstanceController {

    private final WorkflowInstanceRepository workflowInstanceRepository;
    private final WorkflowNodeRepository nodeRepository;
    private final WorkflowEdgeRepository edgeRepository;
    private final WorkflowActionLogRepository actionLogRepository;
    private final WorkflowDefinitionVersionRepository versionRepository;
    private final WorkflowEngine workflowEngine;

    // ======================== Instance CRUD ========================

    @GetMapping
    public ApiResponse<PageResult<WorkflowInstance>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "startedAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page - 1, size, Sort.by(direction, sort));
        Page<WorkflowInstance> result = workflowInstanceRepository.findAll(pageable);
        return ApiResponse.success(PageResult.of(
                result.getContent(), page, size, result.getTotalElements()));
    }

    @GetMapping("/{id}")
    public ApiResponse<WorkflowInstance> getById(@PathVariable Long id) {
        return workflowInstanceRepository.findById(id)
                .map(ApiResponse::success)
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_005));
    }

    @PostMapping
    public ApiResponse<WorkflowInstance> create(@RequestBody WorkflowInstance entity) {
        return ApiResponse.success(workflowInstanceRepository.save(entity));
    }

    @PutMapping("/{id}")
    public ApiResponse<WorkflowInstance> update(@PathVariable Long id, @RequestBody WorkflowInstance entity) {
        entity.setId(id);
        return ApiResponse.success(workflowInstanceRepository.save(entity));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        workflowInstanceRepository.deleteById(id);
        return ApiResponse.success(null);
    }

    // ======================== Advanced Endpoints ========================

    /**
     * Get the flow graph data (nodes + edges) for visualization.
     * Returns the graph from the instance's associated version.
     */
    @GetMapping("/{id}/graph")
    public ApiResponse<GraphData> graph(@PathVariable Long id) {
        WorkflowInstance instance = workflowInstanceRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_005));

        // Get the version that was used when this instance was created
        WorkflowDefinitionVersion version = versionRepository.findById(instance.getVersionId())
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_010));

        List<WorkflowNode> nodes = nodeRepository.findByVersionId(version.getId());
        List<WorkflowEdge> edges = edgeRepository.findByVersionId(version.getId());

        // Determine current node IDs from instance
        String currentNodeIds = instance.getCurrentNodeIds();

        // Build node data with highlight info
        List<GraphNode> graphNodes = nodes.stream()
                .map(n -> {
                    boolean isCurrent = currentNodeIds != null &&
                            currentNodeIds.contains(n.getId().toString());
                    return new GraphNode(
                            n.getId(), n.getVersionId(), n.getNodeType(), n.getName(),
                            n.getPositionX(), n.getPositionY(), n.getProperties(),
                            n.getSortOrder(), isCurrent);
                })
                .toList();

        List<GraphEdge> graphEdges = edges.stream()
                .map(e -> new GraphEdge(
                        e.getId(), e.getVersionId(), e.getSourceNodeId(),
                        e.getTargetNodeId(), e.getLabel(), e.getConditionExpression()))
                .toList();

        GraphData data = new GraphData(
                instance.getId(), instance.getStatus(),
                version.getVersionNumber(), graphNodes, graphEdges);
        return ApiResponse.success(data);
    }

    /**
     * Terminate a running workflow instance.
     */
    @PostMapping("/{id}/terminate")
    public ApiResponse<Map<String, Object>> terminate(
            @PathVariable Long id,
            @RequestBody TerminateRequest request) {
        workflowEngine.terminateInstance(id, request.getReason(),
                request.getOperatorId(), request.getSignatureId());
        return ApiResponse.success(Map.of(
                "instanceId", id, "action", "TERMINATE",
                "result", "ok", "reason", request.getReason() != null ? request.getReason() : ""));
    }

    /**
     * Get all action logs for a workflow instance, ordered by creation time.
     */
    @GetMapping("/{id}/logs")
    public ApiResponse<List<WorkflowActionLog>> logs(@PathVariable Long id) {
        workflowInstanceRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_005));

        List<WorkflowActionLog> logs = actionLogRepository
                .findByInstanceIdOrderByCreatedAtAsc(id);
        return ApiResponse.success(logs);
    }

    // ======================== DTOs ========================

    /**
     * Flow graph data returned to the frontend for visualization (e.g. ReactFlow).
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GraphData {
        private Long instanceId;
        private String instanceStatus;
        private Integer versionNumber;
        private List<GraphNode> nodes;
        private List<GraphEdge> edges;
    }

    /**
     * A node in the flow graph, with current-node highlight info.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GraphNode {
        private Long id;
        private Long versionId;
        private String nodeType;
        private String name;
        private Integer positionX;
        private Integer positionY;
        private String properties;
        private Integer sortOrder;
        private boolean isCurrent;
    }

    /**
     * An edge in the flow graph.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GraphEdge {
        private Long id;
        private Long versionId;
        private Long sourceNodeId;
        private Long targetNodeId;
        private String label;
        private String conditionExpression;
    }

    /**
     * Request body for terminate action.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TerminateRequest {
        private String reason;
        private String operatorId;
        private Long signatureId;
    }
}
