import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.workflow.controller.WorkTemplateController;
import com.zencas.edhr.workflow.entity.WorkflowDefinition;
import com.zencas.edhr.workflow.entity.WorkflowDefinitionVersion;
import com.zencas.edhr.workflow.repository.WorkflowDefinitionRepository;
import com.zencas.edhr.workflow.repository.WorkflowDefinitionVersionRepository;
import com.zencas.edhr.workflow.repository.WorkflowBindingRuleRepository;
import com.zencas.edhr.workflow.service.FormFillSettingsService;
import com.zencas.edhr.workflow.service.FormProcessReferenceService;
import com.zencas.edhr.template.entity.FormTemplateVersion;
import com.zencas.edhr.template.repository.FormTemplateVersionRepository;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import static org.mockito.Mockito.*;

public class W3BindingMetadataProbe {
  public static void main(String[] args) throws Exception {
    var mapper = new ObjectMapper();
    List<Map<String,Object>> results = new ArrayList<>();
    for (String metadata : List.of("{}", "null", "\"unexpected\"", "[]", "not-json", "[{\"id\":\"entry\",\"data\":{\"kind\":\"START\",\"config\":{\"permissionGroupRules\":[{\"id\":\"current\"}]}}}]")) {
      var definitions=mock(WorkflowDefinitionRepository.class);
      var versions=mock(WorkflowDefinitionVersionRepository.class);
      var forms=mock(FormTemplateVersionRepository.class);
      var audits=mock(AuditEventRepository.class);
      var projections=mock(FormProcessReferenceService.class);
      var settingsService=new FormFillSettingsService(mapper,versions,definitions,forms);
      var controller=new WorkTemplateController(definitions,versions,mock(WorkflowBindingRuleRepository.class),audits,forms,projections,settingsService,mock(SnowflakeIdGenerator.class),mapper);
      var work=WorkflowDefinition.builder().id(101L).type("WORK").build();
      var draft=WorkflowDefinitionVersion.builder().id(201L).definitionId(101L).versionNumber(1).status("DRAFT").nodesJson("[]").edgesJson("[]").build();
      when(definitions.findByIdForUpdate(101L)).thenReturn(Optional.of(work));
      when(versions.findById(201L)).thenReturn(Optional.of(draft));
      when(versions.findById(901L)).thenReturn(Optional.of(WorkflowDefinitionVersion.builder().id(901L).definitionId(902L).status("PUBLISHED").nodesJson(metadata).build()));
      when(definitions.findById(902L)).thenReturn(Optional.of(WorkflowDefinition.builder().id(902L).type("FORM_PROCESS").build()));
      when(forms.findById(702L)).thenReturn(Optional.of(FormTemplateVersion.builder().id(702L).modelDesignJson("{\"fields\":[{\"id\":\"keep\",\"type\":\"text\"}]}").build()));
      when(versions.save(any(WorkflowDefinitionVersion.class))).thenAnswer(invocation->invocation.getArgument(0));
      var settings=mapper.readTree("{\"fillMode\":\"PROCESS\",\"formTemplateVersionId\":\"702\",\"formProcessVersionId\":\"901\",\"fieldPermissions\":{\"start:removed\":{\"editableFieldIds\":[\"keep\"]}}}");
      Map<String,Object> payload=Map.of("nodes",List.of(Map.of("id","start","data",Map.of("kind","START")),Map.of("id","form","data",Map.of("kind","FORM","config",settings)),Map.of("id","end","data",Map.of("kind","END"))),"edges",List.of());
      String error=null;
      try { controller.saveGraph(101L,201L,payload); } catch (Exception exception) { error=exception.getClass().getSimpleName()+": "+exception.getMessage(); }
      long saves=mockingDetails(versions).getInvocations().stream().filter(i->i.getMethod().getName().equals("save")).count();
      long auditWrites=mockingDetails(audits).getInvocations().stream().filter(i->i.getMethod().getName().equals("save")).count();
      long projectionWrites=mockingDetails(projections).getInvocations().stream().filter(i->i.getMethod().getName().equals("rebuildForWorkVersion")).count();
      Map<String,Object> result=new LinkedHashMap<>();
      result.put("metadata",metadata); result.put("rejected",error!=null); result.put("error",error);
      result.put("versionSaveCalls",saves); result.put("auditSaveCalls",auditWrites); result.put("projectionRebuildCalls",projectionWrites);
      result.put("graphMutated",!"[]".equals(draft.getNodesJson())); result.put("staleGroupInGraph",draft.getNodesJson().contains("start:removed"));
      result.put("expectedRejectBeforeAnyWrite",error!=null&&saves==0&&auditWrites==0&&projectionWrites==0&&"[]".equals(draft.getNodesJson()));
      results.add(result);
    }
    Map<String,Object> report=Map.of("headCommit","a9ecd501a9abf354df95df2a1a01e53474a41a2d","scope","Actual candidate-compiled WorkTemplateController and FormFillSettingsService; repository mocks count persistence/audit/projection commands, no real DB/HTTP; all referenced records exist and process is PUBLISHED FORM_PROCESS.","results",results);
    String json=mapper.writerWithDefaultPrettyPrinter().writeValueAsString(report)+"\n";
    Files.writeString(Path.of("/tmp/edhr-w3b-final-independent-malformed-process-metadata.json"),json);
    System.out.print(json);
    if(results.stream().anyMatch(result->!Boolean.TRUE.equals(result.get("expectedRejectBeforeAnyWrite")))) throw new AssertionError("PUBLISHED process metadata of non-array shape bypasses draft reference rejection and reaches persistence/audit.");
  }
}
