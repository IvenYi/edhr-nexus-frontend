package com.zencas.edhr.template.controller;

import com.zencas.edhr.template.dto.TemplateModelingRequest;
import com.zencas.edhr.template.service.TemplateModelingService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = TemplateProjectionAuthorizationTest.Config.class)
class TemplateProjectionAuthorizationTest {
    @Configuration @EnableMethodSecurity
    static class Config {
        @Bean TemplateModelingService modelingService() { return mock(TemplateModelingService.class); }
        @Bean TemplateModelingController controller(TemplateModelingService templates) {
            return new TemplateModelingController(templates);
        }
    }

    @Autowired TemplateModelingController controller;
    @Autowired TemplateModelingService templates;

    @Test @WithMockUser(authorities = "form-instances.view")
    void reportReaderCannotChangeFutureProjectionSource() {
        assertThatThrownBy(() -> controller.saveFormTemplateVersionDesign(1L, 2L,
                TemplateModelingRequest.builder().modelDesignJson("{\"projection\":{}}").build()))
                .isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(templates);
    }
}
