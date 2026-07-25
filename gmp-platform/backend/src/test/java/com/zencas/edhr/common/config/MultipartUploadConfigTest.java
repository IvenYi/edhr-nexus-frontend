package com.zencas.edhr.common.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.config.YamlPropertiesFactoryBean;
import org.springframework.core.io.ClassPathResource;

import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;

class MultipartUploadConfigTest {

    @Test
    void multipartLimitAlignsWithFileUploadBusinessLimit() {
        YamlPropertiesFactoryBean factory = new YamlPropertiesFactoryBean();
        factory.setResources(new ClassPathResource("application.yml"));

        Properties properties = factory.getObject();

        assertThat(properties).isNotNull();
        assertThat(properties.getProperty("spring.servlet.multipart.max-file-size")).isEqualTo("50MB");
        assertThat(properties.getProperty("spring.servlet.multipart.max-request-size")).isEqualTo("150MB");
    }
}
