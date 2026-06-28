package com.zencas.edhr.template.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class OnlyOfficeDocumentConverter {

    private static final int CONVERSION_CONNECT_TIMEOUT_MILLIS = 5_000;
    private static final int CONVERSION_READ_TIMEOUT_MILLIS = 30_000;
    private static final long CONVERSION_MAX_FILE_SIZE = 50L * 1024 * 1024;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public byte[] convertToPdf(ConversionRequest request) throws IOException {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("async", false);
        payload.put("filetype", request.fileType());
        payload.put("key", request.key());
        payload.put("outputtype", request.outputType());
        payload.put("title", request.title());
        payload.put("url", request.url());
        if ("xls".equalsIgnoreCase(request.fileType()) || "xlsx".equalsIgnoreCase(request.fileType())) {
            payload.put("spreadsheetLayout", Map.of());
        }
        if (StringUtils.hasText(request.jwtSecret())) {
            payload.put("token", conversionToken(payload, request.jwtSecret()));
        }

        URI converterUri = converterUri(request.documentServerUrl(), request.key());
        HttpURLConnection connection = (HttpURLConnection) converterUri.toURL().openConnection();
        connection.setConnectTimeout(CONVERSION_CONNECT_TIMEOUT_MILLIS);
        connection.setReadTimeout(CONVERSION_READ_TIMEOUT_MILLIS);
        connection.setRequestMethod("POST");
        connection.setDoOutput(true);
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestProperty("Accept", "application/json");
        try (OutputStream output = connection.getOutputStream()) {
            objectMapper.writeValue(output, payload);
        }

        int status = connection.getResponseCode();
        byte[] responseBytes;
        try (InputStream input = status >= 200 && status < 300 ? connection.getInputStream() : connection.getErrorStream()) {
            responseBytes = input == null ? new byte[0] : input.readAllBytes();
        } finally {
            connection.disconnect();
        }
        if (status < 200 || status >= 300) {
            throw new IOException("OnlyOffice 文档转换请求失败：" + status);
        }
        JsonNode response = objectMapper.readTree(responseBytes);
        if (response.has("error")) {
            throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 文档转换失败：" + response.get("error").asText());
        }
        if (!response.path("endConvert").asBoolean(false) || !StringUtils.hasText(response.path("fileUrl").asText(null))) {
            throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 文档转换未完成");
        }
        String responseFileType = response.path("fileType").asText(null);
        if (StringUtils.hasText(responseFileType) && !"pdf".equalsIgnoreCase(responseFileType)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 文档转换未返回 PDF");
        }
        return downloadConvertedPdf(response.path("fileUrl").asText(), request.documentServerUrl());
    }

    private URI converterUri(String documentServerUrl, String key) {
        String baseUrl = documentServerUrl.endsWith("/") ? documentServerUrl.substring(0, documentServerUrl.length() - 1) : documentServerUrl;
        return URI.create(baseUrl + "/converter?shardkey=" + key);
    }

    private String conversionToken(Map<String, Object> payload, String jwtSecret) {
        return JWT.create()
                .withPayload(payload)
                .sign(Algorithm.HMAC256(jwtSecret));
    }

    private byte[] downloadConvertedPdf(String fileUrl, String documentServerUrl) throws IOException {
        URI fileUri = URI.create(fileUrl);
        URI documentServerUri = URI.create(documentServerUrl);
        if (!hasSameOrigin(fileUri, documentServerUri)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 转换文件地址不受信任");
        }
        HttpURLConnection connection = (HttpURLConnection) fileUri.toURL().openConnection();
        connection.setConnectTimeout(CONVERSION_CONNECT_TIMEOUT_MILLIS);
        connection.setReadTimeout(CONVERSION_READ_TIMEOUT_MILLIS);
        int status = connection.getResponseCode();
        if (status < 200 || status >= 300) {
            connection.disconnect();
            throw new IOException("OnlyOffice 转换文件下载失败：" + status);
        }
        try (InputStream input = connection.getInputStream(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[8192];
            long totalBytes = 0;
            int bytesRead;
            while ((bytesRead = input.read(buffer)) != -1) {
                totalBytes += bytesRead;
                if (totalBytes > CONVERSION_MAX_FILE_SIZE) {
                    throw new BusinessException(ErrorCode.GENERAL_001, "OnlyOffice 转换文件大小超过限制");
                }
                output.write(buffer, 0, bytesRead);
            }
            return output.toByteArray();
        } finally {
            connection.disconnect();
        }
    }

    private boolean hasSameOrigin(URI fileUri, URI documentServerUri) {
        return StringUtils.hasText(fileUri.getScheme())
                && StringUtils.hasText(fileUri.getHost())
                && fileUri.getScheme().equalsIgnoreCase(documentServerUri.getScheme())
                && fileUri.getHost().equalsIgnoreCase(documentServerUri.getHost())
                && effectivePort(fileUri) == effectivePort(documentServerUri);
    }

    private int effectivePort(URI uri) {
        if (uri.getPort() >= 0) return uri.getPort();
        if ("http".equalsIgnoreCase(uri.getScheme())) return 80;
        if ("https".equalsIgnoreCase(uri.getScheme())) return 443;
        return -1;
    }

    public record ConversionRequest(
            String documentServerUrl,
            String fileType,
            String key,
            String title,
            String url,
            String outputType,
            String jwtSecret) {
    }
}
