package com.zencas.edhr.compliance.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuditControllerTest {

    @Mock private AuditEventRepository auditEventRepository;

    @InjectMocks private AuditController controller;

    @Test
    void listPassesAuditFiltersToRepositorySearch() {
        PageRequest pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"));
        AuditEvent event = AuditEvent.builder()
                .id(1L)
                .entityType("USER_ACCOUNT")
                .entityId("339707003864260608")
                .action("UPDATE")
                .operatorName("系统管理员")
                .build();
        when(auditEventRepository.search(
                "USER_ACCOUNT",
                "339707003864260608",
                "UPDATE",
                "系统管理员",
                pageable))
                .thenReturn(new PageImpl<>(List.of(event), pageable, 1));

        ApiResponse<PageResult<AuditEvent>> response = controller.list(
                1,
                20,
                "createdAt",
                "desc",
                "USER_ACCOUNT",
                "339707003864260608",
                "UPDATE",
                "系统管理员");

        verify(auditEventRepository).search(
                "USER_ACCOUNT",
                "339707003864260608",
                "UPDATE",
                "系统管理员",
                pageable);
        assertThat(response.getData().getContent()).containsExactly(event);
        assertThat(response.getData().getTotalElements()).isEqualTo(1);
    }

    @Test
    void listNormalizesBlankAuditFiltersToEmptyStrings() {
        PageRequest pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"));
        when(auditEventRepository.search("", "", "", "", pageable))
                .thenReturn(new PageImpl<>(List.of(), pageable, 0));

        ApiResponse<PageResult<AuditEvent>> response = controller.list(
                1,
                20,
                "createdAt",
                "desc",
                "",
                null,
                " ",
                null);

        verify(auditEventRepository).search("", "", "", "", pageable);
        assertThat(response.getData().getContent()).isEmpty();
        assertThat(response.getData().getTotalElements()).isZero();
    }
}
