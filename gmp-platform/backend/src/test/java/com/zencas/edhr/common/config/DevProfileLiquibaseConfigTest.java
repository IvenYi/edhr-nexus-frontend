package com.zencas.edhr.common.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.core.io.ClassPathResource;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class DevProfileLiquibaseConfigTest {

    @Test
    void devProfileKeepsLiquibaseEnabledForIncrementalSchemaChanges() throws Exception {
        var loader = new YamlPropertySourceLoader();
        var sources = loader.load("application-dev", new ClassPathResource("application-dev.yml"));
        var devProperties = sources.getFirst();

        assertThat(devProperties.getProperty("spring.liquibase.enabled")).isEqualTo(true);
    }

    @Test
    void systemIconSettingPermissionsUseGeneratedIdsInMigration() throws Exception {
        var resource = new ClassPathResource("db/changelog/0003-system-icon-settings.sql");
        var sql = resource.getContentAsString(StandardCharsets.UTF_8);

        assertThat(sql).contains("nextval('hibernate_sequence')");
        assertThat(sql).doesNotContain("(69, 'system.icons'");
        assertThat(sql).doesNotContain("(71, 'system.settings'");
    }
}
