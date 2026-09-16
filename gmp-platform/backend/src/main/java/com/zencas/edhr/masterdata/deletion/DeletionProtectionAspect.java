package com.zencas.edhr.masterdata.deletion;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Aspect
@Component
@Order(1000)
public class DeletionProtectionAspect {
    private final DeletionProtectionService protection;
    private final TransactionTemplate transaction;

    public DeletionProtectionAspect(DeletionProtectionService protection, PlatformTransactionManager manager) {
        this.protection = protection;
        this.transaction = new TransactionTemplate(manager);
    }

    @Around("@annotation(rule)")
    public Object protect(ProceedingJoinPoint invocation, ProtectDeletion rule) {
        return transaction.execute(status -> {
            protection.check(rule.table(), ((Number) invocation.getArgs()[rule.idArgument()]).longValue());
            try { return invocation.proceed(); }
            catch (RuntimeException | Error ex) { throw ex; }
            catch (Throwable ex) { throw new IllegalStateException(ex); }
        });
    }
}
