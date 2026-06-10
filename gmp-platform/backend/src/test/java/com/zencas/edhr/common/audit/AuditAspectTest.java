package com.zencas.edhr.common.audit;

import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.reflect.MethodSignature;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuditAspectTest {

    @Mock private AuditEventRepository auditEventRepository;
    @Mock private SnowflakeIdGenerator idGenerator;
    @Mock private ProceedingJoinPoint joinPoint;
    @Mock private Auditable auditable;
    @Mock private MethodSignature methodSignature;

    @Test
    void auditDoesNotStoreMethodArgumentsAsSyntheticChangeContent() throws Throwable {
        AuditAspect aspect = new AuditAspect(auditEventRepository, idGenerator);
        when(joinPoint.proceed()).thenReturn("result");
        when(joinPoint.getArgs()).thenReturn(new Object[]{"not-a-diff"});
        when(joinPoint.getSignature()).thenReturn(methodSignature);
        when(methodSignature.getParameterNames()).thenReturn(new String[]{"payload"});
        when(auditable.entityType()).thenReturn("TEST_ENTITY");
        when(auditable.entityIdExpr()).thenReturn("");
        when(auditable.action()).thenReturn("UPDATE");
        when(idGenerator.nextId()).thenReturn(1L);

        Object result = aspect.audit(joinPoint, auditable);

        ArgumentCaptor<AuditEvent> captor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(captor.capture());
        assertThat(result).isEqualTo("result");
        assertThat(captor.getValue().getContentBefore()).isNull();
        assertThat(captor.getValue().getContentAfter()).isNull();
    }
}
