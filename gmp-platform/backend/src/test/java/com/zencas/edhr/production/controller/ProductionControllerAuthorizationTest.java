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
