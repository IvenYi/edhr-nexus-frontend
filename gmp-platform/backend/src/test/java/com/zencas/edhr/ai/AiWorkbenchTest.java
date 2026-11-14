package com.zencas.edhr.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class AiWorkbenchTest {
    private final ObjectMapper mapper=new ObjectMapper();
    @Test void patchSupportsEscapedPropertiesAndArrayEditsWithoutChangingInput() throws Exception {
        var original=mapper.readTree("{\"a/b\":{\"~key\":1},\"items\":[1,2],\"keep\":{\"x\":true}}");
        var edits=mapper.readTree("""
          [{"op":"replace","path":"/a~1b/~0key","value":3},{"op":"remove","path":"/items/0"},{"op":"add","path":"/items/-","value":4}]
          """);
        var changed=AiDesignPatch.apply(original,edits);
        assertThat(changed.at("/items").toString()).isEqualTo("[2,4]");assertThat(changed.at("/a~1b/~0key").asInt()).isEqualTo(3);
        assertThat(changed.path("keep")).isEqualTo(original.path("keep"));assertThat(original.at("/a~1b/~0key").asInt()).isEqualTo(1);
    }
    @Test void patchRejectsMissingPathRootReplacementAndFailedIdentityTest() throws Exception {
        var model=mapper.readTree("{\"fields\":[{\"id\":\"original\"}]}");
        for(String edit:java.util.List.of("{\"op\":\"remove\",\"path\":\"/fields/4\"}","{\"op\":\"replace\",\"path\":\"\",\"value\":{}}","{\"op\":\"test\",\"path\":\"/fields/0/id\",\"value\":\"wrong\"}")) {
            var edits=mapper.readTree("["+edit+"]");assertThatThrownBy(()->AiDesignPatch.apply(model,edits)).isInstanceOf(AiException.class);
        }
        assertThat(model.path("fields").get(0).path("id").asText()).isEqualTo("original");
    }
    @Test void semanticChecksRejectDuplicateIdsDanglingCanvasAndUnknownReferences() throws Exception {
        var model=mapper.readTree("""
          {"fields":[{"id":"a","type":"reference","typeConfig":{"sourceType":"invented"}}, {"id":"a","type":"text"}]}
          """);
        var canvas=mapper.readTree("{\"pages\":[{\"nodes\":[{\"id\":\"n\",\"bindings\":{\"fieldId\":\"missing\"}}]}]}");
        assertThat(AiFormAnalysis.inspect(model,canvas,mapper).toString()).contains("FIELD_ID","DANGLING_CANVAS_FIELD","REFERENCE_SOURCE");
    }
    @Test void nativeTraceCardinalityIsUsedAndPoliciesAreNotInvented() throws Exception {
        var model=mapper.readTree("""
          {"fields":[{"id":"lot","name":"批号","type":"text","status":"enabled"}],"projection":{"version":"form-projection-v1","bindings":[
          {"id":"a","enabled":true,"modelId":"formTrace","sources":{"materialLotText":"lot"}},
          {"id":"b","enabled":true,"modelId":"formTrace","sources":{"equipmentText":"lot"}}]}}
          """);
        assertThat(AiFormAnalysis.inspect(model,mapper.readTree("{\"pages\":[{}]}"),mapper).toString()).contains("BUSINESS_BINDING","最多关联一个追溯项");
    }
    @Test void knowledgeIsPinnedPaginatedAndDoesNotExposeOtherRecords() throws Exception {
        var knowledge=new AiKnowledgePackage(mapper);
        var first=knowledge.search("internal",0);assertThat(first.get("total")).isEqualTo(18);assertThat(first.get("nextOffset")).isEqualTo(8);
        assertThat(knowledge.search("internal",16).get("nextOffset")).isEqualTo(-1);
        assertThatThrownBy(()->knowledge.relations("DEC-0097",0)).isInstanceOf(AiException.class);
        assertThat(knowledge.relations("concept.form-template-field",0).toString()).contains("cardinality","term.form-template-field","sourceCommit");
    }
}
