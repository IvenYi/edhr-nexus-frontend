package com.zencas.edhr.compliance.entity;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.BeanWrapperImpl;

import java.lang.management.ManagementFactory;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.*;

class AuditEventHashTest {
    static AuditEvent.AuditEventBuilder event(long id) {
        return AuditEvent.builder().id(id).tenantId("default").entityType("AUDIT_PROBE").entityId("42").action("UPDATE")
                .operatorId("7").operatorName("审查人员").operatorAccount("audit-probe").source("UI")
                .moduleName("审计").menuName("审计验证").functionName("修改").dataSummary("对象42")
                .reason("验证持久化").ipAddress("127.0.0.1").createdAt(LocalDateTime.parse("2026-11-06T12:00:00.123456"));
    }
    private String hash(String json) { var event = event(1).contentAfter(json).build(); event.sealSnapshotHash(); return event.getSnapshotHash(); }

    static Stream<Arguments> equivalentJson() {
        return Stream.of(
                Arguments.of("{\"z\":1.00,\"a\":2}", "{ \"a\": 2.0, \"z\":1e0}"),
                Arguments.of("-0.000", "0"), Arguments.of("1e10000", "1" + "0".repeat(10000)),
                Arguments.of("900719925474099312345.00", "900719925474099312345"),
                Arguments.of("[true,null,1.0,{\"b\":2,\"a\":1}]", "[true,null,1,{\"a\":1.00,\"b\":2}]"),
                Arguments.of("{\"a\":0,\"a\":2}", "{\"a\":2}"),
                Arguments.of("{\"a\":\"\\u4e2d\\u6587\\ud83d\\ude00\"}", "{\"a\":\"中文😀\"}"),
                Arguments.of("null", " null "), Arguments.of("true", " true "),
                Arguments.of("\"text\"", "\"te\\u0078t\""));
    }
    @ParameterizedTest @MethodSource("equivalentJson")
    void jsonbEquivalentValuesHaveSameHash(String first, String second) { assertThat(hash(first)).isEqualTo(hash(second)); }

    @ParameterizedTest @ValueSource(strings = {"id", "tenantId", "entityType", "entityId", "action", "contentBefore", "contentAfter", "operatorId", "operatorName", "operatorAccount", "source", "moduleName", "menuName", "functionName", "dataSummary", "reason", "ipAddress", "createdAt"})
    void allEighteenPersistedFieldsAreCovered(String field) {
        var event = event(1).build(); event.sealSnapshotHash(); String original = event.getSnapshotHash();
        Object value = field.equals("id") ? 2L : field.equals("createdAt") ? event.getCreatedAt().plusNanos(1000)
                : field.startsWith("content") ? "{\"changed\":true}" : "changed";
        new BeanWrapperImpl(event).setPropertyValue(field, value);
        assertThat(event.computeSnapshotHash()).isNotEqualTo(original);
    }

    @Test void nullEmptyJsonNullTextTypesAndArrayOrderRemainDistinct() {
        assertThat(Stream.of((String) null, "null", "\"null\"", "0", "\"0\"", "false", "[]", "{}", "[1,2]", "[2,1]").map(this::hash).distinct().count()).isEqualTo(10);
        var a = event(1).operatorName(null).build(); var b = event(1).operatorName("").build(); a.sealSnapshotHash(); b.sealSnapshotHash();
        assertThat(a.getSnapshotHash()).isNotEqualTo(b.getSnapshotHash());
    }
    @Test void existingProvidedHashAndNanosecondsAreNotResealedOrMarked() {
        var time = LocalDateTime.parse("2026-11-06T12:00:00.123456789");
        var event = event(1).snapshotHash("a".repeat(64)).createdAt(time).build(); event.sealSnapshotHash();
        assertThat(event.getSnapshotHash()).isEqualTo("a".repeat(64)); assertThat(event.getSnapshotHashVersion()).isNull(); assertThat(event.getCreatedAt()).isEqualTo(time);
    }
    @Test void automaticSealSetsVersionAndPersistablePrecisionOnlyOnce() {
        var event = event(1).snapshotHash(" ").createdAt(LocalDateTime.parse("2026-11-06T23:59:59.999999999")).build(); event.sealSnapshotHash(); String hash = event.getSnapshotHash(); event.sealSnapshotHash();
        assertThat(event.getSnapshotHashVersion()).isEqualTo("audit-event-v2"); assertThat(event.getCreatedAt()).isEqualTo(LocalDateTime.parse("2026-11-06T23:59:59.999999"));
        assertThat(event.getSnapshotHash()).isEqualTo(hash).isEqualTo(event.computeSnapshotHash());
    }
    @Test void unknownVersionNeverFallsBackToAnotherAlgorithm() {
        var event = event(1).snapshotHashVersion("future-v999").snapshotHash("a".repeat(64)).build();
        assertThatThrownBy(event::computeSnapshotHash).isInstanceOf(IllegalStateException.class).hasMessageContaining("Unsupported audit hash version");
        assertThat(event.getSnapshotHash()).isEqualTo("a".repeat(64));
    }
    @Test void legacyFixedVectorIsRetainedAsDiagnosisWithoutCertifyingHistory() {
        var event = event(1).contentAfter("{ \"z\" : 1.00, \"a\" : \"原始变更\" }").build();
        assertThat(event.computeSnapshotHash()).isEqualTo("364650cdc51d732036581f66abe9d8c81e814f51acaec20716de6612185d9b7c");
        assertThat(event.getSnapshotHashVersion()).isNull();
    }
    @Test void v2FixedVectorUsesDocumentedUtf8Encoding() {
        assertThat(hash("{ \"z\" : 1.00, \"a\" : \"原始变更\" }"))
                .isEqualTo("ebfb3e7a6cda30e0d9c91cd58b7939c4e5cb2cefeba9597343dd1023b10a1e81");
    }

    @ParameterizedTest @ValueSource(strings = {"number", "name", "string", "depth"})
    void localCodecDoesNotAddJacksonDefaultLimitsToExistingJsonbInputs(String axis) {
        String json = switch (axis) {
            case "number" -> "1" + "0".repeat(1310);
            case "name" -> "{\"" + "k".repeat(50001) + "\":true}";
            case "string" -> "\"" + "x".repeat(20000001) + "\"";
            case "depth" -> "[".repeat(2500) + "0" + "]".repeat(2500);
            default -> throw new IllegalArgumentException(axis);
        };
        assertThat(hash(json)).isEqualTo(hash(" \n" + json + " ")).hasSize(64);
    }

    @ParameterizedTest @ValueSource(ints = {1, 10})
    void observeLargeJsonCostWithoutClaimingPeakOrProductionSla(int mib) throws Exception {
        String json = "{\"text\":\"" + "x".repeat(mib * 1024 * 1024) + "\"}";
        hash("{}"); var bean = (com.sun.management.ThreadMXBean) ManagementFactory.getThreadMXBean(); bean.setThreadAllocatedMemoryEnabled(true);
        var legacy = event(1).contentAfter(json).build();
        long legacyBefore = bean.getThreadAllocatedBytes(Thread.currentThread().threadId()), legacyStart = System.nanoTime();
        assertThat(legacy.computeSnapshotHash()).hasSize(64);
        long legacyElapsed = System.nanoTime() - legacyStart, legacyAllocated = bean.getThreadAllocatedBytes(Thread.currentThread().threadId()) - legacyBefore;
        long thread = Thread.currentThread().threadId(), before = bean.getThreadAllocatedBytes(thread), start = System.nanoTime();
        String digest = hash(json); long elapsed = System.nanoTime() - start, allocated = bean.getThreadAllocatedBytes(thread) - before;
        assertThat(digest).isEqualTo(hash(json));
        if (System.getProperty("edhr.audit.hashOutput") != null) {
            Path out = Path.of(System.getProperty("edhr.audit.hashOutput")); Files.createDirectories(out);
            new ObjectMapper().writerWithDefaultPrettyPrinter().writeValue(out.resolve("allocation_" + mib + "mib.json").toFile(),
                    Map.of("jsonCharacters", json.length(), "threadAllocatedBytes", allocated, "elapsedNanos", elapsed, "legacyThreadAllocatedBytes", legacyAllocated, "legacyElapsedNanos", legacyElapsed, "measurement", "calling-thread cumulative heap, not retained/peak/native/RSS/concurrency"));
        }
    }
}
