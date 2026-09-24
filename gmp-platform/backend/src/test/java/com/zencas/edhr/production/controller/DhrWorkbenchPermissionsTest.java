package com.zencas.edhr.production.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.production.service.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import java.util.Arrays;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/** Execute the actual Spring method-security proxy, not annotation string assertions. */
@SpringJUnitConfig(DhrWorkbenchPermissionsTest.Config.class)
class DhrWorkbenchPermissionsTest {
    @Autowired DhrReviewController review;
    @Autowired DhrFillingController filling;
    @Autowired DhrSummaryController summary;
    @Autowired DhrReviewService reviews;
    @Autowired DhrFillingService fills;
    @Autowired DhrSummaryService summaries;
    final ObjectMapper mapper = new ObjectMapper();
    @BeforeEach void resetMocks() { reset(reviews, fills, summaries); }
    @AfterEach void clear() { SecurityContextHolder.clearContext(); }
    void auth(String... grants) { SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("7", "", Arrays.stream(grants).map(SimpleGrantedAuthority::new).toList())); }
    @Test void reviewRequiresBothMenuAndActionPermission() {
        auth("records.dhr-review");
        review.detail(1L);
        assertThatThrownBy(() -> review.act(1L, mapper.createObjectNode())).isInstanceOf(AccessDeniedException.class);
        auth("dhr.reviews.act");
        assertThatThrownBy(() -> review.detail(1L)).isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> review.act(1L, mapper.createObjectNode())).isInstanceOf(AccessDeniedException.class);
        auth("records.dhr-review", "dhr.reviews.act");
        review.act(1L, mapper.createObjectNode());
        verify(reviews).act(1L, mapper.createObjectNode());
    }
    @Test void fillingAndSupplementPermissionsAreIndependent() {
        auth("records.dhr-filling", "dhr.filling.act");
        filling.act(1L, null);
        assertThatThrownBy(() -> filling.supplement(1L, mapper.createObjectNode())).isInstanceOf(AccessDeniedException.class);
        auth("dhr.filling.supplement");
        assertThatThrownBy(() -> filling.supplement(1L, mapper.createObjectNode())).isInstanceOf(AccessDeniedException.class);
        auth("records.dhr-filling", "dhr.filling.supplement");
        filling.supplement(1L, mapper.createObjectNode());
        assertThatThrownBy(() -> filling.act(1L, null)).isInstanceOf(AccessDeniedException.class);
        verify(fills).supplement(1L, mapper.createObjectNode());
    }
    @Test void reorganizingDoesNotInheritOrdinaryEditOrSubmitPermission() {
        auth("records.dhr-summary", "dhr.summaries.edit", "dhr.summaries.submit");
        assertThatThrownBy(() -> summary.reorganize(1L, mapper.createObjectNode())).isInstanceOf(AccessDeniedException.class);
        auth("records.dhr-summary", "dhr.summaries.reorganize");
        summary.reorganize(1L, mapper.createObjectNode());
        verify(summaries).reorganize(1L, mapper.createObjectNode());
    }
    @Configuration @EnableMethodSecurity static class Config {
        @Bean DhrReviewService reviews() { return mock(DhrReviewService.class); }
        @Bean DhrFillingService fills() { return mock(DhrFillingService.class); }
        @Bean DhrSummaryService summaries() { return mock(DhrSummaryService.class); }
        @Bean DhrInstanceService instances() { return mock(DhrInstanceService.class); }
        @Bean ProductionExecutionService executions() { return mock(ProductionExecutionService.class); }
        @Bean DhrReviewController review(DhrReviewService service) { return new DhrReviewController(service); }
        @Bean DhrFillingController filling(DhrFillingService service, DhrInstanceService instances, ProductionExecutionService executions) { return new DhrFillingController(service, instances, executions); }
        @Bean DhrSummaryController summary(DhrSummaryService service, DhrInstanceService instances) { return new DhrSummaryController(service, instances); }
    }
}
