package com.zencas.edhr.workflow.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.template.entity.FormTemplateVersion;
import com.zencas.edhr.template.repository.FormTemplateVersionRepository;
import com.zencas.edhr.workflow.entity.WorkflowDefinition;
import com.zencas.edhr.workflow.entity.WorkflowDefinitionVersion;
import com.zencas.edhr.workflow.repository.WorkflowDefinitionRepository;
import com.zencas.edhr.workflow.repository.WorkflowDefinitionVersionRepository;
import org.junit.jupiter.api.Test;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class FormFillSettingsServiceTest {
    final ObjectMapper mapper = new ObjectMapper();
    final WorkflowDefinitionVersionRepository versions = mock(WorkflowDefinitionVersionRepository.class);
    final WorkflowDefinitionRepository definitions = mock(WorkflowDefinitionRepository.class);
    final FormTemplateVersionRepository forms = mock(FormTemplateVersionRepository.class);
    final FormFillSettingsService service = new FormFillSettingsService(mapper, versions, definitions, forms);

    ObjectNode direct() throws Exception {
        when(forms.findById(1L)).thenReturn(Optional.of(FormTemplateVersion.builder().id(1L)
                .modelDesignJson("{\"fields\":[{\"id\":\"f\",\"type\":\"text\"},{\"id\":\"sig\",\"type\":\"signature\"}]}").build()));
        return (ObjectNode) mapper.readTree("""
            {"fillMode":"DIRECT","directFillConfig":{
              "permissionGroupRules":[{"id":"g","group":"user:1","subjects":[{"type":"USER","id":"1"}],"defaultPermission":"READ_ONLY"}],
              "fieldPermissions":{"start:g":{"editableFieldIds":["f"]}},
              "buttons":[{"id":"submit","label":"提交签署","action":"SUBMIT"}],
              "buttonEvents":[{"id":"sign","event":"BEFORE","action":"SUBMIT","builtin":"FILL_SIGN_FIELD","signatureMethod":"ACCOUNT_PASSWORD"}],
              "eventBindings":{"entry:sign":{"fieldId":"sig"}}}}
            """);
    }

    @Test void roundTripsDirectSettingsAndIgnoresDormantProcessChoice() throws Exception {
        var value = direct().put("formProcessVersionId", "999");
        assertThat(service.parse(service.serialize(value, 1L))).isEqualTo(value);
        assertThat(service.directNode(value).path("data").path("config")).isEqualTo(value.path("directFillConfig"));
        verifyNoInteractions(versions, definitions);
    }

    @Test void savesExplicitDefaultWithoutInferringFromDormantReference() throws Exception {
        direct();
        assertThat(service.parse(service.serialize(null, 1L)).path("fillMode").asText()).isEqualTo("DIRECT");
        assertThat(FormFillSettingsService.usesProcess(mapper.readTree("{\"formProcessVersionId\":\"2\"}"))).isFalse();
    }

    @Test void disabledSignatureEventDoesNotRequireAFieldBinding() throws Exception {
        var value = direct();
        ((ObjectNode) value.at("/directFillConfig/buttonEvents/0")).put("enabled", false);
        value.withObject("/directFillConfig").remove("eventBindings");
        service.validate(value, 1L);
    }

    @Test void accountPasswordSignatureWithoutFieldFillDoesNotRequireAFieldBinding() throws Exception {
        var value = direct();
        ((ObjectNode) value.at("/directFillConfig/buttonEvents/0")).put("builtin", "NONE");
        value.withObject("/directFillConfig").remove("eventBindings");
        service.validate(value, 1L);
    }

    @Test void rejectsUnknownFieldAndRemovedPermissionGroup() throws Exception {
        var value = direct();
        ((ObjectNode) value.at("/directFillConfig/fieldPermissions/start:g")).putArray("readOnlyFieldIds").add("missing");
        assertThatThrownBy(() -> service.validate(value, 1L)).hasMessageContaining("字段不存在");
        value.withObject("/directFillConfig").putArray("permissionGroupRules");
        assertThatThrownBy(() -> service.validate(value, 1L)).hasMessageContaining("权限组不存在");
    }

    @Test void requiresSignatureFieldBindingAndValidSubjects() throws Exception {
        var value = direct();
        value.withObject("/directFillConfig").remove("eventBindings");
        assertThatThrownBy(() -> service.validate(value, 1L)).hasMessageContaining("签名字段");
        ((ObjectNode) value.at("/directFillConfig/permissionGroupRules/0")).putArray("subjects");
        assertThatThrownBy(() -> service.validate(value, 1L)).hasMessageContaining("必须选择主体");
    }

    @Test void rejectsDuplicateActionsAndDisablingValidation() throws Exception {
        var value = direct();
        value.withObject("/directFillConfig").withArray("buttons").addObject().put("id", "other").put("label", "另一提交").put("action", "SUBMIT");
        assertThatThrownBy(() -> service.validate(value, 1L)).hasMessageContaining("只能配置一个按钮");
        value.withObject("/directFillConfig").put("guardMode", "NONE");
        assertThatThrownBy(() -> service.validate(value, 1L)).hasMessageContaining("必须通过表单校验");
    }

    @Test void processModeRequiresPublishedFormProcessAndUsesOnlyItsSettings() throws Exception {
        var value = direct().put("fillMode", "PROCESS");
        assertThatThrownBy(() -> service.validate(value, 1L)).hasMessageContaining("请选择已发布");
        value.put("formProcessVersionId", "2");
        var version = WorkflowDefinitionVersion.builder().id(2L).definitionId(3L).status("DRAFT")
                .nodesJson("[{\"id\":\"s\",\"data\":{\"kind\":\"START\"}}]").build();
        when(versions.findById(2L)).thenReturn(Optional.of(version));
        when(definitions.findById(3L)).thenReturn(Optional.of(WorkflowDefinition.builder().id(3L).type("FORM_PROCESS").build()));
        assertThatThrownBy(() -> service.validate(value, 1L)).hasMessageContaining("只能绑定已发布");
        version.setStatus("PUBLISHED");
        value.withObject("/directFillConfig").put("guardMode", "NONE");
        service.validate(value, 1L);
        assertThat(service.activeBinding(value)).isSameAs(value);
    }

    @Test void processModeBindsOnlyExplicitFieldFillEvents() throws Exception {
        var value = direct().put("fillMode", "PROCESS").put("formProcessVersionId", "2");
        value.remove("eventBindings");
        var version = WorkflowDefinitionVersion.builder().id(2L).definitionId(3L).status("PUBLISHED")
                .nodesJson("""
                    [{"id":"start","data":{"kind":"START","config":{"buttonEvents":[
                      {"id":"plain","event":"BEFORE","action":"SUBMIT","builtin":"NONE","signatureMethod":"ACCOUNT_PASSWORD"}]}}},
                     {"id":"first","data":{"kind":"APPROVAL","config":{"buttonEvents":[
                      {"id":"legacy","event":"BEFORE","action":"APPROVE","signatureMethod":"ACCOUNT_PASSWORD"}]}}},
                     {"id":"last","data":{"kind":"APPROVAL","config":{"buttonEvents":[
                      {"id":"fill","event":"BEFORE","action":"APPROVE","builtin":"FILL_SIGN_FIELD","signatureMethod":"ACCOUNT_PASSWORD"}]}}}]
                    """).build();
        when(versions.findById(2L)).thenReturn(Optional.of(version));
        when(definitions.findById(3L)).thenReturn(Optional.of(WorkflowDefinition.builder().id(3L).type("FORM_PROCESS").build()));
        assertThatThrownBy(() -> service.validate(value, 1L)).hasMessageContaining("签名字段");
        value.withObject("/eventBindings").putObject("last:fill").put("fieldId", "sig");
        service.validate(value, 1L);
    }
}
