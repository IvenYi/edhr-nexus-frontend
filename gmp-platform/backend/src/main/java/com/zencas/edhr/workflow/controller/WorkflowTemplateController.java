package com.zencas.edhr.workflow.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.workflow.entity.WorkflowDefinition;
import com.zencas.edhr.workflow.entity.WorkflowDefinitionVersion;
import com.zencas.edhr.workflow.entity.WorkflowEdge;
import com.zencas.edhr.workflow.entity.WorkflowNode;
import com.zencas.edhr.workflow.repository.WorkflowDefinitionRepository;
import com.zencas.edhr.workflow.repository.WorkflowDefinitionVersionRepository;
import com.zencas.edhr.workflow.repository.WorkflowEdgeRepository;
import com.zencas.edhr.workflow.repository.WorkflowNodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Workflow template (definition) controller with full lifecycle management.
 */
@RestController
@RequestMapping("/api/v1/workflow/templates")
@RequiredArgsConstructor
public class WorkflowTemplateController {

    private final WorkflowDefinitionRepository workflowDefinitionRepository;
    private final WorkflowDefinitionVersionRepository versionRepository;
    private final WorkflowNodeRepository nodeRepository;
    private final WorkflowEdgeRepository edgeRepository;
    private final SnowflakeIdGenerator idGenerator;

    // ======================== Template CRUD ========================

    @GetMapping
    public ApiResponse<PageResult<WorkflowDefinition>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page - 1, size, Sort.by(direction, sort));
        Page<WorkflowDefinition> result = workflowDefinitionRepository.findAll(pageable);
        return ApiResponse.success(PageResult.of(
                result.getContent(), page, size, result.getTotalElements()));
    }

    @GetMapping("/{id}")
    public ApiResponse<WorkflowDefinition> getById(@PathVariable Long id) {
        return workflowDefinitionRepository.findById(id)
                .map(ApiResponse::success)
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_001));
    }

    @PostMapping
    public ApiResponse<WorkflowDefinition> create(@RequestBody WorkflowDefinition entity) {
        if (entity.getId() == null) {
            entity.setId(idGenerator.nextId());
        }
        return ApiResponse.success(workflowDefinitionRepository.save(entity));
    }

    @PutMapping("/{id}")
    public ApiResponse<WorkflowDefinition> update(@PathVariable Long id, @RequestBody WorkflowDefinition entity) {
        entity.setId(id);
        return ApiResponse.success(workflowDefinitionRepository.save(entity));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        workflowDefinitionRepository.deleteById(id);
        return ApiResponse.success(null);
    }

    // ======================== Version Management ========================

    /**
     * List all versions of a template, ordered by version number descending.
     */
    @GetMapping("/{id}/versions")
    public ApiResponse<List<WorkflowDefinitionVersion>> listVersions(@PathVariable Long id) {
        // Verify template exists
        workflowDefinitionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_001));
        List<WorkflowDefinitionVersion> versions = versionRepository
                .findByDefinitionIdOrderByVersionNumberDesc(id);
        return ApiResponse.success(versions);
    }

    /**
     * Get a specific version of a template.
     */
    @GetMapping("/{id}/versions/{versionId}")
    public ApiResponse<WorkflowDefinitionVersion> getVersion(
            @PathVariable Long id, @PathVariable Long versionId) {
        workflowDefinitionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_001));
        return versionRepository.findById(versionId)
                .map(ApiResponse::success)
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_010));
    }

    /**
     * Create a new draft version by copying the latest version's nodes and edges.
     */
    @PostMapping("/{id}/versions")
    @Transactional
    public ApiResponse<WorkflowDefinitionVersion> createDraftVersion(@PathVariable Long id) {
        workflowDefinitionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_001));

        // Find the latest version to copy from
        List<WorkflowDefinitionVersion> existingVersions = versionRepository
                .findByDefinitionIdOrderByVersionNumberDesc(id);
        int nextVersionNumber = existingVersions.isEmpty() ? 1 :
                existingVersions.get(0).getVersionNumber() + 1;

        // Create new version
        WorkflowDefinitionVersion newVersion = WorkflowDefinitionVersion.builder()
                .id(idGenerator.nextId())
                .definitionId(id)
                .versionNumber(nextVersionNumber)
                .status("DRAFT")
                .isCurrent(false)
                .createdAt(LocalDateTime.now())
                .build();

        // If there is a previous version, copy its nodes and edges
        if (!existingVersions.isEmpty()) {
            WorkflowDefinitionVersion previous = existingVersions.get(0);
            newVersion.setNodesJson(previous.getNodesJson());
            newVersion.setEdgesJson(previous.getEdgesJson());

            // Copy nodes and build old-to-new ID mapping
            Map<Long, Long> nodeIdMapping = new HashMap<>();
            List<WorkflowNode> previousNodes = nodeRepository.findByVersionId(previous.getId());
            for (WorkflowNode node : previousNodes) {
                long newNodeId = idGenerator.nextId();
                nodeIdMapping.put(node.getId(), newNodeId);
                WorkflowNode newNode = WorkflowNode.builder()
                        .id(newNodeId)
                        .versionId(newVersion.getId())
                        .nodeType(node.getNodeType())
                        .name(node.getName())
                        .positionX(node.getPositionX())
                        .positionY(node.getPositionY())
                        .properties(node.getProperties())
                        .sortOrder(node.getSortOrder())
                        .createdAt(LocalDateTime.now())
                        .build();
                nodeRepository.save(newNode);
            }

            // Copy edges, remapping source/target node IDs to the new versions
            List<WorkflowEdge> previousEdges = edgeRepository.findByVersionId(previous.getId());
            for (WorkflowEdge edge : previousEdges) {
                Long newSourceId = nodeIdMapping.get(edge.getSourceNodeId());
                Long newTargetId = nodeIdMapping.get(edge.getTargetNodeId());
                WorkflowEdge newEdge = WorkflowEdge.builder()
                        .id(idGenerator.nextId())
                        .versionId(newVersion.getId())
                        .sourceNodeId(newSourceId != null ? newSourceId : edge.getSourceNodeId())
                        .targetNodeId(newTargetId != null ? newTargetId : edge.getTargetNodeId())
                        .label(edge.getLabel())
                        .conditionExpression(edge.getConditionExpression())
                        .createdAt(LocalDateTime.now())
                        .build();
                edgeRepository.save(newEdge);
            }
        }

        versionRepository.save(newVersion);
        return ApiResponse.success(newVersion);
    }

    /**
     * Publish a draft version, making it the current active version.
     */
    @PostMapping("/{id}/versions/{versionId}/publish")
    @Transactional
    public ApiResponse<WorkflowDefinitionVersion> publishVersion(
            @PathVariable Long id, @PathVariable Long versionId) {
        workflowDefinitionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_001));

        WorkflowDefinitionVersion version = versionRepository.findById(versionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_010));

        if (!"DRAFT".equals(version.getStatus())) {
            throw new BusinessException(ErrorCode.WF_002, "只有草稿状态的版本才能发布");
        }

        // Unset current flag on all other versions
        List<WorkflowDefinitionVersion> allVersions = versionRepository
                .findByDefinitionIdOrderByVersionNumberDesc(id);
        for (WorkflowDefinitionVersion v : allVersions) {
            if (Boolean.TRUE.equals(v.getIsCurrent())) {
                v.setIsCurrent(false);
                versionRepository.save(v);
            }
        }

        // Publish this version
        version.setStatus("PUBLISHED");
        version.setIsCurrent(true);
        version.setPublishedAt(LocalDateTime.now());
        versionRepository.save(version);

        return ApiResponse.success(version);
    }

    /**
     * Revoke a published version, setting it back to draft.
     * If it was the current version, the previous published version becomes current.
     */
    @PostMapping("/{id}/versions/{versionId}/revoke")
    @Transactional
    public ApiResponse<WorkflowDefinitionVersion> revokeVersion(
            @PathVariable Long id, @PathVariable Long versionId) {
        workflowDefinitionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_001));

        WorkflowDefinitionVersion version = versionRepository.findById(versionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_010));

        if (!"PUBLISHED".equals(version.getStatus())) {
            throw new BusinessException(ErrorCode.GENERAL_003, "只有已发布状态的版本才能撤回");
        }

        boolean wasCurrent = Boolean.TRUE.equals(version.getIsCurrent());
        version.setStatus("REVOKED");
        version.setIsCurrent(false);
        versionRepository.save(version);

        // If this was the current version, promote the previous published version
        if (wasCurrent) {
            List<WorkflowDefinitionVersion> versions = versionRepository
                    .findByDefinitionIdOrderByVersionNumberDesc(id);
            for (WorkflowDefinitionVersion v : versions) {
                if ("PUBLISHED".equals(v.getStatus()) && !v.getId().equals(versionId)) {
                    v.setIsCurrent(true);
                    versionRepository.save(v);
                    break;
                }
            }
        }

        return ApiResponse.success(version);
    }
}
