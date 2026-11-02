package com.zencas.edhr.workflow.controller;

import com.zencas.edhr.workflow.contract.RecordControlWorkflowPort;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import java.util.List;
import static com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.BusinessType.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/** Exercises the real method-security proxy, without database or business writes. */
@SpringJUnitConfig(RecordControlCandidateAuthorizationTest.Config.class)
class RecordControlCandidateAuthorizationTest {
    @Autowired RecordControlWorkflowController controller;
    @Autowired RecordControlWorkflowPort port;
    @BeforeEach void setup() { reset(port); }
    @AfterEach void clear() { SecurityContextHolder.clearContext(); }

    @Test void authenticatedUserWithoutAnyCreateAuthorityCanReadBothCandidateTypes() {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("ordinary-user",null,List.of()));
        when(port.listPublishedCandidates(CHANGE)).thenReturn(List.of());
        when(port.listPublishedCandidates(OBSOLETE)).thenReturn(List.of());
        assertThat(controller.listCandidates("CHANGE").getData()).isEmpty();
        assertThat(controller.listCandidates("OBSOLETE").getData()).isEmpty();
        verify(port).listPublishedCandidates(CHANGE); verify(port).listPublishedCandidates(OBSOLETE);
    }

    @Test void anonymousUserCannotReadCandidatesOrReachThePort() {
        SecurityContextHolder.getContext().setAuthentication(new AnonymousAuthenticationToken("test","anonymous",AuthorityUtils.createAuthorityList("ROLE_ANONYMOUS")));
        assertThatThrownBy(()->controller.listCandidates("CHANGE")).isInstanceOf(AuthorizationDeniedException.class);
        verifyNoInteractions(port);
    }

    @Test void authenticatedReaderCannotSelectAnUnsupportedBusinessType() {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("ordinary-user",null,List.of()));
        assertThatThrownBy(()->controller.listCandidates("DHR_SUMMARY")).hasMessageContaining("业务类型无效");
        verifyNoInteractions(port);
    }

    @Configuration @EnableMethodSecurity
    static class Config {
        @Bean RecordControlWorkflowPort port() { return mock(RecordControlWorkflowPort.class); }
        @Bean RecordControlWorkflowController controller(RecordControlWorkflowPort port) { return new RecordControlWorkflowController(port); }
    }
}
