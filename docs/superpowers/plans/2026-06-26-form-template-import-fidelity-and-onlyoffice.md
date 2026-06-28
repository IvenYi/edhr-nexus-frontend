# Form Template Import Fidelity And OnlyOffice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a candidate-confirmation workflow and OnlyOffice PoC around the existing form-template import engine so Word, Excel, and PDF imports produce explainable candidate components, preserve page orientation, and keep high-fidelity source rendering separate from Zencas structured overlays.

**Architecture:** Keep the current version-level import endpoint and canvas JSON contract, then add an analysis draft layer and candidate-decision endpoint before fields become confirmed components. Add OnlyOffice as an optional document-service integration with backend config/callback endpoints and a frontend preview/edit entry, while Zencas remains responsible for field overlays, component metadata, audit, and later fill runtime.

**Tech Stack:** Spring Boot 3.3, Java 21, JPA/Liquibase, Jackson JSON, existing `FileObject` storage, React 18, TypeScript, MUI, React Query, Vite, OnlyOffice Docs API, existing `verify:template-modeling`.

---

## Current Baseline

Do not replace the current import engine. The repo already has:

- `gmp-platform/backend/src/main/java/com/zencas/edhr/template/controller/TemplateModelingController.java`
  - `POST /form-templates/{id}/versions/{versionId}/import`
  - PDF/Word/Excel/image parsing helpers
  - source file and generated preview file storage
  - `TemplateImportResponse`, `TemplateFieldCandidateResponse`, canvas/model JSON persistence
- `gmp-platform/frontend/src/pages/master-data/TemplateModelingPage.tsx`
  - fullscreen designer
  - parsed page/layer rendering
  - field candidate list
  - drag/drop field overlays
  - design save
- `gmp-platform/frontend/scripts/verify-template-modeling-pages.mjs`
  - structural contract verifier
- Existing tests in `TemplateModelingControllerTest`
  - import canvas, OCR, Word, Excel, unsupported file behavior

This plan adds missing target-state pieces without broad refactors.

## File Map

Backend creates:

- `gmp-platform/backend/src/main/java/com/zencas/edhr/template/entity/FormTemplateAnalysis.java`
- `gmp-platform/backend/src/main/java/com/zencas/edhr/template/entity/FormTemplateSourceRevision.java`
- `gmp-platform/backend/src/main/java/com/zencas/edhr/template/repository/FormTemplateAnalysisRepository.java`
- `gmp-platform/backend/src/main/java/com/zencas/edhr/template/repository/FormTemplateSourceRevisionRepository.java`
- `gmp-platform/backend/src/main/resources/db/changelog/0035-form-template-analysis-and-onlyoffice.sql`

Backend modifies:

- `gmp-platform/backend/src/main/java/com/zencas/edhr/template/controller/TemplateModelingController.java`
- `gmp-platform/backend/src/main/resources/db/changelog/db.changelog-master.yaml`
- `gmp-platform/backend/src/main/resources/application.yml`
- `gmp-platform/backend/src/main/resources/application-dev.yml`
- `gmp-platform/docker-compose.yml`
- `gmp-platform/backend/src/test/java/com/zencas/edhr/template/controller/TemplateModelingControllerTest.java`

Frontend modifies:

- `gmp-platform/frontend/src/api/template-modeling.ts`
- `gmp-platform/frontend/src/pages/master-data/TemplateModelingPage.tsx`
- `gmp-platform/frontend/scripts/verify-template-modeling-pages.mjs`

## Task 1: Backend Contract Tests For Analysis Drafts

**Files:**

- Modify: `gmp-platform/backend/src/test/java/com/zencas/edhr/template/controller/TemplateModelingControllerTest.java`

- [ ] **Step 1: Add mocks for new repositories**

Add imports:

```java
import com.zencas.edhr.template.entity.FormTemplateAnalysis;
import com.zencas.edhr.template.entity.FormTemplateSourceRevision;
import com.zencas.edhr.template.repository.FormTemplateAnalysisRepository;
import com.zencas.edhr.template.repository.FormTemplateSourceRevisionRepository;
```

Add fields beside existing repository mocks:

```java
@Mock private FormTemplateAnalysisRepository formTemplateAnalysisRepository;
@Mock private FormTemplateSourceRevisionRepository formTemplateSourceRevisionRepository;
```

- [ ] **Step 2: Write failing import draft test**

Add this test near existing import tests:

```java
@Test
void importFormTemplateSourceFileReturnsAnalysisDraftWithoutAutoConfirmingAllCandidates() throws Exception {
    AuditContext.setOperator("99", "系统管理员", "admin");
    FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
    FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").build();
    when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
    when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
    when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(formTemplateAnalysisRepository.save(any(FormTemplateAnalysis.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(formTemplateSourceRevisionRepository.save(any(FormTemplateSourceRevision.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(idGenerator.nextId()).thenReturn(301L, 302L, 303L, 304L, 305L);
    ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
    MockMultipartFile file = new MockMultipartFile("file", "生产巡检记录.pdf", "application/pdf", samplePdfBytes());

    var response = controller.importFormTemplateSourceFile(101L, 102L, file);

    JsonNode analysisDraft = response.getData().analysisDraft();
    assertThat(analysisDraft.get("analysisId").asText()).isEqualTo("304");
    assertThat(analysisDraft.get("source").get("fileId").asText()).isEqualTo("301");
    assertThat(analysisDraft.get("pages")).hasSize(1);
    assertThat(analysisDraft.get("pages").get(0).get("orientation").asText()).isIn("portrait", "landscape");
    assertThat(analysisDraft.get("candidates")).isNotEmpty();
    assertThat(analysisDraft.get("candidates").get(0).get("status").asText()).isEqualTo("pending");
    assertThat(analysisDraft.get("candidates").get(0).has("reason")).isTrue();
    assertThat(analysisDraft.get("candidates").get(0).has("confidence")).isTrue();
    assertThat(response.getData().version().modelDesignJson()).contains("analysisDraft");
    assertThat(objectMapper.readTree(response.getData().version().canvasDesignJson()).get("interactiveFields")).hasSize(0);
    verify(formTemplateAnalysisRepository).save(any(FormTemplateAnalysis.class));
    verify(formTemplateSourceRevisionRepository).save(any(FormTemplateSourceRevision.class));
}
```

Expected RED: compile fails because `FormTemplateAnalysis`, repositories, and `analysisDraft()` response field do not exist.

- [ ] **Step 3: Write failing candidate-decision test**

Add:

```java
@Test
void confirmFormTemplateAnalysisCandidatesPersistsComponentStaticTextAndIgnoreDecisions() throws Exception {
    AuditContext.setOperator("99", "系统管理员", "admin");
    FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
    FormTemplateVersion version = FormTemplateVersion.builder()
            .id(102L)
            .tenantId("default")
            .templateId(101L)
            .version("V1.0")
            .modelDesignJson("{\"schemaVersion\":\"1.1\",\"source\":{\"fileId\":\"301\"},\"analysisDraft\":{\"analysisId\":\"304\"},\"fields\":[]}")
            .canvasDesignJson("{\"schemaVersion\":\"1.1\",\"pages\":[{\"id\":\"page-1\",\"pageNumber\":1,\"width\":595,\"height\":842,\"orientation\":\"portrait\",\"layers\":[]}],\"interactiveFields\":[],\"fieldBindings\":[]}")
            .build();
    String analysisJson = """
            {"schemaVersion":"1.0","analysisId":"304","source":{"fileId":"301","fileName":"生产巡检记录.pdf","fileType":"pdf"},"pages":[{"id":"page-1","pageNumber":1,"width":595,"height":842,"orientation":"portrait"}],"blocks":[{"id":"block-title","pageId":"page-1","kind":"text","text":"生产巡检记录","x":72,"y":48,"width":220,"height":28},{"id":"block-batch","pageId":"page-1","kind":"text","text":"批号：","x":72,"y":96,"width":80,"height":24}],"candidates":[{"id":"candidate-title","status":"pending","suggestedAction":"staticText","fieldCode":"title","fieldName":"生产巡检记录","pageId":"page-1","labelBlockId":"block-title","valueAnchor":{"x":72,"y":48,"width":220,"height":28},"reason":"标题文本","confidence":0.98},{"id":"candidate-batch-no","status":"pending","suggestedAction":"component","suggestedComponent":"TextInput","fieldCode":"batch_no","fieldName":"批号","pageId":"page-1","labelBlockId":"block-batch","valueAnchor":{"x":152,"y":96,"width":180,"height":24},"reason":"冒号标签后存在可填写区域","confidence":0.92},{"id":"candidate-noise","status":"pending","suggestedAction":"ignore","fieldCode":"noise","fieldName":"页脚噪声","pageId":"page-1","valueAnchor":{"x":20,"y":800,"width":100,"height":18},"reason":"低置信度文本","confidence":0.31}]}
            """;
    FormTemplateAnalysis analysis = FormTemplateAnalysis.builder()
            .id(304L)
            .tenantId("default")
            .templateId(101L)
            .versionId(102L)
            .sourceFileId(301L)
            .status("PENDING")
            .analysisJson(analysisJson)
            .build();
    when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
    when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
    when(formTemplateAnalysisRepository.findByIdAndVersionId(304L, 102L)).thenReturn(Optional.of(analysis));
    when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(formTemplateAnalysisRepository.save(any(FormTemplateAnalysis.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(idGenerator.nextId()).thenReturn(401L);
    TemplateModelingController.CandidateDecisionRequest request = new TemplateModelingController.CandidateDecisionRequest(
            "304",
            List.of(
                    new TemplateModelingController.CandidateDecisionItem("candidate-batch-no", "component", "batch_no", "批号", "TextInput", true),
                    new TemplateModelingController.CandidateDecisionItem("candidate-title", "staticText", null, null, null, false),
                    new TemplateModelingController.CandidateDecisionItem("candidate-noise", "ignore", null, null, null, false)
            ));

    var response = controller.confirmFormTemplateAnalysisCandidates(101L, 102L, 304L, request);

    JsonNode modelDesign = objectMapper.readTree(response.getData().modelDesignJson());
    JsonNode canvasDesign = objectMapper.readTree(response.getData().canvasDesignJson());
    assertThat(modelDesign.get("fields")).hasSize(1);
    assertThat(modelDesign.get("fields").get(0).get("code").asText()).isEqualTo("batch_no");
    assertThat(canvasDesign.get("interactiveFields")).hasSize(1);
    assertThat(canvasDesign.get("interactiveFields").get(0).get("component").asText()).isEqualTo("TextInput");
    assertThat(canvasDesign.get("pages").get(0).get("layers")).anySatisfy(layer ->
            assertThat(layer.get("sourceCandidateId").asText()).isEqualTo("candidate-title"));
    assertThat(canvasDesign.toString()).doesNotContain("candidate-noise");
    assertThat(analysis.getStatus()).isEqualTo("CONFIRMED");
    verify(auditEventRepository).save(any(AuditEvent.class));
}
```

Expected RED: compile fails because confirmation request/endpoint and repository do not exist.

- [ ] **Step 4: Run backend RED check**

Run:

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/backend
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
mvn test -Dtest=TemplateModelingControllerTest -DargLine="-javaagent:/Users/wangzilin/.m2/repository/net/bytebuddy/byte-buddy-agent/1.14.16/byte-buddy-agent-1.14.16.jar"
```

Expected: FAIL with missing classes/methods from the new tests.

## Task 2: Backend Persistence For Analysis Drafts And Source Revisions

**Files:**

- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/template/entity/FormTemplateAnalysis.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/template/entity/FormTemplateSourceRevision.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/template/repository/FormTemplateAnalysisRepository.java`
- Create: `gmp-platform/backend/src/main/java/com/zencas/edhr/template/repository/FormTemplateSourceRevisionRepository.java`
- Create: `gmp-platform/backend/src/main/resources/db/changelog/0035-form-template-analysis-and-onlyoffice.sql`
- Modify: `gmp-platform/backend/src/main/resources/db/changelog/db.changelog-master.yaml`
- Modify: `gmp-platform/backend/src/main/java/com/zencas/edhr/template/controller/TemplateModelingController.java`

- [ ] **Step 1: Create `FormTemplateAnalysis` entity**

```java
package com.zencas.edhr.template.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "form_template_analysis")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormTemplateAnalysis {
    @Id
    private Long id;

    @Column(name = "tenant_id")
    @Builder.Default
    private String tenantId = "default";

    @Column(name = "template_id")
    private Long templateId;

    @Column(name = "version_id")
    private Long versionId;

    @Column(name = "source_file_id")
    private Long sourceFileId;

    @Column(name = "analysis_json", columnDefinition = "TEXT")
    private String analysisJson;

    @Column(name = "decision_json", columnDefinition = "TEXT")
    private String decisionJson;

    @Column(name = "status", length = 32)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = createdAt;
        if (updatedBy == null) updatedBy = createdBy;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
        if (updatedBy == null) updatedBy = createdBy;
    }
}
```

- [ ] **Step 2: Create `FormTemplateSourceRevision` entity**

```java
package com.zencas.edhr.template.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "form_template_source_revision")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormTemplateSourceRevision {
    @Id
    private Long id;

    @Column(name = "tenant_id")
    @Builder.Default
    private String tenantId = "default";

    @Column(name = "template_id")
    private Long templateId;

    @Column(name = "version_id")
    private Long versionId;

    @Column(name = "file_id")
    private Long fileId;

    @Column(name = "revision_no")
    private Integer revisionNo;

    @Column(name = "source", length = 32)
    private String source;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
```

- [ ] **Step 3: Create repositories**

`FormTemplateAnalysisRepository.java`:

```java
package com.zencas.edhr.template.repository;

import com.zencas.edhr.template.entity.FormTemplateAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FormTemplateAnalysisRepository extends JpaRepository<FormTemplateAnalysis, Long> {
    Optional<FormTemplateAnalysis> findByIdAndVersionId(Long id, Long versionId);
}
```

`FormTemplateSourceRevisionRepository.java`:

```java
package com.zencas.edhr.template.repository;

import com.zencas.edhr.template.entity.FormTemplateSourceRevision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FormTemplateSourceRevisionRepository extends JpaRepository<FormTemplateSourceRevision, Long> {
    int countByTemplateIdAndVersionId(Long templateId, Long versionId);
}
```

- [ ] **Step 4: Add migration**

Create `0035-form-template-analysis-and-onlyoffice.sql`:

```sql
CREATE TABLE IF NOT EXISTS form_template_analysis (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    template_id BIGINT NOT NULL,
    version_id BIGINT NOT NULL,
    source_file_id BIGINT,
    analysis_json TEXT,
    decision_json TEXT,
    status VARCHAR(32) DEFAULT 'PENDING',
    created_by VARCHAR(128),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(128),
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_form_template_analysis_version
ON form_template_analysis(tenant_id, template_id, version_id);

CREATE TABLE IF NOT EXISTS form_template_source_revision (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    template_id BIGINT NOT NULL,
    version_id BIGINT NOT NULL,
    file_id BIGINT NOT NULL,
    revision_no INTEGER NOT NULL,
    source VARCHAR(32),
    created_by VARCHAR(128),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_form_template_source_revision_no
ON form_template_source_revision(tenant_id, template_id, version_id, revision_no);
```

Add to `db.changelog-master.yaml` after `0034-template-version-source-file-id.sql`:

```yaml
  - include:
      file: db/changelog/0035-form-template-analysis-and-onlyoffice.sql
```

- [ ] **Step 5: Inject repositories into controller**

Add imports:

```java
import com.zencas.edhr.template.entity.FormTemplateAnalysis;
import com.zencas.edhr.template.entity.FormTemplateSourceRevision;
import com.zencas.edhr.template.repository.FormTemplateAnalysisRepository;
import com.zencas.edhr.template.repository.FormTemplateSourceRevisionRepository;
```

Add fields after existing template repositories:

```java
private final FormTemplateAnalysisRepository formTemplateAnalysisRepository;
private final FormTemplateSourceRevisionRepository formTemplateSourceRevisionRepository;
```

- [ ] **Step 6: Add source revision helper**

Add near file storage helpers:

```java
private FormTemplateSourceRevision createSourceRevision(Long templateId, Long versionId, Long fileId, String source) {
    int nextRevisionNo = formTemplateSourceRevisionRepository.countByTemplateIdAndVersionId(templateId, versionId) + 1;
    return formTemplateSourceRevisionRepository.save(FormTemplateSourceRevision.builder()
            .id(idGenerator.nextId())
            .tenantId(TENANT_ID)
            .templateId(templateId)
            .versionId(versionId)
            .fileId(fileId)
            .revisionNo(nextRevisionNo)
            .source(source)
            .createdBy(currentOperatorName())
            .createdAt(LocalDateTime.now())
            .build());
}
```

- [ ] **Step 7: Run compile RED-to-next**

Run the backend test command. Expected: still FAIL because controller response and confirmation endpoint are not implemented yet, but entity/repository compile errors are gone.

## Task 3: Backend Analysis Draft Creation And Confirmation

**Files:**

- Modify: `gmp-platform/backend/src/main/java/com/zencas/edhr/template/controller/TemplateModelingController.java`

- [ ] **Step 1: Extend candidate response record**

Replace:

```java
public record TemplateFieldCandidateResponse(
        String code,
        String name,
        String type,
        boolean required) {
}
```

with:

```java
public record TemplateFieldCandidateResponse(
        String id,
        String code,
        String name,
        String type,
        boolean required,
        String status,
        String suggestedAction,
        String suggestedComponent,
        String pageId,
        Map<String, Object> valueAnchor,
        String reason,
        double confidence) {

    public TemplateFieldCandidateResponse(String code, String name, String type, boolean required) {
        this("candidate-" + code, code, name, type, required, "pending", "component", componentForFieldTypeStatic(type),
                "page-1", Map.of("x", 96, "y", 128, "width", 160, "height", 28), "默认字段候选", 0.7);
    }
}
```

Add a static helper near `componentForFieldType`:

```java
private static String componentForFieldTypeStatic(String type) {
    if ("datetime".equals(type)) return "DateTimePicker";
    if ("number".equals(type)) return "NumberInput";
    return "TextInput";
}
```

Update `componentForFieldType` to call the static helper.

- [ ] **Step 2: Build analysis draft JSON**

Add helper:

```java
private Map<String, Object> buildAnalysisDraft(Long analysisId, Long templateId, Long versionId, FileObject sourceFile, TemplateImportArtifacts artifacts) {
    Map<String, Object> source = new LinkedHashMap<>();
    source.put("fileId", String.valueOf(sourceFile.getId()));
    source.put("fileName", sourceFile.getOriginalName());
    source.put("fileType", artifacts.fileType());
    source.put("mimeType", sourceFile.getMimeType());
    source.put("revision", formTemplateSourceRevisionRepository.countByTemplateIdAndVersionId(templateId, versionId));

    List<Map<String, Object>> pages = extractAnalysisPages(artifacts.canvasDesign());
    List<Map<String, Object>> blocks = extractAnalysisBlocks(artifacts.canvasDesign());
    List<Map<String, Object>> candidates = artifacts.fieldCandidates().stream()
            .map(candidate -> candidateToAnalysisCandidate(candidate, pages))
            .toList();

    Map<String, Object> draft = new LinkedHashMap<>();
    draft.put("schemaVersion", "1.0");
    draft.put("analysisId", String.valueOf(analysisId));
    draft.put("templateId", String.valueOf(templateId));
    draft.put("versionId", String.valueOf(versionId));
    draft.put("source", source);
    draft.put("pages", pages);
    draft.put("blocks", blocks);
    draft.put("candidates", candidates);
    return draft;
}
```

Add helpers:

```java
@SuppressWarnings("unchecked")
private List<Map<String, Object>> extractAnalysisPages(Map<String, Object> canvasDesign) {
    Object rawPages = canvasDesign.get("pages");
    if (!(rawPages instanceof List<?> pages)) return List.of();
    return pages.stream()
            .filter(Map.class::isInstance)
            .map(page -> {
                Map<String, Object> sourcePage = (Map<String, Object>) page;
                Map<String, Object> result = new LinkedHashMap<>();
                result.put("id", sourcePage.get("id"));
                result.put("pageNumber", sourcePage.get("pageNumber"));
                result.put("width", sourcePage.get("width"));
                result.put("height", sourcePage.get("height"));
                result.put("orientation", sourcePage.getOrDefault("orientation", resolveOrientation(numberValue(sourcePage.get("width")), numberValue(sourcePage.get("height")))));
                result.put("rotation", sourcePage.getOrDefault("rotation", 0));
                result.put("dpi", TEMPLATE_CANVAS_RENDER_DPI);
                result.put("scanDetected", false);
                return result;
            })
            .toList();
}

@SuppressWarnings("unchecked")
private List<Map<String, Object>> extractAnalysisBlocks(Map<String, Object> canvasDesign) {
    Object rawPages = canvasDesign.get("pages");
    if (!(rawPages instanceof List<?> pages)) return List.of();
    List<Map<String, Object>> blocks = new ArrayList<>();
    for (Object rawPage : pages) {
        if (!(rawPage instanceof Map<?, ?> page)) continue;
        Object pageId = page.get("id");
        Object rawLayers = page.get("layers");
        if (!(rawLayers instanceof List<?> layers)) continue;
        for (Object rawLayer : layers) {
            if (!(rawLayer instanceof Map<?, ?> layer)) continue;
            Object text = layer.get("text");
            if (!StringUtils.hasText(text == null ? null : String.valueOf(text))) continue;
            Map<String, Object> block = new LinkedHashMap<>();
            block.put("id", layer.get("id"));
            block.put("pageId", pageId);
            block.put("kind", "text");
            block.put("text", text);
            block.put("x", layer.get("x"));
            block.put("y", layer.get("y"));
            block.put("width", layer.get("width"));
            block.put("height", layer.get("height"));
            block.put("sourceType", layer.getOrDefault("sourceType", layer.get("type")));
            block.put("sourceRef", layer.getOrDefault("sourceRef", Map.of()));
            block.put("confidence", layer.getOrDefault("confidence", 0.8));
            blocks.add(block);
        }
    }
    return blocks;
}

private Map<String, Object> candidateToAnalysisCandidate(TemplateFieldCandidateResponse candidate, List<Map<String, Object>> pages) {
    Map<String, Object> result = new LinkedHashMap<>();
    result.put("id", candidate.id());
    result.put("status", "pending");
    result.put("suggestedAction", candidate.suggestedAction());
    result.put("suggestedComponent", candidate.suggestedComponent());
    result.put("fieldCode", candidate.code());
    result.put("fieldName", candidate.name());
    result.put("required", candidate.required());
    result.put("pageId", StringUtils.hasText(candidate.pageId()) ? candidate.pageId() : String.valueOf(pages.isEmpty() ? "page-1" : pages.get(0).get("id")));
    result.put("valueAnchor", candidate.valueAnchor());
    result.put("reason", candidate.reason());
    result.put("confidence", candidate.confidence());
    return result;
}

private double numberValue(Object value) {
    if (value instanceof Number number) return number.doubleValue();
    if (value == null) return 0;
    try {
        return Double.parseDouble(String.valueOf(value));
    } catch (NumberFormatException e) {
        return 0;
    }
}

private String resolveOrientation(double width, double height) {
    return width >= height ? "landscape" : "portrait";
}
```

- [ ] **Step 3: Update import endpoint to persist analysis draft**

Inside `importFormTemplateSourceFile`, after `parseTemplateImport`:

```java
FormTemplateSourceRevision revision = createSourceRevision(id, versionId, sourceFile.getId(), "IMPORT");
Long analysisId = idGenerator.nextId();
Map<String, Object> analysisDraft = buildAnalysisDraft(analysisId, id, versionId, sourceFile, artifacts);
analysisDraft.put("revision", revision.getRevisionNo());
FormTemplateAnalysis analysis = formTemplateAnalysisRepository.save(FormTemplateAnalysis.builder()
        .id(analysisId)
        .tenantId(TENANT_ID)
        .templateId(id)
        .versionId(versionId)
        .sourceFileId(sourceFile.getId())
        .analysisJson(toDesignJson(analysisDraft))
        .status("PENDING")
        .createdBy(currentOperatorName())
        .createdAt(LocalDateTime.now())
        .updatedBy(currentOperatorName())
        .updatedAt(LocalDateTime.now())
        .build());
```

Before setting JSON on the version, create draft-first designs:

```java
Map<String, Object> modelDesign = new LinkedHashMap<>(artifacts.modelDesign());
modelDesign.put("analysisDraft", Map.of("analysisId", String.valueOf(analysis.getId()), "status", analysis.getStatus()));
modelDesign.put("fields", List.of());

Map<String, Object> canvasDesign = new LinkedHashMap<>(artifacts.canvasDesign());
canvasDesign.put("interactiveFields", List.of());
canvasDesign.put("fieldBindings", List.of());
```

Persist `modelDesign` and `canvasDesign` instead of `artifacts.modelDesign()` and `artifacts.canvasDesign()`.

Return:

```java
return ApiResponse.success(new TemplateImportResponse(
        toVersionResponse(saved),
        artifacts.fieldCandidates(),
        toJsonNode(modelDesign),
        toJsonNode(canvasDesign),
        toJsonNode(analysisDraft)));
```

- [ ] **Step 4: Add analysis getter endpoint**

Add after import endpoint:

```java
@GetMapping("/form-templates/{id}/versions/{versionId}/analysis/{analysisId}")
public ApiResponse<JsonNode> getFormTemplateAnalysisDraft(
        @PathVariable Long id,
        @PathVariable Long versionId,
        @PathVariable Long analysisId) {
    formTemplateRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "表单模板不存在"));
    findVersion(id, versionId);
    FormTemplateAnalysis analysis = formTemplateAnalysisRepository.findByIdAndVersionId(analysisId, versionId)
            .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "解析草稿不存在"));
    return ApiResponse.success(toJsonNode(analysis.getAnalysisJson()));
}
```

Add overload:

```java
private JsonNode toJsonNode(String json) {
    try {
        return AUDIT_OBJECT_MAPPER.readTree(StringUtils.hasText(json) ? json : "{}");
    } catch (JsonProcessingException e) {
        throw new BusinessException(ErrorCode.GENERAL_001, "设计内容解析失败");
    }
}
```

- [ ] **Step 5: Add decision request records**

Near response records:

```java
public record CandidateDecisionRequest(String analysisId, List<CandidateDecisionItem> decisions) {
}

public record CandidateDecisionItem(
        String candidateId,
        String action,
        String fieldCode,
        String fieldName,
        String component,
        boolean required) {
}
```

Extend `TemplateImportResponse` record:

```java
public record TemplateImportResponse(
        TemplateVersionResponse version,
        List<TemplateFieldCandidateResponse> fieldCandidates,
        JsonNode modelDesign,
        JsonNode canvasDesign,
        JsonNode analysisDraft) {
}
```

- [ ] **Step 6: Implement confirmation endpoint**

Add:

```java
@PutMapping("/form-templates/{id}/versions/{versionId}/analysis/{analysisId}/decisions")
@Transactional
public ApiResponse<TemplateVersionResponse> confirmFormTemplateAnalysisCandidates(
        @PathVariable Long id,
        @PathVariable Long versionId,
        @PathVariable Long analysisId,
        @RequestBody CandidateDecisionRequest request) {
    formTemplateRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "表单模板不存在"));
    FormTemplateVersion version = findVersion(id, versionId);
    FormTemplateAnalysis analysis = formTemplateAnalysisRepository.findByIdAndVersionId(analysisId, versionId)
            .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "解析草稿不存在"));
    Map<String, Object> before = versionSnapshot(version);
    JsonNode analysisDraft = toJsonNode(analysis.getAnalysisJson());
    JsonNode currentModel = toJsonNode(version.getModelDesignJson());
    JsonNode currentCanvas = toJsonNode(version.getCanvasDesignJson());
    Map<String, Object> confirmedModel = buildConfirmedModelDesign(currentModel, analysisDraft, request);
    Map<String, Object> confirmedCanvas = buildConfirmedCanvasDesign(currentCanvas, analysisDraft, request);

    version.setModelDesignJson(toDesignJson(confirmedModel));
    version.setCanvasDesignJson(toDesignJson(confirmedCanvas));
    version.setUpdatedBy(currentOperatorName());
    version.setUpdatedAt(LocalDateTime.now());
    FormTemplateVersion saved = formTemplateVersionRepository.save(version);

    analysis.setStatus("CONFIRMED");
    analysis.setDecisionJson(toDesignJson(Map.of("analysisId", String.valueOf(analysisId), "decisions", request == null || request.decisions() == null ? List.of() : request.decisions())));
    analysis.setUpdatedBy(currentOperatorName());
    analysis.setUpdatedAt(LocalDateTime.now());
    formTemplateAnalysisRepository.save(analysis);

    writeChangedAudit("FORM_TEMPLATE_VERSION", saved.getId(), "表单模板", "确认导入候选", before, versionSnapshot(saved));
    return ApiResponse.success(toVersionResponse(saved));
}
```

- [ ] **Step 7: Add confirmation JSON builders**

Add helpers:

```java
private Map<String, Object> buildConfirmedModelDesign(JsonNode currentModel, JsonNode analysisDraft, CandidateDecisionRequest request) {
    Map<String, Object> result = jsonNodeToMap(currentModel);
    result.put("schemaVersion", "1.1");
    result.put("analysis", Map.of(
            "analysisId", analysisDraft.path("analysisId").asText(),
            "confirmedAt", formatDateTime(LocalDateTime.now()),
            "confirmedBy", currentOperatorName()));
    result.put("fields", confirmedFields(analysisDraft, request));
    result.remove("analysisDraft");
    return result;
}

private Map<String, Object> buildConfirmedCanvasDesign(JsonNode currentCanvas, JsonNode analysisDraft, CandidateDecisionRequest request) {
    Map<String, Object> result = jsonNodeToMap(currentCanvas);
    result.put("schemaVersion", "1.1");
    List<Map<String, Object>> fields = confirmedFields(analysisDraft, request);
    result.put("interactiveFields", fields);
    result.put("fieldBindings", fields.stream()
            .map(field -> Map.<String, Object>of("fieldCode", field.get("code"), "sourceCandidateId", field.get("sourceCandidateId")))
            .toList());
    result.put("pages", pagesWithStaticTextLayers(result.get("pages"), analysisDraft, request));
    return result;
}

@SuppressWarnings("unchecked")
private Map<String, Object> jsonNodeToMap(JsonNode node) {
    return AUDIT_OBJECT_MAPPER.convertValue(node == null || node.isMissingNode() || node.isNull() ? Map.of() : node, LinkedHashMap.class);
}

private List<Map<String, Object>> confirmedFields(JsonNode analysisDraft, CandidateDecisionRequest request) {
    Map<String, JsonNode> candidates = candidatesById(analysisDraft);
    List<Map<String, Object>> fields = new ArrayList<>();
    if (request == null || request.decisions() == null) return fields;
    for (CandidateDecisionItem decision : request.decisions()) {
        if (!"component".equals(decision.action())) continue;
        JsonNode candidate = candidates.get(decision.candidateId());
        if (candidate == null) continue;
        JsonNode anchor = candidate.path("valueAnchor");
        String code = StringUtils.hasText(decision.fieldCode()) ? decision.fieldCode() : candidate.path("fieldCode").asText();
        String component = StringUtils.hasText(decision.component()) ? decision.component() : candidate.path("suggestedComponent").asText("TextInput");
        Map<String, Object> field = new LinkedHashMap<>();
        field.put("id", "field-" + code);
        field.put("code", code);
        field.put("name", StringUtils.hasText(decision.fieldName()) ? decision.fieldName() : candidate.path("fieldName").asText(code));
        field.put("type", typeForComponent(component));
        field.put("required", decision.required());
        field.put("pageId", candidate.path("pageId").asText("page-1"));
        field.put("x", anchor.path("x").asDouble(96));
        field.put("y", anchor.path("y").asDouble(128));
        field.put("width", anchor.path("width").asDouble(160));
        field.put("height", anchor.path("height").asDouble(28));
        field.put("component", component);
        field.put("fillable", true);
        field.put("sourceCandidateId", decision.candidateId());
        field.put("validation", Map.of("required", decision.required(), "rules", List.of()));
        field.put("dataBinding", Map.of("valuePath", "fields." + code, "submissionPath", "submission.fields." + code));
        field.put("binding", Map.of("fillable", true, "component", component));
        fields.add(field);
    }
    return fields;
}

private String typeForComponent(String component) {
    if ("DateTimePicker".equals(component)) return "datetime";
    if ("NumberInput".equals(component)) return "number";
    return "text";
}

private Map<String, JsonNode> candidatesById(JsonNode analysisDraft) {
    Map<String, JsonNode> candidates = new LinkedHashMap<>();
    analysisDraft.path("candidates").forEach(candidate -> candidates.put(candidate.path("id").asText(), candidate));
    return candidates;
}

@SuppressWarnings("unchecked")
private List<Map<String, Object>> pagesWithStaticTextLayers(Object rawPages, JsonNode analysisDraft, CandidateDecisionRequest request) {
    List<Map<String, Object>> pages = rawPages instanceof List<?> list
            ? list.stream().filter(Map.class::isInstance).map(page -> new LinkedHashMap<>((Map<String, Object>) page)).toList()
            : new ArrayList<>();
    Map<String, JsonNode> candidates = candidatesById(analysisDraft);
    if (request == null || request.decisions() == null) return pages;
    for (CandidateDecisionItem decision : request.decisions()) {
        if (!"staticText".equals(decision.action())) continue;
        JsonNode candidate = candidates.get(decision.candidateId());
        if (candidate == null) continue;
        String pageId = candidate.path("pageId").asText("page-1");
        JsonNode anchor = candidate.path("valueAnchor");
        Map<String, Object> layer = new LinkedHashMap<>();
        layer.put("id", "static-" + decision.candidateId());
        layer.put("type", "text");
        layer.put("text", candidate.path("fieldName").asText());
        layer.put("x", anchor.path("x").asDouble(96));
        layer.put("y", anchor.path("y").asDouble(96));
        layer.put("width", anchor.path("width").asDouble(160));
        layer.put("height", anchor.path("height").asDouble(24));
        layer.put("sourceCandidateId", decision.candidateId());
        pages.stream()
                .filter(page -> Objects.equals(String.valueOf(page.get("id")), pageId))
                .findFirst()
                .ifPresent(page -> {
                    List<Map<String, Object>> layers = page.get("layers") instanceof List<?> existing
                            ? existing.stream().filter(Map.class::isInstance).map(item -> new LinkedHashMap<>((Map<String, Object>) item)).collect(Collectors.toCollection(ArrayList::new))
                            : new ArrayList<>();
                    layers.add(layer);
                    page.put("layers", layers);
                });
    }
    return pages;
}
```

- [ ] **Step 8: Run backend GREEN check**

Run the backend test command. Expected: `TemplateModelingControllerTest` passes. If existing import tests expecting auto-created interactive fields fail, update those tests to assert candidates are in `analysisDraft` and confirmed fields appear only after the decision endpoint.

## Task 4: Frontend API Types And Contract Verifier

**Files:**

- Modify: `gmp-platform/frontend/src/api/template-modeling.ts`
- Modify: `gmp-platform/frontend/scripts/verify-template-modeling-pages.mjs`

- [ ] **Step 1: Add analysis and decision types**

In `template-modeling.ts`, add:

```ts
export type TemplateCandidateAction = 'component' | 'staticText' | 'ignore';

export interface TemplateAnalysisPage {
  id: string;
  pageNumber: number;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape' | string;
  rotation?: number;
  dpi?: number;
  scanDetected?: boolean;
}

export interface TemplateAnalysisCandidate {
  id: string;
  status: 'pending' | 'confirmed' | 'ignored' | string;
  suggestedAction: TemplateCandidateAction | string;
  suggestedComponent?: string;
  fieldCode: string;
  fieldName: string;
  required?: boolean;
  pageId: string;
  labelBlockId?: string;
  valueAnchor?: { x: number; y: number; width: number; height: number };
  reason?: string;
  confidence?: number;
}

export interface TemplateAnalysisBlock {
  id: string;
  pageId: string;
  kind: string;
  text?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  sourceType?: string;
  sourceRef?: Record<string, unknown>;
  confidence?: number;
}

export interface TemplateAnalysisDraft {
  schemaVersion?: string;
  analysisId: string;
  source?: TemplateCanvasSource;
  pages: TemplateAnalysisPage[];
  blocks?: TemplateAnalysisBlock[];
  candidates: TemplateAnalysisCandidate[];
}

export interface TemplateCandidateDecisionItem {
  candidateId: string;
  action: TemplateCandidateAction;
  fieldCode?: string;
  fieldName?: string;
  component?: string;
  required?: boolean;
}
```

Extend `TemplateFieldCandidate`:

```ts
export interface TemplateFieldCandidate {
  id?: string;
  code: string;
  name: string;
  type: string;
  required: boolean;
  status?: string;
  suggestedAction?: TemplateCandidateAction | string;
  suggestedComponent?: string;
  pageId?: string;
  valueAnchor?: { x: number; y: number; width: number; height: number };
  reason?: string;
  confidence?: number;
}
```

Extend `TemplateImportResponse`:

```ts
analysisDraft?: TemplateAnalysisDraft | null;
```

- [ ] **Step 2: Add API methods**

Add:

```ts
export const getFormTemplateAnalysisDraft = (id: string | number, versionId: string | number, analysisId: string | number) =>
  client.get(`${templateModelingBase}/form-templates/${id}/versions/${versionId}/analysis/${analysisId}`) as Promise<{ data: { data: TemplateAnalysisDraft } }>;

export const confirmFormTemplateAnalysisCandidates = (
  id: string | number,
  versionId: string | number,
  analysisId: string | number,
  decisions: TemplateCandidateDecisionItem[],
) =>
  client.put(`${templateModelingBase}/form-templates/${id}/versions/${versionId}/analysis/${analysisId}/decisions`, {
    analysisId: String(analysisId),
    decisions,
  }) as Promise<{ data: { data: TemplateVersionRecord } }>;
```

- [ ] **Step 3: Add OnlyOffice API types**

Add:

```ts
export interface OnlyOfficeEditorConfig {
  document: {
    fileType: string;
    key: string;
    title: string;
    url: string;
  };
  documentType: 'word' | 'cell' | 'pdf' | string;
  editorConfig: {
    callbackUrl: string;
    mode?: 'edit' | 'view';
  };
  documentServerUrl: string;
  token?: string;
}

export const getFormTemplateOnlyOfficeConfig = (id: string | number, versionId: string | number) =>
  client.get(`${templateModelingBase}/form-templates/${id}/versions/${versionId}/onlyoffice/config`) as Promise<{ data: { data: OnlyOfficeEditorConfig } }>;
```

- [ ] **Step 4: Update verifier checks**

In `verify-template-modeling-pages.mjs`, add must-include checks:

```js
mustInclude(apiContent, 'TemplateAnalysisDraft', 'template import API should expose analysis draft type');
mustInclude(apiContent, 'TemplateAnalysisBlock', 'template import API should expose source text block type');
mustInclude(apiContent, 'TemplateCandidateDecisionItem', 'template import API should expose candidate decision payload');
mustInclude(apiContent, 'confirmFormTemplateAnalysisCandidates', 'template API should expose candidate confirmation endpoint');
mustInclude(apiContent, 'getFormTemplateOnlyOfficeConfig', 'template API should expose OnlyOffice config endpoint');
mustInclude(pageContent, 'data-form-template-candidate-confirmation-panel', 'designer should expose candidate confirmation panel');
mustInclude(pageContent, 'data-form-template-candidate-action-component', 'candidate panel should confirm component decisions');
mustInclude(pageContent, 'data-form-template-candidate-action-static', 'candidate panel should confirm static text decisions');
mustInclude(pageContent, 'data-form-template-candidate-action-ignore', 'candidate panel should ignore candidate decisions');
mustInclude(pageContent, 'data-form-template-candidate-source', 'candidate panel should show source text and coordinates');
mustInclude(pageContent, 'data-form-template-candidate-highlight', 'designer should highlight selected candidate anchor on the canvas');
mustInclude(pageContent, 'data-form-template-candidate-bulk-suggested', 'candidate panel should support explicit bulk suggested decisions');
mustInclude(pageContent, 'data-form-template-onlyoffice-entry', 'designer should expose OnlyOffice source document entry');
mustInclude(controllerContent, '/analysis/{analysisId}/decisions', 'backend should expose candidate confirmation endpoint');
mustInclude(controllerContent, '/onlyoffice/config', 'backend should expose OnlyOffice config endpoint');
mustInclude(templateMigrationContent, 'form_template_analysis', 'template migration should persist analysis drafts');
```

Also read `0035-form-template-analysis-and-onlyoffice.sql` in the verifier:

```js
const templateAnalysisMigrationContent = readFileSync(new URL('../../backend/src/main/resources/db/changelog/0035-form-template-analysis-and-onlyoffice.sql', import.meta.url), 'utf8');
```

Then point migration checks at `templateAnalysisMigrationContent`.

- [ ] **Step 5: Run frontend RED check**

Run:

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend
npm run verify:template-modeling
```

Expected: FAIL until frontend page changes land.

## Task 5: Frontend Candidate Confirmation Panel

**Files:**

- Modify: `gmp-platform/frontend/src/pages/master-data/TemplateModelingPage.tsx`

- [ ] **Step 1: Import new API types and method**

Extend imports from `@/api/template-modeling`:

```ts
confirmFormTemplateAnalysisCandidates,
type TemplateAnalysisDraft,
type TemplateAnalysisCandidate,
type TemplateAnalysisBlock,
type TemplateCandidateDecisionItem,
```

- [ ] **Step 2: Add state**

Near current designer state:

```ts
const [analysisDraft, setAnalysisDraft] = useState<TemplateAnalysisDraft | null>(null);
const [candidateDecisions, setCandidateDecisions] = useState<Record<string, TemplateCandidateDecisionItem>>({});
const [selectedAnalysisCandidateId, setSelectedAnalysisCandidateId] = useState<string | null>(null);
```

- [ ] **Step 3: Add helper to normalize import candidates into draft**

Add near parse helpers:

```ts
function analysisDraftFromImport(result: TemplateImportResponse): TemplateAnalysisDraft | null {
  if (result.analysisDraft) return result.analysisDraft;
  const parsedCanvas = result.canvasDesign ?? parseTemplateCanvasDesign(result.version);
  const parsedModel = result.modelDesign ?? parseTemplateModelDesign(result.version);
  return {
    schemaVersion: '1.0',
    analysisId: String((parsedModel as { analysisDraft?: { analysisId?: string } }).analysisDraft?.analysisId ?? ''),
    source: parsedCanvas.source ?? parsedModel.source,
    pages: parsedCanvas.pages.map((page) => ({
      id: page.id,
      pageNumber: page.pageNumber,
      width: page.width,
      height: page.height,
      orientation: page.orientation || (page.width >= page.height ? 'landscape' : 'portrait'),
    })),
    blocks: [],
    candidates: result.fieldCandidates.map((candidate, index) => ({
      id: candidate.id || candidate.code || `candidate-${index + 1}`,
      status: candidate.status || 'pending',
      suggestedAction: candidate.suggestedAction || 'component',
      suggestedComponent: candidate.suggestedComponent || componentForTemplateFieldType(candidate.type),
      fieldCode: candidate.code,
      fieldName: candidate.name,
      required: candidate.required,
      pageId: candidate.pageId || parsedCanvas.pages[0]?.id || 'page-1',
      valueAnchor: candidate.valueAnchor || { x: 96, y: 128 + index * 36, width: 168, height: 30 },
      reason: candidate.reason || '解析生成的字段候选',
      confidence: candidate.confidence ?? 0.7,
    })),
  };
}
```

- [ ] **Step 4: Reset and populate candidate confirmation state on import**

In `clearTemplateDesignerCanvas`, add:

```ts
setAnalysisDraft(null);
setCandidateDecisions({});
setSelectedAnalysisCandidateId(null);
```

In import `onSuccess`, after `const result = response.data.data;` add:

```ts
const nextAnalysisDraft = analysisDraftFromImport(result);
setAnalysisDraft(nextAnalysisDraft);
setCandidateDecisions({});
setSelectedAnalysisCandidateId(nextAnalysisDraft?.candidates?.[0]?.id ?? null);
```

- [ ] **Step 5: Add decision helpers**

Add:

```ts
const updateCandidateDecision = (candidate: TemplateAnalysisCandidate, action: TemplateCandidateDecisionItem['action'], patch: Partial<TemplateCandidateDecisionItem> = {}) => {
  setCandidateDecisions((current) => ({
    ...current,
    [candidate.id]: {
      candidateId: candidate.id,
      action,
      fieldCode: patch.fieldCode ?? candidate.fieldCode,
      fieldName: patch.fieldName ?? candidate.fieldName,
      component: patch.component ?? candidate.suggestedComponent ?? 'TextInput',
      required: patch.required ?? candidate.required ?? false,
    },
  }));
};

const recommendedDecisionForCandidate = (candidate: TemplateAnalysisCandidate): TemplateCandidateDecisionItem => ({
  candidateId: candidate.id,
  action: candidate.suggestedAction === 'staticText' ? 'staticText' : candidate.suggestedAction === 'ignore' ? 'ignore' : 'component',
  fieldCode: candidate.fieldCode,
  fieldName: candidate.fieldName,
  component: candidate.suggestedComponent || 'TextInput',
  required: candidate.required ?? false,
});

const applySuggestedCandidateDecisions = () => {
  if (!analysisDraft) return;
  setCandidateDecisions(Object.fromEntries(analysisDraft.candidates.map((candidate) => [candidate.id, recommendedDecisionForCandidate(candidate)])));
};

const candidateSourceBlock = (candidate: TemplateAnalysisCandidate): TemplateAnalysisBlock | null => {
  if (!analysisDraft?.blocks?.length || !candidate.labelBlockId) return null;
  return analysisDraft.blocks.find((block) => block.id === candidate.labelBlockId) ?? null;
};

const candidatePageLabel = (candidate: TemplateAnalysisCandidate) => {
  const page = analysisDraft?.pages.find((item) => item.id === candidate.pageId);
  return page ? `第 ${page.pageNumber} 页` : candidate.pageId;
};

const candidateCoordinateLabel = (candidate: TemplateAnalysisCandidate) => {
  const anchor = candidate.valueAnchor;
  if (!anchor) return '坐标未识别';
  return `x ${Math.round(anchor.x)}, y ${Math.round(anchor.y)}, w ${Math.round(anchor.width)}, h ${Math.round(anchor.height)}`;
};

const confirmedDecisionList = () => {
  return Object.values(candidateDecisions);
};

const allCandidatesDecided = Boolean(analysisDraft?.candidates?.length) && analysisDraft.candidates.every((candidate) => candidateDecisions[candidate.id]);
```

- [ ] **Step 6: Add confirmation mutation**

Add:

```ts
const confirmCandidatesMutation = useMutation({
  mutationFn: async () => {
    const versionId = getDesignerVersionId(designerRecord);
    if (!designerRecord || !versionId || !analysisDraft?.analysisId) throw new Error('当前模板没有可确认的解析草稿');
    if (!allCandidatesDecided) throw new Error('请逐项确认候选，或点击按推荐批量选择后再保存');
    return confirmFormTemplateAnalysisCandidates(designerRecord.id, versionId, analysisDraft.analysisId, confirmedDecisionList());
  },
  onSuccess: async (response) => {
    const version = response.data.data;
    setDesignerRecord((current) => current ? { ...current, currentVersionId: version.id, currentVersion: version } : current);
    setTemplateModelDesign(parseTemplateModelDesign(version));
    setTemplateCanvasDesign(parseTemplateCanvasDesign(version));
    setFieldCandidates([]);
    setAnalysisDraft(null);
    setCandidateDecisions({});
    setSelectedAnalysisCandidateId(null);
    await queryClient.invalidateQueries({ queryKey: [config.queryKey] });
    await queryClient.invalidateQueries({ queryKey: [config.auditQueryKey] });
    setSnackbar({ open: true, message: '候选确认已保存', severity: 'success' });
  },
  onError: (error: unknown) => setSnackbar({ open: true, message: error instanceof Error ? error.message : '候选确认失败', severity: 'error' }),
});
```

- [ ] **Step 7: Render candidate confirmation panel**

Replace the existing `fieldCandidates.length > 0` panel with:

```tsx
{analysisDraft?.candidates?.length ? (
  <Box data-form-template-candidate-confirmation-panel sx={{ border: '1px solid #ebeef5', borderRadius: 1, overflow: 'hidden' }}>
    <Stack spacing={0.75} sx={{ px: 1, py: 0.75, bgcolor: '#f5f7fa', borderBottom: '1px solid #ebeef5' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#303133' }}>候选确认</Typography>
        <Typography sx={{ fontSize: 11, color: allCandidatesDecided ? '#67c23a' : '#909399' }}>{Object.keys(candidateDecisions).length}/{analysisDraft.candidates.length}</Typography>
      </Stack>
      <Stack direction="row" spacing={0.5}>
        <Button data-form-template-candidate-bulk-suggested size="small" variant="outlined" onClick={applySuggestedCandidateDecisions} sx={{ flex: 1, height: 26 }}>
          按推荐批量选择
        </Button>
        <Button size="small" variant="contained" disabled={confirmCandidatesMutation.isPending || !allCandidatesDecided} onClick={() => confirmCandidatesMutation.mutate()} sx={{ minWidth: 72, height: 26 }}>
        保存确认
        </Button>
      </Stack>
    </Stack>
    <Stack spacing={0} sx={{ maxHeight: 260, overflow: 'auto' }}>
      {analysisDraft.candidates.map((candidate) => {
        const decision = candidateDecisions[candidate.id];
        const action = decision?.action ?? 'pending';
        const sourceBlock = candidateSourceBlock(candidate);
        const selected = selectedAnalysisCandidateId === candidate.id;
        return (
          <Box key={candidate.id} data-form-template-field-candidate-item onClick={() => setSelectedAnalysisCandidateId(candidate.id)} sx={{ p: 1, borderBottom: '1px solid #f0f2f5', bgcolor: selected ? '#f0f9ff' : '#fff', cursor: 'pointer' }}>
            <Stack spacing={0.75}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#303133', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{candidate.fieldName}</Typography>
              <Typography data-form-template-candidate-source sx={{ fontSize: 11, color: '#606266', lineHeight: 1.4 }}>
                原文：{sourceBlock?.text || candidate.fieldName} · {candidatePageLabel(candidate)} · {candidateCoordinateLabel(candidate)}
              </Typography>
              <Typography sx={{ fontSize: 11, color: '#909399', lineHeight: 1.4 }}>{candidate.reason || '解析生成'} · 推荐 {candidate.suggestedAction || 'component'} · 置信度 {Math.round((candidate.confidence ?? 0) * 100)}%</Typography>
              <Stack direction="row" spacing={0.5}>
                <Button data-form-template-candidate-action-component size="small" variant={action === 'component' ? 'contained' : 'outlined'} onClick={() => updateCandidateDecision(candidate, 'component')} draggable onDragStart={(event) => handleCanvasToolDragStart(event, { kind: 'candidate', candidate: { code: candidate.fieldCode, name: candidate.fieldName, type: typeForComponent(candidate.suggestedComponent), required: candidate.required ?? false } })}>
                  组件
                </Button>
                <Button data-form-template-candidate-action-static size="small" variant={action === 'staticText' ? 'contained' : 'outlined'} onClick={() => updateCandidateDecision(candidate, 'staticText')}>
                  文字
                </Button>
                <Button data-form-template-candidate-action-ignore size="small" variant={action === 'ignore' ? 'contained' : 'outlined'} color="inherit" onClick={() => updateCandidateDecision(candidate, 'ignore')}>
                  忽略
                </Button>
              </Stack>
            </Stack>
          </Box>
        );
      })}
    </Stack>
  </Box>
) : fieldCandidates.length > 0 ? (
  <Box data-form-template-field-candidates sx={{ border: '1px solid #ebeef5', borderRadius: 1, overflow: 'hidden' }}>
    <Typography sx={{ px: 1, py: 0.75, fontSize: 12, fontWeight: 600, color: '#303133', bgcolor: '#f5f7fa', borderBottom: '1px solid #ebeef5' }}>字段候选</Typography>
    <Stack spacing={0} sx={{ maxHeight: 168, overflow: 'auto' }}>
      {fieldCandidates.map((candidate) => (
        <Button
          key={candidate.code}
          data-form-template-field-candidate-item
          size="small"
          variant="text"
          onClick={() => addFieldCandidateToCanvas(candidate)}
          draggable
          onDragStart={(event) => handleCanvasToolDragStart(event, { kind: 'candidate', candidate })}
          sx={{ justifyContent: 'flex-start', borderRadius: 0, px: 1, py: 0.75, color: '#303133', textAlign: 'left', borderBottom: '1px solid #f0f2f5' }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 12, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{candidate.name}</Typography>
            <Typography sx={{ fontSize: 11, color: '#909399', lineHeight: 1.3 }}>{candidate.code} · {candidate.type}</Typography>
          </Box>
        </Button>
      ))}
    </Stack>
  </Box>
) : null}
```

Keep the existing field-candidate fallback block under the `: fieldCandidates.length > 0 ?` branch.

- [ ] **Step 8: Add selected candidate highlight on the canvas**

Before `return (` in the component, add:

```ts
const selectedAnalysisCandidate = analysisDraft?.candidates.find((candidate) => candidate.id === selectedAnalysisCandidateId) ?? null;
```

Inside each `data-form-template-canvas-page`, after the background layer and before `pageLayers.map`, add:

```tsx
{selectedAnalysisCandidate?.pageId === canvasPage.id && selectedAnalysisCandidate.valueAnchor ? (
  <Box
    data-form-template-candidate-highlight
    sx={{
      position: 'absolute',
      left: coordinatePercent(selectedAnalysisCandidate.valueAnchor.x, canvasPage.width),
      top: coordinatePercent(selectedAnalysisCandidate.valueAnchor.y, canvasPage.height),
      width: dimensionPercent(selectedAnalysisCandidate.valueAnchor.width, canvasPage.width),
      height: dimensionPercent(selectedAnalysisCandidate.valueAnchor.height, canvasPage.height),
      minWidth: 24,
      minHeight: 18,
      border: '2px dashed #e6a23c',
      bgcolor: 'rgba(230, 162, 60, 0.14)',
      pointerEvents: 'none',
      zIndex: 3,
    }}
  />
) : null}
```

- [ ] **Step 9: Add component type helper**

Add:

```ts
function typeForComponent(component?: string) {
  if (component === 'DateTimePicker') return 'datetime';
  if (component === 'NumberInput') return 'number';
  return 'text';
}
```

- [ ] **Step 10: Run frontend checks**

Run:

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend
npm run verify:template-modeling
npm run build
```

Expected: verifier and build pass.

## Task 6: Backend OnlyOffice PoC Endpoints

**Files:**

- Modify: `gmp-platform/backend/src/main/resources/application.yml`
- Modify: `gmp-platform/backend/src/main/resources/application-dev.yml`
- Modify: `gmp-platform/backend/src/main/java/com/zencas/edhr/template/controller/TemplateModelingController.java`
- Modify: `gmp-platform/backend/src/test/java/com/zencas/edhr/template/controller/TemplateModelingControllerTest.java`
- Modify: `gmp-platform/backend/pom.xml`

- [ ] **Step 1: Add config properties**

In `application.yml`, add under `edhr`:

```yaml
  onlyoffice:
    enabled: ${ONLYOFFICE_ENABLED:false}
    document-server-url: ${ONLYOFFICE_DOCUMENT_SERVER_URL:http://localhost:8088}
    public-backend-url: ${ONLYOFFICE_PUBLIC_BACKEND_URL:http://localhost:8081}
    jwt-secret: ${ONLYOFFICE_JWT_SECRET:dev-onlyoffice-secret-change-me}
    download-allowed-hosts: ${ONLYOFFICE_DOWNLOAD_ALLOWED_HOSTS:localhost,127.0.0.1,onlyoffice-document-server}
```

In `application-dev.yml`, add:

```yaml
edhr:
  ocr:
    paddle:
      python-command: ${OCR_PADDLE_PYTHON_COMMAND:.venv-ocr/bin/python}
      script-path: ${OCR_PADDLE_SCRIPT_PATH:./scripts/paddle_id_card_ocr.py}
  onlyoffice:
    enabled: ${ONLYOFFICE_ENABLED:false}
    document-server-url: ${ONLYOFFICE_DOCUMENT_SERVER_URL:http://localhost:8088}
    public-backend-url: ${ONLYOFFICE_PUBLIC_BACKEND_URL:http://localhost:8081}
    jwt-secret: ${ONLYOFFICE_JWT_SECRET:dev-onlyoffice-secret-change-me}
    download-allowed-hosts: ${ONLYOFFICE_DOWNLOAD_ALLOWED_HOSTS:localhost,127.0.0.1,onlyoffice-document-server}
```

Keep the existing `edhr.ocr` keys and merge carefully; do not create duplicate top-level `edhr` sections in the same YAML document.

- [ ] **Step 2: Inject config into controller**

Add dependency to `gmp-platform/backend/pom.xml` if it is not already present:

```xml
<dependency>
    <groupId>com.auth0</groupId>
    <artifactId>java-jwt</artifactId>
    <version>4.4.0</version>
</dependency>
```

Add fields:

```java
@Value("${edhr.onlyoffice.enabled:false}")
private boolean onlyOfficeEnabled;

@Value("${edhr.onlyoffice.document-server-url:http://localhost:8088}")
private String onlyOfficeDocumentServerUrl;

@Value("${edhr.onlyoffice.public-backend-url:http://localhost:8081}")
private String onlyOfficePublicBackendUrl;

@Value("${edhr.onlyoffice.jwt-secret:dev-onlyoffice-secret-change-me}")
private String onlyOfficeJwtSecret;

@Value("${edhr.onlyoffice.download-allowed-hosts:localhost,127.0.0.1,onlyoffice-document-server}")
private String onlyOfficeDownloadAllowedHosts;
```

- [ ] **Step 3: Add config endpoint**

Add:

```java
@GetMapping("/form-templates/{id}/versions/{versionId}/onlyoffice/config")
public ApiResponse<Map<String, Object>> getFormTemplateOnlyOfficeConfig(@PathVariable Long id, @PathVariable Long versionId) {
    formTemplateRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "表单模板不存在"));
    FormTemplateVersion version = findVersion(id, versionId);
    if (!onlyOfficeEnabled) {
        throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 文档服务未启用");
    }
    if (version.getSourceFileId() == null) {
        throw new BusinessException(ErrorCode.GENERAL_001, "请先导入源文件");
    }
    String fileType = StringUtils.hasText(version.getSourceFileType()) ? version.getSourceFileType() : resolveFileExtension(version.getSourceFileName());
    Map<String, Object> document = new LinkedHashMap<>();
    document.put("fileType", fileType);
    document.put("key", "form-template-" + versionId + "-" + version.getSourceFileId());
    document.put("title", version.getSourceFileName());
    document.put("url", onlyOfficePublicBackendUrl + "/api/v1/files/" + version.getSourceFileId() + "/preview");

    Map<String, Object> editorConfig = new LinkedHashMap<>();
    editorConfig.put("callbackUrl", onlyOfficePublicBackendUrl + "/api/v1/master-data/template-modeling/form-templates/" + id + "/versions/" + versionId + "/onlyoffice/callback");
    editorConfig.put("mode", "pdf".equalsIgnoreCase(fileType) ? "view" : "edit");

    Map<String, Object> config = new LinkedHashMap<>();
    config.put("document", document);
    config.put("documentType", onlyOfficeDocumentType(fileType));
    config.put("editorConfig", editorConfig);
    config.put("documentServerUrl", onlyOfficeDocumentServerUrl);
    config.put("token", onlyOfficeToken(document, editorConfig, config.get("documentType")));
    return ApiResponse.success(config);
}
```

Add helpers:

```java
private String onlyOfficeDocumentType(String fileType) {
    if ("xls".equalsIgnoreCase(fileType) || "xlsx".equalsIgnoreCase(fileType)) return "cell";
    if ("pdf".equalsIgnoreCase(fileType)) return "pdf";
    return "word";
}

private String onlyOfficeToken(Map<String, Object> document, Map<String, Object> editorConfig, Object documentType) {
    return com.auth0.jwt.JWT.create()
            .withClaim("document", document)
            .withClaim("documentType", String.valueOf(documentType))
            .withClaim("editorConfig", editorConfig)
            .sign(com.auth0.jwt.algorithms.Algorithm.HMAC256(onlyOfficeJwtSecret));
}
```

The JWT secret must match the deployed Document Server `JWT_SECRET`.

- [ ] **Step 4: Add callback endpoint**

Add imports if missing:

```java
import com.auth0.jwt.exceptions.JWTVerificationException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
```

Add:

```java
@PostMapping("/form-templates/{id}/versions/{versionId}/onlyoffice/callback")
@Transactional
public Map<String, Object> handleFormTemplateOnlyOfficeCallback(
        @PathVariable Long id,
        @PathVariable Long versionId,
        @RequestBody Map<String, Object> callback,
        HttpServletRequest request) throws IOException {
    FormTemplateVersion version = findVersion(id, versionId);
    verifyOnlyOfficeCallbackToken(callback, request, id, versionId);
    Object status = callback == null ? null : callback.get("status");
    if (Objects.equals(status, 2) || Objects.equals(status, 6)) {
        String editedFileUrl = callback == null ? null : String.valueOf(callback.get("url"));
        if (!StringUtils.hasText(editedFileUrl) || "null".equals(editedFileUrl)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 回调缺少文件地址");
        }
        Map<String, Object> before = versionSnapshot(version);
        FileObject editedFile;
        try {
            editedFile = storeOnlyOfficeEditedSourceFile(editedFileUrl, id, versionId, version);
        } catch (IOException | RuntimeException e) {
            writeAudit("FORM_TEMPLATE_VERSION", version.getId(), "SECURITY", "表单模板", "OnlyOffice 回调文件下载失败", Map.of(), Map.of(
                    "templateId", id,
                    "versionId", versionId,
                    "url", editedFileUrl,
                    "message", e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage()));
            throw e;
        }
        FormTemplateSourceRevision revision = createSourceRevision(id, versionId, editedFile.getId(), "ONLYOFFICE");
        version.setSourceFileId(editedFile.getId());
        version.setSourceFileName(editedFile.getOriginalName());
        version.setSourceFileType(resolveFileExtension(editedFile.getOriginalName()));
        version.setUpdatedBy(currentOperatorName());
        version.setUpdatedAt(LocalDateTime.now());
        FormTemplateVersion saved = formTemplateVersionRepository.save(version);
        Map<String, Object> after = versionSnapshot(saved);
        after.put("sourceRevisionNo", revision.getRevisionNo());
        writeChangedAudit("FORM_TEMPLATE_VERSION", saved.getId(), "表单模板", "OnlyOffice 源文档保存回调", before, after);
    }
    return Map.of("error", 0);
}
```

Add JWT helpers. OnlyOffice sends callback signatures in `Authorization: Bearer ...`; this also accepts a body `token` for local callback tests and deployments that use body tokens:

```java
private void verifyOnlyOfficeCallbackToken(Map<String, Object> callback, HttpServletRequest request, Long templateId, Long versionId) {
    String token = extractOnlyOfficeCallbackToken(callback, request);
    if (!StringUtils.hasText(token)) {
        writeOnlyOfficeSecurityAudit(templateId, versionId, "OnlyOffice 回调缺少签名", callback);
        throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 回调签名校验失败");
    }
    try {
        com.auth0.jwt.interfaces.DecodedJWT jwt = com.auth0.jwt.JWT.require(com.auth0.jwt.algorithms.Algorithm.HMAC256(onlyOfficeJwtSecret))
                .build()
                .verify(token);
        Map<String, Object> payload = jwt.getClaim("payload").asMap();
        if (payload == null || !Objects.equals(String.valueOf(payload.get("status")), String.valueOf(callback == null ? null : callback.get("status")))) {
            writeOnlyOfficeSecurityAudit(templateId, versionId, "OnlyOffice 回调签名载荷不匹配", callback);
            throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 回调签名校验失败");
        }
        Object callbackUrl = callback == null ? null : callback.get("url");
        if (callbackUrl != null && !Objects.equals(String.valueOf(payload.get("url")), String.valueOf(callbackUrl))) {
            writeOnlyOfficeSecurityAudit(templateId, versionId, "OnlyOffice 回调签名文件地址不匹配", callback);
            throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 回调签名校验失败");
        }
    } catch (JWTVerificationException e) {
        writeOnlyOfficeSecurityAudit(templateId, versionId, "OnlyOffice 回调签名校验失败", callback);
        throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 回调签名校验失败");
    }
}

private String extractOnlyOfficeCallbackToken(Map<String, Object> callback, HttpServletRequest request) {
    String authorization = request == null ? null : request.getHeader(HttpHeaders.AUTHORIZATION);
    if (StringUtils.hasText(authorization) && authorization.startsWith("Bearer ")) {
        return authorization.substring("Bearer ".length()).trim();
    }
    Object bodyToken = callback == null ? null : callback.get("token");
    return bodyToken == null ? null : String.valueOf(bodyToken);
}

private void writeOnlyOfficeSecurityAudit(Long templateId, Long versionId, String message, Map<String, Object> callback) {
    writeAudit("FORM_TEMPLATE_VERSION", versionId, "SECURITY", "表单模板", message, Map.of(), Map.of(
            "templateId", templateId,
            "versionId", versionId,
            "status", callback == null ? null : callback.get("status"),
            "hasUrl", callback != null && StringUtils.hasText(String.valueOf(callback.get("url")))));
}
```

Add download helper:

```java
private FileObject storeOnlyOfficeEditedSourceFile(String editedFileUrl, Long templateId, Long versionId, FormTemplateVersion version) throws IOException {
    URI editedUri = java.net.URI.create(editedFileUrl);
    validateOnlyOfficeDownloadUrl(editedUri);
    Long fileId = idGenerator.nextId();
    String originalName = StringUtils.hasText(version.getSourceFileName()) ? version.getSourceFileName() : "onlyoffice-edited-" + versionId + ".docx";
    Path storageDir = Path.of(storagePath, "template-imports", String.valueOf(templateId), String.valueOf(versionId));
    Files.createDirectories(storageDir);
    Path targetPath = storageDir.resolve(fileId + "_" + sanitizeFileName(originalName));
    try (InputStream inputStream = editedUri.toURL().openStream()) {
        Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
    } catch (IOException | RuntimeException e) {
        Files.deleteIfExists(targetPath);
        throw e;
    }
    byte[] bytes = Files.readAllBytes(targetPath);
    FileObject fileObject = FileObject.builder()
            .id(fileId)
            .tenantId(TENANT_ID)
            .originalName(originalName)
            .storedPath(targetPath.toString())
            .mimeType(resolveOnlyOfficeMimeType(originalName))
            .fileSize((long) bytes.length)
            .md5Hash(computeMd5(bytes))
            .targetType("FORM_TEMPLATE_SOURCE")
            .targetId(String.valueOf(versionId))
            .uploadedBy(AuditContext.getOperatorId())
            .createdAt(LocalDateTime.now())
            .build();
    return fileObjectRepository.save(fileObject);
}

private void validateOnlyOfficeDownloadUrl(URI editedUri) {
    String scheme = editedUri.getScheme();
    String host = editedUri.getHost();
    Set<String> allowedHosts = Arrays.stream(onlyOfficeDownloadAllowedHosts.split(","))
            .map(String::trim)
            .filter(StringUtils::hasText)
            .collect(Collectors.toSet());
    if (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme)) {
        throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 回调文件地址不受信任");
    }
    if (!allowedHosts.contains(host)) {
        throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 回调文件地址不受信任");
    }
}

private String resolveOnlyOfficeMimeType(String fileName) {
    String extension = resolveFileExtension(fileName);
    if ("xlsx".equals(extension)) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    if ("xls".equals(extension)) return "application/vnd.ms-excel";
    if ("pdf".equals(extension)) return "application/pdf";
    if ("doc".equals(extension)) return "application/msword";
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}
```

- [ ] **Step 5: Add backend tests**

Add tests:

```java
@Test
void getFormTemplateOnlyOfficeConfigRequiresEnabledServiceAndSourceFile() {
    FormTemplate template = FormTemplate.builder().id(101L).tenantId("default").code("FT-001").name("生产巡检表").currentVersionId(102L).build();
    FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").sourceFileId(301L).sourceFileName("生产巡检记录.xlsx").sourceFileType("xlsx").build();
    when(formTemplateRepository.findById(101L)).thenReturn(Optional.of(template));
    when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
    ReflectionTestUtils.setField(controller, "onlyOfficeEnabled", true);
    ReflectionTestUtils.setField(controller, "onlyOfficePublicBackendUrl", "http://localhost:8081");
    ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");

    var response = controller.getFormTemplateOnlyOfficeConfig(101L, 102L);

    assertThat(response.getData().get("documentType")).isEqualTo("cell");
    assertThat(objectMapper.valueToTree(response.getData()).get("document").get("url").asText()).contains("/api/v1/files/301/preview");
    assertThat(objectMapper.valueToTree(response.getData()).get("editorConfig").get("callbackUrl").asText()).contains("/onlyoffice/callback");
    assertThat(response.getData().get("token")).isNotNull();
}
```

Add callback test:

```java
@Test
void onlyOfficeCallbackStoresEditedFileRevisionAndWritesAuditForSaveStatus() throws Exception {
    AuditContext.setOperator("99", "系统管理员", "admin");
    FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").sourceFileId(301L).sourceFileName("生产巡检记录.xlsx").sourceFileType("xlsx").build();
    when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
    when(formTemplateVersionRepository.save(any(FormTemplateVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(fileObjectRepository.save(any(FileObject.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(formTemplateSourceRevisionRepository.countByTemplateIdAndVersionId(101L, 102L)).thenReturn(1);
    when(formTemplateSourceRevisionRepository.save(any(FormTemplateSourceRevision.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(idGenerator.nextId()).thenReturn(401L, 402L, 403L);
    ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
    ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
    ReflectionTestUtils.setField(controller, "onlyOfficeDownloadAllowedHosts", "localhost");
    com.sun.net.httpserver.HttpServer server = com.sun.net.httpserver.HttpServer.create(new java.net.InetSocketAddress("localhost", 0), 0);
    server.createContext("/edited.xlsx", exchange -> {
        byte[] bytes = new byte[] {1, 2, 3, 4};
        exchange.sendResponseHeaders(200, bytes.length);
        exchange.getResponseBody().write(bytes);
        exchange.close();
    });
    server.start();
    try {
        String editedUrl = "http://localhost:" + server.getAddress().getPort() + "/edited.xlsx";
        Map<String, Object> callback = Map.of("status", 2, "url", editedUrl);
        String callbackToken = com.auth0.jwt.JWT.create()
                .withClaim("payload", callback)
                .sign(com.auth0.jwt.algorithms.Algorithm.HMAC256("test-secret"));
        callback = new LinkedHashMap<>(callback);
        callback.put("token", callbackToken);
        org.springframework.mock.web.MockHttpServletRequest request = new org.springframework.mock.web.MockHttpServletRequest();
        request.addHeader(org.springframework.http.HttpHeaders.AUTHORIZATION, "Bearer " + callbackToken);

        Map<String, Object> response = controller.handleFormTemplateOnlyOfficeCallback(101L, 102L, callback, request);

        assertThat(response.get("error")).isEqualTo(0);
        assertThat(version.getSourceFileId()).isEqualTo(401L);
        verify(fileObjectRepository).save(any(FileObject.class));
        verify(formTemplateSourceRevisionRepository).save(any(FormTemplateSourceRevision.class));
        verify(auditEventRepository).save(any(AuditEvent.class));
    } finally {
        server.stop(0);
    }
}
```

Add invalid-token test:

```java
@Test
void onlyOfficeCallbackRejectsInvalidTokenAndWritesSecurityAudit() throws Exception {
    AuditContext.setOperator("99", "系统管理员", "admin");
    FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").sourceFileId(301L).sourceFileName("生产巡检记录.xlsx").sourceFileType("xlsx").build();
    when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
    when(idGenerator.nextId()).thenReturn(901L);
    ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
    org.springframework.mock.web.MockHttpServletRequest request = new org.springframework.mock.web.MockHttpServletRequest();
    request.addHeader(org.springframework.http.HttpHeaders.AUTHORIZATION, "Bearer bad-token");

    assertThatThrownBy(() -> controller.handleFormTemplateOnlyOfficeCallback(101L, 102L, Map.of("status", 2, "url", "http://localhost/edited.xlsx"), request))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("OnlyOffice 回调签名校验失败");

    assertThat(version.getSourceFileId()).isEqualTo(301L);
    verify(fileObjectRepository, never()).save(any(FileObject.class));
    verify(formTemplateSourceRevisionRepository, never()).save(any(FormTemplateSourceRevision.class));
    verify(formTemplateVersionRepository, never()).save(any(FormTemplateVersion.class));
    ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
    verify(auditEventRepository).save(auditCaptor.capture());
    assertThat(auditCaptor.getValue().getAction()).isEqualTo("SECURITY");
    assertThat(auditCaptor.getValue().getFunctionName()).contains("OnlyOffice 回调签名校验失败");
}
```

Add missing-token test:

```java
@Test
void onlyOfficeCallbackRejectsMissingTokenBeforeDownloadingEditedFile() throws Exception {
    AuditContext.setOperator("99", "系统管理员", "admin");
    FormTemplateVersion version = FormTemplateVersion.builder().id(102L).tenantId("default").templateId(101L).version("V1.0").sourceFileId(301L).sourceFileName("生产巡检记录.xlsx").sourceFileType("xlsx").build();
    when(formTemplateVersionRepository.findByIdAndTemplateId(102L, 101L)).thenReturn(Optional.of(version));
    when(idGenerator.nextId()).thenReturn(902L);
    ReflectionTestUtils.setField(controller, "onlyOfficeJwtSecret", "test-secret");
    org.springframework.mock.web.MockHttpServletRequest request = new org.springframework.mock.web.MockHttpServletRequest();

    assertThatThrownBy(() -> controller.handleFormTemplateOnlyOfficeCallback(101L, 102L, Map.of("status", 2, "url", "http://localhost/edited.xlsx"), request))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("OnlyOffice 回调签名校验失败");

    assertThat(version.getSourceFileId()).isEqualTo(301L);
    verify(fileObjectRepository, never()).save(any(FileObject.class));
    verify(formTemplateSourceRevisionRepository, never()).save(any(FormTemplateSourceRevision.class));
    verify(formTemplateVersionRepository, never()).save(any(FormTemplateVersion.class));
    verify(auditEventRepository).save(any(AuditEvent.class));
}
```

- [ ] **Step 6: Run backend tests**

Run the backend command. Expected: pass.

## Task 7: Frontend OnlyOffice Entry

**Files:**

- Modify: `gmp-platform/frontend/src/pages/master-data/TemplateModelingPage.tsx`
- Modify: `gmp-platform/frontend/scripts/verify-template-modeling-pages.mjs`

- [ ] **Step 1: Import API**

Add:

```ts
getFormTemplateOnlyOfficeConfig,
type OnlyOfficeEditorConfig,
```

- [ ] **Step 2: Add state**

Near designer state:

```ts
const [onlyOfficeDialog, setOnlyOfficeDialog] = useState<{ open: boolean; config: OnlyOfficeEditorConfig | null }>({ open: false, config: null });
const onlyOfficeContainerRef = useRef<HTMLDivElement | null>(null);
const onlyOfficeEditorRef = useRef<{ destroyEditor?: () => void } | null>(null);
```

- [ ] **Step 3: Add mutation**

Add:

```ts
const onlyOfficeConfigMutation = useMutation({
  mutationFn: async () => {
    const versionId = getDesignerVersionId(designerRecord);
    if (!designerRecord || !versionId) throw new Error('当前模板没有可预览源文件的版本');
    return getFormTemplateOnlyOfficeConfig(designerRecord.id, versionId);
  },
  onSuccess: (response) => setOnlyOfficeDialog({ open: true, config: response.data.data }),
  onError: (error: unknown) => setSnackbar({ open: true, message: error instanceof Error ? error.message : 'OnlyOffice 文档服务未配置', severity: 'error' }),
});
```

- [ ] **Step 4: Add toolbar entry**

In `data-form-template-file-import-actions`, after file import button:

```tsx
<Button
  data-form-template-onlyoffice-entry
  size="small"
  variant="text"
  disabled={onlyOfficeConfigMutation.isPending || !designerRecord.currentVersion?.sourceFileId}
  onClick={() => onlyOfficeConfigMutation.mutate()}
  sx={{ color: '#606266', minWidth: 96 }}
>
  原文预览
</Button>
```

- [ ] **Step 5: Add dialog**

Add this effect before the return block:

```ts
useEffect(() => {
  if (!onlyOfficeDialog.open || !onlyOfficeDialog.config || !onlyOfficeContainerRef.current) return undefined;
  const scriptId = 'onlyoffice-docs-api-script';
  const scriptSrc = `${onlyOfficeDialog.config.documentServerUrl.replace(/\/$/, '')}/web-apps/apps/api/documents/api.js`;
  const loadScript = () => new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing) {
      if ((window as typeof window & { DocsAPI?: unknown }).DocsAPI) resolve();
      else existing.addEventListener('load', () => resolve(), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = scriptSrc;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('OnlyOffice 编辑器脚本加载失败'));
    document.body.appendChild(script);
  });
  let cancelled = false;
  loadScript()
    .then(() => {
      if (cancelled || !onlyOfficeContainerRef.current) return;
      const docsApi = (window as typeof window & { DocsAPI?: { DocEditor: new (id: string, config: OnlyOfficeEditorConfig) => { destroyEditor?: () => void } } }).DocsAPI;
      if (!docsApi?.DocEditor) throw new Error('OnlyOffice 编辑器不可用');
      onlyOfficeContainerRef.current.innerHTML = '';
      const holder = document.createElement('div');
      holder.id = 'onlyoffice-form-template-editor';
      holder.style.width = '100%';
      holder.style.height = '100%';
      onlyOfficeContainerRef.current.appendChild(holder);
      onlyOfficeEditorRef.current = new docsApi.DocEditor(holder.id, onlyOfficeDialog.config);
    })
    .catch((error: unknown) => setSnackbar({ open: true, message: error instanceof Error ? error.message : 'OnlyOffice 编辑器加载失败', severity: 'error' }));
  return () => {
    cancelled = true;
    onlyOfficeEditorRef.current?.destroyEditor?.();
    onlyOfficeEditorRef.current = null;
  };
}, [onlyOfficeDialog.open, onlyOfficeDialog.config]);
```

Before the snackbar, add:

```tsx
<Dialog open={onlyOfficeDialog.open} onClose={() => setOnlyOfficeDialog({ open: false, config: null })} fullScreen>
  <Box sx={{ height: 48, px: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid #e4e7ed', bgcolor: '#fff' }}>
    <Typography sx={{ fontSize: 14, fontWeight: 600, flex: 1 }}>原文预览</Typography>
    <IconButton aria-label="关闭原文预览" onClick={() => setOnlyOfficeDialog({ open: false, config: null })}>
      <CloseIcon fontSize="small" />
    </IconButton>
  </Box>
  <Box ref={onlyOfficeContainerRef} data-form-template-onlyoffice-frame sx={{ flex: 1, minHeight: 0, height: 'calc(100vh - 48px)', bgcolor: '#fff' }} />
</Dialog>
```

This PoC uses the real OnlyOffice `DocsAPI.DocEditor` entrypoint when Document Server is installed and enabled. When the backend reports that OnlyOffice is disabled, the existing mutation error path keeps the designer usable.

- [ ] **Step 6: Update verifier**

Add checks:

```js
mustInclude(pageContent, 'onlyOfficeConfigMutation', 'designer should request OnlyOffice config on demand');
mustInclude(pageContent, 'DocsAPI', 'designer should initialize OnlyOffice DocsAPI editor');
mustInclude(pageContent, 'DocEditor', 'designer should create a OnlyOffice DocEditor instance');
mustInclude(pageContent, 'data-form-template-onlyoffice-frame', 'designer should expose OnlyOffice preview frame');
mustInclude(pageContent, '原文预览', 'designer should expose source document preview action');
```

- [ ] **Step 7: Run frontend checks**

Run verifier and build. Expected: pass.

## Task 8: Docker Compose Optional Document Server

**Files:**

- Modify: `gmp-platform/docker-compose.yml`

- [ ] **Step 1: Add optional OnlyOffice service**

Add service:

```yaml
  onlyoffice-document-server:
    image: onlyoffice/documentserver:latest
    container_name: edhr-onlyoffice-document-server
    profiles:
      - onlyoffice
    ports:
      - "8088:80"
    environment:
      JWT_ENABLED: "true"
      JWT_SECRET: dev-onlyoffice-secret-change-me
    volumes:
      - onlyoffice_data:/var/www/onlyoffice/Data
      - onlyoffice_logs:/var/log/onlyoffice
```

Add volumes:

```yaml
  onlyoffice_data:
  onlyoffice_logs:
```

- [ ] **Step 2: Add backend env**

In backend environment:

```yaml
      ONLYOFFICE_ENABLED: "false"
      ONLYOFFICE_DOCUMENT_SERVER_URL: http://onlyoffice-document-server
      ONLYOFFICE_PUBLIC_BACKEND_URL: http://localhost:8081
      ONLYOFFICE_JWT_SECRET: dev-onlyoffice-secret-change-me
```

- [ ] **Step 3: Validate YAML**

Run:

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform
docker compose config >/tmp/edhr-compose-config.yaml
```

Expected: exit code 0.

## Task 9: End-To-End Verification

**Files:**

- No planned code edits.

- [ ] **Step 1: Run frontend verifier and build**

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/frontend
npm run verify:template-modeling
npm run build
```

Expected: both pass.

- [ ] **Step 2: Run backend focused tests**

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform/backend
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
mvn test -Dtest=TemplateModelingControllerTest,PaddleOcrClientTest -DargLine="-javaagent:/Users/wangzilin/.m2/repository/net/bytebuddy/byte-buddy-agent/1.14.16/byte-buddy-agent-1.14.16.jar"
```

Expected: pass.

- [ ] **Step 3: Run diff hygiene checks**

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案
git diff --check
git status --short --branch --untracked-files=all
```

Expected: no whitespace errors; status only contains planned files plus pre-existing worktree changes.

- [ ] **Step 4: Browser QA**

Use the existing local app workflow for the candidate-confirmation path:

1. Start backend on Java 21 if not running.
2. Start frontend on port 3000.
3. Open `http://localhost:3000/master-data/form-templates`.
4. Create or open a form template version.
5. Import one sample PDF and one sample Excel.
6. Confirm one candidate as component, one as static text, and one as ignored.
7. Save design.
8. Refresh and reopen the designer.
9. Verify confirmed component and static text persist and ignored candidate does not render as a field.
10. Click `原文预览`; when OnlyOffice is disabled, verify the UI shows a clear configuration error instead of breaking the designer.

- [ ] **Step 5: Browser QA with OnlyOffice enabled**

Run Document Server and backend with matching JWT settings:

```bash
cd /Users/wangzilin/Documents/Project-项目库/02.执行中项目/Zencas_医疗套件方案/gmp-platform
docker compose --profile onlyoffice up -d onlyoffice-document-server
cd backend
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
export ONLYOFFICE_ENABLED=true
export ONLYOFFICE_DOCUMENT_SERVER_URL=http://localhost:8088
export ONLYOFFICE_PUBLIC_BACKEND_URL=http://localhost:8081
export ONLYOFFICE_JWT_SECRET=dev-onlyoffice-secret-change-me
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Expected QA:

1. Open `http://localhost:3000/master-data/form-templates`.
2. Open a version with an imported Word or Excel source file.
3. Click `原文预览`.
4. Verify the dialog loads `${ONLYOFFICE_DOCUMENT_SERVER_URL}/web-apps/apps/api/documents/api.js` and initializes `DocsAPI.DocEditor` instead of showing the disabled-service message.
5. Make a small edit in OnlyOffice and close/save the editor.
6. Verify backend logs or test-visible API state show `POST /onlyoffice/callback` with a valid JWT.
7. Verify a new `form_template_source_revision` row is created with `source = ONLYOFFICE`.
8. Verify the version `sourceFileId/sourceFileName/sourceFileType` now points to the edited source file.
9. Verify audit contains `OnlyOffice 源文档保存回调`.
10. Send a manual callback with an invalid token and verify the response rejects it, no source revision is created, and audit contains `OnlyOffice 回调签名校验失败`.

## Review Notes Before Execution

- This plan intentionally keeps OnlyOffice PoC minimal but complete enough for the requested architecture: config opens `DocsAPI.DocEditor`, callback validates the incoming JWT before downloading the edited URL into a new `FileObject`, invalid or missing callback signatures write security audit entries, and source revisions track edits.
- Add a Document Server host allow-list around edited-file downloads during implementation if the deployment exposes callback endpoints beyond the trusted internal network.
- Candidate confirmation changes existing import semantics: interactive fields are no longer auto-confirmed immediately after import. Existing tests that assume automatic `interactiveFields` must move that assertion to the decision endpoint.
- `TemplateModelingController.java` is already large. Follow-up cleanup should extract import/analysis/OnlyOffice services, but this plan keeps first changes close to current patterns to reduce integration risk.
