package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;

class DhrSummaryServiceTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private DhrSummaryService service;

    @BeforeEach
    void setup() {
        service = new DhrSummaryService(mock(JdbcTemplate.class), mapper, mock(DhrInstanceService.class),
                mock(AuditEventRepository.class), mock(SnowflakeIdGenerator.class), mock(com.zencas.edhr.workflow.engine.WorkflowEngine.class),
                mock(DhrEvidenceImpactService.class), mock(DhrAttachmentService.class));
    }

    @Test
    void overlaySupportsArbitraryDepthButRejectsCycles() {
        ObjectNode base = baseDirectory();
        ArrayNode valid = mapper.createArrayNode()
                .add(directory("summary-dir-a", "base-dir-10", "附录"))
                .add(directory("summary-dir-b", "summary-dir-a", "检验附件"))
                .add(directory("summary-dir-c", "summary-dir-b", "原始数据"));

        assertThatCode(() -> invoke("validateOverlay", base, valid)).doesNotThrowAnyException();

        ArrayNode rootLevel = mapper.createArrayNode().add(directory("summary-dir-root", "", "孤立目录"));
        assertThatCode(() -> invoke("validateOverlay", base, rootLevel)).doesNotThrowAnyException();

        ArrayNode cycle = mapper.createArrayNode()
                .add(directory("summary-dir-a", "summary-dir-b", "A"))
                .add(directory("summary-dir-b", "summary-dir-a", "B"));
        assertThatThrownBy(() -> invoke("validateOverlay", base, cycle))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("循环层级");
    }

    @Test
    void placementsAutoIncludeEveryActualInstanceWithoutManualSelection() {
        ArrayNode candidates = mapper.createArrayNode()
                .add(candidate("100", "DIRECTORY", "COMPLETED", "20"))
                .add(candidate("101", "WORK", "COMPLETED", null))
                .add(candidate("102", "CUSTOM", "IN_PROGRESS", null));
        ArrayNode overlay = mapper.createArrayNode().add(directory("summary-dir-a", "base-dir-10", "附录"));
        ArrayNode placements = mapper.createArrayNode()
                .add(mapper.createObjectNode().put("recordId", "101").put("targetNodeKey", "summary-dir-a"));

        @SuppressWarnings("unchecked")
        Map<String, ObjectNode> result = invoke("validatePlacements", candidates, baseDirectory(), overlay, placements);

        assertThat(result).containsOnlyKeys("100", "101", "102");
        assertThat(result.get("100").path("targetNodeKey").asText()).isEqualTo("base-item-20");
        assertThat(result.get("101").path("targetNodeKey").asText()).isEqualTo("summary-dir-a");
        assertThat(result.get("102").path("targetNodeKey").asText()).isEqualTo("source-custom");
    }

    @Test
    void sameInstanceCannotBePlacedTwiceAndIncompleteEvidenceRemainsVisible() {
        ArrayNode candidates = mapper.createArrayNode().add(candidate("101", "WORK", "COMPLETED", null));
        ArrayNode duplicate = mapper.createArrayNode()
                .add(mapper.createObjectNode().put("recordId", "101").put("targetNodeKey", "base-dir-10"))
                .add(mapper.createObjectNode().put("recordId", "101").put("targetNodeKey", "base-dir-10"));
        assertThatThrownBy(() -> invoke("validatePlacements", candidates, baseDirectory(), mapper.createArrayNode(), duplicate))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("只能归入一个目录位置");

        ((ObjectNode) candidates.get(0)).put("status", "IN_PROGRESS");
        ArrayNode incomplete = mapper.createArrayNode()
                .add(mapper.createObjectNode().put("recordId", "101").put("targetNodeKey", "base-dir-10"));
        @SuppressWarnings("unchecked")
        Map<String, ObjectNode> result = invoke("validatePlacements", candidates, baseDirectory(), mapper.createArrayNode(), incomplete);
        assertThat(result.get("101").path("targetNodeKey").asText()).isEqualTo("base-dir-10");
    }

    @Test
    void placementOrderIsPreservedAndInsertionAnchorMustBelongToTargetDirectory() {
        ArrayNode candidates = mapper.createArrayNode()
                .add(candidate("101", "WORK", "COMPLETED", null))
                .add(candidate("102", "WORK", "COMPLETED", null));
        ArrayNode ordered = mapper.createArrayNode()
                .add(mapper.createObjectNode().put("recordId", "101").put("targetNodeKey", "base-dir-10")
                        .put("beforeNodeKey", "base-item-20").put("displayOrder", 0))
                .add(mapper.createObjectNode().put("recordId", "102").put("targetNodeKey", "base-dir-10")
                        .put("beforeNodeKey", "base-item-20").put("displayOrder", 1));
        @SuppressWarnings("unchecked")
        Map<String, ObjectNode> result = invoke("validatePlacements", candidates, baseDirectory(), mapper.createArrayNode(), ordered);
        assertThat(result.get("101").path("beforeNodeKey").asText()).isEqualTo("base-item-20");
        assertThat(result.get("102").path("displayOrder").asInt()).isEqualTo(1);

        ((ObjectNode) ordered.get(1)).put("displayOrder", 0);
        assertThatThrownBy(() -> invoke("validatePlacements", candidates, baseDirectory(), mapper.createArrayNode(), ordered))
                .isInstanceOf(BusinessException.class).hasMessageContaining("同一目录位置");
        ((ObjectNode) ordered.get(1)).put("displayOrder", 1);

        ArrayNode overlay = mapper.createArrayNode().add(directory("summary-dir-a", "base-dir-10", "附录"));
        ((ObjectNode) ordered.get(0)).put("targetNodeKey", "summary-dir-a");
        assertThatThrownBy(() -> invoke("validatePlacements", candidates, baseDirectory(), overlay, ordered))
                .isInstanceOf(BusinessException.class).hasMessageContaining("插入位置不属于目标目录");
        ((ObjectNode) ordered.get(0)).put("targetNodeKey", "base-dir-10").put("displayOrder", -1);
        assertThatThrownBy(() -> invoke("validatePlacements", candidates, baseDirectory(), overlay, ordered))
                .isInstanceOf(BusinessException.class).hasMessageContaining("排序无效");
    }

    @Test
    void sourceGroupingDoesNotRestrictIndividualPlacementOrOrder() {
        ObjectNode first = candidate("101", "WORK", "COMPLETED", null).put("operationId", "op-1").put("formId", "work-1-node-a");
        ObjectNode copy = candidate("102", "WORK", "COMPLETED", null).put("operationId", "op-1").put("formId", "work-1-node-a");
        ObjectNode otherNode = candidate("103", "WORK", "COMPLETED", null).put("operationId", "op-1").put("formId", "work-1-node-b");
        ObjectNode custom = candidate("104", "CUSTOM", "COMPLETED", null).put("operationId", "op-1").put("formId", "custom-1");
        ObjectNode customCopy = candidate("105", "CUSTOM", "COMPLETED", null).put("operationId", "op-1").put("formId", "custom-1");
        ArrayNode candidates = mapper.createArrayNode().add(first).add(copy).add(otherNode).add(custom).add(customCopy);
        ArrayNode placements = mapper.createArrayNode();
        placements.addObject().put("recordId", "101").put("targetNodeKey", "base-dir-10").put("displayOrder", 0);
        placements.addObject().put("recordId", "104").put("targetNodeKey", "base-dir-10").put("displayOrder", 1);
        assertThatCode(() -> invoke("validatePlacements", candidates, baseDirectory(), mapper.createArrayNode(), placements))
                .doesNotThrowAnyException(); // partial work and custom groups
        placements.addObject().put("recordId", "102").put("targetNodeKey", "base-dir-10").put("displayOrder", 2);
        assertThatCode(() -> invoke("validatePlacements", candidates, baseDirectory(), mapper.createArrayNode(), placements))
                .doesNotThrowAnyException(); // interleaved sources preserve their actual order
        ArrayNode overlay = mapper.createArrayNode().add(directory("summary-dir-a", "base-dir-10", "附录"));
        ((ObjectNode) placements.get(2)).put("targetNodeKey", "summary-dir-a");
        assertThatCode(() -> invoke("validatePlacements", candidates, baseDirectory(), overlay, placements)).doesNotThrowAnyException();
        copy.put("status", "ACTIVE");
        assertThatCode(() -> invoke("validatePlacements", candidates, baseDirectory(), overlay, placements)).doesNotThrowAnyException();
    }

    @Test
    void requiredBaseDirectoryItemMustContainACompletedDirectInstance() {
        ObjectNode detail = mapper.createObjectNode();
        detail.set("directorySnapshot", baseDirectory());
        assertThatThrownBy(() -> invoke("ensureRequiredDirectoryItems", detail, Map.of()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("装配记录");

        ObjectNode record = mapper.createObjectNode().put("id", "100").put("status", "COMPLETED");
        ((ArrayNode) detail.at("/directorySnapshot/directories/0/items/0/records")).add(record);
        assertThatCode(() -> invoke("ensureRequiredDirectoryItems", detail,
                Map.of("100", mapper.createObjectNode().put("recordId", "100").put("targetNodeKey", "base-item-20"))))
                .doesNotThrowAnyException();
    }

    @Test
    void existingDraftRequiresExplicitMatchingRevision() {
        assertThatThrownBy(() -> invoke("nextRevision", mapper.createObjectNode(), 1))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("其他操作创建");
        assertThatThrownBy(() -> invoke("nextRevision", mapper.createObjectNode().put("revision", 1), 2))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("其他操作更新");
        assertThat((Integer) invoke("nextRevision", mapper.createObjectNode().put("revision", 2), 2)).isEqualTo(3);
    }

    @Test
    void submitRequiresTheExactSavedDraftRevision() {
        assertThatThrownBy(() -> invoke("requireExpectedRevision", mapper.createObjectNode(), 3))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("刷新后重试");
        assertThatThrownBy(() -> invoke("requireExpectedRevision", mapper.createObjectNode().put("expectedRevision", 2), 3))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("刷新后重试");
        assertThatCode(() -> invoke("requireExpectedRevision", mapper.createObjectNode().put("expectedRevision", 3), 3))
                .doesNotThrowAnyException();
    }

    private ObjectNode baseDirectory() {
        ObjectNode base = mapper.createObjectNode();
        ObjectNode directory = base.putArray("directories").addObject().put("id", "10").put("name", "生产记录");
        directory.putArray("items").addObject().put("id", "20").put("displayName", "装配记录")
                .put("formName", "装配记录").put("required", true).putArray("records");
        return base;
    }

    private ObjectNode directory(String key, String parentKey, String name) {
        return mapper.createObjectNode().put("key", key).put("parentKey", parentKey).put("name", name).put("sortOrder", 1);
    }

    private ObjectNode candidate(String id, String origin, String status, String dhrItemId) {
        ObjectNode candidate = mapper.createObjectNode().put("id", id).put("originKind", origin).put("status", status);
        ObjectNode snapshot = candidate.putObject("snapshot");
        if (dhrItemId != null) snapshot.put("dhrItemId", dhrItemId);
        return candidate;
    }

    @SuppressWarnings("unchecked")
    private <T> T invoke(String method, Object... arguments) {
        return (T) ReflectionTestUtils.invokeMethod(service, method, arguments);
    }
}
