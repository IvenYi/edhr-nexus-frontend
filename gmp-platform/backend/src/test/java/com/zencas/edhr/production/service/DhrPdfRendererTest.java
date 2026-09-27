package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.Test;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import static org.assertj.core.api.Assertions.*;

class DhrPdfRendererTest {
    private final ObjectMapper mapper = new ObjectMapper();
    @org.junit.jupiter.api.BeforeEach void prepareOutput() throws Exception { Files.createDirectories(Path.of("target/dhr-pdf-qa")); }

    @Test void rendersFrozenValuesAsRealTextAndRetainsTemplateLayout() throws Exception {
        try (var renderer = new DhrPdfRenderer(mapper).open()) {
            var record = DhrPrintTestFixtures.record(mapper, "1");
            byte[] pdf = renderer.form(record, "DHR-QA V1 · FR-1");
            try (var doc = Loader.loadPDF(pdf)) {
                assertThat(doc.getNumberOfPages()).isEqualTo(1);
                assertThat(doc.getPage(0).getMediaBox().getWidth()).isBetween(590f, 600f);
                assertThat(new PDFTextStripper().getText(doc)).contains("冻结检验记录", "冻结值-12", "DHR-QA V1");
            }
            Path output = Path.of("target/dhr-pdf-qa"); Files.createDirectories(output);
            Files.write(output.resolve("单表-冻结检验记录.pdf"), pdf);
            byte[] index = renderer.index("完整DHR_QA_V1", "冻结版本", List.of(Map.of("name", "委外报告.docx", "detail", "只列索引，不并入正文", "path", "汇总附件/委外报告.docx")));
            try (var doc = Loader.loadPDF(index)) { assertThat(java.text.Normalizer.normalize(new PDFTextStripper().getText(doc), java.text.Normalizer.Form.NFKC)).contains("委外报告.docx", "附件内容不并入"); }
            Files.write(output.resolve("附件索引.pdf"), index);
        }
    }

    @Test void usesFrozenPlacementOrderingAndNeverMutatesSourceIdentity() throws Exception {
        var input = mapper.createObjectNode();
        input.set("baseDirectory", mapper.readTree("{\"directories\":[{\"id\":\"10\",\"name\":\"生产记录\",\"items\":[]}]}"));
        input.putArray("overlayDirectories");
        input.set("placements", mapper.readTree("[{\"recordId\":\"2\",\"targetNodeKey\":\"base-dir-10\",\"displayOrder\":0,\"displayName\":\"改名记录\"},{\"recordId\":\"1\",\"targetNodeKey\":\"base-dir-10\",\"displayOrder\":1}]"));
        input.putArray("records").add(DhrPrintTestFixtures.record(mapper, "1")).add(DhrPrintTestFixtures.record(mapper, "2"));
        try (var renderer = new DhrPdfRenderer(mapper).open()) {
            var result = renderer.order(input);
            assertThat(result.get(0).path("id").asText()).isEqualTo("2");
            assertThat(result.get(0).path("archivePath").asText()).isEqualTo("生产记录 / 改名记录");
            assertThat(result.get(1).path("id").asText()).isEqualTo("1");
            assertThat(input.at("/records/0/originKind").asText()).isEqualTo("WORK");
        }
    }

    @Test void paginatesLongSheetsAndLandscapeWordWithoutLosingLastRowOrAddingBlankPages() throws Exception {
        var record = DhrPrintTestFixtures.record(mapper, "long");
        var canvas = mapper.readTree(record.at("/snapshot/canvas").asText());
        var page = (com.fasterxml.jackson.databind.node.ObjectNode) canvas.at("/payload/pages/0");
        ((com.fasterxml.jackson.databind.node.ObjectNode) page.path("sheet")).put("rowCount", 60);
        var cells = (com.fasterxml.jackson.databind.node.ObjectNode) page.path("cells");
        for (int i = 1; i <= 60; i++) cells.putObject(i + ":1").put("value", "ROW-" + String.format("%03d", i));
        ((com.fasterxml.jackson.databind.node.ObjectNode) record.path("snapshot")).put("canvas", canvas.toString());
        try (var renderer = new DhrPdfRenderer(mapper).open()) {
            byte[] pdf = renderer.form(record, "DHR-LONG V1");
            try (var doc = Loader.loadPDF(pdf)) {
                assertThat(doc.getNumberOfPages()).isEqualTo(3);
                String text = new PDFTextStripper().getText(doc);
                for (int i = 1; i <= 60; i++) assertThat(text).contains("ROW-" + String.format("%03d", i));
            }
            Files.write(Path.of("target/dhr-pdf-qa/长表分页.pdf"), pdf);
        }
        page.remove("cells"); page.putObject("cells"); page.putArray("nodes");
        ((com.fasterxml.jackson.databind.node.ObjectNode) page.path("sheet")).put("paperOrientation", "landscape");
        var block = page.putObject("wordDocument").put("source", "docx").putArray("blocks").addObject().put("id", "p1").put("type", "paragraph").put("text", "Landscape original layout");
        block.putObject("layout").put("left", 0).put("top", 0).put("width", 500).put("height", 30);
        ((com.fasterxml.jackson.databind.node.ObjectNode) record.path("snapshot")).put("canvas", canvas.toString());
        try (var renderer = new DhrPdfRenderer(mapper).open()) {
            byte[] pdf = renderer.form(record, "DHR-WORD V1");
            try (var doc = Loader.loadPDF(pdf)) {
                assertThat(doc.getNumberOfPages()).isEqualTo(1);
                assertThat(doc.getPage(0).getMediaBox().getWidth()).isGreaterThan(doc.getPage(0).getMediaBox().getHeight());
                assertThat(new PDFTextStripper().getText(doc)).contains("Landscape original layout");
            }
            Files.write(Path.of("target/dhr-pdf-qa/横向Word.pdf"), pdf);
        }
    }

    @Test void rejectsMissingLayoutAndExternalImagesInsteadOfSilentIncompletePdf() throws Exception {
        var record = DhrPrintTestFixtures.record(mapper, "1");
        try (var renderer = new DhrPdfRenderer(mapper).open()) {
            ((com.fasterxml.jackson.databind.node.ObjectNode) record.path("snapshot")).put("canvas", "{}");
            var missingRecord = record;
            assertThatThrownBy(() -> renderer.form(missingRecord, "V1")).hasMessageContaining("版式页面不完整");
        }
        record = DhrPrintTestFixtures.record(mapper, "1");
        var canvas = mapper.readTree(record.at("/snapshot/canvas").asText());
        ((com.fasterxml.jackson.databind.node.ArrayNode) canvas.at("/payload/pages/0/medias")).addObject().put("id", "external").put("src", "http://127.0.0.1:1/private");
        var image = ((com.fasterxml.jackson.databind.node.ArrayNode) canvas.at("/payload/pages/0/images")).addObject().put("id", "image").put("mediaId", "external");
        image.putObject("layout").put("top", 0).put("left", 0).put("width", 20).put("height", 20);
        ((com.fasterxml.jackson.databind.node.ObjectNode) record.path("snapshot")).put("canvas", canvas.toString());
        var externalRecord = record;
        try (var renderer = new DhrPdfRenderer(mapper).open()) { assertThatThrownBy(() -> renderer.form(externalRecord, "V1")).hasMessageContaining("PDF 生成失败"); }
    }

    @Test void refusesClippedFieldValuesInsteadOfReturningIncompletePrintableEvidence() throws Exception {
        var record = DhrPrintTestFixtures.record(mapper, "overflow");
        ((com.fasterxml.jackson.databind.node.ObjectNode) record.path("fieldValues")).put("value", "THIS_VALUE_MUST_NOT_BE_TRUNCATED_".repeat(20));
        try (var renderer = new DhrPdfRenderer(mapper).open()) {
            assertThatThrownBy(() -> renderer.form(record, "V1")).hasMessageContaining("冻结字段内容超出版式");
        }
    }

    @Test void refusesEllipsizedWordSelectValuesToo() throws Exception {
        var record = DhrPrintTestFixtures.record(mapper, "word-select");
        ((com.fasterxml.jackson.databind.node.ObjectNode) record.path("fieldValues")).put("value", "fail");
        var field = (com.fasterxml.jackson.databind.node.ObjectNode) record.at("/snapshot/fields/0");
        field.put("type", "singleSelect").withObject("/typeConfig").putArray("options").addObject()
                .put("value", "fail").put("label", "FAILED_MUST_KEEP_FULL_VALUE_".repeat(12)).put("status", "enabled");
        var canvas = mapper.readTree(record.at("/snapshot/canvas").asText());
        var page = (com.fasterxml.jackson.databind.node.ObjectNode) canvas.at("/payload/pages/0");
        var table = page.putObject("wordDocument").put("source", "docx").putArray("blocks").addObject().put("id", "t1").put("type", "table");
        table.putObject("layout").put("left", 0).put("top", 0).put("width", 200).put("height", 40);
        table.putArray("columnWidths").add(200); table.putArray("rowHeights").add(40);
        table.putArray("cells").addObject().put("id", "c1").put("row", 1).put("col", 1).put("rowSpan", 1).put("colSpan", 1).put("text", "");
        var node = (com.fasterxml.jackson.databind.node.ObjectNode) page.path("nodes").get(0);
        node.put("type", "select"); node.putObject("style").put("position", "absolute").putObject("wordTableCell").put("blockId", "t1").put("cellId", "c1");
        ((com.fasterxml.jackson.databind.node.ObjectNode) record.path("snapshot")).put("canvas", canvas.toString());
        try (var renderer = new DhrPdfRenderer(mapper).open()) {
            assertThatThrownBy(() -> renderer.form(record, "V1")).hasMessageContaining("冻结字段内容超出版式");
        }
    }

    /** Optional local acceptance: read frozen snapshots only, no export audits or data writes. */
    @Test
    @org.junit.jupiter.api.condition.EnabledIfSystemProperty(named = "dhr.pdf.qa.jdbcUrl", matches = ".+")
    void rendersAvailableFrozenDatabaseTemplatesReadOnly() throws Exception {
        try (var db = java.sql.DriverManager.getConnection(System.getProperty("dhr.pdf.qa.jdbcUrl"), System.getenv("DHR_QA_DB_USER"), System.getenv("DHR_QA_DB_PASSWORD"))) {
            db.setReadOnly(true);
            try (var query = db.createStatement(); var rows = query.executeQuery("SELECT candidate_snapshot FROM dhr_summary_version WHERE status='FORMALIZED' ORDER BY id DESC LIMIT 1"); var renderer = new DhrPdfRenderer(mapper).open()) {
                assertThat(rows.next()).isTrue();
                for (var record : mapper.readTree(rows.getString(1))) {
                    byte[] bytes = renderer.form(record, "本地验收 · " + record.path("instanceNo").asText());
                    try (var pdf = Loader.loadPDF(bytes)) { assertThat(pdf.getNumberOfPages()).isPositive(); }
                    Files.write(Path.of("target/dhr-pdf-qa/实际表单-" + DhrArchiveService.safeName(record.path("instanceNo").asText()) + ".pdf"), bytes);
                }
            }
        }
    }
}
