package com.zencas.edhr.template.service;

import com.zencas.edhr.common.exception.BusinessException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class OnlyOfficeDocumentConverterTest {

    private HttpServer server;
    private HttpServer downloadServer;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @AfterEach
    void stopServer() {
        if (server != null) {
            server.stop(0);
        }
        if (downloadServer != null) {
            downloadServer.stop(0);
        }
    }

    @Test
    void convertToPdfRejectsCompletedConversionWhenResponseFileTypeIsNotPdf() throws Exception {
        server = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
        server.createContext("/converter", exchange -> {
            String fileUrl = "http://localhost:" + server.getAddress().getPort() + "/converted.docx";
            byte[] response = ("""
                    {"endConvert":true,"fileType":"docx","fileUrl":"%s"}
                    """.formatted(fileUrl)).getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        server.createContext("/converted.docx", exchange -> {
            byte[] response = "not a pdf".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        server.start();
        String documentServerUrl = "http://localhost:" + server.getAddress().getPort();
        OnlyOfficeDocumentConverter converter = new OnlyOfficeDocumentConverter();

        assertThatThrownBy(() -> converter.convertToPdf(new OnlyOfficeDocumentConverter.ConversionRequest(
                documentServerUrl,
                "docx",
                "template-version-102",
                "清场检查.docx",
                "http://localhost:8081/source.docx",
                "pdf",
                "test-secret")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("OnlyOffice 文档转换未返回 PDF");
    }

    @Test
    void convertToPdfSendsExcelConversionPayloadWithSpreadsheetLayoutAndJwtToken() throws Exception {
        AtomicReference<JsonNode> requestPayload = new AtomicReference<>();
        server = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
        server.createContext("/converter", exchange -> {
            requestPayload.set(objectMapper.readTree(exchange.getRequestBody()));
            String fileUrl = "http://localhost:" + server.getAddress().getPort() + "/converted.pdf";
            byte[] response = ("""
                    {"endConvert":true,"fileType":"pdf","fileUrl":"%s"}
                    """.formatted(fileUrl)).getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        server.createContext("/converted.pdf", exchange -> {
            byte[] response = "%PDF-1.4".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        server.start();
        String documentServerUrl = "http://localhost:" + server.getAddress().getPort();
        OnlyOfficeDocumentConverter converter = new OnlyOfficeDocumentConverter();

        byte[] convertedPdf = converter.convertToPdf(new OnlyOfficeDocumentConverter.ConversionRequest(
                documentServerUrl,
                "xlsx",
                "template-version-102",
                "检验记录.xlsx",
                "http://localhost:8081/source.xlsx",
                "pdf",
                "test-secret"));

        assertThat(new String(convertedPdf, StandardCharsets.UTF_8)).isEqualTo("%PDF-1.4");
        JsonNode payload = requestPayload.get();
        assertThat(payload.get("async").asBoolean()).isFalse();
        assertThat(payload.get("filetype").asText()).isEqualTo("xlsx");
        assertThat(payload.get("key").asText()).isEqualTo("template-version-102");
        assertThat(payload.get("outputtype").asText()).isEqualTo("pdf");
        assertThat(payload.get("title").asText()).isEqualTo("检验记录.xlsx");
        assertThat(payload.get("url").asText()).isEqualTo("http://localhost:8081/source.xlsx");
        assertThat(payload.has("spreadsheetLayout")).isTrue();
        assertThat(payload.hasNonNull("token")).isTrue();
    }

    @Test
    void convertToPdfRejectsConvertedFileUrlFromDifferentHost() throws Exception {
        server = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
        server.createContext("/converter", exchange -> {
            byte[] response = """
                    {"endConvert":true,"fileType":"pdf","fileUrl":"http://example.com/converted.pdf"}
                    """.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        server.start();
        String documentServerUrl = "http://localhost:" + server.getAddress().getPort();
        OnlyOfficeDocumentConverter converter = new OnlyOfficeDocumentConverter();

        assertThatThrownBy(() -> converter.convertToPdf(new OnlyOfficeDocumentConverter.ConversionRequest(
                documentServerUrl,
                "docx",
                "template-version-102",
                "清场检查.docx",
                "http://localhost:8081/source.docx",
                "pdf",
                "test-secret")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("OnlyOffice 转换文件地址不受信任");
    }

    @Test
    void convertToPdfRejectsConvertedFileUrlFromDifferentPort() throws Exception {
        downloadServer = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
        downloadServer.createContext("/converted.pdf", exchange -> {
            byte[] response = "%PDF-1.4".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        downloadServer.start();

        server = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
        server.createContext("/converter", exchange -> {
            String fileUrl = "http://localhost:" + downloadServer.getAddress().getPort() + "/converted.pdf";
            byte[] response = ("""
                    {"endConvert":true,"fileType":"pdf","fileUrl":"%s"}
                    """.formatted(fileUrl)).getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        server.start();
        String documentServerUrl = "http://localhost:" + server.getAddress().getPort();
        OnlyOfficeDocumentConverter converter = new OnlyOfficeDocumentConverter();

        assertThatThrownBy(() -> converter.convertToPdf(new OnlyOfficeDocumentConverter.ConversionRequest(
                documentServerUrl,
                "docx",
                "template-version-102",
                "清场检查.docx",
                "http://localhost:8081/source.docx",
                "pdf",
                "test-secret")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("OnlyOffice 转换文件地址不受信任");
    }

    @Test
    void convertToPdfThrowsIOExceptionWhenConverterRespondsNon2xx() throws Exception {
        server = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
        server.createContext("/converter", exchange -> {
            byte[] response = "converter failed".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(503, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        server.start();
        String documentServerUrl = "http://localhost:" + server.getAddress().getPort();
        OnlyOfficeDocumentConverter converter = new OnlyOfficeDocumentConverter();

        assertThatThrownBy(() -> converter.convertToPdf(new OnlyOfficeDocumentConverter.ConversionRequest(
                documentServerUrl,
                "docx",
                "template-version-102",
                "清场检查.docx",
                "http://localhost:8081/source.docx",
                "pdf",
                "test-secret")))
                .isInstanceOf(java.io.IOException.class)
                .hasMessageContaining("OnlyOffice 文档转换请求失败：503");
    }

    @Test
    void convertToPdfThrowsIOExceptionWhenConvertedPdfDownloadFails() throws Exception {
        server = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
        server.createContext("/converter", exchange -> {
            String fileUrl = "http://localhost:" + server.getAddress().getPort() + "/converted.pdf";
            byte[] response = ("""
                    {"endConvert":true,"fileType":"pdf","fileUrl":"%s"}
                    """.formatted(fileUrl)).getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        server.createContext("/converted.pdf", exchange -> {
            byte[] response = "not found".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(404, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        server.start();
        String documentServerUrl = "http://localhost:" + server.getAddress().getPort();
        OnlyOfficeDocumentConverter converter = new OnlyOfficeDocumentConverter();

        assertThatThrownBy(() -> converter.convertToPdf(new OnlyOfficeDocumentConverter.ConversionRequest(
                documentServerUrl,
                "xlsx",
                "template-version-102",
                "检验记录.xlsx",
                "http://localhost:8081/source.xlsx",
                "pdf",
                "test-secret")))
                .isInstanceOf(java.io.IOException.class)
                .hasMessageContaining("OnlyOffice 转换文件下载失败：404");
    }

    @Test
    void convertToPdfRejectsOnlyOfficeErrorResponse() throws Exception {
        server = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
        server.createContext("/converter", exchange -> {
            byte[] response = """
                    {"error":-4}
                    """.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        server.start();
        String documentServerUrl = "http://localhost:" + server.getAddress().getPort();
        OnlyOfficeDocumentConverter converter = new OnlyOfficeDocumentConverter();

        assertThatThrownBy(() -> converter.convertToPdf(new OnlyOfficeDocumentConverter.ConversionRequest(
                documentServerUrl,
                "docx",
                "template-version-102",
                "清场检查.docx",
                "http://localhost:8081/source.docx",
                "pdf",
                "test-secret")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("OnlyOffice 文档转换失败");
    }

    @Test
    void convertToPdfRejectsIncompleteConversionWithoutFileUrl() throws Exception {
        server = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
        server.createContext("/converter", exchange -> {
            byte[] response = """
                    {"endConvert":false}
                    """.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        server.start();
        String documentServerUrl = "http://localhost:" + server.getAddress().getPort();
        OnlyOfficeDocumentConverter converter = new OnlyOfficeDocumentConverter();

        assertThatThrownBy(() -> converter.convertToPdf(new OnlyOfficeDocumentConverter.ConversionRequest(
                documentServerUrl,
                "xlsx",
                "template-version-102",
                "检验记录.xlsx",
                "http://localhost:8081/source.xlsx",
                "pdf",
                "test-secret")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("OnlyOffice 文档转换未完成");
    }
}
