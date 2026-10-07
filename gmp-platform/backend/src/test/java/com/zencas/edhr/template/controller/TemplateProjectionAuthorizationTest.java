package com.zencas.edhr.template.controller;

import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.template.dto.TemplateModelingRequest;
import com.zencas.edhr.template.repository.DhrDirectoryRepository;
import com.zencas.edhr.template.repository.DhrTemplateItemRepository;
import com.zencas.edhr.template.repository.DhrTemplateRepository;
import com.zencas.edhr.template.repository.DhrTemplateVersionRepository;
import com.zencas.edhr.template.repository.FormTemplateRepository;
import com.zencas.edhr.template.repository.FormTemplateVersionRepository;
import com.zencas.edhr.template.repository.TemplateCategoryRepository;
import com.zencas.edhr.template.service.TemplateLegacyWordImportService;
import com.zencas.edhr.template.service.FormLookupCatalogService;
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
        @Bean FormTemplateRepository formTemplateRepository() { return mock(FormTemplateRepository.class); }
        @Bean TemplateModelingController controller(FormTemplateRepository forms) {
            return new TemplateModelingController(forms, mock(FormTemplateVersionRepository.class),
                    mock(DhrTemplateRepository.class), mock(DhrTemplateVersionRepository.class),
                    mock(DhrDirectoryRepository.class), mock(DhrTemplateItemRepository.class),
                    mock(TemplateCategoryRepository.class), mock(AuditEventRepository.class),
                    mock(SnowflakeIdGenerator.class), mock(TemplateLegacyWordImportService.class), mock(FormLookupCatalogService.class));
        }
    }

    @Autowired TemplateModelingController controller;
    @Autowired FormTemplateRepository forms;

    @Test @WithMockUser(authorities = "form-instances.view")
    void reportReaderCannotChangeFutureProjectionSource() {
        assertThatThrownBy(() -> controller.saveFormTemplateVersionDesign(1L, 2L,
                TemplateModelingRequest.builder().modelDesignJson("{\"projection\":{}}").build()))
                .isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(forms);
    }
}
