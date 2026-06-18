package com.zencas.edhr.identity.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.identity.dto.LoginLogItem;
import com.zencas.edhr.identity.entity.LoginLog;
import com.zencas.edhr.identity.repository.LoginLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LoginLogControllerTest {

    @Mock private LoginLogRepository loginLogRepository;

    @InjectMocks private LoginLogController controller;

    @Test
    void listMyLoginLogsOnlyReturnsCurrentUserLoginLogoutRows() {
        PageRequest pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "occurredAt"));
        LoginLog login = LoginLog.builder()
                .id(100L)
                .operatorId(1001L)
                .operatorName("张三")
                .username("zhangsan")
                .eventType("LOGIN")
                .authMethod("PASSWORD")
                .occurredAt(LocalDateTime.of(2026, 6, 17, 9, 0))
                .platform("PC")
                .clientType("WEB")
                .browser("Chrome")
                .ipAddress("127.0.0.1")
                .build();
        when(loginLogRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(login), pageable, 1));

        ApiResponse<PageResult<LoginLogItem>> response = controller.listMine(
                "1001",
                1,
                20,
                "occurredAt",
                "desc",
                "",
                null,
                null);

        verify(loginLogRepository).findAll(any(Specification.class), eq(pageable));
        assertThat(response.getData().getContent()).hasSize(1);
        LoginLogItem item = response.getData().getContent().getFirst();
        assertThat(item.getOperatorId()).isEqualTo(1001L);
        assertThat(item.getUsername()).isEqualTo("zhangsan");
        assertThat(item.getEventTypeLabel()).isEqualTo("登录");
    }
}
