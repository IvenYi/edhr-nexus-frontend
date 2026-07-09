package com.zencas.edhr.system.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.system.entity.BusinessDictionary;
import com.zencas.edhr.system.entity.BusinessDictionaryItem;
import com.zencas.edhr.system.repository.BusinessDictionaryItemRepository;
import com.zencas.edhr.system.repository.BusinessDictionaryRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayDeque;
import java.util.List;
import java.util.Optional;
import java.util.Queue;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BusinessDictionaryControllerTest {

    @Mock private BusinessDictionaryRepository dictionaryRepository;
    @Mock private BusinessDictionaryItemRepository itemRepository;
    @Mock private AuditEventRepository auditEventRepository;
    private DeterministicSnowflakeIdGenerator idGenerator;
    private BusinessDictionaryController controller;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        idGenerator = new DeterministicSnowflakeIdGenerator();
        controller = new BusinessDictionaryController(dictionaryRepository, itemRepository, auditEventRepository, idGenerator);
    }

    @AfterEach
    void clearAuditContext() {
        AuditContext.clear();
    }

    @Test
    void createsDictionaryWithStringIdAndAudit() throws Exception {
        AuditContext.setOperator("1", "系统管理员", "admin");
        when(dictionaryRepository.existsByTenantIdAndCode("default", "MATERIAL_STATUS")).thenReturn(false);
        idGenerator.given(340800000000000001L, 340800000000000002L);
        when(dictionaryRepository.save(any(BusinessDictionary.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.createDictionary(new BusinessDictionaryController.DictionaryRequest(
                "MATERIAL_STATUS",
                "物料状态",
                "物料生命周期状态",
                "ACTIVE",
                10));

        assertThat(response.getData().id()).isEqualTo("340800000000000001");
        assertThat(response.getData().code()).isEqualTo("MATERIAL_STATUS");
        assertThat(response.getData().name()).isEqualTo("物料状态");
        assertThat(response.getData().createdBy()).isEqualTo("系统管理员");
        assertThat(response.getData().updatedBy()).isEqualTo("系统管理员");

        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        AuditEvent event = auditCaptor.getValue();
        assertThat(event.getEntityType()).isEqualTo("BUSINESS_DICTIONARY");
        assertThat(event.getModuleName()).isEqualTo("系统");
        assertThat(event.getMenuName()).isEqualTo("业务字典");
        assertThat(event.getFunctionName()).isEqualTo("新增业务字典");
        assertThat(objectMapper.readTree(event.getContentAfter()).get("name").asText()).isEqualTo("物料状态");
    }

    @Test
    void refusesDuplicateDictionaryCodeWithinTenant() {
        when(dictionaryRepository.existsByTenantIdAndCode("default", "MATERIAL_STATUS")).thenReturn(true);

        assertThatThrownBy(() -> controller.createDictionary(new BusinessDictionaryController.DictionaryRequest(
                "MATERIAL_STATUS",
                "物料状态",
                null,
                "ACTIVE",
                null)))
                .isInstanceOf(BusinessException.class)
                .hasMessage("业务字典编码已存在");

        verify(dictionaryRepository, never()).save(any(BusinessDictionary.class));
        verify(auditEventRepository, never()).save(any(AuditEvent.class));
    }

    @Test
    void createsDictionaryItemUnderDictionaryAndAudit() throws Exception {
        AuditContext.setOperator("1", "系统管理员", "admin");
        BusinessDictionary dictionary = BusinessDictionary.builder()
                .id(101L)
                .tenantId("default")
                .code("MATERIAL_STATUS")
                .name("物料状态")
                .status("ACTIVE")
                .build();
        when(dictionaryRepository.findById(101L)).thenReturn(Optional.of(dictionary));
        when(itemRepository.existsByDictionaryIdAndValue(101L, "ACTIVE")).thenReturn(false);
        idGenerator.given(340800000000000011L, 340800000000000012L);
        when(itemRepository.save(any(BusinessDictionaryItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.createItem(101L, new BusinessDictionaryController.DictionaryItemRequest(
                "ACTIVE",
                "启用",
                1,
                "ACTIVE",
                "可选择"));

        assertThat(response.getData().id()).isEqualTo("340800000000000011");
        assertThat(response.getData().dictionaryId()).isEqualTo("101");
        assertThat(response.getData().dictionaryCode()).isEqualTo("MATERIAL_STATUS");
        assertThat(response.getData().label()).isEqualTo("启用");

        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        AuditEvent event = auditCaptor.getValue();
        assertThat(event.getEntityType()).isEqualTo("BUSINESS_DICTIONARY_ITEM");
        assertThat(event.getFunctionName()).isEqualTo("新增字典项");
        assertThat(objectMapper.readTree(event.getContentAfter()).get("dictionaryName").asText()).isEqualTo("物料状态");
        assertThat(objectMapper.readTree(event.getContentAfter()).get("dictionaryCode").asText()).isEqualTo("MATERIAL_STATUS");
    }

    @Test
    void refusesPartialDictionaryItemReorderToAvoidPagedSortCorruption() {
        BusinessDictionary dictionary = BusinessDictionary.builder()
                .id(101L)
                .tenantId("default")
                .code("MATERIAL_STATUS")
                .name("物料状态")
                .status("ACTIVE")
                .build();
        BusinessDictionaryItem first = BusinessDictionaryItem.builder()
                .id(201L)
                .dictionaryId(101L)
                .value("ACTIVE")
                .label("启用")
                .sortOrder(1)
                .status("ACTIVE")
                .build();
        BusinessDictionaryItem second = BusinessDictionaryItem.builder()
                .id(202L)
                .dictionaryId(101L)
                .value("DISABLED")
                .label("禁用")
                .sortOrder(2)
                .status("ACTIVE")
                .build();
        BusinessDictionaryItem third = BusinessDictionaryItem.builder()
                .id(203L)
                .dictionaryId(101L)
                .value("LOCKED")
                .label("锁定")
                .sortOrder(3)
                .status("ACTIVE")
                .build();
        when(dictionaryRepository.findById(101L)).thenReturn(Optional.of(dictionary));
        when(itemRepository.findByDictionaryIdOrderBySortOrderAscCreatedAtAsc(101L)).thenReturn(List.of(first, second, third));

        assertThatThrownBy(() -> controller.reorderItems(new BusinessDictionaryController.DictionaryItemOrderRequest(
                101L,
                List.of(202L, 201L))))
                .isInstanceOf(BusinessException.class)
                .hasMessage("请提交当前字典下全部字典项后再调整排序");

        verify(itemRepository, never()).saveAll(any());
        verify(auditEventRepository, never()).save(any(AuditEvent.class));
    }

    @Test
    void recordsReorderAuditOnDictionaryWithBeforeAndAfterItemSnapshots() throws Exception {
        AuditContext.setOperator("1", "系统管理员", "admin");
        BusinessDictionary dictionary = BusinessDictionary.builder()
                .id(101L)
                .tenantId("default")
                .code("MATERIAL_STATUS")
                .name("物料状态")
                .status("ACTIVE")
                .build();
        BusinessDictionaryItem first = BusinessDictionaryItem.builder()
                .id(201L)
                .dictionaryId(101L)
                .value("ACTIVE")
                .label("启用")
                .sortOrder(1)
                .status("ACTIVE")
                .build();
        BusinessDictionaryItem second = BusinessDictionaryItem.builder()
                .id(202L)
                .dictionaryId(101L)
                .value("DISABLED")
                .label("禁用")
                .sortOrder(2)
                .status("ACTIVE")
                .build();
        when(dictionaryRepository.findById(101L)).thenReturn(Optional.of(dictionary));
        when(itemRepository.findByDictionaryIdOrderBySortOrderAscCreatedAtAsc(101L)).thenReturn(List.of(first, second));
        when(itemRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        idGenerator.given(340800000000000031L);

        var response = controller.reorderItems(new BusinessDictionaryController.DictionaryItemOrderRequest(
                101L,
                List.of(202L, 201L)));

        assertThat(response.getData()).extracting(BusinessDictionaryController.DictionaryItemResponse::id)
                .containsExactly("202", "201");
        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        AuditEvent event = auditCaptor.getValue();
        assertThat(event.getEntityType()).isEqualTo("BUSINESS_DICTIONARY");
        assertThat(event.getEntityId()).isEqualTo("101");
        assertThat(event.getAction()).isEqualTo("REORDER");
        assertThat(event.getFunctionName()).isEqualTo("调整字典项排序");
        assertThat(objectMapper.readTree(event.getContentBefore()).get("items").get(0).get("dictionaryName").asText()).isEqualTo("物料状态");
        assertThat(objectMapper.readTree(event.getContentAfter()).get("items").get(0).get("label").asText()).isEqualTo("禁用");
        assertThat(objectMapper.readTree(event.getContentAfter()).get("items").get(0).get("sortOrder").asInt()).isEqualTo(1);
    }

    @Test
    void updatesDictionaryWithOnlyChangedFieldsInAudit() throws Exception {
        AuditContext.setOperator("1", "系统管理员", "admin");
        BusinessDictionary dictionary = BusinessDictionary.builder()
                .id(101L)
                .tenantId("default")
                .code("MATERIAL_STATUS")
                .name("物料状态")
                .description("旧说明")
                .status("ACTIVE")
                .sortOrder(10)
                .createdBy("张三")
                .createdAt(LocalDateTime.of(2026, 6, 10, 9, 0))
                .updatedBy("张三")
                .updatedAt(LocalDateTime.of(2026, 6, 10, 9, 0))
                .build();
        when(dictionaryRepository.findById(101L)).thenReturn(Optional.of(dictionary));
        when(dictionaryRepository.save(dictionary)).thenAnswer(invocation -> invocation.getArgument(0));
        when(itemRepository.findByDictionaryIdOrderBySortOrderAscCreatedAtAsc(101L)).thenReturn(List.of());
        idGenerator.given(340800000000000021L);

        var response = controller.updateDictionary(101L, new BusinessDictionaryController.DictionaryRequest(
                "MATERIAL_STATUS",
                "物料状态",
                "新说明",
                "ACTIVE",
                10));

        assertThat(response.getData().description()).isEqualTo("新说明");
        assertThat(response.getData().updatedBy()).isEqualTo("系统管理员");

        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        AuditEvent event = auditCaptor.getValue();
        assertThat(event.getEntityType()).isEqualTo("BUSINESS_DICTIONARY");
        assertThat(event.getAction()).isEqualTo("UPDATE");
        assertThat(objectMapper.readTree(event.getContentBefore()).fieldNames()).toIterable().containsExactly("description");
        assertThat(objectMapper.readTree(event.getContentAfter()).fieldNames()).toIterable().containsExactly("description");
        assertThat(objectMapper.readTree(event.getContentBefore()).get("description").asText()).isEqualTo("旧说明");
        assertThat(objectMapper.readTree(event.getContentAfter()).get("description").asText()).isEqualTo("新说明");
    }

    @Test
    void listsEnabledOptionsByDictionaryCodeForBusinessReferences() {
        BusinessDictionary dictionary = BusinessDictionary.builder()
                .id(101L)
                .tenantId("default")
                .code("MATERIAL_STATUS")
                .name("物料状态")
                .status("ACTIVE")
                .build();
        BusinessDictionaryItem enabled = BusinessDictionaryItem.builder()
                .id(201L)
                .dictionaryId(101L)
                .value("ACTIVE")
                .label("启用")
                .sortOrder(1)
                .status("ACTIVE")
                .createdAt(LocalDateTime.of(2026, 6, 15, 10, 0))
                .build();
        BusinessDictionaryItem disabled = BusinessDictionaryItem.builder()
                .id(202L)
                .dictionaryId(101L)
                .value("DISABLED")
                .label("禁用")
                .sortOrder(2)
                .status("DISABLED")
                .build();
        when(dictionaryRepository.findByTenantIdAndCode("default", "MATERIAL_STATUS")).thenReturn(Optional.of(dictionary));
        when(itemRepository.findByDictionaryIdOrderBySortOrderAscCreatedAtAsc(101L)).thenReturn(List.of(enabled, disabled));

        var response = controller.listOptions("MATERIAL_STATUS");

        assertThat(response.getData()).hasSize(1);
        assertThat(response.getData().getFirst().value()).isEqualTo("ACTIVE");
        assertThat(response.getData().getFirst().label()).isEqualTo("启用");
        assertThat(response.getData().getFirst().dictionaryCode()).isEqualTo("MATERIAL_STATUS");
    }

    @Test
    void refusesToDeleteDictionaryWithItemsWithoutCascade() {
        BusinessDictionary dictionary = BusinessDictionary.builder()
                .id(101L)
                .tenantId("default")
                .code("MATERIAL_STATUS")
                .name("物料状态")
                .status("ACTIVE")
                .build();
        when(dictionaryRepository.findById(101L)).thenReturn(Optional.of(dictionary));
        when(itemRepository.existsByDictionaryId(101L)).thenReturn(true);

        assertThatThrownBy(() -> controller.deleteDictionary(101L, false))
                .isInstanceOf(BusinessException.class)
                .hasMessage("字典下存在字典项，不能删除");

        verify(dictionaryRepository, never()).deleteById(101L);
        verify(auditEventRepository, never()).save(any(AuditEvent.class));
    }

    private static class DeterministicSnowflakeIdGenerator extends SnowflakeIdGenerator {
        private final Queue<Long> ids = new ArrayDeque<>();

        DeterministicSnowflakeIdGenerator() {
            super(1);
        }

        void given(Long... nextIds) {
            ids.addAll(List.of(nextIds));
        }

        @Override
        public synchronized long nextId() {
            Long next = ids.poll();
            return next == null ? super.nextId() : next;
        }
    }
}
