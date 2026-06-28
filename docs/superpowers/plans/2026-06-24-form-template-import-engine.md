# Form Template Import Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the scheme B form-template import engine so PDF, image, Word, and Excel files upload as real files, parse into a layered canvas schema, render in the fullscreen designer, and reserve field anchors for later drag/drop editing and customer filling.

**Architecture:** Reuse the existing template-modeling controller and `FileObject` storage model. Add a small parser boundary that converts each supported file into a stable `modelDesignJson` and `canvasDesignJson` contract containing pages, background layers, visual layers, field anchors, and future fill bindings. The frontend uploads multipart files, stores the returned schema in designer state, renders imported pages as canvas backgrounds with field overlays, and saves the same schema back through the existing design-save endpoint.

**Tech Stack:** Spring Boot 3.3, Java 21, PDFBox, Apache POI, ImageIO/Java2D, React, MUI, TypeScript, existing `npm run verify:template-modeling`.

---

## Files

- Modify: `gmp-platform/backend/pom.xml` to add Apache POI for Word/Excel parsing.
- Modify: `gmp-platform/backend/src/main/java/com/zencas/edhr/template/controller/TemplateModelingController.java` for multipart import, source file storage, JSON persistence, and response records.
- Modify: `gmp-platform/backend/src/main/java/com/zencas/edhr/template/entity/FormTemplateVersion.java` to persist `source_file_id`.
- Modify: `gmp-platform/backend/src/main/resources/db/changelog/0033-template-modeling-management.sql` to add `source_file_id`.
- Modify: `gmp-platform/backend/src/test/java/com/zencas/edhr/template/controller/TemplateModelingControllerTest.java` for multipart import contract tests.
- Modify: `gmp-platform/frontend/src/api/template-modeling.ts` for multipart upload types and parsed schema types.
- Modify: `gmp-platform/frontend/src/pages/master-data/TemplateModelingPage.tsx` for parsed canvas state, rendering, thumbnails, field overlays, and save.
- Modify: `gmp-platform/frontend/scripts/verify-template-modeling-pages.mjs` for frontend/backend structural contract checks.

## Target Schema

`modelDesignJson`:

```json
{
  "schemaVersion": "1.0",
  "source": {
    "fileId": "123",
    "fileName": "生产巡检记录.pdf",
    "fileType": "pdf",
    "mimeType": "application/pdf"
  },
  "fields": [
    {
      "id": "field-1",
      "code": "operator",
      "name": "操作人",
      "type": "text",
      "required": true,
      "pageId": "page-1",
      "x": 96,
      "y": 128,
      "width": 120,
      "height": 28,
      "fontFamily": "default",
      "fontSize": 12,
      "textAlign": "left",
      "binding": {
        "fillable": true,
        "component": "TextInput"
      }
    }
  ]
}
```

`canvasDesignJson`:

```json
{
  "schemaVersion": "1.0",
  "strategy": "图层锚定+格式复刻",
  "orientation": "portrait",
  "source": {
    "fileId": "123",
    "fileName": "生产巡检记录.pdf",
    "fileType": "pdf",
    "mimeType": "application/pdf"
  },
  "pages": [
    {
      "id": "page-1",
      "pageNumber": 1,
      "width": 595,
      "height": 842,
      "orientation": "portrait",
      "deskewApplied": false,
      "background": {
        "type": "preview",
        "fileId": "123",
        "url": "/api/v1/files/123/preview",
        "mimeType": "application/pdf"
      },
      "layers": [
        {
          "id": "layer-title",
          "type": "text",
          "text": "生产巡检记录",
          "x": 48,
          "y": 42,
          "width": 240,
          "height": 24,
          "fontFamily": "default",
          "fontSize": 14,
          "textAlign": "left"
        }
      ]
    }
  ],
  "interactiveFields": [
    {
      "id": "field-1",
      "code": "operator",
      "pageId": "page-1",
      "x": 96,
      "y": 128,
      "width": 120,
      "height": 28,
      "component": "TextInput",
      "fillable": true
    }
  ],
  "fieldBindings": []
}
```

## Task 1: Contract Tests

**Files:**
- Modify: `gmp-platform/backend/src/test/java/com/zencas/edhr/template/controller/TemplateModelingControllerTest.java`
- Modify: `gmp-platform/frontend/scripts/verify-template-modeling-pages.mjs`

- [ ] **Step 1: Write failing backend test for multipart PDF import**

Add a test that calls the controller import method with a `MockMultipartFile`, asserts `sourceFileId`, PDF canvas page data, field bindings, and audit.

- [ ] **Step 2: Write failing backend test for unsupported file type**

Add a test that uploads a `.zip` or `application/zip` file to the template import endpoint and expects a user-readable `BusinessException` containing `仅支持 PDF、Word、Excel、图片`.

- [ ] **Step 3: Write failing frontend verifier checks**

Add `mustInclude` checks for `FormData`, `multipart/form-data`, `TemplateCanvasDesign`, `data-form-template-canvas-page`, `data-form-template-background-layer`, `data-form-template-field-overlay`, and `interactiveFields`.

- [ ] **Step 4: Run RED checks**

Run:

```bash
cd gmp-platform/frontend && npm run verify:template-modeling
```

Expected: FAIL because the new frontend contract is not implemented.

Run:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
export PATH="$JAVA_HOME/bin:$PATH"
cd gmp-platform/backend
mvn test -Dtest=TemplateModelingControllerTest -DargLine="-javaagent:/Users/wangzilin/.m2/repository/net/bytebuddy/byte-buddy-agent/1.14.16/byte-buddy-agent-1.14.16.jar"
```

Expected: FAIL because multipart import and parser output are not implemented.

## Task 2: Backend Multipart Import And Parser Boundary

**Files:**
- Modify: `gmp-platform/backend/pom.xml`
- Modify: `gmp-platform/backend/src/main/java/com/zencas/edhr/template/controller/TemplateModelingController.java`
- Modify: `gmp-platform/backend/src/main/java/com/zencas/edhr/template/entity/FormTemplateVersion.java`
- Modify: `gmp-platform/backend/src/main/resources/db/changelog/0033-template-modeling-management.sql`

- [ ] **Step 1: Add POI dependencies**

Add `org.apache.poi:poi:5.2.5` and `org.apache.poi:poi-ooxml:5.2.5`.

- [ ] **Step 2: Add `sourceFileId`**

Add `sourceFileId` to `FormTemplateVersion`, migration column `source_file_id BIGINT`, version snapshot, and `TemplateVersionResponse`.

- [ ] **Step 3: Change import endpoint to multipart**

Change import signature to:

```java
public ApiResponse<TemplateImportResponse> importFormTemplateSourceFile(
        @PathVariable Long id,
        @PathVariable Long versionId,
        @RequestParam("file") MultipartFile file) throws IOException
```

Validate supported extensions/mime types and produce friendly errors.

- [ ] **Step 4: Store source file as `FileObject`**

Create a private `storeTemplateSourceFile(MultipartFile file, Long templateId, Long versionId)` method that writes to `${edhr.file.storage-path}/template-imports`, computes MD5, creates a `FileObject` with `targetType = FORM_TEMPLATE_SOURCE` and `targetId = versionId`.

- [ ] **Step 5: Add parser result helpers**

Inside the controller, add small private records and methods for:

```java
private TemplateImportArtifacts parseTemplateImport(MultipartFile file, FileObject fileObject)
private TemplateImportArtifacts parsePdfTemplate(...)
private TemplateImportArtifacts parseImageTemplate(...)
private TemplateImportArtifacts parseWordTemplate(...)
private TemplateImportArtifacts parseExcelTemplate(...)
```

Each method returns source metadata, pages, layers, field candidates, and interactive fields. PDF uses PDFBox to read page sizes and text positions when possible. Images use ImageIO to read dimensions and set `deskewApplied` metadata. Word and Excel use POI to extract text/table labels into candidates and approximate a portrait/landscape canvas.

- [ ] **Step 6: Persist parsed JSON**

Set `sourceFileId`, `sourceFileName`, `sourceFileType`, `importStatus = 已导入`, `modelDesignJson`, and `canvasDesignJson` from parser output. Keep `workflowDesignJson` unchanged unless empty.

- [ ] **Step 7: Run backend GREEN check**

Run the Java 21 Maven command from Task 1. Expected: PASS for `TemplateModelingControllerTest`.

## Task 3: Frontend API And Canvas Rendering

**Files:**
- Modify: `gmp-platform/frontend/src/api/template-modeling.ts`
- Modify: `gmp-platform/frontend/src/pages/master-data/TemplateModelingPage.tsx`

- [ ] **Step 1: Add schema types**

Add `TemplateCanvasDesign`, `TemplateCanvasPage`, `TemplateCanvasLayer`, `TemplateInteractiveField`, and extend `TemplateImportResponse` with `canvasDesign`, `modelDesign`.

- [ ] **Step 2: Change import API to `FormData`**

Make `importFormTemplateSourceFile(id, versionId, file)` build a `FormData`, append `file`, and post with `Content-Type: multipart/form-data`.

- [ ] **Step 3: Parse design JSON from current version**

Add helpers:

```ts
function parseTemplateModelDesign(version?: TemplateVersionRecord | null): TemplateModelDesign
function parseTemplateCanvasDesign(version?: TemplateVersionRecord | null): TemplateCanvasDesign
```

Initialize designer state from those helpers when opening the designer and after import.

- [ ] **Step 4: Render imported pages**

Replace placeholder canvas content with mapped `canvasDesign.pages`. Each page must render `data-form-template-canvas-page`, a background layer marker, visual text/table layers, and `data-form-template-field-overlay` boxes from `interactiveFields`.

- [ ] **Step 5: Update thumbnails**

Generate thumbnail rows from `canvasDesign.pages` instead of hard-coded `[1, 2]`.

- [ ] **Step 6: Preserve canvas on save**

Change save mutation to persist current `modelDesign` and `canvasDesign`, not reset `canvasDesignJson` to empty layers.

- [ ] **Step 7: Run frontend GREEN checks**

Run:

```bash
cd gmp-platform/frontend && npm run verify:template-modeling && npm run build
```

Expected: both pass. Existing Vite chunk-size warning is acceptable if the build exit code is 0.

## Task 4: QA And Integration

**Files:**
- No code changes unless verification exposes defects.

- [ ] **Step 1: Run whitespace check**

Run:

```bash
cd gmp-platform && git diff --check
```

Expected: no whitespace errors.

- [ ] **Step 2: Review diff scope**

Run:

```bash
cd gmp-platform && git status --short --untracked-files=all && git diff --stat
```

Expected: changed files match this plan plus existing user work; no unrelated temp/build files.

- [ ] **Step 3: Browser QA**

Open `/master-data/form-templates`, enter a form-template designer, import a small supported file, verify the designer shows parsed canvas page(s), background/layer content, field overlays, and save feedback. If browser automation cannot click the MUI table reliably, state that limitation and provide command-level verification evidence.
