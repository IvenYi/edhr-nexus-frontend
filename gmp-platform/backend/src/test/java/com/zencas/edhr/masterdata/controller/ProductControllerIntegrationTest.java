package com.zencas.edhr.masterdata.controller;

import com.zencas.edhr.common.config.SecurityConfig;
import com.zencas.edhr.common.exception.GlobalExceptionHandler;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.identity.security.JwtAuthenticationFilter;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import com.zencas.edhr.masterdata.entity.ProductFamily;
import com.zencas.edhr.masterdata.repository.ProductFamilyRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.support.JpaRepositoryFactory;
import org.springframework.orm.jpa.SharedEntityManagerCreator;
import org.springframework.orm.jpa.persistenceunit.PersistenceManagedTypes;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = ProductControllerIntegrationTest.TestConfig.class, properties = {
        "spring.liquibase.enabled=false",
        "spring.datasource.url=jdbc:h2:mem:product-family-security;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
class ProductControllerIntegrationTest {
    private static final String URL = "/api/v1/master-data/product-families";

    @Autowired MockMvc mvc;
    @Autowired JwtTokenProvider tokens;

    @Test
    void rejectsAuthenticatedUsersWithoutProductFamilyPermissionAcrossLegacyEndpoints() throws Exception {
        String wrongPermission = auth("master-data.operations");

        mvc.perform(get(URL).header("Authorization", wrongPermission)).andExpect(status().isForbidden());
        mvc.perform(get(URL + "/1").header("Authorization", wrongPermission)).andExpect(status().isForbidden());
        mvc.perform(post(URL).header("Authorization", wrongPermission)
                        .contentType("application/json").content("{}"))
                .andExpect(status().isForbidden());
        mvc.perform(put(URL + "/1").header("Authorization", wrongPermission)
                        .contentType("application/json").content("{}"))
                .andExpect(status().isForbidden());
        mvc.perform(delete(URL + "/1").header("Authorization", wrongPermission)).andExpect(status().isForbidden());
    }

    @Test
    void allowsAuthenticatedUsersWithProductFamilyPermissionAcrossLegacyEndpoints() throws Exception {
        String authorization = auth("master-data.product-families");

        mvc.perform(get(URL).header("Authorization", authorization)).andExpect(status().isOk());
        mvc.perform(post(URL).header("Authorization", authorization)
                        .contentType("application/json")
                        .content("{\"id\":9001,\"code\":\"PF-SECURITY-001\",\"name\":\"产品簇\",\"description\":\"描述\"}"))
                .andExpect(status().isOk());
        mvc.perform(get(URL + "/9001").header("Authorization", authorization))
                .andExpect(status().isOk());
        mvc.perform(put(URL + "/9001").header("Authorization", authorization)
                        .contentType("application/json")
                        .content("{\"code\":\"PF-SECURITY-001\",\"name\":\"产品簇-已编辑\",\"description\":\"新描述\"}"))
                .andExpect(status().isOk());
        mvc.perform(delete(URL + "/9001").header("Authorization", authorization))
                .andExpect(status().isOk());
    }

    private String auth(String... permissions) {
        return "Bearer " + tokens.generateToken("product-family-test", "product-family-test", "产品簇验收员", 5, List.of(permissions));
    }

    @Configuration(proxyBeanMethods = false)
    @EnableAutoConfiguration(exclude = JpaRepositoriesAutoConfiguration.class)
    @Import({ProductController.class, GlobalExceptionHandler.class, SecurityConfig.class, JwtAuthenticationFilter.class})
    static class TestConfig {
        @Bean EntityManager entityManager(EntityManagerFactory factory) {
            return SharedEntityManagerCreator.createSharedEntityManager(factory);
        }

        @Bean PersistenceManagedTypes managedTypes() {
            return PersistenceManagedTypes.of(ProductFamily.class.getName(), AuditEvent.class.getName());
        }

        @Bean ProductFamilyRepository productFamilies(EntityManager entityManager) {
            return new JpaRepositoryFactory(entityManager).getRepository(ProductFamilyRepository.class);
        }

        @Bean AuditEventRepository audits(EntityManager entityManager) {
            return new JpaRepositoryFactory(entityManager).getRepository(AuditEventRepository.class);
        }

        @Bean SnowflakeIdGenerator ids() {
            return new SnowflakeIdGenerator(1);
        }

        @Bean JwtTokenProvider tokens() {
            return new JwtTokenProvider("product-family-security-test-key-at-least-32-characters", 300000);
        }
    }
}
