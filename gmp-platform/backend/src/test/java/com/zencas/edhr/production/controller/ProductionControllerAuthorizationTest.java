package com.zencas.edhr.production.controller;

import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThat;

class ProductionControllerAuthorizationTest {

    private static final String REQUIRED_AUTHORITY = "hasAuthority('production.work-orders')";

    @Test
    void everyWorkOrderApiMethodRequiresProductionPermission() {
        assertProductionApiMethodsAreProtected(WorkOrderController.class);
    }

    @Test
    void everyProductionObjectApiMethodRequiresProductionPermission() {
        assertProductionApiMethodsAreProtected(ProductionObjectController.class, "hasAuthority('production.work-orders')", "hasAnyAuthority('production.work-orders', 'production.batches')", "hasAuthority('production.batches')");
    }

    @Test
    void batchManagementApiRequiresBatchPermission() {
        Method[] apiMethods = java.util.Arrays.stream(ProductionBatchController.class.getDeclaredMethods())
                .filter(this::isApiMethod)
                .toArray(Method[]::new);

        assertThat(apiMethods).as("production batch API methods").isNotEmpty();
        for (Method method : apiMethods) {
            PreAuthorize authorization = method.getAnnotation(PreAuthorize.class);
            assertThat(authorization).as("authorization on ProductionBatchController.%s", method.getName()).isNotNull();
            assertThat(authorization.value()).isEqualTo("hasAuthority('production.batches')");
        }
    }

    @Test
    void dhrSummarySeparatesViewEditAndSubmitPermissions() throws Exception {
        PreAuthorize controllerAuthorization = DhrSummaryController.class.getAnnotation(PreAuthorize.class);
        assertThat(controllerAuthorization).isNotNull();
        assertThat(controllerAuthorization.value()).isEqualTo("hasAnyAuthority('dhr.instances.view','records.dhr-summary')");

        assertThat(DhrSummaryController.class.getDeclaredMethod("list", String.class, String.class, int.class, int.class).getAnnotation(PreAuthorize.class)).isNull();
        assertThat(DhrSummaryController.class.getDeclaredMethod("workspace", Long.class).getAnnotation(PreAuthorize.class)).isNull();
        assertThat(DhrSummaryController.class.getDeclaredMethod("version", Long.class, Long.class).getAnnotation(PreAuthorize.class)).isNull();
        assertThat(DhrSummaryController.class.getDeclaredMethod("saveDraft", Long.class, com.fasterxml.jackson.databind.JsonNode.class)
                .getAnnotation(PreAuthorize.class).value()).isEqualTo("hasAuthority('records.dhr-summary') and hasAuthority('dhr.summaries.edit')");
        assertThat(DhrSummaryController.class.getDeclaredMethod("submit", Long.class, com.fasterxml.jackson.databind.JsonNode.class)
                .getAnnotation(PreAuthorize.class).value()).isEqualTo("hasAuthority('records.dhr-summary') and hasAuthority('dhr.summaries.submit')");
    }

    @Test
    void dhrReviewAttachmentDownloadUsesReviewPermissionAndTaskScopedEndpoint() throws Exception {
        PreAuthorize controllerAuthorization = DhrReviewController.class.getAnnotation(PreAuthorize.class);
        assertThat(controllerAuthorization).isNotNull();
        assertThat(controllerAuthorization.value()).isEqualTo("hasAuthority('records.dhr-review')");
        GetMapping download = DhrReviewController.class.getDeclaredMethod("attachment", Long.class, Long.class)
                .getAnnotation(GetMapping.class);
        assertThat(download).isNotNull();
        assertThat(download.value()).containsExactly("/{id}/attachments/{attachmentId}/download");
    }

    private void assertProductionApiMethodsAreProtected(Class<?> controllerType, String... acceptedAuthorities) {
        if (acceptedAuthorities.length == 0) acceptedAuthorities = new String[]{REQUIRED_AUTHORITY};
        Method[] apiMethods = java.util.Arrays.stream(controllerType.getDeclaredMethods())
                .filter(this::isApiMethod)
                .toArray(Method[]::new);

        assertThat(apiMethods).as("production API methods in %s", controllerType.getSimpleName()).isNotEmpty();
        for (Method method : apiMethods) {
            PreAuthorize authorization = method.getAnnotation(PreAuthorize.class);
            assertThat(authorization)
                    .as("authorization on %s.%s", controllerType.getSimpleName(), method.getName())
                    .isNotNull();
            assertThat(java.util.Arrays.asList(acceptedAuthorities)).contains(authorization.value());
        }
    }

    private boolean isApiMethod(Method method) {
        return method.isAnnotationPresent(GetMapping.class)
                || method.isAnnotationPresent(PostMapping.class)
                || method.isAnnotationPresent(PutMapping.class)
                || method.isAnnotationPresent(PatchMapping.class)
                || method.isAnnotationPresent(DeleteMapping.class);
    }
}
