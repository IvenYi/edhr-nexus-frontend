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
    @Autowired DhrAttachmentService attachments;
    @Autowired DhrInstanceService instances;
    final ObjectMapper mapper = new ObjectMapper();
    @BeforeEach void resetMocks() { reset(reviews, fills, summaries, attachments, instances); }
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
    @Test void reviewAttachmentDownloadRequiresReviewMenuPermission() {
        auth("dhr.reviews.act");
        assertThatThrownBy(() -> review.attachment(1L, 2L)).isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(reviews, attachments);
        auth("records.dhr-review");
        when(reviews.detail(1L)).thenThrow(new AccessDeniedException("not assigned"));
        assertThatThrownBy(() -> review.attachment(1L, 2L)).isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(attachments);
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
    @Test void reviewOfficeDownloadKeepsOriginalNameAndTaskFrozenVersion() {
        auth("records.dhr-review");
        var detail = mapper.createObjectNode();
        detail.putObject("dhr").put("id", "11");
        detail.putObject("version").put("id", "22");
        when(reviews.detail(7L)).thenReturn(detail);
        when(attachments.downloadableFile(11L, 3L, 22L)).thenReturn(java.nio.file.Path.of("test.doc"));
        when(attachments.originalName(11L, 3L)).thenReturn("委外 检验报告.doc");
        var response = review.attachment(7L, 3L);
        assertThat(response.getHeaders().getContentDisposition().getFilename()).isEqualTo("委外 检验报告.doc");
        assertThat(response.getHeaders().getContentDisposition().getType()).isEqualTo("attachment");
        assertThat(response.getHeaders().getFirst("X-Content-Type-Options")).isEqualTo("nosniff");
        verify(attachments).downloadableFile(11L, 3L, 22L);
    }
    @Test void reorganizingDoesNotInheritOrdinaryEditOrSubmitPermission() {
        auth("records.dhr-summary", "dhr.summaries.edit", "dhr.summaries.submit");
        assertThatThrownBy(() -> summary.reorganize(1L, mapper.createObjectNode())).isInstanceOf(AccessDeniedException.class);
        auth("records.dhr-summary", "dhr.summaries.reorganize");
        summary.reorganize(1L, mapper.createObjectNode());
        verify(summaries).reorganize(1L, mapper.createObjectNode());
    }
    @Test void fillingDetailAndAuditUseMenuReadPermissionWithoutGlobalViewOrWrite() {
        auth("dhr.filling.act");
        assertThatThrownBy(() -> filling.detail(1L)).isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> filling.audit(1L, 0)).isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(instances, summaries);
        auth("records.dhr-filling");
        filling.detail(1L);
        filling.audit(1L, 2);
        verify(instances).detail(1L);
        verify(summaries).audit(1L, 2);
        assertThatThrownBy(() -> filling.act(1L, null)).isInstanceOf(AccessDeniedException.class);
    }
    @Test void summaryDetailAndAuditKeepExistingReadBoundary() {
        auth("dhr.summaries.edit");
        assertThatThrownBy(() -> summary.detail(1L)).isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> summary.audit(1L, 0)).isInstanceOf(AccessDeniedException.class);
        auth("records.dhr-summary");
        summary.detail(1L); summary.audit(1L, 0);
        auth("dhr.instances.view");
        summary.detail(1L); summary.audit(1L, 0);
        verify(instances, times(2)).detail(1L);
        verify(summaries, times(2)).audit(1L, 0);
    }
    @Test void reviewAuditChecksTaskThenUsesOnlyServerResolvedVersion() {
        auth("dhr.instances.view");
        assertThatThrownBy(() -> review.audit(7L, 0)).isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(reviews, summaries);
        auth("records.dhr-review");
        when(reviews.detail(7L)).thenThrow(new AccessDeniedException("not assigned"));
        assertThatThrownBy(() -> review.audit(7L, 0)).isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(summaries);
        var detail = mapper.createObjectNode();
        detail.putObject("dhr").put("id", "11");
        detail.putObject("version").put("id", "22");
        doReturn(detail).when(reviews).detail(7L);
        review.audit(7L, 1);
        verify(summaries).versionAudit(11L, 22L, 1);
        verify(summaries, never()).audit(anyLong(), anyInt());
    }
    @Configuration @EnableMethodSecurity static class Config {
        @Bean DhrReviewService reviews() { return mock(DhrReviewService.class); }
        @Bean DhrFillingService fills() { return mock(DhrFillingService.class); }
        @Bean DhrSummaryService summaries() { return mock(DhrSummaryService.class); }
        @Bean DhrAttachmentService attachments() { return mock(DhrAttachmentService.class); }
        @Bean DhrInstanceService instances() { return mock(DhrInstanceService.class); }
        @Bean ProductionExecutionService executions() { return mock(ProductionExecutionService.class); }
        @Bean DhrReviewController review(DhrReviewService service, DhrAttachmentService attachments, DhrSummaryService summaries) { return new DhrReviewController(service, attachments, summaries); }
        @Bean DhrFillingController filling(DhrFillingService service, DhrInstanceService instances, ProductionExecutionService executions, DhrSummaryService summaries) { return new DhrFillingController(service, instances, executions, summaries); }
        @Bean DhrSummaryController summary(DhrSummaryService service, DhrInstanceService instances) { return new DhrSummaryController(service, instances); }
    }
}
