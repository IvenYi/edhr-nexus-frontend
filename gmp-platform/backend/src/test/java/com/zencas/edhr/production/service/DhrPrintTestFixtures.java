package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

final class DhrPrintTestFixtures {
    static ObjectNode record(ObjectMapper mapper, String id) {
        ObjectNode record = mapper.createObjectNode().put("id", id).put("instanceNo", "FR-" + id)
                .put("originKind", "WORK").put("templateId", "1").put("templateVersionId", "2").put("templateName", "冻结检验记录").put("templateVersion", "V1").put("status", "COMPLETED");
        record.putObject("fieldValues").put("value", "冻结值-12");
        ObjectNode snapshot = record.putObject("snapshot");
        snapshot.putArray("fields").addObject().put("id", "value").put("name", "检验结果").put("type", "text").putObject("typeConfig");
        snapshot.put("model", "{\"schema\":\"edhr-template-designer-react\",\"version\":1,\"payload\":{\"fields\":[],\"groups\":[]}}");
        snapshot.put("canvas", """
            {"schema":"edhr-template-designer-react","version":1,"payload":{"pages":[{
              "id":"p1","name":"检验记录","sheet":{"rowCount":3,"columnCount":2,"defaultRowHeight":48,"defaultColumnWidth":240},
              "cells":{"1:1":{"value":"冻结检验记录"},"2:1":{"value":"检验结果"}},
              "mergedRanges":[],"images":[],"medias":[],
              "nodes":[{"id":"n1","type":"input","props":{},"style":{"position":"absolute","cellRange":{"t":2,"l":2,"b":2,"r":2}},"bindings":{"fieldId":"value"}}]
            }]}}
            """);
        return record;
    }
}
