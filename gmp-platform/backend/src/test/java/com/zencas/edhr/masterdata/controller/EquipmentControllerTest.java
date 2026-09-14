package com.zencas.edhr.masterdata.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.masterdata.repository.EquipmentCategoryRepository;
import com.zencas.edhr.masterdata.repository.EquipmentRepository;
import com.zencas.edhr.masterdata.repository.EquipmentTypeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class EquipmentControllerTest {
    @Mock EquipmentRepository equipment;
    @Mock EquipmentTypeRepository types;
    @Mock EquipmentCategoryRepository categories;
    @Mock AuditEventRepository audits;
    EquipmentController controller;

    @BeforeEach
    void setUp() {
        controller = new EquipmentController(equipment, types, categories, audits, new SnowflakeIdGenerator(1), new ObjectMapper());
    }

    @Test
    void rejectsBlankAndOversizedCategoryNamesBeforeDatabaseAccess() {
        for (String name : new String[]{null, " \t", "类".repeat(129)}) {
            assertThatThrownBy(() -> controller.createCategory(new EquipmentController.CategoryRequest(name)))
                    .isInstanceOf(BusinessException.class);
        }
        verifyNoInteractions(categories, types, equipment, audits);
    }

    @Test
    void rejectsMissingOrMalformedParentReferenceBeforeDatabaseAccess() {
        for (String parent : new String[]{null, "", "unknown", "9223372036854775808"}) {
            assertThatThrownBy(() -> controller.createType(new EquipmentController.TypeRequest("T001", "注塑机", parent)))
                    .isInstanceOf(BusinessException.class).hasMessage("请选择有效的设备分类");
        }
        verifyNoInteractions(categories, types, equipment, audits);
    }

    @Test
    void rejectsOversizedDeviceFieldsAndUnknownStatusBeforeParentLock() {
        assertThatThrownBy(() -> controller.create(new EquipmentController.EquipmentRequest("E001", "注塑机001", "1", "M".repeat(129), null, "ACTIVE", null, null)))
                .isInstanceOf(BusinessException.class).hasMessage("型号不能超过128个字符");
        assertThatThrownBy(() -> controller.create(new EquipmentController.EquipmentRequest("E001", "注塑机001", "1", null, null, "BROKEN", null, null)))
                .isInstanceOf(BusinessException.class).hasMessage("设备状态只能是启用或停用");
        verifyNoInteractions(categories, types, equipment, audits);
    }
}
