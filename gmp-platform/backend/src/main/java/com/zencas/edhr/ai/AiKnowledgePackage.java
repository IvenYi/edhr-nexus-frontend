package com.zencas.edhr.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

/** Immutable allowlisted package. No runtime repository, URL, path or SQL access. */
@Component
public class AiKnowledgePackage {
    private final JsonNode data;
    private final String hash;
    public AiKnowledgePackage(ObjectMapper mapper) throws Exception {
        try (var stream=new ClassPathResource("ai/form-knowledge-2c.json").getInputStream()) {
            JsonNode envelope=mapper.readTree(stream);
            String payload=envelope.path("payload").asText();
            hash=HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(payload.getBytes(StandardCharsets.UTF_8)));
            if (!hash.equals(envelope.path("sha256").asText())) throw new IllegalStateException("Knowledge digest mismatch");
            data=mapper.readTree(payload);
            if (!"internal-validation".equals(data.path("scope").asText())) throw new IllegalStateException("Knowledge scope mismatch");
        }
    }
    public String id() { return data.path("id").asText(); }
    public String hash() { return hash; }
    public Map<String,Object> search(String query,int offset) {
        String[] terms=query.toLowerCase(Locale.ROOT).split("[\\s,，;；]+");
        if (query.isBlank()) throw new AiException(400,"KNOWLEDGE_QUERY_REQUIRED");
        List<JsonNode> hits=new ArrayList<>();
        for (JsonNode record:data.path("records")) {
            String text=record.toString().toLowerCase(Locale.ROOT);
            if (Arrays.stream(terms).anyMatch(term->!term.isBlank() && text.contains(term))) hits.add(record);
        }
        return page(hits,offset);
    }
    public Map<String,Object> relations(String id,int offset) {
        boolean exists=false;List<JsonNode> hits=new ArrayList<>();
        for (JsonNode record:data.path("records")) if (record.path("id").asText().equals(id)) exists=true;
        if (!exists) throw new AiException(404,"KNOWLEDGE_NOT_IN_PACKAGE");
        Set<String> ids=new LinkedHashSet<>(Set.of(id));
        for (JsonNode record:data.path("records")) {
            JsonNode value=record.path("data");
            if (id.equals(value.path("source").asText()) || id.equals(value.path("target").asText())) {
                ids.add(record.path("id").asText());ids.add(value.path("source").asText());ids.add(value.path("target").asText());
            }
        }
        for (JsonNode record:data.path("records")) if (ids.contains(record.path("id").asText())) ids.add(record.path("data").path("termId").asText());
        for (JsonNode record:data.path("records")) if (ids.contains(record.path("id").asText())) hits.add(record);
        var result=new LinkedHashMap<>(page(hits,offset));
        result.put("relationScope","concept-relations-and-definitions; not production instance relationships");return result;
    }
    private Map<String,Object> page(List<JsonNode> hits,int offset) {
        if (offset<0) throw new AiException(400,"INVALID_OFFSET");
        int start=Math.min(offset,hits.size()),end=Math.min(start+8,hits.size());
        return Map.of("knowledgePackage",id(),"packageHash",hash,"sourceCommit",data.path("sourceCommit").asText(),
                "scope","internal-validation","total",hits.size(),"offset",offset,"nextOffset",end<hits.size()?end:-1,
                "records",hits.subList(start,end),"limitations","未发布内部知识；检索相关性不授予执行权限；历史证据ID为来源引用而非本包可读取记录");
    }
}
