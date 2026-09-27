package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.microsoft.playwright.*;
import com.microsoft.playwright.options.Margin;
import com.microsoft.playwright.options.ServiceWorkerPolicy;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.multipdf.PDFMergerUtility;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Semaphore;

import static com.zencas.edhr.production.service.ExecutionSnapshotBuilder.invalid;

/** Offline, trusted print bundle. No access to app APIs, Internet, or client-supplied HTML. */
@Service
@RequiredArgsConstructor
public class DhrPdfRenderer {
    private final ObjectMapper mapper;
    private final Semaphore capacity = new Semaphore(2);
    @Value("${edhr.dhr.pdf.chromium-path:}") private String chromiumPath = "";

    public Session open() throws IOException {
        if (!capacity.tryAcquire()) throw invalid("当前正在生成其他 DHR，请稍后重试");
        try { return new Session(); }
        catch (Exception ex) { capacity.release(); if (ex instanceof IOException io) throw io; throw invalid("PDF 渲染环境不可用，请检查 Chromium 和打印资源：" + ex.getMessage()); }
    }

    public final class Session implements AutoCloseable {
        private final Playwright playwright;
        private Browser browser;
        private Page page;
        private final List<String> failures = new ArrayList<>();

        private Session() throws IOException {
            String bundle;
            try (var input = new ClassPathResource("dhr-print/renderer.js").getInputStream()) { bundle = new String(input.readAllBytes(), StandardCharsets.UTF_8); }
            playwright = Playwright.create();
            try {
                var options = new BrowserType.LaunchOptions().setHeadless(true);
                if (chromiumPath != null && !chromiumPath.isBlank()) options.setExecutablePath(Path.of(chromiumPath));
                browser = playwright.chromium().launch(options);
                var context = browser.newContext(new Browser.NewContextOptions().setLocale("zh-CN").setTimezoneId("Asia/Shanghai").setServiceWorkers(ServiceWorkerPolicy.BLOCK));
                context.route("**/*", route -> { failures.add("禁止外部资源：" + route.request().url()); route.abort(); });
                page = context.newPage();
                page.onPageError(failures::add);
                page.setDefaultTimeout(60_000);
                page.setContent("<!doctype html><html lang='zh-CN'><meta charset='utf-8'><body><div id='root'></div></body></html>");
                page.addScriptTag(new Page.AddScriptTagOptions().setContent(bundle));
            } catch (Exception ex) { if (browser != null) browser.close(); playwright.close(); throw ex; }
        }

        public JsonNode order(JsonNode input) { return mapper.valueToTree(page.evaluate("input => window.dhrPrint.orderArchive(input)", value(input))); }

        public byte[] form(JsonNode record, String footer) throws IOException {
            try (PDDocument result = new PDDocument()) {
                int count = 1;
                for (int index = 0; index < count; index++) {
                    JsonNode metrics = mapper.valueToTree(page.evaluate("async x => await window.dhrPrint.renderForm(x.record, x.index)", Map.of("record", value(record), "index", index)));
                    count = metrics.path("count").asInt();
                    ensureValid();
                    byte[] bytes = page.pdf(pdfOptions(metrics.path("width").asDouble(), metrics.path("height").asDouble(), footer));
                    append(result, bytes);
                }
                return bytes(result);
            } catch (PlaywrightException ex) { throw invalid("冻结表单 PDF 生成失败：" + record.path("instanceNo").asText() + "；" + ex.getMessage()); }
        }

        public byte[] index(String title, String subtitle, List<Map<String, String>> rows) {
            page.evaluate("async input => await window.dhrPrint.renderIndex(input)", Map.of("title", title, "subtitle", subtitle, "rows", rows));
            ensureValid();
            return page.pdf(pdfOptions(210 * 96 / 25.4, 297 * 96 / 25.4, title));
        }

        private void ensureValid() { if (!failures.isEmpty()) throw invalid("PDF 资源或版式读取失败：" + failures.getFirst()); }
        private Object value(JsonNode node) { return mapper.convertValue(node, Object.class); }
        @Override public void close() { try { browser.close(); } finally { try { playwright.close(); } finally { capacity.release(); } } }
    }

    private static Page.PdfOptions pdfOptions(double width, double height, String footer) {
        return new Page.PdfOptions().setWidth(width + "px").setHeight(height + "px").setPrintBackground(true)
                .setMargin(new Margin().setTop("0").setRight("0").setBottom("24px").setLeft("0"))
                .setDisplayHeaderFooter(true).setHeaderTemplate("<span></span>")
                .setFooterTemplate("<div style='width:100%;text-align:center;font-size:8px;color:#687280'>" + escape(footer) + " · <span class='pageNumber'></span>/<span class='totalPages'></span></div>");
    }
    public static void append(PDDocument target, byte[] pdf) throws IOException {
        try (PDDocument source = Loader.loadPDF(pdf)) { new PDFMergerUtility().appendDocument(target, source); }
    }
    public static byte[] bytes(PDDocument pdf) throws IOException { var out = new ByteArrayOutputStream(); pdf.save(out); return out.toByteArray(); }
    private static String escape(String value) { return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;"); }
}
