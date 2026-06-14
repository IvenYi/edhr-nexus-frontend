package com.zencas.edhr.common.audit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a method for automatic audit logging.
 * The AuditAspect will intercept calls to annotated methods,
 * capture execution context, and persist audit_event records.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {

    /** Business entity type (e.g., "User", "WorkflowTemplate"). */
    String entityType();

    /** Action type. Defaults to UPDATE for update operations. */
    String action() default "UPDATE";

    /** SpEL expression to extract entity ID from method parameters. */
    String entityIdExpr() default "";

    /** Function module displayed in audit logs. */
    String moduleName() default "";

    /** Menu displayed in audit logs. */
    String menuName() default "";

    /** Concrete function displayed in audit logs. */
    String functionName() default "";

    /** Business data summary displayed in audit logs. */
    String dataSummary() default "";

    /** Whether to capture content_before (requires DB read). Default true. */
    boolean captureBefore() default true;
}
