package com.zencas.edhr.masterdata.controller;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.nio.charset.StandardCharsets;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

/** Same real-HTTP assertions on an explicitly selected owned local PostgreSQL database only. */
@EnabledIfEnvironmentVariable(named = "EDHR_DOCUMENT_DATABASE_URL", matches = "jdbc:postgresql://(?:localhost|127\\.0\\.0\\.1):[0-9]+/edhr_document_read_test")
class DocumentReadPerformancePostgresTest extends DocumentReadBoundaryIntegrationTest {
    @DynamicPropertySource
    static void postgres(DynamicPropertyRegistry properties) {
        properties.add("spring.datasource.url", () -> System.getenv("EDHR_DOCUMENT_DATABASE_URL"));
        properties.add("spring.datasource.username", () -> System.getenv("EDHR_DOCUMENT_DATABASE_USER"));
        properties.add("spring.datasource.password", () -> System.getenv("EDHR_DOCUMENT_DATABASE_PASSWORD"));
        properties.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        properties.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.PostgreSQLDialect");
        properties.add("spring.jpa.properties.hibernate.dialect", () -> "org.hibernate.dialect.PostgreSQLDialect");
    }

    static Stream<Arguments> caseVariants() {
        return Stream.of(new String[]{"ΟΣ", "ος"}, new String[]{"ος", "ΟΣ"}, new String[]{"Ångström", "ångström"},
                        new String[]{"МИР", "мир"}, new String[]{"İzmir", "i\u0307zmir"}, new String[]{"Straße", "STRAẞE"})
                .flatMap(pair -> Stream.of("title", "version-code").map(source -> Arguments.of(pair[0], pair[1], source)));
    }

    @ParameterizedTest @MethodSource("caseVariants")
    void nativeUnicodeCaseVariantsKeepMatching(String title, String keyword, String source) throws Exception {
        String id = create(source.equals("title") ? title + " work instruction" : "目标文档",
                source.equals("version-code") ? "CASE-" + title : "FIRST-CODE", null);
        create("unrelated document", "OTHER-CODE", null);
        var data = read("native-case-variant", "/api/v1/master-data/documents", java.util.Map.of("keyword", keyword), 200);
        assertThat(data.path("totalElements").asInt()).isEqualTo(1);
        assertThat(data.path("content").get(0).path("id").asText()).isEqualTo(id);
    }

    @Test
    void countAndPageUseTheSameSnapshotAcrossAConcurrentInsert() throws Exception {
        seed(2, 1, 1, "none");
        CountDownLatch pageStarted = new CountDownLatch(1), resumePage = new CountDownLatch(1);
        sqlObserver = sql -> {
            String normalized = sql.toLowerCase(java.util.Locale.ROOT);
            if (normalized.contains("from sop_document") && normalized.contains("order by")) {
                pageStarted.countDown();
                try { assertThat(resumePage.await(10, TimeUnit.SECONDS)).isTrue(); }
                catch (InterruptedException e) { Thread.currentThread().interrupt(); throw new IllegalStateException(e); }
            }
        };
        try (var executor = Executors.newSingleThreadExecutor()) {
            String bearer = "Bearer " + tokens.generateToken("document-auditor", "document-auditor", "文档审查", 5,
                    java.util.List.of("master-data.documents"));
            var request = executor.submit(() -> mvc.perform(get("/api/v1/master-data/documents")
                    .header("Authorization", bearer)).andReturn().getResponse());
            try {
                assertThat(pageStarted.await(10, TimeUnit.SECONDS)).isTrue();
                jdbc.update("INSERT INTO sop_document(id,tenant_id,title,document_type,status,created_at,updated_at) VALUES(2000,'default','并发新增','OTHER','DRAFT',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)");
                resumePage.countDown();
                var response = request.get(10, TimeUnit.SECONDS);
                assertThat(response.getStatus()).isEqualTo(200);
                var data = mapper.readTree(response.getContentAsString(StandardCharsets.UTF_8)).path("data");
                assertThat(data.path("totalElements").asInt()).isEqualTo(2);
                assertThat(data.path("content").size()).isEqualTo(2);
                data.path("content").forEach(doc -> assertThat(doc.path("id").asText()).isIn("1000", "1001"));
                assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM sop_document", Integer.class)).isEqualTo(3);
            } finally { resumePage.countDown(); }
        } finally { sqlObserver = null; }
    }
}
