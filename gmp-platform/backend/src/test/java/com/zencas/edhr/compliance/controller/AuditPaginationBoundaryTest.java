package com.zencas.edhr.compliance.controller;

import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.compliance.dto.AuditLogItem;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.stream.LongStream;
import java.util.stream.Stream;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AuditPaginationBoundaryTest {
    private final AuditEventRepository audits = mock(AuditEventRepository.class);
    private final UserAccountRepository users = mock(UserAccountRepository.class);
    private final AuditController controller = new AuditController(audits, users);
    @BeforeEach void setup() {
        var events = LongStream.rangeClosed(1, 6).mapToObj(id -> AuditEvent.builder().id(id).entityType("AUDIT_LOG").entityId("42").action("UPDATE").build()).toList();
        when(audits.search(anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), any(Pageable.class))).thenReturn(new PageImpl<>(events));
    }
    static Stream<Arguments> pages() {
        return Stream.of(Arguments.of(1, 2, List.of(1L, 2L)), Arguments.of(2, 2, List.of(3L, 4L)), Arguments.of(4, 2, List.of()),
                Arguments.of(Integer.MAX_VALUE, 20, List.of()), Arguments.of(2, Integer.MAX_VALUE, List.of()), Arguments.of(3, 1 << 30, List.of()));
    }
    @ParameterizedTest @MethodSource("pages")
    void positivePaginationArgumentsNeverWrapAndKeepTotalAndNormalResults(int page, int size, List<Long> expected) {
        var captured = new AtomicReference<PageResult<AuditLogItem>>();
        assertThatCode(() -> captured.set(controller.list(page, size, "createdAt", "desc", null, null, null, null, null, null, null, null).getData())).doesNotThrowAnyException();
        var result = captured.get();
        assertThat(result.getContent()).extracting(item -> item.getId()).containsExactlyElementsOf(expected);
        assertThat(result.getTotalElements()).isEqualTo(6); assertThat(result.getPage()).isEqualTo(page); assertThat(result.getSize()).isEqualTo(size);
        verify(audits).search(anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), any(Pageable.class));
        verifyNoMoreInteractions(audits);
    }
}
