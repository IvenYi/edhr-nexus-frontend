package com.zencas.edhr.template.controller;

import com.zencas.edhr.template.service.FormLookupCatalogService;
import org.junit.jupiter.api.BeforeEach;
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
import java.util.List;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = FormLookupCatalogAuthorizationTest.Config.class)
class FormLookupCatalogAuthorizationTest {
    @Configuration @EnableMethodSecurity
    static class Config {
        @Bean FormLookupCatalogService catalog() { return mock(FormLookupCatalogService.class); }
        @Bean FormLookupCatalogController controller(FormLookupCatalogService service) { return new FormLookupCatalogController(service); }
    }
    @Autowired FormLookupCatalogController controller;
    @Autowired FormLookupCatalogService catalog;
    @BeforeEach void resetMocks() { reset(catalog); }
    private final FormLookupCatalogService.WriteRequest request = new FormLookupCatalogService.WriteRequest("灭菌锅次", "", 1L);

    @Test @WithMockUser(authorities = "master-data.form-templates")
    void designerReadsCandidatesButCannotMaintainDirectory() {
        when(catalog.list()).thenReturn(List.of());
        assertThat(controller.list().getData()).isEmpty();
        assertThatThrownBy(() -> controller.create(request)).isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> controller.update("lookup_test", request)).isInstanceOf(AccessDeniedException.class);
        verify(catalog).list(); verifyNoMoreInteractions(catalog);
    }
    @Test @WithMockUser(authorities = {"form-instances.view", "production.execution"})
    void authorizedQueryUserReadsCandidatesWithoutTemplateManagement() {
        when(catalog.list()).thenReturn(List.of());
        assertThat(controller.list().getData()).isEmpty();
        assertThatThrownBy(() -> controller.create(request)).isInstanceOf(AccessDeniedException.class);
        verify(catalog).list(); verifyNoMoreInteractions(catalog);
    }
    @Test @WithMockUser(authorities = "form-instances.view")
    void partialSourcePermissionDoesNotExposeDirectory() {
        assertThatThrownBy(() -> controller.list()).isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(catalog);
    }
    @Test @WithMockUser(authorities = "system.edit")
    void administratorCanMaintainDefinitionsWithoutSourceAccess() {
        controller.create(request); controller.update("lookup_test", request);
        verify(catalog).create(request); verify(catalog).update("lookup_test", request);
    }
}
